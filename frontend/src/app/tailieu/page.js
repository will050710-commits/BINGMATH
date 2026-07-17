"use client";
import { useState, useMemo } from "react";
import Link from "next/link";

const SHAPES = [
  { size: 100, left: "10%", top: "12%", delay: "0s", dur: "15s", color: "#14b8a6" },
  { size: 80, left: "80%", top: "8%", delay: "2s", dur: "18s", color: "#38bdf8" },
  { size: 120, left: "70%", top: "60%", delay: "4s", dur: "20s", color: "#a78bfa" },
  { size: 60, left: "15%", top: "75%", delay: "1s", dur: "12s", color: "#ec4899" }
];


const DOCUMENTS = [
  {
    title: "ToanMath THCS",
    desc: "Đề thi và chuyên đề Toán lớp 6, 7, 8, 9 có đáp án, bám sát chương trình phổ thông mới.",
    url: "https://thcs.toanmath.com",
    tag: "Tài liệu chuyên sâu",
    color: "#14b8a6",
    img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400"
  },
  {
    title: "ToanMath.com (THPT & Đại học)",
    desc: "Đề thi thử THPT Quốc gia, đề học sinh giỏi lớp 10, 11, 12 cực kỳ uy tín, cập nhật mỗi ngày.",
    url: "https://toanmath.com",
    tag: "Đề thi & Chuyên đề",
    color: "#38bdf8",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400"
  },
  {
    title: "Khan Academy Vietnam",
    desc: "Nền tảng học toán trực tuyến song ngữ với bài giảng tương tác và bài tập cá nhân hóa tại Việt Nam.",
    url: "https://vi.khanacademy.org",
    tag: "Video & Luyện tập",
    color: "#a78bfa",
    img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=400"
  },
  {
    title: "Khan Academy Math (Quốc tế)",
    desc: "Hệ thống bài tập phân loại theo kỹ năng dành cho học sinh tự ôn luyện của Khan Academy quốc tế.",
    url: "https://www.khanacademy.org/math",
    tag: "Kho bài tập quốc tế",
    color: "#a78bfa",
    img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400"
  },
  {
    title: "Math is Fun",
    desc: "Trang web học toán tiếng Anh trực quan sinh động nhất dành cho học sinh THCS.",
    url: "https://www.mathsisfun.com",
    tag: "Toán trực quan",
    color: "#fbbf24",
    img: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?q=80&w=400"
  },
  {
    title: "Wolfram|Alpha",
    desc: "Công cụ tính toán công thức đại số và giải tích từng bước mạnh mẽ hàng đầu thế giới.",
    url: "https://www.wolframalpha.com",
    tag: "Giải toán tự động",
    color: "#ef4444",
    img: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=400"
  },
  {
    title: "GeoGebra",
    desc: "Công cụ vẽ đồ thị, hình học động và đại số miễn phí, trực quan hóa mọi khái niệm toán học.",
    url: "https://www.geogebra.org",
    tag: "Công cụ trực quan",
    color: "#22c55e",
    img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400"
  },
  {
    title: "Desmos",
    desc: "Máy tính đồ thị trực tuyến mạnh mẽ, miễn phí, giúp vẽ và khám phá hàm số sinh động ngay trên trình duyệt.",
    url: "https://www.desmos.com",
    tag: "Máy tính đồ thị",
    color: "#06b6d4",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400"
  },
  {
    title: "VUIHOC.vn",
    desc: "Nền tảng học trực tuyến lớp 1-12 với bài giảng Toán bám sát SGK, giáo viên từ các trường điểm quốc gia.",
    url: "https://vuihoc.vn",
    tag: "Nền tảng luyện thi",
    color: "#f97316",
    img: "https://images.unsplash.com/photo-1427504494785-3a9ca7044f45?q=80&w=400"
  },
  {
    title: "HOC247",
    desc: "Kho bài giảng, đề kiểm tra và hỏi đáp bài tập Toán trực tuyến miễn phí cho học sinh K-12.",
    url: "https://hoc247.net",
    tag: "Bài giảng & Hỏi đáp",
    color: "#0ea5e9",
    img: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?q=80&w=400"
  },
  {
    title: "VnDoc.com",
    desc: "Kho đề thi, đề kiểm tra giữa kỳ, cuối kỳ môn Toán các cấp có đáp án chi tiết, cập nhật liên tục.",
    url: "https://vndoc.com",
    tag: "Kho đề kiểm tra",
    color: "#8b5cf6",
    img: "https://images.unsplash.com/photo-1616469829581-73993eb86b02?q=80&w=400"
  },
  {
    title: "MathX - Thầy Trần Hữu Hiếu",
    desc: "Bài giảng Toán sinh động cho học sinh Tiểu học & THCS, kèm ngân hàng câu hỏi luyện tập đa dạng.",
    url: "https://mathx.vn",
    tag: "Toán Tiểu học & THCS",
    color: "#ec4899",
    img: "https://images.unsplash.com/photo-1596496181848-3091d4878b24?q=80&w=400"
  },
  {
    title: "THI247.com",
    desc: "Chia sẻ đề kiểm tra, đề thi thử và tài liệu ôn thi THPT Quốc gia môn Toán cập nhật thường xuyên.",
    url: "https://thi247.com",
    tag: "Đề thi thử THPT",
    color: "#14b8a6",
    img: "https://images.unsplash.com/photo-1509228468518-180dd4864904?q=80&w=400"
  },
  {
    title: "Toán Học Bắc Trung Nam",
    desc: "Website chính thức của cộng đồng Toán Học Bắc Trung Nam - kho đề thi giữa kỳ, cuối kỳ, ôn thi lớn nhất Việt Nam.",
    url: "https://toanhocbactrungnam.vn",
    tag: "Kho đề thi cộng đồng",
    color: "#38bdf8",
    img: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=400"
  }
];

const CHANNELS = [
  // --- YOUTUBE CHANNELS (WITH VERIFIED VIDEOS) ---
  {
    name: "Thầy Nguyễn Quốc Chí",
    desc: "Kênh toán học siêu hài hước, thực chiến, cực kỳ thích hợp cho học sinh muốn lấy lại gốc và săn điểm 8+.",
    url: "https://www.youtube.com/thaynguyenquocchi",
    platform: "YouTube",
    videos: [
      { title: "Tìm nguyên hàm - Lớp 12 (Chương trình mới)", duration: "25:14", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=hh8oJi1gLcw", img: "https://img.youtube.com/vi/hh8oJi1gLcw/hqdefault.jpg" },
      { title: "Tính đơn điệu của hàm số - Toán 12", duration: "18:32", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=W_8aEs16RI0", img: "https://img.youtube.com/vi/W_8aEs16RI0/hqdefault.jpg" }
    ]
  },
  {
    name: "Thầy Nguyễn Tiến Đạt",
    desc: "Chuyên gia Casio và các phương pháp giải nhanh trắc nghiệm độc quyền giúp tối ưu thời gian làm bài thi trắc nghiệm.",
    url: "https://www.youtube.com/channel/UCTsP67iWrn3-5Sk7HnEE5Qg",
    platform: "YouTube",
    videos: [
      { title: "Mệnh đề toán học - Toán 10 hệ mới", duration: "15:20", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=N4SeBnHNzlA", img: "https://img.youtube.com/vi/N4SeBnHNzlA/hqdefault.jpg" },
      { title: "Các dạng toán cơ bản ăn điểm 8", duration: "22:10", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=rVj3VfLLni4", img: "https://img.youtube.com/vi/rVj3VfLLni4/hqdefault.jpg" },
      { title: "Kỹ thuật xử lý hàm hợp", duration: "19:45", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=kn8dUh8LrP0", img: "https://img.youtube.com/vi/kn8dUh8LrP0/hqdefault.jpg" }
    ]
  },
  {
    name: "Học Toán Thầy Chính (Nguyễn Công Chính)",
    desc: "Cung cấp đầy đủ bài giảng Toán chất lượng từ lớp 6 đến lớp 12, bám sát chương trình SGK mới.",
    url: "https://www.youtube.com/@thaynguyencongchinhtoan",
    platform: "YouTube",
    videos: [
      { title: "Hoán vị, chỉnh hợp, tổ hợp (Phần 1)", duration: "24:30", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=5rHMhcXCA6o", img: "https://img.youtube.com/vi/5rHMhcXCA6o/hqdefault.jpg" },
      { title: "Hoán vị, chỉnh hợp, tổ hợp (Phần 3)", duration: "26:15", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=uiR-0dIZXQo", img: "https://img.youtube.com/vi/uiR-0dIZXQo/hqdefault.jpg" },
      { title: "Mở đầu về đạo hàm", duration: "20:05", views: "Video bài giảng", link: "https://www.youtube.com/watch?v=zskRiTS3NnE", img: "https://img.youtube.com/vi/zskRiTS3NnE/hqdefault.jpg" }
    ]
  },

  // --- YOUTUBE CHANNELS (PROFILE-ONLY DIRECT LINK) ---
  {
    name: "3Blue1Brown",
    desc: "Khám phá vẻ đẹp trực quan của toán học qua các video hoạt họa tuyệt đẹp của Grant Sanderson.",
    url: "https://www.youtube.com/@3blue1brown",
    platform: "YouTube",
    note: "Chuỗi video hoạt họa nổi tiếng thế giới về đại số tuyến tính, giải tích, chuỗi Fourier và trực quan hóa toán học.",
    videos: []
  },
  {
    name: "Brian McLogan",
    desc: "Giải thích các chủ đề từ Lượng giác đến Đạo hàm siêu dễ hiểu bằng tiếng Anh.",
    url: "https://www.youtube.com/@BrianMcLogan",
    platform: "YouTube",
    note: "Kho video khổng lồ chữa từng dạng bài Algebra, Trigonometry, Calculus theo phong cách hỏi-đáp trực tiếp.",
    videos: []
  },
  {
    name: "Numberphile",
    desc: "Khám phá thế giới số học, các nghịch lý và vẻ đẹp kỳ diệu của toán học thực tế.",
    url: "https://www.youtube.com/@numberphile",
    platform: "YouTube",
    note: "Các video phỏng vấn nhà toán học, khám phá số Pi, tỷ lệ vàng, số nguyên tố theo cách kể chuyện lôi cuốn.",
    videos: []
  },
  {
    name: "VTV7 - Truyền hình Giáo dục Quốc gia",
    desc: "Kênh truyền hình giáo dục quốc gia với các chương trình học toán trực quan cho học sinh phổ thông.",
    url: "https://www.youtube.com/@VTV7tv",
    platform: "YouTube",
    note: "Chương trình dạy học trên truyền hình các môn học, trong đó có Toán, bám sát chương trình phổ thông.",
    videos: []
  },
  {
    name: "Mathologer",
    desc: "Những giải thích và chứng minh toán học cực kỳ lý thú, sâu sắc của nhà toán học Burkard Polster.",
    url: "https://www.youtube.com/@Mathologer",
    platform: "YouTube",
    note: "Video đi sâu vào bản chất các định lý, nghịch lý toán học nổi tiếng với hình ảnh minh họa cực kỳ trực quan.",
    videos: []
  },
  {
    name: "MindYourDecisions",
    desc: "Giải đố các nghịch lý toán học, các bài toán viral trên mạng xã hội và phương pháp tư duy game theory.",
    url: "https://www.youtube.com/@mindyourdecisions",
    platform: "YouTube",
    note: "Chuyên giải các bài toán gây tranh cãi trên mạng xã hội và các bài toán logic, xác suất thú vị.",
    videos: []
  },
  {
    name: "Thầy Hồng Trí Quang",
    desc: "Kênh luyện thi THPT Quốc gia môn Toán với phương pháp giảng dạy dễ hiểu, hệ thống hóa kiến thức rõ ràng.",
    url: "https://www.youtube.com/@HongTriQuang",
    platform: "YouTube",
    note: "Bài giảng chuyên đề Toán 12 và luyện thi tốt nghiệp THPT bám sát cấu trúc đề thi mới.",
    videos: []
  },
  {
    name: "MathX - Thầy Trần Hữu Hiếu (YouTube)",
    desc: "Kênh YouTube song hành cùng website MathX.vn, bài giảng Toán Tiểu học và THCS sinh động, dễ hiểu.",
    url: "https://www.youtube.com/channel/UCkSSjLdiQPbXAFUmw55WDQA",
    platform: "YouTube",
    note: "Video bài giảng theo chuyên đề, hỗ trợ học sinh Tiểu học và THCS luyện tập theo lộ trình rõ ràng.",
    videos: []
  },
  {
    name: "Toán Thầy Thế",
    desc: "Kênh luyện thi vào lớp 10 và ôn tập THCS với các chuyên đề đại số, hình học được hệ thống chi tiết.",
    url: "https://www.youtube.com/channel/UCp6h82zNkcHFN7iAdAmsjnw",
    platform: "YouTube",
    note: "Bài giảng ôn thi tuyển sinh lớp 10 và các chuyên đề Toán THCS theo từng dạng bài cụ thể.",
    videos: []
  },
  {
    name: "Học Toán Cùng Thầy Thắng",
    desc: "Kênh chia sẻ phương pháp học Toán tư duy, luyện giải đề cho học sinh THCS và THPT.",
    url: "https://www.youtube.com/@ThayThangTV",
    platform: "YouTube",
    note: "Video hướng dẫn tư duy giải toán và chữa đề thi theo chuyên đề, phù hợp học sinh nhiều trình độ.",
    videos: []
  },
  {
    name: "TOÁN THCS TV",
    desc: "Kênh tổng hợp bài giảng Toán THCS theo từng chương, từng bài bám sát sách giáo khoa hiện hành.",
    url: "https://www.youtube.com/channel/UC3eY_Fhi384WMNq6yKWiMRA",
    platform: "YouTube",
    note: "Danh sách phát bài giảng chia theo lớp 6, 7, 8, 9, tiện theo dõi theo chương trình học trên lớp.",
    videos: []
  },
  {
    name: "Thầy Đỗ Văn Đức (YouTube)",
    desc: "Kênh YouTube bài giảng bổ trợ, chia sẻ đề thi thử THPT và các mẹo giải Toán trắc nghiệm lớp 10, 11, 12.",
    url: "https://www.youtube.com/@thayduc",
    platform: "YouTube",
    note: "Video ôn thi đại học, giải đề trường chuyên và tuyển tập video ngắn bổ trợ Toán THPT.",
    videos: []
  },
  {
    name: "Thầy Nguyễn Phan Tiến",
    desc: "Kênh giảng giảng dạy chuyên đề Toán THPT lớp 9, 10, 11, 12 cực kỳ chi tiết, dễ tiếp thu.",
    url: "https://www.youtube.com/@Thay.NguyenPhanTien",
    platform: "YouTube",
    note: "Video giảng bài Nguyên Hàm Cơ Bản và các công thức ôn luyện Toán THPT.",
    videos: []
  },
  {
    name: "Thầy Nguyễn Đình Khiêm",
    desc: "Chuyên luyện thi môn Toán cho học sinh lớp 8, lớp 9 ôn thi vào lớp 10 chất lượng cao.",
    url: "https://www.youtube.com/@thaynguyendinhkhiemtoan89",
    platform: "YouTube",
    note: "Tổng hợp các bài giảng chuyên đề đại số, hình học phẳng ôn tập chuyển cấp lớp 9 lên 10.",
    videos: []
  },
  {
    name: "Toán Thầy Thịnh",
    desc: "Kênh bài giảng của Thạc sĩ Toán ĐHSP Hà Nội, truyền đạt kiến thức toán tư duy lý thú.",
    url: "https://www.youtube.com/c/toanthaythinh",
    platform: "YouTube",
    note: "Các video clip hướng dẫn tư duy toán học lý thuyết và bài tập giải đề nhanh chóng.",
    videos: []
  },
  {
    name: "Toán Thầy Định",
    desc: "Chuyên ôn thi vào lớp 10 các tỉnh thành, chữa chi tiết từng dạng bài từ rút gọn biểu thức, hệ phương trình đến hình học phẳng.",
    url: "https://www.youtube.com/@toanthayinh1592",
    platform: "YouTube",
    note: "Kho đề thi và bài tập kiểm tra chất lượng THCS ôn luyện chuyển cấp.",
    videos: []
  },
  {
    name: "Thầy Học Toán - Đặng Việt Hùng",
    desc: "Kênh ôn thi THPT Quốc gia hàng đầu, bài giảng chi tiết, rèn kỹ năng tự luận và trắc nghiệm tổng hợp.",
    url: "https://www.youtube.com/channel/UC7oSShIAaetKUZ-a4hYUhFw",
    platform: "YouTube",
    note: "Kênh chính thức của thầy Đặng Việt Hùng, bao gồm chuỗi video toán tư duy bồi dưỡng năng lực.",
    videos: []
  },
  {
    name: "Học Toán Online 247",
    desc: "Kênh tổng hợp bài giảng bám sát sách giáo khoa Toán Tiểu học & THCS cực kỳ chất lượng.",
    url: "https://www.youtube.com/c/hoctoanonline247",
    platform: "YouTube",
    note: "Video bài học bám sát chương trình phổ thông dành cho học sinh tự học ở nhà.",
    videos: []
  },
  {
    name: "Toán học Đam mê (Thầy Nguyễn Xuân Học)",
    desc: "Tập trung giảng dạy bản chất tư duy tự luận sâu sắc, ôn luyện tốt cho học sinh thi Đánh giá năng lực (HSA, APT).",
    url: "https://www.youtube.com/@toanhocdamme",
    platform: "YouTube",
    note: "Khóa ôn luyện bài bản, giải thích sâu sắc bản chất tư duy toán học lý thuyết và tự luận.",
    videos: []
  },
  {
    name: "Vted.vn (Thầy Nguyễn Minh Tuấn)",
    desc: "Kênh học thuật chuyên sâu toán vận dụng - vận dụng cao (9+) và luyện thi tốt nghiệp môn Toán chuyên THPT.",
    url: "https://www.youtube.com/vtedhoctoanonlinechatluongcao",
    platform: "YouTube",
    note: "Nơi cung cấp các bài giảng vận dụng cao cực chất lượng và các chuyên đề khó cho học sinh khá giỏi.",
    videos: []
  },
  {
    name: "Thầy Lê Anh Quân",
    desc: "Chuyên toán THPT, bài giảng bài bản, dễ hiểu từ cơ bản đến nâng cao cho học sinh cấp 3.",
    url: "https://www.youtube.com/@ThayLeAnhQuan",
    platform: "YouTube",
    note: "Các danh sách phát bài giảng lớp 10, 11, 12 chi tiết, dễ hiểu, bám sát sách giáo khoa.",
    videos: []
  },
  {
    name: "Học toán cùng cô Hồng Tươi",
    desc: "Bài giảng toán cấp 2 cực kỳ nhẹ nhàng, dễ hiểu, bám sát cấu trúc đề thi tuyển sinh lớp 10.",
    url: "https://www.youtube.com/@hoctoanconghongtuoi",
    platform: "YouTube",
    note: "Bài giảng ôn thi vào lớp 10, dạy học hình học phẳng và số học cấp 2 vô cùng sinh động.",
    videos: []
  },
  {
    name: "Tuyensinh247.com THCS",
    desc: "Kênh tổng hợp bài giảng của nhiều thầy cô giỏi, chia nhỏ bài giảng theo sát sách giáo khoa mới cấp 2.",
    url: "https://www.youtube.com/@tuyensinh247_thcs",
    platform: "YouTube",
    note: "Nền tảng học trực tuyến chất lượng cao của Tuyensinh247 dành cho học sinh THCS khối 6-9.",
    videos: []
  },
  {
    name: "TOÁN THẦY ĐẠT",
    desc: "Chuyên đề Toán THCS và THPT, tập trung mạnh vào các dạng bài kiểm tra học kỳ và luyện thi tuyển sinh vào lớp 10.",
    url: "https://www.youtube.com/@ToanThayDat",
    platform: "YouTube",
    note: "Bài giảng ôn thi giữa kỳ, cuối kỳ và đề thi tuyển sinh vào 10 đại trà lẫn trường chuyên.",
    videos: []
  },
  {
    name: "Học Toán Thầy Cường",
    desc: "Kênh hữu ích cho học sinh THCS, giảng giải chi tiết các bài toán đại số và hình học khó của cấp 2.",
    url: "https://www.youtube.com/@hoctoanthaycuong",
    platform: "YouTube",
    note: "Hỗ trợ học sinh cấp 2 củng cố kiến thức hình học phẳng và giải các bài tập nâng cao đại số.",
    videos: []
  },
  {
    name: "VietJack THCS / THPT",
    desc: "Hệ thống bài giảng miễn phí theo sát từng bài học trong sách giáo khoa mới (Cánh Diều, Kết Nối, Chân Trời).",
    url: "https://www.youtube.com/@vietjack",
    platform: "YouTube",
    note: "Kho tài liệu bài giải và video hướng dẫn học tập theo từng tiết học chính khóa trên lớp.",
    videos: []
  },
  {
    name: "HOCMAI - Học tốt THPT",
    desc: "Kênh của hệ thống giáo dục HOCMAI, một trong những nền tảng luyện thi trực tuyến lâu đời và lớn nhất Việt Nam.",
    url: "https://www.youtube.com/@hocmai",
    platform: "YouTube",
    note: "Bài giảng luyện thi tốt nghiệp THPT và ôn tập theo chuyên đề của đội ngũ giáo viên HOCMAI.",
    videos: []
  },

  // --- TIKTOK CHANNELS (PROFILE-ONLY DIRECT LINK) ---
  {
    name: "Thầy Đỗ Văn Đức (@thayductoan)",
    desc: "Chia sẻ các đoạn clip ngắn giải đề trắc nghiệm và câu hỏi toán học tư duy logic cực hay cho cấp 3.",
    url: "https://www.tiktok.com/@thayductoan",
    platform: "TikTok",
    note: "Tổng hợp các đoạn trích bài giảng trắc nghiệm chất lượng, hướng giải toán sáng tạo cho học sinh THPT.",
    videos: []
  },
  {
    name: "Học Toán Cùng Thầy Duy (@thayduytoan)",
    desc: "Chuyên trị các lỗi sai 'ngớ ngẩn' dễ mất điểm (bẫy tập xác định, bẫy tiệm cận) của học sinh cấp 3.",
    url: "https://www.tiktok.com/@thayduytoan",
    platform: "TikTok",
    note: "Video ngăn chặn sai lầm ngớ ngẩn (chống sai ngu) trong phòng thi toán trắc nghiệm THPT Quốc gia.",
    videos: []
  },
  {
    name: "Toán Thầy Tiến Casio (@toanthaytiencasio)",
    desc: "Kho tàng video chỉ mẹo bấm máy tính Casio 580VNX và 880BTG cho bài toán hàm số, tích phân khó.",
    url: "https://www.tiktok.com/@toanthaytiencasio",
    platform: "TikTok",
    note: "Hướng dẫn bấm máy Casio các chuyên đề nâng cao mũ, logarit, cực trị hàm số để đạt điểm 8, 9+.",
    videos: []
  },
  {
    name: "Cô Nga Toán (@congatoan)",
    desc: "Mẹo thuộc nhanh định lý hình học và công thức đại số lớp 8, 9 bằng thơ hoặc hình vẽ ngộ nghĩnh.",
    url: "https://www.tiktok.com/@congatoan",
    platform: "TikTok",
    note: "Video sáng tạo giúp ghi nhớ nhanh các hệ thức lượng và tính chất hình học THCS một cách trực quan, vui nhộn.",
    videos: []
  },
  {
    name: "Toán Cấp 2 Cực Dễ (@toancap2cucde)",
    desc: "Kênh video 60 giây giải nhanh bài toán tìm x, chứng minh hình học cho học sinh mất gốc cấp 2.",
    url: "https://www.tiktok.com/@toancap2cucde",
    platform: "TikTok",
    note: "Tập hợp các video ngắn giúp lấy lại gốc Toán lớp 6, 7, 8, 9 một cách nhanh chóng nhất.",
    videos: []
  },
  {
    name: "Thầy Toán Bảnh (@thaytoanbanh)",
    desc: "Chuyên bấm máy tính Casio thần tốc và các mẹo giải nhanh toán trắc nghiệm THPT.",
    url: "https://www.tiktok.com/@thaytoanbanh",
    platform: "TikTok",
    note: "Kênh video ngắn giải trí toán học, chia sẻ thủ thuật Casio bỏ túi, chống sai ngu cho học sinh thi tốt nghiệp THPT.",
    videos: []
  },
  {
    name: "Anh Giáo Học Toán (@anhgiaohoctoan)",
    desc: "Giải đáp các câu hỏi toán hay - lạ - khó và chia sẻ phương pháp học toán không nhàm chán cho cấp 3.",
    url: "https://www.tiktok.com/@anhgiaohoctoan",
    platform: "TikTok",
    note: "Tổng hợp các clip triệu view chữa bài nhanh, các thử thách tư duy logic toán học cho khối THPT.",
    videos: []
  },
  {
    name: "Học Toán Cùng Thầy Đạt (@hoctoancungthaydat)",
    desc: "Cung cấp mẹo tính nhẩm nhanh, công thức hình học THCS trực quan, dễ nhớ cho học sinh cấp 2.",
    url: "https://www.tiktok.com/@hoctoancungthaydat",
    platform: "TikTok",
    note: "Kênh chia sẻ mẹo học toán nhanh, kỹ thuật tính toán không cần máy tính vô cùng sinh động.",
    videos: []
  },
  {
    name: "Toán Vui Cô Hiền (@toanvuicohien)",
    desc: "Giải thích các bài toán đố vui lý thú, gỡ rối lỗi sai kinh điển học sinh THCS/THPT hay mắc phải.",
    url: "https://www.tiktok.com/@toanvuicohien",
    platform: "TikTok",
    note: "Tổng hợp các bài giảng ngắn chỉ ra lỗi sai phổ biến trong kỳ thi và các câu đố IQ toán học vui nhộn của cô Hiền.",
    videos: []
  },

  // --- FACEBOOK CHANNELS & COMMUNITIES ---
  {
    name: "Học Toán Thầy Đỗ Văn Đức (Fanpage)",
    desc: "Fanpage chính thức Học Toán Thầy Đỗ Văn Đức - TENSCHOOL. Luyện thi livestream chất lượng cao.",
    url: "https://www.facebook.com/dovanduc2023/?locale=vi_VN",
    platform: "Facebook / Web",
    note: "Chia sẻ tài liệu PDF 29 bài toán thực tế hay và khó, video livestream hướng dẫn phương pháp nhớ công thức Toán THPT. Facebook cá nhân: thayductoan.",
    videos: []
  },
  {
    name: "Học Toán Cùng Thủ Khoa",
    desc: "Trang chuyên chia sẻ kiến thức toán học, tài liệu giảng dạy ôn luyện cho học sinh Tiểu học và THCS.",
    url: "https://www.facebook.com/hoctoancungthukhoa/?locale=vi_VN",
    platform: "Facebook / Web",
    note: "Trang học thuật chia sẻ các mẹo học toán thông minh, tài liệu toán thi HSG cấp tiểu học và THCS.",
    videos: []
  },
  {
    name: "CLB Học thuật Khoa Toán - Tin học (HCMUS)",
    desc: "Câu lạc bộ học thuật dành cho học sinh chuyên toán và sinh viên ngành Toán - Tin học trường ĐH Khoa học Tự nhiên.",
    url: "https://www.facebook.com/clbhocthuattoantinHCMUS/",
    platform: "Facebook / Web",
    note: "Chia sẻ bài toán chuyên khảo sát, đại số tuyến tính, hình học giải tích và các sự kiện học thuật.",
    videos: []
  },
  {
    name: "Cộng đồng 2K8 Ôn thi Toán (Thầy Nguyễn Tiến Đạt)",
    desc: "Group học tập ôn luyện môn Toán của học sinh sinh năm 2008 cùng Thầy Nguyễn Tiến Đạt.",
    url: "https://www.facebook.com/groups/818685323017436/",
    platform: "Facebook / Web",
    note: "Cộng đồng trao đổi bài tập trắc nghiệm, tài liệu ôn thi chuyển cấp THPT dành riêng cho lứa tuổi 2k8.",
    videos: []
  },
  {
    name: "Thầy Hồ Thức Thuận",
    desc: "Giáo viên livestream dạy toán THPT có số lượng học sinh theo dõi hàng đầu, năng lượng cao và cuốn hút.",
    url: "https://www.facebook.com/thayhothucthuan",
    platform: "Facebook / Web",
    note: "Nơi thường xuyên tổ chức livestream chữa đề thi tốt nghiệp, đề giữa kỳ/cuối kỳ các trường trung học phổ thông cả nước.",
    videos: []
  },
  {
    name: "Tài Liệu Toán Học THPT (Group)",
    desc: "Cộng đồng chia sẻ file đề thi thử Toán THPT Quốc gia dưới dạng Word/PDF kèm lời giải chi tiết miễn phí.",
    url: "https://www.facebook.com/groups/tailieutoanthpt",
    platform: "Facebook / Web",
    note: "Kho đề thi thử cực lớn được đóng góp hàng ngày từ đội ngũ giáo viên Toán uy tín trên toàn quốc.",
    videos: []
  },
  {
    name: "Cộng Đồng Ôn Thi Đánh Giá Năng Lực (Group)",
    desc: "Chuyên chia sẻ các chuyên đề toán tư duy, toán logic theo định dạng cấu trúc đề thi HSA của ĐHQG HN & HCM.",
    url: "https://www.facebook.com/groups/onthidgnl",
    platform: "Facebook / Web",
    note: "Group thảo luận sôi nổi về phương pháp giải bài toán tư duy phi cấu trúc trong đề thi đánh giá năng lực.",
    videos: []
  },
  {
    name: "CLB Học Toán Cùng Thủ Khoa",
    desc: "Thường xuyên chia sẻ chuyên đề ôn thi vào 10 chuyên và không chuyên cực kỳ chất lượng.",
    url: "https://www.facebook.com/clbhocsinhgioitoan",
    platform: "Facebook / Web",
    note: "Fanpage học thuật do các thủ khoa trường chuyên sáng lập, chia sẻ kinh nghiệm ôn thi HSG và ôn thi lớp 10 chuyên toán.",
    videos: []
  },
  {
    name: "Đồng Hành Cùng Con Vào Lớp 10 Toán (Group)",
    desc: "Cập nhật cấu trúc đề thi, thông tin tuyển sinh vào lớp 10 môn Toán của các tỉnh thành trên cả nước.",
    url: "https://www.facebook.com/groups/donghanhvao10toan",
    platform: "Facebook / Web",
    note: "Diễn đàn trao đổi học tập lớn dành cho phụ huynh và học sinh lớp 9 ôn thi chuyển cấp.",
    videos: []
  },
  {
    name: "Thầy Toán Chuyên - Ôn Thi Vào 10",
    desc: "Chuyên sâu về hình học phẳng lớp 9 (tứ giác nội tiếp, tiếp tuyến) và bài toán bất đẳng thức lấy điểm 10.",
    url: "https://www.facebook.com/thaytoanchuyenonthivao10",
    platform: "Facebook / Web",
    note: "Fanpage chia sẻ các dạng bài toán hình học 9 hóc búa và các chuyên đề bất đẳng thức Cauchy, Bunyakovsky.",
    videos: []
  },
  {
    name: "Thầy Lí Quảng Lợi - Toán THPT",
    desc: "Livestream giải đề thi thử của các trường chuyên trên cả nước, đăng kèm tài liệu ôn tập chất lượng.",
    url: "https://www.facebook.com/thayliquangloitoanthpt",
    platform: "Facebook / Web",
    note: "Trang hỗ trợ ôn tập tốt nghiệp THPT và thi đánh giá năng lực, thường xuyên đăng tải file PDF đề ôn thi chuyên.",
    videos: []
  },
  {
    name: "Toán Học Bắc Trung Nam (Fanpage)",
    desc: "Cộng đồng chia sẻ file đề thi giữa kỳ, cuối kỳ, ôn thi chuyển cấp THCS và THPT lớn nhất Việt Nam. Đã xác minh: fanpage và website chính thức đang hoạt động.",
    url: "https://www.facebook.com/toanhocbactrungnam/",
    platform: "Facebook / Web",
    note: "Trang chia sẻ đề thi Toán Học Bắc Trung Nam. Website: toanhocbactrungnam.vn để tải tài liệu Word/PDF miễn phí.",
    videos: []
  },
  {
    name: "Toán Học Bắc Trung Nam - Nhóm THPT",
    desc: "Nhóm Facebook chính thức dành cho giáo viên và học sinh THPT thuộc cộng đồng Toán Học Bắc Trung Nam.",
    url: "https://www.facebook.com/groups/tailieudayhoc/",
    platform: "Facebook / Web",
    note: "Kho tài liệu, đề thi và giáo án Toán THPT được các thầy cô trên cả nước đóng góp hàng ngày.",
    videos: []
  },
  {
    name: "Toán Học Bắc Trung Nam - Nhóm THCS",
    desc: "Nhóm Facebook chính thức dành cho giáo viên và học sinh THCS thuộc cộng đồng Toán Học Bắc Trung Nam.",
    url: "https://www.facebook.com/groups/tailieuthcs/",
    platform: "Facebook / Web",
    note: "Kho tài liệu, đề kiểm tra và đề thi tuyển sinh lớp 10 dành riêng cho khối THCS.",
    videos: []
  },
  {
    name: "Nhóm Facebook trao đổi và chia sẻ tài liệu Toán THCS",
    desc: "Nơi các sĩ tử cấp 2 trao đổi bài tập khó, thảo luận đề thi tuyển sinh vào lớp 10 trên toàn quốc.",
    url: "https://www.facebook.com/groups/606419473051109/",
    platform: "Facebook / Web",
    note: "Nhóm Facebook trao đổi và chia sẻ tài liệu Toán THCS cho học sinh cấp 2 lớp 6-9.",
    videos: []
  }
];


export default function RecommendationsPage() {
  const [lang, setLang] = useState("vi");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [platformFilter, setPlatformFilter] = useState("All");
  const itemsPerPage = 3;

  const t = (vi, en) => (lang === "vi" ? vi : en);

  // Filter channels based on search query and platform filter
  const filteredChannels = useMemo(() => {
    return CHANNELS.filter(chan => {
      const matchesSearch =
        chan.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chan.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (chan.videos && chan.videos.some(vid => vid.title.toLowerCase().includes(searchQuery.toLowerCase())));
      
      const matchesPlatform = platformFilter === "All" || chan.platform.includes(platformFilter);
      return matchesSearch && matchesPlatform;
    });
  }, [searchQuery, platformFilter]);

  // Pagination Math
  const totalPages = Math.ceil(filteredChannels.length / itemsPerPage);
  const paginatedChannels = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredChannels.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredChannels, currentPage]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); // Reset to page 1 on search
  };

  const handlePlatformChange = (platform) => {
    setPlatformFilter(platform);
    setCurrentPage(1); // Reset to page 1 on filter
  };

  return (
    <div style={{ width: "100%", background: "#060610", minHeight: "100vh", position: "relative", overflow: "hidden", color: "white", paddingBottom: 80, fontFamily: "'Sora', sans-serif" }}>
      {/* Background shapes */}
      <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        {SHAPES.map((s, i) => (
          <div key={i} style={{
            position: "absolute", left: s.left, top: s.top, width: s.size, height: s.size,
            background: `radial-gradient(circle, ${s.color}22 0%, transparent 70%)`,
            borderRadius: "50%", filter: "blur(40px)"
          }} />
        ))}
      </div>

      {/* Main Container */}
      <div style={{ width: "1200px", maxWidth: "95%", margin: "0 auto", position: "relative", zIndex: 1, paddingTop: 40 }}>
        {/* Back button */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8, padding: "8px 16px",
              fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
            >
              ← {t("Trang chủ", "Home")}
            </div>
          </Link>

          {/* Bilingual Toggle */}
          <div style={{ display: "flex", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", padding: 4, borderRadius: 24 }}>
            {[["vi", "🇻🇳 Tiếng Việt"], ["en", "🇬🇧 English"]].map(([l, label]) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                style={{
                  background: lang === l ? "rgba(99,102,241,0.8)" : "none",
                  border: "none", color: lang === l ? "white" : "rgba(255,255,255,0.5)",
                  padding: "6px 16px", borderRadius: 20, cursor: "pointer",
                  fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Page Title */}
        <div style={{ marginBottom: 48 }}>
          <h1 style={{
            fontSize: "clamp(26px, 5vw, 42px)", fontWeight: 900,
            background: "linear-gradient(135deg, #ffffff 60%, #a5b4fc 100%)",
            WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
            marginBottom: 8
          }}>
            {t("Tài Nguyên Học Toán Song Ngữ", "Bilingual Math Resources")}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, marginBottom: 20 }}>
            {t("Đề xuất các trang web tài liệu chất lượng và kênh học tập sinh động trực quan", "Recommended websites and video channels for bilingual mathematics")}
          </p>
          <Link href="/tailieu/shorts" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 10,
              background: "linear-gradient(135deg, #7c3aed, #00d4ff)",
              border: "1px solid rgba(0, 212, 255, 0.3)",
              borderRadius: 12, padding: "12px 24px",
              fontSize: 14, fontWeight: 800, color: "white",
              cursor: "pointer", transition: "all 0.25s",
              boxShadow: "0 0 15px rgba(0,212,255,0.35)",
            }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = "0 0 25px rgba(0,212,255,0.6)"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 0 15px rgba(0,212,255,0.35)"; e.currentTarget.style.transform = "none"; }}
            >
              🎬 {t("Xem Reels Công Thức Toán Học", "Watch Math Formula Reels")} →
            </div>
          </Link>
        </div>

        {/* SECTION 1: KHUNG TÀI LIỆU (TL) */}
        <div style={{ marginBottom: 56 }}>
          <h2 style={{
            fontSize: 22, fontWeight: 800, color: "#14b8a6",
            borderBottom: "1px solid rgba(20,184,166,0.2)", paddingBottom: 10,
            marginBottom: 24, display: "flex", alignItems: "center", gap: 8
          }}>
            📚 {t("Tài Liệu Học Tập (TL)", "Study Documents (TL)")}
          </h2>
          <div className="recommendations-scroll-container" style={{
            display: "flex", gap: 20, overflowX: "auto", paddingBottom: 16,
            scrollbarWidth: "thin", scrollbarColor: "rgba(20,184,166,0.3) transparent"
          }}>
            {DOCUMENTS.map((doc, idx) => (
              <a
                key={idx} href={doc.url} target="_blank" rel="noopener noreferrer"
                style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}
              >
                <div
                  style={{
                    width: 280, height: 320, background: "rgba(255,255,255,0.03)",
                    backdropFilter: "blur(10px)", border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16, overflow: "hidden", display: "flex", flexDirection: "column",
                    transition: "all 0.3s cubic-bezier(0.2,0.8,0.2,1)", cursor: "pointer",
                    boxShadow: "0 8px 30px rgba(0,0,0,0.3)"
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.transform = "translateY(-8px) scale(1.02)";
                    e.currentTarget.style.borderColor = doc.color + "88";
                    e.currentTarget.style.boxShadow = `0 12px 30px ${doc.color}22`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = "none";
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.3)";
                  }}
                >
                  <img src={doc.img} alt={doc.title} style={{ width: "100%", height: 140, objectFit: "cover" }} />
                  <div style={{ padding: 20, flex: 1, display: "flex", flexDirection: "column" }}>
                    <div style={{
                      alignSelf: "flex-start", background: `${doc.color}15`, color: doc.color,
                      border: `1px solid ${doc.color}33`, fontSize: 10, fontWeight: 800,
                      padding: "3px 10px", borderRadius: 20, marginBottom: 12, textTransform: "uppercase"
                    }}>
                      {doc.tag}
                    </div>
                    <h3 style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>{doc.title}</h3>
                    <p style={{ fontSize: 12.5, color: "rgba(255,255,255,0.5)", lineHeight: 1.5, margin: 0 }}>{doc.desc}</p>
                    <div style={{ marginTop: "auto", fontSize: 12, fontWeight: 700, color: doc.color, display: "flex", alignItems: "center", gap: 4 }}>
                      {t("Ghé thăm trang", "Visit site")} ›
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* SECTION 2: KHUNG VIDEO (vid) */}
        <div>
          <h2 style={{
            fontSize: 22, fontWeight: 800, color: "#38bdf8",
            borderBottom: "1px solid rgba(56,189,248,0.2)", paddingBottom: 10,
            marginBottom: 24, display: "flex", alignItems: "center", gap: 8
          }}>
            🎬 {t("Kênh Học Toán (vid)", "Math Channels (vid)")}
          </h2>

          {/* Search bar & Filter Panel */}
          <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 16,
            alignItems: "center",
            justifyContent: "space-between",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 20px",
            borderRadius: 12,
            marginBottom: 32
          }}>
            {/* Search Input */}
            <div style={{ position: "relative", flex: 1, minWidth: "280px" }}>
              <span style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: "rgba(255,255,255,0.4)", fontSize: 14 }}>🔍</span>
              <input
                type="text"
                placeholder={t("Tìm kiếm Kênh hoặc Video...", "Search for Channels or Videos...")}
                value={searchQuery}
                onChange={handleSearchChange}
                style={{
                  width: "100%",
                  padding: "10px 16px 10px 40px",
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  color: "white",
                  fontSize: 14,
                  outline: "none",
                  transition: "all 0.2s"
                }}
                onFocus={e => {
                  e.target.style.borderColor = "#38bdf8";
                  e.target.style.background = "rgba(255,255,255,0.07)";
                }}
                onBlur={e => {
                  e.target.style.borderColor = "rgba(255,255,255,0.08)";
                  e.target.style.background = "rgba(255,255,255,0.04)";
                }}
              />
            </div>

            {/* Platform Filter Buttons */}
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["All", "YouTube", "TikTok", "Facebook"].map(p => (
                <button
                  key={p}
                  onClick={() => handlePlatformChange(p)}
                  style={{
                    background: platformFilter === p ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.03)",
                    border: platformFilter === p ? "1px solid rgba(56,189,248,0.5)" : "1px solid rgba(255,255,255,0.06)",
                    color: platformFilter === p ? "#38bdf8" : "rgba(255,255,255,0.6)",
                    padding: "6px 14px",
                    borderRadius: 6,
                    cursor: "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                  onMouseEnter={e => {
                    if (platformFilter !== p) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (platformFilter !== p) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                    }
                  }}
                >
                  {p === "Facebook" ? "Facebook / Web" : p}
                </button>
              ))}
            </div>
          </div>

          {/* Channels list with pagination */}
          <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
            {paginatedChannels.length > 0 ? (
              paginatedChannels.map((chan, idx) => (
                <div key={idx} style={{
                  background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)",
                  borderRadius: 16, padding: 24, boxShadow: "0 4px 20px rgba(0,0,0,0.15)"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, flexWrap: "wrap", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <h3 style={{ fontSize: 20, fontWeight: 800, color: "white", margin: 0 }}>{chan.name}</h3>
                        <span style={{
                          fontSize: 9,
                          fontWeight: 900,
                          padding: "2px 8px",
                          borderRadius: 4,
                          background: chan.platform === "YouTube" ? "rgba(239,68,68,0.15)" : chan.platform === "TikTok" ? "rgba(0,0,0,0.3)" : "rgba(59,130,246,0.15)",
                          border: `1px solid ${chan.platform === "YouTube" ? "rgba(239,68,68,0.3)" : chan.platform === "TikTok" ? "rgba(255,255,255,0.15)" : "rgba(59,130,246,0.3)"}`,
                          color: chan.platform === "YouTube" ? "#f87171" : chan.platform === "TikTok" ? "#fff" : "#60a5fa",
                        }}>
                          {chan.platform}
                        </span>
                      </div>
                      <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13.5, marginTop: 4, marginBottom: 0 }}>{chan.desc}</p>
                    </div>
                    <a href={chan.url} target="_blank" rel="noopener noreferrer" style={{
                      textDecoration: "none", background: "rgba(56,189,248,0.12)", color: "#38bdf8",
                      border: "1px solid rgba(56,189,248,0.3)", borderRadius: 8, padding: "6px 14px",
                      fontSize: 12, fontWeight: 700, transition: "all 0.2s"
                    }}
                      onMouseEnter={e => { e.currentTarget.style.background = "#38bdf8"; e.currentTarget.style.color = "black"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "rgba(56,189,248,0.12)"; e.currentTarget.style.color = "#38bdf8"; }}
                    >
                      {t("Ghé kênh", "Visit channel")} ↗
                    </a>
                  </div>

                  {/* Horizontal scroll of videos — Only rendered for YouTube channels */}
                  {chan.platform === "YouTube" && chan.videos && chan.videos.length > 0 ? (
                    <div style={{
                      display: "flex", gap: 16, overflowX: "auto", paddingBottom: 8,
                      scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.1) transparent"
                    }}>
                      {chan.videos.map((vid, vIdx) => (
                        <a
                          key={vIdx} href={vid.link} target="_blank" rel="noopener noreferrer"
                          style={{ textDecoration: "none", color: "inherit", flexShrink: 0 }}
                        >
                          <div
                            style={{
                              width: 220, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)",
                              borderRadius: 12, overflow: "hidden", transition: "all 0.2s"
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
                              e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                            }}
                          >
                            <div style={{ position: "relative", height: 110, background: "#0a0a14" }}>
                              <img src={vid.img} alt={vid.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                              <div style={{
                                position: "absolute", bottom: 6, right: 6, background: "black",
                                color: "white", fontSize: 10, padding: "2px 6px", borderRadius: 4, fontWeight: 700
                              }}>
                                {vid.duration}
                              </div>
                            </div>
                            <div style={{ padding: 12 }}>
                              <h4 style={{ fontSize: 13, fontWeight: 700, color: "white", margin: "0 0 6px 0", height: 36, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
                                {vid.title}
                              </h4>
                              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{vid.views}</span>
                            </div>
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    /* Display styled note for TikTok/Facebook/Web sharing platforms */
                    <div style={{
                      padding: "16px 20px",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px dashed rgba(255,255,255,0.08)",
                      borderRadius: 10,
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      marginTop: 10
                    }}>
                      <span style={{ fontSize: 24 }}>💡</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>
                          {t("Xem nội dung trực tiếp trên ứng dụng", "View content directly on their application")}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", marginTop: 2 }}>
                          {chan.note || t("Ghé thăm trang để xem các video ngắn, bài viết chia sẻ mẹo học toán nhanh!", "Visit page to see short videos and math tips!")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div style={{ textAlign: "center", padding: "48px 0", color: "rgba(255,255,255,0.4)" }}>
                <span style={{ fontSize: 32 }}>🔍</span>
                <p style={{ marginTop: 12 }}>{t("Không tìm thấy kênh học tập nào phù hợp.", "No matching learning channels found.")}</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, marginTop: 16 }}>
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: currentPage === 1 ? "rgba(255,255,255,0.2)" : "white",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: currentPage === 1 ? "default" : "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                >
                  ← {t("Trước", "Prev")}
                </button>

                {Array.from({ length: totalPages }).map((_, idx) => {
                  const pNum = idx + 1;
                  return (
                    <button
                      key={pNum}
                      onClick={() => setCurrentPage(pNum)}
                      style={{
                        background: currentPage === pNum ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.03)",
                        border: currentPage === pNum ? "1px solid rgba(56,189,248,0.5)" : "1px solid rgba(255,255,255,0.06)",
                        color: currentPage === pNum ? "#38bdf8" : "white",
                        width: 32,
                        height: 32,
                        borderRadius: 6,
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        transition: "all 0.2s"
                      }}
                    >
                      {pNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    color: currentPage === totalPages ? "rgba(255,255,255,0.2)" : "white",
                    padding: "8px 12px",
                    borderRadius: 6,
                    cursor: currentPage === totalPages ? "default" : "pointer",
                    fontSize: 12,
                    fontWeight: 700,
                    transition: "all 0.2s"
                  }}
                >
                  {t("Sau", "Next")} →
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
