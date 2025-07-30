// 헤더 로드 및 활성 페이지 표시
document.addEventListener('DOMContentLoaded', async function() {
    // 헤더 플레이스홀더 찾기
    const headerPlaceholder = document.getElementById('header-placeholder');
    
    if (headerPlaceholder) {
        try {
            // 헤더 HTML 로드
            const response = await fetch('includes/header.html');
            const headerHtml = await response.text();
            
            // 헤더 삽입
            headerPlaceholder.innerHTML = headerHtml;
            
            // 현재 페이지에 따라 active 클래스 추가
            const currentPage = window.location.pathname.split('/').pop() || 'index.html';
            const navLinks = document.querySelectorAll('.nav-link');
            
            navLinks.forEach(link => {
                const href = link.getAttribute('href');
                
                // 현재 페이지와 매칭되는 링크에 active 클래스 추가
                if (href === currentPage) {
                    link.classList.add('active');
                } else if (currentPage === 'index.html' && href === 'index.html') {
                    link.classList.add('active');
                } else if ((currentPage === 'settlement.html' || currentPage === 'settlement-list.html') && href === 'settlement.html') {
                    // 정산 관련 페이지들에서 정산 메뉴 활성화
                    link.classList.add('active');
                }
            });
            
            // 로그인 상태 확인 및 UI 업데이트
            initializeNavigation();
            
            // 모바일 메뉴 토글 초기화
            const mobileToggle = document.querySelector('.mobile-menu-toggle');
            if (mobileToggle) {
                console.log('Mobile menu toggle found and initialized');
            }
            
        } catch (error) {
            console.error('헤더 로드 실패:', error);
            // 폴백: 기본 헤더 구조 표시
            headerPlaceholder.innerHTML = `
                <header class="header">
                    <div class="container">
                        <h1 class="header-title"><a href="about.html" style="text-decoration: none; color: inherit;">OPPOOD</a></h1>
                        <nav class="header-nav">
                            <a href="about.html" class="nav-link">소개</a>
                            <a href="oneday-class.html" class="nav-link">원데이클래스</a>
                            <a href="meeting.html" class="nav-link">번개모임</a>
                            <a href="community.html" class="nav-link">커뮤니티</a>
                        </nav>
                        <div class="header-auth">
                            <div class="auth-section" id="authSection">
                                <a href="login.html" class="btn btn-login">로그인</a>
                                <a href="register.html" class="btn btn-register">회원가입</a>
                            </div>
                        </div>
                        <!-- 모바일 메뉴 토글 -->
                        <button class="mobile-menu-toggle" onclick="toggleMobileMenu()" aria-label="메뉴">
                            <div class="menu-icon">
                                <span></span>
                                <span></span>
                                <span></span>
                            </div>
                        </button>
                    </div>
                </header>
            `;
        }
    }
});

// 로그인 상태 확인 및 UI 업데이트 함수
function initializeNavigation() {
    // localStorage와 sessionStorage 모두 확인
    const localUser = localStorage.getItem('currentUser');
    const sessionUser = sessionStorage.getItem('currentUser');
    
    console.log('Local User:', localUser);
    console.log('Session User:', sessionUser);
    
    let user = null;
    if (localUser) {
        try {
            user = JSON.parse(localUser);
        } catch (e) {
            console.error('Local user parse error:', e);
        }
    } else if (sessionUser) {
        try {
            user = JSON.parse(sessionUser);
        } catch (e) {
            console.error('Session user parse error:', e);
        }
    }
    
    console.log('Parsed User:', user);
    
    const authSection = document.getElementById('authSection');
    
    if (user && (user.email || user.username) && authSection) {
        // 로그인된 상태의 UI로 변경
        const userInitial = (user.name || user.username || user.email).charAt(0).toUpperCase();
        authSection.innerHTML = `
            <div class="user-dropdown">
                <button class="user-dropdown-toggle" onclick="toggleUserDropdown(event)">
                    <div class="user-avatar-small">${userInitial}</div>
                    <span class="user-name">${user.name || user.username || user.email}</span>
                    <svg class="dropdown-arrow" width="12" height="12" viewBox="0 0 12 12">
                        <path d="M3 5L6 8L9 5" stroke="currentColor" stroke-width="1.5" fill="none"/>
                    </svg>
                </button>
                <div class="user-dropdown-menu" id="userDropdownMenu">
                    <div class="dropdown-header">
                        <div class="user-avatar-large">${userInitial}</div>
                        <div class="user-details">
                            <div class="user-name-full">${user.name || user.username || user.email}</div>
                            <div class="user-email">${user.email || ''}</div>
                            <div class="user-role">${user.role === 'admin' || user.isAdmin ? '관리자' : '일반회원'}</div>
                        </div>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="profile.html" class="dropdown-item">
                        <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M8 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM12.735 14c.618 0 1.093-.561.872-1.139a6.002 6.002 0 0 0-11.215 0c-.22.578.254 1.139.872 1.139h9.47z" fill="currentColor"/>
                        </svg>
                        프로필 관리
                    </a>
                    ${user.role === 'admin' || user.isAdmin ? `
                    <a href="admin.html" class="dropdown-item">
                        <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 1 0 0-6 3 3 0 0 0 0 6z" fill="currentColor"/>
                            <path d="M13.5 5a.5.5 0 0 1 .5.5V7h1.5a.5.5 0 0 1 0 1H14v1.5a.5.5 0 0 1-1 0V8h-1.5a.5.5 0 0 1 0-1H13V5.5a.5.5 0 0 1 .5-.5z" fill="currentColor"/>
                        </svg>
                        관리자 페이지
                    </a>
                    ` : ''}
                    <div class="dropdown-divider"></div>
                    <button class="dropdown-item logout-item" onclick="logout()">
                        <svg class="dropdown-icon" width="16" height="16" viewBox="0 0 16 16">
                            <path d="M6 2a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1H6zM3 3a3 3 0 0 1 3-3h4a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V3z" fill="currentColor"/>
                            <path d="M8 11a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor"/>
                        </svg>
                        로그아웃
                    </button>
                </div>
            </div>
        `;
        
        // 관리자인 경우 좌석배치 메뉴 표시 (role이 'admin'이거나 isAdmin이 true인 경우)
        if (user.role === 'admin' || user.isAdmin === true) {
            const adminLinks = document.querySelectorAll('.admin-only');
            adminLinks.forEach(link => {
                link.style.display = 'inline-block';
            });
        }
        
    } else if (authSection) {
        // 비로그인 상태
        authSection.innerHTML = `
            <a href="login.html" class="btn btn-login">로그인</a>
            <a href="register.html" class="btn btn-register">회원가입</a>
        `;
    }
}

// 로그아웃 함수
window.logout = function() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    alert('로그아웃되었습니다.');
    window.location.href = 'about.html';
};

// 사용자 드롭다운 토글 함수
window.toggleUserDropdown = function(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdownMenu');
    const isOpen = dropdown.classList.contains('show');
    
    // 모든 드롭다운 닫기
    closeAllDropdowns();
    
    // 현재 드롭다운 토글
    if (!isOpen) {
        dropdown.classList.add('show');
        // 화살표 회전
        const arrow = event.currentTarget.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
        }
    }
};

// 모든 드롭다운 닫기
function closeAllDropdowns() {
    const dropdowns = document.querySelectorAll('.user-dropdown-menu, .nav-dropdown-menu');
    dropdowns.forEach(dropdown => {
        dropdown.classList.remove('show');
    });
    
    // 모든 화살표 원위치
    const arrows = document.querySelectorAll('.dropdown-arrow');
    arrows.forEach(arrow => {
        arrow.style.transform = 'rotate(0deg)';
    });
}

// 클릭 외부 영역 감지
document.addEventListener('click', function(event) {
    if (!event.target.closest('.user-dropdown') && !event.target.closest('.nav-dropdown')) {
        closeAllDropdowns();
    }
});

// ESC 키로 드롭다운 닫기
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeAllDropdowns();
    }
});

// 관리자 드롭다운 토글 함수
window.toggleAdminMenu = function(event) {
    event.stopPropagation();
    event.preventDefault();
    const dropdown = document.getElementById('adminDropdownMenu');
    const isOpen = dropdown.classList.contains('show');
    
    // 모든 드롭다운 닫기
    closeAllDropdowns();
    
    // 현재 드롭다운 토글
    if (!isOpen) {
        dropdown.classList.add('show');
        // 화살표 회전
        const arrow = event.currentTarget.querySelector('.dropdown-arrow');
        if (arrow) {
            arrow.style.transform = 'rotate(180deg)';
        }
    }
};

// 모바일 메뉴 토글 함수
window.toggleMobileMenu = function() {
    console.log('toggleMobileMenu called');
    const nav = document.querySelector('.header-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    console.log('nav element:', nav);
    console.log('toggle element:', toggle);
    
    if (!nav) {
        console.error('Navigation element not found');
        return;
    }
    
    if (nav.classList.contains('active')) {
        nav.classList.remove('active');
        if (toggle) toggle.classList.remove('active');
        body.classList.remove('menu-open');
        body.style.overflow = '';
        console.log('Menu closed');
    } else {
        nav.classList.add('active');
        if (toggle) toggle.classList.add('active');
        body.classList.add('menu-open');
        body.style.overflow = 'hidden';
        console.log('Menu opened');
    }
};

// 모바일 메뉴 외부 클릭 시 닫기
document.addEventListener('click', function(event) {
    const nav = document.querySelector('.header-nav');
    const toggle = document.querySelector('.mobile-menu-toggle');
    const body = document.body;
    
    if (nav && nav.classList.contains('active')) {
        if (!event.target.closest('.header-nav') && !event.target.closest('.mobile-menu-toggle')) {
            nav.classList.remove('active');
            toggle.classList.remove('active');
            body.classList.remove('menu-open');
            body.style.overflow = '';
        }
    }
});