// 인증 관련 JavaScript

// 로그인 상태 확인
function checkAuth() {
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop();
    
    // 로그인이 필요없는 페이지들
    const publicPages = ['index.html', 'login.html', 'register.html', 'admin-login.html', ''];
    
    // 관리자 페이지
    const adminPages = ['admin.html'];
    
    if (!currentUser && !publicPages.includes(currentPage)) {
        // 로그인하지 않은 상태에서 보호된 페이지 접근 시
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return false;
    }
    
    if (currentUser) {
        // 관리자 페이지 접근 권한 확인
        if (adminPages.includes(currentPage) && !currentUser.isAdmin) {
            alert('관리자 권한이 필요합니다.');
            window.location.href = 'index.html';
            return false;
        }
    }
    
    return true;
}

// 로그인 폼 처리
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const rememberMe = document.getElementById('rememberMe').checked;
        
        // 기본 사용자 데이터 초기화 (최초 1회만)
        if (!localStorage.getItem('users')) {
            const defaultUsers = [
                {
                    id: 1,
                    username: 'admin',
                    password: '1111',
                    name: '관리자',
                    email: 'admin@oppood.com',
                    isAdmin: true,
                    company: 'OPPOOD',
                    position: '관리자'
                },
                {
                    id: 2,
                    username: 'user',
                    password: '1111',
                    name: '홍길동',
                    email: 'user@example.com',
                    isAdmin: false,
                    company: '부산테크',
                    position: '과장'
                }
            ];
            localStorage.setItem('users', JSON.stringify(defaultUsers));
        }
        
        // 사용자 목록에서 로그인 시도
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // 로그인 성공
            const currentUser = {
                id: user.id,
                username: user.username,
                name: user.name,
                email: user.email,
                isAdmin: user.isAdmin,
                company: user.company,
                position: user.position
            };
            
            if (rememberMe) {
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
            } else {
                sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
            }
            
            if (user.isAdmin) {
                alert('관리자로 로그인했습니다.');
            } else {
                alert('로그인 성공!');
            }
            
            // 이전 페이지가 있으면 그곳으로, 없으면 홈으로
            const referrer = document.referrer;
            if (referrer && !referrer.includes('login.html') && !referrer.includes('register.html')) {
                window.location.href = referrer;
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('아이디 또는 비밀번호가 올바르지 않습니다.');
        }
    });
}

// 회원가입 폼 처리
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const company = document.getElementById('company').value;
        const position = document.getElementById('position').value;
        
        // 아이디 유효성 검사
        const usernameRegex = /^[a-zA-Z0-9]{4,20}$/;
        if (!usernameRegex.test(username)) {
            alert('아이디는 영문, 숫자 조합 4-20자여야 합니다.');
            return;
        }
        
        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (password.length < 8) {
            alert('비밀번호는 8자 이상이어야 합니다.');
            return;
        }
        
        // 기존 사용자 목록 가져오기 (실제로는 서버에서 처리)
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        
        // 아이디 중복 검사
        if (users.find(u => u.username === username)) {
            alert('이미 사용 중인 아이디입니다.');
            return;
        }
        
        // 새 사용자 추가
        const newUser = {
            id: Date.now(),
            username: username,
            password: password, // 실제로는 암호화해야 함
            name: name,
            email: email,
            isAdmin: false,
            company: company,
            position: position,
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        alert('회원가입이 완댈되었습니다. 로그인해주세요.');
        window.location.href = 'login.html';
    });
}

// 로그아웃
function logout() {
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    alert('로그아웃되었습니다.');
    window.location.href = 'login.html';
}

// 현재 사용자 정보 가져오기
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

// 원데이클래스 신청 시 로그인 체크 및 신청 정보 저장
function applyForDetailClass() {
    const user = getCurrentUser();
    
    if (!user) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    if (window.currentDetailClassId) {
        // 신청 정보를 localStorage에 저장 (실제로는 서버에 저장)
        const applications = JSON.parse(localStorage.getItem('classApplications') || '[]');
        
        const application = {
            id: Date.now(),
            userId: user.id,
            userName: user.name,
            userEmail: user.email,
            userCompany: user.company,
            classId: window.currentDetailClassId,
            className: document.getElementById('detail-modal-title').textContent,
            appliedAt: new Date().toISOString(),
            status: 'pending'
        };
        
        applications.push(application);
        localStorage.setItem('classApplications', JSON.stringify(applications));
        
        alert('클래스 신청이 완료되었습니다!\n관리자 승인 후 안내 메일이 발송됩니다.');
        closeClassDetailModal();
    }
}

// 페이지 로드 시 인증 체크
document.addEventListener('DOMContentLoaded', function() {
    // navigation.js의 초기화 후 실행되도록 약간의 지연 추가
    setTimeout(function() {
        checkAuth();
    }, 10);
});