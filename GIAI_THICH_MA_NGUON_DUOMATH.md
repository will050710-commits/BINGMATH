# Tài liệu giải thích mã nguồn dự án DuoMath

## 1. Tổng quan dự án

DuoMath là một nền tảng học toán trực tuyến dành cho học sinh THPT, được xây dựng nhằm mang đến trải nghiệm học tập hiện đại, trực quan và có tính tương tác cao. Hệ thống không chỉ cung cấp nội dung học tập mà còn tích hợp nhiều tính năng như:

- học bài theo chủ đề,
- làm bài kiểm tra và theo dõi kết quả,
- tham gia các trò chơi toán học và bảng xếp hạng,
- trò chuyện với trợ lý AI để được hướng dẫn giải toán,
- theo dõi tiến trình học tập cá nhân.

Mục tiêu chính của dự án là biến việc học toán từ việc tiếp thu thụ động thành một quá trình tương tác, có phản hồi nhanh và có động lực học tập rõ ràng.

---

## 2. Mục tiêu của hệ thống

Dự án được thiết kế để giải quyết ba vấn đề chính:

1. Cung cấp một nền tảng học toán trực tuyến dễ sử dụng cho học sinh.
2. Kết hợp nhiều tính năng như bài học, bài kiểm tra, trò chơi và chatbot AI trong cùng một hệ thống.
3. Tạo ra một sản phẩm có thể mở rộng trong tương lai, dễ bảo trì và phù hợp cho mục đích đánh giá sản phẩm công nghệ.

---

## 3. Kiến trúc tổng thể của hệ thống

DuoMath được xây dựng theo mô hình client-server, gồm hai phần chính:

- Frontend: giao diện người dùng, được xây dựng bằng Next.js và React.
- Backend: xử lý logic nghiệp vụ, xác thực người dùng, lưu trữ dữ liệu và kết nối với AI.

Hệ thống sử dụng các công nghệ chính sau:

- Next.js cho giao diện web hiện đại và tối ưu trải nghiệm người dùng,
- FastAPI cho API server nhanh, rõ cấu trúc và dễ mở rộng,
- SQLite làm cơ sở dữ liệu nhẹ, phù hợp với quy mô dự án,
- Firebase để hỗ trợ đăng nhập và xác thực,
- Groq API để cung cấp trí tuệ nhân tạo cho trợ lý học tập.

---

## 4. Cấu trúc thư mục chính

### Frontend

Thư mục chính của giao diện nằm tại [frontend](frontend).

Các thư mục quan trọng gồm:

- [frontend/src/app](frontend/src/app): chứa các trang chính của website.
- [frontend/src/components](frontend/src/components): chứa các component giao diện như trang chủ, modal, carousel và các thành phần UI.
- [frontend/src/context](frontend/src/context): chứa các provider quản lý trạng thái chung như đăng nhập và dữ liệu học tập.
- [frontend/src/utils](frontend/src/utils): chứa các hàm tiện ích dùng chung cho nhiều phần của hệ thống.

### Backend

Backend nằm tại [backend](backend).

Các file quan trọng gồm:

- [backend/main.py](backend/main.py): file chính xử lý toàn bộ API và logic hệ thống.
- [backend/requirements.txt](backend/requirements.txt): liệt kê các thư viện cần thiết.
- [backend/render.yaml](backend/render.yaml): cấu hình deploy lên Render.

---

## 5. Giải thích mã nguồn phía Frontend

### 5.1 Vai trò của Frontend

Frontend là phần trực tiếp tương tác với người dùng. Nó chịu trách nhiệm hiển thị toàn bộ giao diện, cho phép người dùng:

- xem trang chủ,
- đăng nhập hoặc đăng ký,
- làm bài tập và xem thống kê,
- tương tác với chatbot AI,
- theo dõi tiến độ học tập.

### 5.2 File khởi động chính

File [frontend/src/app/page.js](frontend/src/app/page.js) là trang đầu tiên được tải khi người dùng mở website. File này có vai trò rất đơn giản nhưng rất quan trọng: nó gọi component chính của trang chủ để hiển thị trên giao diện.

### 5.3 Component trang chủ

File [frontend/src/components/trangchu/TrangChuForm.js](frontend/src/components/trangchu/TrangChuForm.js) là một trong những file quan trọng nhất của frontend. File này xây dựng toàn bộ giao diện trang chủ và gồm nhiều chức năng khác nhau:

- hiển thị tiêu đề chính bằng hiệu ứng chuyển động,
- tạo carousel các tính năng chính để người dùng có thể kéo qua lại,
- hiển thị thông tin người dùng và menu hồ sơ cá nhân,
- hiện các thống kê học tập như số bài làm, điểm trung bình, XP và streak,
- điều khiển các modal như chỉnh sửa hồ sơ và mở rương tri thức,
- tạo các hiệu ứng animation và giao diện hiện đại.

Ở mức code, component này sử dụng React hooks như useState, useEffect và useCallback để quản lý trạng thái và cập nhật giao diện khi người dùng thao tác. Ví dụ, khi người dùng kéo carousel, hệ thống thay đổi chỉ số hoạt động hiện tại để đổi card hiển thị. Khi người dùng nhấn mở rương tri thức, hệ thống gọi API và cập nhật kết quả sau khi nhận phản hồi từ server.

Một số hàm cụ thể trong file này có thể được nêu rõ như sau:

- `FadeInTitle(...)`: dùng để tạo hiệu ứng tiêu đề xuất hiện từ từ bằng animation.
- `getInitials(...)`: tạo chữ viết tắt từ tên người dùng để hiển thị avatar.
- `UserAvatar(...)`: render avatar người dùng, hỗ trợ cả ảnh và chữ viết tắt khi chưa có ảnh.
- `FeatureSwipeCarousel(...)`: điều khiển carousel các tính năng, hỗ trợ kéo chuột, chạm màn hình và chuyển slide.
- `fetchLeaderboard()`: gọi API để lấy dữ liệu bảng xếp hạng và cập nhật giao diện.
- `handleOpenGacha()`: xử lý logic mở rương tri thức, kiểm tra điều kiện XP trước khi gọi API.
- `handleSignOut()`: xử lý đăng xuất và điều hướng về trang chủ.

Những hàm này cho thấy frontend không chỉ là giao diện đẹp mà còn chứa logic nghiệp vụ tương tác với người dùng.

### 5.4 Quản lý trạng thái

Dự án sử dụng các context để quản lý dữ liệu chung cho toàn ứng dụng:

- [frontend/src/context/authContext.js](frontend/src/context/authContext.js): quản lý thông tin người dùng, trạng thái đăng nhập, token và các thống kê cá nhân.
- [frontend/src/context/MathMapStore.js](frontend/src/context/MathMapStore.js): quản lý dữ liệu bản đồ học tập và các thông tin liên quan đến lộ trình học.

Cách làm này giúp cho các component khác có thể lấy dữ liệu người dùng mà không cần truyền props qua nhiều tầng component, làm cho mã nguồn gọn hơn và dễ bảo trì hơn.

### 5.5 Giao diện thân thiện và hiện đại

Frontend có nhiều yếu tố thiết kế chuyên nghiệp như:

- nền kính mờ (glassmorphism),
- màu sắc gradient hiện đại,
- hiệu ứng chuyển động mượt mà,
- carousel có thể kéo bằng chuột hoặc chạm màn hình,
- modal và nút bấm có animation.

Những yếu tố này giúp ứng dụng trông hấp dẫn, tạo cảm giác chuyên nghiệp và phù hợp với mục tiêu giáo dục hiện đại.

---

## 6. Giải thích mã nguồn phía Backend

### 6.1 Vai trò của Backend

Backend là trái tim của hệ thống. Nó thực hiện ba vai trò chính:

1. Xử lý yêu cầu từ frontend.
2. Xác thực người dùng và bảo mật hệ thống.
3. Tương tác với cơ sở dữ liệu và các dịch vụ AI.

### 6.2 File chính: backend/main.py

File [backend/main.py](backend/main.py) là file trung tâm của hệ thống. Trong file này, backend thực hiện nhiều chức năng quan trọng như:

- tạo và kiểm tra JWT token,
- xác thực người dùng bằng JWT hoặc Firebase,
- kết nối với SQLite,
- xử lý các endpoint API,
- gọi API AI của Groq,
- lưu trữ lịch sử trò chuyện, kết quả học tập và thống kê người dùng.

Nếu nhìn theo cách đơn giản, file này có thể được hiểu như "bộ não" của hệ thống: mọi dữ liệu đi vào và đi ra đều phải qua đây.

Một số hàm quan trọng trong file này có thể được giải thích như sau:

- `create_access_token(...)` và `create_refresh_token(...)`: tạo token xác thực cho người dùng khi đăng nhập.
- `decode_token(...)`: kiểm tra tính hợp lệ của token và lấy thông tin người dùng từ token.
- `verify_firebase_token(...)`: xác minh token từ Firebase để hỗ trợ đăng nhập qua Google/Firebase.
- `resolve_user_id(...)`: xác định đúng ID người dùng trong hệ thống dù người dùng đăng nhập bằng JWT nội bộ hay Firebase.
- `verify_admin(...)`: kiểm tra quyền quản trị viên trước khi cho phép truy cập các endpoint quản trị.
- các endpoint như `@app.post("/api/login")`, `@app.post("/api/signup")`, `@app.post("/api/chat")`: xử lý các nghiệp vụ đăng nhập, đăng ký và trò chuyện AI.

Những hàm này cho thấy backend không chỉ là nơi lưu dữ liệu mà còn là nơi điều phối toàn bộ logic nghiệp vụ của hệ thống.

### 6.3 Xử lý xác thực

Một phần rất quan trọng trong mã nguồn là chức năng xác thực người dùng. Backend có thể:

- xác thực token do hệ thống tự tạo,
- hoặc xác thực token từ Firebase.

Điều này cho phép ứng dụng hỗ trợ nhiều cách đăng nhập khác nhau nhưng vẫn giữ được sự an toàn cho dữ liệu người dùng.

### 6.4 Quản lý dữ liệu

Backend sử dụng SQLite để lưu trữ dữ liệu như:

- thông tin người dùng,
- kết quả bài kiểm tra,
- lịch sử trò chơi,
- hội thoại với AI,
- thống kê học tập.

SQLite được chọn vì phù hợp với quy mô dự án: nhẹ, dễ triển khai và không đòi hỏi phải cài đặt máy chủ database riêng.

### 6.5 API của hệ thống

Backend cung cấp nhiều endpoint cho frontend, ví dụ như:

- đăng nhập và đăng ký,
- lấy thông tin cá nhân,
- gửi kết quả bài kiểm tra,
- lấy thống kê người dùng,
- tạo và lưu lịch sử hội thoại với AI,
- gọi trợ lý toán học.

Những endpoint này giúp frontend không cần trực tiếp xử lý dữ liệu phức tạp, mà chỉ cần gửi yêu cầu và nhận kết quả từ server.

### 6.6 Tích hợp AI

Một tính năng nổi bật của hệ thống là trợ lý AI. Backend có thể đưa câu hỏi của học sinh đến mô hình AI để trả lời theo ngữ cảnh toán học. Đây là phần làm cho sản phẩm khác biệt so với một website học tập thông thường.

AI trong hệ thống được dùng để:

- giải thích khái niệm toán học,
- hỗ trợ học sinh khi gặp khó khăn,
- trả lời câu hỏi theo hướng dẫn nhẹ nhàng và dễ hiểu.

---

## 7. Luồng hoạt động chính của ứng dụng

### 7.1 Luồng đăng nhập

1. Người dùng nhập thông tin đăng nhập trên frontend.
2. Frontend gửi dữ liệu đến backend.
3. Backend kiểm tra thông tin người dùng.
4. Nếu hợp lệ, backend tạo token và trả về cho frontend.
5. Frontend lưu token và sử dụng cho các request tiếp theo.

### 7.2 Luồng làm bài kiểm tra

1. Người dùng chọn bài tập hoặc bài kiểm tra.
2. Frontend gửi request để lấy thông tin bài.
3. Backend trả về nội dung câu hỏi.
4. Người dùng làm bài và nộp kết quả.
5. Backend lưu kết quả vào cơ sở dữ liệu và tính toán thống kê.

### 7.3 Luồng hỏi trợ lý AI

1. Người dùng nhập câu hỏi vào chatbot.
2. Frontend gửi câu hỏi đến backend.
3. Backend kết nối với mô hình AI.
4. AI trả lời và backend gửi phản hồi về cho người dùng.
5. Lịch sử hội thoại có thể được lưu lại để tiện theo dõi.

---

## 8. Điểm mạnh của mã nguồn

### Ưu điểm nổi bật

- Mã nguồn có cấu trúc rõ ràng, tách riêng frontend và backend.
- Dễ mở rộng thêm tính năng mới.
- Có tích hợp nhiều công nghệ hiện đại như AI, authentication, animation và dashboard.
- Giao diện được thiết kế hiện đại và thân thiện với người dùng.
- Backend có thể hoạt động hiệu quả với dữ liệu nhẹ như SQLite.

### Đặc điểm phù hợp cho học tập và đánh giá

- Có thể dễ dàng trình bày cho người khác hiểu về kiến trúc hệ thống.
- Mã nguồn thể hiện được tư duy phát triển sản phẩm thực tế.
- Kết hợp cả phần giao diện lẫn logic backend, phù hợp với một đồ án ứng dụng web toàn diện.

---

## 9. Những điểm cần chú ý khi đánh giá

Khi xem xét dự án, giám khảo có thể chú ý đến các khía cạnh sau:

- tính đầy đủ của chức năng,
- sự rõ ràng trong cấu trúc mã nguồn,
- khả năng mở rộng,
- trải nghiệm người dùng,
- mức độ tích hợp công nghệ mới,
- khả năng bảo mật và xử lý dữ liệu.

DuoMath đáp ứng được khá đầy đủ các yếu tố này nhờ việc kết hợp nhiều thành phần quan trọng của một ứng dụng web hiện đại.

---

## 10. Kết luận

DuoMath là một dự án web học toán toàn diện, kết hợp nhiều công nghệ hiện đại để tạo ra một nền tảng học tập trực tuyến hiệu quả và hấp dẫn. Với kiến trúc tách biệt giữa frontend và backend, cùng việc tích hợp AI, authentication và dữ liệu thống kê, hệ thống cho thấy tính thực tế, tính sáng tạo và khả năng phát triển lâu dài.

Tài liệu này được viết nhằm giúp người đọc hiểu rõ hơn về cách dự án được xây dựng, các thành phần chính và luồng hoạt động của hệ thống một cách dễ hiểu, logic và phù hợp để trình bày cho giám khảo.
