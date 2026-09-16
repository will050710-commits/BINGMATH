# -*- coding: utf-8 -*-
"""
generate_backend_documentation_pdf.py
Xuất bản tài liệu PDF kỹ thuật toàn diện diễn giải chi tiết từng file trong backend DuoMath:
1. Kiến trúc hệ thống & Luồng dữ liệu toàn cảnh (Dataflow Architecture)
2. Phân tích chi tiết từng file Core Backend (main.py, solvers, snapping, normalizer, retrieval, vision...)
3. Phân tích hệ thống dữ liệu huấn luyện (training datasets, fine-tuning scripts)
4. Phân tích bộ kiểm thử tự động (test suites) & chuẩn API
"""

import os
import subprocess
import shutil

html_content = r"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>DuoMath Backend: Tài Liệu Kỹ Thuật Chi Tiết Từng File</title>
<style>
  @page {
    size: A4 portrait;
    margin: 9mm 11mm 9mm 11mm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif;
    color: #1e293b;
    line-height: 1.35;
    background: #ffffff;
    font-size: 9.2px;
    margin: 0;
    padding: 0;
  }
  .page {
    page-break-after: always;
    clear: both;
    position: relative;
    padding-bottom: 22px;
  }
  .page:last-child {
    page-break-after: avoid;
  }
  .header {
    border-bottom: 2.5px solid #2563eb;
    padding-bottom: 5px;
    margin-bottom: 8px;
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
  }
  .title {
    font-size: 13.5px;
    font-weight: 800;
    color: #0f172a;
    margin: 0;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }
  .subtitle {
    font-size: 8.5px;
    color: #64748b;
    font-weight: 500;
    margin-top: 1px;
  }
  .badge {
    background: #eff6ff;
    color: #1d4ed8;
    border: 1px solid #bfdbfe;
    padding: 2px 7px;
    border-radius: 4px;
    font-weight: 700;
    font-size: 8px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .footer {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    border-top: 1px solid #e2e8f0;
    padding-top: 4px;
    display: flex;
    justify-content: space-between;
    font-size: 7.5px;
    color: #94a3b8;
  }
  h2 {
    font-size: 10.5px;
    font-weight: 700;
    color: #1e3a8a;
    margin: 7px 0 4px 0;
    border-left: 3px solid #3b82f6;
    padding-left: 5px;
    text-transform: uppercase;
    letter-spacing: 0.2px;
  }
  h3 {
    font-size: 9.5px;
    font-weight: 700;
    color: #0f172a;
    margin: 5px 0 2px 0;
  }
  p {
    margin: 0 0 4px 0;
    text-align: justify;
  }
  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 7px;
    margin-bottom: 6px;
  }
  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 6px;
    margin-bottom: 6px;
  }
  .card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .card-blue {
    background: #f0f7ff;
    border: 1px solid #bae6fd;
    border-radius: 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .card-emerald {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    border-radius: 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .card-purple {
    background: #faf5ff;
    border: 1px solid #e9d5ff;
    border-radius: 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .card-amber {
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 5px;
    padding: 6px 8px;
    margin-bottom: 6px;
  }
  .code {
    font-family: 'Consolas', 'Courier New', monospace;
    background: #0f172a;
    color: #38bdf8;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 8.2px;
  }
  .code-block {
    font-family: 'Consolas', 'Courier New', monospace;
    background: #0f172a;
    color: #e2e8f0;
    padding: 5px 8px;
    border-radius: 4px;
    font-size: 7.8px;
    line-height: 1.25;
    margin: 4px 0;
    white-space: pre-wrap;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 4px 0 6px 0;
    font-size: 8.2px;
  }
  th {
    background: #f1f5f9;
    color: #334155;
    text-align: left;
    padding: 3.5px 5px;
    font-weight: 700;
    border: 1px solid #cbd5e1;
  }
  td {
    padding: 3.5px 5px;
    border: 1px solid #e2e8f0;
    vertical-align: top;
  }
  tr:nth-child(even) td {
    background: #f8fafc;
  }
  ul, ol {
    margin: 2px 0 4px 0;
    padding-left: 14px;
  }
  li {
    margin-bottom: 1.5px;
  }
  .tag {
    display: inline-block;
    padding: 1px 4px;
    font-size: 7.2px;
    font-weight: 700;
    border-radius: 3px;
    margin-right: 3px;
  }
  .tag-green { background: #dcfce7; color: #15803d; border: 1px solid #86efac; }
  .tag-blue { background: #dbeafe; color: #1d4ed8; border: 1px solid #93c5fd; }
  .tag-orange { background: #ffedd5; color: #c2410c; border: 1px solid #fdba74; }
  .tag-purple { background: #f3e8ff; color: #7e22ce; border: 1px solid #d8b4fe; }
</style>
</head>
<body>

<!-- ==================== TRANG 1 ==================== -->
<div class="page">
  <div class="header">
    <div>
      <div class="title">Báo Cáo Kỹ Thuật: Kiến Trúc & Diễn Giải Chi Tiết Backend DuoMath</div>
      <div class="subtitle">Hệ thống Chatbot Toán học Phổ thông & HSG Olympiad tích hợp Worked-Example RAG & Hình học Giải tích 5 tầng</div>
    </div>
    <div class="badge">Phần 1 / 4: Kiến Trúc & Core Monolith</div>
  </div>

  <h2>1. Tổng quan Kiến trúc Hệ thống & Luồng Dữ liệu (Dataflow Pipeline)</h2>
  <p>
    Backend của <strong>DuoMath</strong> được xây dựng trên nền tảng <strong>FastAPI (Python 3.14+)</strong>, vận hành theo mô hình kiến trúc dịch vụ vi mô tự động hóa 24/7 (Zero-Cost Architecture). Toàn bộ hệ sinh thái xử lý bài toán toán học từ cấp độ cơ bản đến Olympic chuyên sâu thông qua quy trình 5 giai đoạn bất đồng bộ:
  </p>
  <div class="code-block">Client (Next.js 16) ──> POST /chat ──> Hybrid Worked-Example RAG (Dense Embedding + Sparse TF-IDF via RRF)
     ──> Few-Shot Dynamic Prompt Injection ──> LLM Engine (Gemini 2.5 Flash / OpenRouter Fallback)
     ──> MathViz Geometry Regularization Pipeline:
         1. Implicit Construction Extractor (Regex NLP bóc tách quan hệ hình học từ lời giải)
         2. Construction Analytic Solver & Cascade Update (Giải tọa độ giải tích & đồng bộ Line/Circle)
         3. Olympiad Template Solver (Định dạng cấu hình 17 điểm Euler / GLK)
         4. Geometric Snapper & Verifier (Nắn góc chính quy 30°-180° & kiểm soát sai số residual)
         5. ViewBox Auto-Fit Normalizer (Co giãn đồng đều uniform scale & căn giữa tránh tràn khung SVG)
     ──> JSON MathViz Render Payload ──> Frontend Visual Canvas (Canvas / SVG / Three.js 3D)</div>

  <h2>2. Diễn giải Chi tiết: main.py — Trọng tâm Điều phối Hệ thống (7,560 dòng)</h2>
  <div class="card-blue">
    <p>
      <span class="tag tag-blue">FastAPI Monolith</span>
      <strong>main.py</strong> đóng vai trò là Controller trung tâm, tiếp nhận mọi request từ Frontend, quản lý vòng đời ứng dụng (Lifespan), định tuyến AI, xác thực dữ liệu và thực hiện tính toán biểu thức đại số tượng trưng.
    </p>
    <ul>
      <li><strong>Quản lý Vòng đời & Cơ sở dữ liệu (Lifespan Handler):</strong> Khởi tạo các bảng SQLite cục bộ (<code class="code">duomath.db</code>): <code class="code">chat_history</code> (lưu vết đoạn hội thoại theo <code class="code">session_id</code>), <code class="code">user_points</code> & <code class="code">quiz_submissions</code> (điểm số học tập), và <code class="code">latex_cache</code>.</li>
      <li><strong>Bộ giải Toán Tượng trưng SymPy (/api/solve-math):</strong> Nhận biểu thức toán học, tự động phân tích và giải tích phân (<code class="code">sp.integrate</code>), đạo hàm (<code class="code">sp.diff</code>), giới hạn (<code class="code">sp.limit</code>), ma trận và phương trình vi phân/đại số, trả về kết quả định dạng LaTeX kèm từng bước biến đổi chuẩn xác 100%.</li>
      <li><strong>Hệ thống Endpoint Chat (/chat):</strong> Tải lịch sử ngữ cảnh, kích hoạt RAG truy xuất bài toán tương tự từ ngân hàng mẫu, xây dựng System Prompt đặc thù cho 9 loại widget MathViz (<code class="code">geometry_2d, geometry_3d, function_plot, unit_circle_wave, inequality_region, venn_sets, sequence_series, complex_plane, distribution</code>), gọi LLM stream/invoke và áp dụng bộ chuẩn hóa hình học 5 tầng.</li>
      <li><strong>Cấu hình CORS & Bảo mật:</strong> Hỗ trợ CORS linh hoạt trên <code class="code">http://localhost:3000</code>, tự động điều chỉnh header bảo mật, xử lý lỗi ngoại lệ và đảm bảo không bao giờ làm gián đoạn luồng phản hồi của người dùng.</li>
    </ul>
  </div>

  <h2>3. Diễn giải Chi tiết: geometry_construction_solver.py — Động cơ Dựng hình Giải tích (420 dòng)</h2>
  <div class="card-emerald">
    <p>
      <span class="tag tag-green">Analytic Solver</span>
      Giải quyết triệt để lỗi kinh điển của các mô hình LLM khi vẽ hình học: <em>đoán mò tọa độ số dẫn đến hình bị xiên vẹo, đường thẳng không chạm điểm, đường tròn tiếp xúc lệch</em>. Module này đọc đồ thị quan hệ hình học <code class="code">constructions</code> và tính toán chính xác tuyệt đối bằng giải tích thuần túy.
    </p>
    <table>
      <tr>
        <th style="width: 25%;">Phép dựng hình (Type)</th>
        <th style="width: 30%;">Tham số tham chiếu (of)</th>
        <th>Phương pháp Giải tích Toán học</th>
      </tr>
      <tr>
        <td><code class="code">midpoint</code>, <code class="code">centroid</code></td>
        <td>[A, B] hoặc danh sách điểm</td>
        <td>Trung điểm đoạn thẳng: $M = \frac{A+B}{2}$; Trọng tâm hệ điểm: $G = \frac{\sum P_i}{n}$.</td>
      </tr>
      <tr>
        <td><code class="code">foot</code>, <code class="code">reflection</code></td>
        <td>[P, L1, L2]</td>
        <td>Chiếu vuông góc điểm $P$ lên đường thẳng $L_1 L_2$ qua tích vô hướng: $t = \frac{(P-L_1)\cdot (L_2-L_1)}{\|L_2-L_1\|^2}$; Điểm đối xứng: $P' = 2\cdot \text{foot} - P$.</td>
      </tr>
      <tr>
        <td><code class="code">intersection</code></td>
        <td>[P1, P2, P3, P4]</td>
        <td>Giao điểm 2 đường thẳng $P_1P_2$ và $P_3P_4$ qua định thức Cramér $2\times 2$.</td>
      </tr>
      <tr>
        <td><code class="code">orthocenter</code>, <code class="code">circumcenter</code>, <code class="code">incenter</code></td>
        <td>[A, B, C]</td>
        <td>Trực tâm $H = \text{giao } 2 \text{ đường cao}$; Tâm ngoại tiếp $O$ giải hệ trung trực; Tâm nội tiếp $I$ dùng tọa độ tỉ cự theo 3 cạnh $aA + bB + cC$.</td>
      </tr>
      <tr>
        <td><code class="code">circle_line_intersection</code></td>
        <td>[Center, R_Pt, L1, L2]</td>
        <td>Nghiệm phương trình bậc hai khoảng cách $\|(L_1 + t\vec{d}) - C\|^2 = R^2$; tự động lọc lấy giao điểm thứ hai khác với điểm đã cho.</td>
      </tr>
      <tr>
        <td><code class="code">circle_circle_intersection</code></td>
        <td>[C1, R1_Pt, C2, R2_Pt]</td>
        <td>Giải giao điểm hai đường tròn bán kính $R_1, R_2$, khoảng cách tâm $d$; xác định hình chiếu $a = \frac{R_1^2 - R_2^2 + d^2}{2d}$ và độ nâng $h = \sqrt{R_1^2 - a^2}$.</td>
      </tr>
      <tr>
        <td><code class="code">angle_bisector_foot</code></td>
        <td>[Vertex, P1, P2]</td>
        <td>Chân phân giác trong chia cạnh đối diện $P_1P_2$ theo tỉ số hai cạnh kề: $t = \frac{\|V-P_1\|}{\|V-P_1\| + \|V-P_2\|}$.</td>
      </tr>
      <tr>
        <td><code class="code">nine_point_center</code></td>
        <td>[A, B, C]</td>
        <td>Tâm đường tròn Euler 9 điểm: chính xác là trung điểm đoạn nối trực tâm $H$ và tâm ngoại tiếp $O$: $N = \frac{H+O}{2}$.</td>
      </tr>
    </table>
    <p>
      <strong>Cơ chế Cascade Update (<code class="code">_cascade_update_layers</code>):</strong> Sau khi tọa độ giải tích được tính toán, hàm tự động quét toàn bộ layer <code class="code">line/segment</code> và <code class="code">circle</code>, đồng bộ lại tọa độ <code class="code">from</code>, <code class="code">to</code> và tâm <code class="code">center</code> theo tên điểm (ID) hoặc khoảng cách snap. Các đường cao, tiếp tuyến hay trung tuyến luôn gắn khít hoàn hảo vào đỉnh.
    </p>
  </div>

  <div class="footer">
    <span>DuoMath Engineering Documentation &copy; 2026 — Bảo mật Nội bộ</span>
    <span>Trang 1/4</span>
  </div>
</div>

<!-- ==================== TRANG 2 ==================== -->
<div class="page">
  <div class="header">
    <div>
      <div class="title">Báo Cáo Kỹ Thuật: Chi Tiết Các Module Hình Học & RAG</div>
      <div class="subtitle">Động cơ Giải tích Hình học Nâng cao, Chống tràn ViewBox và RAG Lai Worked-Example</div>
    </div>
    <div class="badge">Phần 2 / 4: Geometry Pipeline & RAG</div>
  </div>

  <h2>4. Diễn giải Chi tiết: geometry_viewbox_normalizer.py — Chuẩn hóa Khung nhìn Chống tràn (150 dòng)</h2>
  <div class="card">
    <p>
      <span class="tag tag-orange">ViewBox Normalizer</span>
      Khi giải tích các bài toán phức tạp, một số điểm giao kéo dài (ví dụ: giao điểm đường thẳng Euler với cạnh đáy, giao điểm tiếp tuyến) có thể nằm ở tọa độ rất xa (ví dụ $x = -16.5, y = 12.0$). Trong khi đó, khung vẽ MathViz mặc định hiển thị vùng $[-5, 5]$. Module này giải quyết triệt để vấn đề:
    </p>
    <ul>
      <li><strong>Thu thập Biên (Bounding Box Collection):</strong> Quét tất cả các phần tử trong hình vẽ gồm đỉnh đa giác, điểm rời, đoạn mút đường thẳng, và vòng tròn biên ($center \pm r$). Xác định $(min_x, max_x, min_y, max_y)$ và độ mở rộng (span).</li>
      <li><strong>Cơ chế Kích hoạt (Trigger Guard):</strong> Nếu bất kỳ tọa độ nào vượt quá biên an toàn $[-5.2, 5.2]$ hoặc tổng chiều rộng/cao vượt quá $9.5$, module sẽ tự động kích hoạt chế độ co giãn.</li>
      <li><strong>Phép biến đổi Đồng tỷ lệ (Uniform Rescaling & Centering):</strong> Áp dụng tỉ lệ thu phóng $k = \frac{2 \times 4.0}{\max(width, height)}$ và tịnh tiến tâm hình học về gốc tọa độ $(0, 0)$. Toàn bộ hình vẽ thu gọn hoàn hảo trong vùng an toàn $[-4.0, 4.0]$ với lề biên 15%, giữ nguyên vẹn 100% tỷ lệ góc, phương vị và sự tiếp xúc.</li>
    </ul>
  </div>

  <h2>5. Diễn giải Chi tiết: geometry_implicit_extractor.py — Bóc tách Dựng hình Ẩn từ Văn bản (160 dòng)</h2>
  <div class="card-purple">
    <p>
      <span class="tag tag-purple">Regex NLP Engine</span>
      Trong nhiều trường hợp, LLM phân tích rất tốt bài toán trong lời văn tiếng Việt/Anh nhưng lại quên khai báo mảng <code class="code">constructions</code> trong JSON. Module này đóng vai trò "cứu cánh":
    </p>
    <ul>
      <li>Sử dụng tập biểu thức chính quy (Regex Pattern Bank) nhận diện ngữ nghĩa tiếng Việt chuẩn: <em>"Gọi H là trực tâm tam giác ABC"</em>, <em>"D là chân đường cao hạ từ A xuống BC"</em>, <em>"M là trung điểm cạnh BC"</em>, <em>"K là giao điểm của EF và BC"</em>, <em>"D là chân phân giác trong góc A"</em>,...</li>
      <li>Tự động đối chiếu với danh sách điểm đã có trên hình để tránh sinh điểm rác, sau đó tổng hợp thành mảng <code class="code">constructions</code> chuẩn schema và tự động gọi <code class="code">resolve_constructions()</code> để giải tích tọa độ ngay lập tức.</li>
    </ul>
  </div>

  <div class="grid-2">
    <div>
      <h2>6. geometry_canvas_solver.py (300 dòng)</h2>
      <div class="card">
        <p><strong>Chuẩn hóa 17 điểm Olympiad:</strong></p>
        <p>Tối ưu chuyên biệt cho bài toán cấu hình đường tròn Euler 9 điểm, tam giác nhọn không cân $AB < AC$, 3 đường cao $AD, BE, CF$, trực tâm $H$, tâm ngoại tiếp $O$, tâm đường tròn đường kính $AH$ ($I$), giao điểm kéo dài $P = EF \cap BC$, điểm $K$ trên $BC$, giao điểm song song $Q, L$, Cevian $AML$,... Module có bộ Guard kiểm tra chữ ký đặc trưng để chỉ kích hoạt đúng cấu hình và không can thiệp vào các bài toán khác.</p>
      </div>
    </div>
    <div>
      <h2>7. geometry_snapping.py & verification.py (490 dòng)</h2>
      <div class="card">
        <p><strong>Nắn góc & Kiểm chứng An toàn:</strong></p>
        <p>Thực hiện hiệu chỉnh giải tích cho 90% các hình thông thường không có quan hệ dựng hình tường minh. Tự động nhận diện và nắn chỉnh các góc gần góc chuẩn ($30^\circ, 45^\circ, 60^\circ, 90^\circ, 120^\circ, 135^\circ, 150^\circ, 180^\circ$ trong sai số $3^\circ$).</p>
        <p>Mỗi bước nắn điểm đều được kiểm soát bởi <code class="code">verify_snap_safe()</code> trong <code class="code">geometry_verification.py</code> để đảm bảo không làm tăng residual sai số hình học của các cạnh khác.</p>
      </div>
    </div>
  </div>

  <h2>8. Diễn giải Chi tiết: math_problem_retrieval.py — Worked-Example Hybrid RAG (360 dòng)</h2>
  <div class="card-blue">
    <p>
      <span class="tag tag-blue">Hybrid RAG</span>
      Giải quyết vấn đề ảo giác (hallucination) của LLM bằng phương pháp <strong>Worked-Example Retrieval</strong> — trích xuất các bài toán tương đồng trong ngân hàng dữ liệu để làm mẫu hướng dẫn giải từng bước (few-shot dynamic prompting).
    </p>
    <ul>
      <li><strong>Dense Embedding Search:</strong> Tích hợp mô hình nhúng ngữ nghĩa chuyên sâu tiếng Việt <code class="code">AITeamVN/Vietnamese_Embedding</code> (chạy cục bộ qua <code class="code">sentence-transformers</code>). Nếu môi trường chưa cài đặt, tự động chuyển sang chế độ dự phòng TF-IDF mà không phát sinh lỗi.</li>
      <li><strong>Sparse TF-IDF Search:</strong> Phân tích từ khóa toán học chuyên sâu (<code class="code">trực tâm, tiếp tuyến, đạo hàm, tích phân, elip, ma trận</code>) với trọng số n-gram đặc thù của tiếng Việt.</li>
      <li><strong>Reciprocal Rank Fusion (RRF):</strong> Kết hợp hai bảng xếp hạng mật độ (Dense) và từ khóa (Sparse) theo công thức $RRF(d) = \sum_{m} \frac{1}{60 + r_m(d)}$. Đảm bảo những bài toán có sự tương đồng vừa về ngữ nghĩa câu hỏi vừa về công thức toán học sẽ được ưu tiên cao nhất.</li>
      <li><strong>Bộ dữ liệu <code class="code">data/math_problems.jsonl</code>:</strong> Chứa hàng trăm bài toán chuẩn mực từ lớp 10, 11, 12 và bồi dưỡng HSG, có sẵn lời giải mẫu, phân loại chủ đề (<code class="code">geometry, calculus, algebra, combinatorics</code>) và khối hình MathViz đi kèm.</li>
    </ul>
  </div>

  <div class="footer">
    <span>DuoMath Engineering Documentation &copy; 2026 — Bảo mật Nội bộ</span>
    <span>Trang 2/4</span>
  </div>
</div>

<!-- ==================== TRANG 3 ==================== -->
<div class="page">
  <div class="header">
    <div>
      <div class="title">Báo Cáo Kỹ Thuật: Thị Giác AI, Video & Dữ Liệu Huấn Luyện</div>
      <div class="subtitle">Module Vision Agent, Chuyển đổi Video và Toàn bộ Hệ sinh thái Dữ liệu Fine-Tuning</div>
    </div>
    <div class="badge">Phần 3 / 4: Vision, Video & Training</div>
  </div>

  <h2>9. Module Thị giác Máy tính & Đa phương tiện (Vision & Video Engine)</h2>
  <div class="grid-2">
    <div class="card">
      <h3>vision_agent.py & vision_cache.py (310 dòng)</h3>
      <p>
        <strong>Trích xuất Hình học từ Ảnh Chụp:</strong> Cho phép người dùng chụp ảnh bài toán hình học trong sách bài tập hoặc bảng viết. Module sử dụng Gemini 2.5 Vision để nhận diện các điểm, đường thẳng, góc và chuyển thể trực tiếp thành cấu trúc JSON <code class="code">geometry_2d</code>.
      </p>
      <p>
        <strong>Bộ nhớ đệm SQLite SHA-256:</strong> Lưu trữ kết quả trích xuất vào <code class="code">vision_cache.db</code> theo mã băm SHA-256 của ảnh, giúp phản hồi tức thì và tiết kiệm 100% chi phí API cho các ảnh bài tập trùng lặp.
      </p>
    </div>
    <div class="card">
      <h3>image_preprocessing.py & canvas_to_video.py (280 dòng)</h3>
      <p>
        <strong>Nâng cao Chất lượng Ảnh & Video Hoạt Họa:</strong> <code class="code">image_preprocessing.py</code> áp dụng thuật toán CLAHE (Contrast Limited Adaptive Histogram Equalization), cân bằng sáng và khử nghiêng góc chụp để tối ưu độ chính xác OCR.
      </p>
      <p>
        <code class="code">canvas_to_video.py</code> và <code class="code">video_enhancer.py</code> sử dụng thư viện OpenCV/FFmpeg để kết xuất các trạng thái dựng hình từng bước thành video MP4 trực quan, hỗ trợ học sinh quan sát quá trình vẽ hình động.
      </p>
    </div>
  </div>

  <h2>10. Diễn giải Hệ sinh thái Huấn luyện & Dữ liệu Fine-Tuning (duosteam/backend/training)</h2>
  <p>
    Thư mục <code class="code">backend/training/</code> đại diện cho toàn bộ quy trình chuẩn bị dữ liệu và fine-tune mô hình mã nguồn mở độc lập (DeepSeek-R1 / Qwen2.5-Math) cũng như Gemini Vertex AI cho DuoMath:
  </p>

  <table>
    <tr>
      <th style="width: 28%;">File / Thư mục</th>
      <th style="width: 25%;">Thể loại / Định dạng</th>
      <th>Mục đích & Chức năng Kỹ thuật</th>
    </tr>
    <tr>
      <td><code class="code">tuning_data/hf_mathviz_chatml_train.jsonl</code></td>
      <td>Dataset (5,200 mẫu)</td>
      <td>Tập dữ liệu huấn luyện định dạng ChatML tiêu chuẩn, bao gồm các lượt hội thoại hỏi đáp toán học kèm khối mã MathViz chuẩn xác.</td>
    </tr>
    <tr>
      <td><code class="code">tuning_data/gemini_vertex_train.jsonl</code></td>
      <td>Dataset (2,800 mẫu)</td>
      <td>Tập dữ liệu tối ưu hóa cho công cụ Gemini Vertex AI Tuning, tập trung vào giải toán tự luận THPT và dựng hình hình học 2D/3D.</td>
    </tr>
    <tr>
      <td><code class="code">training/prepare_math_datasets.py</code></td>
      <td>Script Ingest & Clean</td>
      <td>Đồng bộ và làm sạch dữ liệu từ các nguồn mở toán học (MetaMath, OmniMath, Hendrycks), chuyển dịch thuật ngữ sang tiếng Việt chuẩn sư phạm.</td>
    </tr>
    <tr>
      <td><code class="code">training/generate_mathviz_sft_dataset.py</code></td>
      <td>Synthetic Generator</td>
      <td>Sinh dữ liệu tổng hợp (synthetic data) các bài toán hình học kèm mảng <code class="code">constructions</code> giải tích phục vụ huấn luyện chuyên biệt.</td>
    </tr>
    <tr>
      <td><code class="code">training/train_hf_mathviz_unsloth.py</code></td>
      <td>Unsloth QLoRA Script</td>
      <td>Mã nguồn huấn luyện siêu tốc mô hình DeepSeek-R1-Distill-Qwen-7B sử dụng kỹ thuật lượng tử hóa 4-bit, LoRA rank 32 trên GPU Nvidia.</td>
    </tr>
    <tr>
      <td><code class="code">training/tune_gemini_vertex.py</code></td>
      <td>Cloud Tuning Script</td>
      <td>Kích hoạt và giám sát tác vụ tinh chỉnh mô hình Gemini 1.5/2.5 Pro trên hạ tầng Google Cloud Vertex AI thông qua Service Account.</td>
    </tr>
    <tr>
      <td><code class="code">training/benchmark_canvas_model.py</code></td>
      <td>Benchmark & Evaluation</td>
      <td>Bộ kiểm thử tự động đo đạc tỷ lệ sinh đúng cú pháp MathViz, độ khớp tọa độ hình học và tỷ lệ vượt qua bài thi Olympic (MATH Benchmark).</td>
    </tr>
  </table>

  <h2>11. Quy chuẩn Hệ thống Kiểm thử Tự động (Automated Test Suites)</h2>
  <div class="card-emerald">
    <p>
      Hệ thống kiểm thử toàn diện được đặt tại thư mục gốc backend, đảm bảo kiểm soát chất lượng (CI/CD) trước mỗi đợt triển khai:
    </p>
    <div class="grid-3">
      <div>
        <p><strong>test_geometry_pipeline.py</strong></p>
        <p>Kiểm tra toàn diện 7 khâu: Cascade update đoạn thẳng và đường tròn, 4 phép dựng hình mới, ViewBox auto-fit co giãn, và bóc tách NLP ẩn.</p>
      </div>
      <div>
        <p><strong>test_math_problem_retrieval.py</strong></p>
        <p>Kiểm tra cơ chế tìm kiếm RAG lai, thuật toán hợp nhất điểm RRF, khả năng suy thoái an toàn khi thiếu thư viện nhúng.</p>
      </div>
      <div>
        <p><strong>test_geometry_construction_solver.py</strong></p>
        <p>Kiểm tra tính chính xác của 13 công thức giải tích hình học và cơ chế bảo vệ Guard của bộ giải Olympiad.</p>
      </div>
    </div>
  </div>

  <div class="footer">
    <span>DuoMath Engineering Documentation &copy; 2026 — Bảo mật Nội bộ</span>
    <span>Trang 3/4</span>
  </div>
</div>

<!-- ==================== TRANG 4 ==================== -->
<div class="page">
  <div class="header">
    <div>
      <div class="title">Báo Cáo Kỹ Thuật: Danh Mục API & Hướng Dẫn Vận Hành</div>
      <div class="subtitle">Bảng tổng hợp API Endpoints, Cấu hình Môi trường và Quy chuẩn Bảo trì Hệ thống</div>
    </div>
    <div class="badge">Phần 4 / 4: API Reference & DevOps</div>
  </div>

  <h2>12. Danh mục Toàn bộ API Endpoints của Backend DuoMath</h2>
  <table>
    <tr>
      <th style="width: 10%;">Method</th>
      <th style="width: 25%;">Endpoint URL</th>
      <th style="width: 25%;">Đầu vào chính (Payload)</th>
      <th>Mô tả Chức năng & Kết quả Trả về</th>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/chat</code></td>
      <td><code class="code">{message, session_id, history}</code></td>
      <td>Giao tiếp chatbot chính: RAG worked-example + Gemini gọi hàm + pipeline nắn chỉnh hình học 5 tầng + trả về markdown & mathviz payload.</td>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/api/solve-math</code></td>
      <td><code class="code">{expression, task_type}</code></td>
      <td>Giải toán biểu thức bằng SymPy thuần túy: đạo hàm, tích phân, giới hạn, đại số ma trận, trả về các bước giải LaTeX.</td>
    </tr>
    <tr>
      <td><span class="tag tag-green">GET</span></td>
      <td><code class="code">/api/user-stats</code></td>
      <td><code class="code">query: user_id</code></td>
      <td>Truy vấn thống kê tiến độ học tập, điểm số bài quiz và chuỗi ngày học liên tục (streak) của học sinh.</td>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/api/sync-user</code></td>
      <td><code class="code">{uid, email, displayName}</code></td>
      <td>Đồng bộ thông tin tài khoản người dùng từ Firebase Authentication sang cơ sở dữ liệu SQLite của backend.</td>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/api/geometry/validate-construction</code></td>
      <td><code class="code">{layers, constructions}</code></td>
      <td>Endpoint kiểm tra tính khả thi và hợp lệ của đồ thị dựng hình hình học 2D.</td>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/api/geometry/euler-align</code></td>
      <td><code class="code">{layers, title}</code></td>
      <td>Thực hiện căn chỉnh giải tích cấu hình bài toán hình học Olympiad Euler theo chuẩn tọa độ tối ưu.</td>
    </tr>
    <tr>
      <td><span class="tag tag-blue">POST</span></td>
      <td><code class="code">/api/geometry/snap-angles</code></td>
      <td><code class="code">{layers, tolerance}</code></td>
      <td>Nắn chỉnh các góc gần góc vuông/đặc biệt và các điểm gần thẳng hàng bằng giải tích không gian.</td>
    </tr>
    <tr>
      <td><span class="tag tag-green">GET</span></td>
      <td><code class="code">/docs</code>, <code class="code">/redoc</code></td>
      <td>None</td>
      <td>Giao diện tương tác trực quan Swagger UI / ReDoc của OpenAPI 3.1 phục vụ kiểm thử thủ công và tài liệu lập trình.</td>
    </tr>
  </table>

  <h2>13. Cấu hình Môi trường & Quản trị Hạ tầng (Environment & DevOps)</h2>
  <div class="grid-2">
    <div class="card">
      <h3>Biến Môi Trường (.env)</h3>
      <ul>
        <li><code class="code">GEMINI_API_KEY</code>: Khóa API Google AI Studio cấp quyền truy cập mô hình Gemini 2.5 Flash / Pro.</li>
        <li><code class="code">OPENROUTER_API_KEY</code>: Khóa dự phòng gọi DeepSeek-R1 / Qwen2.5 khi Gemini hết quota.</li>
        <li><code class="code">DATABASE_URL</code>: Đường dẫn kết nối CSDL SQLite (<code class="code">sqlite:///./duomath.db</code>).</li>
        <li><code class="code">PORT</code>: Cổng lắng nghe máy chủ backend (mặc định: <code class="code">8000</code>).</li>
        <li><code class="code">FRONTEND_URL</code>: URL ứng dụng client (<code class="code">http://localhost:3000</code>).</li>
      </ul>
    </div>
    <div class="card">
      <h3>Lệnh Vận Hành & Khởi Chạy (Run Commands)</h3>
      <div class="code-block"># 1. Khởi động Backend (FastAPI + Uvicorn)
cd duosteam/backend
python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload

# 2. Khởi động Frontend (Next.js 16 Turbopack)
cd duosteam/frontend
npm run dev

# 3. Chạy toàn bộ Test Suite Hình học & RAG
cd duosteam/backend
python test_geometry_pipeline.py</div>
    </div>
  </div>

  <h2>14. Kết luận & Định hướng Nâng cấp</h2>
  <div class="card-amber">
    <p>
      Hệ thống Backend của <strong>DuoMath</strong> hiện đã đạt độ hoàn thiện cao nhất từ trước đến nay: giải quyết triệt để vấn đề lệch hình, đứt đoạn thẳng, cắt ngoài khung nhìn SVG, và hỗ trợ đa ngôn ngữ trong trích xuất dựng hình ẩn. Động cơ Worked-Example RAG lai kết hợp cùng các công thức giải tích bảo toàn tính đúng đắn giúp DuoMath vận hành hoàn toàn ổn định 24/7 với chi phí 0 đồng, sẵn sàng cho việc mở rộng quy mô phục vụ hàng vạn học sinh trên toàn quốc.
    </p>
  </div>

  <div class="footer">
    <span>DuoMath Engineering Documentation &copy; 2026 — Hoàn tất Biên soạn</span>
    <span>Trang 4/4</span>
  </div>
</div>

</body>
</html>
"""

html_path = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\backend\backend_comprehensive_report.html"
pdf_path_d = r"D:\DUOMATH_BACKEND_COMPREHENSIVE_GUIDE.pdf"
pdf_path_repo = r"c:\Users\Latitude 7300\OneDrive\Máy tính\duosteam - Copy\duosteam\DUOMATH_BACKEND_COMPREHENSIVE_GUIDE.pdf"

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"[OK] HTML generated at: {html_path}")

edge_path = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
if not os.path.exists(edge_path):
    edge_path = r"C:\Program Files\Microsoft\Edge\Application\msedge.exe"

cmd = [
    edge_path,
    "--headless",
    "--disable-gpu",
    f"--print-to-pdf={pdf_path_d}",
    html_path
]

print(f"Running Microsoft Edge print-to-pdf...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Exit code:", res.returncode)

if os.path.exists(pdf_path_d):
    size_d = os.path.getsize(pdf_path_d)
    print(f"[SUCCESS] PDF created at {pdf_path_d} (Size: {size_d:,} bytes)")
    shutil.copy(pdf_path_d, pdf_path_repo)
    print(f"[SUCCESS] Copied to repo root: {pdf_path_repo}")
else:
    print("[ERROR] PDF generation failed!")
