// 공통 JavaScript 기능

// Supabase 설정
const SUPABASE_URL = 'https://syhgibrayncezgljxdzs.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN5aGdpYnJheW5jZXpnbGp4ZHpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM3Nzk0NTMsImV4cCI6MjA2OTM1NTQ1M30.PdzNh6stgZwobuSAGSK_z6Hn98-VsaU44ldTWrM6szk'

// Supabase 초기화
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY)

// DOM이 로드되면 실행
document.addEventListener('DOMContentLoaded', function() {
    // 현재 페이지에 따라 네비게이션 활성화 상태 설정
    setActiveNavigation();
    
    // 모바일 메뉴 토글 기능
    setupMobileMenu();
    
    // Supabase 연결 테스트 - posts 데이터 로드
    if (document.getElementById('posts-container')) {
        loadPosts();
    }
});

// Supabase에서 posts 데이터 가져오기
async function loadPosts() {
    try {
        const { data, error } = await supabase
            .from('posts')  // 테이블 이름
            .select('*')
            .order('created_at', { ascending: false })
        
        if (error) {
            console.error('Supabase 에러:', error)
            const container = document.getElementById('posts-container')
            container.innerHTML = '<p style="color: red;">데이터를 불러오는 중 오류가 발생했습니다.</p>'
            return
        }
        
        // 화면에 표시
        const container = document.getElementById('posts-container')
        if (data && data.length > 0) {
            container.innerHTML = data.map(post => `
                <div class="feature-card" style="margin-bottom: 20px;">
                    <h3>${post.title || '제목 없음'}</h3>
                    <p>${post.content || '내용 없음'}</p>
                    <small style="color: #666;">작성일: ${new Date(post.created_at).toLocaleDateString('ko-KR')}</small>
                </div>
            `).join('')
        } else {
            container.innerHTML = '<p>아직 게시글이 없습니다.</p>'
        }
        
        console.log('Supabase 연결 성공! 데이터 개수:', data ? data.length : 0)
    } catch (err) {
        console.error('에러 발생:', err)
        const container = document.getElementById('posts-container')
        container.innerHTML = '<p style="color: red;">연결 중 오류가 발생했습니다.</p>'
    }
}

// 현재 페이지에 맞는 네비게이션 링크 활성화
function setActiveNavigation() {
    const currentPath = window.location.pathname;
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        const href = link.getAttribute('href');
        
        if (currentPath.endsWith(href) || 
            (currentPath.endsWith('/') && href === 'index.html')) {
            link.classList.add('active');
        }
    });
}

// 모바일 메뉴 설정
function setupMobileMenu() {
    // 모바일 메뉴 버튼 생성
    const header = document.querySelector('.header .container');
    const nav = document.querySelector('.header-nav');
    
    if (window.innerWidth <= 480 && header && nav) {
        // 햄버거 메뉴 버튼 추가
        const menuButton = document.createElement('button');
        menuButton.className = 'mobile-menu-toggle';
        menuButton.innerHTML = '☰';
        menuButton.setAttribute('aria-label', '메뉴 토글');
        
        header.insertBefore(menuButton, nav);
        
        // 메뉴 토글 이벤트
        menuButton.addEventListener('click', function() {
            nav.classList.toggle('active');
            menuButton.innerHTML = nav.classList.contains('active') ? '✕' : '☰';
        });
    }
}

// 윈도우 리사이즈 시 모바일 메뉴 재설정
let resizeTimer;
window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
        // 기존 모바일 메뉴 버튼 제거
        const existingButton = document.querySelector('.mobile-menu-toggle');
        if (existingButton) {
            existingButton.remove();
        }
        
        // 모바일 메뉴 재설정
        if (window.innerWidth <= 480) {
            setupMobileMenu();
        } else {
            // 데스크톱으로 전환 시 네비게이션 표시
            const nav = document.querySelector('.header-nav');
            if (nav) {
                nav.classList.remove('active');
            }
        }
    }, 250);
});

// 부드러운 스크롤
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 날짜 포맷팅 헬퍼 함수
function formatDate(date) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(date).toLocaleDateString('ko-KR', options);
}

// 시간 포맷팅 헬퍼 함수
function formatTime(time) {
    return time;
}

// 가격 포맷팅 헬퍼 함수
function formatPrice(price) {
    return price.toLocaleString('ko-KR') + '원';
}