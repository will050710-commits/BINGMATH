// ─── THCS (Grade 6-9) Bilingual Test Data ───────────────────
// Reading: L6 (Flyer), L7 (KET), L8 (PET), L9 (IELTS Academic Easy)
// Math (Section 3): Sourced from thcs.toanmath.com (Sở GD&ĐT & THCS uy tín)

export const THCS_TESTS_DATA = {
  // ==========================================
  // LỚP 6
  // ==========================================
  "reading-test-L6-1": {
    grade: 6, test: 1, level: "Flyer",
    section1: {
      passageTitle: "The Smart Dolphins",
      passageText: "Dolphins are very clever water animals. They live in the sea and can swim incredibly fast. Unlike fish, dolphins are mammals. This means they cannot breathe underwater. They must come up to the surface of the water to get air. They breathe through a small blowhole on top of their heads. Dolphins are very friendly and love playing with humans. They make clicking and whistling sounds to talk to each other and find food.",
      questions: [
        { id: "p1q1", text: "1. Where do dolphins live?", options: ["A. In lakes and rivers", "B. In the sea", "C. On land", "D. In swimming pools"], answer: "B" },
        { id: "p1q2", text: "2. Why are dolphins different from fish?", options: ["A. They swim faster", "B. They are mammals", "C. They can see in the dark", "D. They eat seaweed"], answer: "B" },
        { id: "p1q3", text: "3. How do dolphins breathe?", options: ["A. Through their mouths", "B. Through gills", "C. Through a blowhole on their heads", "D. Through their noses"], answer: "C" },
        { id: "p1q4", text: "4. What sounds do dolphins make to communicate?", options: ["A. Clicking and whistling sounds", "B. Singing sounds", "C. Barking sounds", "D. Roaring sounds"], answer: "C" },
        { id: "p1q5", text: "5. Dolphins are generally known to be:", options: ["A. Dangerous to humans", "B. Friendly and playful", "C. Scared of deep water", "D. Very quiet"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "Uncle Harry's Farm",
      passageText: "Every summer, Peter goes to visit his Uncle Harry on his farm. Uncle Harry has a lot of animals like cows, sheep, horses, and chickens. Peter loves helping his uncle feed the chickens and collect fresh eggs in the morning. His favorite animal is a black horse named Shadow. Peter rides Shadow around the fields every afternoon. It is always a wonderful holiday for Peter.",
      questions: [
        { id: "p2q1", text: "6. How often does Peter visit his uncle's farm?", options: ["A. Every month", "B. Every winter", "C. Every summer", "D. Every week"], answer: "C" },
        { id: "p2q2", text: "7. What does Peter do in the morning?", options: ["A. Ride horses", "B. Feed chickens and collect eggs", "C. Milk the cows", "D. Clean the barn"], answer: "B" },
        { id: "p2q3", text: "8. What is the name of Peter's favorite animal?", options: ["A. Harry", "B. Shadow", "C. Peter", "D. Sunny"], answer: "B" },
        { id: "p2q4", text: "9. What kind of animal is Shadow?", options: ["A. A sheep", "B. A cow", "C. A chicken", "D. A horse"], answer: "D" },
        { id: "p2q5", text: "10. How does Peter feel about his holiday on the farm?", options: ["A. He finds it boring", "B. He thinks it is wonderful", "C. He feels tired", "D. He wants to go home"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 6 - THCS Huỳnh Thúc Kháng, Đà Nẵng", label: "Bài 1 (Tập hợp)", parts: ["Cho tập hợp A = {x ∈ ℕ | 3 < x ≤ 8}. Viết tập hợp A bằng cách liệt kê các phần tử và tính số phần tử của A."], fields: ["Liệt kê A (vd: 4,5,...) và số phần tử:"] },
        { id: 2, source: "Đề cuối kì 1 Toán 6 - THCS Ái Mộ, Hà Nội", label: "Bài 2 (Phép tính)", parts: ["Thực hiện phép tính: 25.47 + 25.53 - 100."], fields: ["Kết quả phép tính:"] },
        { id: 3, source: "Đề khảo sát Toán 6 - Phòng GD&ĐT", label: "Bài 3 (Tìm x)", parts: ["Tìm số tự nhiên x biết: 3x - 15 = 3³."], fields: ["x ="] }
      ]
    }
  },
  "reading-test-L6-2": {
    grade: 6, test: 2, level: "Flyer",
    section1: {
      passageTitle: "An Amazing Bird",
      passageText: "Hummingbirds are the smallest birds in the world. They are unique because they can fly backward and hover in the air. Their wings move so fast that they make a humming sound. Hummingbirds drink nectar, a sweet liquid found inside flowers. They need to eat a lot of food every day because they burn energy very quickly. Most hummingbirds are brightly colored and live in warm forests.",
      questions: [
        { id: "p1q1", text: "1. What makes hummingbirds unique?", options: ["A. They are very large", "B. They can fly backward", "C. They sing loudly", "D. They eat insects"], answer: "B" },
        { id: "p1q2", text: "2. Why do their wings make a humming sound?", options: ["A. Because they are heavy", "B. Because they move very fast", "C. Because they are colorful", "D. Because of the wind"], answer: "B" },
        { id: "p1q3", text: "3. What do hummingbirds drink?", options: ["A. Rainwater", "B. Nectar from flowers", "C. Milk", "D. Fruit juice"], answer: "B" },
        { id: "p1q4", text: "4. Why do they need to eat so much?", options: ["A. Because they are growing", "B. Because they burn energy quickly", "C. Because they have large stomachs", "D. Because they are cold"], answer: "B" },
        { id: "p1q5", text: "5. Where do most hummingbirds live?", options: ["A. In cold mountains", "B. In warm forests", "C. Near lakes", "D. In deserts"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "Sally's New Hobby",
      passageText: "Sally is eleven years old. Last month, her grandmother gave her a camera for her birthday. Now, photography is Sally's favorite hobby. She takes photos of everything she sees. She goes to the park on weekends to take pictures of flowers, trees, and birds. Yesterday, she took a beautiful photo of a butterfly on a red rose. She hopes to win the school photography competition next month.",
      questions: [
        { id: "p2q1", text: "6. Who gave Sally the camera?", options: ["A. Her mother", "B. Her grandmother", "C. Her teacher", "D. Her friend"], answer: "B" },
        { id: "p2q2", text: "7. When did Sally get the camera?", options: ["A. Last week", "B. Yesterday", "C. Last month", "D. Last year"], answer: "C" },
        { id: "p2q3", text: "8. What does Sally like to photograph on weekends?", options: ["A. Buildings and cars", "B. Flowers, trees, and birds", "C. Her family", "D. Sports games"], answer: "B" },
        { id: "p2q4", text: "9. What did she photograph yesterday?", options: ["A. A butterfly on a red rose", "B. A dog playing", "C. Her grandmother", "D. The sunset"], answer: "A" },
        { id: "p2q5", text: "10. What does Sally hope to do next month?", options: ["A. Buy a new camera", "B. Win the school photography competition", "C. Go on holiday", "D. Start a new hobby"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 6 - THCS Lý Thánh Tông, TP. HCM", label: "Bài 1 (Ước chung lớn nhất)", parts: ["Tìm ƯCLN(24, 36) và tập hợp ước chung ƯC(24, 36)."], fields: ["ƯCLN =", "ƯC = { liệt kê }"] },
        { id: 2, source: "Đề cuối kì 1 Toán 6 - THCS Tương Bình Hiệp", label: "Bài 2 (Số nguyên)", parts: ["Thực hiện phép tính: (-15) + 28 + (-13)."], fields: ["Kết quả:"] },
        { id: 3, source: "Đề kiểm tra Toán 6 - THCS Võ Trường Toản", label: "Bài 3 (Chu vi)", parts: ["Một mảnh vườn hình chữ nhật có chiều dài 15m, chiều rộng 10m. Tính chu vi vườn đó."], fields: ["Chu vi (m) ="] }
      ]
    }
  },
  "reading-test-L6-3": {
    grade: 6, test: 3, level: "Flyer",
    section1: {
      passageTitle: "A Trip to the Space Museum",
      passageText: "Yesterday, class 6A went on a school trip to the Space Museum. They traveled by bus and arrived at ten o'clock. First, they saw a large model of the solar system. The tour guide explained that Jupiter is the biggest planet. After that, they went inside a special theater called a planetarium. The ceiling looked like the night sky full of stars. Everyone loved the trip and bought space posters from the museum shop.",
      questions: [
        { id: "p1q1", text: "1. How did Class 6A travel to the museum?", options: ["A. By train", "B. By car", "C. By bus", "D. On foot"], answer: "C" },
        { id: "p1q2", text: "2. What time did they arrive?", options: ["A. At nine o'clock", "B. At ten o'clock", "C. At eleven o'clock", "D. At noon"], answer: "B" },
        { id: "p1q3", text: "3. According to the tour guide, which is the biggest planet?", options: ["A. Earth", "B. Mars", "C. Saturn", "D. Jupiter"], answer: "D" },
        { id: "p1q4", text: "4. What did the ceiling of the planetarium look like?", options: ["A. The solar system", "B. The ocean", "C. The night sky full of stars", "D. A forest"], answer: "C" },
        { id: "p1q5", text: "5. What did the students buy from the shop?", options: ["A. Space toys", "B. Space posters", "C. Books", "D. Postcards"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Life of Emperor Penguins",
      passageText: "Emperor Penguins are the largest penguins in the world. They live in Antarctica, the coldest place on Earth. During winter, female penguins lay a single egg and leave it with the male penguins. The males keep the egg warm on top of their feet under a warm roll of skin for two months. They do not eat anything during this cold time. When the chicks hatch, the mothers return with food.",
      questions: [
        { id: "p2q1", text: "6. Where do Emperor Penguins live?", options: ["A. In the Arctic", "B. In Australia", "C. In Antarctica", "D. In Africa"], answer: "C" },
        { id: "p2q2", text: "7. Who keeps the egg warm?", options: ["A. The female penguins", "B. The male penguins", "C. Both parents", "D. The grandparents"], answer: "B" },
        { id: "p2q3", text: "8. How do the penguins hold the egg?", options: ["A. Under their wings", "B. In their mouths", "C. On top of their feet", "D. In nests"], answer: "C" },
        { id: "p2q4", text: "9. How long do the male penguins watch the egg?", options: ["A. One week", "B. Two weeks", "C. One month", "D. Two months"], answer: "D" },
        { id: "p2q5", text: "10. What do the male penguins eat while keeping the egg warm?", options: ["A. Fish", "B. Krill", "C. Snow", "D. Nothing"], answer: "D" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK2 Toán 6 - THCS Huỳnh Thúc Kháng, Đà Nẵng", label: "Bài 1 (Phân số)", parts: ["Thực hiện phép tính: 5/6 + (-2/3)."], fields: ["Kết quả rút gọn:"] },
        { id: 2, source: "Đề HK2 Toán 6 - THCS Ái Mộ, Hà Nội", label: "Bài 2 (Tìm x với phân số)", parts: ["Tìm x biết: x - 1/4 = 3/8."], fields: ["x ="] },
        { id: 3, source: "Đề thi HK2 Toán 6 - THCS An Điền", label: "Bài 3 (Diện tích)", parts: ["Tính diện tích của một hình thoi có độ dài hai đường chéo lần lượt là 12cm và 8cm."], fields: ["Diện tích (cm²) ="] }
      ]
    }
  },

  // ==========================================
  // LỚP 7
  // ==========================================
  "reading-test-L7-1": {
    grade: 7, test: 1, level: "KET",
    section1: {
      passageTitle: "A Great Outdoor Experience",
      passageText: "Last week, Sarah and her school friends went on a three-day camping trip in the national park. They slept in tents, cooked food over an open fire, and hiked up a big mountain. On the second day, it rained heavily, and their clothes got completely wet. However, they kept hiking and reached the top of the mountain, where they saw a beautiful rainbow. Sarah took many pictures to show her parents.",
      questions: [
        { id: "p1q1", text: "1. How long was the camping trip?", options: ["A. One day", "B. Two days", "C. Three days", "D. One week"], answer: "C" },
        { id: "p1q2", text: "2. Where did they sleep?", options: ["A. In a hotel", "B. In tents", "C. In a wooden cabin", "D. On the ground"], answer: "B" },
        { id: "p1q3", text: "3. What happened on the second day?", options: ["A. They got lost", "B. It rained heavily", "C. They went swimming", "D. It snowed"], answer: "B" },
        { id: "p1q4", text: "4. What did they see at the top of the mountain?", options: ["A. A wild bear", "B. A waterfall", "C. A beautiful rainbow", "D. The sunset"], answer: "C" },
        { id: "p1q5", text: "5. Sarah took pictures to show to her:", options: ["A. Friends", "B. Teachers", "C. Parents", "D. Brother"], answer: "C" }
      ]
    },
    section2: {
      passageTitle: "Library Rules & Notices",
      passageText: "Welcome to the Town Library. The library is open from 9:00 AM to 7:00 PM on weekdays, and from 10:00 AM to 4:00 PM on weekends. Members can borrow up to five books for three weeks. Please remember to return your books on time. A small fine will be charged for late books. Computer use is free, but you must book a seat at the main desk first. Eating and drinking are not allowed inside the reading rooms.",
      questions: [
        { id: "p2q1", text: "6. What time does the library close on weekdays?", options: ["A. At 4:00 PM", "B. At 7:00 PM", "C. At 9:00 AM", "D. At 10:00 PM"], answer: "B" },
        { id: "p2q2", text: "7. How many books can members borrow at one time?", options: ["A. Three books", "B. Five books", "C. Three weeks", "D. Ten books"], answer: "B" },
        { id: "p2q3", text: "8. What happens if you return books late?", options: ["A. You must pay a fine", "B. You cannot borrow books again", "C. The library will call your house", "D. Nothing"], answer: "A" },
        { id: "p2q4", text: "9. How can you use the computers?", options: ["A. By paying a small fee", "B. By bringing your own mouse", "C. By booking a seat at the main desk", "D. Computers are only for library workers"], answer: "C" },
        { id: "p2q5", text: "10. What is NOT allowed inside the library reading rooms?", options: ["A. Using computers", "B. Reading books", "C. Talking to workers", "D. Eating and drinking"], answer: "D" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 7 - THCS Ái Mộ, Hà Nội", label: "Bài 1 (Số hữu tỉ)", parts: ["Thực hiện phép tính: (-3/4) + (2/5) : (-8/15)."], fields: ["Kết quả phép tính:"] },
        { id: 2, source: "Đề khảo sát Toán 7 - Phòng GD&ĐT", label: "Bài 2 (Tỉ lệ thức)", parts: ["Tìm hai số x và y biết: x/3 = y/5 và x + y = 16."], fields: ["x =", "y ="] },
        { id: 3, source: "Đề cuối kì 1 Toán 7 - THCS Lý Thánh Tông", label: "Bài 3 (Hình học)", parts: ["Cho tam giác ABC có góc A = 60° và góc B = 80°. Tính số đo góc C."], fields: ["Góc C = (độ)"] }
      ]
    }
  },
  "reading-test-L7-2": {
    grade: 7, test: 2, level: "KET",
    section1: {
      passageTitle: "The Great Barrier Reef",
      passageText: "The Great Barrier Reef is the largest coral reef system in the world. It is located in the Coral Sea, off the coast of Queensland, Australia. It is so large that it can be seen from space. Thousands of different marine species live there, including colorful fish, sea turtles, sharks, and dolphins. Today, global warming and pollution are major threats to the reef. Scientists are working hard to protect this beautiful underwater world.",
      questions: [
        { id: "p1q1", text: "1. Where is the Great Barrier Reef located?", options: ["A. In the Pacific Ocean near America", "B. In the Coral Sea near Australia", "C. In the Indian Ocean", "D. Near Antarctica"], answer: "B" },
        { id: "p1q2", text: "2. The Great Barrier Reef is so large that it can be seen from:", options: ["A. An airplane only", "B. Space", "C. The beach", "D. A high mountain"], answer: "B" },
        { id: "p1q3", text: "3. Which of these animals is NOT mentioned as living in the reef?", options: ["A. Sea turtles", "B. Dolphins", "C. Penguins", "D. Sharks"], answer: "C" },
        { id: "p1q4", text: "4. What are the major threats to the reef today?", options: ["A. Too many tourists", "B. Global warming and pollution", "C. Overfishing", "D. Underwater volcanoes"], answer: "B" },
        { id: "p1q5", text: "5. Who is working to protect the reef?", options: ["A. Tourists", "B. Fishers", "C. Scientists", "D. Sailors"], answer: "C" }
      ]
    },
    section2: {
      passageTitle: "An Interview with a Young Musician",
      passageText: "Lucas is fourteen years old and plays the violin. He started playing when he was only five. He practices for three hours every day after school. Lucas plays in the city youth orchestra. Next week, the orchestra is traveling to London for an international music festival. Lucas is excited but also a bit nervous. He hopes to become a professional musician when he grows up.",
      questions: [
        { id: "p2q1", text: "6. How old was Lucas when he started playing the violin?", options: ["A. Five", "B. Ten", "C. Fourteen", "D. Three"], answer: "A" },
        { id: "p2q2", text: "7. How long does Lucas practice every day?", options: ["A. One hour", "B. Two hours", "C. Three hours", "D. All afternoon"], answer: "C" },
        { id: "p2q3", text: "8. Where is the youth orchestra going next week?", options: ["A. Paris", "B. London", "C. New York", "D. Sydney"], answer: "B" },
        { id: "p2q4", text: "9. How does Lucas feel about the trip?", options: ["A. He is happy and calm", "B. He is excited but nervous", "C. He does not want to go", "D. He is scared"], answer: "B" },
        { id: "p2q5", text: "10. What does Lucas want to be in the future?", options: ["A. A violin teacher", "B. A professional musician", "C. An orchestra conductor", "D. A music writer"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 7 - THCS Huỳnh Thúc Kháng, Đà Nẵng", label: "Bài 1 (Số thập phân)", parts: ["Làm tròn số 34.5678 đến hàng phần trăm (chữ số thập phân thứ hai)."], fields: ["Kết quả làm tròn:"] },
        { id: 2, source: "Đề thi HK1 Toán 7 - THCS Phạm Hữu Lầu, TP. HCM", label: "Bài 2 (Đại lượng tỉ lệ)", parts: ["Biết 5 mét dây cáp nặng 1.2 kg. Hỏi 15 mét dây cáp cùng loại nặng bao nhiêu kg?"], fields: ["Khối lượng (kg) ="] },
        { id: 3, source: "Đề HK1 Toán 7 - THCS Ngọc Thụy, Hà Nội", label: "Bài 3 (Đại số)", parts: ["Cho đa thức A(x) = 2x² - 3x + 1. Tính giá trị của đa thức tại x = -1."], fields: ["A(-1) ="] }
      ]
    }
  },
  "reading-test-L7-3": {
    grade: 7, test: 3, level: "KET",
    section1: {
      passageTitle: "History of the Bicycle",
      passageText: "The first bicycle was invented in Germany in 1817 by Baron Karl von Drais. It was made of wood and did not have pedals. People had to push their feet against the ground to make it move. Pedals were added to bicycles in France in the 1860s. Over the next fifty years, bicycles became lighter, stronger, and much safer. Today, millions of people use bicycles for exercise, sport, and commuting to work.",
      questions: [
        { id: "p1q1", text: "1. Who invented the first bicycle?", options: ["A. A French doctor", "B. Baron Karl von Drais", "C. A British engineer", "D. A German student"], answer: "B" },
        { id: "p1q2", text: "2. The first bicycle was made of:", options: ["A. Iron", "B. Wood", "C. Steel", "D. Plastic"], answer: "B" },
        { id: "p1q3", text: "3. How did the first bicycle move?", options: ["A. By using pedals", "B. By pushing feet against the ground", "C. By using a motor", "D. By pulling with a rope"], answer: "B" },
        { id: "p1q4", text: "4. When and where were pedals added to bicycles?", options: ["A. In Germany in 1817", "B. In France in the 1860s", "C. In England in 1900", "D. In America in 1880"], answer: "B" },
        { id: "p1q5", text: "5. Today, bicycles are used for:", options: ["A. Only racing", "B. Transporting heavy goods", "C. Exercise, sport, and commuting", "D. Toys for children only"], answer: "C" }
      ]
    },
    section2: {
      passageTitle: "Thomas Edison: The Great Inventor",
      passageText: "Thomas Edison was one of the most famous inventors in history. He was born in America in 1847. During his life, he invented many things that changed the world, including the phonograph (for playing music) and the first practical electric light bulb. Edison worked in a large laboratory in Menlo Park, New Jersey. He believed that hard work was the key to success and slept very little.",
      questions: [
        { id: "p2q1", text: "6. Where was Thomas Edison born?", options: ["A. In Germany", "B. In America", "C. In England", "D. In France"], answer: "B" },
        { id: "p2q2", text: "7. Which of these was invented by Edison?", options: ["A. The telephone", "B. The practical electric light bulb", "C. The bicycle", "D. The steam engine"], answer: "B" },
        { id: "p2q3", text: "8. What was the phonograph used for?", options: ["A. Lighting rooms", "B. Playing music", "C. Taking photos", "D. Sending messages"], answer: "B" },
        { id: "p2q4", text: "9. Where was Edison's laboratory?", options: ["A. New York", "B. Menlo Park, New Jersey", "C. London", "D. Berlin"], answer: "B" },
        { id: "p2q5", text: "10. What did Edison believe was the key to success?", options: ["A. Good luck", "B. Hard work", "C. Having a lot of money", "D. Being young"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK2 Toán 7 - THCS Huỳnh Thúc Kháng, Đà Nẵng", label: "Bài 1 (Đa thức)", parts: ["Cho hai đa thức: P(x) = 3x² + 2x - 5 và Q(x) = x² - 2x + 3. Tính P(x) + Q(x)."], fields: ["Kết quả đa thức tổng:"] },
        { id: 2, source: "Đề cuối kì 2 Toán 7 - THCS Ái Mộ, Hà Nội", label: "Bài 2 (Thống kê)", parts: ["Điểm kiểm tra toán của 5 học sinh lần lượt là: 6, 7, 8, 9, 10. Tính điểm trung bình của nhóm này."], fields: ["Điểm trung bình ="] },
        { id: 3, source: "Đề kiểm tra HK2 Toán 7 - THCS Phú An", label: "Bài 3 (Hình học tam giác)", parts: ["Trong tam giác ABC vuông tại A, biết AB = 6cm, AC = 8cm. Tính độ dài cạnh huyền BC."], fields: ["BC (cm) ="] }
      ]
    }
  },

  // ==========================================
  // LỚP 8
  // ==========================================
  "reading-test-L8-1": {
    grade: 8, test: 1, level: "PET",
    section1: {
      passageTitle: "The Rise of Eco-Tourism",
      passageText: "Eco-tourism, a form of tourism involving visiting fragile, pristine, and relatively undisturbed natural areas, has grown rapidly over the last decade. Unlike traditional tourism, which often leads to the destruction of local habitats and high levels of pollution, eco-tourism aims to educate travelers, provide funds for ecological conservation, and directly benefit the economic development of local communities. Many eco-tourists choose to stay in small, locally-owned lodges rather than large international hotels, ensuring their money stays in the local economy. They also participate in activities that have minimal environmental impact, such as guided hikes, wildlife watching, and tree planting. However, critics argue that the increasing number of tourists visiting remote areas can still cause damage, no matter how carefully managed the trips are.",
      questions: [
        { id: "p1q1", text: "1. Eco-tourism is defined as visiting areas that are:", options: ["A. Highly developed and popular", "B. Fragile, pristine, and undisturbed", "C. Cheap and close to cities", "D. Known for historic buildings"], answer: "B" },
        { id: "p1q2", text: "2. How does traditional tourism differ from eco-tourism?", options: ["A. Traditional tourism is more educational.", "B. Traditional tourism often harms habitats and causes pollution.", "C. Traditional tourism benefits local economies more.", "D. Eco-tourism is only for young people."], answer: "B" },
        { id: "p1q3", text: "3. Why do eco-tourists prefer locally-owned lodges?", options: ["A. Because they are cheaper than large hotels", "B. To ensure their money directly supports the local economy", "C. Because they always have better views", "D. To avoid meeting other tourists"], answer: "B" },
        { id: "p1q4", text: "4. Which activity is NOT mentioned as having minimal environmental impact?", options: ["A. Wildlife watching", "B. Guided hikes", "C. Off-road driving in cars", "D. Tree planting"], answer: "C" },
        { id: "p1q5", text: "5. What do critics of eco-tourism point out?", options: ["A. It is too expensive for most travelers.", "B. It does not provide any jobs for local people.", "C. Increased visitor numbers can still harm remote areas.", "D. Most eco-tourists do not follow rules."], answer: "C" }
      ]
    },
    section2: {
      passageTitle: "Learning a Second Language",
      passageText: "In today's globalized world, learning a second language is more important than ever. While it was once seen simply as a useful skill for travel or international business, researchers have discovered that bilingualism offers significant cognitive benefits. Studies show that people who speak more than one language have better memory, problem-solving skills, and mental flexibility. This is because switching between languages exercises the brain, keeping it active and healthy. Furthermore, learning a language helps people understand different cultures, promoting empathy and tolerance. Experts suggest that the best time to start learning a second language is during childhood, as young brains are more adaptable, but adults can still achieve high levels of fluency with regular practice and immersion.",
      questions: [
        { id: "p2q1", text: "6. Historically, a second language was mainly considered useful for:", options: ["A. Gaining better school grades", "B. Travel or international business", "C. Getting higher pay in local jobs", "D. Reading classic books"], answer: "B" },
        { id: "p2q2", text: "7. Why does bilingualism offer cognitive benefits?", options: ["A. It helps people read faster.", "B. Switching between languages exercises the brain.", "C. It allows people to sleep less.", "D. It reduces academic pressure."], answer: "B" },
        { id: "p2q3", text: "8. Learning a second language promotes empathy because it:", options: ["A. Teaches grammar rules", "B. Helps people understand different cultures", "C. Makes travel safer", "D. Enhances listening speed"], answer: "B" },
        { id: "p2q4", text: "9. When is the best time to start learning a language according to experts?", options: ["A. In adulthood", "B. During childhood", "C. When moving to a new country", "D. In high school"], answer: "B" },
        { id: "p2q5", text: "10. What is required for adults to achieve fluency?", options: ["A. Professional private tutors", "B. Regular practice and immersion", "C. Memorizing dictionaries", "D. Studying abroad for years"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 8 - THCS Phúc Đồng, Hà Nội", label: "Bài 1 (Hằng đẳng thức)", parts: ["Rút gọn biểu thức sau: (x - 2)² + 4x."], fields: ["Biểu thức rút gọn:"] },
        { id: 2, source: "Đề cuối kì 1 Toán 8 - THCS Trần Quý Cáp, Đà Nẵng", label: "Bài 2 (Phân tích nhân tử)", parts: ["Phân tích đa thức thành nhân tử: x² - 9 + y² - 2xy."], fields: ["Đa thức tích:"] },
        { id: 3, source: "Đề thi HK1 Toán 8 - THCS Tương Bình Hiệp", label: "Bài 3 (Diện tích hình thang)", parts: ["Tính diện tích hình thang biết độ dài hai đáy lần lượt là 8cm, 12cm và chiều cao là 6cm."], fields: ["Diện tích (cm²) ="] }
      ]
    }
  },
  "reading-test-L8-2": {
    grade: 8, test: 2, level: "PET",
    section1: {
      passageTitle: "The Importance of Sleep for Teenagers",
      passageText: "Sleep is crucial for teenager development, yet studies show that a large majority of teenagers do not get the recommended 8 to 10 hours of sleep per night. During adolescence, the body undergoes a natural shift in circadian rhythms, making teenagers feel alert later in the evening and sleepier in the morning. This biological change, combined with early school start times, heavy homework loads, and late-night screen use, leads to chronic sleep deprivation. The consequences of sleep loss are serious, including poor school grades, difficulty focusing, and mood swings. To improve sleep habits, experts advise teens to maintain a consistent sleep schedule, even on weekends, avoid screens for at least an hour before bedtime, and keep their bedrooms dark and quiet.",
      questions: [
        { id: "p1q1", text: "1. What is the recommended amount of sleep for teenagers per night?", options: ["A. 6 to 8 hours", "B. 8 to 10 hours", "C. 10 to 12 hours", "D. At least 7 hours"], answer: "B" },
        { id: "p1q2", text: "2. What biological change occurs in teenagers during adolescence?", options: ["A. They require less sleep than adults.", "B. A shift in circadian rhythm makes them alert later in the evening.", "C. Their brains stop active processing during sleep.", "D. They have higher energy levels in the morning."], answer: "B" },
        { id: "p1q3", text: "3. Which of the following is NOT mentioned as a cause of teen sleep loss?", options: ["A. Late-night screen use", "B. Early school start times", "C. Poor diet and lack of exercise", "D. Heavy homework loads"], answer: "C" },
        { id: "p1q4", text: "4. Sleep deprivation in teenagers can lead to:", options: ["A. Better focus in class", "B. Poor school grades and mood swings", "C. Faster physical growth", "D. Improved memory"], answer: "B" },
        { id: "p1q5", text: "5. What is one piece of advice experts give to improve sleep?", options: ["A. Sleep extra hours on weekends", "B. Avoid screens for an hour before bedtime", "C. Keep a light on in the bedroom", "D. Exercise right before sleeping"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Secret of the Silk Road",
      passageText: "The Silk Road was an ancient network of trade routes connecting East Asia with the Mediterranean world, active for over 1,500 years. Named after the lucrative Chinese silk trade, the route was not just a single road but a series of interconnected paths spanning thousands of miles. Merchants traveled in large caravans to protect themselves from bandits and extreme weather. Along with silk, tea, spices, and precious stones, the Silk Road facilitated the exchange of cultures, technologies, religions, and scientific ideas. Gunpowder, papermaking, and printing traveled from China to the West, while glassmaking and agricultural products moved eastward. The road eventually declined in the 15th century as safer maritime trade routes were established by European explorers.",
      questions: [
        { id: "p2q1", text: "6. The Silk Road was active for approximately how long?", options: ["A. 500 years", "B. 1,500 years", "C. 3,000 years", "D. 100 years"], answer: "B" },
        { id: "p2q2", text: "7. Why did merchants travel in large caravans?", options: ["A. To travel faster", "B. To protect themselves from bandits and weather", "C. To carry more gold", "D. Because of government rules"], answer: "B" },
        { id: "p2q3", text: "8. The Silk Road was important because it allowed the exchange of:", options: ["A. Only silk and tea", "B. Cultures, technologies, and scientific ideas", "C. Ships and weapons", "D. Gold coins only"], answer: "B" },
        { id: "p2q4", text: "9. Which technology traveled from China to the West?", options: ["A. Glassmaking", "B. Papermaking and printing", "C. Steam power", "D. Mapmaking"], answer: "B" },
        { id: "p2q5", text: "10. What caused the decline of the Silk Road in the 15th century?", options: ["A. A major war in China", "B. The opening of safer sea trade routes", "C. A change in global weather", "D. Banning of silk trade"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK1 Toán 8 - THCS Ái Mộ, Hà Nội", label: "Bài 1 (Phương trình)", parts: ["Giải phương trình sau: 3(x - 2) - 2(x + 1) = 5."], fields: ["x ="] },
        { id: 2, source: "Đề kiểm tra Toán 8 - THCS Ngọc Thụy, Hà Nội", label: "Bài 2 (Phân thức)", parts: ["Rút gọn phân thức: (x² - 4) / (x² - 2x)."], fields: ["Phân thức rút gọn:"] },
        { id: 3, source: "Đề cuối kì 1 Toán 8 - THCS Phúc Đồng, Hà Nội", label: "Bài 3 (Định lý Thalès)", parts: ["Trong tam giác ABC, đường thẳng song song với BC cắt AB và AC lần lượt tại D và E. Biết AD = 3cm, DB = 2cm, AE = 6cm. Tính độ dài EC."], fields: ["EC (cm) ="] }
      ]
    }
  },
  "reading-test-L8-3": {
    grade: 8, test: 3, level: "PET",
    section1: {
      passageTitle: "The History of Chocolate",
      passageText: "Chocolate, a sweet treat enjoyed by billions today, has a long history that began in Mesoamerica over 3,000 years ago. The ancient Olmecs and Mayans were the first to cultivate cacao plants and prepare a chocolate beverage. However, their version was vastly different from modern chocolate: it was a bitter, frothy drink mixed with chili peppers and water, used mainly during sacred ceremonies. The Aztecs also valued cacao beans so highly that they used them as currency. In the 16th century, Spanish explorers brought cacao back to Europe, where sugar, honey, and vanilla were added to make it sweeter. Solid chocolate bars as we know them today were not invented until the 19th century in England, following the creation of steam-powered machinery to process cocoa beans on an industrial scale.",
      questions: [
        { id: "p1q1", text: "1. When and where did the history of chocolate begin?", options: ["A. In Europe 500 years ago", "B. In Mesoamerica over 3,000 years ago", "C. In Africa in the 1800s", "D. In England in the 19th century"], answer: "B" },
        { id: "p1q2", text: "2. How did ancient Mayan chocolate compare to modern chocolate?", options: ["A. It was sweeter and contained milk.", "B. It was a bitter drink mixed with chili peppers.", "C. It was only eaten in solid bars.", "D. It was cheap and eaten daily by children."], answer: "B" },
        { id: "p1q3", text: "3. What did the Aztecs use cacao beans for besides drinks?", options: ["A. Building material", "B. Currency (money)", "C. Clothing dye", "D. Medicine"], answer: "B" },
        { id: "p1q4", text: "4. What change was made to chocolate when it arrived in Europe?", options: ["A. It was mixed with chili and salt.", "B. Sugar, honey, and vanilla were added.", "C. It was made into chocolate bars immediately.", "D. It was banned by the church."], answer: "B" },
        { id: "p1q5", text: "5. The solid chocolate bar was invented in the 19th century in:", options: ["A. Spain", "B. England", "C. Mexico", "D. Germany"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Wonders of the Deep Ocean",
      passageText: "The deep ocean, starting around 200 meters below the surface, is the least explored environment on our planet. It is a world of extreme conditions: complete darkness, near-freezing temperatures, and immense pressure that would crush human divers. Yet, this inhospitable zone is home to a surprising variety of life. Since sunlight cannot reach these depths, photosynthesis is impossible. Instead, deep-sea creatures rely on 'marine snow'—organic matter falling from the surface—or chemosynthesis, where specialized bacteria create energy from chemical compounds leaking from hydrothermal vents on the seafloor. Many deep-sea animals, such as the anglerfish and lantern shark, have developed bioluminescence, the ability to produce light chemically, to attract prey or find mates in the pitch black.",
      questions: [
        { id: "p2q1", text: "6. At what depth is the deep ocean defined to begin?", options: ["A. 50 meters", "B. 200 meters", "C. 1,000 meters", "D. 10,000 meters"], answer: "B" },
        { id: "p2q2", text: "7. Which of the following is NOT described as an extreme condition of the deep ocean?", options: ["A. Near-freezing temperatures", "B. High water pressure", "C. Frequent volcanic eruptions", "D. Complete darkness"], answer: "C" },
        { id: "p2q3", text: "8. How do deep-sea creatures get energy without sunlight?", options: ["A. By swimming to the surface at night", "B. Through marine snow and chemosynthesis", "C. By eating seaweed", "D. Through geothermal heat only"], answer: "B" },
        { id: "p2q4", text: "9. What is bioluminescence?", options: ["A. The ability to survive extreme cold", "B. The ability to produce light chemically", "C. The skill to hide under the sand", "D. A type of deep-sea plant"], answer: "B" },
        { id: "p2q5", text: "10. Hydrothermal vents on the seafloor release:", options: ["A. Fresh water", "B. Chemical compounds", "C. Marine snow", "D. Cacao beans"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề HK2 Toán 8 - THCS Phúc Đồng, Hà Nội", label: "Bài 1 (Phương trình tích)", parts: ["Giải phương trình sau: (x - 3)(2x + 1) = 0."], fields: ["Các nghiệm x = (dùng dấu phẩy ngăn cách):"] },
        { id: 2, source: "Đề kiểm tra HK2 Toán 8 - THCS Ái Mộ, Hà Nội", label: "Bài 2 (Bất phương trình)", parts: ["Giải bất phương trình: 2x - 5 > 3."], fields: ["Tập nghiệm x >"] },
        { id: 3, source: "Đề thi HK2 Toán 8 - THCS Võ Trường Toản", label: "Bài 3 (Hình hộp chữ nhật)", parts: ["Một hình hộp chữ nhật có ba kích thước lần lượt là 3cm, 4cm và 5cm. Tính thể tích hình hộp đó."], fields: ["Thể tích (cm³) ="] }
      ]
    }
  },

  // ==========================================
  // LỚP 9
  // ==========================================
  "reading-test-L9-1": {
    grade: 9, test: 1, level: "IELTS Academic Easy",
    section1: {
      passageTitle: "The Impact of Artificial Intelligence on Modern Workplaces",
      passageText: "Artificial Intelligence (AI) is transforming industries globally. The deployment of machine learning algorithms has automated repetitive administrative tasks, allowing employees to focus on strategic development. In the healthcare sector, AI diagnostic tools analyze medical imagery with high precision, identifying anomalies faster than conventional methods. However, this shift raises concerns about job displacement. Economists suggest that while AI will eliminate certain roles, it will simultaneously generate new jobs requiring high-level technical skills. Therefore, educational institutions must update curricula to prepare the future workforce for a highly digitized environment. The challenge lies in ensuring a transition that minimizes social inequality and maximizes economic productivity.",
      questions: [
        { id: "p1q1", text: "1. The primary purpose of using AI in workplaces is to:", options: ["A. Replace human managers entirely", "B. Automate repetitive tasks and enable strategic focus", "C. Lower the wages of tech employees", "D. Reduce the need for digital security"], answer: "B" },
        { id: "p1q2", text: "2. How does AI assist the healthcare sector?", options: ["A. By prescribing medication to patients", "B. By analyzing medical imagery with high precision", "C. By replacing nurses in hospital rooms", "D. By lowering the cost of insurance plans"], answer: "B" },
        { id: "p1q3", text: "3. What concern is raised by the widespread deployment of AI?", options: ["A. The high cost of computers", "B. Job displacement", "C. A lack of interest in high-level math", "D. Decreased internet speeds"], answer: "B" },
        { id: "p1q4", text: "4. What is the predicted effect of AI on the job market according to economists?", options: ["A. It will cause permanent mass unemployment.", "B. It will eliminate some roles but create new technical jobs.", "C. It will only benefit agricultural sectors.", "D. It will lead to the return of manual labor."], answer: "B" },
        { id: "p1q5", text: "5. To prepare for the future, educational institutions should:", options: ["A. Focus entirely on history and arts", "B. Update curricula for a digitized environment", "C. Ban the use of computers in exams", "D. Decrease the length of school days"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Exploration of Mars: Past and Present Missions",
      passageText: "For decades, Mars has been the primary target of robotic planetary exploration. Early flyby missions in the 1960s revealed a cold, barren world with a thin carbon dioxide atmosphere. Today, advanced rovers equipped with complex scientific instruments explore the Martian surface. The main objective of current missions is to search for biosignatures—evidence of past microscopic life. Scientists analyze soil samples and rock formations for chemical signs of water, which was once abundant on Mars. The discovery of ancient lakebeds suggests that Mars had a warmer and wetter climate billions of years ago. These findings are crucial for planning future human exploration missions to the Red Planet, which could take place within the next few decades.",
      questions: [
        { id: "p2q1", text: "6. Early Mars missions in the 1960s discovered that the planet:", options: ["A. Was covered in oceans", "B. Was a cold, barren world with a thin atmosphere", "C. Had active alien life", "D. Was rich in gold and silver"], answer: "B" },
        { id: "p2q2", text: "7. What is the primary goal of current Mars rover missions?", options: ["A. To build permanent research stations", "B. To search for evidence of past microscopic life", "C. To extract minerals for commercial use", "D. To map the entire solar system"], answer: "B" },
        { id: "p2q3", text: "8. Scientists look for rock formations to find evidence of:", options: ["A. Ancient cities", "B. Water", "C. Volcanoes", "D. Gold"], answer: "B" },
        { id: "p2q4", text: "9. The existence of ancient lakebeds suggests that Mars was once:", options: ["A. Colder and drier", "B. Warmer and wetter", "C. Unstable and volcanic", "D. Covered in thick ice sheets"], answer: "B" },
        { id: "p2q5", text: "10. When might human missions to Mars occur according to the text?", options: ["A. Within the next few centuries", "B. Within the next few decades", "C. In the next few years", "D. Human missions are not possible"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề tuyển sinh vào lớp 10 môn Toán - Sở GD&ĐT Vĩnh Long", label: "Bài 1 (Căn thức)", parts: ["Rút gọn biểu thức sau: A = (√12 - √3) * √3."], fields: ["A ="] },
        { id: 2, source: "Đề tuyển sinh lớp 10 - Sở GD&ĐT Lâm Đồng", label: "Bài 2 (Hệ phương trình)", parts: ["Giải hệ phương trình sau: { 2x + y = 5 ; x - y = 1 }."], fields: ["x =", "y ="] },
        { id: 3, source: "Đề thi khảo sát Toán 9 - Phòng GD&ĐT", label: "Bài 3 (Phương trình bậc hai)", parts: ["Giải phương trình bậc hai sau: x² - 5x + 6 = 0."], fields: ["Nghiệm x1 =", "Nghiệm x2 ="] }
      ]
    }
  },
  "reading-test-L9-2": {
    grade: 9, test: 2, level: "IELTS Academic Easy",
    section1: {
      passageTitle: "The Science of Biodegradable Plastics",
      passageText: "Plastic pollution is a massive environmental issue, leading scientists to develop biodegradable plastics. These materials are made from natural biological sources such as cornstarch, vegetable fats, and agricultural waste, rather than petroleum. Under proper industrial composting conditions, microorganisms break down these plastics into carbon dioxide, water, and biomass within a few months. However, there are significant misconceptions. Most biodegradable plastics do not degrade quickly if thrown into the ocean or buried in ordinary landfills because they lack the necessary heat and oxygen. Therefore, proper waste management infrastructure is essential. Critics also argue that growing crops for plastics competes with food production, potentially driving up food prices in developing regions.",
      questions: [
        { id: "p1q1", text: "1. Biodegradable plastics are primarily made from:", options: ["A. Recycled petroleum bottles", "B. Natural biological sources like cornstarch", "C. Synthetic chemicals", "D. Microscopic sea creatures"], answer: "B" },
        { id: "p1q2", text: "2. What is required for biodegradable plastics to decompose quickly?", options: ["A. Ocean water", "B. Industrial composting conditions", "C. Ordinary landfill burial", "D. Constant sunlight"], answer: "B" },
        { id: "p1q3", text: "3. If thrown into the ocean, biodegradable plastics will:", options: ["A. Dissolve in a few hours", "B. Not degrade quickly due to lack of heat and oxygen", "C. Turn into food for marine life", "D. Release toxic chemical gas"], answer: "B" },
        { id: "p1q4", text: "4. A potential negative side effect of crop-based plastic production is:", options: ["A. Increased petroleum usage", "B. Higher food prices in developing regions", "C. Faster soil erosion in forests", "D. Fewer jobs in farming"], answer: "B" },
        { id: "p1q5", text: "5. What is crucial for the success of biodegradable plastics?", options: ["A. Cheaper production costs", "B. Proper waste management infrastructure", "C. Banning normal plastic entirely", "D. More advertising to consumers"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Evolution of Language: From Sounds to Writing",
      passageText: "Language is the primary tool for human communication, but its origin remains a subject of intense scientific debate. While spoken language probably evolved hundreds of thousands of years ago, the first writing systems were developed much later, around 3200 BC in Mesopotamia. These early systems, such as cuneiform, used clay tablets to record agricultural transactions and trade. Over time, writing evolved from simple pictures (pictographs) to abstract symbols representing sounds (alphabets). This transition allowed humans to record complex histories, laws, and literature. The invention of the printing press in the 15th century and the digital revolution today have further transformed how language is stored, shared, and modified across generations.",
      questions: [
        { id: "p2q1", text: "6. When and where were the first writing systems developed?", options: ["A. In China 10,000 years ago", "B. In Mesopotamia around 3200 BC", "C. In Greece during the Roman Empire", "D. In Egypt in 1000 AD"], answer: "B" },
        { id: "p2q2", text: "7. What was early cuneiform writing primarily used for?", options: ["A. Writing poetry and drama", "B. Recording agricultural transactions and trade", "C. Sending secret messages in war", "D. Teaching children to speak"], answer: "B" },
        { id: "p2q3", text: "8. An alphabet differs from pictographs because it uses symbols representing:", options: ["A. Direct physical objects", "B. Sounds", "C. Numbers", "D. Emotions"], answer: "B" },
        { id: "p2q4", text: "9. The transition to abstract symbols allowed humans to record:", options: ["A. Simple inventory lists only", "B. Complex histories, laws, and literature", "C. Maps of the solar system", "D. Nothing, it was less effective"], answer: "B" },
        { id: "p2q5", text: "10. What historical event in the 15th century transformed language storage?", options: ["A. The fall of Rome", "B. The invention of the printing press", "C. The discovery of paper in Europe", "D. The establish of the Silk Road"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề tuyển sinh 10 - Sở GD&ĐT Vĩnh Long", label: "Bài 1 (Hàm số bậc nhất)", parts: ["Xác định hệ số a và b của đường thẳng y = ax + b đi qua điểm A(1; 3) và B(2; 5)."], fields: ["a =", "b ="] },
        { id: 2, source: "Đề tuyển sinh 10 - Sở GD&ĐT Lâm Đồng", label: "Bài 2 (Hàm số bậc hai)", parts: ["Cho parabol (P): y = 2x². Tìm giá trị của y khi x = -3."], fields: ["y ="] },
        { id: 3, source: "Đề thi thử lớp 10 - THCS Huỳnh Thúc Kháng", label: "Bài 3 (Phương trình hệ quả)", parts: ["Giải phương trình sau: x⁴ - 5x² + 4 = 0."], fields: ["Các nghiệm x = (dùng dấu phẩy ngăn cách):"] }
      ]
    }
  },
  "reading-test-L9-3": {
    grade: 9, test: 3, level: "IELTS Academic Easy",
    section1: {
      passageTitle: "Renewable Energy Grid Integration: Challenges and Solutions",
      passageText: "Transitioning to renewable energy sources, such as wind and solar power, is crucial for reducing global carbon emissions. However, integrating these resources into existing power grids presents technical hurdles. Unlike traditional power plants, which generate steady electricity from fossil fuels, solar and wind power are intermittent—dependent on weather conditions and time of day. This variability can cause supply-demand imbalances, potentially leading to blackouts. To solve this, engineers are developing utility-scale battery systems to store surplus power. Additionally, smart grid technologies use real-time data to adjust electricity distribution dynamically. Policy support and investment in grid modernization are essential to build a resilient, green energy network.",
      questions: [
        { id: "p1q1", text: "1. The main reason for transitioning to renewable energy is to:", options: ["A. Increase the cost of electricity", "B. Reduce global carbon emissions", "C. Phase out electric cars", "D. Simplify the distribution grid"], answer: "B" },
        { id: "p1q2", text: "2. Why is integrating wind and solar power into grids challenging?", options: ["A. Because they produce too much energy", "B. Because they are intermittent and weather-dependent", "C. Because they require special fuel", "D. Because consumers prefer coal power"], answer: "B" },
        { id: "p1q3", text: "3. What can supply-demand imbalances in the grid potentially cause?", options: ["A. Decreased carbon taxes", "B. Blackouts", "C. Cheaper utility bills", "D. High volcanic activity"], answer: "B" },
        { id: "p1q4", text: "4. What technology is being developed to store surplus power?", options: ["A. Giant coal bunkers", "B. Utility-scale battery systems", "C. High-voltage power lines", "D. New solar panels"], answer: "B" },
        { id: "p1q5", text: "5. What is the role of smart grid technologies?", options: ["A. To replace engineers with AI entirely", "B. To adjust electricity distribution dynamically using real-time data", "C. To check home meters manually", "D. To limit household electricity consumption"], answer: "B" }
      ]
    },
    section2: {
      passageTitle: "The Agricultural Revolution: Origins of Farming",
      passageText: "About 10,000 years ago, humans began a transition from foraging and hunting to agriculture, a process known as the Neolithic Revolution. This transition occurred independently in several regions, including the Fertile Crescent in West Asia. By domesticating wild wheat, barley, sheep, and goats, early humans established permanent settlements. The ability to produce food surpluses led to population growth, specialization of labor, and the development of complex societies. However, farming brought challenges: early farmers had a less diverse diet than hunter-gatherers and were more vulnerable to crop failures, famines, and infectious diseases due to living in crowded communities.",
      questions: [
        { id: "p2q1", text: "6. The Neolithic Revolution refers to the transition from:", options: ["A. Stone tools to bronze tools", "B. Foraging and hunting to agriculture", "C. Village life to large cities", "D. Hand writing to print"], answer: "B" },
        { id: "p2q2", text: "7. Which region is mentioned as an independent origin of farming?", options: ["A. The Arctic Circle", "B. The Fertile Crescent in West Asia", "C. Central Europe", "D. South Africa"], answer: "B" },
        { id: "p2q3", text: "8. Domestication of plants and animals allowed humans to build:", options: ["A. Better hunting weapons", "B. Permanent settlements", "C. Large sailing ships", "D. Computers"], answer: "B" },
        { id: "p2q4", text: "9. Food surpluses directly enabled the development of:", options: ["A. More dangerous wild animals", "B. Population growth and complex societies", "C. Stronger stone tool designs", "D. Better physical health for everyone"], answer: "B" },
        { id: "p2q5", text: "10. What was a major challenge faced by early farmers compared to hunter-gatherers?", options: ["A. Finding enough land", "B. A less diverse diet and vulnerability to disease", "C. Lack of tools", "D. Wild animal attacks"], answer: "B" }
      ]
    },
    section3: {
      mathProblems: [
        { id: 1, source: "Đề tuyển sinh 10 - Sở GD&ĐT Vĩnh Long", label: "Bài 1 (Đồ thị và giao điểm)", parts: ["Cho parabol (P): y = x² và đường thẳng (d): y = 2x + 3. Tìm tọa độ giao điểm của (P) và (d)."], fields: ["Tọa độ giao điểm 1 (x, y):", "Tọa độ giao điểm 2 (x, y):"] },
        { id: 2, source: "Đề tuyển sinh 10 - Sở GD&ĐT Lâm Đồng", label: "Bài 2 (Hệ thức Vi-ét)", parts: ["Cho phương trình x² - 7x + 10 = 0. Không giải phương trình, hãy tính tổng S và tích P của hai nghiệm."], fields: ["S =", "P ="] },
        { id: 3, source: "Đề thi vào 10 chuyên Toán - Sở GD&ĐT Vĩnh Long", label: "Bài 3 (Đường tròn)", parts: ["Từ điểm A nằm ngoài đường tròn (O), kẻ hai tiếp tuyến AB, AC. Biết góc BOC = 120°. Tính số đo góc BAC."], fields: ["Góc BAC = (độ)"] }
      ]
    }
  }
};
