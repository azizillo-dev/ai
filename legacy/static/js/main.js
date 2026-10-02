// ===== HerPath AI - Core Application Logic 2026 =====

let currentUser = null;
let currentLanguage = 'cpp';
let currentGuidedStep = 1;
let allCatalogFields = [];
let testQuestions = [];
let currentQuestionIndex = 0;
let userTestAnswers = {};
let currentMentorMode = 'auto';

const CODE_TEMPLATES = {
    cpp: `#include <iostream>
using namespace std;

int main() {
    cout << "Salom HerPath AI!" << endl;
    return 0;
}`,
    python: `# Python Dasturlash
def salom_ber(ism):
    return f"Salom, {ism}! HerPath AI ga xush kelibsiz 💜"

print(salom_ber("Aziza"))`,
    javascript: `// JavaScript kodi
function hisobla(a, b) {
    return a + b;
}

console.log("Natija: " + hisobla(10, 5));`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Salom HerPath Java dunyosidan!");
    }
}`,
    html: `<!DOCTYPE html>
<html>
<head>
    <style>
        body { font-family: sans-serif; text-align: center; padding: 20px; }
        h1 { color: #6c4ce0; }
    </style>
</head>
<body>
    <h1>Salom, HerPath AI! 🦋</h1>
    <p>O'z yo'lingni top. Kelajagingni yarat.</p>
</body>
</html>`
};

// ==========================================
// INITIALIZATION
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    initUserProfile();
    initCatalog();
    initOpportunities();
    initCodeLab();
    initMentorChat();
    initRoadmap();
    initLearningTopics();
    initProjects();
    initQuizzes();
    initGoalPlanner();
    initQASystem();
    setupEventHandlers();
});

function setupEventHandlers() {
    // Nav & Modals
    const btnRegisterOpen = document.getElementById('btn-register-open');
    const btnHeroRegister = document.getElementById('btn-hero-register');
    const btnLoginOpen = document.getElementById('btn-login-open');
    const btnHeroLogin = document.getElementById('btn-hero-login');
    const btnQuickDemo = document.getElementById('btn-quick-demo');

    if (btnRegisterOpen) btnRegisterOpen.addEventListener('click', openRegisterModal);
    if (btnHeroRegister) btnHeroRegister.addEventListener('click', openRegisterModal);
    if (btnLoginOpen) btnLoginOpen.addEventListener('click', openLoginModal);
    if (btnHeroLogin) btnHeroLogin.addEventListener('click', openLoginModal);
    if (btnQuickDemo) btnQuickDemo.addEventListener('click', () => {
        switchView('platform');
        triggerConfetti();
    });

    // Chip selections in registration
    const chips = document.querySelectorAll('#reg-interests-chips .chip-option');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            chip.classList.toggle('selected');
        });
    });

    // Sidebar navigation in Platform
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const tabId = link.getAttribute('data-tab');
            if (tabId) switchTab(tabId);
        });
    });

    // Catalog category filters
    const catBtns = document.querySelectorAll('.cat-tab-btn');
    catBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            catBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const cat = btn.getAttribute('data-cat');
            renderCatalog(cat);
        });
    });
}

// ==========================================
// 1. VIEW & TAB SWITCHING
// ==========================================
function switchView(view) {
    const landingContainer = document.getElementById('landing-view-container');
    const platformContainer = document.getElementById('platform-view-container');
    const landingLinks = document.getElementById('landing-links');
    const platformNavCenter = document.getElementById('platform-nav-center');
    const landingNavBtns = document.getElementById('landing-nav-btns');
    const platformNavBtns = document.getElementById('platform-nav-btns');

    if (view === 'platform') {
        landingContainer.style.display = 'none';
        platformContainer.style.display = 'block';
        landingLinks.style.display = 'none';
        platformNavCenter.style.display = 'flex';
        landingNavBtns.style.display = 'none';
        platformNavBtns.style.display = 'flex';
        document.body.className = 'mode-platform';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
        landingContainer.style.display = 'block';
        platformContainer.style.display = 'none';
        landingLinks.style.display = 'flex';
        platformNavCenter.style.display = 'none';
        landingNavBtns.style.display = 'flex';
        platformNavBtns.style.display = 'none';
        document.body.className = 'mode-landing';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

function switchTab(tabId) {
    const panes = document.querySelectorAll('.tab-pane');
    panes.forEach(pane => pane.classList.remove('active'));

    const targetPane = document.getElementById(tabId);
    if (targetPane) targetPane.classList.add('active');

    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    sidebarLinks.forEach(link => {
        if (link.getAttribute('data-tab') === tabId) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Main content scroll top
    const mainContent = document.querySelector('.platform-main-content');
    if (mainContent) mainContent.scrollTop = 0;
}

function openDirectPlatform(targetTab) {
    switchView('platform');
    if (targetTab === 'codelab') switchTab('tab-codelab');
    else if (targetTab === 'mentor') switchTab('tab-mentor');
    else if (targetTab === 'opps') switchTab('tab-opportunities');
    else switchTab('tab-overview');
}

// ==========================================
// 2. USER PROFILE & AUTHENTICATION
// ==========================================
async function initUserProfile() {
    try {
        const res = await fetch('/api/user');
        if (!res.ok) return;
        const user = await res.json();
        currentUser = user;
        updateUserUI(user);
    } catch (e) {
        console.error("Profil yuklash xatosi:", e);
    }
}

function updateUserUI(user) {
    const nameDisplays = document.querySelectorAll('.user-name-display');
    nameDisplays.forEach(el => el.textContent = user.name || 'Aziza');

    const navTrack = document.getElementById('nav-track-title');
    if (navTrack) navTrack.textContent = user.target_career || "Dasturiy ta'minot muhandisi";

    const sidebarTrack = document.getElementById('sidebar-track-tag');
    if (sidebarTrack) sidebarTrack.textContent = user.target_career || "Dasturiy ta'minot";

    const dashCareerTitle = document.getElementById('dash-career-title');
    if (dashCareerTitle) dashCareerTitle.textContent = user.target_career;

    const myTrackTitle = document.getElementById('my-track-title');
    if (myTrackTitle) myTrackTitle.textContent = user.target_career;

    const streakDisplays = document.querySelectorAll('#nav-streak-days, #dash-streak');
    streakDisplays.forEach(el => el.textContent = `${user.streak_days || 7} kun`);

    const xpDisplays = document.querySelectorAll('#nav-xp-points, #dash-xp');
    xpDisplays.forEach(el => el.textContent = `${user.xp || 450} XP`);

    const dashConfidence = document.getElementById('dash-confidence');
    if (dashConfidence) dashConfidence.textContent = `${user.confidence_index || 68}%`;

    const circleFill = document.getElementById('overview-circle-fill');
    if (circleFill) {
        const val = user.confidence_index || 68;
        const offset = 283 - (283 * val) / 100;
        circleFill.style.strokeDashoffset = offset;
    }
}

// Modals
function openRegisterModal() {
    document.getElementById('register-modal').classList.add('active');
}
function closeRegisterModal() {
    document.getElementById('register-modal').classList.remove('active');
}
function openLoginModal() {
    document.getElementById('login-modal').classList.add('active');
}
function closeLoginModal() {
    document.getElementById('login-modal').classList.remove('active');
}

async function handleRegistrationSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('reg-name').value.trim();
    const age = document.getElementById('reg-age').value;
    const education = document.getElementById('reg-education').value;
    const skill_level = document.getElementById('reg-skill').value;
    const goal = document.getElementById('reg-goal').value;
    const weekly_hours = document.getElementById('reg-hours').value;

    const selectedChips = document.querySelectorAll('#reg-interests-chips .chip-option.selected');
    const interests = Array.from(selectedChips).map(c => c.getAttribute('data-val'));

    try {
        const res = await fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name, age, education, skill_level, goal, weekly_hours, interests
            })
        });

        if (res.ok) {
            closeRegisterModal();
            await initUserProfile();
            // Start AI Boshlang'ich Tahlili Test
            openCareerTestModal();
        }
    } catch (err) {
        alert("Ro'yxatdan o'tishda xatolik yuz berdi.");
    }
}

function handleQuickLogin() {
    const name = document.getElementById('login-input-name').value.trim() || 'Aziza';
    closeLoginModal();
    if (currentUser) currentUser.name = name;
    updateUserUI(currentUser || { name, streak_days: 7, xp: 450 });
    switchView('platform');
    triggerConfetti();
}

// ==========================================
// 3. AI BOSHLANG'ICH DIAGNOSTIKA TESTI
// ==========================================
function openCareerTestModal() {
    const modal = document.getElementById('career-test-modal');
    modal.classList.add('active');
    currentQuestionIndex = 0;
    userTestAnswers = {};
    loadAndRenderTest();
}

function closeCareerTestModal() {
    document.getElementById('career-test-modal').classList.remove('active');
}

async function loadAndRenderTest() {
    const container = document.getElementById('test-card-content');
    try {
        if (!testQuestions || testQuestions.length === 0) {
            const res = await fetch('/api/test-questions');
            if (res.ok) testQuestions = await res.json();
        }
        renderNextQuestion();
    } catch (e) {
        container.innerHTML = `<p>Test yuklashda xatolik yuz berdi.</p>`;
    }
}

function renderNextQuestion() {
    const container = document.getElementById('test-card-content');
    if (!testQuestions || testQuestions.length === 0) return;

    if (currentQuestionIndex >= testQuestions.length) {
        // Tahlil boshlanishi
        evaluateAndShowResults();
        return;
    }

    const q = testQuestions[currentQuestionIndex];
    const progress = Math.round(((currentQuestionIndex + 1) / testQuestions.length) * 100);

    let optsHtml = '';
    q.options.forEach(opt => {
        optsHtml += `
            <button class="test-option-btn" onclick="selectAnswer(${q.id}, ${opt.index}, this)">
                <span>🔹</span>
                <span>${opt.text}</span>
            </button>
        `;
    });

    container.innerHTML = `
        <div class="test-step-card">
            <div class="test-progress-bar">
                <div class="test-progress-fill" style="width: ${progress}%;"></div>
            </div>
            <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
                <span style="font-size: 12.5px; font-weight:700; color: var(--primary);">Savol ${currentQuestionIndex + 1} / ${testQuestions.length}</span>
                <span style="font-size: 12.5px; color: var(--text-secondary); font-weight:600;">${progress}%</span>
            </div>
            <h3 style="font-size: 18px; margin: 12px 0 16px 0; color: var(--text-primary);">${q.question}</h3>
            <div class="test-options-list">
                ${optsHtml}
            </div>
        </div>
    `;
}

function selectAnswer(qId, optIdx, btn) {
    userTestAnswers[qId] = optIdx;
    btn.classList.add('selected');
    setTimeout(() => {
        currentQuestionIndex++;
        renderNextQuestion();
    }, 280);
}

async function evaluateAndShowResults() {
    const container = document.getElementById('test-card-content');
    container.innerHTML = `
        <div style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 16px;">🧠✨</div>
            <h3 style="font-size: 22px; color: var(--primary); margin-bottom: 8px;">AI qobiliyatlaringizni tahlil qilmoqda...</h3>
            <p style="font-size: 14px; color: var(--text-secondary);">Mantiqiy fikrlash, ijodkorlik va texnik qobiliyatlaringiz hisoblanmoqda.</p>
        </div>
    `;

    try {
        const res = await fetch('/api/evaluate-test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ answers: userTestAnswers })
        });

        if (res.ok) {
            const data = await res.json();
            triggerConfetti();
            renderTestSuccess(data);
            await initUserProfile();
        }
    } catch (e) {
        container.innerHTML = `<p>Tahlilda xatolik. Qaytadan urinib ko'ring.</p>`;
    }
}

function renderTestSuccess(data) {
    const container = document.getElementById('test-card-content');
    const rec = data.recommendation;

    let rankedHtml = '';
    if (data.all_ranked) {
        rankedHtml = data.all_ranked.slice(0, 3).map((item, idx) => `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#fff; padding:10px 14px; border-radius:12px; margin-bottom:8px; border:1px solid var(--border-color);">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="font-size:18px;">${item.icon || '💻'}</span>
                    <strong style="font-size:13.5px;">${idx + 1}. ${item.title}</strong>
                </div>
                <span class="badge-match" style="font-size:12px;">${item.match}% moslik</span>
            </div>
        `).join('');
    }

    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 44px; margin-bottom: 4px;">🎉🦋</div>
            <span class="badge-match" style="font-size: 13px; padding: 4px 16px;">${rec.match}% Moslik Natijasi</span>
            <h3 style="font-size: 24px; color: var(--text-primary); margin-top: 8px;">${rec.title}</h3>
            <p style="font-size: 13.5px; color: var(--text-secondary); margin-top: 4px;">“Sizga quyidagi IT yo‘nalishlari eng mos kelishi mumkin”</p>
        </div>

        <div style="background: #fdfcff; padding: 16px; border-radius: 16px; border: 1px solid var(--border-color); margin-bottom: 20px;">
            <h5 style="font-size: 13.5px; font-weight: 700; color: var(--primary); margin-bottom: 6px;">💡 AI Tahlil Xulosasi:</h5>
            <p style="font-size: 13px; color: #475569; line-height: 1.5;">${rec.explanation}</p>
            <div style="margin-top: 10px; font-size: 12.5px; font-weight: 700; color: var(--text-primary);">
                🎯 Tavsiya etiladigan birinchi qadam: <span style="font-weight: 500; color: #334155;">${rec.next_step}</span>
            </div>
        </div>

        <div style="margin-bottom: 20px;">
            <h5 style="font-size: 12.5px; color: var(--text-secondary); margin-bottom: 8px; font-weight:700;">TOP REYTINQ MOSLIKLAR:</h5>
            ${rankedHtml}
        </div>

        <div style="display: flex; gap: 12px; justify-content: center;">
            <button class="btn-primary" onclick="closeCareerTestModal(); switchView('platform');" style="padding: 12px 28px;">
                Platformaga kirish (Dashboard) ➔
            </button>
        </div>
    `;
}

// ==========================================
// 4. 25+ IT YO'NALISHLARI KATALOGI (SECTION 5 & 6)
// ==========================================
async function initCatalog() {
    try {
        const res = await fetch('/api/it-catalog');
        if (!res.ok) return;
        allCatalogFields = await res.json();
        renderCatalog('all');
    } catch (e) {
        console.error("Katalog yuklashda xatolik:", e);
    }
}

function renderCatalog(category = 'all') {
    const landingGrid = document.getElementById('catalog-landing-grid');
    const dashGrid = document.getElementById('catalog-dashboard-grid');

    const filtered = category === 'all' 
        ? allCatalogFields 
        : allCatalogFields.filter(f => f.category === category);

    let html = '';
    filtered.forEach(field => {
        html += `
            <div class="catalog-card" onclick="openFieldModalById('${field.id}')">
                <div>
                    <div class="cat-card-top">
                        <span class="cat-card-icon">${field.icon || '💻'}</span>
                        <span class="cat-badge-small">${field.category_title || field.category}</span>
                    </div>
                    <h4>${field.title}</h4>
                    <p>${field.short_desc}</p>
                </div>
                <div class="cat-card-action">
                    <span>To‘liq ma’lumot olish</span>
                    <span>➔</span>
                </div>
            </div>
        `;
    });

    if (landingGrid) landingGrid.innerHTML = html;
    if (dashGrid) dashGrid.innerHTML = html;
}

function openFieldModalById(fieldId) {
    const field = allCatalogFields.find(f => f.id === fieldId);
    if (!field) return;

    const modal = document.getElementById('field-detail-modal');
    const body = document.getElementById('field-detail-body');

    // Build lists
    const appsList = field.applications.map(app => `<li>✓ ${app}</li>`).join('');
    const learnList = field.what_to_learn.map(step => `<div style="background:#f1edff; color:var(--primary); font-size:12px; font-weight:700; padding:6px 12px; border-radius:8px;">${step}</div>`).join('');
    const projList = field.projects.map(p => `
        <div style="background:#fff; border:1px solid var(--border-color); padding:10px 14px; border-radius:12px; margin-bottom:8px;">
            <span class="badge-match" style="font-size:11px; padding:2px 8px;">${p.level}</span>
            <strong style="font-size:13px; margin-left:6px; color:var(--text-primary);">${p.title}</strong>
        </div>
    `).join('');
    const rolesList = field.career_roles.map(r => `
        <div style="display:flex; justify-content:space-between; font-size:13px; padding:6px 0; border-bottom:1px dashed var(--border-color);">
            <strong>${r.role}</strong>
            <span style="color:var(--primary); font-weight:700;">${r.salary}</span>
        </div>
    `).join('');

    body.innerHTML = `
        <div style="display:flex; align-items:center; gap:16px; margin-bottom:18px;">
            <div style="width:54px; height:54px; background:#f1edff; border-radius:16px; display:flex; align-items:center; justify-content:center; font-size:28px;">
                ${field.icon}
            </div>
            <div>
                <span class="cat-badge-small">${field.category_title}</span>
                <h3 style="font-size:24px; color:var(--text-primary); margin-top:2px;">${field.title}</h3>
            </div>
        </div>

        <div style="display:flex; flex-direction:column; gap:20px;">
            <div style="background:#f8fafc; padding:18px; border-radius:16px; border-left:4px solid var(--primary);">
                <h4 style="font-size:15px; color:var(--primary); margin-bottom:6px;">📖 Yo‘nalish nima?</h4>
                <p style="font-size:13.5px; color:#475569; line-height:1.6;">${field.what_is}</p>
            </div>

            <div>
                <h4 style="font-size:15px; margin-bottom:8px;">🏥 Qayerlarda qo‘llaniladi?</h4>
                <ul style="list-style:none; display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:6px; font-size:13px; color:#475569;">
                    ${appsList}
                </ul>
            </div>

            <div style="background:#fff; border:1px solid var(--border-color); padding:16px; border-radius:14px;">
                <h4 style="font-size:15px; margin-bottom:6px;">💼 Mutaxassis nima qiladi?</h4>
                <p style="font-size:13.5px; color:#475569; line-height:1.5;">${field.what_they_do}</p>
            </div>

            <div>
                <h4 style="font-size:15px; margin-bottom:10px;">🎯 Nimalarni o‘rganish kerak? (Bosqichma-bosqich):</h4>
                <div style="display:flex; flex-wrap:wrap; gap:8px;">
                    ${learnList}
                </div>
            </div>

            <div>
                <h4 style="font-size:15px; margin-bottom:8px;">🚀 Qanday loyihalar qilish mumkin?</h4>
                ${projList}
            </div>

            <div style="background:#faf5ff; border:1px solid #e9d5ff; padding:16px; border-radius:14px;">
                <h4 style="font-size:15px; color:#6b21a8; margin-bottom:8px;">💰 Qaysi kasblarda ishlash mumkin va maoshlar:</h4>
                ${rolesList}
            </div>

            <div style="display:flex; gap:12px; justify-content:flex-end; margin-top:10px;">
                <button class="btn-primary" onclick="askMentorAboutField('${field.title}')">
                    🤖 AI Mentordan shu soha haqida savol so‘rash ➔
                </button>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function closeFieldModal() {
    document.getElementById('field-detail-modal').classList.remove('active');
}

function askMentorAboutField(fieldTitle) {
    closeFieldModal();
    switchView('platform');
    switchTab('tab-mentor');
    const input = document.getElementById('chat-input-full');
    if (input) {
        input.value = `${fieldTitle} yo'nalishini o'rganish uchun menga nimalarni tavsiya qilasiz?`;
        document.getElementById('btn-chat-send-full').click();
    }
}

// ==========================================
// 5. CODE LAB: INTERACTIVE RUNNER & REVIEW
// ==========================================
function initCodeLab() {
    const editor = document.getElementById('code-editor-input');
    const runBtn = document.getElementById('btn-run-code');
    const reviewBtn = document.getElementById('btn-codelab-review');
    const guidedBtn = document.getElementById('btn-codelab-guided');
    const simErrBtn = document.getElementById('btn-simulate-error');
    const helperSimplifyBtn = document.getElementById('btn-helper-simplify');

    if (!editor || !runBtn) return;

    // Default template
    editor.value = CODE_TEMPLATES.cpp;

    // Language buttons
    const langBtns = document.querySelectorAll('.btn-lang');
    langBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            langBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const lang = btn.getAttribute('data-lang');
            currentLanguage = lang;

            const filenameElem = document.getElementById('codelab-filename');
            const extMap = { cpp: 'main.cpp', python: 'main.py', javascript: 'app.js', java: 'Main.java', html: 'index.html' };
            if (filenameElem) filenameElem.textContent = extMap[lang] || 'main.code';

            editor.value = CODE_TEMPLATES[lang] || '';
            clearTerminal();
            document.getElementById('terminal-output').textContent = `Til almashtirildi: ${lang.toUpperCase()}\nKod yozing va '▶ Ishga tushirish' tugmasini bosing...`;
        });
    });

    // Run Code
    runBtn.addEventListener('click', async () => {
        const code = editor.value;
        const term = document.getElementById('terminal-output');
        term.textContent = "Kompilyatsiya qilinmoqda va ishga tushirilmoqda...\n";

        try {
            const res = await fetch('/api/code-lab/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ language: currentLanguage, code: code })
            });

            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    term.textContent = data.output || "Dastur muvaffaqiyatli yakunlandi.";
                    document.getElementById('ai-helper-card').style.display = 'none';
                    triggerConfetti();
                } else {
                    term.textContent = data.error || "Xatolik yuz berdi.";
                    // Show AI Helper
                    showAiCodeHelper(data.ai_helper);
                }
            }
        } catch (e) {
            term.textContent = "Server bilan aloqa xatosi.";
        }
    });

    // Simulate Error Button
    if (simErrBtn) {
        simErrBtn.addEventListener('click', () => {
            if (currentLanguage === 'cpp') {
                editor.value = `#include <iostream>
using namespace std;

int main() {
    cout << "Salom HerPath AI!" // Nuqta-vergul ataylab qoldirildi
    return 0;
}`;
            } else if (currentLanguage === 'python') {
                editor.value = `print "Salom Python" # Qavslar qoldirildi`;
            }
            runBtn.click();
        });
    }

    // Guided Task Toggle
    if (guidedBtn) {
        guidedBtn.addEventListener('click', () => {
            const box = document.getElementById('guided-task-box');
            box.style.display = box.style.display === 'none' ? 'block' : 'none';
        });
    }

    // AI Code Review Modal
    if (reviewBtn) {
        reviewBtn.addEventListener('click', async () => {
            const code = editor.value;
            try {
                const res = await fetch('/api/code-lab/review', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ language: currentLanguage, code: code })
                });

                if (res.ok) {
                    const review = await res.json();
                    showCodeReviewModal(review);
                }
            } catch (e) {
                alert("Review qilishda xatolik.");
            }
        });
    }

    // Helper simplify button
    if (helperSimplifyBtn) {
        helperSimplifyBtn.addEventListener('click', () => {
            const analogyBox = document.getElementById('ai-helper-analogy-box');
            if (analogyBox) analogyBox.style.display = 'block';
        });
    }
}

function showAiCodeHelper(helper) {
    if (!helper) return;
    const card = document.getElementById('ai-helper-card');
    document.getElementById('ai-helper-title').textContent = helper.title || "AI Xatolik Tahlili";
    document.getElementById('ai-helper-explanation').textContent = helper.explanation || "";
    document.getElementById('ai-helper-fix').textContent = helper.fix_suggestion || "";

    const analogyBox = document.getElementById('ai-helper-analogy-box');
    const analogyText = document.getElementById('ai-helper-analogy');
    if (helper.simple_analogy) {
        analogyText.textContent = helper.simple_analogy;
        analogyBox.style.display = 'none'; // click to reveal
    } else {
        analogyBox.style.display = 'none';
    }

    card.style.display = 'block';
}

function showCodeReviewModal(review) {
    const modal = document.getElementById('code-review-modal');
    const container = document.getElementById('review-scorecard-content');

    container.innerHTML = `
        <div style="background:#f8fafc; padding:16px; border-radius:14px; border:1px solid var(--border-color); display:flex; flex-direction:column; gap:12px;">
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:#475569;">Sintaksis:</span>
                <span style="font-weight:700; color:#15803d;">${review.syntax}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
                <span style="font-weight:700; color:#475569;">Kod tuzilishi:</span>
                <span style="font-weight:700; color:#d97706;">${review.structure}</span>
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px;">
                <span style="font-weight:700; color:#475569;">💡 Tavsiya:</span>
                <p style="font-size:13px; color:#334155; margin-top:4px;">${review.recommendation}</p>
            </div>
            <div style="border-top:1px solid var(--border-color); padding-top:10px;">
                <span style="font-weight:700; color:#475569;">📚 O‘rganish kerak:</span>
                <p style="font-size:13px; color:var(--primary); font-weight:700; margin-top:4px;">${review.learn_topic}</p>
            </div>
        </div>
    `;

    modal.classList.add('active');
}

function clearTerminal() {
    const term = document.getElementById('terminal-output');
    if (term) term.textContent = '';
}

// ==========================================
// 6. AI MENTOR CHAT (FULL SCREEN & MODES)
// ==========================================
function initMentorChat() {
    const chatInput = document.getElementById('chat-input-full');
    const sendBtn = document.getElementById('btn-chat-send-full');
    const messagesArea = document.getElementById('chat-messages-full');

    if (!chatInput || !sendBtn || !messagesArea) return;

    // Mode buttons
    const modeBtns = document.querySelectorAll('.mode-toggles .btn-mode');
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentMentorMode = btn.getAttribute('data-mode') || 'auto';
        });
    });

    async function sendMentorMessage(text) {
        const msg = text || chatInput.value.trim();
        if (!msg) return;

        appendMentorBubble('user', msg);
        chatInput.value = '';
        chatInput.focus();

        const typingId = appendTypingIndicator();

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: msg, mode: currentMentorMode })
            });

            removeTypingIndicator(typingId);

            if (res.ok) {
                const data = await res.json();
                appendMentorBubble('mentor', data.reply);
            } else {
                appendMentorBubble('mentor', "Kechirasiz, javob tayyorlashda qisqa uzilish bo'ldi.");
            }
        } catch (e) {
            removeTypingIndicator(typingId);
            appendMentorBubble('mentor', "Internet aloqasi xatoligi.");
        }
    }

    sendBtn.addEventListener('click', () => sendMentorMessage());
    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') sendMentorMessage();
    });

    const chips = document.querySelectorAll('.quick-prompts-bar .quick-prompt-chip');
    chips.forEach(chip => {
        chip.addEventListener('click', () => {
            const prompt = chip.getAttribute('data-prompt') || chip.textContent;
            sendMentorMessage(prompt);
        });
    });

    function appendMentorBubble(sender, text) {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble bubble-${sender}`;
        bubble.innerHTML = formatText(text);
        messagesArea.appendChild(bubble);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const bubble = document.createElement('div');
        bubble.id = id;
        bubble.className = 'chat-bubble bubble-mentor';
        bubble.innerHTML = '<em>HerPath AI javob tayyorlamoqda... 💭</em>';
        messagesArea.appendChild(bubble);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) el.remove();
    }

    function formatText(text) {
        return text
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\n/g, '<br>');
    }
}

// ==========================================
// 7. ROADMAP 1-10 TIMELINE
// ==========================================
async function initRoadmap() {
    const container = document.getElementById('roadmap-container-full');
    if (!container) return;

    try {
        const res = await fetch('/api/career-tracks');
        if (!res.ok) return;
        const tracks = await res.json();
        if (tracks.length === 0) return;

        const defaultTrack = tracks[0];
        let html = '';
        defaultTrack.roadmap.forEach((step, idx) => {
            let statusClass = 'step-locked';
            let iconText = idx + 1;
            let badgeText = '🔒 Qulflangan';

            if (step.status === 'completed') {
                statusClass = 'step-completed';
                iconText = '✓';
                badgeText = '✅ Bajarildi';
            } else if (step.status === 'in_progress') {
                statusClass = 'step-in-progress';
                iconText = `${step.progress || 48}%`;
                badgeText = '🔄 Jarayonda';
            }

            html += `
                <div class="roadmap-step-row ${statusClass}">
                    <div class="step-node-badge">${iconText}</div>
                    <div class="step-card-detail">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <h5>${step.title}</h5>
                            <span class="tag-chip" style="font-size:11px;">${step.duration} • ${badgeText}</span>
                        </div>
                        <p>${step.desc}</p>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Roadmap yuklash xatosi:", e);
    }
}

// ==========================================
// 8. O'RGANISH BO'LIMI (LEARNING TOPICS)
// ==========================================
async function initLearningTopics() {
    const container = document.getElementById('learning-topics-container');
    if (!container) return;

    try {
        const res = await fetch('/api/learning-topics');
        if (!res.ok) return;
        const topics = await res.json();

        let html = '';
        topics.forEach(t => {
            html += `
                <div class="dash-card" style="margin-bottom:20px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
                        <div style="display:flex; align-items:center; gap:12px;">
                            <span style="font-size:28px;">${t.icon}</span>
                            <div>
                                <h4 style="font-size:17px; font-weight:700;">${t.title}</h4>
                                <span class="tag-chip" style="font-size:11px;">${t.category}</span>
                            </div>
                        </div>
                        <button class="btn-primary" onclick="toggleTopicDetail('${t.id}')" style="padding:6px 14px; font-size:12.5px;">
                            Mavzuni ochish ➔
                        </button>
                    </div>

                    <p style="font-size:13.5px; color:#475569; margin-bottom:12px;">${t.short_desc}</p>

                    <div id="detail-${t.id}" style="display:none; border-top:1px solid var(--border-color); padding-top:16px; margin-top:12px;">
                        <div style="background:#fdf4ff; border-left:4px solid var(--accent-pink); padding:14px; border-radius:10px; margin-bottom:14px;">
                            <strong>🍰 Oddiy hayotiy misol:</strong>
                            <p style="font-size:13px; color:#475569; margin-top:4px;">${t.simple_expl}</p>
                        </div>
                        <div style="background:#f8fafc; border-left:4px solid var(--primary); padding:14px; border-radius:10px; margin-bottom:14px;">
                            <strong>🔬 Batafsil tushuntirish:</strong>
                            <p style="font-size:13px; color:#475569; margin-top:4px;">${t.detail_expl}</p>
                        </div>
                        <div style="margin-bottom:14px;">
                            <strong>💡 Amaliy misol:</strong>
                            <pre style="background:#1e1b4b; color:#38bdf8; padding:12px; border-radius:10px; font-size:12px; margin-top:6px; overflow-x:auto;"><code>${t.examples}</code></pre>
                        </div>
                        <div style="display:flex; gap:10px;">
                            <button class="btn-secondary" onclick="switchTab('tab-codelab')">💻 Code Lab'da sinab ko'rish</button>
                            <button class="btn-primary" onclick="askMentorTopic('${t.title}')">🤖 AI Mentordan so'rash</button>
                        </div>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Darslarni yuklashda xatolik:", e);
    }
}

function toggleTopicDetail(id) {
    const el = document.getElementById(`detail-${id}`);
    if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

function askMentorTopic(topicTitle) {
    switchTab('tab-mentor');
    const input = document.getElementById('chat-input-full');
    if (input) {
        input.value = `${topicTitle} bo'yicha menga oddiy hayotiy misol va amaliy topshiriq bering.`;
        document.getElementById('btn-chat-send-full').click();
    }
}

// ==========================================
// 9. AMALIY LOYIHALAR
// ==========================================
async function initProjects() {
    const container = document.getElementById('projects-container');
    if (!container) return;

    try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const projects = await res.json();

        let html = '';
        projects.forEach(p => {
            const taskItems = p.tasks.map(t => `<li>▫️ ${t}</li>`).join('');
            html += `
                <div class="dash-card" style="display:flex; flex-direction:column; justify-content:space-between; margin-bottom:16px;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <span class="badge-match" style="font-size:11.5px;">${p.level_badge}</span>
                            <span style="font-size:12px; font-weight:700; color:var(--primary);">+${p.points} XP ⭐</span>
                        </div>
                        <h4 style="font-size:16px; margin-bottom:6px;">${p.icon} ${p.title}</h4>
                        <p style="font-size:13px; color:var(--text-secondary); margin-bottom:10px;">${p.desc}</p>
                        <ul style="list-style:none; font-size:12.5px; color:#475569; margin-bottom:12px; line-height:1.6;">
                            ${taskItems}
                        </ul>
                    </div>
                    <div style="display:flex; justify-content:space-between; align-items:center; border-top:1px solid var(--border-color); padding-top:12px;">
                        <span style="font-size:12px; color:var(--text-secondary);">Texnologiya: <strong>${p.tech}</strong></span>
                        <button class="btn-primary" onclick="startProject('${p.title}')" style="padding:6px 16px; font-size:12.5px;">Boshlash ➔</button>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Loyihalarni yuklash xatosi:", e);
    }
}

function startProject(title) {
    switchTab('tab-codelab');
    document.getElementById('terminal-output').textContent = `Loyiha tanlandi: ${title}\nKod yozishni boshlang va '▶ Ishga tushirish' tugmasini bosing! 🚀`;
}

// ==========================================
// 10. TESTLAR VA VIKTORINALAR
// ==========================================
async function initQuizzes() {
    const container = document.getElementById('quizzes-container');
    if (!container) return;

    try {
        const res = await fetch('/api/quizzes');
        if (!res.ok) return;
        const quizzes = await res.json();

        let html = '';
        quizzes.forEach(q => {
            html += `
                <div class="dash-card" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:14px;">
                    <div style="display:flex; align-items:center; gap:14px;">
                        <span style="font-size:32px;">${q.icon}</span>
                        <div>
                            <h4 style="font-size:16px; font-weight:700;">${q.title}</h4>
                            <p style="font-size:12px; color:var(--text-secondary);">${q.questions_count} ta savol • Mukofot: +${q.xp_reward} XP</p>
                        </div>
                    </div>
                    <button class="btn-primary" onclick="openCareerTestModal()" style="padding:8px 18px; font-size:13px;">
                        Testni boshlash ➔
                    </button>
                </div>
            `;
        });

        container.innerHTML = html;
    } catch (e) {
        console.error("Testlar xatosi:", e);
    }
}

// ==========================================
// 11. AI MAQSAD REJALASHTIRUVCHISI
// ==========================================
function initGoalPlanner() {
    const btn = document.getElementById('btn-generate-goal');
    if (!btn) return;

    btn.addEventListener('click', async () => {
        const goalText = document.getElementById('goal-input-text').value.trim();
        const weeklyHours = document.getElementById('goal-hours-select').value;
        const container = document.getElementById('goal-result-container');

        container.innerHTML = `<p>AI shaxsiy rejani tuzmoqda...</p>`;

        try {
            const res = await fetch('/api/goal-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ goal: goalText, weekly_hours: weeklyHours })
            });

            if (res.ok) {
                const data = await res.json();
                renderGoalPlan(data);
            }
        } catch (e) {
            container.innerHTML = `<p>Reja tuzishda xatolik.</p>`;
        }
    });

    // Auto-generate on first view
    btn.click();
}

function renderGoalPlan(data) {
    const container = document.getElementById('goal-result-container');
    const dailyItems = data.daily_routine.map(r => `<li>⏱️ ${r}</li>`).join('');
    const weeklyItems = data.weekly_milestones.map(w => `<li>🚩 ${w}</li>`).join('');
    const monthlyCards = data.monthly_plan.map(m => `
        <div style="background:#fff; border:1px solid var(--border-color); padding:12px; border-radius:12px;">
            <span class="badge-match" style="font-size:11px;">${m.month}</span>
            <h5 style="font-size:13.5px; margin:4px 0;">${m.title}</h5>
            <p style="font-size:12px; color:var(--text-secondary);">${m.focus}</p>
        </div>
    `).join('');

    container.innerHTML = `
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-bottom:20px;">
            <div class="dash-card">
                <span class="card-badge">KUNLIK TARTIB</span>
                <h4 style="margin:8px 0 10px 0;">${data.daily_time}</h4>
                <ul style="list-style:none; font-size:13px; color:#475569; line-height:1.7;">
                    ${dailyItems}
                </ul>
            </div>
            <div class="dash-card">
                <span class="card-badge" style="background:#e0f2fe; color:#0284c7;">HAFTALIK MARRALAR</span>
                <h4 style="margin:8px 0 10px 0;">1-oyning haftalik rejalari:</h4>
                <ul style="list-style:none; font-size:13px; color:#475569; line-height:1.7;">
                    ${weeklyItems}
                </ul>
            </div>
        </div>

        <div class="dash-card">
            <span class="card-badge" style="background:#fce7f3; color:#db2777;">6 OYLIK TO'LIQ XARITA</span>
            <h4 style="margin:8px 0 14px 0;">Oylar bo'yicha maqsadga erishish bosqichlari:</h4>
            <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:12px;">
                ${monthlyCards}
            </div>
            <div style="margin-top:18px; background:#f5f3ff; padding:14px; border-radius:12px; font-size:13px; color:var(--primary);">
                💡 <strong>AI Maslahati:</strong> ${data.ai_advice}
            </div>
        </div>
    `;
}

// ==========================================
// 12. SAVOL-JAVOB TIZIMI (Q&A 3 DARAJA)
// ==========================================
function initQASystem() {
    const searchBtn = document.getElementById('btn-qa-search');
    const input = document.getElementById('qa-search-input');
    if (!searchBtn || !input) return;

    searchBtn.addEventListener('click', () => {
        const query = input.value.trim() || 'Machine Learning';
        updateQALevels(query);
    });

    // Default load
    updateQALevels('Machine Learning');
}

function updateQALevels(query) {
    const simple = document.getElementById('qa-content-simple');
    const medium = document.getElementById('qa-content-medium');
    const detail = document.getElementById('qa-content-detail');

    if (query.toLowerCase().includes('machine learning') || query.toLowerCase().includes('ml')) {
        simple.innerHTML = "🍰 <strong>Misol:</strong> Kichik bolaga 10 ta it va 10 ta mushuk rasmini ko'rsatsangiz, u o'zi quloqlaridan farqlashni o'rganadi. ML ham shunday — qoidasiz, misollar orqali o'rganish!";
        medium.innerHTML = "💡 <strong>Amaliy:</strong> Kompyuterga tajriba (katta ma'lumotlar) orqali qarorlar qabul qilishni o'rgatuvchi sun'iy intellekt sohasi. Spam filtrlar va tavsiya tizimlarida keng qo'llaniladi.";
        detail.innerHTML = "🔬 <strong>Chuqur:</strong> Nazorat ostidagi (Supervised), nazoratsiz (Unsupervised) va rag'batlantiruvchi ta'lim. Scikit-learn, PyTorch, gradient tushishi va yo'qotish funksiyalari (loss functions) asosida ishlaydi.";
    } else {
        simple.innerHTML = `🍰 <strong>Misol:</strong> '${query}' haqida hayotiy misol: Oshxonada retsept bo'yicha taom tayyorlashga o'xshaydi — hamma narsa aniq ketma-ketlikda bo'ladi!`;
        medium.innerHTML = `💡 <strong>Amaliy:</strong> '${query}' zamonaviy IT infratuzilmasining muhim qismi hisoblanib, loyihalarning barqaror va xatosiz ishlashiga xizmat qiladi.`;
        detail.innerHTML = `🔬 <strong>Chuqur:</strong> Texnik jihatdan '${query}' serverlar, API arxitekturasi va ma'lumotlar xavfsizligi standartlari bilan chambarchas bog'liqdir.`;
    }
}

// ==========================================
// 13. IMKONIYATLAR BAZASI
// ==========================================
async function initOpportunities() {
    const landingGrid = document.getElementById('opps-landing-grid');
    const platformGrid = document.getElementById('opps-platform-grid');

    try {
        const res = await fetch('/api/opportunities');
        if (!res.ok) return;
        const items = await res.json();

        let html = '';
        items.forEach(item => {
            html += `
                <div class="dash-card" style="display:flex; flex-direction:column; justify-content:space-between;">
                    <div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:10px;">
                            <span class="tag-chip" style="background:#ede9fe; color:var(--primary); font-weight:700;">${item.category.toUpperCase()}</span>
                            <span style="font-size:11px; color:#ef4444; font-weight:600;">Muddati: ${item.deadline}</span>
                        </div>
                        <h4 style="font-size:15.5px; font-weight:700; margin-bottom:6px; color:var(--text-primary);">${item.title}</h4>
                        <p style="font-size:12.5px; color:var(--text-secondary); margin-bottom:12px; line-height:1.5;">${item.description}</p>
                        <p style="font-size:11px; color:var(--primary); font-weight:600; margin-bottom:14px;">${item.tags}</p>
                    </div>
                    <a href="${item.link}" target="_blank" class="btn-primary" style="justify-content:center; padding:8px 16px; font-size:13px;">
                        Ariza topshirish ➔
                    </a>
                </div>
            `;
        });

        if (landingGrid) landingGrid.innerHTML = html;
        if (platformGrid) platformGrid.innerHTML = html;
    } catch (e) {
        console.error("Imkoniyatlar yuklash xatosi:", e);
    }
}

// ==========================================
// UTILITY: CANVAs CONFETTI
// ==========================================
function triggerConfetti() {
    if (typeof confetti === 'function') {
        confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
}
