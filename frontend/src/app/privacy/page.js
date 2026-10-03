"use client";

// Phase 3: privacy policy (Nghị định 13/2023/NĐ-CP — thông báo & quyền của chủ thể dữ liệu).
// Self-service quyền truy cập / xoá nằm ở /mrm/settings (khối “🔐 Dữ liệu & quyền riêng tư”).
import Link from "next/link";

const SECTIONS = [
  {
    title: "1. Dữ liệu chúng tôi thu thập",
    items: [
      "Thông tin tài khoản: email, tên đăng nhập; họ tên, số điện thoại, trường, lớp nếu bạn tự nhập.",
      "Dữ liệu học tập: kết quả bài kiểm tra, lịch sử trò chơi, XP/coin/huy hiệu, tiến độ theo chủ đề.",
      "Nội dung bạn chủ động gửi: câu hỏi cho trợ lý BingMCB và hội thoại kèm theo.",
      "Ảnh chụp bài toán và tài liệu bạn tải lên để hệ thống nhận dạng/phân tích.",
    ],
  },
  {
    title: "2. Mục đích sử dụng",
    items: [
      "Vận hành các tính năng học tập: chấm điểm, gợi ý ôn tập, bản đồ kiến thức, xếp hạng.",
      "Cá nhân hoá lộ trình học dựa trên lịch sử làm bài của chính bạn.",
      "Bảo vệ hệ thống: phát hiện gian lận, lạm dụng API và tấn công.",
      "Chúng tôi KHÔNG bán dữ liệu cá nhân của bạn cho bên thứ ba.",
    ],
  },
  {
    title: "3. Chia sẻ với bên thứ ba",
    items: [
      "Nhà cung cấp AI (Google Gemini, OpenRouter, Groq, Hugging Face): nhận nội dung câu hỏi/ảnh bạn gửi để sinh lời giải — chỉ trong phạm vi cần thiết để trả lời.",
      "Lưu ý riêng cho model MIỄN PHÍ trên OpenRouter (NVIDIA, Poolside, Cohere, Google AI Studio…): nhà cung cấp có thể ghi log phiên và/hoặc dùng dữ liệu đầu vào để cải thiện model của họ. Vì vậy đừng đưa dữ liệu cá nhân (số điện thoại, địa chỉ, ảnh chụp có mặt người) vào câu hỏi/ảnh — hệ thống chỉ cần đúng đề bài.",
      "Firebase (Google): xác thực tài khoản.",
      "Render và Vercel: hạ tầng máy chủ và lưu trữ cho website.",
      "Cơ quan có thẩm quyền: chỉ khi có yêu cầu hợp pháp bằng văn bản.",
    ],
  },
  {
    title: "4. Thời gian lưu trữ",
    items: [
      "Hội thoại ẩn danh và tài liệu tải lên không gắn tài khoản: tự động xoá sau 30 ngày.",
      "Dữ liệu tài khoản và kết quả học tập: lưu đến khi bạn yêu cầu xoá.",
      "Khi bạn xoá tài khoản, toàn bộ hàng dữ liệu liên quan (kết quả, trò chơi, hội thoại, tài liệu) bị xoá khỏi máy chủ.",
    ],
  },
  {
    title: "5. Quyền của bạn",
    items: [
      "Tải bản sao dữ liệu (JSON): /mrm/settings → “⬇️ Tải dữ liệu của tôi”.",
      "Xoá vĩnh viễn tài khoản: /mrm/settings → “🗑️ Xoá tài khoản vĩnh viễn”.",
      "Yêu cầu chỉnh sửa hoặc khiếu nại: gửi email tới địa chỉ liên hệ bên dưới.",
      "Phụ huynh/người giám hộ của học sinh dưới 16 tuổi có thể yêu cầu xoá dữ liệu của con em mình.",
    ],
  },
  {
    title: "6. Bảo mật",
    items: [
      "Mật khẩu được băm một chiều, không lưu dạng văn bản thuần.",
      "Toàn bộ kết nối sử dụng HTTPS; máy chủ áp dụng hạn mức truy cập và giới hạn domain.",
      "Dữ liệu được rà soát định kỳ; mã nguồn được quét secret tự động trước khi phát hành.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", padding: "48px 20px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(34,211,238,0.25)",
          borderRadius: 18,
          padding: "32px 30px",
          backdropFilter: "blur(12px)",
        }}>
          <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: "#22d3ee", fontWeight: 800 }}>
            BingMath
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 900, margin: "8px 0 6px" }}>Chính sách quyền riêng tư</h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 13, margin: 0 }}>
            Áp dụng cho website và ứng dụng BingMath. Cập nhật: 26/09/2026.
          </p>

          {SECTIONS.map((section) => (
            <section key={section.title} style={{ marginTop: 26 }}>
              <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginBottom: 10 }}>{section.title}</h2>
              <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13.5, lineHeight: 2, color: "rgba(255,255,255,0.78)" }}>
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ))}

          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginBottom: 10 }}>7. Liên hệ</h2>
            <p style={{ fontSize: 13.5, lineHeight: 2, color: "rgba(255,255,255,0.78)", margin: 0 }}>
              Mọi yêu cầu liên quan đến dữ liệu cá nhân, vui lòng gửi tới{" "}
              <a href="mailto:will050710@gmail.com" style={{ color: "#22d3ee" }}>will050710@gmail.com</a>.
              Chúng tôi phản hồi trong vòng 72 giờ làm việc.
            </p>
          </section>

          <div style={{ marginTop: 30, display: "flex", gap: 12, flexWrap: "wrap" }}>
            <Link href="/mrm/settings" style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "rgba(34,211,238,0.12)", border: "1px solid rgba(34,211,238,0.35)", color: "#67e8f9",
              textDecoration: "none",
            }}>
              🔐 Quản lý dữ liệu của tôi
            </Link>
            <Link href="/" style={{
              padding: "10px 18px", borderRadius: 10, fontSize: 13, fontWeight: 700,
              background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.75)",
              textDecoration: "none",
            }}>
              ← Về trang chủ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
