// 애플리케이션 설정 예제
// 이 파일을 config.js로 복사하여 실제 값을 입력하세요
window.SUPABASE_URL = 'YOUR_SUPABASE_PROJECT_URL';
window.SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';

// 개발/프로덕션 환경에 따라 설정을 다르게 할 수 있습니다
if (window.location.hostname === 'localhost') {
    // 개발 환경 설정
    console.log('Development environment');
} else {
    // 프로덕션 환경 설정
    console.log('Production environment');
}