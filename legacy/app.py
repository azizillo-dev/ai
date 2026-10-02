import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')

from flask import Flask, render_template, request, jsonify
import json
from database import init_db, get_db
from ai_engine import (
    IT_CATALOG,
    CAREER_TEST_QUESTIONS,
    evaluate_career_test,
    simulate_future,
    get_ai_mentor_response,
    simulate_code_execution,
    analyze_code_review,
    generate_goal_plan
)

app = Flask(__name__)
app.config['SECRET_KEY'] = 'herpath-ai-secret-key-2026'

# Baza jadvalini initsializatsiya qilish
init_db()

@app.route('/')
def index():
    return render_template('index.html')

# ==========================================
def get_row_val(row, key, default):
    try:
        val = row[key]
        return val if val is not None else default
    except Exception:
        return default

# ==========================================
# FOYDALANUVCHI VA RO'YXATDAN O'TISH
# ==========================================
@app.route('/api/user', methods=['GET'])
def get_user_profile():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM users ORDER BY id DESC LIMIT 1")
    row = cursor.fetchone()
    conn.close()

    if row:
        badges = []
        try:
            raw_badges = get_row_val(row, "badges", None)
            badges = json.loads(raw_badges) if raw_badges else ["7 kunlik marafon", "Birinchi loyiham", "Code Explorer"]
        except Exception:
            badges = ["7 kunlik marafon", "Birinchi loyiham", "Code Explorer"]

        return jsonify({
            "id": row["id"],
            "name": get_row_val(row, "name", "Aziza"),
            "age": get_row_val(row, "age", 19),
            "education": get_row_val(row, "education", "Universitet talabasi"),
            "interests": get_row_val(row, "interests", "Dasturlash, Sun'iy intellekt"),
            "skill_level": get_row_val(row, "skill_level", "Boshlang'ich"),
            "goal": get_row_val(row, "goal", "6 oyda Junior mutaxassis bo'lish"),
            "weekly_hours": get_row_val(row, "weekly_hours", 10),
            "target_career": get_row_val(row, "target_career", "Dasturiy ta'minot muhandisi"),
            "confidence_index": get_row_val(row, "confidence_index", 68),
            "streak_days": get_row_val(row, "streak_days", 7),
            "xp": get_row_val(row, "xp", 450),
            "badges": badges,
            "skills": {
                "technical": 70,
                "logic": 65,
                "communication": 60,
                "personal": 75
            },
            "progress_stats": {
                "frontend": 65,
                "javascript": 48,
                "react": 20,
                "portfolio": 40
            }
        })
    return jsonify({"error": "User not found"}), 404

@app.route('/api/register', methods=['POST'])
def register_user():
    data = request.get_json() or {}
    name = data.get("name", "Aziza").strip() or "Aziza"
    age = int(data.get("age", 19))
    education = data.get("education", "Universitet").strip()
    interests = data.get("interests", "Dasturlash, Sun'iy intellekt")
    if isinstance(interests, list):
        interests = ", ".join(interests)
    skill_level = data.get("skill_level", "Boshlang'ich")
    goal = data.get("goal", "6 oyda IT kompaniyaga kirish")
    weekly_hours = int(data.get("weekly_hours", 10))

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO users (name, age, education, interests, skill_level, goal, weekly_hours, target_career, confidence_index, streak_days, xp, badges)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'Sun''iy intellekt & Dasturlash', 70, 1, 100, '["Yangi a''zo 🦋", "Boshlang''ich qadam"]')
    """, (name, age, education, str(interests), skill_level, goal, weekly_hours))
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()

    return jsonify({
        "success": True,
        "user_id": user_id,
        "name": name,
        "message": f"Tabriklaymiz, {name}! Shaxsiy profilingiz muvaffaqiyatli yaratildi. 💜"
    })

# ==========================================
# 25+ IT YO'NALISHLARI KATALOGI
# ==========================================
@app.route('/api/it-catalog', methods=['GET'])
def get_it_catalog():
    category = request.args.get('category')
    if category and category != 'all':
        filtered = [f for f in IT_CATALOG if f["category"] == category]
        return jsonify(filtered)
    return jsonify(IT_CATALOG)

@app.route('/api/it-catalog/<field_id>', methods=['GET'])
def get_it_field_detail(field_id):
    field = next((f for f in IT_CATALOG if f["id"] == field_id), None)
    if field:
        return jsonify(field)
    return jsonify({"error": "Field not found"}), 404

# ==========================================
# YO'L XARITASI (ROADMAP)
# ==========================================
@app.route('/api/career-tracks', methods=['GET'])
def get_career_tracks():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM career_tracks")
    rows = cursor.fetchall()
    conn.close()

    tracks = []
    for r in rows:
        tracks.append({
            "id": r["id"],
            "title": r["title"],
            "description": r["description"],
            "match_tags": json.loads(r["match_tags"]),
            "roadmap": json.loads(r["roadmap_json"]),
            "skills_breakdown": json.loads(r["skills_breakdown"])
        })
    return jsonify(tracks)

# ==========================================
# BOSHLANG'ICH DIAGNOSTIKA TESTI
# ==========================================
@app.route('/api/test-questions', methods=['GET'])
def get_test_questions():
    clean_questions = []
    for q in CAREER_TEST_QUESTIONS:
        clean_questions.append({
            "id": q["id"],
            "question": q["question"],
            "options": [{"index": i, "text": opt["text"]} for i, opt in enumerate(q["options"])]
        })
    return jsonify(clean_questions)

@app.route('/api/evaluate-test', methods=['POST'])
def handle_evaluate_test():
    data = request.get_json() or {}
    answers = data.get("answers", {})
    results = evaluate_career_test(answers)

    # Foydalanuvchi ma'lumotlarini yangilash
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    UPDATE users 
    SET target_career = ?, confidence_index = ?, xp = xp + 50
    WHERE id = (SELECT id FROM users ORDER BY id DESC LIMIT 1)
    """, (results["recommendation"]["title"], min(96, results["recommendation"]["match"])))
    conn.commit()
    conn.close()

    return jsonify(results)

# ==========================================
# AI MENTOR CHAT MULOQOTI
# ==========================================
@app.route('/api/chat', methods=['POST'])
def chat_with_mentor():
    data = request.get_json() or {}
    user_msg = data.get("message", "").strip()
    mode = data.get("mode", "auto")

    if not user_msg:
        return jsonify({"error": "Bo'sh xabar"}), 400

    reply = get_ai_mentor_response(user_msg, mode=mode)

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (1, 'user', ?)", (user_msg,))
    cursor.execute("INSERT INTO chat_messages (user_id, sender, message) VALUES (1, 'mentor', ?)", (reply,))
    conn.commit()
    conn.close()

    return jsonify({
        "reply": reply,
        "sender": "mentor",
        "mode": mode
    })

# ==========================================
# CODE LAB: KODNI ISHGA TUSHIRISH VA REVIEW
# ==========================================
@app.route('/api/code-lab/run', methods=['POST'])
def run_code():
    data = request.get_json() or {}
    language = data.get("language", "cpp")
    code = data.get("code", "")

    result = simulate_code_execution(language, code)
    return jsonify(result)

@app.route('/api/code-lab/review', methods=['POST'])
def review_code():
    data = request.get_json() or {}
    language = data.get("language", "cpp")
    code = data.get("code", "")

    review = analyze_code_review(language, code)
    return jsonify(review)

# ==========================================
# AI MAQSAD REJALASHTIRUVCHISI
# ==========================================
@app.route('/api/goal-plan', methods=['POST'])
def get_goal_plan():
    data = request.get_json() or {}
    goal = data.get("goal", "6 oy ichida Frontend Developer bo'lmoqchiman")
    weekly_hours = int(data.get("weekly_hours", 10))

    plan = generate_goal_plan(goal, weekly_hours)
    return jsonify(plan)

# ==========================================
# O'RGANISH BO'LIMI (LEARNING CURRICULUM)
# ==========================================
@app.route('/api/learning-topics', methods=['GET'])
def get_learning_topics():
    topics = [
        {
            "id": "topic_1",
            "title": "HTML & CSS: Vebning Poydevori",
            "category": "Frontend",
            "icon": "🎨",
            "short_desc": "Veb-sayt skeleti va uning chiroyli ko'rinishini yaratish.",
            "simple_expl": "Tasavvur qiling: HTML — bu yangi qurilayotgan uyning g'ishtlari, xonalari va eshik-derazalari (tuzilishi). CSS esa uyning devorlariga surtilgan chiroyli bo'yoq, pardalar va chiroqlar (ko'rinishi).",
            "detail_expl": "HTML5 semantik teglar (<header>, <nav>, <main>, <section>, <footer>) orqali qidiruv tizimlari (SEO) va ko'zi ojizlar uchun qulay tizim yaratadi. CSS3 Flexbox va Grid orqali har qanday o'lchamdagi ekranga moslashuvchan dizayn (Responsive Design) ta'minlanadi.",
            "examples": "Flexbox yordamida elementlarni o'rtaga joylash: 'display: flex; justify-content: center; align-items: center;'",
            "mini_task": "Shaxsiy vizitka sahifangizni yarating: Markazda rasm, ismingiz va 'Bog'lanish' tugmasi bo'lsin.",
            "quiz": {
                "question": "Veb sahifada matnni qalin qilish uchun qaysi semantik teg ishlatiladi?",
                "options": ["<strong>", "<bold>", "<bld>", "<heavy>"],
                "correct": 0
            }
        },
        {
            "id": "topic_2",
            "title": "JavaScript: Jonli Harakat va Mantiq",
            "category": "Dasturlash",
            "icon": "⚡",
            "short_desc": "Saytdagi tugmalarga jon kiritish, hisoblash va ma'lumotlar bilan ishlash.",
            "simple_expl": "Agar HTML uyning g'ishti, CSS uning bezagi bo'lsa, JavaScript — bu uydagi elektr toki, lift va aqlli uy boshqaruvi! Tugmani bossangiz chiroq yonishi aynan JS orqali bo'ladi.",
            "detail_expl": "JavaScript — dinamik obyektga yo'naltirilgan til. DOM (Document Object Model) orqali HTML elementlarni o'zgartiradi, 'fetch()' orqali esa serverdan yangi ma'lumotlarni sahifani yangilamasdan (reload qilmasdan) yuklab oladi.",
            "examples": "let yosh = 19; if (yosh >= 18) { alert('Xush kelibsiz!'); } else { alert('Kirish taqiqlangan'); }",
            "mini_task": "Tugma bosilganda sonni 1 taga oshiruvchi Click Counter (hisoblagich) yozing.",
            "quiz": {
                "question": "JavaScriptda o'zgarmas doimiy qiymat e'lon qilish uchun qaysi kalit so'z ishlatiladi?",
                "options": ["var", "let", "const", "static"],
                "correct": 2
            }
        },
        {
            "id": "topic_3",
            "title": "Sun'iy Intellekt va Machine Learning",
            "category": "AI",
            "icon": "🤖",
            "short_desc": "Kompyuterga inson kabi ko'rish, tushunish va xulosa chiqarishni o'rgatish.",
            "simple_expl": "Kichkina bolaga rasmlar ko'rsatib, 'Bu mushuk, bu it' deb o'rgatgandek, biz ham kompyuterga millionlab ma'lumotlarni beramiz va u o'zi qonuniyatlarni yodlab oladi.",
            "detail_expl": "Machine Learning matematik statistika, gradient tushishi (Gradient Descent) va neyron tarmoqlaridan foydalanadi. PyTorch va Scikit-Learn yordamida kelajakni bashorat qiluvchi modellar quriladi.",
            "examples": "Uy narxini bashorat qilish: X = [xonalar soni, maydoni, joylashuvi] -> Model -> Y = [narx: $65,000]",
            "mini_task": "Python da Scikit-Learn yordamida 'LinearRegression' modelini ishlatib ko'ring.",
            "quiz": {
                "question": "Mashinali o'rganishda eng mashhur va qulay dasturlash tili qaysi?",
                "options": ["Python", "PHP", "Pascal", "HTML"],
                "correct": 0
            }
        },
        {
            "id": "topic_4",
            "title": "UI/UX Dizayn va Figma Asoslari",
            "category": "Dizayn",
            "icon": "✨",
            "short_desc": "Odamlar sevib foydalanadigan qulay va go'zal ilovalar interfeysi.",
            "simple_expl": "Choynakning tutqichi qulay joyda bo'lsa choy quyish oson — bu UX. Choynakning o'zi nafis va chiroyli rangda bo'lsa — bu UI.",
            "detail_expl": "Figma — bulutli vektor muharriri. Unda Auto Layout va Komponentlar yordamida katta dasturlarning dizayn tizimi (Design System) yaratiladi va mobil ekranlar uchun moslashtiriladi.",
            "examples": "Auto layout orqali tugma ichidagi matn kattalashsa, tugma ham avtomatik kengayadi.",
            "mini_task": "Figma da sevimli kitobingiz uchun mobil ilova ekrani dizaynini chizing.",
            "quiz": {
                "question": "UX qisqartmasi nimani anglatadi?",
                "options": ["User Experience", "User Extension", "Ultra XML", "Universal Xerox"],
                "correct": 0
            }
        }
    ]
    return jsonify(topics)

# ==========================================
# AMALIY LOYIHALAR KATALOGI
# ==========================================
@app.route('/api/projects', methods=['GET'])
def get_projects():
    projects = [
        {
            "id": 1,
            "level": "Boshlang'ich",
            "level_badge": "Junior Start 🟢",
            "title": "Aqlli Kalkulyator",
            "icon": "🧮",
            "direction": "Frontend / C++ / Python",
            "desc": "Qo'shish, ayirish, ko'paytirish va bo'lish amallarini bajaruvchi interaktiv dastur.",
            "tasks": ["Ikkita sonni kiritish", "Amalni tanlash (+, -, *, /)", "Noldan bo'lish xatosini tekshirish", "Natijani chiroyli aks ettirish"],
            "tech": "HTML, CSS, JS yoki C++",
            "points": 50
        },
        {
            "id": 2,
            "level": "Boshlang'ich",
            "level_badge": "Junior Start 🟢",
            "title": "Shaxsiy Portfolio Veb-sayti",
            "icon": "👩‍💻",
            "direction": "Frontend",
            "desc": "O'zingiz haqingizda, ko'nikmalaringiz va bajargan ishlaringizni ko'rsatuvchi zamonaviy shaxsiy veb-sayt.",
            "tasks": ["Hero bo'limi yaratish", "Ko'nikmalar ro'yxati (HTML, CSS, JS)", "Loyihalar galereyasi", "Bog'lanish shakli"],
            "tech": "HTML5, CSS3, Flexbox",
            "points": 70
        },
        {
            "id": 3,
            "level": "O'rta",
            "level_badge": "Middle Builder 🟡",
            "title": "Telegram AI Yordamchi Boti",
            "icon": "🤖",
            "direction": "Python / Backend",
            "desc": "Foydalanuvchi savollariga javob beruvchi, valyuta kurslarini va ob-havoni aytuvchi aqlli bot.",
            "tasks": ["BotFather orqali token olish", "Aiogram yoki python-telegram-bot o'rnatish", "OpenWeather API bilan ulash", "Savol-javob mantiqini yozish"],
            "tech": "Python, Aiogram, Requests",
            "points": 120
        },
        {
            "id": 4,
            "level": "O'rta",
            "level_badge": "Middle Builder 🟡",
            "title": "Online Do'kon Savatchasi (E-Commerce)",
            "icon": "🛍️",
            "direction": "Frontend / React",
            "desc": "Mahsulotlar katalogi, filtrlar, savatchaga qo'shish va jami narxni hisoblash tizimi.",
            "tasks": ["Mahsulotlar kartasi ro'yxati", "Savatchaga qo'shish/o'chirish", "Mahsulot sonini oshirish/kamaytirish", "Lokal saqlash (LocalStorage)"],
            "tech": "JavaScript / React",
            "points": 150
        },
        {
            "id": 5,
            "level": "Yuqori",
            "level_badge": "Senior Pro 🟣",
            "title": "AI Qizlar Tibbiy Tashxis Tizimi",
            "icon": "🩺",
            "direction": "Sun'iy intellekt / ML",
            "desc": "Simptomlar asosida kasalliklarni dastlabki tahlil qiluvchi va tavsiyalar beruvchi Machine Learning modeli.",
            "tasks": ["Tibbiy ma'lumotlar to'plamini tozalash", "Decision Tree yoki Random Forest o'qitish", "92%+ aniqlikka erishish", "FastAPI da veb-interfeys bilan birlashtirish"],
            "tech": "Python, Scikit-learn, FastAPI",
            "points": 250
        }
    ]
    return jsonify(projects)

# ==========================================
# TESTLAR VA VIKTORINALAR
# ==========================================
@app.route('/api/quizzes', methods=['GET'])
def get_quizzes():
    quizzes = [
        {
            "id": 1,
            "title": "IT Asoslari va Algoritmik Mantiq",
            "questions_count": 5,
            "xp_reward": 50,
            "icon": "🧠"
        },
        {
            "id": 2,
            "title": "Frontend (HTML/CSS/JS) Tezkor Testi",
            "questions_count": 5,
            "xp_reward": 60,
            "icon": "🌐"
        },
        {
            "id": 3,
            "title": "Sun'iy intellekt va Ma'lumotlar Dunyosi",
            "questions_count": 5,
            "xp_reward": 75,
            "icon": "🤖"
        }
    ]
    return jsonify(quizzes)

# ==========================================
# IMKONIYATLAR BAZASI
# ==========================================
@app.route('/api/opportunities', methods=['GET'])
def get_opportunities():
    category = request.args.get('category')
    conn = get_db()
    cursor = conn.cursor()
    if category and category != 'all':
        cursor.execute("SELECT * FROM opportunities WHERE category = ?", (category,))
    else:
        cursor.execute("SELECT * FROM opportunities")
    rows = cursor.fetchall()
    conn.close()

    items = []
    for r in rows:
        items.append({
            "id": r["id"],
            "title": r["title"],
            "category": r["category"],
            "organization": r["organization"],
            "description": r["description"],
            "deadline": r["deadline"],
            "tags": r["tags"],
            "link": r["link"]
        })
    return jsonify(items)

# ==========================================
# KELAJAK SIMULYATORI
# ==========================================
@app.route('/api/simulate', methods=['POST'])
def simulate():
    data = request.get_json() or {}
    hours = int(data.get("hours_per_week", 10))
    months = int(data.get("months", 6))
    direction = data.get("direction", "Dasturlash")
    
    result = simulate_future(hours, months, direction)
    return jsonify(result)

if __name__ == '__main__':
    print("======================================================")
    print("HerPath AI Server ishga tushdi: http://127.0.0.1:5000")
    print("======================================================")
    app.run(debug=True, host='0.0.0.0', port=5000)
