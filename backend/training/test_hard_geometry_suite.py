"""
test_hard_geometry_suite.py
Tạo các bài toán hình học khó (vẽ ảnh thực tế bằng Pillow),
gửi đến model Qwen2.5-VL Fine-Tuned trên Hugging Face Space và đánh giá năng lực suy luận.
"""
import os
import sys
import math
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    sys.stdout.reconfigure(encoding="utf-8")
if hasattr(sys.stderr, "reconfigure"):
    sys.stderr.reconfigure(encoding="utf-8")

from PIL import Image, ImageDraw, ImageFont
from gradio_client import Client, handle_file

HF_SPACE_ID = "WilliamShakespear/duomath-qwen-vl-demo"
# Phase 3: never hard-code a token — export HF_TOKEN (or HF_API_KEY) in the
# environment before running this suite.
HF_TOKEN = os.environ.get("HF_TOKEN", "") or os.environ.get("HF_API_KEY", "")
if not HF_TOKEN:
    print("[warn] HF_TOKEN is not set; the Space calls will run unauthenticated.")

TEST_DIR = Path("duosteam/backend/training/hard_geometry_tests")
TEST_DIR.mkdir(parents=True, exist_ok=True)


def get_font(size=20):
    try:
        return ImageFont.truetype("arial.ttf", size)
    except Exception:
        return ImageFont.load_default()


def create_problem_1_image():
    """
    Bài toán 1: Tiếp tuyến & Cát tuyến qua tâm (Phương tích đường tròn)
    PT = 12 là tiếp tuyến tại T. Cát tuyến PAB đi qua tâm O. PA = 8.
    Hỏi: Tính bán kính R. (Đáp án đúng: R = 5)
    """
    img = Image.new("RGB", (800, 500), "white")
    draw = ImageDraw.Draw(img)
    font = get_font(22)
    font_bold = get_font(26)

    # Tâm O tại (520, 250), bán kính r = 120
    ox, oy, r = 520, 250, 120
    draw.ellipse([ox - r, oy - r, ox + r, oy + r], outline="black", width=3)
    draw.ellipse([ox - 4, oy - 4, ox + 4, oy + 4], fill="black") # điểm O
    draw.text((ox + 8, oy + 8), "O", fill="black", font=font_bold)

    # Điểm P nằm bên trái trên trục hoành y = 250
    # Khoảng cách PO: nếu R=5, PA=8 -> PO = 8 + 5 = 13. Tỷ lệ 13 / 5 * 120 = 312 px.
    px, py = ox - 312, 250
    draw.ellipse([px - 4, py - 4, px + 4, py + 4], fill="black")
    draw.text((px - 25, py - 15), "P", fill="black", font=font_bold)

    # Điểm A (giao gần của PO với (O)): (ox - r, 250)
    ax, ay = ox - r, 250
    draw.ellipse([ax - 4, ay - 4, ax + 4, ay + 4], fill="black")
    draw.text((ax - 5, ay + 10), "A", fill="black", font=font_bold)

    # Điểm B (giao xa của PO với (O)): (ox + r, 250)
    bx, by = ox + r, 250
    draw.ellipse([bx - 4, by - 4, bx + 4, by + 4], fill="black")
    draw.text((bx + 10, by - 15), "B", fill="black", font=font_bold)

    # Đoạn thẳng P-A-O-B
    draw.line([(px, py), (bx, by)], fill="black", width=3)

    # Tiếp điểm T: góc alpha = arccos(r / d) = arccos(5 / 13) approx 67.38 độ
    alpha = math.acos(r / 312)
    # T ở nửa trên:
    tx = int(ox - r * math.cos(math.pi - alpha))
    ty = int(oy - r * math.sin(math.pi - alpha))
    draw.ellipse([tx - 4, ty - 4, tx + 4, ty + 4], fill="black")
    draw.text((tx - 10, ty - 35), "T", fill="black", font=font_bold)

    # Tiếp tuyến PT
    draw.line([(px, py), (tx, ty)], fill="blue", width=3)
    # Bán kính OT
    draw.line([(ox, oy), (tx, ty)], fill="red", width=2)

    # Ký hiệu vuông góc tại T
    draw.text((px + 100, (py + ty) // 2 - 25), "PT = 12", fill="blue", font=font)
    draw.text(((px + ax) // 2 - 20, py + 15), "PA = 8", fill="black", font=font)
    draw.text(((ox + tx) // 2 + 10, (oy + ty) // 2), "R", fill="red", font=font)

    path = TEST_DIR / "problem_1_power_of_point.png"
    img.save(path)
    return path


def create_problem_2_image():
    """
    Bài toán 2: Tam giác nhọn ABC, trực tâm H, BAC = 50 độ.
    Tính góc BHC và chứng minh DHEC nội tiếp. (Đáp án: BHC = 130 độ)
    """
    img = Image.new("RGB", (800, 550), "white")
    draw = ImageDraw.Draw(img)
    font = get_font(22)
    font_bold = get_font(26)

    # Tọa độ A, B, C
    ax, ay = 400, 80
    bx, by = 150, 450
    cx, cy = 650, 450

    # Vẽ tam giác ABC
    draw.polygon([(ax, ay), (bx, by), (cx, cy)], outline="black", width=3)
    draw.text((ax - 10, ay - 35), "A (50°)", fill="black", font=font_bold)
    draw.text((bx - 30, by + 5), "B", fill="black", font=font_bold)
    draw.text((cx + 10, cy + 5), "C", fill="black", font=font_bold)

    # Chân đường cao AD: D vuông góc BC
    dx, dy = ax, by
    draw.line([(ax, ay), (dx, dy)], fill="blue", width=2)
    draw.ellipse([dx - 4, dy - 4, dx + 4, dy + 4], fill="blue")
    draw.text((dx - 10, dy + 10), "D", fill="blue", font=font_bold)

    # Chân đường cao BE vuông góc AC
    # Vector AC: (cx - ax, cy - ay) = (250, 370)
    # Chiếu B lên AC:
    u = ((bx - ax) * 250 + (by - ay) * 370) / (250**2 + 370**2)
    ex = int(ax + u * 250)
    ey = int(ay + u * 370)
    draw.line([(bx, by), (ex, ey)], fill="blue", width=2)
    draw.ellipse([ex - 4, ey - 4, ex + 4, ey + 4], fill="blue")
    draw.text((ex + 15, ey - 10), "E", fill="blue", font=font_bold)

    # Trực tâm H: giao điểm của AD và BE
    # AD là x = 400. Đường BE qua (bx, by) và (ex, ey).
    t = (400 - bx) / (ex - bx)
    hx, hy = 400, int(by + t * (ey - by))
    draw.ellipse([hx - 5, hy - 5, hx + 5, hy + 5], fill="red")
    draw.text((hx + 10, hy - 25), "H", fill="red", font=font_bold)

    # Nối CH cắt AB tại F (vẽ đoạn CH)
    draw.line([(cx, cy), (hx, hy)], fill="blue", width=2)

    path = TEST_DIR / "problem_2_orthocenter.png"
    img.save(path)
    return path


def create_problem_3_image():
    """
    Bài toán 3: Phân giác trong & phân giác ngoài (Chùm điều hòa)
    Tam giác ABC: AB = 6, AC = 4, BC = 5.
    Phân giác trong AD, phân giác ngoài AE (D, E thuộc BC).
    Tính CD và CE. (Đáp án: CD = 2, CE = 10)
    """
    img = Image.new("RGB", (900, 500), "white")
    draw = ImageDraw.Draw(img)
    font = get_font(20)
    font_bold = get_font(24)

    # Tọa độ: Cho B=(150, 380), C=(450, 380) (BC = 300px tương ứng 5 đơn vị -> 60px/đơn vị)
    # CD = 2 đơn vị = 120px -> D = (450 - 120, 380) = (330, 380)
    # CE = 10 đơn vị = 600px -> E = (450 + 600, 380) = (1050) -> chỉnh tỷ lệ cho vừa 900px
    # Đặt BC = 150px (30px / đơn vị).
    # B = (200, 350), C = (350, 350)
    bx, by = 200, 350
    cx, cy = 350, 350
    # CD = 2 đơn vị = 60px -> D = (350 - 60, 350) = (290, 350)
    dx, dy = 290, 350
    # CE = 10 đơn vị = 300px -> E = (350 + 300, 350) = (650, 350)
    ex, ey = 650, 350

    # Tọa độ A: AB = 6 đơn vị (180px), AC = 4 đơn vị (120px), BC = 5 đơn vị (150px)
    # cos(B) = (6^2 + 5^2 - 4^2)/(2*6*5) = 45/60 = 0.75
    cos_B = 0.75
    sin_B = math.sqrt(1 - cos_B**2)
    ax = int(bx + 180 * cos_B)
    ay = int(by - 180 * sin_B)

    # Vẽ đường thẳng kéo dài BC qua E
    draw.line([(bx - 50, by), (ex + 50, ey)], fill="black", width=2)

    # Tam giác ABC
    draw.polygon([(ax, ay), (bx, by), (cx, cy)], outline="black", width=3)
    draw.text((ax - 10, ay - 35), "A", fill="black", font=font_bold)
    draw.text((bx - 25, by + 10), "B", fill="black", font=font_bold)
    draw.text((cx - 5, cy + 10), "C", fill="black", font=font_bold)

    # Điểm D và phân giác AD
    draw.ellipse([dx - 4, dy - 4, dx + 4, dy + 4], fill="blue")
    draw.line([(ax, ay), (dx, dy)], fill="blue", width=2)
    draw.text((dx - 5, dy + 10), "D", fill="blue", font=font_bold)

    # Điểm E và phân giác ngoài AE
    draw.ellipse([ex - 4, ey - 4, ex + 4, ey + 4], fill="red")
    draw.line([(ax, ay), (ex, ey)], fill="red", width=2)
    draw.text((ex - 5, ey + 10), "E", fill="red", font=font_bold)

    # Ghi chú độ dài
    draw.text(((bx + ax)//2 - 40, (by + ay)//2 - 20), "AB = 6", fill="black", font=font)
    draw.text(((cx + ax)//2 + 10, (cy + ay)//2 - 20), "AC = 4", fill="black", font=font)
    draw.text(((bx + cx)//2 - 20, by + 25), "BC = 5", fill="black", font=font)

    path = TEST_DIR / "problem_3_harmonic_bisector.png"
    img.save(path)
    return path


def run_benchmark():
    print("=" * 70)
    print("  🚀 TỰ ĐỘNG SINH CÁC BÀI TOÁN HÌNH HỌC KHÓ & KIỂM TRA MODEL QWEN2.5-VL")
    print(f"  Target Space: {HF_SPACE_ID}")
    print("=" * 70)

    print("\n[1/4] Khởi tạo các bài toán hình học và vẽ hình học độ phân giải cao...")
    p1_img = create_problem_1_image()
    p2_img = create_problem_2_image()
    p3_img = create_problem_3_image()
    print("  ✅ Đã tạo xong 3 hình vẽ hình học chi tiết tại:", TEST_DIR)

    test_cases = [
        {
            "id": "Test 1: Phương tích tiếp tuyến & cát tuyến",
            "img": p1_img,
            "question": (
                "In the figure, PT is tangent to circle O at point T, and line P-A-O-B passes through center O. "
                "Given PT = 12 and PA = 8. Find the radius R of circle O."
            ),
            "expected": "R = 5 (using PT^2 = PA * PB = PA * (PA + 2R) => 144 = 8(8 + 2R) => R = 5)"
        },
        {
            "id": "Test 2: Trực tâm & Tứ giác nội tiếp",
            "img": p2_img,
            "question": (
                "In acute triangle ABC, altitudes AD, BE, CF concur at orthocenter H. "
                "Given angle BAC = 50 degrees. "
                "1) Find the measure of angle BHC. "
                "2) State whether quadrilateral DHEC is cyclic and explain why."
            ),
            "expected": "angle BHC = 130 degrees (180 - 50 = 130), DHEC is cyclic because angle HDC + angle HEC = 90 + 90 = 180 degrees."
        },
        {
            "id": "Test 3: Phân giác trong & phân giác ngoài (Chùm điều hòa)",
            "img": p3_img,
            "question": (
                "In triangle ABC, AB = 6, AC = 4, and BC = 5. "
                "The internal angle bisector of angle A meets BC at point D. "
                "The external angle bisector of angle A meets line BC at point E. "
                "Calculate the exact lengths of segment CD and segment CE."
            ),
            "expected": "CD = 2 (using DB/DC = 6/4 => DC = 2/5 * 5 = 2) and CE = 10 (using EB/EC = 6/4 => (EC+5)/EC = 1.5 => CE = 10)."
        }
    ]

    print("\n[2/4] Kết nối trực tiếp tới Hugging Face ZeroGPU Space...")
    client = Client(HF_SPACE_ID, token=HF_TOKEN)
    print("  ✅ Kết nối thành công!")

    results = []
    for tc in test_cases:
        print("\n" + "-" * 70)
        print(f"👉 ĐANG ĐÁNH GIÁ: {tc['id']}")
        print(f"   Câu hỏi: {tc['question']}")
        print(f"   Kỳ vọng: {tc['expected']}")
        print("-" * 70)

        try:
            res = client.predict(
                image=handle_file(str(tc["img"])),
                question=tc["question"],
                max_tokens=1024,
                temperature=0.2,
                api_name="/solve_geometry"
            )
            print("📝 PHẢN HỒI THỰC TẾ CỦA MODEL:")
            print(res)
            results.append({"case": tc, "output": str(res), "status": "OK"})
        except Exception as e:
            print(f"❌ Lỗi suy luận: {e}")
            results.append({"case": tc, "output": str(e), "status": "ERROR"})

    print("\n" + "=" * 70)
    print("  📊 TỔNG HỢP KIỂM TRA ĐÃ HOÀN TẤT")
    print("=" * 70)


if __name__ == "__main__":
    run_benchmark()
