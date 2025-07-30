// 회원가입 페이지 JavaScript

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 회원 유형 변경 감지
    const memberTypeRadios = document.querySelectorAll('input[name="memberType"]');
    memberTypeRadios.forEach(radio => {
        radio.addEventListener('change', handleMemberTypeChange);
    });

    // 폼 제출 이벤트
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', handleSignup);

    // 실시간 유효성 검사
    setupValidation();
});

// 회원 유형 변경 처리
function handleMemberTypeChange(e) {
    const instructorSection = document.getElementById('instructorSection');
    const isInstructor = e.target.value === 'instructor';
    
    // 강사 섹션 표시/숨김
    instructorSection.style.display = isInstructor ? 'block' : 'none';
    
    // 강사 필드 필수값 설정
    const instructorFields = instructorSection.querySelectorAll('input, textarea');
    instructorFields.forEach(field => {
        field.required = isInstructor;
    });
}

// 아이디 중복 확인
let isIdChecked = false;
let isIdAvailable = false;

async function checkIdDuplicate() {
    const userId = document.getElementById('userId').value;
    const errorElement = document.getElementById('userIdError');
    const successElement = document.getElementById('userIdSuccess');
    
    // 유효성 검사
    if (!userId || userId.length < 4) {
        errorElement.textContent = '아이디는 4자 이상이어야 합니다.';
        successElement.textContent = '';
        return;
    }
    
    if (!/^[a-zA-Z0-9]+$/.test(userId)) {
        errorElement.textContent = '아이디는 영문과 숫자만 사용 가능합니다.';
        successElement.textContent = '';
        return;
    }
    
    try {
        // 실제로는 서버에 중복 확인 요청
        // 여기서는 시뮬레이션
        const existingIds = ['admin', 'user123', 'test', 'oppood'];
        
        if (existingIds.includes(userId.toLowerCase())) {
            errorElement.textContent = '이미 사용 중인 아이디입니다.';
            successElement.textContent = '';
            isIdAvailable = false;
        } else {
            errorElement.textContent = '';
            successElement.textContent = '사용 가능한 아이디입니다.';
            isIdAvailable = true;
        }
        
        isIdChecked = true;
    } catch (error) {
        errorElement.textContent = '중복 확인 중 오류가 발생했습니다.';
        successElement.textContent = '';
    }
}

// 실시간 유효성 검사 설정
function setupValidation() {
    // 아이디 입력 시 중복 확인 리셋
    document.getElementById('userId').addEventListener('input', function() {
        isIdChecked = false;
        document.getElementById('userIdError').textContent = '';
        document.getElementById('userIdSuccess').textContent = '';
    });
    
    // 비밀번호 유효성 검사
    document.getElementById('password').addEventListener('input', validatePassword);
    
    // 비밀번호 확인
    document.getElementById('passwordConfirm').addEventListener('input', validatePasswordConfirm);
    
    // 이메일 유효성 검사
    document.getElementById('email').addEventListener('input', validateEmail);
    
    // 전화번호 자동 포맷
    document.getElementById('phone').addEventListener('input', formatPhoneNumber);
}

// 비밀번호 유효성 검사
function validatePassword() {
    const password = document.getElementById('password').value;
    const errorElement = document.getElementById('passwordError');
    
    if (password.length < 8) {
        errorElement.textContent = '비밀번호는 8자 이상이어야 합니다.';
        return false;
    }
    
    if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(password)) {
        errorElement.textContent = '비밀번호는 영문과 숫자를 포함해야 합니다.';
        return false;
    }
    
    errorElement.textContent = '';
    validatePasswordConfirm(); // 비밀번호 확인도 재검증
    return true;
}

// 비밀번호 확인 검사
function validatePasswordConfirm() {
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;
    const errorElement = document.getElementById('passwordConfirmError');
    
    if (passwordConfirm && password !== passwordConfirm) {
        errorElement.textContent = '비밀번호가 일치하지 않습니다.';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

// 이메일 유효성 검사
function validateEmail() {
    const email = document.getElementById('email').value;
    const errorElement = document.getElementById('emailError');
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (email && !emailRegex.test(email)) {
        errorElement.textContent = '올바른 이메일 형식이 아닙니다.';
        return false;
    }
    
    errorElement.textContent = '';
    return true;
}

// 전화번호 자동 포맷
function formatPhoneNumber(e) {
    let value = e.target.value.replace(/[^\d]/g, '');
    let formattedValue = '';
    
    if (value.length <= 3) {
        formattedValue = value;
    } else if (value.length <= 7) {
        formattedValue = value.slice(0, 3) + '-' + value.slice(3);
    } else {
        formattedValue = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11);
    }
    
    e.target.value = formattedValue;
}

// 전체 동의 토글
function toggleAllAgreements() {
    const agreeAll = document.getElementById('agreeAll').checked;
    const agreements = document.querySelectorAll('input[name="agreement"]');
    
    agreements.forEach(checkbox => {
        checkbox.checked = agreeAll;
    });
}

// 개별 약관 체크 시 전체 동의 업데이트
document.addEventListener('change', function(e) {
    if (e.target.name === 'agreement') {
        const agreements = document.querySelectorAll('input[name="agreement"]');
        const allChecked = Array.from(agreements).every(checkbox => checkbox.checked);
        document.getElementById('agreeAll').checked = allChecked;
    }
});

// 약관 보기
function showTerms(type) {
    const termsContent = {
        terms: '이용약관 내용...',
        privacy: '개인정보 처리방침 내용...'
    };
    
    alert(`[${type === 'terms' ? '이용약관' : '개인정보 처리방침'}]\n\n${termsContent[type]}`);
}

// 회원가입 처리
async function handleSignup(e) {
    e.preventDefault();
    
    // 아이디 중복 확인 여부
    if (!isIdChecked || !isIdAvailable) {
        alert('아이디 중복 확인을 해주세요.');
        document.getElementById('userId').focus();
        return;
    }
    
    // 비밀번호 유효성 검사
    if (!validatePassword() || !validatePasswordConfirm()) {
        return;
    }
    
    // 이메일 유효성 검사
    if (!validateEmail()) {
        return;
    }
    
    // 필수 약관 동의 확인
    const requiredAgreements = ['termsAgree', 'privacyAgree'];
    const allAgreed = requiredAgreements.every(id => 
        document.getElementById(id).checked
    );
    
    if (!allAgreed) {
        alert('필수 약관에 동의해주세요.');
        return;
    }
    
    // 폼 데이터 수집
    const formData = new FormData(e.target);
    const memberType = formData.get('memberType');
    
    const userData = {
        userId: formData.get('userId'),
        password: formData.get('password'),
        name: formData.get('name'),
        email: formData.get('email'),
        phone: formData.get('phone'),
        memberType: memberType,
        marketingAgree: document.getElementById('marketingAgree').checked,
        createdAt: new Date().toISOString()
    };
    
    // 강사회원인 경우 추가 정보
    if (memberType === 'instructor') {
        userData.instructorInfo = {
            instructorName: formData.get('instructorName') || formData.get('name'),
            expertise: formData.get('expertise'),
            introduction: formData.get('introduction'),
            approved: false // 관리자 승인 대기
        };
    }
    
    try {
        // 실제로는 서버에 회원가입 요청
        console.log('회원가입 데이터:', userData);
        
        // 로컬 스토리지에 임시 저장 (실제로는 서버 저장)
        const users = JSON.parse(localStorage.getItem('oppood_users') || '[]');
        users.push(userData);
        localStorage.setItem('oppood_users', JSON.stringify(users));
        
        // 성공 메시지
        if (memberType === 'instructor') {
            alert('강사회원 가입이 완료되었습니다.\n관리자 승인 후 클래스 개설이 가능합니다.');
        } else {
            alert('회원가입이 완료되었습니다.\n로그인 페이지로 이동합니다.');
        }
        
        // 로그인 페이지로 이동
        window.location.href = 'login.html';
        
    } catch (error) {
        console.error('회원가입 오류:', error);
        alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    }
}