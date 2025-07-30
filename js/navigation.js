// 네비게이션 관련 JavaScript

// 페이지 로드 시 관리자 메뉴 표시/숨김 처리 및 인증 상태 업데이트
document.addEventListener('DOMContentLoaded', function() {
    // header-loader.js가 없는 경우에만 실행
    if (!document.getElementById('header-placeholder')) {
        checkAndShowAdminMenu();
        updateAuthSection();
    }
    setupMobileMenu();
});

// 관리자 메뉴 표시 확인
function checkAndShowAdminMenu() {
    const user = getCurrentUser();
    const adminMenus = document.querySelectorAll('.admin-only');
    
    if (user && user.isAdmin) {
        // 관리자인 경우 좌석배치 메뉴 표시
        adminMenus.forEach(menu => {
            menu.style.display = 'inline-block';
        });
    } else {
        // 일반 사용자인 경우 좌석배치 메뉴 숨김
        adminMenus.forEach(menu => {
            menu.style.display = 'none';
        });
    }
}

// getCurrentUser 함수가 없는 경우를 위한 안전장치
if (typeof getCurrentUser === 'undefined') {
    function getCurrentUser() {
        const localUser = localStorage.getItem('currentUser');
        const sessionUser = sessionStorage.getItem('currentUser');
        
        if (localUser) {
            return JSON.parse(localUser);
        } else if (sessionUser) {
            return JSON.parse(sessionUser);
        }
        
        return null;
    }
}

// 헤더 인증 섹션 업데이트
function updateAuthSection() {
    const authSection = document.getElementById('authSection');
    if (!authSection) return;
    
    const user = getCurrentUser();
    
    if (user) {
        // 로그인된 상태
        const userInitial = user.name ? user.name.charAt(0).toUpperCase() : 'U';
        const roleText = user.isAdmin ? '관리자' : '일반회원';
        
        authSection.innerHTML = `
            <div class="user-info">
                <div class="user-avatar">${userInitial}</div>
                <div class="user-details">
                    <span class="user-name">${user.name || user.username}</span>
                    <span class="user-role">${roleText}</span>
                </div>
                <button class="logout-btn" onclick="handleLogout()">로그아웃</button>
            </div>
        `;
    } else {
        // 비로그인 상태
        authSection.innerHTML = `
            <a href="login.html" class="btn btn-login">로그인</a>
            <a href="register.html" class="btn btn-register">회원가입</a>
        `;
    }
}

// 로그아웃 처리
function handleLogout() {
    // 로컬 스토리지와 세션 스토리지 모두 클리어
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    
    // 로그인 페이지로 리다이렉트
    alert('로그아웃되었습니다.');
    window.location.href = 'login.html';
}

// 모바일 메뉴 설정
function setupMobileMenu() {
    // 모바일 메뉴 버튼 생성
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.className = 'mobile-menu-toggle';
    mobileMenuBtn.innerHTML = `
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    
    // 헤더 컨테이너에 모바일 메뉴 버튼 추가
    const headerContainer = document.querySelector('.header .container');
    if (headerContainer) {
        headerContainer.appendChild(mobileMenuBtn);
    }
    
    // 모바일 메뉴 토글 기능
    mobileMenuBtn.addEventListener('click', function() {
        const nav = document.querySelector('.header-nav');
        if (nav) {
            nav.classList.toggle('active');
            // 메뉴가 열릴 때 스크롤 방지
            if (nav.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    });
    
    // 네비게이션 클릭 시 메뉴 닫기
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const nav = document.querySelector('.header-nav');
            if (nav && nav.classList.contains('active')) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // 배경 클릭 시 메뉴 닫기
    const nav = document.querySelector('.header-nav');
    if (nav) {
        nav.addEventListener('click', function(e) {
            if (e.target === nav) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    }
    
    // 윈도우 리사이즈 시 메뉴 상태 초기화
    window.addEventListener('resize', function() {
        if (window.innerWidth > 480) {
            const nav = document.querySelector('.header-nav');
            if (nav) {
                nav.classList.remove('active');
                document.body.style.overflow = '';
            }
        }
    });
}