"""
qwen_vl_eval_utils.py - Chuẩn hoá định dạng đáp án và công cụ chấm điểm cho Qwen2.5-VL
Dựa trên tài liệu đề xuất tối ưu: D:\\qwen_vl_optimization_guide.pdf (Mục 1 & Mục 5)
"""
import re
from typing import Union, List, Optional

# ==============================================================================
# 1. CHUẨN HOÁ TAG VÀ SYSTEM PROMPT (Mục 1 trong Guide)
# ==============================================================================
FINAL_ANSWER_TAG = "Dap an cuoi cung:"

SYSTEM_PROMPT = (
    "You are a careful geometry tutor. Reason step by step about the shapes, "
    "coordinates, and relationships shown in the diagram, then on the LAST line "
    "write exactly:\n"
    f"{FINAL_ANSWER_TAG} <answer>\n"
    "with nothing else after it."
)

def extract_final_answer(text: str) -> str:
    """
    Trích xuất đáp án cuối từ text output của model.
    Ưu tiên tìm FINAL_ANSWER_TAG, fallback về các pattern quen thuộc hoặc 150 ký tự cuối.
    """
    if not text:
        return ""
    
    # 1. Tìm theo chuẩn mới
    if FINAL_ANSWER_TAG in text:
        ans = text.rsplit(FINAL_ANSWER_TAG, 1)[-1].strip()
        # Lấy dòng đầu tiên ngay sau tag nếu có nhiều dòng
        return ans.split("\n")[0].strip()
    
    # 2. Heuristic fallback cho output cũ / chưa theo định dạng mới
    patterns = [
        r"the (?:final )?answer is\s*[:=]?\s*([^\n\.]+)",
        r"correct (?:choice|option|answer) is\s*[:=]?\s*([^\n\.]+)",
        r"(?:đáp án|kết quả) (?:là|cuối cùng là)\s*[:=]?\s*([^\n\.]+)",
        r"\\boxed{([^}]+)}"
    ]
    for p in patterns:
        m = re.findall(p, text, re.IGNORECASE)
        if m:
            return m[-1].strip()
            
    # 3. Cùng đường: lấy 150 ký tự cuối
    return text[-150:].strip()


def format_training_answer(text: str, gold_answer: str) -> str:
    """
    Đính kèm FINAL_ANSWER_TAG vào mẫu dữ liệu huấn luyện mới.
    Lưu ý: Chỉ áp dụng cho dữ liệu MỚI hoặc dữ liệu đã có tách riêng gold_answer sạch.
    """
    text = text.rstrip()
    if FINAL_ANSWER_TAG not in text:
        text = f"{text}\n\n{FINAL_ANSWER_TAG} {gold_answer}"
    return text


# ==============================================================================
# 2. HÀM CHẤM ĐIỂM (GRADE FUNCTION) TOÁN HỌC & HÌNH HỌC
# ==============================================================================
def normalize_answer(ans: str) -> str:
    """Chuẩn hóa chuỗi đáp án (xóa LaTeX rác, khoảng trắng, chuyển chữ hoa nếu là trắc nghiệm)"""
    if ans is None:
        return ""
    ans = str(ans).strip()
    # Loại bỏ LaTeX wrapping $...$, \text{}, \mathbf{}, v.v.
    ans = re.sub(r"^\$+|\$+$", "", ans)
    ans = re.sub(r"\\(?:text|mathbf|mathrm|mathit)\{([^}]*)\}", r"\1", ans)
    ans = ans.replace("°", "").replace("^\\circ", "").strip()
    return ans


def grade(prediction: str, gold: str) -> bool:
    """
    Kiểm tra xem câu trả lời dự đoán có khớp với đáp án chuẩn hay không.
    Hỗ trợ:
    - Trắc nghiệm (A, B, C, D)
    - Số học (số thực, số nguyên, phân số làm tròn)
    - Chuỗi văn bản tương đương
    """
    if not prediction or not gold:
        return False

    pred_raw = extract_final_answer(prediction)
    pred_clean = normalize_answer(pred_raw)
    gold_clean = normalize_answer(gold)

    # 1. So khớp trực tiếp sau khi normalize (không phân biệt hoa thường)
    if pred_clean.lower() == gold_clean.lower():
        return True

    # 2. Kiểm tra dạng trắc nghiệm trắc nghiệm đơn chữ cái: A, B, C, D, E, F
    is_gold_choice = bool(re.fullmatch(r"[A-F]", gold_clean.upper()))
    if is_gold_choice:
        choice_match = re.search(r"\b([A-F])\b", pred_clean.upper())
        if choice_match and choice_match.group(1) == gold_clean.upper():
            return True

    # 3. So khớp số học (float comparison)
    try:
        def parse_num(s):
            s = s.strip()
            if "/" in s:
                num, denom = s.split("/", 1)
                return float(num) / float(denom)
            return float(s)

        p_num = parse_num(re.sub(r"[^\d\.\-\/]", "", pred_clean))
        g_num = parse_num(re.sub(r"[^\d\.\-\/]", "", gold_clean))
        
        # Cho phép sai số tương đối 1e-3 hoặc tuyệt đối 1e-4
        if abs(p_num - g_num) < 1e-4 or (abs(g_num) > 0 and abs(p_num - g_num) / abs(g_num) < 1e-3):
            return True
    except Exception:
        pass

    # 4. Kiểm tra xem gold_clean có xuất hiện độc lập trong pred_clean không
    if len(gold_clean) >= 2 and re.search(r"\b" + re.escape(gold_clean.lower()) + r"\b", pred_clean.lower()):
        return True

    return False


# ==============================================================================
# 3. REWARD FUNCTION DÙNG CHO GRPO RL (Mục 2 trong Guide)
# ==============================================================================
def accuracy_reward(completions, answer, **kwargs) -> List[float]:
    """
    Reward function tương thích hoàn toàn với TRL GRPOTrainer.
    Được dùng để thưởng 1.0 cho câu trả lời đúng và 0.0 cho câu trả lời sai.
    """
    rewards = []
    for completion, gold in zip(completions, answer):
        text = completion[0]["content"] if isinstance(completion, list) else completion
        is_correct = grade(text, str(gold))
        rewards.append(1.0 if is_correct else 0.0)
    return rewards
