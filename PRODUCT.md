# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- 주요 방문자는 Codyssey 평가자와 동료 학습자다. 미션 결과와 학습 과정을 확인한다. (사용자 확인: 2026-09-24)
- 제작자는 웹 기초를 배우는 학습자다. AI가 작성한 코드도 자기 말로 설명하고 작은 변경의 결과를 예측하는 것이 목표다.

## Product Purpose

Codyssey B1-1 「나를 소개하는 웹페이지 처음부터 만들기」의 결과물인 개인 학습 포트폴리오다. 자기소개, 사용 기술, 실제 GitHub 저장소와 웹 인터랙션을 통해 학습 결과를 보여준다. 성공 기준은 미션 요구사항 충족과 코드 흐름에 대한 학습자의 설명 능력이다. 구현 완료를 이해 완료로 간주하지 않는다.

## Operating Context

- 요구사항의 기준은 `Codyssey/미션.md`와 `Codyssey/B1-1 평가기준.md`다. 필수 조건, 선택 보너스, 참고 예시를 구분한다.
- 학습 진행은 `AGENTS.md`, `Codyssey/튜터 규칙.md`, `Codyssey/학습 기록.md` 및 사용자의 최신 지시를 따른다. 한국어로 설명하고 추가 질문은 한 번에 하나씩 한다.
- VS Code + Live Server로 개발하고 최신 Chrome에서 확인한다. 배포 대상은 GitHub Pages다.
- 모바일·태블릿·데스크톱 및 라이트·다크 테마를 고려한다.
- README에 배포 URL과 스크린샷이 기록되어 있으나, 초기 설정 작업에서 배포 상태나 브라우저 동작을 새로 검증한 것은 아니다.

## Capabilities and Constraints

### 반드시 유지할 미션 조건

- 순수 HTML·CSS·JavaScript를 사용한다. React, Vue, jQuery, Bootstrap, Tailwind CSS 등 외부 구현 라이브러리를 도입하지 않는다. 아이콘(Font Awesome)과 웹 폰트(Google Fonts)는 미션에서 허용한다.
- `index.html`, `css/`, `js/`, `images/`의 역할 분리, 외부 CSS 연결과 `defer` JavaScript 연결을 유지한다.
- Hero, About, Skills, Projects, Contact, Footer와 시맨틱 HTML 구조를 유지한다.
- CSS 변수와 다크 테마 변수, 내비게이션 Flexbox, 프로젝트 Grid(`auto-fit`, `minmax`), 모바일 퍼스트 및 768px·1024px 기준을 보존한다. 미션의 hover·transition·카드 그림자 조건을 일반 디자인 권고 때문에 삭제하지 않는다.
- `const`·`let`, `addEventListener`, DOM 선택·내용·클래스 조작, 필수 이벤트 처리 및 ES6+ 평가 문법을 유지한다. `var`, HTML `onclick`, 인라인 `style` 속성을 도입하지 않는다.
- GitHub API는 `fetch`와 `async/await`, `try/catch`로 처리하며 로딩·성공·에러·빈 상태와 재시도를 유지한다.
- 이벤트 → 상태 변경 → 화면 업데이트 흐름이 코드에서 설명 가능해야 한다.
- README의 프로젝트 설명·기술·배포 URL·스크린샷과 미션 제출물을 유지한다. 선택 과제는 필수 조건으로 확대하지 않는다.

### 현재 소스에서 확인한 기능

- `STATE` 객체와 렌더 함수 기반의 테마·프로젝트·필터·로딩 상태 관리.
- 다크 모드 전환과 localStorage 저장, 모바일 메뉴와 링크 선택 시 닫기.
- 부드러운 스크롤, 300px 스크롤 탑, 60px 헤더 스타일 변경, Intersection Observer 등장 효과.
- `hauteville1862`의 GitHub 저장소 표시, 언어 필터링과 Hero 타이핑 효과.
- 이름·이메일·메시지 입력 검증. Contact는 연습용 폼이며 실제 이메일을 전송하지 않는다. 전송했다고 표현하지 않는다.
- 위 목록은 소스 검토 결과이며 이번 초기 설정에서 기능 테스트를 수행했다는 뜻이 아니다.

## Brand Commitments

- 사용자가 기존 디자인과 기능 유지를 명시했다. 기존 `index.html`, `css/style.css`, `js/script.js`와 이미지 자산을 기준으로 작업하며, 새 디자인이나 기능으로 임의 교체하지 않는다.
- AI 도움을 받은 학습 과정과 현재 학습 단계에 대한 정직한 자기소개를 보존한다. 확인되지 않은 전문성·경력·실적을 추가하지 않는다.

## Evidence on Hand

- `index.html`: 한국어 자기소개, 기술 소개, 연습용 폼 안내, GitHub 링크.
- `css/style.css`, `js/script.js`: 현재 디자인 및 기능 구현 근거.
- `images/profile.png`: 기존 프로필 캐리커처. README의 스크린샷 참조는 기존 화면 기록이다.
- `Codyssey/미션.md`, `Codyssey/B1-1 평가기준.md`: 평가 요구사항.
- `Codyssey/학습 기록.md`: 이전 학습·작업 이력. 최신 소스와 차이가 있으면 기록만으로 현재 상태를 단정하지 않는다.

## Product Principles

1. 평가 조건과 학습자의 코드 이해를 우선한다.
2. 요청 범위 안에서 기존 디자인·기능·사실에 기반한 내용을 보존한다.
3. 오류와 빈 데이터 등 실제 상태를 명확하게 알린다.
4. 구현 여부, 실행 검증 여부, 사용자 이해 여부를 구분한다.

## Accessibility & Inclusion

의미 있는 이미지 대체 텍스트와 label 연결을 유지한다. 기존 본문 바로가기, 키보드 초점 표시, 버튼의 접근성 이름·상태, 폼 오류 안내, API 상태 알림을 보존한다. 별도의 접근성 인증을 받았다고 주장하지 않는다.
