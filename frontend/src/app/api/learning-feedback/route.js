import { NextResponse } from "next/server";

// Using Groq's OpenAI-compatible Chat Completions endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// POST /api/learning-feedback
// Body shape: { result: { correct, total, accuracy, skills, weakSkills, questions, ... } }

// Rule-based summary — used when no Groq key is configured AND when the Groq
// call fails (the key can be revoked/rate-limited; a 502 is worse than a
// slightly simpler summary).
function buildRuleBasedFeedback({ skills = [], weakSkills = [] }) {
  const strongSkills = skills.filter((s) => s.level === "strong");
  const mediumSkills = skills.filter((s) => s.level === "medium");

  const lines = [];
  lines.push("**Ưu điểm (Pros)**");
  if (strongSkills.length === 0) {
    lines.push("- Bạn đã hoàn thành bài test, đây là bước khởi đầu rất tốt.");
  } else {
    strongSkills.slice(0, 3).forEach((s) => {
      lines.push(`- Kỹ năng **${s.name}** khá tốt (${s.accuracy}%).`);
    });
  }

  lines.push("\n**Hạn chế (Cons)**");
  if (weakSkills.length === 0) {
    lines.push("- Không có kỹ năng nào bị đánh giá là yếu rõ rệt.");
  } else {
    weakSkills.slice(0, 3).forEach((s) => {
      lines.push(`- Cần cải thiện kỹ năng **${s.name}** (đúng ${s.correct}/${s.total}).`);
    });
  }

  lines.push("\n**Gợi ý ôn tập (Relearn recommendations)**");
  if (weakSkills.length === 0 && mediumSkills.length === 0) {
    lines.push("- Tiếp tục luyện thêm các dạng bài tương tự để duy trì phong độ.");
  } else {
    [...weakSkills.slice(0, 2), ...mediumSkills.slice(0, 2)].forEach((s) => {
      lines.push(
        `- Luyện thêm bài đọc về **${s.topic || "reading"}**, tập trung vào kỹ năng **${s.name}**.`
      );
    });
  }

  return lines.join("\n");
}

// Strip anything key-shaped out of upstream error text before logging it.
function scrubSecrets(message) {
  return String(message)
    .replace(/(key=)[A-Za-z0-9_\-.]{8,}/g, "$1***")
    .replace(/(Bearer\s+)[A-Za-z0-9_\-.]{8,}/g, "$1***")
    .replace(/(AIza|gsk_|hf_|sk-or-v1-)[A-Za-z0-9_\-]{8,}/g, "$1***");
}

// ── OpenRouter free-tier fallback (Phase 4, Đợt 3) ───────────────────────────
// Ranked by the Artificial Analysis indices OpenRouter publishes per model
// (verified live 2026-09-26): Qwen3.8 27B = Intelligence 33.7 / Coding 68.1 /
// Agentic 45.8; Nemotron 3 Ultra 550B = 22.9 / 49.3 / 20.1 (1M ctx);
// `openrouter/free` is the router of last resort. One request with the whole
// `models` array lets OpenRouter fail over server-side (free tiers rate-limit
// constantly), and the response tells us which model actually answered.
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_DEFAULT_MODELS = (
  process.env.OPENROUTER_FEEDBACK_MODELS ||
  "qwen/qwen3.8-27b:free,nvidia/nemotron-3-ultra-550b-a55b:free,openrouter/free"
)
  .split(",")
  .map((m) => m.trim())
  .filter(Boolean);

// Strip anything key-shaped out of upstream error text before logging it.
// (NOTE: this helper is defined ONCE, near the top of the file. An earlier
// duplicate in this block made the Vercel build fail with
// "the name `scrubSecrets` is defined multiple times" — `node --check` accepts
// duplicate function declarations, so only a real bundler/type-check catches it.)

async function generateWithOpenRouter(systemPrompt, userContent, signal) {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) return { ok: false, reason: "openrouter_no_key" };

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60000);
  try {
    const res = await fetch(OPENROUTER_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": process.env.SELF_URL || "https://duomath.vercel.app",
        "X-Title": "DuoMath AI",
      },
      body: JSON.stringify({
        models: OPENROUTER_DEFAULT_MODELS,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        temperature: 0.4,
      }),
      signal: controller.signal,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenRouter API error:", res.status, scrubSecrets(text).slice(0, 300));
      return { ok: false, reason: `openrouter_${res.status}` };
    }

    const json = await res.json();
    const message = json.choices?.[0]?.message?.content;
    if (!message || !String(message).trim()) {
      return { ok: false, reason: "openrouter_empty" };
    }
    return { ok: true, feedback: message, model: json.model, provider: "openrouter" };
  } catch (err) {
    console.error("OpenRouter call failed:", scrubSecrets(err?.message || err));
    return { ok: false, reason: "openrouter_error" };
  } finally {
    clearTimeout(timeout);
  }
}

// Groq is revoked/out of quota? Try the free OpenRouter ladder before falling
// back to the local rule-based summary — and report which provider answered so
// /ketqua can drop its "simplified mode" banner.
async function fallbackAfterProviderFailure(systemPrompt, userContent, skills, weakSkills, groqReason, request) {
  const viaOpenRouter = await generateWithOpenRouter(systemPrompt, userContent);
  if (viaOpenRouter.ok) {
    return NextResponse.json({
      feedback: viaOpenRouter.feedback,
      provider: viaOpenRouter.provider,
      model: viaOpenRouter.model,
      relearn: await seedRelearnCards(weakSkills, request),
    });
  }
  return NextResponse.json({
    feedback: buildRuleBasedFeedback({ skills, weakSkills }),
    degraded: true,
    reason: `${groqReason}|${viaOpenRouter.reason}`,
    // Kể cả khi AI hỏng, danh sách kỹ năng yếu vẫn có ích: vẫn gieo thẻ ôn tập.
    relearn: await seedRelearnCards(weakSkills, request),
  });
}

// Đợt 4E — gieo thẻ ôn tập (FSRS) sang backend sau khi có nhận xét.
// Chạy ở server route nên không vướng CORS; chuyển tiếp Authorization của
// người dùng để backend biết thẻ thuộc về ai. Cố ý "fire-and-forget": lỗi ở
// bước này không được làm hỏng phản hồi nhận xét mà học sinh đang chờ.
async function seedRelearnCards(weakSkills, request) {
  if (!Array.isArray(weakSkills) || weakSkills.length === 0) return { seeded: false, reason: "no_weak_skills" };
  const backend = (
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "https://duomath.onrender.com"
  ).replace(/\/$/, "");
  const auth = request?.headers?.get?.("authorization");
  try {
    const res = await fetch(`${backend}/api/relearn/seed`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(auth ? { Authorization: auth } : {}),
      },
      body: JSON.stringify({ weakSkills }),
      signal: AbortSignal.timeout(15000),
    });
    if (!res.ok) {
      console.warn("relearn seed skipped:", res.status);
      return { seeded: false, reason: `http_${res.status}` };
    }
    return { seeded: true, ...(await res.json()) };
  } catch (err) {
    console.warn("relearn seed failed:", scrubSecrets(err?.message || err));
    return { seeded: false, reason: "network" };
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = body?.result;

    if (!result) {
      return NextResponse.json(
        { error: "Missing 'result' in request body" },
        { status: 400 }
      );
    }

    const { correct, total, accuracy, skills = [], weakSkills = [] } = result;

    const systemPrompt =
      "You are an expert bilingual (Vietnamese-English) tutor for high-school students. " +
      "Given detailed test mastery data, you will summarise strengths, weaknesses, and give concise, practical relearning recommendations. " +
      "Use clear bullet points, mostly in Vietnamese but you can keep technical skill names in English where helpful. " +
      "Be encouraging and concrete, and keep the total response under 250 words.";

    const userContent = JSON.stringify(
      {
        overall: { correct, total, accuracy },
        skills,
        weakSkills,
      },
      null,
      2
    );

    // No Groq key configured? The free OpenRouter ladder does the same job at $0.
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      return await fallbackAfterProviderFailure(systemPrompt, userContent, skills, weakSkills, "groq_no_key", request);
    }

    const completionRes = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content:
              "Dưới đây là dữ liệu kết quả bài test (JSON). " +
              "Hãy trả lời ngắn gọn với 3 phần: \n" +
              "1) Ưu điểm (Pros) – 3–5 bullet.\n" +
              "2) Hạn chế/Điểm yếu (Cons) – 3–5 bullet, tập trung vào weakSkills.\n" +
              "3) Gợi ý ôn tập / Relearn recommendations – 3–5 bullet, ghi rõ kỹ năng và chủ đề nên luyện thêm.\n\n" +
              userContent,
          },
        ],
        temperature: 0.4,
      }),
    });

    if (!completionRes.ok) {
      const text = await completionRes.text();
      console.error(
        "Groq API error:",
        completionRes.status,
        scrubSecrets(text).slice(0, 300)
      );
      // Degrade in two steps instead of returning 502: first the free OpenRouter
      // ladder, then the rule-based summary (the client shows a "simplified" hint
      // only in the last case).
      return await fallbackAfterProviderFailure(
        systemPrompt,
        userContent,
        skills,
        weakSkills,
        `groq_${completionRes.status}`,
        request
      );
    }

    const completionJson = await completionRes.json();
    const message =
      completionJson.choices?.[0]?.message?.content ??
      "Không tạo được phản hồi từ mô hình.";

    return NextResponse.json({ feedback: message, provider: "groq", relearn: await seedRelearnCards(weakSkills, request) });
  } catch (err) {
    console.error("Error in /api/learning-feedback:", err);
    return NextResponse.json(
      { error: "Failed to generate learning feedback" },
      { status: 500 }
    );
  }
}

