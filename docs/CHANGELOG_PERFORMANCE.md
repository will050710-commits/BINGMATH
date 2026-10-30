# BINGMATH — TutorWorkspace

**Báo cáo thay đổi kiến trúc, UI và hiệu năng — Đợt A**

Ngày: **29/10/2026**. Nền mã đối chiếu: commit `1661cd0499bbed61868519d2a6597392f077c7da`. Phạm vi: route `/DuoMCB`, bố cục thích ứng, canvas đang hoạt động, divider và composer.

## 1. Kết quả và phạm vi

`TutorWorkspace` tổ chức hội thoại, composer và bảng minh họa thành ba vùng có trách nhiệm riêng. Desktop dùng hai cột; tablet/mobile xếp canvas phía trên hội thoại; composer luôn nằm trong vùng làm việc. Bảng minh họa đang được chọn giữ cùng renderer khi kéo divider, mở rộng, thu gọn, đổi kích thước màn hình và nhập câu trả lời.

Tin nhắn có MathViz trở thành tham chiếu đến bảng minh họa chung. Chọn một tin nhắn cũ sẽ mở đúng scene của tin nhắn đó. Hội thoại, bản nháp và xử lý API vẫn do `DuoMCBPage` quản lý; Đợt A chưa thay đổi hợp đồng backend hoặc cách AI sinh gợi ý.

**Giới hạn persistence:** giữ một scene đang hoạt động qua các thay đổi bố cục. Khi người học chọn một scene khác hoặc đổi cuộc hội thoại, renderer của scene cũ được thay thế có chủ ý. Đợt A chưa lưu toàn bộ camera, tham số và lịch sử thao tác của mọi scene để phục hồi giữa các scene hoặc sau khi tải lại trang.

## 2. File / Folder affected

Các đường dẫn dưới đây tính từ root repo. Danh sách được đối chiếu với thay đổi nguồn của Đợt A; file build/cache trong `work/` không nằm trong bàn giao.

| Trạng thái | File | Purpose & Impact |
| --- | --- | --- |
| Thêm | `frontend/src/components/tutor/TutorWorkspace.tsx` | Component bố cục chính, nhận các slot transcript/composer/canvas; điều khiển vùng hiển thị và toolbar mà giữ vị trí React của renderer. |
| Thêm | `frontend/src/components/tutor/TutorWorkspace.module.css` | Quy tắc grid và kích thước theo vùng làm việc; các trạng thái expanded/collapsed, preview mobile và vùng cuộn. |
| Thêm | `frontend/src/components/tutor/useTutorWorkspace.ts` | Tách state và side effects của layout: container measurement, visual viewport, divider, focus, scroll và tùy chọn tỷ lệ. |
| Thêm | `frontend/src/components/tutor/workspaceGeometry.ts` | Các phép tính breakpoint, giới hạn tỷ lệ và đọc tùy chọn lưu trữ; tách phép tính thuần khỏi UI. |
| Thêm | `frontend/src/components/tutor/types.ts` | Hợp đồng TypeScript cho props, chế độ workspace và trạng thái viewport; tách type khỏi component. |
| Thêm | `frontend/src/components/tutor/scene.types.ts` | Kiểu dữ liệu của message, scene và envelope `mathviz.v1`; định danh scene gắn với cuộc hội thoại. |
| Thêm | `frontend/src/components/tutor/useTutorScenes.ts` | Tách phân tích MathViz khỏi render từng tin nhắn; quản lý scene đang chọn và hành động mở lại canvas. |
| Thêm | `frontend/src/components/tutor/MathCanvasHost.tsx` | Host có memoization, tải động renderer và error boundary; giữ lỗi minh họa trong vùng canvas. |
| Sửa | `frontend/src/components/DuoMCB/DuoMCBPage.js` | Tích hợp workspace, dùng scene hook, chuyển render MathViz khỏi bong bóng chat sang host chung; truyền composer hiện tại qua slot; chặn phản hồi cũ bằng generation guard/AbortController khi đổi phiên; khóa gửi khi đang tải lịch sử. |
| Sửa | `frontend/src/components/DuoMCB/DuoMCBPage.module.css` | Điều chỉnh min-width/min-height, độ rộng nội dung và composer; thêm nút tham chiếu scene; bỏ style artifact không còn dùng. |
| Sửa | `frontend/src/components/LayoutClient.js` | Ẩn nút chat/ngôn ngữ nổi trên route gia sư toàn màn hình để không che composer mobile; lựa chọn ngôn ngữ được đưa vào header của `DuoMCBPage`. |
| Sửa | `frontend/src/components/shared/MathInput.jsx` | Truyền sự kiện geometry bàn phím MathLive cho workspace; tự host fonts/sounds đã được postinstall sao chép; gỡ listener khi unmount. |
| Sửa | `frontend/src/components/DuoMCB/duoServer.js` | Chặn retry của yêu cầu đã bị hủy khi người học đổi cuộc hội thoại. |
| Sửa | `frontend/src/components/DuoMCB/mathviz/MathVizFunctionPlot.js` | Cho vùng vẽ dùng chiều cao thích ứng; làm gọn nhãn trục tung; ổn định hàm đánh giá và dependency của memoization dữ liệu đồ thị. |
| Sửa | `frontend/src/components/DuoMCB/mathviz/MathVizGeometry3D.js` | Resize theo host thực tế, giữ scene/camera, quản lý vòng lặp khi canvas ẩn hoặc tab nền. |
| Sửa | `frontend/src/components/DuoMCB/mathviz/MathVizJSXGraph.js` | Resize board theo host bằng observer riêng; giữ pan/zoom và chờ kích thước hợp lệ; bỏ state boardReady không được sử dụng; kiểm chứng hình học qua sự kiện update của board, bỏ lời gọi trùng khi khởi tạo. |
| Thêm | `frontend/tsconfig.json` | Cấu hình Next.js/TypeScript cho các module mới; giữ JavaScript cũ ở chế độ `checkJs: false`. |
| Xóa / thay thế | `frontend/jsconfig.json` | Alias `@/*` được chuyển sang `tsconfig.json`, tránh duy trì hai nguồn cấu hình cạnh tranh. |
| Sửa | `frontend/package.json` | Khai báo công cụ typecheck, kiểm thử browser và tạo báo cáo dưới dạng dependency phát triển. |
| Sửa | `frontend/pnpm-lock.yaml` | Ghi lại phiên bản dependency để cài đặt và kiểm thử có thể tái lập. |
| Thêm | `frontend/pnpm-workspace.yaml` | Khai báo `allowBuilds` cho năm dependency cần install script; cài đặt bằng pnpm 10.26+ hoặc 11 có quyết định rõ ràng, không phụ thuộc prompt tương tác. |
| Thêm | `frontend/playwright.config.ts` | Cấu hình kiểm thử browser trên route thật, server local và đầu ra nằm trong `work/`. |
| Thêm | `frontend/tests/fixtures/tutor-api.ts` | API fixture xác định, tạo scene và phản hồi chat mà không gọi dịch vụ AI thật. |
| Thêm | `frontend/tests/tutor-workspace.spec.ts` | Kiểm tra renderer identity, tham số, responsive, divider, scroll và composer. |
| Sửa | `.gitignore` | Loại trừ dữ liệu kiểm thử, metadata sinh tự động và file trung gian khỏi thay đổi nguồn. |
| Thêm | `docs/CHANGELOG_PERFORMANCE.md` | Nguồn báo cáo có thể chỉnh sửa; ghi phạm vi, tác động, kỹ thuật và bằng chứng kiểm thử. |
| Thêm | `frontend/scripts/build-workspace-report.mjs` | Biên dịch Markdown thành PDF A4 bằng Chromium, font hệ thống và asset cục bộ. |
| Sinh từ nguồn | `docs/CHANGELOG_PERFORMANCE.pdf` | Bản báo cáo để đọc/chia sẻ, tạo từ Markdown bằng lệnh ở phần 8. |

## 3. Trách nhiệm được tách khỏi DuoMCBPage

Trước thay đổi, `DuoMCBPage` tự giữ vùng cuộn chat, tự cuộn về cuối khi có hoạt động và render một MathViz trong mỗi message chứa payload. Sau thay đổi:

1. `TutorWorkspace` sở hữu bố cục, vùng cuộn và vị trí composer/canvas.
2. `useTutorWorkspace` sở hữu state giao diện và các side effects liên quan đến viewport, pointer và focus.
3. `useTutorScenes` phân tích nội dung message khi mảng message hoặc cuộc hội thoại đổi, rồi xác định scene được chọn.
4. `MathCanvasHost` render scene đang hoạt động tại một vị trí React cố định và cô lập lỗi renderer.
5. `DuoMCBPage` tiếp tục quản lý nội dung composer, ảnh đính kèm, lịch sử, lời gọi API, MathLive và công cụ gửi tin. Composer được tích hợp qua slot; Đợt A không tuyên bố đã tách toàn bộ composer thành một editor mới.

Cách tách này chuẩn bị điểm tích hợp cho các bước Socratic, liên kết chữ–hình và slider dùng chung state ở đợt sau; các tính năng đó chưa nằm trong phạm vi bàn giao này.

## 4. Bố cục, tương tác và accessibility

| Vùng / trạng thái | Hành vi |
| --- | --- |
| Desktop, vùng làm việc từ 1.024 px | Mặc định chat 40%, canvas 60%; chat tối thiểu 360 px, canvas tối thiểu 440 px, giới hạn tỷ lệ theo chiều rộng thực tế. |
| Tablet, 768–1.023 px | Canvas xếp trên transcript; composer tiếp tục nằm ở đáy vùng làm việc. |
| Mobile, dưới 768 px | Canvas preview phía trên, transcript cuộn riêng, composer có safe-area. |
| Bàn phím mobile | Đo `visualViewport` và geometry của bàn phím MathLive; không nhầm thay đổi chiều rộng/orientation với mở bàn phím. Thu preview, hoặc dành toàn vùng còn lại cho composer có cuộn khi chiều cao rất thấp. Giữ bản nháp và không can thiệp pinch zoom. |
| Divider | Pointer capture để không mất drag; hỗ trợ bàn phím qua ARIA separator, phím mũi tên, Home/End và Enter. |
| Canvas expanded/collapsed | Đổi hình học của shell; renderer và composer đang hoạt động giữ nguyên vị trí trong cây React. |
| Hội thoại dài | Chỉ bám cuối khi người học đang ở gần cuối. Nếu đang đọc phía trên, hiện thông báo phản hồi mới để họ chủ động quay lại. |
| Reduced motion | Dùng trạng thái giao diện tương đương với chuyển động được giảm; không buộc người học theo một animation mới thao tác được. |
| Lỗi renderer | Error boundary hiển thị cách thử dựng lại trong vùng canvas; hội thoại và bản nháp vẫn tồn tại. |

## 5. Performance Optimization

### 5.1. Giảm render lại không cần thiết

`DuoMCBPage` dùng `useMemo` cho phần tử `MathCanvasHost` theo scene đang chọn. Việc gõ composer không đổi mảng message, vì vậy không phân tích lại payload MathViz. `MathCanvasHost` có `React.memo` với phép so sánh định danh scene và nội dung nguồn bất biến; khi chỉ thêm một lượt hội thoại mà scene đang chọn không đổi, host có thể bỏ qua render lại.

Trong đồ thị hàm số, hàm đánh giá biểu thức dùng `useCallback` theo biểu thức đã biên dịch; các phép tính điểm/vùng tích phân phụ thuộc đúng hàm này và giá trị tham số. JSXGraph bỏ state `boardReady` không có nơi đọc; phép kiểm chứng hình học được gọi qua sự kiện `update` của board, bỏ lời gọi trùng ngay sau khi đăng ký listener.

Memoization không ngăn renderer tự cập nhật state khi người học kéo slider, đổi camera hoặc dùng công cụ của widget. Mục tiêu là tách cập nhật của transcript/composer khỏi công việc vẽ không liên quan; đây không phải tuyên bố mọi render đều được loại bỏ.

### 5.2. Persistent renderer và ResizeObserver

Canvas có một host cố định. Mở rộng, thu gọn hoặc đổi breakpoint không tạo một bản renderer thứ hai, không đổi key của scene đang hoạt động và không chuyển renderer giữa hai nhánh JSX.

Với Three.js, `ResizeObserver` quan sát phần tử chứa renderer. Callback chỉ xếp một `requestAnimationFrame`; trong frame đó đọc chiều rộng/cao, bỏ qua kích thước bằng 0 hoặc không đổi, cập nhật `camera.aspect`, projection matrix và drawing buffer. Scene, camera, geometry và vị trí quay được giữ. CSS quyết định kích thước hiển thị qua `width/height: 100%`; `renderer.setSize(width, height, false)` không áp lại kích thước pixel làm cạnh tranh với grid.

Với JSXGraph, observer nội bộ dựa trên timeout được tắt để tránh hai cơ chế resize cùng điều khiển board. Observer của host gọi `resizeContainer(width, height, true)` trên board hiện tại, bắt đầu từ bounding box đang dùng thay vì dựng lại hoặc reset zoom. `keepaspectratio` giữ tỷ lệ hình học; miền nhìn có thể nới theo tỷ lệ khung mới. Lần dựng đầu tiên chờ host có kích thước dương; một canvas đang thu gọn không dựng board tại kích thước 0.

Khi unmount thật, observer, event listener và frame đang chờ được dọn. Three.js thêm kiểm tra visibility/intersection để dừng vòng lặp vẽ khi canvas bị che khỏi vùng nhìn hoặc tab ở nền, rồi tiếp tục với state cũ khi nhìn thấy lại.

### 5.3. Divider: throttle theo frame, lưu khi commit

Pointer move ghi tọa độ mới nhất vào ref. Chỉ một callback `requestAnimationFrame` được xếp cho mỗi frame; callback cập nhật CSS custom property cho độ rộng chat. React không nhận một `setState` cho mỗi sự kiện pointer move.

Khoảng kéo được tính tương đối từ vị trí bắt đầu, nên click rồi thả mà không kéo không làm tỷ lệ nhảy. Khi pointer up, tọa độ cuối được flush trước khi commit. Khi cancel hoặc window blur, tỷ lệ trở về giá trị đã commit. Tỷ lệ chỉ được ghi vào `localStorage` khi hoàn tất thao tác hoặc điều chỉnh bằng bàn phím; không ghi storage liên tục trong lúc kéo. Storage bị chặn được xử lý bằng fallback mặc định.

Đây là **throttle theo frame**, không phải debounce chờ người học ngừng kéo. Debounce kiểu trì hoãn toàn bộ phản hồi sẽ làm divider bị trễ so với con trỏ.

### 5.4. Shared layout và motion

Framer Motion 12 được dùng cho chuyển động của shell và các thành phần giao diện. Việc đổi layout không cần một cặp renderer cùng mount chỉ để có shared-layout animation. Vùng hình học phải giữ tỷ lệ của nó; các hiệu ứng scale không được áp trực tiếp lên canvas đang tương tác.

Shell dùng `layoutId` ổn định và `layout="position"`, spring stiffness 300, damping 32, mass 1. Đây là chuyển tiếp vị trí của một surface đang tồn tại; kích thước thực do CSS/ResizeObserver cập nhật, không scale bản vẽ bằng FLIP. Khi drag, layout animation tắt để bám con trỏ. Nút nhấn dùng scale 0,98 với spring 420/32/1; thông báo mới fade 160 ms, y 4 px. Reduced motion bỏ dịch chuyển/scale và pulse, dùng fade tối đa 100 ms cho thông báo.

Recharts và Three.js nhận chiều cao qua CSS custom property theo container; JSXGraph được phép mở rộng vượt giới hạn 560 px khi ở workspace. Các widget khác vẫn giữ bố cục nội bộ hiện có và có thể cần cuộn trong panel.

### 5.5. Bundle size và tải theo nhu cầu

`MathCanvasHost` tải `MathVizRenderer` bằng `next/dynamic` với `ssr: false`. Dispatcher tiếp tục tải động từng widget MathViz như cấu trúc hiện có. Khi chưa có scene, host trả về rỗng và chưa mount renderer. MathLive vẫn nằm ở nhánh nhập công thức có tải động riêng.

Không thêm một thư viện đồ thị hoặc engine hình học vào runtime cho Đợt A. TypeScript, Playwright và công cụ chuyển Markdown sang PDF là dependency phát triển; script tạo PDF không được import vào cây ứng dụng. Các import từ Framer Motion dùng dependency v12 đã có trong dự án.

`InlineVideoPlayer` và các hàm dựng video/bảng minh họa cũ vẫn nằm trong `DuoMCBPage`. Đợt A chưa tách toàn bộ module lớn này thành các chunk độc lập. Chưa có số liệu bundle trước/sau được đo trong cùng môi trường production. Vì vậy, báo cáo không tuyên bố initial bundle nhỏ hơn, không đưa ra con số phần trăm giảm bundle hoặc cam kết FPS.

### 5.6. Scroll và viewport

Vùng transcript theo dõi khoảng cách đến cuối trước khi quyết định tự cuộn. `ResizeObserver` trên transcript/content xử lý thay đổi kích thước nội dung khi người học đang ở cuối; người đang đọc lịch sử giữ quyền kiểm soát vị trí đọc.

Việc đo container, cửa sổ, `visualViewport` và sự kiện `geometrychange` của MathLive được gom theo animation frame. MathLive phủ lên document.body nên cần bridge riêng; chỉ quan sát bàn phím native là chưa đủ. State viewport chỉ thay khi các giá trị liên quan thực sự khác. Preview mobile ưu tiên composer khi bàn phím chiếm chiều cao, trong khi vẫn giữ renderer của scene đang chọn.

## 6. Kiểm chứng và giới hạn bằng chứng

Các kết quả dưới đây được chạy trên checkout đã thay đổi, với Node 24.19.0, Next.js 16.1.6 và Chromium 145 qua Playwright 1.58.2. API chat được giả lập; không gọi model AI thật.

| Kiểm tra | Kết quả |
| --- | --- |
| `pnpm install --frozen-lockfile` | Đạt, exit code 0. |
| Cài Chromium cho Playwright | Đạt, exit code 0. |
| `node scripts/check-mathviz-extract.mjs` | Đạt **11/11** kiểm tra. |
| `node scripts/check-image-downscale.mjs` | Đạt **23/23** kiểm tra. |
| `node scripts/check-chat-errors.mjs` | Đạt **30/30** kiểm tra. |
| `pnpm typecheck:tutor` | Đạt, exit code 0; strict TypeScript cho module mới, JavaScript cũ không bật checkJs toàn cục. |
| ESLint workspace, integration, composer, tests và ba renderer | Đạt, **0 lỗi**; 2 cảnh báo dependency đã có sẵn: `totalFrames` trong InlineVideoPlayer và `data.params.d` trong Three.js. Chạy nhóm workspace và từng renderer trong tiến trình riêng. |
| Browser integration trên `/DuoMCB` | Đã xác nhận **12 kịch bản** bằng suite và các lượt kiểm tra riêng cho phần vừa sửa. Case renderer và chuyển hội thoại được chạy lại sau chỉnh sửa cuối; không có lỗi browser chưa xử lý trong các case này. |
| Production build Next.js | Đạt, exit code 0; TypeScript hợp lệ, prerender **274/274** trang, có route `/DuoMCB`. |
| Three API / MathViz vocabulary guards | Đạt **6/6** và **22/22**; API base guard cũng đạt. |
| Tạo PDF từ Markdown | Tạo bằng script đi kèm; kiểm tra text extraction và ảnh trang PDF để xác nhận dấu tiếng Việt và bố cục. |

Browser suite dùng API fixture xác định, không đo chất lượng trả lời của AI thật. Các hành vi đã được xác nhận gồm: giữ node renderer và giá trị slider qua nhập liệu/drag/collapse/expand; bố cục desktop/tablet/mobile; divider bằng bàn phím; không kéo người đang đọc lịch sử về cuối; mở đúng scene cũ; composer còn nằm trong vùng nhìn khi mô phỏng bàn phím cao 420 px và 220 px; bàn phím MathLive thật; phản hồi chậm của phiên cũ không ghi sang phiên mới; không gửi nhầm phiên trong lúc IndexedDB đang tải lịch sử; resize SVG JSXGraph và drawing buffer WebGL Three.js giữ node renderer.

Mô phỏng `visualViewport` trong browser automation không thay thế kiểm thử bàn phím iOS/Android thật. Kết quả trên máy phát triển không chứng minh 60 FPS trên mọi thiết bị. Các quan sát về resize và memoization trong báo cáo mô tả cơ chế đã viết, không tự suy ra mức tăng tốc đo được.

## 7. Những phần chưa thuộc Đợt A

- Đồng bộ ngữ nghĩa hai chiều giữa từ/công thức và entity trong hình.
- State tham số dùng chung giữa slider trong chat và widget.
- Progressive Socratic step protocol, tiered hints và chính sách XP mới.
- Contextual keypad, editor hỗn hợp văn bản/công thức và scratchpad.
- Lưu/khôi phục mọi camera, tham số và nét nháp khi chuyển scene hoặc tải lại trang.
- Benchmark FPS, latency và bundle delta trên thiết bị mục tiêu.

## 8. Lệnh cài đặt, kiểm tra và build PDF

Chạy từ root repo:

```bash
cd frontend
pnpm install --frozen-lockfile
pnpm exec playwright install chromium
pnpm typecheck:tutor
pnpm test:tutor
pnpm build
pnpm report:tutor
```

Dùng pnpm 10.26+ hoặc 11 để đọc cấu hình `allowBuilds`. Trên một máy Linux mới chưa có thư viện hệ thống cho Chromium, dùng `pnpm exec playwright install --with-deps chromium` thay cho lệnh cài browser đơn giản. Playwright config có thể tự chạy Next.js dev server local; API trong test được mock. `typecheck:tutor` chạy `next typegen` trước `tsc --noEmit` để có type route Next.js trên một checkout mới.

Script PDF đọc `docs/CHANGELOG_PERFORMANCE.md`, render Markdown bằng `marked`, dùng Chromium in khổ A4 và ghi `docs/CHANGELOG_PERFORMANCE.pdf`. Script xác định đường dẫn từ chính vị trí file, nên không phụ thuộc thư mục hiện tại. Font hệ thống được dùng để hiển thị tiếng Việt; không tải font hoặc hình từ website bên ngoài.

Để cập nhật báo cáo, sửa Markdown rồi chạy lại `pnpm report:tutor`, hoặc chạy trực tiếp `node scripts/build-workspace-report.mjs` từ thư mục `frontend/`. PDF là bản sinh từ nguồn; không chỉnh trực tiếp PDF để tránh nội dung lệch với Markdown.

### Ghi chú môi trường kiểm thử

Môi trường cloud của lần chạy này dùng CA hệ thống qua proxy. Lệnh Next build/browser được chạy với `NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1` để Next tải Google Fonts bằng CA tin cậy; không tắt kiểm tra TLS. Khi cần, dùng:

```bash
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 pnpm test:tutor
NEXT_TURBOPACK_EXPERIMENTAL_USE_SYSTEM_TLS_CERTS=1 NODE_OPTIONS=--max-old-space-size=4096 pnpm build
```

ESLint được chạy theo nhóm workspace và từng renderer lớn với heap 4 GB. Các lần chạy gộp đã hết bộ nhớ ở mức 2 GB và 4 GB; tách tiến trình giúp tránh tích lũy bộ nhớ của công cụ kiểm tra. Đây không phải phép đo RAM runtime của canvas.
