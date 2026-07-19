// Layout riêng cho /aithi — không render sidebar/header của DuoMath
// để học sinh có màn hình làm bài đầy đủ, không bị phân tâm.
export const metadata = {
  title: "AI Test Studio — DuoMath",
  description: "Tải tài liệu lên, AI phân tích và tạo đề thi cá nhân hoá, chấm điểm chi tiết.",
};

export default function AiThiLayout({ children }) {
  return children;
}
