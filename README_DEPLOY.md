# 부산 검증된 직장인 커뮤니티 - 배포 가이드

## 🚀 빠른 시작

### 1. Supabase 설정

1. [Supabase](https://supabase.com)에서 프로젝트 생성
2. SQL Editor에서 `database/schema.sql` 실행하여 테이블 생성
3. Project Settings > API에서 다음 정보 복사:
   - Project URL
   - Anon/Public Key

### 2. 프로젝트 설정

1. `config.js` 파일 생성 및 Supabase 정보 입력:
```javascript
window.SUPABASE_URL = 'your-project-url';
window.SUPABASE_ANON_KEY = 'your-anon-key';
```

### 3. 배포 옵션

#### GitHub Pages (무료)
1. GitHub 저장소 Settings > Pages
2. Source: Deploy from a branch
3. Branch: main, folder: / (root)
4. Save 클릭

#### Vercel (추천)
1. [Vercel](https://vercel.com)에서 GitHub 연동
2. Import Project > GitHub 저장소 선택
3. 환경 변수 설정 (선택사항)
4. Deploy 클릭

#### Netlify
1. [Netlify](https://netlify.com)에서 GitHub 연동
2. New site from Git > GitHub 저장소 선택
3. Build settings는 기본값 유지
4. Deploy site 클릭

### 4. 커스텀 도메인 설정 (선택사항)

각 플랫폼의 도메인 설정 가이드를 참조하여 커스텀 도메인 연결

## 📁 프로젝트 구조

```
oppood_seat/
├── index.html              # 메인 페이지
├── meeting.html            # 모임 페이지
├── oneday-class.html       # 원데이클래스 페이지
├── seating.html           # 좌석 예약 페이지
├── community.html         # 커뮤니티 페이지
├── calendar.html          # 캘린더 페이지
├── profile.html           # 프로필 페이지
├── settlement.html        # 정산 페이지
├── admin.html            # 관리자 페이지
├── styles/               # CSS 파일
├── js/                   # JavaScript 파일
│   ├── supabase.js      # Supabase 클라이언트
│   ├── api-supabase.js  # API 통신 모듈
│   └── ...              # 기타 JS 파일
├── images/              # 이미지 파일
├── database/            # 데이터베이스 스키마
└── config.js           # 설정 파일 (생성 필요)
```

## 🔐 보안 주의사항

1. `config.js` 파일은 절대 Git에 커밋하지 마세요
2. Supabase RLS (Row Level Security) 정책이 적용되어 있습니다
3. 프로덕션에서는 환경 변수 사용을 권장합니다

## 🛠️ 문제 해결

### CORS 오류
- Supabase 대시보드에서 Authentication > URL Configuration 확인
- Site URL에 배포된 도메인 추가

### 데이터베이스 연결 실패
- Supabase 프로젝트가 활성화되어 있는지 확인
- API 키가 올바른지 확인
- 네트워크 연결 상태 확인

## 📞 지원

문제가 있으시면 이슈를 생성하거나 다음으로 연락주세요:
- GitHub Issues: [https://github.com/kang9037/oppood_seat/issues](https://github.com/kang9037/oppood_seat/issues)