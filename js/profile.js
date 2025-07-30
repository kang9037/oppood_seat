// 프로필 페이지 JavaScript

// 프로필 폼 처리
document.getElementById('profileForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmNewPassword = document.getElementById('confirmNewPassword').value;
    
    // 비밀번호 변경 검증
    if (currentPassword || newPassword || confirmNewPassword) {
        if (!currentPassword) {
            alert('현재 비밀번호를 입력해주세요.');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            alert('새 비밀번호가 일치하지 않습니다.');
            return;
        }
        
        if (newPassword.length < 8) {
            alert('새 비밀번호는 8자 이상이어야 합니다.');
            return;
        }
    }
    
    // 저장 처리 (실제로는 서버에 요청)
    alert('프로필이 성공적으로 업데이트되었습니다.');
});

// 회원 탈퇴 확인
function confirmDeleteAccount() {
    const confirmed = confirm('정말로 회원 탈퇴하시겠습니까?\n이 작업은 되돌릴 수 없습니다.');
    
    if (confirmed) {
        const doubleConfirmed = confirm('모든 데이터가 삭제됩니다. 계속하시겠습니까?');
        
        if (doubleConfirmed) {
            // 실제로는 서버에 탈퇴 요청
            alert('회원 탈퇴가 완료되었습니다.');
            logout();
        }
    }
}

// 페이지 로드 시 현재 사용자 정보 불러오기
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    
    if (user) {
        // 폼에 사용자 정보 채우기
        document.getElementById('name').value = user.name || '';
        document.getElementById('email').value = user.email || '';
        document.getElementById('company').value = user.company || '';
        document.getElementById('position').value = user.position || '';
        
        // 실제로는 서버에서 추가 정보를 가져와야 함
    }
});