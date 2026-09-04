# -*- coding: utf-8 -*-
import os, subprocess

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Báo Cáo Tổng Hợp Cập Nhật Dự Án DuoSteam (Tháng 8/2026)</title>
<style>
  @page {
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    color: #1e293b;
    line-height: 1.5;
    background: #ffffff;
    font-size: 13px;
  }
  .header {
    border-bottom: 3px solid #3b82f6;
    padding-bottom: 12px;
    margin-bottom: 20px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .title {
    font-size: 22px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .subtitle {
    font-size: 13px;
    color: #64748b;
    margin-top: 4px;
    font-weight: 500;
  }
  .meta {
    text-align: right;
    font-size: 11px;
    color: #64748b;
  }
  .badge {
    display: inline-block;
    padding: 3px 8px;
    border-radius: 6px;
    font-size: 10px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-right: 6px;
  }
  .badge-primary { background: #dbeafe; color: #1d4ed8; }
  .badge-success { background: #dcfce7; color: #15803d; }
  .badge-purple { background: #f3e8ff; color: #7e22ce; }
  .badge-amber { background: #fef3c7; color: #b45309; }

  h2 {
    font-size: 15px;
    font-weight: 700;
    color: #0f172a;
    border-left: 4px solid #3b82f6;
    padding-left: 8px;
    margin-top: 20px;
    margin-bottom: 10px;
  }
  h3 {
    font-size: 13px;
    font-weight: 600;
    color: #1e293b;
    margin-top: 10px;
    margin-bottom: 6px;
  }
  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 14px;
    margin-bottom: 12px;
    page-break-inside: avoid;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 12px;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 6px 10px;
    text-align: left;
  }
  th {
    background: #f1f5f9;
    font-weight: 600;
    color: #334155;
  }
  tr:nth-child(even) { background: #f8fafc; }
  ul {
    margin: 4px 0 8px 18px;
    padding: 0;
  }
  li {
    margin-bottom: 3px;
  }
  .highlight {
    font-weight: 600;
    color: #2563eb;
  }
  .footer {
    margin-top: 25px;
    border-top: 1px solid #e2e8f0;
    padding-top: 8px;
    font-size: 10px;
    color: #94a3b8;
    text-align: center;
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <h1 class="title">BÁO CÁO TỔNG HỢP CẬP NHẬT DỰ ÁN DUOSTEAM</h1>
    <div class="subtitle">Nền tảng học tập & Gamification Toán học THCS / THPT</div>
  </div>
  <div class="meta">
    <div><strong>Kỳ báo cáo:</strong> 01/08/2026 – 26/08/2026</div>
    <div><strong>Phiên bản:</strong> v2.4-Production</div>
    <div><strong>Trạng thái hệ thống:</strong> Sẵn sàng (Stable)</div>
  </div>
</div>

<h2>1. NÂNG CẤP LÕI AI & TRỰC QUAN HÓA TOÁN HỌC (DUOMCB & MATHVIZ)</h2>
<div class="card">
  <div><span class="badge badge-primary">AI Core</span><span class="badge badge-success">MathViz</span><span class="badge badge-purple">Gemini API</span></div>
  <h3>1.1. Chuyển đổi toàn diện sang Google Gemini API Core</h3>
  <ul>
    <li>Đồng bộ hóa 100% các luồng hội thoại văn bản, trích xuất ảnh và gợi ý toán học sang model <span class="highlight">Gemini 3.1 Flash-Lite</span>.</li>
    <li>Loại bỏ hoàn toàn phụ thuộc vào Groq API, giải quyết triệt để lỗi <code>404 model_not_found</code> và nâng cao tốc độ sinh phản hồi (Streaming SSE).</li>
  </ul>

  <h3>1.2. Hệ thống 9 Widget trực quan hóa Toán học (MathViz Engine)</h3>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Widget</th>
        <th>Chuyên đề Toán học</th>
        <th>Tính năng chính</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>1</td>
        <td><strong>Geometry 3D</strong></td>
        <td>Hình học không gian Oxyz</td>
        <td>5 khối đa diện/tròn xoay, xoay 3D cảm ứng, mặt cắt thiết diện trượt, tính thể tích V & diện tích S.</td>
      </tr>
      <tr>
        <td>2</td>
        <td><strong>Function Plot</strong></td>
        <td>Giải tích & Khảo sát hàm</td>
        <td>Vẽ đồ thị hàm số, tiếp tuyến tại điểm x₀, tích phân tô miền diện tích ∫f(x)dx, cực trị.</td>
      </tr>
      <tr>
        <td>3</td>
        <td><strong>Unit Circle Wave</strong></td>
        <td>Lượng giác</td>
        <td>Vòng tròn đơn vị đồng bộ dạng sóng thời gian thực, 15 preset hàm số, điều chỉnh biên độ/tần số/pha.</td>
      </tr>
      <tr>
        <td>4</td>
        <td><strong>Geometry 2D</strong></td>
        <td>Hình học phẳng & Vectơ</td>
        <td>Tam giác, tứ giác, đường tròn; đỉnh kéo-thả; tự tính cạnh, góc, trọng tâm, đường tròn ngoại tiếp, phép biến hình.</td>
      </tr>
      <tr>
        <td>5</td>
        <td><strong>Inequality Region</strong></td>
        <td>Hệ BPT bậc nhất 2 ẩn</td>
        <td>Vẽ nửa mặt phẳng nghiệm, tô sáng đa giác miền nghiệm khả thi và tọa độ các đỉnh.</td>
      </tr>
      <tr>
        <td>6</td>
        <td><strong>Venn Sets</strong></td>
        <td>Tập hợp</td>
        <td>Biểu đồ Venn 2–3 tập, trực quan hóa phép giao A ∩ B, hợp A ∪ B, hiệu A \\ B.</td>
      </tr>
      <tr>
        <td>7</td>
        <td><strong>Sequence Series</strong></td>
        <td>Cấp số cộng / Cấp số nhân</td>
        <td>Biểu đồ cột giá trị số hạng un, đường biểu diễn tổng riêng phần Sn, tìm số hạng thứ k.</td>
      </tr>
      <tr>
        <td>8</td>
        <td><strong>Complex Plane</strong></td>
        <td>Số phức</td>
        <td>Mặt phẳng phức Argand, vector số phức z, môđun |z|, acgumen φ, phép nhân i và liên hợp.</td>
      </tr>
      <tr>
        <td>9</td>
        <td><strong>Distribution</strong></td>
        <td>Xác suất & Thống kê</td>
        <td>Phân phối nhị thức B(n,p), chuẩn Gauss N(μ,σ²), tính xác suất điểm P(X=k) và tích lũy P(X≤k).</td>
      </tr>
    </tbody>
  </table>

  <h3>1.3. Cơ chế Targeted Prompt Injection & Auto-Retry</h3>
  <ul>
    <li><strong>Bộ định tuyến <code>detect_widget</code></strong>: Tự động trích xuất node Knowledge Graph (LightRAG) và quét từ khóa có thứ tự ưu tiên.</li>
    <li><strong>Prompt Injection</strong>: Dùng LRU Cache 64 slots, chỉ gắn đúng 1 schema của widget được phát hiện $\rightarrow$ Tiết kiệm ~1500–2000 tokens mỗi lượt gọi.</li>
    <li><strong>Validation & 1-Retry</strong>: Tự động phát hiện lỗi schema JSON và retry 1 lần với Gemini trước khi bóc tách an toàn.</li>
  </ul>
</div>

<h2>2. HỆ THỐNG BANG HỘI & THI ĐẤU ĐỒNG ĐỘI (CLANS & CLAN BATTLES)</h2>
<div class="card">
  <div><span class="badge badge-purple">Gamification</span><span class="badge badge-amber">Community</span></div>
  <ul>
    <li><strong>Thành lập & Quản trị Bang hội</strong> (<code>/clans/create</code>, <code>/clans/[id]</code>): Người dùng có thể tạo bang, bổ nhiệm đội trưởng/phó bang, quản lý danh sách thành viên.</li>
    <li><strong>Hệ thống Đấu bang (Clan Battles - <code>BattleCard.jsx</code>)</strong>: Thi đấu giải toán đối kháng giữa các bang hội để tích lũy điểm chiến tích và nâng bậc Rank.</li>
    <li><strong>Bảng vinh danh Bang hội (Clan Leaderboard)</strong>: Xếp hạng tuần và tháng dựa trên tổng điểm cống hiến của các thành viên.</li>
  </ul>
</div>

<h2>3. HỆ THỐNG SỰ KIỆN & GIẢI ĐẤU HỌC THUẬT (TOURNAMENTS & EVENTS)</h2>
<div class="card">
  <div><span class="badge badge-amber">Competitions</span><span class="badge badge-primary">Admin Control</span></div>
  <ul>
    <li><strong>Trang sự kiện trung tâm (<code>/events</code>)</strong>: Danh sách giải đấu toán học định kỳ, đếm ngược thời gian bắt đầu và luật thi đấu.</li>
    <li><strong>Cơ chế Vinh danh (Hall of Fame - <code>HallOfFame.jsx</code>)</strong>: Lưu danh các cá nhân và đội thi đạt thành tích xuất sắc nhất trong các mùa giải.</li>
    <li><strong>Cổng quản trị giải đấu (Admin Panel - <code>/admin/tournaments</code>)</strong>: Cho phép quản trị viên tạo mới giải đấu, tùy chỉnh bộ đề thi, thời gian mở phòng và cơ cấu giải thưởng.</li>
  </ul>
</div>

<h2>4. ĐẤU TRƯỜNG TOÁN HỌC THỜI GIAN THỰC (MATH RACING MULTIPLAYER - MRM)</h2>
<div class="card">
  <div><span class="badge badge-success">Real-time</span><span class="badge badge-primary">Multiplayer</span></div>
  <ul>
    <li><strong>Sảnh thi đấu trực tuyến (<code>MultiplayerLobby.js</code>)</strong>: Ghép phòng tự động và thách đấu trực tiếp giữa các học sinh.</li>
    <li><strong>Đua tốc độ giải toán</strong>: Giao diện trực quan hiển thị vị trí đường đua thời gian thực theo số lượng câu hỏi giải đúng.</li>
    <li><strong>Hồ sơ người chơi & Thống kê cá nhân (<code>UserProfile.js</code>)</strong>: Tỷ lệ thắng, chuỗi trận bất bại, biểu đồ biến động điểm Elo/XP.</li>
  </ul>
</div>

<h2>5. SƠ ĐỒ TRI THỨC TOÁN HỌC & HỆ THỐNG BÌNH LUẬN (MATHMAP)</h2>
<div class="card">
  <div><span class="badge badge-primary">Knowledge Graph</span><span class="badge badge-success">Social Learning</span></div>
  <ul>
    <li><strong>Bản đồ chuyên đề toán học (<code>/mathmap/[id]</code>)</strong>: Phân nhánh kiến thức theo cây logic (từ cơ bản đến nâng cao).</li>
    <li><strong>Mục tiêu học tập (<code>LearningObjectives.jsx</code>)</strong>: Đặt chỉ tiêu và theo dõi tỷ lệ hoàn thành từng bài học.</li>
    <li><strong>Khu vực thảo luận & Báo cáo (<code>CommentSection.jsx</code>, <code>ReportModal.jsx</code>)</strong>: Học sinh có thể trao đổi đáp án và gửi phản hồi bài giảng.</li>
  </ul>
</div>

<h2>6. BỘ THƯ VIỆN GIAO DIỆN HỌC TẬP (DUOUI DESIGN SYSTEM)</h2>
<div class="card">
  <div><span class="badge badge-purple">Design System</span><span class="badge badge-primary">Next.js 16</span></div>
  <ul>
    <li>Xây dựng bộ UI component chuẩn: <code>DuoButton</code>, <code>DuoPanel</code>, <code>XPBar</code> (thanh tiến trình kinh nghiệm), <code>MasteryRing</code> (vòng tròn thông thạo), <code>DifficultyChip</code> (mức độ bài toán), <code>RankBadge</code> (huy hiệu xếp hạng).</li>
    <li>Tối ưu hóa toàn diện trên <strong>Next.js 16 (Turbopack)</strong> và <strong>Tailwind CSS v4</strong>: Đã biên dịch thành công 270/270 static pages mượt mà, thời gian tải trang &lt; 0.5s.</li>
  </ul>
</div>

<div class="footer">
  Báo cáo được khởi tạo tự động bởi Hệ thống Quản trị Dự án DuoSteam | Ổ lưu trữ: D:\\Bao_Cao_Tong_Hop_DuoSteam_Thang_8_2026.pdf
</div>

</body>
</html>
"""

html_path = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\backend\report.html"
pdf_path = r"D:\Bao_Cao_Tong_Hop_DuoSteam_Thang_8_2026.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML generated at: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Running Edge print-to-pdf...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Exit code:", res.returncode)
if os.path.exists(pdf_path):
    size = os.path.getsize(pdf_path)
    print(f"SUCCESS: PDF created at {pdf_path} (Size: {size:,} bytes)")
else:
    print("FAILED: PDF file not found")
