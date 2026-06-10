// Topic-specific question banks for MRM card-pick multiplayer rounds

export const TOPIC_QUESTIONS = {
  fc1: {
    title: "Phương trình bậc hai nâng cao",
    questions: [
      { text: "Tìm nghiệm thực của phương trình: x² - 5x + 6 = 0", options: ["x = 2 và x = 3", "x = 1 và x = 6", "x = -2 và x = -3", "x = 2 và x = -3"], correct: 0, explain: "x² - 5x + 6 = (x-2)(x-3) = 0" },
      { text: "Phương trình x² + 2x + 5 = 0 có bao nhiêu nghiệm thực?", options: ["0 nghiệm", "1 nghiệm kép", "2 nghiệm phân biệt", "Vô số nghiệm"], correct: 0, explain: "Δ = 4 - 20 = -16 < 0 nên vô nghiệm thực." },
      { text: "Tổng nghiệm của x² - 7x + 10 = 0 là:", options: ["7", "10", "-7", "5"], correct: 0, explain: "Theo Vi-ét: x₁ + x₂ = -b/a = 7" },
      { text: "Tích nghiệm của x² - 9x + 20 = 0 là:", options: ["20", "9", "-20", "4"], correct: 0, explain: "Theo Vi-ét: x₁ · x₂ = c/a = 20" },
      { text: "Phương trình x² - 4x + 4 = 0 có nghiệm:", options: ["x = 2 (nghiệm kép)", "x = 4", "x = -2", "Vô nghiệm"], correct: 0, explain: "Δ = 0 nên có nghiệm kép x = 2" },
      { text: "Giá trị m để x² - 2mx + m + 3 = 0 có 2 nghiệm phân biệt là:", options: ["m > 3 hoặc m < -1", "m = 3", "m < 3", "m > -1"], correct: 0, explain: "Δ' = m² - m - 3 > 0" },
      { text: "Phương trình 2x² - 3x - 2 = 0 có nghiệm:", options: ["x = 2 hoặc x = -1/2", "x = 1 hoặc x = -2", "x = -2 hoặc x = 1/2", "Vô nghiệm"], correct: 0, explain: "2x² - 3x - 2 = (2x+1)(x-2) = 0" },
      { text: "Hệ thức Vi-ét áp dụng cho phương trình ax² + bx + c = 0 khi:", options: ["Δ ≥ 0", "Δ < 0", "a = 0", "c = 0"], correct: 0, explain: "Vi-ét chỉ dùng khi phương trình có nghiệm thực (Δ ≥ 0)" },
      { text: "Phương trình x² + x - 6 = 0 có nghiệm:", options: ["x = 2 hoặc x = -3", "x = -2 hoặc x = 3", "x = 1 hoặc x = -6", "x = 3 hoặc x = 2"], correct: 0, explain: "x² + x - 6 = (x+3)(x-2) = 0" },
      { text: "Biểu thức Δ của x² - 6x + 9 = 0 bằng:", options: ["0", "36", "-36", "9"], correct: 0, explain: "Δ = b² - 4ac = 36 - 36 = 0" },
    ],
  },
  fc2: {
    title: "Đạo hàm & Cực trị hàm số",
    questions: [
      { text: "Đạo hàm của hàm số y = x³ là:", options: ["3x²", "x²", "3x", "2x²"], correct: 0, explain: "(x³)' = 3x²" },
      { text: "Đạo hàm của hàm số y = sin(x) là:", options: ["cos(x)", "-cos(x)", "sin(x)", "-sin(x)"], correct: 0, explain: "(sin x)' = cos x" },
      { text: "Đạo hàm của y = 5x² - 3x + 1 tại x = 1 là:", options: ["7", "5", "3", "10"], correct: 0, explain: "y' = 10x - 3, y'(1) = 7" },
      { text: "Hàm số y = x³ - 3x có cực đại tại x =:", options: ["-1", "1", "0", "3"], correct: 0, explain: "y' = 3x² - 3 = 0 → x = ±1; y''(-1) < 0 nên cực đại tại x = -1" },
      { text: "Đạo hàm của y = eˣ là:", options: ["eˣ", "xeˣ", "ln(x)", "1/x"], correct: 0, explain: "(eˣ)' = eˣ" },
      { text: "Đạo hàm của y = ln(x) (x > 0) là:", options: ["1/x", "x", "ln(x)", "eˣ"], correct: 0, explain: "(ln x)' = 1/x" },
      { text: "Tiếp tuyến của y = x² tại x = 2 có hệ số góc:", options: ["4", "2", "8", "1"], correct: 0, explain: "y' = 2x, y'(2) = 4" },
      { text: "Hàm số y = x⁴ - 4x² có cực tiểu tại:", options: ["x = ±√2", "x = 0", "x = ±2", "x = 1"], correct: 0, explain: "y' = 4x³ - 8x = 0 → x = 0, ±√2; cực tiểu tại x = ±√2" },
      { text: "Đạo hàm của y = cos(2x) là:", options: ["-2sin(2x)", "2sin(2x)", "-sin(2x)", "2cos(2x)"], correct: 0, explain: "(cos 2x)' = -2sin(2x)" },
      { text: "Hàm số y = x³ - 6x + 5 đồng biến trên khoảng:", options: ["(-∞, -√2) và (√2, +∞)", "(-√2, √2)", "(0, +∞)", "(-∞, 0)"], correct: 0, explain: "y' = 3x² - 6 > 0 khi |x| > √2" },
    ],
  },
  fc3: {
    title: "Hình học phẳng Oxyz",
    questions: [
      { text: "Khoảng cách từ M(1, 2) đến gốc tọa độ O(0, 0) là:", options: ["√5", "3", "√3", "5"], correct: 0, explain: "OM = √(1² + 2²) = √5" },
      { text: "Vector AB với A(1, 2), B(4, 6) có tọa độ:", options: ["(3, 4)", "(5, 8)", "(4, 3)", "(-3, -4)"], correct: 0, explain: "AB = (4-1, 6-2) = (3, 4)" },
      { text: "Độ dài vector a = (3, 4) là:", options: ["5", "7", "25", "√7"], correct: 0, explain: "|a| = √(9+16) = 5" },
      { text: "Phương trình đường thẳng qua A(0, 1) có hệ số góc k = 2 là:", options: ["y = 2x + 1", "y = 2x - 1", "y = x + 2", "y = -2x + 1"], correct: 0, explain: "y - 1 = 2(x - 0) → y = 2x + 1" },
      { text: "Tọa độ trung điểm I của AB với A(2, 4), B(6, 8) là:", options: ["(4, 6)", "(3, 5)", "(8, 12)", "(2, 2)"], correct: 0, explain: "I = ((2+6)/2, (4+8)/2) = (4, 6)" },
      { text: "Hai vector a = (1, 2) và b = (2, 4) có quan hệ:", options: ["Cùng phương", "Vuông góc", "Bằng nhau", "Không xác định"], correct: 0, explain: "b = 2a nên cùng phương" },
      { text: "Tích vô hướng a·b với a = (1, 0), b = (0, 1) bằng:", options: ["0", "1", "-1", "2"], correct: 0, explain: "a·b = 1·0 + 0·1 = 0 (vuông góc)" },
      { text: "Phương trình đường tròn tâm O(0,0) bán kính R = 3 là:", options: ["x² + y² = 9", "x² + y² = 3", "x + y = 3", "x² - y² = 9"], correct: 0, explain: "x² + y² = R² = 9" },
      { text: "Góc giữa hai vector a = (1, 0) và b = (1, 1) bằng:", options: ["45°", "90°", "60°", "30°"], correct: 0, explain: "cos θ = (a·b)/(|a||b|) = 1/√2 → θ = 45°" },
      { text: "Điểm M(3, 4) nằm trên đường thẳng y = x + 1 vì:", options: ["4 = 3 + 1", "3 = 4 + 1", "4 = 3 - 1", "Không thuộc đường thẳng"], correct: 0, explain: "Thay x = 3: y = 4, thỏa mãn y = x + 1" },
    ],
  },
  fc4: {
    title: "Dãy số & Cấp số cộng",
    questions: [
      { text: "Cho cấp số cộng có u₁ = 2 và công sai d = 3. Tìm u₅:", options: ["14", "17", "11", "15"], correct: 0, explain: "u₅ = u₁ + 4d = 2 + 12 = 14" },
      { text: "Cho cấp số nhân có u₁ = 3, công bội q = 2. Tìm u₄:", options: ["24", "18", "12", "48"], correct: 0, explain: "u₄ = u₁ · q³ = 3 · 8 = 24" },
      { text: "Số hạng tổng quát của cấp số cộng uₙ = 2n + 1. Công sai d bằng:", options: ["2", "1", "3", "4"], correct: 0, explain: "uₙ₊₁ - uₙ = 2(n+1)+1 - (2n+1) = 2" },
      { text: "Tổng 10 số hạng đầu của cấp số cộng u₁ = 1, d = 2 là:", options: ["100", "55", "110", "90"], correct: 0, explain: "S₁₀ = (10/2)(2·1 + 9·2) = 5·20 = 100" },
      { text: "Dãy số 1, 4, 9, 16, ... là dãy số:", options: ["Bình phương các số tự nhiên", "Cấp số cộng", "Cấp số nhân", "Fibonacci"], correct: 0, explain: "uₙ = n²" },
      { text: "Công bội q của cấp số nhân 2, 6, 18, 54 là:", options: ["3", "2", "6", "4"], correct: 0, explain: "q = 6/2 = 3" },
      { text: "u₇ của cấp số cộng u₁ = 5, d = -2 là:", options: ["-7", "-5", "7", "-9"], correct: 0, explain: "u₇ = 5 + 6(-2) = -7" },
      { text: "Tổng Sₙ = n(n+1)/2 là công thức tổng:", options: ["n số tự nhiên đầu tiên", "Cấp số nhân", "Dãy lũy thừa", "Dãy Fibonacci"], correct: 0, explain: "1 + 2 + ... + n = n(n+1)/2" },
      { text: "Cho cấp số nhân u₁ = 1, q = 3. S₄ bằng:", options: ["40", "30", "81", "27"], correct: 0, explain: "S₄ = 1·(3⁴-1)/(3-1) = 40" },
      { text: "Số hạng thứ 100 của dãy uₙ = 3n - 1 là:", options: ["299", "300", "297", "301"], correct: 0, explain: "u₁₀₀ = 3·100 - 1 = 299" },
    ],
  },
};

export const DEFAULT_QUESTIONS = TOPIC_QUESTIONS.fc1.questions;

export function getQuestionsForCard(card) {
  if (!card?.id) return DEFAULT_QUESTIONS;
  return TOPIC_QUESTIONS[card.id]?.questions ?? DEFAULT_QUESTIONS;
}
