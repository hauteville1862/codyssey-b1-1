// script.js

// 1. 다크 모드 (로컬스토리지 상태 유지)
const toggleBtn = document.querySelector('#dark-mode-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    toggleBtn.setAttribute('aria-pressed', 'true');
}

toggleBtn.addEventListener('click', () => {
    // 개나리색 번짐 애니메이션 트리거
    toggleBtn.classList.remove('blooming');
    void toggleBtn.offsetWidth;
    toggleBtn.classList.add('blooming');

    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
        toggleBtn.setAttribute('aria-pressed', 'false');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
        toggleBtn.setAttribute('aria-pressed', 'true');
    }
});

// 2. 모바일 햄버거 메뉴 토글
const hamburgerBtn = document.querySelector('#hamburger-btn');
const navMenu = document.querySelector('#nav-menu');

hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const isOpen = navMenu.classList.contains('active');
    hamburgerBtn.setAttribute('aria-expanded', isOpen);
    hamburgerBtn.setAttribute('aria-label', isOpen ? '메뉴 닫기' : '메뉴 열기');
});

// 3. 폼 유효성 검사 (필드별 에러 + 이메일 형식 + input 이벤트 실시간 검증)
const contactForm = document.querySelector('#contact-form');
const formMsg = document.querySelector('#form-msg');
const nameInput = document.querySelector('#name');
const emailInput = document.querySelector('#email');
const messageInput = document.querySelector('#message');

// 개별 필드 검증 함수
function validateField(input, errorId, customCheck) {
    const errorEl = document.querySelector(`#${errorId}`);
    const value = input.value.trim();
    let message = '';

    if (value === '') {
        message = '이 항목을 입력해주세요.';
    } else if (customCheck) {
        message = customCheck(value);
    }

    errorEl.textContent = message;
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    return message === '';
}

// 이메일 형식 검증 (이름@도메인.확장자)
function checkEmailFormat(value) {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return '이메일을 이름@도메인.확장자 형식으로 입력해주세요.';
    }
    return '';
}

// input 이벤트: 입력 중 실시간 검증
nameInput.addEventListener('input', () => {
    validateField(nameInput, 'name-error');
});
emailInput.addEventListener('input', () => {
    validateField(emailInput, 'email-error', checkEmailFormat);
});
messageInput.addEventListener('input', () => {
    validateField(messageInput, 'message-error');
});

// submit 이벤트: 전체 검증
contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const isNameValid = validateField(nameInput, 'name-error');
    const isEmailValid = validateField(emailInput, 'email-error', checkEmailFormat);
    const isMessageValid = validateField(messageInput, 'message-error');

    if (!isNameValid || !isEmailValid || !isMessageValid) {
        formMsg.textContent = '';
        formMsg.className = '';
        return;
    }

    // 성공 상태
    formMsg.textContent = '성공적으로 메시지가 전송되었습니다!';
    formMsg.className = 'form-success';
    contactForm.reset();
    // 성공 후 에러 표시 초기화
    document.querySelectorAll('.field-error').forEach(el => { el.textContent = ''; });
    document.querySelectorAll('[aria-invalid]').forEach(el => { el.removeAttribute('aria-invalid'); });
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

window.addEventListener('scroll', () => {
    // 스크롤 300px 이상에서 스크롤 탑 버튼 표시
    scrollTopBtn.hidden = window.scrollY <= 300;

    // 스크롤 60px 이상에서 네비게이션 배경색 변경
    header.classList.toggle('scrolled', window.scrollY > 60);
});
scrollTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// 6. GitHub API 연동 및 상태(Loading/Success/Error) 처리 + 언어별 필터링 (보너스 과제)
const GITHUB_USERNAME = 'hauteville1862'; // 현재 저장소의 GitHub 소유자
const apiStatus = document.querySelector('#api-status');
const repoList = document.querySelector('#repo-list');
const retryReposBtn = document.querySelector('#retry-repos');
const filterContainer = document.querySelector('#project-filters');

let allRepos = [];         // 2단계: API로 받아온 전체 원본 프로젝트 보관
let currentFilter = 'all'; // 현재 선택된 언어 필터 상태
let isLoadingRepos = false;

// 3단계: 전달받은 프로젝트 목록을 화면에 렌더링하는 함수 (map + 구조분해 할당)
function renderProjects(reposToRender) {
    if (reposToRender.length === 0) {
        repoList.innerHTML = '<p class="repo-empty-filter">선택한 언어의 프로젝트가 없습니다.</p>';
        return;
    }

    const htmlString = reposToRender.map(({ name, html_url, description, language, stargazers_count }) => `
        <article class="card">
            <div class="card-body">
                <h3><a href="${html_url}" target="_blank" rel="noopener noreferrer">${name}</a></h3>
                <p>${description || '설명이 없습니다.'}</p>
            </div>
            <div class="card-meta">
                <span class="repo-lang">${language || 'Other'}</span>
                ${stargazers_count > 0 ? `<span class="repo-stars">★ ${stargazers_count}</span>` : ''}
            </div>
        </article>
    `).join('');

    repoList.innerHTML = htmlString;
}

// 필터 버튼 동적 생성 함수
function renderFilterButtons(repos) {
    const detectedLanguages = [...new Set(repos.map(r => r.language).filter(Boolean))];
    const hasUntagged = repos.some(r => !r.language);

    const filterList = ['all', ...detectedLanguages];
    if (hasUntagged) {
        filterList.push('Other');
    }

    filterContainer.innerHTML = filterList.map(lang => {
        const label = lang === 'all' ? 'All' : lang;
        const isActive = lang === currentFilter;
        return `<button type="button" class="filter-btn ${isActive ? 'active' : ''}" data-language="${lang}" aria-pressed="${isActive ? 'true' : 'false'}">${label}</button>`;
    }).join('');
}

// 5단계: Array.prototype.filter()로 조건에 맞는 프로젝트를 추출 후 화면 갱신
function applyFilter() {
    let filtered;
    if (currentFilter === 'all') {
        filtered = allRepos;
    } else if (currentFilter === 'Other') {
        filtered = allRepos.filter(repo => !repo.language);
    } else {
        filtered = allRepos.filter(repo => repo.language === currentFilter);
    }
    renderProjects(filtered);
}

// 4단계: 필터 버튼 클릭 이벤트 등록 (이벤트 위임 패턴)
filterContainer.addEventListener('click', (event) => {
    const btn = event.target.closest('.filter-btn');
    if (!btn) return;

    const selectedLang = btn.dataset.language;
    if (selectedLang === currentFilter) return;

    // 상태 변경
    currentFilter = selectedLang;

    // 버튼 활성 상태(UI) 갱신
    filterContainer.querySelectorAll('.filter-btn').forEach(b => {
        const active = b.dataset.language === currentFilter;
        b.classList.toggle('active', active);
        b.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // 필터링 적용 및 화면 렌더링
    applyFilter();
});

// GitHub API 호출 함수
async function fetchGitHubRepos() {
    if (isLoadingRepos) return;
    isLoadingRepos = true;
    retryReposBtn.disabled = true;
    retryReposBtn.hidden = true;
    repoList.innerHTML = '';
    filterContainer.innerHTML = '';
    apiStatus.hidden = false;
    apiStatus.classList.remove('api-error');
    apiStatus.textContent = "데이터를 불러오는 중입니다...";

    try {
        const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos`);

        if (!response.ok) {
            throw new Error('API 호출 에러 (레이트 리밋 등)');
        }

        const repos = await response.json();

        // 빈 상태 UI 처리
        if (repos.length === 0) {
            apiStatus.textContent = "표시할 프로젝트가 없습니다.";
            return;
        }

        // 데이터 보관 및 화면 렌더링
        allRepos = repos;
        apiStatus.hidden = true;
        renderFilterButtons(allRepos);
        applyFilter();

    } catch (error) {
        // 에러 상태 UI 처리
        apiStatus.textContent = "프로젝트를 불러올 수 없습니다. 다시 시도해주세요.";
        apiStatus.classList.add('api-error');
        retryReposBtn.hidden = false;
    } finally {
        isLoadingRepos = false;
        retryReposBtn.disabled = false;
    }
}

retryReposBtn.addEventListener('click', fetchGitHubRepos);

// 스크립트가 로드되면 API 호출
fetchGitHubRepos();
