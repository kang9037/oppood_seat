// 관리자 페이지 JavaScript

// 섹션 표시/숨김
function showSection(sectionId) {
    // 모든 섹션 숨기기
    const sections = document.querySelectorAll('.admin-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // 모든 네비게이션 링크 비활성화
    const navLinks = document.querySelectorAll('.admin-nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // 선택한 섹션 표시
    document.getElementById(sectionId).classList.add('active');
    
    // 해당 네비게이션 링크 활성화
    document.querySelector(`[href="#${sectionId}"]`).classList.add('active');
    
    // 신청 목록 불러오기 (신청 관리 섹션인 경우)
    if (sectionId === 'applications') {
        loadApplications();
    } else if (sectionId === 'community') {
        loadCommunityPosts();
    }
}

// 신청 목록 불러오기
function loadApplications() {
    const applications = JSON.parse(localStorage.getItem('classApplications') || '[]');
    const tbody = document.getElementById('applicationsTableBody');
    
    if (applications.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px;">신청 내역이 없습니다.</td></tr>';
        return;
    }
    
    let html = '';
    applications.forEach(app => {
        const date = new Date(app.appliedAt);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        let statusBadge = '';
        let actions = '';
        
        if (app.status === 'pending') {
            statusBadge = '<span class="status-badge status-pending">대기중</span>';
            actions = `
                <button class="btn-action btn-approve" onclick="approveApplication(${app.id})">승인</button>
                <button class="btn-action btn-reject" onclick="rejectApplication(${app.id})">거절</button>
            `;
        } else if (app.status === 'approved') {
            statusBadge = '<span class="status-badge status-approved">승인됨</span>';
            actions = `<button class="btn-action btn-view" onclick="viewDetails(${app.id})">상세보기</button>`;
        } else if (app.status === 'rejected') {
            statusBadge = '<span class="status-badge status-rejected">거절됨</span>';
            actions = `<button class="btn-action btn-view" onclick="viewDetails(${app.id})">상세보기</button>`;
        }
        
        html += `
            <tr>
                <td>${dateStr}</td>
                <td>
                    <div class="user-info">
                        <span class="user-name">${app.userName}</span>
                        <span class="user-email">${app.userEmail}</span>
                    </div>
                </td>
                <td><span class="badge badge-class">클래스</span></td>
                <td>${app.className}</td>
                <td>${app.userCompany}</td>
                <td>${statusBadge}</td>
                <td>${actions}</td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 신청 승인
function approveApplication(id) {
    const applications = JSON.parse(localStorage.getItem('classApplications') || '[]');
    const appIndex = applications.findIndex(app => app.id === id);
    
    if (appIndex !== -1) {
        applications[appIndex].status = 'approved';
        localStorage.setItem('classApplications', JSON.stringify(applications));
        alert('신청이 승인되었습니다.');
        loadApplications();
    }
}

// 신청 거절
function rejectApplication(id) {
    const reason = prompt('거절 사유를 입력해주세요:');
    if (!reason) return;
    
    const applications = JSON.parse(localStorage.getItem('classApplications') || '[]');
    const appIndex = applications.findIndex(app => app.id === id);
    
    if (appIndex !== -1) {
        applications[appIndex].status = 'rejected';
        applications[appIndex].rejectReason = reason;
        localStorage.setItem('classApplications', JSON.stringify(applications));
        alert('신청이 거절되었습니다.');
        loadApplications();
    }
}

// 상세보기
function viewDetails(id) {
    const applications = JSON.parse(localStorage.getItem('classApplications') || '[]');
    const app = applications.find(a => a.id === id);
    
    if (app) {
        let details = `
신청자: ${app.userName}
이메일: ${app.userEmail}
회사: ${app.userCompany}
클래스: ${app.className}
신청일시: ${new Date(app.appliedAt).toLocaleString()}
상태: ${app.status === 'approved' ? '승인됨' : app.status === 'rejected' ? '거절됨' : '대기중'}
        `;
        
        if (app.rejectReason) {
            details += `\n거절 사유: ${app.rejectReason}`;
        }
        
        alert(details);
    }
}

// 필터링 함수들
function filterApplications(type) {
    console.log('Filtering by type:', type);
    // 실제 구현 시 필터링 로직 추가
}

function filterByStatus(status) {
    console.log('Filtering by status:', status);
    // 실제 구현 시 필터링 로직 추가
}

function filterByDate(date) {
    console.log('Filtering by date:', date);
    // 실제 구현 시 필터링 로직 추가
}

// 모임/클래스 관리 함수들
function createNewMeeting() {
    alert('새 모임 등록 기능은 준비 중입니다.');
}

function editMeeting(id) {
    alert('모임 수정 기능은 준비 중입니다.');
}

function deleteMeeting(id) {
    if (confirm('정말로 이 모임을 삭제하시겠습니까?')) {
        alert('모임이 삭제되었습니다.');
    }
}

function createNewClass() {
    alert('새 클래스 등록 기능은 준비 중입니다.');
}

function editClass(id) {
    alert('클래스 수정 기능은 준비 중입니다.');
}

function viewClassApplications(id) {
    alert('클래스 신청자 목록 기능은 준비 중입니다.');
}

function viewMemberDetail(id) {
    alert('회원 상세 정보 기능은 준비 중입니다.');
}

// 커뮤니티 관리 함수들
let communityPosts = [];
let filteredPosts = [];

// 커뮤니티 게시글 불러오기
function loadCommunityPosts() {
    const posts = JSON.parse(localStorage.getItem('communityPosts') || '[]');
    communityPosts = posts;
    filteredPosts = posts;
    
    // 통계 업데이트
    updateCommunityStats();
    
    // 테이블 렌더링
    renderCommunityTable();
}

// 커뮤니티 통계 업데이트
function updateCommunityStats() {
    const totalPosts = communityPosts.length;
    const reportedPosts = communityPosts.filter(p => p.reports && p.reports.length > 0).length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayPosts = communityPosts.filter(p => {
        const postDate = new Date(p.timestamp);
        postDate.setHours(0, 0, 0, 0);
        return postDate.getTime() === today.getTime();
    }).length;
    
    document.getElementById('totalPosts').textContent = totalPosts;
    document.getElementById('reportedPosts').textContent = reportedPosts;
    document.getElementById('todayPosts').textContent = todayPosts;
}

// 커뮤니티 테이블 렌더링
function renderCommunityTable() {
    const tbody = document.getElementById('communityTableBody');
    
    if (filteredPosts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" style="text-align: center; padding: 40px;">게시글이 없습니다.</td></tr>';
        return;
    }
    
    let html = '';
    filteredPosts.forEach(post => {
        const date = new Date(post.timestamp);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
        
        const reportCount = post.reports ? post.reports.length : 0;
        const reportBadge = reportCount > 0 ? 
            `<span class="status-badge status-warning">${reportCount}건</span>` : 
            '<span class="status-badge">0건</span>';
        
        // 내용 미리보기 (최대 50자)
        const contentPreview = post.content.length > 50 ? 
            post.content.substring(0, 50) + '...' : 
            post.content;
        
        html += `
            <tr>
                <td>${dateStr}</td>
                <td>${post.realAuthor || post.author}</td>
                <td>${post.author}</td>
                <td>${escapeHtml(contentPreview)}</td>
                <td>${post.likes || 0}</td>
                <td>${post.comments ? post.comments.length : 0}</td>
                <td>${reportBadge}</td>
                <td>
                    <button class="btn-action btn-view" onclick="viewCommunityPost(${post.id})">상세</button>
                    <button class="btn-action btn-edit" onclick="editCommunityPost(${post.id})">수정</button>
                    <button class="btn-action btn-delete" onclick="deleteCommunityPost(${post.id})">삭제</button>
                </td>
            </tr>
        `;
    });
    
    tbody.innerHTML = html;
}

// 커뮤니티 게시글 필터링
function filterCommunityPosts(filter) {
    switch(filter) {
        case 'reported':
            filteredPosts = communityPosts.filter(p => p.reports && p.reports.length > 0);
            break;
        case 'anonymous':
            filteredPosts = communityPosts.filter(p => p.isAnonymous);
            break;
        default:
            filteredPosts = communityPosts;
    }
    renderCommunityTable();
}

// 커뮤니티 게시글 검색
function searchCommunityPosts(keyword) {
    if (!keyword.trim()) {
        filteredPosts = communityPosts;
    } else {
        filteredPosts = communityPosts.filter(p => 
            p.content.includes(keyword) || 
            p.author.includes(keyword) || 
            (p.realAuthor && p.realAuthor.includes(keyword))
        );
    }
    renderCommunityTable();
}

// 커뮤니티 게시글 상세보기
function viewCommunityPost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;
    
    let details = `
작성자: ${post.realAuthor || post.author}
표시 이름: ${post.author}
익명 여부: ${post.isAnonymous ? '예' : '아니오'}
작성일시: ${new Date(post.timestamp).toLocaleString()}
좋아요: ${post.likes || 0}개
댓글수: ${post.comments ? post.comments.length : 0}개

내용:
${post.content}
`;
    
    if (post.reports && post.reports.length > 0) {
        details += `\n\n신고 내역 (${post.reports.length}건):\n`;
        post.reports.forEach((report, index) => {
            details += `${index + 1}. ${report.userName}: ${report.reason} (${new Date(report.timestamp).toLocaleString()})\n`;
        });
    }
    
    alert(details);
}

// 커뮤니티 게시글 수정
function editCommunityPost(postId) {
    const post = communityPosts.find(p => p.id === postId);
    if (!post) return;
    
    const newContent = prompt('수정할 내용을 입력하세요:', post.content);
    if (newContent && newContent.trim()) {
        post.content = newContent.trim();
        post.isEdited = true;
        post.editedAt = new Date().toISOString();
        post.editedBy = 'admin';
        
        localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
        loadCommunityPosts();
        alert('게시글이 수정되었습니다.');
    }
}

// 커뮤니티 게시글 삭제
function deleteCommunityPost(postId) {
    if (!confirm('정말로 이 게시글을 삭제하시겠습니까?')) return;
    
    communityPosts = communityPosts.filter(p => p.id !== postId);
    localStorage.setItem('communityPosts', JSON.stringify(communityPosts));
    loadCommunityPosts();
    alert('게시글이 삭제되었습니다.');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 관리자 권한 확인
    const user = getCurrentUser();
    if (!user || !user.isAdmin) {
        alert('관리자 권한이 필요합니다.');
        window.location.href = 'index.html';
        return;
    }
    
    // 신청 목록 불러오기
    loadApplications();
});