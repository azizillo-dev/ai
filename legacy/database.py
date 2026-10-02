import sqlite3
import json
import os

DB_PATH = os.path.join(os.path.dirname(__file__), "herpath.db")

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Foydalanuvchilar jadvali
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        age INTEGER DEFAULT 19,
        education TEXT DEFAULT 'Universitet',
        interests TEXT DEFAULT 'Dasturlash, Sun''iy intellekt',
        skill_level TEXT DEFAULT 'Boshlang''ich',
        goal TEXT DEFAULT 'IT kompaniyada ishlash va xalqaro loyihalar yaratish',
        weekly_hours INTEGER DEFAULT 10,
        target_career TEXT DEFAULT 'Dasturiy ta''minot muhandisi',
        confidence_index INTEGER DEFAULT 68,
        streak_days INTEGER DEFAULT 7,
        xp INTEGER DEFAULT 450,
        badges TEXT DEFAULT '["7 kunlik marafon", "Birinchi loyiham", "Code Explorer"]',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Kasb yo'nalishlari
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS career_tracks (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        match_tags TEXT,
        roadmap_json TEXT,
        skills_breakdown TEXT
    );
    """)

    # Imkoniyatlar (Grantlar, Hackathonlar, Kurslar, Internship)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS opportunities (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        category TEXT NOT NULL,
        organization TEXT NOT NULL,
        description TEXT NOT NULL,
        deadline TEXT,
        tags TEXT,
        link TEXT
    );
    """)

    # AI Mentor chat tarixi
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS chat_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        sender TEXT NOT NULL,
        message TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Boshlang'ich namuna foydalanuvchi: Aziza
    cursor.execute("SELECT COUNT(*) FROM users")
    if cursor.fetchone()[0] == 0:
        cursor.execute("""
        INSERT INTO users (name, age, education, interests, skill_level, goal, weekly_hours, target_career, confidence_index, streak_days, xp, badges)
        VALUES (
            'Aziza', 19, 'Universitet 1-kurs',
            'Dasturlash, Sun''iy intellekt, Dizayn, Zamonaviy texnologiyalar',
            'Boshlang''ich (HTML/CSS biladi)',
            '6 oy ichida Junior Frontend Developer bo''lish va xalqaro tanlovlarda qatnashish',
            10,
            'Dasturiy ta''minot muhandisi',
            68,
            7,
            450,
            '["7 kunlik marafon", "Birinchi loyiham", "Code Explorer"]'
        );
        """)

    # Boshlang'ich kasb yo'nalishlari (Frontend, AI, UI/UX, Data)
    cursor.execute("SELECT COUNT(*) FROM career_tracks")
    if cursor.fetchone()[0] == 0:
        tracks = [
            (
                "swe",
                "Frontend Dasturchi & Dasturiy ta'minot muhandisi",
                "Web va mobil ilovalarning arxitekturasi, chiroyli interfeysi va kodini yaratuvchi universal mutaxassis.",
                json.dumps(["#IT", "#WebDev", "#JavaScript", "#React", "#Yaratuvchanlik"]),
                json.dumps([
                    {"id": 1, "title": "1. HTML5 & Veb semantikasi", "status": "completed", "duration": "1-oy", "desc": "Semantik teglar, formalari, audio/video va qulaylik (accessibility)"},
                    {"id": 2, "title": "2. CSS3, Flexbox & Grid dizayn", "status": "completed", "duration": "2-oy", "desc": "Moslashuvchan (Responsive) interfeyslar, animatsiyalar va zamonaviy uslublar"},
                    {"id": 3, "title": "3. JavaScript (ES6+) mantiq va DOM", "status": "in_progress", "progress": 48, "duration": "3-oy", "desc": "O'zgaruvchilar, funksiyalar, shartlar, sikllar, hodisalar va API integratsiyasi"},
                    {"id": 4, "title": "4. Git, GitHub & Jamoaviy ishlash", "status": "locked", "duration": "3-oy", "desc": "Versiyalarni boshqarish, branchlar va ochiq kodli loyihalarda ishtirok"},
                    {"id": 5, "title": "5. React.js & Komponentlar tizimi", "status": "locked", "duration": "4-oy", "desc": "Virtual DOM, Hooks (useState, useEffect), komponentlar va routing"},
                    {"id": 6, "title": "6. REST API & Server bilan muloqot", "status": "locked", "duration": "4-oy", "desc": "Asinxron JavaScript, Fetch/Axios, JSON ma'lumotlar bilan ishlash"},
                    {"id": 7, "title": "7. Real Loyihalar yaratish", "status": "locked", "duration": "5-oy", "desc": "Online do'kon, to-do platforma va shaxsiy startap ilovasi"},
                    {"id": 8, "title": "8. Professional Portfolio veb-sayti", "status": "locked", "duration": "5-oy", "desc": "Barcha ishlarni bir joyga to'plash va jonli havola qilish"},
                    {"id": 9, "title": "9. Texnik Rezyume (CV) va LinkedIn", "status": "locked", "duration": "6-oy", "desc": "Xalqaro standartdagi CV yaratish va tavsiflar yozish"},
                    {"id": 10, "title": "10. Suhbatlarga tayyorgarlik & Internship", "status": "locked", "duration": "6-oy", "desc": "Junior mutaxassis sifatida birinchi ish yoki amaliyotga kirish"}
                ]),
                json.dumps({
                    "technical": 70,
                    "logic": 65,
                    "communication": 60,
                    "personal": 75
                })
            ),
            (
                "ai",
                "Sun'iy intellekt & Machine Learning Engineer",
                "Inson kabi mantiqiy fikrlaydigan, tahlil qiladigan va xatolardan o'rganadigan intellektual tizimlar yaratish.",
                json.dumps(["#AI", "#Python", "#MachineLearning", "#DeepLearning"]),
                json.dumps([
                    {"id": 1, "title": "1. Python dasturlash asoslari", "status": "completed", "duration": "1-oy", "desc": "Sintaksis, ma'lumotlar turlari va mantiqiy tuzilmalar"},
                    {"id": 2, "title": "2. Matematika va Statistika", "status": "completed", "duration": "2-oy", "desc": "Chiziqli algebra, ehtimolliklar va matritsalar ustida amallar"},
                    {"id": 3, "title": "3. Ma'lumotlarni tahlil qilish (Pandas, Numpy)", "status": "in_progress", "progress": 35, "duration": "3-oy", "desc": "Katta jadvallar, tahlil va vizualizatsiya"},
                    {"id": 4, "title": "4. Machine Learning algoritmlari", "status": "locked", "duration": "4-oy", "desc": "Regressiya, klassifikatsiya, klasterlash (Scikit-Learn)"},
                    {"id": 5, "title": "5. Neyron to'rlari & Deep Learning", "status": "locked", "duration": "4-oy", "desc": "PyTorch yoki TensorFlow da sun'iy miya modellarini o'qitish"},
                    {"id": 6, "title": "6. Computer Vision & NLP", "status": "locked", "duration": "5-oy", "desc": "Rasmlarni tanish va inson tilidagi matnlarni tahlil qilish"},
                    {"id": 7, "title": "7. Generative AI & LLMs", "status": "locked", "duration": "5-oy", "desc": "ChatGPT API, prompt muhandisligi va shaxsiy AI agentlar"},
                    {"id": 8, "title": "8. Haqiqiy AI Portfolio loyihasi", "status": "locked", "duration": "6-oy", "desc": "Tibbiyot yoki biznes uchun sun'iy intellekt yechimi"},
                    {"id": 9, "title": "9. AI Mutaxassis CV va GitHub", "status": "locked", "duration": "6-oy", "desc": "Xalqaro darajadagi AI portfeli"},
                    {"id": 10, "title": "10. Xalqaro AI Tanlovlar & Internship", "status": "locked", "duration": "6-oy", "desc": "AI startaplar va laboratoriyalarda amaliyot"}
                ]),
                json.dumps({
                    "technical": 85,
                    "logic": 90,
                    "communication": 60,
                    "personal": 70
                })
            ),
            (
                "uiux",
                "UI/UX Dizayner (Product Designer)",
                "Foydalanuvchilar sevib ishlatadigan zamonaviy, nafis va qulay raqamli mahsulotlar dizayni.",
                json.dumps(["#Dizayn", "#Figma", "#UXResearch", "#Kreativlik"]),
                json.dumps([
                    {"id": 1, "title": "1. Dizayn tamoyillari va kompozitsiya", "status": "completed", "duration": "1-oy", "desc": "Tipografika, ranglar psixologiyasi va o'lchamlar"},
                    {"id": 2, "title": "2. Figma chuqur o'rganish", "status": "in_progress", "progress": 60, "duration": "2-oy", "desc": "Auto layout, komponentlar, variantlar va dizayn tizimlari"},
                    {"id": 3, "title": "3. UX Tadqiqot va User Journey", "status": "locked", "duration": "3-oy", "desc": "Foydalanuvchi muammolarini aniqlash va simulyatsiya qilish"},
                    {"id": 4, "title": "4. Interaktiv Prototiplash", "status": "locked", "duration": "4-oy", "desc": "Harakatlanuvchi va jonli ilova prototiplari"},
                    {"id": 5, "title": "5. Behance & Dribbble portfeli", "status": "locked", "duration": "5-oy", "desc": "3 ta professional Case Study tayyorlash"},
                    {"id": 6, "title": "6. Frilans va Junior Product Designer suhbati", "status": "locked", "duration": "6-oy", "desc": "Birinchi mijozlar va IT kompaniyaga ishga kirish"}
                ]),
                json.dumps({
                    "technical": 60,
                    "logic": 55,
                    "communication": 85,
                    "personal": 80
                })
            )
        ]
        cursor.executemany("""
        INSERT INTO career_tracks (id, title, description, match_tags, roadmap_json, skills_breakdown)
        VALUES (?, ?, ?, ?, ?, ?)
        """, tracks)

    # Imkoniyatlar dastlabki ro'yxati
    cursor.execute("SELECT COUNT(*) FROM opportunities")
    if cursor.fetchone()[0] == 0:
        opps = [
            (
                "Technovation Girls Uzbekistan 2026",
                "grant",
                "Technovation / BMT",
                "Qizlar uchun jahon miqyosidagi texnologiya tanlovi. Mobil ilova va biznes reja ishlab chiqish orqali $10,000+ gacha grantlar va Silikon vodiysiga yo'llanma.",
                "15-Aprel, 2026",
                "#Grant #QizlarUchun #Hackathon #Startap",
                "https://technovationchallenge.org"
            ),
            (
                "Women in Tech (WiT) Global Mentorship & Scholarship",
                "grant",
                "Women in Tech Global",
                "IT sohasiga kirayotgan qizlar uchun 100% to'liq qoplanadigan xalqaro stipendiya va shaxsiy xorijiy mentor dasturi.",
                "1-May, 2026",
                "#Grant #Mentorlik #Xalqaro",
                "https://women-in-tech.org"
            ),
            (
                "IT Park Girls: Full-Stack Frontend Internship",
                "internship",
                "IT Park Uzbekistan",
                "HTML, CSS, JavaScript va React bo'yicha boshlang'ich bilimga ega bo'lgan qizlar uchun 3 oylik to'lanadigan amaliyot dasturi.",
                "20-Aprel, 2026",
                "#Internship #Frontend #Amaliyot",
                "https://it-park.uz"
            ),
            (
                "TechGirls Summer Exchange Program (USA)",
                "grant",
                "US Department of State",
                "STEM yo'nalishidagi 15-17 yoshli iqtidorli qizlar uchun AQSHda 4 haftalik to'liq moliyalashtiriladigan yozgi ta'lim dasturi.",
                "Dekabr, 2026",
                "#AQSH #Exchange #STEM #Qizlar",
                "https://techgirlsglobal.org"
            ),
            (
                "SheCodes Foundation: Bepul Dasturlash Kurslari",
                "course",
                "SheCodes Foundation",
                "Ayollar va qizlar uchun veb-dasturlash (HTML, CSS, JavaScript, React) bo'yicha xalqaro sertifikatli bepul onlayn kurslar.",
                "Har oy qabuli bor",
                "#BepulKurs #Sertifikat #WebDev",
                "https://www.shecodes.io/foundation"
            ),
            (
                "Google Summer of Code (GSoC) 2026",
                "internship",
                "Google Open Source",
                "Dunyodagi eng nufuzli ochiq manbali kod yozish dasturi. $3000-$6000 stipendiya va Google mutaxassislari bilan ishlash.",
                "Aprel, 2026",
                "#Google #OpenSource #Karyera",
                "https://summerofcode.withgoogle.com"
            )
        ]
        cursor.executemany("""
        INSERT INTO opportunities (title, category, organization, description, deadline, tags, link)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, opps)

    conn.commit()
    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database initialized successfully.")
