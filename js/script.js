// script.js

// ==========================================================================
// 단일 중앙 상태 관리 객체 (Single Source of Truth)
// "이벤트 발생 → STATE 상태 갱신 → 화면 렌더링(render)" 흐름으로 일관되게 관리한다.
// ==========================================================================
const STATE = {
    theme: 'light',            // 테마 상태: 'light' | 'dark'
    isMenuOpen: false,         // 모바일 메뉴 열림 여부
    form: {
        errors: { name: '', email: '', message: '' },
        status: ''             // 연습용 폼의 제출 결과 메시지
    },
    allRepos: [],              // API로 받아온 전체 프로젝트 목록
    currentFilter: 'all',      // 현재 선택된 언어 필터: 'all' | 언어명 | 'Other'
    repoStatus: 'idle'         // 'idle' | 'loading' | 'success' | 'empty' | 'error'
};
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');

// 1. 다크 모드 (로컬스토리지 상태 유지 및 STATE 연동)
const toggleBtn = document.querySelector('#dark-mode-toggle');
try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === 'light') {
        STATE.theme = savedTheme;
    }
} catch (error) {
    // 저장소 접근이 차단되어도 나머지 기능은 실행한다.
    console.warn('저장된 테마를 읽을 수 없습니다.', error);
}

// 테마 상태(STATE.theme)를 화면 DOM에 반영하는 렌더 함수
function renderTheme() {
    document.documentElement.dataset.theme = STATE.theme;
    toggleBtn.ariaPressed = String(STATE.theme === 'dark');
}
renderTheme();

toggleBtn.addEventListener('click', () => {
    // 1. 상태 갱신: STATE.theme 토글
    STATE.theme = STATE.theme === 'dark' ? 'light' : 'dark';

    // 2. 화면 렌더링
    renderTheme();

    // 3. 부수 효과: 로컬스토리지 저장
    try {
        localStorage.setItem('theme', STATE.theme);
    } catch (error) {
        // 저장할 수 없어도 현재 화면의 테마 전환은 유지한다.
        console.warn('테마를 저장할 수 없습니다.', error);
    }
});

// 2. 모바일 햄버거 메뉴 토글
const hamburgerBtn = document.querySelector('#hamburger-btn');
const navMenu = document.querySelector('#nav-menu');

function renderMenu() {
    navMenu.classList.toggle('active', STATE.isMenuOpen);
    hamburgerBtn.ariaExpanded = String(STATE.isMenuOpen);
    hamburgerBtn.ariaLabel = STATE.isMenuOpen ? '메뉴 닫기' : '메뉴 열기';
}
renderMenu();

hamburgerBtn.addEventListener('click', () => {
    STATE.isMenuOpen = !STATE.isMenuOpen;
    renderMenu();
});

// 모바일 환경에서 메뉴 링크 클릭 시 자동으로 메뉴 닫기
navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
        STATE.isMenuOpen = false;
        renderMenu();
    });
});

// 3. 폼 유효성 검사 (필드별 에러 + 이메일 형식 + input 이벤트 실시간 검증)
const contactForm = document.querySelector('#contact-form');
const formMsg = document.querySelector('#form-msg');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');

// 검증은 오류 문자열만 계산하고, 화면은 렌더 함수가 갱신한다.
function getFieldError(value, customCheck) {
    const trimmedValue = value.trim();
    if (trimmedValue === '') return '이 항목을 입력해주세요.';
    return customCheck ? customCheck(trimmedValue) : '';
}

function renderFieldError(fieldName) {
    const error = STATE.form.errors[fieldName];
    document.querySelector(`#${fieldName}-error`).textContent = error;
    document.querySelector(`#${fieldName}`).ariaInvalid = String(error !== '');
}

function renderFormStatus() {
    formMsg.textContent = STATE.form.status;
    formMsg.classList.toggle('form-success', STATE.form.status !== '');
}

function renderForm() {
    ['name', 'email', 'message'].forEach(renderFieldError);
    renderFormStatus();
}

// 이메일 형식 검증 (이름@도메인.확장자)
function checkEmailFormat(value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '이메일을 이름@도메인.확장자 형식으로 입력해주세요.';
    }
    return '';
}

// input 이벤트: 입력 중 실시간 검증
contactForm.addEventListener('input', () => {
    // 새 입력에는 이전 제출의 성공 안내를 표시하지 않는다.
    STATE.form.status = '';
    renderFormStatus();
});

nameInput.addEventListener('input', () => {
    STATE.form.errors.name = getFieldError(nameInput.value);
    renderFieldError('name');
});
emailInput.addEventListener('input', () => {
    STATE.form.errors.email = getFieldError(emailInput.value, checkEmailFormat);
    renderFieldError('email');
});
messageInput.addEventListener('input', () => {
    STATE.form.errors.message = getFieldError(messageInput.value);
    renderFieldError('message');
});

// submit 이벤트: 전체 검증
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    STATE.form.errors.name = getFieldError(nameInput.value);
    STATE.form.errors.email = getFieldError(emailInput.value, checkEmailFormat);
    STATE.form.errors.message = getFieldError(messageInput.value);
    STATE.form.status = '';
    renderForm();

    const { name, email, message } = STATE.form.errors;
    if (name || email || message) return;

    // 성공 상태 (연습용 폼 안내)
    contactForm.reset();
    STATE.form.errors = { name: '', email: '', message: '' };
    STATE.form.status = '입력 내용이 확인되었습니다. 실제 이메일은 전송되지 않았습니다.';
    renderForm();
});

// 4. 섹션 전체 대신 제목을 관찰해, 목록이 길어져도 등장하게 한다.
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.2) {
            const section = entry.target.closest('.fade-section');
            section.classList.remove('reveal-pending');
            section.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-section').forEach(section => {
    const heading = section.querySelector('h2');
    if (heading) {
        section.classList.add('reveal-pending');
        observer.observe(heading);
    } else {
        section.classList.add('visible');
    }
});

// 5. 스크롤 탑 버튼 + 네비게이션 스크롤 스타일 변경
const scrollTopBtn = document.querySelector('#scroll-top-btn');
const header = document.querySelector('#header');

function updateScrollState() {
    // 스크롤 300px 이상에서 스크롤 탑 버튼 표시
    scrollTopBtn.hidden = window.scrollY < 300;

    // 스크롤 60px 이상에서 네비게이션 배경색 변경
    header.classList.toggle('scrolled', window.scrollY >= 60);
}
window.addEventListener('scroll', updateScrollState);
window.addEventListener('pageshow', updateScrollState);
updateScrollState();
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: motionPreference.matches ? 'auto' : 'smooth' });
});

// 6. GitHub API 연동 및 상태(Loading/Success/Error) 처리 + 언어별 필터링 (보너스 과제)
const GITHUB_USERNAME = 'hauteville1862'; // 현재 저장소의 GitHub 소유자
const apiStatus = document.querySelector('#api-status');
const repoList = document.querySelector('#repo-list');
const retryReposBtn = document.querySelector('#retry-repos');
const filterContainer = document.querySelector('#project-filters');

// API의 글자를 HTML 태그나 속성으로 해석하지 않도록 바꾼다.
function escapeHtml(value) {
    return String(value)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

// 전달받은 프로젝트 목록을 카드로 표시한다. (map + 구조분해 할당)
function renderProjects(reposToRender) {
    if (reposToRender.length === 0) {
        repoList.innerHTML = '<p class="repo-empty-filter">선택한 언어의 프로젝트가 없습니다.</p>';
        return;
    }

    const htmlString = reposToRender.map(({ name, html_url, description, language, stargazers_count }) => `
        <article class="card">
            <div class="card-body">
                <h3><a href="${escapeHtml(html_url)}" target="_blank" rel="noopener noreferrer">${escapeHtml(name)}</a></h3>
                <p>${escapeHtml(description || '설명이 없습니다.')}</p>
            </div>
            <div class="card-meta">
                <span class="repo-lang">${escapeHtml(language || 'Other')}</span>
                ${stargazers_count > 0 ? `<span class="repo-stars">★ ${escapeHtml(stargazers_count)}</span>` : ''}
            </div>
        </article>
    `).join('');

    repoList.innerHTML = htmlString;
}

// 필터 버튼 동적 생성 함수
function renderFilterButtons() {
    if (STATE.repoStatus !== 'success') {
        filterContainer.innerHTML = '';
        return;
    }
    const filterList = ['all'];
    let hasUntagged = false;
    STATE.allRepos.forEach(repo => {
        if (!repo.language) {
            hasUntagged = true;
        } else if (!filterList.includes(repo.language)) {
            filterList.push(repo.language);
        }
    });
    if (hasUntagged) {
        filterList.push('Other');
    }

    filterContainer.innerHTML = filterList.map(lang => {
        const label = lang === 'all' ? 'All' : lang;
        const isActive = lang === STATE.currentFilter;
        return `<button type="button" class="filter-btn ${isActive ? 'active' : ''}" data-language="${escapeHtml(lang)}" aria-pressed="${isActive}">${escapeHtml(label)}</button>`;
    }).join('');
}

// filter로 선택한 언어의 프로젝트만 골라 화면을 갱신한다.
function applyFilter() {
    let filtered;
    if (STATE.currentFilter === 'all') {
        filtered = STATE.allRepos;
    } else if (STATE.currentFilter === 'Other') {
        filtered = STATE.allRepos.filter(repo => !repo.language);
    } else {
        filtered = STATE.allRepos.filter(repo => repo.language === STATE.currentFilter);
    }
    renderProjects(filtered);
}

// 필터 영역에서 클릭한 버튼을 찾는다.
filterContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    const selectedLang = btn.dataset.language;
    if (selectedLang === STATE.currentFilter) return;

    // 상태 변경
    STATE.currentFilter = selectedLang;

    // 버튼 활성 상태는 STATE에서 파생한다.
    renderFilterButtons();
    // 버튼 재생성 후에도 키보드 포커스를 같은 필터에 유지한다.
    filterContainer.querySelectorAll('.filter-btn').forEach(button => {
        if (button.dataset.language === STATE.currentFilter) button.focus();
    });

    // 필터링 적용 및 화면 렌더링
    applyFilter();
});

// API 상태에 따른 메시지, 재시도 버튼, 목록을 한 곳에서 표현한다.
function renderRepoState() {
    const status = STATE.repoStatus;
    apiStatus.hidden = status === 'idle' || status === 'success';
    apiStatus.classList.toggle('api-error', status === 'error');
    retryReposBtn.hidden = status !== 'error';
    retryReposBtn.disabled = status === 'loading';

    if (status === 'loading') {
        apiStatus.textContent = '데이터를 불러오는 중입니다...';
    } else if (status === 'empty') {
        apiStatus.textContent = '표시할 프로젝트가 없습니다.';
    } else if (status === 'error') {
        apiStatus.textContent = '프로젝트를 불러올 수 없습니다. 다시 시도해주세요.';
    } else {
        apiStatus.textContent = '';
    }

    renderFilterButtons();
    if (status === 'success') {
        applyFilter();
    } else {
        repoList.innerHTML = '';
    }
}

// GitHub API 호출 함수: 상태를 갱신한 뒤 렌더 함수에 화면 반영을 맡긴다.
async function fetchGitHubRepos() {
    if (STATE.repoStatus === 'loading') return;
    STATE.repoStatus = 'loading';
    STATE.allRepos = [];
    STATE.currentFilter = 'all';
    renderRepoState();

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);

        if (!response.ok) {
            throw new Error('API 호출 에러 (레이트 리밋 등)');
        }

        const repos = await response.json();

        STATE.allRepos = repos;
        STATE.repoStatus = repos.length === 0 ? 'empty' : 'success';
    } catch (error) {
        STATE.repoStatus = 'error';
    }
    renderRepoState();
}

retryReposBtn.addEventListener('click', fetchGitHubRepos);

// 스크립트가 로드되면 API 호출
fetchGitHubRepos();

// 7. Hero 섹션 타이핑 효과 (보너스 과제)
const typingElement = document.querySelector('#typing-text');
const typingCursor = document.querySelector('.typing-cursor');
if (typingElement) {
    const phrases = [
        { accent: '성장하는 프론트엔드 개발자', suffix: '입니다.' },
        { accent: 'AI의 코드를 내 것으로 만드는 학생', suffix: '입니다.' },
        { accent: '내 언어로 배움을 설명하는 사람', suffix: '입니다.' }
    ];
    let phraseIndex = 0;
    const firstItem = phrases[0];
    let charIndex = firstItem.accent.length + firstItem.suffix.length;
    let isDeleting = false;
    let typingSpeed = 135;
    let typingTimer;

    function renderTyping(item, count) {
        if (count <= item.accent.length) {
            return `<span class="accent-text">${item.accent.substring(0, count)}</span>`;
        } else {
            const suffixCount = count - item.accent.length;
            return `<span class="accent-text">${item.accent}</span>${item.suffix.substring(0, suffixCount)}`;
        }
    }

    function typeLoop() {
        if (motionPreference.matches) return;
        const currentItem = phrases[phraseIndex];
        const totalLength = currentItem.accent.length + currentItem.suffix.length;

        if (isDeleting) {
            // 한 글자씩 삭제 (백스페이스 꾹 누른 듯 매우 빠르게)
            charIndex--;
            typingElement.innerHTML = renderTyping(currentItem, charIndex);
            typingSpeed = 20;
        } else {
            // 한 글자씩 타이핑 (또박또박 여유로운 타건감)
            charIndex++;
            typingElement.innerHTML = renderTyping(currentItem, charIndex);
            typingSpeed = 135;
        }

        // 커서 색상 동기화: '입니다.' 영역에선 기본 텍스트 색, 앞 문구 영역에선 포인트 색
        if (typingCursor) {
            typingCursor.classList.toggle('suffix-cursor', charIndex > currentItem.accent.length);
        }

        // 문장이 완성되었을 때: 2초 동안 읽을 시간 제공
        if (!isDeleting && charIndex === totalLength) {
            typingSpeed = 2000;
            isDeleting = true;
        }
        // 문장이 완전히 지워졌을 때: 0.35초 대기 후 다음 문구 시작
        else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            phraseIndex = (phraseIndex + 1) % phrases.length;
            typingSpeed = 350;
        }

        typingTimer = setTimeout(typeLoop, typingSpeed);
    }

    // 움직임 감소 설정에서는 완성 문장을 유지한다. 설정 변경 시 기존 예약도 취소한다.
    function syncTypingMotion() {
        clearTimeout(typingTimer);
        phraseIndex = 0;
        charIndex = firstItem.accent.length + firstItem.suffix.length;
        isDeleting = true;
        typingElement.innerHTML = renderTyping(firstItem, charIndex);
        if (typingCursor) typingCursor.classList.add('suffix-cursor');
        if (!motionPreference.matches) {
            typingTimer = setTimeout(typeLoop, 2000);
        }
    }
    motionPreference.addEventListener('change', syncTypingMotion);
    syncTypingMotion();
}
