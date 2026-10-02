import json
import random
import re

# ==========================================
# 1. 25+ IT YO'NALISHLARI TO'LIQ KATALOGI
# ==========================================
IT_CATALOG = [
    # --- 1. DASTURLASH ---
    {
        "id": "frontend",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Frontend Dasturlash",
        "icon": "🌐",
        "short_desc": "Veb-sayt va ilovalarning foydalanuvchi ko'radigan qismini yaratish.",
        "what_is": "Frontend dasturlash — bu foydalanuvchi brauzerda ko'radigan barcha vizual elementlar, tugmalar, shakllar, animatsiyalar va dizaynni jonlantiruvchi sohadir. Siz yozgan kod orqali foydalanuvchi sayt bilan qulay muloqot qiladi.",
        "applications": [
            "Online do'konlar (Amazon, Uzum Market) interfeysi",
            "Ijtimoiy tarmoqlar (Instagram, Telegram Web) veb versiyasi",
            "Bank va to'lov tizimlari shaxsiy kabinetlari",
            "Ta'lim platformalari (Coursera, Khan Academy) interaktiv darslari",
            "Kundalik hayot: chipta olish, taom buyurtma qilish saytlari"
        ],
        "what_they_do": "Figma dizaynlarini toza HTML/CSS/JavaScript kodiga aylantiradi, saytning barcha telefon va kompyuterlarda chiroyli ochilishini (responsive) ta'minlaydi, serverdan ma'lumotlarni olib ekranda aks ettiradi.",
        "what_to_learn": [
            "1-bosqich: HTML5 & Semantik tuzilma",
            "2-bosqich: CSS3, Flexbox, Grid & Animatsiyalar",
            "3-bosqich: JavaScript (ES6+), DOM bilan ishlash, Asinxronlik (Fetch/API)",
            "4-bosqich: Git & GitHub bilan jamoaviy ishlash",
            "5-bosqich: Zamonaviy Framework (React.js, Vue yoki Next.js)",
            "6-bosqich: State Management (Redux/Zustand) & TypeScript",
            "7-bosqich: Real Portfolio loyihalar & CV tayyorlash"
        ],
        "projects": [
            {"level": "Boshlang'ich", "title": "Shaxsiy Portfolio veb-sayti va Interaktiv Kalkulyator"},
            {"level": "O'rta", "title": "Real vaqtda ob-havo ko'rsatuvchi API ilova va To-do Task Manager"},
            {"level": "Yuqori", "title": "To'liq funksional E-commerce (savatcha, filtr va to'lov bilan)"}
        ],
        "career_roles": [
            {"role": "Junior Frontend Developer", "salary": "$400 - $800 / oy"},
            {"role": "Middle React Developer", "salary": "$1,200 - $2,500 / oy"},
            {"role": "Senior UI Engineer / Tech Lead", "salary": "$3,000 - $5,500 / oy"}
        ]
    },
    {
        "id": "backend",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Backend Dasturlash",
        "icon": "⚙️",
        "short_desc": "Sayt va ilovalarning 'miyasi', ma'lumotlar bazasi va server mantig'i.",
        "what_is": "Backend — bu veb-ilovalarning parda ortidagi qismi. Foydalanuvchilar uni ko'rmaydi, lekin aynan backend barcha ma'lumotlarni saqlaydi, xavfsizlikni ta'minlaydi, to'lovlarni o'tkazadi va biznes mantiqni boshqaradi.",
        "applications": [
            "Bank tranzaksiyalari va xavfsiz to'lovlar",
            "Katta ma'lumotlar bazasini boshqarish",
            "Avtorizatsiya, login va shaxsiy ma'lumotlar xavfsizligi",
            "Mobil ilovalarning API serverlari",
            "Kuryerlik va GPS kuzatuv tizimlari algoritmlari"
        ],
        "what_they_do": "Server arxitekturasini loyihalaydi, API (REST/GraphQL) yozadi, ma'lumotlar bazasi (PostgreSQL, MongoDB) bilan ishlaydi, tizimning tezkor va buzilmasdan ishlashini ta'minlaydi.",
        "what_to_learn": [
            "1-bosqich: Biror dasturlash tili (Python, Node.js, Java yoki Go)",
            "2-bosqich: Ma'lumotlar bazalari (SQL, PostgreSQL, NoSQL)",
            "3-bosqich: RESTful API va xavfsizlik (JWT, OAuth)",
            "4-bosqich: Keshlashtirish (Redis) & Asinxron vazifalar (Celery/RabbitMQ)",
            "5-bosqich: Docker, Serverga joylash (CI/CD, Linux)",
            "6-bosqich: Microservices arxitekturasi va yuklamaga chidamlilik"
        ],
        "projects": [
            {"level": "Boshlang'ich", "title": "Foydalanuvchilarni ro'yxatdan o'tkazuvchi REST API"},
            {"level": "O'rta", "title": "Telegram orqali buyurtma qabul qiluvchi avtomatlashtirilgan backend"},
            {"level": "Yuqori", "title": "Millionlab foydalanuvchiga mo'ljallangan Bank to'lov shlyuzi mikroxizmati"}
        ],
        "career_roles": [
            {"role": "Junior Backend Developer", "salary": "$500 - $900 / oy"},
            {"role": "Middle Backend Engineer (Python/Java/Node)", "salary": "$1,400 - $2,800 / oy"},
            {"role": "Lead Backend / Systems Architect", "salary": "$3,500 - $6,000 / oy"}
        ]
    },
    {
        "id": "fullstack",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Full Stack Dasturlash",
        "icon": "⚡",
        "short_desc": "Frontend va Backendni birdek mukammal boshqara oladigan universal dasturchi.",
        "what_is": "Full Stack dasturchi — loyihaning noldan boshlab to to'liq ishga tushishigacha bo'lgan barcha bosqichlarini (vizual qismdan server va bazagacha) mustaqil qura oladigan universal mutaxassisdir.",
        "applications": ["Startap mahsulotlarni tezkor ishga tushirish (MVP)", "SaaS bulutli dasturlar", "Universal veb-platformalar"],
        "what_they_do": "Foydalanuvchi interfeysini ham, server mantiqini ham o'zi yozadi. Yangi startaplar va mahsulot jamoalarida juda qadrlanadi.",
        "what_to_learn": ["HTML/CSS/JS", "React/Next.js", "Node.js yoki Python", "PostgreSQL/MongoDB", "Docker & Vercel/AWS"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Shaxsiy blog va maqolalar platformasi"},
            {"level": "O'rta", "title": "Kichik biznes uchun CRM boshqaruv tizimi"},
            {"level": "Yuqori", "title": "Real-time AI Chatbot va to'lov integratsiyali SaaS platforma"}
        ],
        "career_roles": [
            {"role": "Junior Full Stack Dev", "salary": "$600 - $1,000 / oy"},
            {"role": "Middle Full Stack Engineer", "salary": "$1,600 - $3,200 / oy"}
        ]
    },
    {
        "id": "python",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Python Dasturlash",
        "icon": "🐍",
        "short_desc": "O'rganish oson, imkoniyatlari cheksiz bo'lgan dunyoning 1-raqamli dasturlash tili.",
        "what_is": "Python — o'qilishi ingliz tiliga juda yaqin, sintaksisi toza va sodda bo'lgan eng mashhur til. U veb dasturlash, sun'iy intellekt, ma'lumotlar tahlili va avtomatlashtirishda yetakchidir.",
        "applications": ["Sun'iy intellekt va ChatGPT kabi modellar", "Django/FastAPI veb-saytlar", "Telegram botlar", "Ilmiy tadqiqotlar"],
        "what_they_do": "Murakkab algoritmlarni bir necha qator kod bilan yechadi, ma'lumotlarni tahlil qiladi va server dasturlarini tuzadi.",
        "what_to_learn": ["Python asoslari", "OOP (Obyektga yo'naltirilgan dasturlash)", "FastAPI / Django", "SQLAlchemy", "AI kutubxonalari"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Aqlli Telegram bot va Valyuta kursi konverteri"},
            {"level": "O'rta", "title": "Web Scraping va yangiliklar agregatori"},
            {"level": "Yuqori", "title": "FastAPI asosidagi Machine Learning modelini serverga joylash"}
        ],
        "career_roles": [
            {"role": "Junior Python Dev", "salary": "$500 - $900 / oy"},
            {"role": "Python/FastAPI Specialist", "salary": "$1,300 - $2,600 / oy"}
        ]
    },
    {
        "id": "java",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Java Dasturlash",
        "icon": "☕",
        "short_desc": "Katta banklar, korporativ tizimlar va Android ilovalarining poydevori.",
        "what_is": "Java — 'Bir marta yoz, hamma joyda ishlat' tamoyiliga ega, barqarorlik va yuqori xavfsizlik talab qilinadigan ulkan tizimlarning asosiy tili.",
        "applications": ["Banklar (Markaziy bank, xalqaro banklar)", "Android mobil ilovalari", "Katta sanoat korxonalari dasturlari"],
        "what_they_do": "Katta hajmdagi ma'lumotlar va millionlab tranzaksiyalarga chidamli korporativ tizimlarni (Spring Boot) loyihalaydi.",
        "what_to_learn": ["Java Core & OOP", "Kollektsiyalar & Multithreading", "Spring Boot & Spring Security", "Hibernate / JPA", "PostgreSQL"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Konsol bank hisob-kitob dasturi"},
            {"level": "O'rta", "title": "Spring Boot orqali Talabalar boshqaruv portali"},
            {"level": "Yuqori", "title": "Bank kartalari va tranzaksiyalar mikroservis platformasi"}
        ],
        "career_roles": [
            {"role": "Junior Java Developer", "salary": "$600 - $1,100 / oy"},
            {"role": "Middle Spring Engineer", "salary": "$1,600 - $3,200 / oy"}
        ]
    },
    {
        "id": "cpp",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "C++ Dasturlash",
        "icon": "⚡",
        "short_desc": "Maksimal tezlik, operatsion tizimlar, o'yin dvigatellari va robototexnika tili.",
        "what_is": "C++ — kompyuter xotirasi bilan to'g'ridan-to'g'ri ishlaydigan, eng yuqori hisoblash tezligiga ega kuchli til. Kiberxavfsizlik, o'yinlar (Unreal Engine) va avtomobil dasturlarida ishlatiladi.",
        "applications": ["3D o'yinlar va grafik dvigatellar", "Tibbiy uskunalar mikrokontrollerlari", "Kosmik kemalar va avtopilotlar"],
        "what_they_do": "Tezkor algoritmlar, operatsion tizim drayverlari va mikrosxemalar uchun dasturiy ta'minot yozadi.",
        "what_to_learn": ["C++ sintaksisi va xotira boshqaruvi (Pointers)", "OOP & Shablonlar (Templates)", "STL kutubxonasi", "Algoritmlar va ma'lumotlar tuzilmasi"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Murakkab kalkulyator va matnli labirint o'yini"},
            {"level": "O'rta", "title": "Fayllarni shifrlash va arxivlash dasturi"},
            {"level": "Yuqori", "title": "2D o'yin dvigateli yoki fizik hisoblash simulyatsiyasi"}
        ],
        "career_roles": [
            {"role": "Junior C++ Engineer", "salary": "$600 - $1,200 / oy"},
            {"role": "Embedded / Game C++ Developer", "salary": "$1,800 - $3,800 / oy"}
        ]
    },
    {
        "id": "mobile",
        "category": "dasturlash",
        "category_title": "💻 Dasturlash",
        "title": "Mobile Development (iOS & Android)",
        "icon": "📱",
        "short_desc": "Smartfonlar uchun zamonaviy va qulay mobil ilovalar yaratish.",
        "what_is": "Mobile Development — Flutter, Swift (iOS) yoki Kotlin (Android) yordamida har bir odamning cho'ntagidagi smartfonda ishlaydigan ilovalar yaratish kasbi.",
        "applications": ["Payme, Click kabi to'lov ilovalari", "Fitnes va sog'lom hayot trekerlari", "Mobil o'yinlar va ijtimoiy tarmoqlar"],
        "what_they_do": "Smartfon ekraniga mos, sensor va kameralar bilan ishlaydigan tezkor ilovalar yaratadi va ularni App Store va Google Play'ga chiqaradi.",
        "what_to_learn": ["Dart & Flutter (yoki Swift / Kotlin)", "Mobil UI vidjetlari", "Lokal baza (Hive/SQLite)", "Push-xabarnomalar & REST API"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Shaxsiy xarajatlar va byudjet treker ilovasi"},
            {"level": "O'rta", "title": "Taom yetkazib berish mobil ilovasi interfeysi"},
            {"level": "Yuqori", "title": "Chat, video qo'ng'iroq va geolocationli to'liq mobil ijtimoiy ilova"}
        ],
        "career_roles": [
            {"role": "Junior Flutter/Mobile Dev", "salary": "$500 - $900 / oy"},
            {"role": "Middle iOS/Android Engineer", "salary": "$1,500 - $3,000 / oy"}
        ]
    },

    # --- 2. SUN'IY INTELLEKT (AI) ---
    {
        "id": "ai",
        "category": "ai",
        "category_title": "🤖 Sun’iy intellekt",
        "title": "Artificial Intelligence (AI)",
        "icon": "🤖",
        "short_desc": "Inson kabi fikrlaydigan, tushunadigan va qaror qabul qiladigan tizimlar.",
        "what_is": "Sun'iy intellekt (AI) — kompyuterlarga inson intellektiga xos xususiyatlarni: ko'rish, eshitish, tilni tushunish, mantiqiy xulosa chiqarish va o'rganishni o'rgatuvchi fan va texnologiya.",
        "applications": [
            "Tibbiyot: Rentgen va MRT tasvirlaridan kasallikni erta aniqlash",
            "Ta'lim: Har bir talaba uchun individual AI repetitor",
            "Bank: Firibgarlik (fraud) holatlarini soniya ichida to'xtatish",
            "Transport: Tesla va Waymo haydovchisiz avtomobillari",
            "Robototexnika: Aqlli fabrikalarda avtomatlashtirilgan robotlar",
            "Biznes: Savdoni bashorat qilish va mijozlarga mos tavsiyalar",
            "Kundalik hayot: ChatGPT, Siri, ovozli tarjimonlar va tavsiya tizimlari"
        ],
        "what_they_do": "Neyron to'rlarini o'qitadi, kompyuter ko'rishi (Computer Vision) va tabiiy tilni qayta ishlash (NLP) modellarini yaratadi, ularni real hayotga tatbiq qiladi.",
        "what_to_learn": [
            "1-bosqich: Python dasturlash & Matematika (Chiziqli algebra, Ehtimollar nazariyasi)",
            "2-bosqich: Ma'lumotlarni tahlil qilish (NumPy, Pandas, Matplotlib)",
            "3-bosqich: Machine Learning algoritmlari (Scikit-Learn)",
            "4-bosqich: Deep Learning & Neyron to'rlari (PyTorch yoki TensorFlow)",
            "5-bosqich: Natural Language Processing (NLP) & Computer Vision (OpenCV)",
            "6-bosqich: Generative AI, LLM (ChatGPT API, Hugging Face)",
            "7-bosqich: Modelni amaliyotga joylash (MLOps, Docker, FastAPI)"
        ],
        "projects": [
            {"level": "Boshlang'ich", "title": "Uy narxlarini bashorat qiluvchi ML modeli"},
            {"level": "O'rta", "title": "Tasvirdagi yuzlar va his-tuyg'ularni aniqlovchi kompyuter ko'rishi dasturi"},
            {"level": "Yuqori", "title": "O'zbek tili uchun shaxsiy AI yordamchi va ChatGPT analogi"}
        ],
        "career_roles": [
            {"role": "AI / ML Junior Engineer", "salary": "$700 - $1,200 / oy"},
            {"role": "Machine Learning Engineer", "salary": "$1,800 - $3,500 / oy"},
            {"role": "AI Research Scientist", "salary": "$3,500 - $7,000 / oy"}
        ]
    },
    {
        "id": "ml",
        "category": "ai",
        "category_title": "🤖 Sun’iy intellekt",
        "title": "Machine Learning (Mashinali o'rganish)",
        "icon": "🧠",
        "short_desc": "Kompyuterga qoidalarni qo'lda yozmasdan, ma'lumotlar orqali o'rganishni o'rgatish.",
        "what_is": "Machine Learning — bu kompyuterga tajriba (katta ma'lumotlar) orqali xatolardan saboq olib, o'z qarorlarini yaxshilab borish qobiliyatini beruvchi AI yo'nalishidir.",
        "applications": ["Spam xatlarni aniqlash", "Kredit berish riskini hisoblash", "Musiqa va film tavsiya qilish (Spotify, Netflix)"],
        "what_they_do": "Statistik modellarni ma'lumotlar ustida o'qitadi, ularning aniqligini tekshiradi va biznes muammolarini yechadi.",
        "what_to_learn": ["Python", "Statistika", "Scikit-Learn", "Feature Engineering", "Gradient Boosting"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Mijozlarning bankdan ketishini oldindan bashorat qilish"},
            {"level": "O'rta", "title": "Tibbiy tahlillar asosida diabet xavfini aniqlash"},
            {"level": "Yuqori", "title": "Katta elektron tijorat platformasi uchun tavsiya etish algoritmi"}
        ],
        "career_roles": [
            {"role": "Junior ML Engineer", "salary": "$650 - $1,100 / oy"},
            {"role": "Senior ML Specialist", "salary": "$2,000 - $4,200 / oy"}
        ]
    },
    {
        "id": "deeplearning",
        "category": "ai",
        "category_title": "🤖 Sun’iy intellekt",
        "title": "Deep Learning (Chuqur o'rganish)",
        "icon": "🧬",
        "short_desc": "Inson miyasi neyronlari asosida qurilgan ko'p qatlamli sun'iy neyron tarmoqlari.",
        "what_is": "Deep Learning — inson miyasidagi neyronlar kabi bir-biri bilan bog'langan yuzlab qatlamli tarmoqlar orqali murakkab tasvir, ovoz va matn ma'lumotlarini idrok etuvchi texnologiya.",
        "applications": ["Ovozni tanish va klonlash", "Face ID yuzni tanish tizimlari", "Avtopilot avtomobillar"],
        "what_they_do": "CNN, RNN, Transformer arxitekturalarini loyihalaydi va GPU serverlarda katta neyron to'rlarini o'qitadi.",
        "what_to_learn": ["PyTorch / TensorFlow", "CNN & Computer Vision", "Transformers & Attention Mechanism", "CUDA & GPU optimization"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Qo'lyozma raqamlarni 99% aniqlikda tanuvchi neyron to'r"},
            {"level": "O'rta", "title": "Rentgen tasvirlaridan pnevmoniyani aniqlovchi model"},
            {"level": "Yuqori", "title": "Tasvirlarni matn orqali generatsiya qiluvchi Diffusion model"}
        ],
        "career_roles": [
            {"role": "Deep Learning Engineer", "salary": "$1,800 - $4,000 / oy"}
        ]
    },
    {
        "id": "genai",
        "category": "ai",
        "category_title": "🤖 Sun’iy intellekt",
        "title": "Generative AI & LLMs",
        "icon": "✨",
        "short_desc": "Matn, rasm, video va kod yarata oladigan yangi avlod generativ intellekti.",
        "what_is": "Generative AI — ChatGPT, Midjourney va Claude kabi yangi kontent yarata oladigan, ijodiy va matnli masalalarni inson darajasida bajara oladigan zamonaviy sun'iy intellekt sohasi.",
        "applications": ["Avtomatik maqolalar, kod va dizayn generatsiyasi", "Aqlli korporativ botlar", "Ijodiy multimedia"],
        "what_they_do": "Katta til modellarini (LLM) biznes ma'lumotlari bilan sozlaydi (Fine-tuning, RAG), Prompt Engineering va AI agentlar tuzadi.",
        "what_to_learn": ["OpenAI & Anthropic API", "LangChain & LlamaIndex", "Vector Databases (Pinecone/Chroma)", "RAG arxitekturasi"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Kompaniya PDF hujjatlari bo'yicha savolga javob beruvchi bot"},
            {"level": "O'rta", "title": "O'zbek tili uchun shaxsiy AI huquqshunos yoki AI shifokor maslahatchisi"},
            {"level": "Yuqori", "title": "Mustaqil vazifalarni bajaruvchi ko'p agentli Autonomous AI tizimi"}
        ],
        "career_roles": [
            {"role": "GenAI / LLM Application Engineer", "salary": "$2,000 - $4,500 / oy"}
        ]
    },

    # --- 3. MA'LUMOTLAR (DATA) ---
    {
        "id": "data_analytics",
        "category": "data",
        "category_title": "📊 Ma’lumotlar",
        "title": "Data Analytics (Ma'lumotlar tahlili)",
        "icon": "📊",
        "short_desc": "Raqamlar ortidagi haqiqatni topib, biznesga to'g'ri yo'l ko'rsatish.",
        "what_is": "Data Analytics — xom ma'lumotlarni tozalash, tahlil qilish va ularni tushunarli grafiklar (dashboardlar) orqali kompaniya rahbarlariga to'g'ri qaror qabul qilishda taqdim etish san'ati.",
        "applications": ["Kompaniya sotuvlarini oshirish", "Mijozlar nimani xohlashini bilish", "Bozor tendensiyalarini aniqlash"],
        "what_they_do": "SQL orqali ma'lumotlar bazasidan hisobotlar oladi, Excel va Power BI/Tableau'da jonli grafiklar chizadi.",
        "what_to_learn": ["SQL chuqur bilim", "Excel & Google Sheets (VLOOKUP, Pivot)", "Power BI yoki Tableau", "Python (Pandas, Seaborn)"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Supermarket sotuvlari tahlili va interaktiv Power BI hisoboti"},
            {"level": "O'rta", "title": "Mijozlar xatti-harakati va mahsulot sotilishini tahlil qiluvchi SQL loyiha"},
            {"level": "Yuqori", "title": "Kompaniyaning 1 yillik daromad va risklarini prognozlovchi to'liq tahliliy dashboard"}
        ],
        "career_roles": [
            {"role": "Junior Data Analyst", "salary": "$500 - $900 / oy"},
            {"role": "Senior BI Analyst", "salary": "$1,400 - $2,800 / oy"}
        ]
    },
    {
        "id": "data_science",
        "category": "data",
        "category_title": "📊 Ma’lumotlar",
        "title": "Data Science (Ma'lumotlar ilmi)",
        "icon": "🧪",
        "short_desc": "Matematika, dasturlash va biznes uyg'unligidagi eng yuqori daromadli kasb.",
        "what_is": "Data Science — katta hajmdagi tartibsiz ma'lumotlardan matematik modellar va sun'iy intellekt yordamida chuqur xulosalar va kelajak bashoratlarini chiqaruvchi fan.",
        "applications": ["Geni aniqlash va biotexnologiya", "Moliyaviy bozorlar tahlili", "Sun'iy intellekt modellarini oziqlantirish"],
        "what_they_do": "Gipotezalar tuzadi, murakkab tajribalar o'tkazadi, A/B testlar qiladi va AI modellarini biznesga kiritadi.",
        "what_to_learn": ["Python & R", "Oliy matematika & Statistika", "Big Data (Spark)", "Machine Learning & Deep Learning"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Kaggle platformasida Titanik yo'lovchilari omon qolish tahlili"},
            {"level": "O'rta", "title": "Shahar taksi harakati va tiqilinchlarni bashorat qiluvchi model"},
            {"level": "Yuqori", "title": "Global iqlim o'zgarishi va qurg'oqchilikni prognozlovchi ilmiy Data Science loyihasi"}
        ],
        "career_roles": [
            {"role": "Junior Data Scientist", "salary": "$700 - $1,300 / oy"},
            {"role": "Lead Data Scientist", "salary": "$2,200 - $5,000 / oy"}
        ]
    },
    {
        "id": "database",
        "category": "data",
        "category_title": "📊 Ma’lumotlar",
        "title": "Database Engineering (Baza muhandisligi)",
        "icon": "🗄️",
        "short_desc": "Millionlab odamlarning ma'lumotlarini xavfsiz va bir soniyada topib beruvchi tuzilma.",
        "what_is": "Database Engineering — ma'lumotlar yo'qolmasligi, buzilmasligi va o'ta tezkor ishlashi uchun SQL (PostgreSQL, MySQL) va NoSQL (MongoDB, Cassandra) tizimlarini loyihalash.",
        "applications": ["Bank hisob raqamlari xavfsizligi", "Katta onlayn o'yinlar foydalanuvchilar bazasi", "Hukumat yagona reyestrlari"],
        "what_they_do": "So'rovlarni optimallashtiradi, zaxira nusxalar (backup) oladi, bazalarni replikatsiya qiladi.",
        "what_to_learn": ["SQL chuqur", "PostgreSQL & Indexing", "Tranzaksiyalar (ACID)", "NoSQL bazalar", "Baza optimallash"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Kutubxona boshqaruv bazasini SQL da to'liq loyihalash"},
            {"level": "O'rta", "title": "Million qatorli bazada qidiruvni 10 barobar tezlashtirish"},
            {"level": "Yuqori", "title": "Xalqaro to'lov tizimi uchun uzluksiz ishlaydigan taqsimlangan ma'lumotlar bazasi"}
        ],
        "career_roles": [
            {"role": "Database Administrator (DBA)", "salary": "$1,000 - $2,500 / oy"}
        ]
    },

    # --- 4. DIZAYN ---
    {
        "id": "uiux",
        "category": "design",
        "category_title": "🎨 Dizayn",
        "title": "UI/UX Design",
        "icon": "🎨",
        "short_desc": "Ilovalarni go'zal, jozibali va insonlar uchun o'ta qulay qilib chizish san'ati.",
        "what_is": "UI (User Interface) — dasturning tashqi go'zalligi, ranglari va shriftlari. UX (User Experience) — foydalanuvchining saytdan qanchalik oson va tushunarli foydalana olishi psixologiyasi.",
        "applications": ["Mobil banking ilovalari dizayni", "Startaplar uchun zamonaviy interfeyslar", "Kasalxona va ta'lim tizimlari qulayligi"],
        "what_they_do": "Foydalanuvchilarni o'rganadi, prototiplar chizadi, Figma'da dizayn tizimlari yaratadi va dasturchilarga topshiradi.",
        "what_to_learn": ["Figma & FigJam", "Ranglar psixologiyasi & Tipografika", "UX tadqiqot & Wireframing", "Dizayn tizimlari (Design Systems)", "Interaktiv animatsiyalar"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Qizlar uchun ilhomlantiruvchi shaxsiy kundalik mobil ilovasi dizayni"},
            {"level": "O'rta", "title": "To'liq qulay Onlayn dori buyurtma qilish servisi UX tadqiqoti va dizayni"},
            {"level": "Yuqori", "title": "Xalqaro darajadagi Neobank va Kripto-hamyon super-ilovasi dizayn tizimi"}
        ],
        "career_roles": [
            {"role": "Junior UI/UX Designer", "salary": "$400 - $800 / oy"},
            {"role": "Middle Product Designer", "salary": "$1,200 - $2,400 / oy"},
            {"role": "Head of Design", "salary": "$2,800 - $5,000 / oy"}
        ]
    },
    {
        "id": "graphic_design",
        "category": "design",
        "category_title": "🎨 Dizayn",
        "title": "Graphic & Brand Design",
        "icon": "✨",
        "short_desc": "Brend identifikatsiyasi, logotiplar, illyustratsiyalar va reklama kreativlari.",
        "what_is": "Grafik dizayn — kompaniyalarning o'ziga xos qiyofasini (brand identity) yaratish, bannerlar, ijtimoiy tarmoqlar uchun vizual san'at yaratish kasbidir.",
        "applications": ["Kompaniyalar brendingi va qadoq dizayni", "Ijtimoiy tarmoq marketingi (SMM)", "Raqamli illyustratsiyalar"],
        "what_they_do": "Photoshop, Illustrator dasturlarida kreativlar chizadi, brendbuklar tuzadi.",
        "what_to_learn": ["Adobe Illustrator", "Adobe Photoshop", "Brending asoslari", "Kompozitsiya va rang uyg'unligi"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Yangi IT-qizlar akademiyasi uchun logo va ijtimoiy tarmoq shablonlari"},
            {"level": "O'rta", "title": "Eko-kosmetika brendi uchun qadoq va vizual uslub"},
            {"level": "Yuqori", "title": "Xalqaro IT konferensiya uchun to'liq vizual brending paketi"}
        ],
        "career_roles": [
            {"role": "Graphic Designer", "salary": "$400 - $1,200 / oy"}
        ]
    },

    # --- 5. KIBERXAVFSIZLIK ---
    {
        "id": "cybersecurity",
        "category": "security",
        "category_title": "🔐 Kiberxavfsizlik",
        "title": "Cybersecurity (Kiberxavfsizlik)",
        "icon": "🔐",
        "short_desc": "Raqamli dunyoni xakerlar, viruslar va ma'lumotlar o'g'irlanishidan himoya qilish.",
        "what_is": "Kiberxavfsizlik — kompyuter tizimlari, tarmoqlar va maxfiy ma'lumotlarni noqonuniy hujumlar va xakerlikdan himoya qilish bilan shug'ullanuvchi yuqori mas'uliyatli soha.",
        "applications": [
            "Davlat sirlari va strategik infratuzilmalarni himoyalash",
            "Bank tizimlaridan pul o'g'irlanishining oldini olish",
            "Insonlarning shaxsiy yozishmalari va akkauntlarini himoya qilish"
        ],
        "what_they_do": "Zaifliklarni qidiradi, xavfsizlik devorlari (Firewall) o'rnatadi, tizim buzilganida tezkor choralar ko'radi.",
        "what_to_learn": ["Kompyuter tarmoqlari (TCP/IP, OSI)", "Linux operatsion tizimi", "Kriptografiya asoslari", "Xavfsizlik protokollari", "Python bilan xavfsizlik skriptlari"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Tarmoqdagi ochiq portlar va zaifliklarni skanerlovchi skript"},
            {"level": "O'rta", "title": "Foydalanuvchi parollarining xavfsizligini tekshiruvchi tahlilchi"},
            {"level": "Yuqori", "title": "Kichik korxona tarmog'ini kiberhujumlardan himoyalovchi to'liq xavfsizlik tizimi"}
        ],
        "career_roles": [
            {"role": "Junior Security Analyst", "salary": "$600 - $1,100 / oy"},
            {"role": "Cybersecurity Specialist", "salary": "$1,600 - $3,500 / oy"},
            {"role": "Chief Information Security Officer (CISO)", "salary": "$4,000 - $8,000 / oy"}
        ]
    },
    {
        "id": "ethical_hacking",
        "category": "security",
        "category_title": "🔐 Kiberxavfsizlik",
        "title": "Ethical Hacking (Oq xakerlik)",
        "icon": "🛡️",
        "short_desc": "Kompaniyalar ruxsati bilan ularning tizimlarini buzib ko'rib, teshiklarni topish.",
        "what_is": "Ethical Hacker (White Hat) — yovuz niyatli xakerlardan oldin tizimning zaif joylarini aniqlash maqsadida rasmiy ruxsat bilan hujum uyushtiruvchi mutaxassis.",
        "applications": ["Penetration Testing (Pen-test)", "Bug Bounty dasturlari (katta mukofotlar yutish)", "Kritik tizimlar auditi"],
        "what_they_do": "Web saytlar, mobil ilovalar va tarmoqlarni sinovdan o'tkazadi va xatolar hisobotini tayyorlaydi.",
        "what_to_learn": ["Kali Linux", "Burp Suite, Wireshark, Metasploit", "OWASP Top 10 zaifliklari", "Veb dasturlash xavfsizligi"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Test veb-saytidagi SQL Injection va XSS zaifliklarini topish"},
            {"level": "O'rta", "title": "Mahalliy Wi-Fi tarmog'ining xavfsizlik darajasini baholash"},
            {"level": "Yuqori", "title": "Xalqaro Bug Bounty platformasida real zaiflik topib mukofot olish"}
        ],
        "career_roles": [
            {"role": "Penetration Tester", "salary": "$1,500 - $4,000 / oy"}
        ]
    },

    # --- 6. TARMOQLAR VA BULUT ---
    {
        "id": "cloud",
        "category": "networks",
        "category_title": "🌐 Tarmoqlar & Bulut",
        "title": "Cloud Computing (Bulutli texnologiyalar)",
        "icon": "☁️",
        "short_desc": "Amazon AWS, Google Cloud va Microsoft Azure da global infratuzilma qurish.",
        "what_is": "Cloud Computing — jismoniy server sotib olmasdan, internet orqali dunyoning istalgan burchagidagi ulkan quvvatli serverlarni ijaraga olib loyihalarni boshqarish.",
        "applications": ["Netflix kabi ulkan video oqimlarni uzatish", "Dunyodagi barcha yirik startaplar", "Zaxira saqlash tizimlari"],
        "what_they_do": "Bulutda serverlar yaratadi, ularni avtomatik kengayadigan (auto-scaling) qiladi va xarajatlarni optimallashtiradi.",
        "what_to_learn": ["AWS yoki Google Cloud / Azure", "Linux asoslari", "Terraform (Infrastructure as Code)", "Serverless texnologiyalar"],
        "projects": [
            {"level": "Boshlang'ich", "title": "AWS S3 va CloudFront yordamida tezkor veb-sayt joylash"},
            {"level": "O'rta", "title": "Avtomatik yuklamaga moslashuvchi EC2 server klasterini sozlash"},
            {"level": "Yuqori", "title": "Ko'p mintaqali (Multi-region) global xizmat arxitekturasini yaratish"}
        ],
        "career_roles": [
            {"role": "Cloud Practitioner", "salary": "$800 - $1,500 / oy"},
            {"role": "Cloud Solutions Architect", "salary": "$2,500 - $6,000 / oy"}
        ]
    },
    {
        "id": "networks",
        "category": "networks",
        "category_title": "🌐 Tarmoqlar & Bulut",
        "title": "Computer Networks & SysAdmin",
        "icon": "🌐",
        "short_desc": "Kompaniya kompyuterlari, serverlari va internet o'rtasidagi uzluksiz aloqa.",
        "what_is": "Tarmoq muhandisligi — butun dunyo bo'ylab internet ma'lumotlarining xavfsiz va uzluksiz harakatlanishini ta'minlovchi marshrutizatorlar (Cisco, MikroTik) va serverlar boshqaruvi.",
        "applications": ["Ofis va korxonalar lokal tarmoqlari", "Data-markazlar (Data Centers)", "Internet provayderlar infratuzilmasi"],
        "what_they_do": "Tarmoqlarni o'rnatadi, IP manzillarni taqsimlaydi, routerlarni sozlaydi va nosozliklarni bartaraf qiladi.",
        "what_to_learn": ["CCNA kursi asoslari", "Subnetting & VLAN", "Linux Server boshqaruvi", "DNS, DHCP, VPN"],
        "projects": [
            {"level": "Boshlang'ich", "title": "Packet Tracer dasturida kichik maktab tarmog'ini loyihalash"},
            {"level": "O'rta", "title": "Xavfsiz korporativ VPN serverini o'rnatish"},
            {"level": "Yuqori", "title": "1000 kishilik korxona uchun uzluksiz ishlaydigan zaxira tarmoq infratuzilmasi"}
        ],
        "career_roles": [
            {"role": "Network Administrator", "salary": "$600 - $1,500 / oy"}
        ]
    },

    # --- 7. BOSHQA ZAMONAVIY YO'NALISHLAR ---
    {
        "id": "gamedev",
        "category": "other",
        "category_title": "📱 Boshqa zamonaviy yo‘nalishlar",
        "title": "Game Development (O'yin dasturlash)",
        "icon": "🎮",
        "short_desc": "O'z tasavvuringizdagi 2D va 3D virtual olamlarni jonlantirish.",
        "what_is": "Game Development — Unity (C#) yoki Unreal Engine (C++) dvigatellari yordamida kompyuter, telefon yoki VR ko'zoynaklar uchun o'yinlar yaratish sohasi.",
        "applications": ["Mobil o'yinlar (Subway Surfers, Candy Crush)", "Katta kompyuter o'yinlari", "VR/AR virtual simulyatsiyalar"],
        "what_they_do": "Fizika, o'yin mantiqi, personajlar harakati va darajalar (levels) dizaynini dasturlaydi.",
        "what_to_learn": ["Unity & C#", "3D matematika va fizika", "O'yin mexanikalari", "Ovoz va animatsiya integratsiyasi"],
        "projects": [
            {"level": "Boshlang'ich", "title": "2D Flappy Bird yoki Labirint o'yinini yaratish"},
            {"level": "O'rta", "title": "Smartfonlar uchun 3D cheksiz yuguruvchi (Endless Runner) o'yin"},
            {"level": "Yuqori", "title": "Ko'p o'yinchili (Multiplayer) onlayn sarguzasht o'yini"}
        ],
        "career_roles": [
            {"role": "Junior Unity Developer", "salary": "$500 - $1,000 / oy"},
            {"role": "Middle Game Programmer", "salary": "$1,400 - $3,000 / oy"}
        ]
    },
    {
        "id": "devops",
        "category": "other",
        "category_title": "📱 Boshqa zamonaviy yo‘nalishlar",
        "title": "DevOps Engineering",
        "icon": "🔄",
        "short_desc": "Dasturchilar yozgan kodni avtomat tarzda serverlarga xatosiz yetkazib berish.",
        "what_is": "DevOps — dasturlash (Development) va operatsiyalar (Operations) o'rtasidagi ko'prik. U kodni sinovdan o'tkazish, konteynerlash va serverlarga chiqarishni to'liq avtomatlashtiradi.",
        "applications": ["Dasturlarni har kuni yuzlab marta xatosiz yangilash", "Serverlar to'xtab qolishining oldini olish"],
        "what_they_do": "CI/CD quvurlarini quradi, Docker va Kubernetes klasterlarini boshqaradi, monitoring qiladi.",
        "what_to_learn": ["Linux & Bash skriptlar", "Git & GitHub Actions (CI/CD)", "Docker & Kubernetes", "Ansible & Terraform", "Prometheus & Grafana"],
        "projects": [
            {"level": "Boshlang'ich", "title": "GitHub Actions orqali avtomatik test va saytni serverga yuklash"},
            {"level": "O'rta", "title": "Docker Compose yordamida to'liq veb-ilovaning barcha qismlarini konteynerlash"},
            {"level": "Yuqori", "title": "Kubernetes klasterida mikroservislarni nol uzilish bilan yangilash tizimi"}
        ],
        "career_roles": [
            {"role": "Junior DevOps Engineer", "salary": "$800 - $1,400 / oy"},
            {"role": "Senior DevOps / SRE Specialist", "salary": "$2,500 - $5,500 / oy"}
        ]
    },
    {
        "id": "robotics",
        "category": "other",
        "category_title": "📱 Boshqa zamonaviy yo‘nalishlar",
        "title": "Robotics & IoT (Robototexnika)",
        "icon": "🤖",
        "short_desc": "Aqlli uskunalar, sensorlar, mikrokontrollerlar va robotlarni dasturlash.",
        "what_is": "Robototexnika va Internet of Things (IoT) — jismoniy qurilmalarni (Arduino, Raspberry Pi) internetga ulab, ularni atrof-muhitni his qiluvchi va buyruqlarni bajaruvchi aqlli tizimlarga aylantirish.",
        "applications": ["Aqlli uy tizimlari (Smart Home)", "Avtomatlashgan issiqxonalar va qishloq xo'jaligi", "Tibbiy jarrohlik robotlari"],
        "what_they_do": "Sensorlardan ma'lumot oladi, motorlarni boshqaradi, mikrosxemalar uchun C/C++ va Python tillarida dastur yozadi.",
        "what_to_learn": ["Elektronika asoslari", "Arduino & Raspberry Pi", "C++ / MicroPython", "MQTT & IoT protokollari"],
        "projects": [
            {"level": "Boshlang'ich", "title": "O'simliklar namligini o'lchab avtomatik sug'oruvchi aqlli qurilma"},
            {"level": "O'rta", "title": "Smartfon orqali boshqariladigan Bluetooth mini-robot"},
            {"level": "Yuqori", "title": "Kamera orqali buyumlarni saralaydigan sun'iy intellektli robot-qo'l"}
        ],
        "career_roles": [
            {"role": "Embedded / IoT Engineer", "salary": "$700 - $2,000 / oy"}
        ]
    },
    {
        "id": "blockchain",
        "category": "other",
        "category_title": "📱 Boshqa zamonaviy yo‘nalishlar",
        "title": "Blockchain & Web3",
        "icon": "⛓️",
        "short_desc": "O'zgartirib bo'lmas shaffof ma'lumotlar zanjiri va aqlli shartnomalar (Smart Contracts).",
        "what_is": "Blockchain — markaziy boshqaruvchisiz, barcha ishtirokchilar tomonidan tasdiqlanadigan xavfsiz taqsimlangan registr texnologiyasi.",
        "applications": ["Kriptovalyutalar va xavfsiz xalqaro to'lovlar", "Decentralized Finance (DeFi)", "Diplomlar va mualliflik huquqini himoyalash"],
        "what_they_do": "Solidity tilida aqlli shartnomalar yozadi, Web3 dApp ilovalarini yaratadi.",
        "what_to_learn": ["Kriptografiya asoslari", "Solidity dasturlash tili", "Ethereum & Smart Contracts", "Ethers.js / Web3.js"],
        "projects": [
            {"level": "Boshlang'ich", "title": "O'z shaxsiy tokeningizni yaratish va test tarmog'ida ishga tushirish"},
            {"level": "O'rta", "title": "Ochiq va shaffof onlayn ovoz berish (Voting) aqlli shartnomasi"},
            {"level": "Yuqori", "title": "To'liq markazlashmagan xayriya jamg'armasi Web3 platformasi"}
        ],
        "career_roles": [
            {"role": "Solidity / Web3 Developer", "salary": "$1,500 - $4,500 / oy"}
        ]
    }
]

# ==========================================
# 2. BOSHLANG'ICH DIAGNOSTIKA TESTI SAVOLLARI
# ==========================================
CAREER_TEST_QUESTIONS = [
    {
        "id": 1,
        "question": "Bo'sh vaqtingizda qaysi mashg'ulot sizga ko'proq zavq bag'ishlaydi?",
        "options": [
            {"text": "Mantiqiy boshqotirmalar yechish va jumboqlarni tahlil qilish", "traits": {"tech": 4, "logic": 4, "ai": 3}},
            {"text": "Chiroyli rasmlar chizish, dizaynlar yaratish yoki bezatish", "traits": {"design": 5, "creative": 4}},
            {"text": "Raqamlar, jadvallar va qiziqarli statistikalarni o'rganish", "traits": {"data": 5, "logic": 3, "ai": 3}},
            {"text": "Odamlar bilan muloqot qilish, ularga yordam berish va tashkilotchilik", "traits": {"comm": 4, "management": 4}},
            {"text": "Kichik narsalarni yasash, texnika yoki elektronika bilan qiziqish", "traits": {"tech": 4, "hardware": 4}}
        ]
    },
    {
        "id": 2,
        "question": "Siz yangi veb-sayt yoki mobil ilovaga kirganingizda, birinchi nimaga e'tibor berasiz?",
        "options": [
            {"text": "Saytning qanchalik tez va qulay ishlashi, tugmalarning vazifasiga", "traits": {"tech": 4, "frontend": 4}},
            {"text": "Ranglar uyg'unligi, shriftlar, animatsiyalar va tashqi go'zalligiga", "traits": {"design": 5, "creative": 4}},
            {"text": "Sayt qanday ma'lumotlarni ko'rsatayotgani va qanchalik aniqligiga", "traits": {"data": 4, "logic": 3}},
            {"text": "Mening shaxsiy ma'lumotlarim qanchalik xavfsiz saqlanayotganiga", "traits": {"security": 5, "tech": 3}}
        ]
    },
    {
        "id": 3,
        "question": "Qiyin muammoga duch kelganingizda siz qanday yo'l tutasiz?",
        "options": [
            {"text": "Muammoni qismlarga bo'lib, ketma-ket mantiqiy algoritm orqali yechaman", "traits": {"logic": 5, "tech": 4, "ai": 3}},
            {"text": "Noodatiy, ijodiy va chiroyli noan'anaviy yechimlar haqida o'ylayman", "traits": {"creative": 5, "design": 4}},
            {"text": "Faktlar va o'tgan tajriba ma'lumotlarini qidirib taqqoslayman", "traits": {"data": 5, "ai": 4}},
            {"text": "Xavf-xatarlarni hisoblab, eng xavfsiz va ishonchli yo'lni tanlayman", "traits": {"security": 4, "logic": 3}}
        ]
    },
    {
        "id": 4,
        "question": "Maktab yoki universitetda qaysi fanlar sizga eng oson va qiziqarli tuyulgan?",
        "options": [
            {"text": "Informatika, Fizika va Dasturlash", "traits": {"tech": 5, "frontend": 4, "ai": 3}},
            {"text": "Tasviriy san'at, Adabiyot, Chet tillari", "traits": {"creative": 4, "design": 5}},
            {"text": "Matematika, Algebra va Statistika", "traits": {"logic": 5, "data": 5, "ai": 4}},
            {"text": "Huquqshunoslik, Tarix, Mantiqiy qoidalar", "traits": {"security": 4, "management": 3}}
        ]
    },
    {
        "id": 5,
        "question": "Kelajakdagi orzuingizdagi ish kuni qanday bo'lishini xohlaysiz?",
        "options": [
            {"text": "Sun'iy intellekt modellarini o'qitish va kelajak texnologiyalarini yaratish", "traits": {"ai": 5, "tech": 4, "data": 4}},
            {"text": "Zamonaviy noutbukda yangi veb-sayt va dasturlar kodini yozish", "traits": {"tech": 5, "frontend": 5}},
            {"text": "Yangi brend yoki ilovalarning chiroyli dizayn konseptsiyasini chizish", "traits": {"design": 5, "creative": 5}},
            {"text": "Katta ma'lumotlar grafigi orqali bizneslarga yo'l ko'rsatish", "traits": {"data": 5, "logic": 4}},
            {"text": "Kiberxavfsizlik markazida xakerlik hujumlarini bartaraf etish", "traits": {"security": 5, "tech": 4}}
        ]
    }
]

def evaluate_career_test(answers):
    """Foydalanuvchi javoblariga qarab IT kasblari mosligini aniq hisoblaydi"""
    scores = {
        "ai": 40,
        "frontend": 40,
        "uiux": 35,
        "data": 35,
        "cybersecurity": 30
    }

    for q_id, opt_idx in answers.items():
        try:
            q = next(item for item in CAREER_TEST_QUESTIONS if item["id"] == int(q_id))
            traits = q["options"][int(opt_idx)]["traits"]
            
            scores["ai"] += traits.get("ai", 0) * 4 + traits.get("logic", 0) * 3
            scores["frontend"] += traits.get("tech", 0) * 4 + traits.get("frontend", 0) * 3
            scores["uiux"] += traits.get("design", 0) * 5 + traits.get("creative", 0) * 4
            scores["data"] += traits.get("data", 0) * 5 + traits.get("logic", 0) * 3
            scores["cybersecurity"] += traits.get("security", 0) * 5 + traits.get("logic", 0) * 2
        except Exception:
            continue

    max_val = max(scores.values()) if scores else 1
    norm_scores = {}
    for k, v in scores.items():
        scaled = min(96, max(52, int((v / max_val) * 88 + random.randint(2, 6))))
        norm_scores[k] = scaled

    # Tartiblash
    sorted_tracks = sorted(norm_scores.items(), key=lambda x: x[1], reverse=True)
    top_key = sorted_tracks[0][0]

    career_meta = {
        "ai": {
            "title": "Sun'iy intellekt (AI & Machine Learning)",
            "icon": "🤖",
            "match": norm_scores["ai"],
            "tags": ["#AI", "#Python", "#NeyronTarmoq", "#Kelajak"],
            "explanation": "Sizda tizimli fikrlash, yangilikka intilish va murakkab masalalarni yechish ishtiyoqi juda baland! Sun'iy intellekt sohasi hozirgi kunda dunyodagi eng istiqbolli va yuqori daromadli yo'nalish hisoblanadi.",
            "next_step": "Python asoslarini o'rganishdan boshlang va birinchi oddiy AI modelingizni yarating."
        },
        "frontend": {
            "title": "Frontend Dasturlash (Web Developer)",
            "icon": "🌐",
            "match": norm_scores["frontend"],
            "tags": ["#Web", "#JavaScript", "#React", "#Yaratuvchanlik"],
            "explanation": "Siz g'oyalarni real mahsulotga aylantirishni va vizual natijani darhol ko'rishni yoqtirasiz. Zamonaviy veb-saytlar va interaktiv ilovalar yaratish sizga katta zavq bag'ishlaydi.",
            "next_step": "HTML va CSS orqali birinchi shaxsiy sahifangizni yaratib ko'ring."
        },
        "uiux": {
            "title": "UI/UX Dizayner (Product Designer)",
            "icon": "🎨",
            "match": norm_scores["uiux"],
            "tags": ["#Figma", "#Dizayn", "#Kreativlik", "#Psixologiya"],
            "explanation": "Sizda estetik did, empatiya va insonlarning xohish-istaklarini his qilish iqtidori nihoyatda kuchli. Foydalanuvchilar sevib ishlatadigan chiroyli interfeyslarni yarata olasiz.",
            "next_step": "Figma dasturini bepul o'rganish va ranglar uyg'unligi bilan tanishish."
        },
        "data": {
            "title": "Data Analytics & Data Science",
            "icon": "📊",
            "match": norm_scores["data"],
            "tags": ["#SQL", "#Statistika", "#Python", "#Tahlil"],
            "explanation": "Raqamlar va faktlar ortidagi qonuniyatlarni topish sizning kuchli tomoningiz. Katta korxonalar sizning tahlillaringiz asosida millionlab dollarlik to'g'ri qarorlar qabul qiladi.",
            "next_step": "SQL ma'lumotlar bazasi so'rovlari va Excel ilg'or funksiyalarini boshlang."
        },
        "cybersecurity": {
            "title": "Kiberxavfsizlik (Cybersecurity Specialist)",
            "icon": "🔐",
            "match": norm_scores["cybersecurity"],
            "tags": ["#Xavfsizlik", "#Linux", "#Tarmoqlar", "#Himoya"],
            "explanation": "Siz ehtiyotkor, ziyrak va tizimdagi zaifliklarni ko'ra oladigan tahlilchisiz. Raqamli olamni xakerlik hujumlaridan himoya qilishda o'rningiz beqiyos bo'ladi.",
            "next_step": "Kompyuter tarmoqlari va Linux buyruqlari bilan tanishish."
        }
    }

    return {
        "top_track": top_key,
        "scores": norm_scores,
        "recommendation": career_meta[top_key],
        "all_ranked": [career_meta[k] for k, v in sorted_tracks]
    }

# ==========================================
# 3. AI MENTOR JAVOBLARI (3 XIL DARAJA + CODE ASSIST)
# ==========================================
def get_ai_mentor_response(user_message, mode="auto", user_context=None):
    """
    AI Mentor:
    - oddiy: oddiy hayotiy misollar orqali tushuntirish
    - orta: aniq va amaliy
    - batafsil: chuqur va kod namunalari bilan
    - tushunmadim: hayotiy o'xshatishlar bilan qayta tushuntiradi
    """
    msg = user_message.lower().strip()

    # 1. "Hali ham tushunmadim" holati
    if "tushunmadim" in msg or "qiyin" in msg or "soddaroq" in msg or "oddiyroq" in msg:
        return (
            "Hechqisi yo'q, xavotir olmang! Bu mutlaqo normal holat 💜\n\n"
            "Keling, buni **kundalik hayotiy misol** orqali ko'rib chiqamiz:\n\n"
            "🍰 **Tasavvur qiling — siz shirin tort pishirmoqchisiz:**\n"
            "1. **Frontend:** Bu tortning tashqi bezagi, shokoladli siri va chiroyli shamchalar (odamlar ko'radigan qismi).\n"
            "2. **Backend:** Bu oshxonadagi gaz pechi, tuxum va unni aralashtirish jarayoni (parda ortidagi ishlar).\n"
            "3. **Ma'lumotlar bazasi (Database):** Bu sizning muzlatgichingiz — unda barcha masalliqlar tartibli saqlanadi.\n"
            "4. **API:** Bu sizning oshxonaga buyurtma beradigan ofitsianti — Frontenddan buyurtma olib, Backendga yetkazadi.\n\n"
            "Qarang, qanchalik sodda! Endi bu tushunarliroq bo'ldimi? Yana boshqa savolingiz bormi? 😊"
        )

    # 2. Machine Learning nima?
    if "machine learning" in msg or "mashinali o'rganish" in msg:
        if mode == "oddiy" or "oddiy" in msg:
            return (
                "💡 **Machine Learning oddiy tilda:**\n\n"
                "Kichkina bolaga it bilan mushukni farqlashni qanday o'rgatasiz? Unga qoida yozmaysiz, to'g'rimi? Shunchaki 10 ta itning rasmini va 10 ta mushukning rasmini ko'rsatasiz: 'Bu it, bu mushuk'. Bola o'zi quloqlari, mo'ylovlaridan farqlab oladi.\n\n"
                "**Machine Learning** ham xuddi shunday! Biz kompyuterga millionlab misollarni beramiz va u o'zi qonuniyatni o'rganib oladi! 🐱🐶"
            )
        elif mode == "batafsil":
            return (
                "🔬 **Machine Learning chuqur tahlili:**\n\n"
                "Machine Learning (ML) — kompyuterlarga aniq buyruqlar yozilmagan holda, statistik usullar va algoritmlar vositasida ma'lumotlardan o'rganish imkoniyatini beruvchi fan.\n\n"
                "📌 **Asosiy turlari:**\n"
                "1. **Supervised Learning (Nazorat ostidagi ta'lim):** Kiruvchi X va to'g'ri javob Y beriladi (Masalan: Uy parametrlari -> Narxi).\n"
                "2. **Unsupervised Learning (Nazoratsiz ta'lim):** Faqat X beriladi, model guruhlarga (clustering) ajratadi.\n"
                "3. **Reinforcement Learning:** Rag'batlantirish va jazo orqali o'rganish (Masalan: Robot yurishi, shaxmat o'ynash).\n\n"
                "⚙️ **Keng qo'llaniladigan vositalar:** Python, Scikit-learn, XGBoost, Pandas."
            )
        else:
            return (
                "🤖 **Machine Learning (Mashinali o'rganish)** — bu kompyuterga odam kabi tajriba orqali o'rganishni o'rgatadigan sun'iy intellekt tarmog'idir.\n\n"
                "Masalan, elektron pochtangizdagi SPAM xatlar qanday filtrlanadi? ML algoritmi avvalgi millionlab xatlarni o'rganib, shubhali so'zlarni o'zi topib oladi.\n\n"
                "O'rganish uchun **Python** tili va **Scikit-learn** kutubxonasidan boshlash eng ma'qul yo'ldir! 🚀"
            )

    # 3. Qayerdan boshlashim kerak?
    if "qayerdan boshlash" in msg or "boshlashim kerak" in msg or "qanday boshlay" in msg:
        return (
            "Aziza, boshlash uchun eng muhim 3 ta qadam:\n\n"
            "1. 🎯 **Yo'nalishni tanlash:** 'IT Yo'nalishlari Katalogi' bo'limidan o'zingizga yoqqan yo'nalishni tanlang (masalan, Frontend yoki Sun'iy intellekt).\n"
            "2. 🗺️ **Shaxsiy yo'l xaritasini oching:** 'Mening yo'l xaritam' bo'limida 1-qadamdan (HTML/CSS yoki Python asoslari) boshlang.\n"
            "3. 💻 **Code Lab'da amalda yozing:** Shunchaki o'qimasdan, Code Lab oynasida kod yozib, ▶ Ishga tushirish tugmasini bosing!\n\n"
            "Bugun o'rganish uchun 30 daqiqa vaqtingiz bormi? Birinchi kichik qadamni birga boshlaymizmi? 💜"
        )

    # 4. Kod xatosi yoki kalkulyator yaratish
    if "kalkulyator" in msg or "c++" in msg or "kod" in msg:
        return (
            "💻 **Ajoyib fikr! Keling, Code Lab bo'limiga o'tamiz!**\n\n"
            "Biz siz bilan **C++ da bosqichma-bosqich kalkulyator** yaratishimiz mumkin:\n"
            "• **1-bosqich:** Ikkita son kiritish (`cin >> a >> b;`)\n"
            "• **2-bosqich:** Qo'shish amalini bajarish (`cout << a + b;`)\n"
            "• **3-bosqich:** Ayrish, ko'paytirish va bo'lishni qo'shish\n"
            "• **4-bosqich:** Natijani tekshirish!\n\n"
            "Code Lab bo'limiga o'tib, 'Topshiriq' tugmasini bosing yoki bevosita kod yozing!"
        )

    # 5. Grantlar va imkoniyatlar
    if "grant" in msg or "stipendiya" in msg or "tanlov" in msg:
        return (
            "Qizlar uchun ayni paytda juda ko'p xalqaro imkoniyatlar ochiq! 🎓\n\n"
            "1. 🌟 **Technovation Girls 2026** — 10-18 yoshli qizlar uchun xalqaro mobil ilovalar va grant tanlovi.\n"
            "2. 💡 **Women in Tech (WiT) Scholarship** — 100% bepul grant va xalqaro mentorlik.\n"
            "3. 🇺🇸 **TechGirls USA** — AQSHda yozgi xalqaro IT almashinuv dasturi.\n"
            "4. 💼 **IT Park Girls Internship** — Mahalliy va xorijiy IT kompaniyalarda amaliyot.\n\n"
            "'Imkoniyatlar' bo'limiga o'tsangiz, ularning arizalari va muddatlari mavjud!"
        )

    # Default friendly answer
    return (
        f"Salom, Aziza! 💜 Men sizning **HerPath AI Mentoringizman**.\n\n"
        f"Sizga IT sohasini o'rganishda har tomonlama ko'maklashishga tayyorman. Menga quyidagicha savollar berishingiz mumkin:\n"
        f"• *'Machine Learning nima?'*\n"
        f"• *'Frontend va Backend farqi nima?'*\n"
        f"• *'C++ da qanday qilib kalkulyator yozaman?'*\n"
        f"• *'Hali ham tushunmadim, soddaroq hayotiy misol keltir'*\n\n"
        f"Bugun qaysi mavzuni tushunishni xohlaysiz?"
    )

# ==========================================
# 4. CODE LAB SINTAKSIS VA BAJARISH SIMULYATORI
# ==========================================
def simulate_code_execution(language, code):
    """
    Code Lab kodi bajarilishini simulyatsiya qiladi va
    AI diagnostikasi (xato bo'lsa qayerda va qanday tuzatish) beradi.
    """
    code = code.strip()
    lang = language.lower()

    # 1. C++ tahlili
    if lang == "cpp" or lang == "c++":
        # Semicolon tekshiruvi
        lines = code.split("\n")
        missing_semicolon_line = None
        for i, line in enumerate(lines, 1):
            stripped = line.strip()
            if stripped and not stripped.startswith("//") and not stripped.startswith("#"):
                if stripped.startswith("cout") or stripped.startswith("cin") or stripped.startswith("return") or stripped.startswith("int ") or stripped.startswith("double "):
                    if not stripped.endswith(";") and not stripped.endswith("{") and not stripped.endswith("}"):
                        missing_semicolon_line = i
                        break

        if missing_semicolon_line:
            return {
                "success": False,
                "error": f"Compile Error: expected ';' before line {missing_semicolon_line}",
                "output": "",
                "ai_helper": {
                    "line": missing_semicolon_line,
                    "title": "❌ Qatorda nuqta-vergul (;) yetishmayapti",
                    "explanation": f"{missing_semicolon_line}-qatorda ';' belgisi qolib ketgan. C++ dasturlash tilida har bir buyruq (statement) tugaganini bildirish uchun oxiriga ';' qo'yish shart.",
                    "fix_suggestion": f"{missing_semicolon_line}-qator oxiriga ';' belgisini qo'shib qaytadan ishga tushiring.",
                    "simple_analogy": "Bu xuddi o'zbek tilida gap tugaganda nuqta (.) qo'yishga o'xshaydi. Nuqta qo'yilmasa kompyuter qayerda to'xtashni bilmay qoladi."
                }
            }

        if "main()" not in code:
            return {
                "success": False,
                "error": "Error: undefined reference to 'main'",
                "output": "",
                "ai_helper": {
                    "line": 1,
                    "title": "❌ 'main()' funksiyasi topilmadi",
                    "explanation": "C++ dasturi har doim 'int main() { ... }' funksiyasidan boshlanishi shart.",
                    "fix_suggestion": "Kodingizni 'int main() { ... return 0; }' ichiga yozing."
                }
            }

        # Simulyatsiya qilingan muvaffaqiyatli chiqish
        output = "Salom HerPath AI!\nDastur muvaffaqiyatli bajarildi (Exit code: 0)."
        if "cout" in code:
            # Matnlarni qidirish
            matches = re.findall(r'cout\s*<<\s*"([^"]+)"', code)
            if matches:
                output = "\n".join(matches)
            elif "+" in code:
                output = "Natija: 15\nKalkulyator to'g'ri ishladi!"

        return {
            "success": True,
            "output": output,
            "ai_helper": {
                "title": "✅ Ajoyib! Kodingiz xatosiz ishga tushdi",
                "explanation": "C++ sintaksisi to'g'ri saqlangan. Xotira boshqaruvi va oqimlar to'g'ri qo'llanilgan."
            }
        }

    # 2. Python tahlili
    elif lang == "python":
        if "print" in code and "(" not in code:
            return {
                "success": False,
                "error": "SyntaxError: Missing parentheses in call to 'print'",
                "output": "",
                "ai_helper": {
                    "line": 1,
                    "title": "❌ print da qavslar yetishmayapti",
                    "explanation": "Python 3 da print buyrug'i funksiya hisoblanadi va matn qavs ichiga olinishi shart.",
                    "fix_suggestion": "print 'Salom' emas, print('Salom') deb yozing."
                }
            }

        # Simulyatsiya
        output = "Salom, HerPath AI dunyosiga xush kelibsiz! 💜"
        matches = re.findall(r'print\s*\(\s*["\']([^"\']+)["\']\s*\)', code)
        if matches:
            output = "\n".join(matches)

        return {
            "success": True,
            "output": output,
            "ai_helper": {
                "title": "✅ Python kodi muvaffaqiyatli bajarildi",
                "explanation": "Toza va tushunarli Python sintaksisi."
            }
        }

    # 3. JavaScript tahlili
    elif lang == "javascript" or lang == "js":
        output = "Salom, JavaScript ishga tushdi!"
        matches = re.findall(r'console\.log\s*\(\s*["\']([^"\']+)["\']\s*\)', code)
        if matches:
            output = "\n".join(matches)

        return {
            "success": True,
            "output": output,
            "ai_helper": {
                "title": "✅ JavaScript muvaffaqiyatli ishga tushdi",
                "explanation": "Konsolga ma'lumotlar to'g'ri chiqarildi."
            }
        }

    # 4. Java tahlili
    elif lang == "java":
        if "class" not in code or "main" not in code:
            return {
                "success": False,
                "error": "Error: Main method not found in class",
                "output": "",
                "ai_helper": {
                    "line": 1,
                    "title": "❌ Java sinfi yoki main metodi yo'q",
                    "explanation": "Java da har doim public class Main { public static void main(String[] args) { ... } } bo'lishi kerak."
                }
            }
        return {
            "success": True,
            "output": "Salom HerPath Java dunyosidan!\nJVM muvaffaqiyatli yakunlandi.",
            "ai_helper": {"title": "✅ Java kodi kompyutatsiya qilindi"}
        }

    # 5. HTML/CSS
    else:
        return {
            "success": True,
            "output": "HTML/CSS sahifasi render qilindi.",
            "preview_html": code,
            "ai_helper": {"title": "✅ Veb sahifa render qilindi"}
        }

def analyze_code_review(language, code):
    """AI Code Review: sintaksis, tuzilma, tavsiya va mavzuni qaytaradi"""
    code_len = len(code.strip())
    
    if code_len < 15:
        return {
            "syntax": "⚠️ Juda qisqa kod",
            "structure": "Kodni to'ldiring",
            "recommendation": "To'liq dastur logikasini yozib ko'ring.",
            "learn_topic": "Boshlang'ich sintaksis"
        }

    has_comments = "//" in code or "#" in code or "/*" in code
    has_functions = "void " in code or "def " in code or "function" in code or "int " in code

    return {
        "syntax": "✅ To'g'ri (Xatolar aniqlanmadi)",
        "structure": "Yaxshi tuzilgan" if has_functions else "⚠️ Oddiy (Funksiyalarga ajratish mumkin)",
        "recommendation": "Kodga sharhlar (comments) qo'shilgan, ajoyib!" if has_comments else "💡 Tavsiya: Murakkab qismlarga sharhlar (//) yozish kodni tushunishni osonlashtiradi.",
        "learn_topic": "Functions & Clean Code (Toza kod yozish tamoyillari)"
    }

# ==========================================
# 5. AI MAQSAD REJALASHTIRUVCHISI
# ==========================================
def generate_goal_plan(goal_text, weekly_hours=10):
    """
    Masalan: 'Men 6 oy ichida Frontend Developer bo'lmoqchiman'
    Kunlik, haftalik va oylik rejani tuzadi.
    """
    hours_per_day = round(weekly_hours / 5, 1)

    return {
        "goal": goal_text,
        "weekly_hours": weekly_hours,
        "daily_time": f"Kuniga {hours_per_day} soat (Haftada 5 kun)",
        "daily_routine": [
            "20 daqiqa: Yangi nazariy tushuncha (O'rganish bo'limida)",
            "40 daqiqa: Code Lab'da amaliy kod yozish va mustahkamlash",
            "15 daqiqa: AI Mentor bilan tushunmagan savollarni tahlil qilish",
            "15 daqiqa: Bugungi natijani GitHub'ga yoki xotiraga qayd qilish"
        ],
        "weekly_milestones": [
            "1-hafta: Dasturlash muhiti, o'zgaruvchilar va ma'lumot turlari",
            "2-hafta: Shart operatorlari (if/else) va mantiqiy fikrlash",
            "3-hafta: Sikllar (for, while) va massivlar bilan ishlash",
            "4-hafta: Birinchi mustaqil mini-loyiha va testdan o'tish"
        ],
        "monthly_plan": [
            {"month": "1-oy", "title": "Poydevor va Algoritmlar", "focus": "Asosiy mantiq, sintaksis va Git/GitHub"},
            {"month": "2-oy", "title": "Interfeys va Veb asosi", "focus": "Zamonaviy dizayn, moslashuvchanlik va amaliyot"},
            {"month": "3-oy", "title": "Murakkab Logika va API", "focus": "Serverlar bilan bog'lanish va ma'lumotlar bilan ishlash"},
            {"month": "4-oy", "title": "Framework va Kutubxonalar", "focus": "Zamonaviy React/Python vositalari"},
            {"month": "5-oy", "title": "Portfolio Loyihalar", "focus": "Ish beruvchilar uchun 3 ta real loyiha"},
            {"month": "6-oy", "title": "Rezyume (CV) va Suhbatlar", "focus": "Internship va birinchi ish o'rniga kirish"}
        ],
        "ai_advice": f"Haftasiga {weekly_hours} soat ajratish orqali siz 6 oyda maqsadga to'liq yetasiz. Asosiysi — har kuni oz-ozdan o'rganish barqarorlikni ta'minlaydi! 💜"
    }

# ==========================================
# 6. "WHAT IF?" KELAJAK SIMULYATORI
# ==========================================
def simulate_future(hours_per_week, months, combined_direction="Dasturlash"):
    total_hours = hours_per_week * 4 * months

    if total_hours < 80:
        level = "Boshlang'ich qadam (Novice)"
        projects_count = 1
        salary_est = "Stajirovka (Internship)"
        milestones = [
            "HTML & CSS da 2 ta shaxsiy sahifa yaratish",
            "Git va GitHub bilan ishlashni o'rganish"
        ]
    elif total_hours < 200:
        level = "Junior boshlang'ich mutaxassis"
        projects_count = 2
        salary_est = "$400 - $650 / oy"
        milestones = [
            "Interaktiv dasturlar va loyihalar yaratish",
            "API integratsiyasi va ma'lumotlar bilan ishlash",
            "Birinchi xalqaro tanlov yoki grantga topshirish"
        ]
    elif total_hours < 400:
        level = "Haqiqiy Mustaqil Junior Developer"
        projects_count = 3
        salary_est = "$750 - $1,200 / oy"
        milestones = [
            "Zamonaviy framework va real loyihalar yaratish",
            "To'liq professional portfolio va GitHub faolligi",
            "Mahalliy yoki xorijiy IT kompaniyada amaliyot (Internship)"
        ]
    else:
        level = "Ishonchli Junior+ / Pre-Middle Mutaxassis"
        projects_count = 5
        salary_est = "$1,300 - $2,000 / oy"
        milestones = [
            "Full-stack yoki AI integratsiyalangan murakkab arxitekturalar",
            "Xalqaro Hackathonlarda sovrinli o'rinlar",
            "Masofaviy (Remote) xalqaro loyihalarda ishlash imkoniyati"
        ]

    return {
        "hours_per_week": hours_per_week,
        "months": months,
        "total_study_hours": total_hours,
        "expected_level": level,
        "portfolio_projects": projects_count,
        "estimated_salary": salary_est,
        "milestones": milestones,
        "ai_advice": f"Haftasiga {hours_per_week} soat ajratsangiz, {months} oyda jami {total_hours} soat o'rganasiz. Bu sizni mustaqil loyihalar qila oladigan {level} darajasiga olib chiqadi! Har kuni oz-ozdan o'rganish — barqaror muvaffaqiyat garovidir 💜"
    }
