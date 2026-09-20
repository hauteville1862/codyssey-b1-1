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

// 이메일 형식 검증 (@ 포함 여부)
function checkEmailFormat(value) {
    if (!value.includes('@')) {
        return '올바른 이메일 형식이 아닙니다. (@가 포함되어야 합니다)';
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
            entry.target.closest('.fade-section').classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll('.fade-section').forEach(section => {
    const heading = section.querySelector('h2');
    if (heading) {
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

// 6. GitHub API 연동 및 상태(Loading/Success/Error) 처리
const GITHUB_USERNAME = 'hauteville1862'; // 현재 저장소의 GitHub 소유자
const apiStatus = document.querySelector('#api-status');
const repoList = document.querySelector('#repo-list');
const retryReposBtn = document.querySelector('#retry-repos');
let isLoadingRepos = false;

async function fetchGitHubRepos() {
    if (isLoadingRepos) return;
    isLoadingRepos = true;
    retryReposBtn.disabled = true;
    retryReposBtn.hidden = true;
    repoList.innerHTML = '';
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

        // 성공 상태 UI 처리 (배열 메서드 map + 구조분해 할당 활용)
        const htmlString = repos.map(({ name, html_url, description }) => `
            <article class="card">
                <h3><a href="${html_url}" target="_blank">${name}</a></h3>
                <p>${description || '설명이 없습니다.'}</p>
            </article>
        `).join('');

        repoList.innerHTML = htmlString;
        apiStatus.hidden = true;

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
