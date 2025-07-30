# 부산 검증된 직장인 웹사이트

React 프로젝트를 HTML, CSS, JavaScript, PHP로 변환한 반응형 웹사이트입니다.

## 프로젝트 구조

```
new6/
├── index.html              # 메인 페이지 (소개)
├── meeting.html            # 모임 신청 페이지
├── oneday-class.html       # 원데이클래스 페이지
├── styles/                 # CSS 파일들
│   ├── common.css         # 공통 스타일
│   ├── header.css         # 헤더 스타일
│   ├── about.css          # 소개 페이지 스타일
│   ├── calendar.css       # 캘린더 스타일
│   ├── meeting.css        # 모임 페이지 스타일
│   ├── oneday-class.css   # 원데이클래스 스타일
│   ├── modal.css          # 모달 스타일
│   └── responsive.css     # 반응형 스타일
├── js/                     # JavaScript 파일들
│   ├── common.js          # 공통 기능
│   ├── calendar.js        # 캘린더 기능
│   ├── meeting.js         # 모임 페이지 기능
│   ├── oneday-class.js    # 원데이클래스 기능
│   └── api.js             # API 통신
└── api/                    # PHP 백엔드
    ├── config.php         # 설정 파일
    ├── events.php         # 이벤트 API
    ├── applications.php   # 신청 API
    └── database.sql       # 데이터베이스 스키마

```

## 주요 기능

1. **반응형 디자인**: 모바일, 태블릿, 데스크톱 모든 화면에 최적화
2. **캘린더 기능**: 날짜별 이벤트 확인 및 선택
3. **모임/클래스 신청**: 상세 정보 확인 및 신청
4. **모달 팝업**: 이벤트 상세 정보 표시
5. **PHP 백엔드**: 데이터베이스 연동 (선택사항)

## 설치 및 실행

### 기본 실행 (정적 페이지)
1. 웹 서버에 파일 업로드
2. index.html 접속

### PHP 백엔드 사용 시
1. MySQL 데이터베이스 생성
2. `api/database.sql` 실행하여 테이블 생성
3. `api/config.php`에서 데이터베이스 정보 수정
4. PHP가 설치된 웹 서버에서 실행

## 브라우저 지원

- Chrome (최신)
- Firefox (최신)
- Safari (최신)
- Edge (최신)
- Mobile browsers

## 반응형 브레이크포인트

- 대형 데스크톱: 1400px 이상
- 데스크톱: 1200px - 1399px
- 작은 데스크톱: 992px - 1199px
- 태블릿: 768px - 991px
- 큰 모바일: 576px - 767px
- 모바일: 576px 미만