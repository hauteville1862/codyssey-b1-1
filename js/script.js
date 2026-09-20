// script.js

// 1. 다크 모드 (로컬스토리지 상태 유지)
const toggleBtn = document.querySelector('#dark-mode-toggle');
const currentTheme = localStorage.getItem('theme');

if (currentTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
}

toggleBtn.addEventListener('click', () => {
    let theme = document.documentElement.getAttribute('data-theme');
    if (theme === 'dark') {
        document.documentElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    } else {
        document.documentElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    }
});

// 2. 모바일 햄버거 메뉴 토글
const hamburgerBtn = document.querySelector('#hamburger-btn');
const navMenu = document.querySelector('#nav-menu');

hamburgerBtn.addEventListener('click', () => {
    navMenu.classList.toggle('active');
});

// 3. 폼 유효성 검사 및 제출 이벤트 방지
const contactForm = document.querySelector('#contact-form');
const formMsg = document.querySelector('#form-msg');

contactForm.addEventListener('submit', (event) => {
    event.preventDefault(); // 기본 제출 새로고침 방지
    const name = document.querySelector('#name').value;
    const email = document.querySelector('#email').value;

    if (name.trim() === '' || email.trim() === '') {
        formMsg.textContent = "모든 항목을 입력해주세요.";
        formMsg.style.color = "red";
        return;
    }

    // 성공 상태 변경
    formMsg.textContent = "성공적으로 메시지가 전송되었습니다!";
    formMsg.style.color = "green";
    contactForm.reset(); // 폼 초기화
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

// 5. 스크롤 탑 버튼
const scrollTopBtn = document.querySelector('#scroll-top-btn');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollTopBtn.style.display = 'block';
    } else {
        scrollTopBtn.style.display = 'none';
    }
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

        // 성공 상태 UI 처리 (배열 메서드 map 활용)
        const htmlString = repos.map(repo => `
            <article class="card">
                <h3><a href="${repo.html_url}" target="_blank">${repo.name}</a></h3>
                <p>${repo.description || '설명이 없습니다.'}</p>
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
