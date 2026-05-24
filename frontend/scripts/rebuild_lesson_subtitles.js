const fs = require("fs");
const path = require("path");

const lessonDir = path.join(__dirname, "..", "src", "components", "Cacbaitoan10");

const lessonMeta = {
  "Lesson1_MenhDe.js": ["mathematical propositions", "mệnh đề toán học", ["truth value", "giá trị chân lý"], ["negation", "phủ định"], ["implication", "mệnh đề kéo theo"]],
  "Lesson2_TapHop.js": ["sets", "tập hợp", ["element", "phần tử"], ["subset", "tập con"], ["set notation", "ký hiệu tập hợp"]],
  "Lesson3_PhepToanTapHop.js": ["set operations", "phép toán tập hợp", ["union", "phép hợp"], ["intersection", "phép giao"], ["complement", "phần bù"]],
  "OnTapChuong1.js": ["propositions and sets", "mệnh đề và tập hợp", ["logic", "logic"], ["set notation", "ký hiệu tập hợp"], ["review strategy", "chiến lược ôn tập"]],
  "Lesson4_BPTBacNhatHaiAn.js": ["linear inequalities in two variables", "bất phương trình bậc nhất hai ẩn", ["solution region", "miền nghiệm"], ["boundary line", "đường biên"], ["half-plane", "nửa mặt phẳng"]],
  "Lesson5_HeBPTBacNhatHaiAn.js": ["systems of linear inequalities", "hệ bất phương trình bậc nhất hai ẩn", ["feasible region", "miền nghiệm chung"], ["constraint", "điều kiện ràng buộc"], ["intersection", "giao của các miền"]],
  "Lesson6_OnTapChuong2.js": ["linear inequality review", "ôn tập bất phương trình bậc nhất", ["graphing", "biểu diễn hình học"], ["solution region", "miền nghiệm"], ["system", "hệ bất phương trình"]],
  "Lesson7_HamSoVaDoThi.js": ["functions and graphs", "hàm số và đồ thị", ["domain", "tập xác định"], ["range", "tập giá trị"], ["graph", "đồ thị"]],
  "Lesson8_HamSoBacHai.js": ["quadratic functions", "hàm số bậc hai", ["parabola", "parabol"], ["vertex", "đỉnh"], ["axis of symmetry", "trục đối xứng"]],
  "Lesson9_GiaTriLuongGiac.js": ["trigonometric values", "giá trị lượng giác", ["sine", "sin"], ["cosine", "cos"], ["unit circle", "đường tròn lượng giác"]],
  "Lesson10_DinhLiCosin.js": ["law of cosines", "định lý cosin", ["included angle", "góc xen giữa"], ["triangle side", "cạnh tam giác"], ["formula", "công thức"]],
  "Lesson11_DinhLiSin.js": ["law of sines", "định lý sin", ["sine ratio", "tỉ số sin"], ["circumradius", "bán kính đường tròn ngoại tiếp"], ["ambiguous case", "trường hợp không xác định duy nhất"]],
  "Lesson12_GiaiTamGiac.js": ["solving triangles", "giải tam giác", ["triangle data", "dữ kiện tam giác"], ["trigonometry", "lượng giác"], ["application", "ứng dụng"]],
  "OnTapChuong4.js": ["triangle trigonometry review", "ôn tập hệ thức lượng trong tam giác", ["law of cosines", "định lý cosin"], ["law of sines", "định lý sin"], ["application", "bài toán ứng dụng"]],
  "Lesson13_KhaiNiemVecto.js": ["vectors", "véc-tơ", ["magnitude", "độ dài"], ["direction", "hướng"], ["directed segment", "đoạn thẳng có hướng"]],
  "Lesson14_TongHieuVecto.js": ["vector addition and subtraction", "tổng và hiệu véc-tơ", ["sum", "tổng"], ["difference", "hiệu"], ["parallelogram rule", "quy tắc hình bình hành"]],
  "Lesson15_TichSoVecto.js": ["scalar multiplication of vectors", "tích của một số với véc-tơ", ["scalar", "số thực"], ["same direction", "cùng hướng"], ["opposite direction", "ngược hướng"]],
  "Lesson16_TichVoHuong.js": ["dot product", "tích vô hướng", ["angle between vectors", "góc giữa hai véc-tơ"], ["projection", "hình chiếu"], ["perpendicular vectors", "véc-tơ vuông góc"]],
  "Lesson17_OnTapChuong5.js": ["vector review", "ôn tập véc-tơ", ["vector operation", "phép toán véc-tơ"], ["dot product", "tích vô hướng"], ["geometry application", "ứng dụng hình học"]],
  "Lesson18_HinhHocDoLuong1.js": ["geometric measurement", "hình học đo lường", ["length", "độ dài"], ["angle", "góc"], ["shape property", "tính chất hình học"]],
  "Lesson19_HinhHocDoLuong2.js": ["area and perimeter", "diện tích và chu vi", ["triangle area", "diện tích tam giác"], ["circle formula", "công thức đường tròn"], ["measurement application", "bài toán đo lường"]],
  "Lesson20_OnTapChuong6.js": ["geometry measurement review", "ôn tập hình học đo lường", ["area", "diện tích"], ["perimeter", "chu vi"], ["problem solving", "giải toán"]],
  "Lesson21_DauTamThucBacHai.js": ["sign of a quadratic trinomial", "dấu của tam thức bậc hai", ["root", "nghiệm"], ["sign chart", "bảng xét dấu"], ["parabola", "parabol"]],
  "Lesson22_GiaiBPTBacHai.js": ["quadratic inequalities", "bất phương trình bậc hai", ["interval", "khoảng nghiệm"], ["root", "nghiệm"], ["solution set", "tập nghiệm"]],
  "Lesson23_PhuongTrinhQuyVeBacHai.js": ["equations reducible to quadratic", "phương trình quy về bậc hai", ["substitution", "đặt ẩn phụ"], ["domain condition", "điều kiện xác định"], ["extraneous root", "nghiệm ngoại lai"]],
  "Lesson24_OnTapChuong7.js": ["quadratic inequality review", "ôn tập bất phương trình bậc hai", ["sign chart", "bảng xét dấu"], ["solution interval", "khoảng nghiệm"], ["quadratic equation", "phương trình bậc hai"]],
  "Lesson25_QuyTacCongNhan.js": ["addition and multiplication principles", "quy tắc cộng và quy tắc nhân", ["case", "trường hợp"], ["outcome", "kết quả"], ["counting principle", "nguyên lý đếm"]],
  "Lesson26_HoanViChinhHopToHop.js": ["permutations, arrangements, and combinations", "hoán vị, chỉnh hợp và tổ hợp", ["factorial", "giai thừa"], ["arrangement", "chỉnh hợp"], ["combination", "tổ hợp"]],
  "Lesson27_NhiThucNewton.js": ["binomial theorem", "nhị thức Newton", ["binomial coefficient", "hệ số nhị thức"], ["expansion", "khai triển"], ["Pascal triangle", "tam giác Pascal"]],
  "Lesson28_OnTapChuong8.js": ["combinatorics review", "ôn tập đại số tổ hợp", ["counting principle", "nguyên lý đếm"], ["combination", "tổ hợp"], ["binomial theorem", "nhị thức Newton"]],
  "Lesson29_ToaDoVecto.js": ["vector coordinates", "tọa độ véc-tơ", ["coordinate plane", "mặt phẳng tọa độ"], ["component", "thành phần tọa độ"], ["midpoint", "trung điểm"]],
  "Lesson30_DuongThang.js": ["line equations", "phương trình đường thẳng", ["normal vector", "véc-tơ pháp tuyến"], ["direction vector", "véc-tơ chỉ phương"], ["distance", "khoảng cách"]],
  "Lesson31_DuongTron.js": ["circle equations", "phương trình đường tròn", ["center", "tâm"], ["radius", "bán kính"], ["tangent", "tiếp tuyến"]],
  "Lesson32_Elip.js": ["ellipse", "elip", ["foci", "tiêu điểm"], ["major axis", "trục lớn"], ["standard equation", "phương trình chính tắc"]],
  "Lesson33_OnTapChuong9.js": ["coordinate geometry review", "ôn tập phương pháp tọa độ", ["line", "đường thẳng"], ["circle", "đường tròn"], ["ellipse", "elip"]],
  "Lesson34_KhongGianMau.js": ["sample spaces and events", "không gian mẫu và biến cố", ["outcome", "kết quả"], ["event", "biến cố"], ["probability model", "mô hình xác suất"]],
  "Lesson35_XacSuatBienCo.js": ["probability of an event", "xác suất của biến cố", ["favorable outcome", "kết quả thuận lợi"], ["equally likely", "đồng khả năng"], ["complement", "biến cố đối"]],
  "Lesson36_OnTapChuong10.js": ["probability review", "ôn tập xác suất", ["sample space", "không gian mẫu"], ["event operation", "phép toán biến cố"], ["probability rule", "quy tắc xác suất"]],
};

function phrase(text, vi) {
  return { text, vi };
}

function concept([text, vi]) {
  return {
    text,
    vi,
    detail: `<b>${text}</b>: ${vi}.`,
    detailTitle: `${text} (${vi})`,
  };
}

function buildSubtitles([topicEn, topicVi, termA, termB, termC]) {
  const topic = concept([topicEn, topicVi]);
  const a = concept(termA);
  const b = concept(termB);
  const c = concept(termC);

  return [
    {
      start: 0,
      end: 12,
      words: [
        phrase("This lesson introduces", "Bài học này giới thiệu"),
        topic,
        phrase("and the main ideas used in Grade 10 math.", "và các ý chính dùng trong Toán 10."),
      ],
    },
    {
      start: 12,
      end: 30,
      words: [
        phrase("First identify", "Trước hết xác định"),
        a,
        phrase("then connect it with", "sau đó liên hệ với"),
        b,
        phrase("through examples.", "qua các ví dụ."),
      ],
    },
    {
      start: 30,
      end: 55,
      words: [
        phrase("Use", "Sử dụng"),
        c,
        phrase("carefully and check every condition before solving.", "một cách cẩn thận và kiểm tra mọi điều kiện trước khi giải."),
      ],
    },
    {
      start: 55,
      end: 9999,
      words: [
        phrase("For practice, combine", "Khi luyện tập, hãy kết hợp"),
        a,
        phrase(",", ","),
        b,
        phrase("and", "và"),
        c,
        phrase("step by step.", "theo từng bước."),
      ],
    },
  ];
}

function replaceVideoSubtitles(content, nextArrayCode) {
  const marker = "const videoSubtitles = ";
  const start = content.indexOf(marker);
  if (start === -1) throw new Error("Missing videoSubtitles");

  const arrayStart = content.indexOf("[", start);
  if (arrayStart === -1) throw new Error("Missing subtitle array");

  let depth = 0;
  let quote = null;
  let escaped = false;
  let arrayEnd = -1;

  for (let i = arrayStart; i < content.length; i += 1) {
    const ch = content[i];

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (ch === "\\") {
        escaped = true;
      } else if (ch === quote) {
        quote = null;
      }
      continue;
    }

    if (ch === "'" || ch === '"' || ch === "`") {
      quote = ch;
      continue;
    }
    if (ch === "[") depth += 1;
    if (ch === "]") {
      depth -= 1;
      if (depth === 0) {
        arrayEnd = i;
        break;
      }
    }
  }

  if (arrayEnd === -1) throw new Error("Could not find subtitle array end");
  const semicolon = content.indexOf(";", arrayEnd);
  if (semicolon === -1) throw new Error("Could not find subtitle semicolon");

  return `${content.slice(0, start)}const videoSubtitles = ${nextArrayCode};${content.slice(semicolon + 1)}`;
}

const lessonFiles = fs
  .readdirSync(lessonDir)
  .filter((file) => (file.startsWith("Lesson") || file.startsWith("OnTapChuong")) && file.endsWith(".js") && file !== "LessonVideoPlayer.js");

let updated = 0;

for (const file of lessonFiles) {
  const meta = lessonMeta[file];
  if (!meta) throw new Error(`Missing subtitle metadata for ${file}`);

  const filePath = path.join(lessonDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const nextSubtitles = buildSubtitles(meta);
  const nextArrayCode = JSON.stringify(nextSubtitles, null, 2);
  const nextContent = replaceVideoSubtitles(content, nextArrayCode);

  if (nextContent !== content) {
    fs.writeFileSync(filePath, nextContent, "utf8");
    updated += 1;
  }
}

console.log(`Rebuilt subtitles in ${updated} lesson files.`);
