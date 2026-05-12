import { NextResponse } from "next/server";

// Using Groq's OpenAI-compatible Chat Completions endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

// POST /api/learning-feedback
// Body shape: { result: { correct, total, accuracy, skills, weakSkills, questions, ... } }
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

    // If no Groq API key is configured, fall back to a simple, rule-based
    // summary instead of calling the external LLM.
    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
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

      return NextResponse.json({ feedback: lines.join("\n") });
    }

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
      console.error("OpenAI API error:", text);
      return NextResponse.json(
        { error: "Failed to generate feedback" },
        { status: 502 }
      );
    }

    const completionJson = await completionRes.json();
    const message =
      completionJson.choices?.[0]?.message?.content ??
      "Không tạo được phản hồi từ mô hình.";

    return NextResponse.json({ feedback: message });
  } catch (err) {
    console.error("Error in /api/learning-feedback:", err);
    return NextResponse.json(
      { error: "Failed to generate learning feedback" },
      { status: 500 }
    );
  }
}

