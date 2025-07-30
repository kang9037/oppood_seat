// 전역 변수
let posts = [];
let currentPostId = null;
let currentUser = null;
let editingPostId = null;
let benefitPosts = [];
let currentSection = 'communication';
let selectedImages = [];
let attachedLinks = [];
let selectedBenefitImages = [];
let attachedBenefitLinks = [];

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 현재 로그인한 사용자 정보 가져오기
    const userStr = localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser');
    if (userStr) {
        try {
            currentUser = JSON.parse(userStr);
        } catch (e) {
            console.error('User parse error:', e);
        }
    }
    
    // UI 업데이트
    updateAuthUI();
    
    // 저장된 데이터 로드
    loadPosts();
    loadBenefitPosts();
    
    // 엔터키 이벤트
    document.getElementById('commentInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addComment();
        }
    });
    
    // 링크 입력 엔터키 이벤트
    const linkInput = document.getElementById('linkInput');
    if (linkInput) {
        linkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addLink();
            }
        });
    }
    
    // 텍스트 영역 자동 높이 조정
    const postContent = document.getElementById('postContent');
    if (postContent) {
        postContent.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    const benefitContent = document.getElementById('benefitContent');
    if (benefitContent) {
        benefitContent.addEventListener('input', function() {
            this.style.height = 'auto';
            this.style.height = this.scrollHeight + 'px';
        });
    }
    
    // 드래그 앤 드롭 이벤트 설정
    setupDragAndDrop();
    setupBenefitDragAndDrop();
    
    // 혜택 정보 링크 입력 엔터키 이벤트
    const benefitLinkInput = document.getElementById('benefitLinkInput');
    if (benefitLinkInput) {
        benefitLinkInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                addBenefitLink();
            }
        });
    }
});

// 로그인 상태에 따른 UI 업데이트
function updateAuthUI() {
    const postComposer = document.getElementById('postComposer');
    const loginPrompt = document.getElementById('loginPrompt');
    const benefitComposer = document.getElementById('benefitComposer');
    const benefitLoginPrompt = document.getElementById('benefitLoginPrompt');
    const authorInfo = document.getElementById('authorInfo');
    
    if (currentUser) {
        if (postComposer) postComposer.style.display = 'block';
        if (loginPrompt) loginPrompt.style.display = 'none';
        if (benefitComposer) benefitComposer.style.display = 'block';
        if (benefitLoginPrompt) benefitLoginPrompt.style.display = 'none';
        updateAuthorDisplay();
    } else {
        if (postComposer) postComposer.style.display = 'none';
        if (loginPrompt) loginPrompt.style.display = 'block';
        if (benefitComposer) benefitComposer.style.display = 'none';
        if (benefitLoginPrompt) benefitLoginPrompt.style.display = 'block';
    }
}

// 작성자 표시 업데이트
function updateAuthorDisplay() {
    const authorInfo = document.getElementById('authorInfo');
    const isAnonymous = document.getElementById('anonymousCheck').checked;
    
    if (isAnonymous) {
        authorInfo.innerHTML = `
            <div class="author-avatar">익</div>
            <span class="author-display-name">익명</span>
        `;
    } else {
        const userInitial = (currentUser.name || currentUser.username).charAt(0).toUpperCase();
        authorInfo.innerHTML = `
            <div class="author-avatar">${userInitial}</div>
            <span class="author-display-name">${currentUser.name || currentUser.username}</span>
        `;
    }
}

// 익명 토글
function toggleAnonymous() {
    updateAuthorDisplay();
}

// 게시글 작성
function createPost() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const content = document.getElementById('postContent').value.trim();
    if (!content && selectedImages.length === 0 && attachedLinks.length === 0) {
        alert('내용을 입력하거나 사진/링크를 첨부해주세요.');
        return;
    }
    
    const isAnonymous = document.getElementById('anonymousCheck').checked;
    
    const post = {
        id: Date.now(),
        userId: currentUser.username || currentUser.id,
        author: isAnonymous ? '익명' : (currentUser.name || currentUser.username),
        realAuthor: currentUser.name || currentUser.username, // 관리자를 위한 실제 작성자
        isAnonymous: isAnonymous,
        content: content,
        images: [...selectedImages],
        links: [...attachedLinks],
        timestamp: new Date().toISOString(),
        likes: 0,
        comments: [],
        likedBy: [],
        reports: [] // 신고 목록
    };
    
    if (editingPostId) {
        // 수정 모드
        const index = posts.findIndex(p => p.id === editingPostId);
        if (index !== -1) {
            posts[index].content = content;
            posts[index].images = [...selectedImages];
            posts[index].links = [...attachedLinks];
            posts[index].isEdited = true;
            posts[index].editedAt = new Date().toISOString();
        }
        editingPostId = null;
        document.querySelector('.post-tools .btn-primary').textContent = '게시';
    } else {
        // 새 게시글
        posts.unshift(post);
    }
    
    savePosts();
    renderPosts();
    
    // 입력 초기화
    document.getElementById('postContent').value = '';
    document.getElementById('postContent').style.height = 'auto';
    selectedImages = [];
    attachedLinks = [];
    document.getElementById('mediaPreview').innerHTML = '';
}

// 게시글 렌더링
function renderPosts() {
    const feedList = document.getElementById('feedList');
    feedList.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = createPostElement(post);
        feedList.appendChild(postElement);
    });
}

// 게시글 요소 생성
function createPostElement(post) {
    const postDiv = document.createElement('div');
    postDiv.className = 'post-item';
    
    const timeAgo = getTimeAgo(new Date(post.timestamp));
    const isLiked = post.likedBy.includes(currentUser?.username || currentUser?.id);
    const commentCount = post.comments.filter(c => !c.isSecret || c.authorId === (currentUser?.username || currentUser?.id) || post.userId === (currentUser?.username || currentUser?.id)).length;
    const isMyPost = currentUser && post.userId === (currentUser.username || currentUser.id);
    
    // 작성자 표시 결정
    let authorDisplay;
    let avatarText;
    if (post.isAnonymous) {
        authorDisplay = isMyPost ? `${post.author} (나)` : post.author;
        avatarText = '익';
    } else {
        authorDisplay = post.author;
        avatarText = post.author.charAt(0).toUpperCase();
    }
    
    let mediaHtml = '';
    
    // 이미지 표시
    if (post.images && post.images.length > 0) {
        const imageClass = post.images.length === 1 ? 'single' : '';
        mediaHtml += `<div class="post-images">`;
        post.images.forEach(image => {
            mediaHtml += `<img src="${image}" alt="" class="post-image ${imageClass}" onclick="viewImage('${image}')"/>`;
        });
        mediaHtml += `</div>`;
    }
    
    // 링크 표시
    if (post.links && post.links.length > 0) {
        post.links.forEach(link => {
            mediaHtml += `
                <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="post-link">
                    <div class="post-link-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                        </svg>
                    </div>
                    <div class="post-link-content">
                        <div class="post-link-title">${link.title || link.url}</div>
                        <div class="post-link-url">${new URL(link.url).hostname}</div>
                    </div>
                </a>
            `;
        });
    }
    
    postDiv.innerHTML = `
        <div class="post-header">
            <div class="post-author">
                <div class="anonymous-avatar">${avatarText}</div>
                <div>
                    <div class="author-name">${authorDisplay}</div>
                    <div class="post-time">${timeAgo}${post.isEdited ? ' (수정됨)' : ''}</div>
                </div>
            </div>
            ${isMyPost ? `
            <div class="post-menu">
                <button class="post-menu-btn" onclick="togglePostMenu(${post.id})">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <circle cx="12" cy="12" r="1"></circle>
                        <circle cx="12" cy="5" r="1"></circle>
                        <circle cx="12" cy="19" r="1"></circle>
                    </svg>
                </button>
                <div class="post-menu-dropdown" id="postMenu-${post.id}">
                    <button class="menu-item" onclick="editPost(${post.id})">수정</button>
                    <button class="menu-item delete" onclick="deletePost(${post.id})">삭제</button>
                </div>
            </div>
            ` : ''}
        </div>
        <div class="post-content">${escapeHtml(post.content)}</div>
        ${mediaHtml}
        <div class="post-actions">
            <button class="action-btn ${isLiked ? 'liked' : ''}" onclick="toggleLike(${post.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="${isLiked ? 'red' : 'none'}" stroke="currentColor">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                </svg>
                <span>${post.likes}</span>
            </button>
            <button class="action-btn" onclick="openCommentModal(${post.id})">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
                <span>${commentCount}</span>
            </button>
            <button class="action-btn" onclick="reportPost(${post.id})" title="신고">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"></path>
                    <path d="M12 22V12"></path>
                    <path d="M12 12H2"></path>
                </svg>
            </button>
        </div>
    `;
    
    return postDiv;
}

// 좋아요 토글
function toggleLike(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    const userId = currentUser?.username || currentUser?.id;
    const index = post.likedBy.indexOf(userId);
    if (index > -1) {
        post.likedBy.splice(index, 1);
        post.likes--;
    } else {
        post.likedBy.push(userId);
        post.likes++;
    }
    
    savePosts();
    renderPosts();
}

// 게시글 메뉴 토글
function togglePostMenu(postId) {
    const menu = document.getElementById(`postMenu-${postId}`);
    const allMenus = document.querySelectorAll('.post-menu-dropdown');
    
    // 다른 메뉴 닫기
    allMenus.forEach(m => {
        if (m.id !== `postMenu-${postId}`) {
            m.classList.remove('show');
        }
    });
    
    // 현재 메뉴 토글
    menu.classList.toggle('show');
}

// 게시글 수정
function editPost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !currentUser || post.userId !== (currentUser.username || currentUser.id)) {
        alert('수정 권한이 없습니다.');
        return;
    }
    
    // 수정 모드로 전환
    editingPostId = postId;
    document.getElementById('postContent').value = post.content;
    document.getElementById('postContent').focus();
    
    // 기존 이미지와 링크 복원
    selectedImages = post.images ? [...post.images] : [];
    attachedLinks = post.links ? [...post.links] : [];
    updateMediaPreview();
    
    document.querySelector('.post-tools .btn-primary').textContent = '수정';
    
    // 메뉴 닫기
    document.getElementById(`postMenu-${postId}`).classList.remove('show');
    
    // 스크롤을 작성 영역으로
    document.getElementById('postComposer').scrollIntoView({ behavior: 'smooth' });
}

// 게시글 삭제
function deletePost(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !currentUser || post.userId !== (currentUser.username || currentUser.id)) {
        alert('삭제 권한이 없습니다.');
        return;
    }
    
    if (confirm('정말로 삭제하시겠습니까?')) {
        posts = posts.filter(p => p.id !== postId);
        savePosts();
        renderPosts();
    }
    
    // 메뉴 닫기
    document.getElementById(`postMenu-${postId}`).classList.remove('show');
}

// 게시글 신고
function reportPost(postId) {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 이미 신고했는지 확인
    const userId = currentUser.username || currentUser.id;
    if (post.reports && post.reports.some(r => r.userId === userId)) {
        alert('이미 신고한 게시글입니다.');
        return;
    }
    
    const reason = prompt('신고 사유를 입력해주세요:');
    if (!reason || !reason.trim()) return;
    
    // reports 배열이 없으면 생성
    if (!post.reports) {
        post.reports = [];
    }
    
    const report = {
        id: Date.now(),
        userId: userId,
        userName: currentUser.name || currentUser.username,
        reason: reason.trim(),
        timestamp: new Date().toISOString()
    };
    
    post.reports.push(report);
    savePosts();
    
    alert('신고가 접수되었습니다. 관리자가 검토할 예정입니다.');
}

// 클릭 외부 영역 감지로 메뉴 닫기
document.addEventListener('click', function(event) {
    if (!event.target.closest('.post-menu')) {
        document.querySelectorAll('.post-menu-dropdown').forEach(menu => {
            menu.classList.remove('show');
        });
    }
});

// 모바일 터치 이벤트 최적화
let touchStartY = 0;
let touchEndY = 0;

// Pull to refresh 기능 (옵션)
if ('ontouchstart' in window) {
    document.addEventListener('touchstart', function(e) {
        touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });
    
    document.addEventListener('touchend', function(e) {
        touchEndY = e.changedTouches[0].screenY;
        handleSwipe();
    }, { passive: true });
}

function handleSwipe() {
    if (touchEndY > touchStartY + 100 && window.scrollY === 0) {
        // Pull to refresh
        location.reload();
    }
}

// 모달 열릴 때 배경 스크롤 비활성화
const originalOpenModal = window.openCommentModal;
window.openCommentModal = function(postId) {
    originalOpenModal(postId);
    document.body.style.overflow = 'hidden';
};

const originalCloseModal = window.closeCommentModal;
window.closeCommentModal = function() {
    originalCloseModal();
    document.body.style.overflow = '';
};

// 모바일에서 모달 외부 터치로 닫기
document.getElementById('commentModal').addEventListener('click', function(e) {
    if (e.target === this) {
        closeCommentModal();
    }
});

// 댓글 모달 열기
function openCommentModal(postId) {
    currentPostId = postId;
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    
    // 원본 게시글 표시
    const originalPost = document.getElementById('originalPost');
    originalPost.innerHTML = createPostElement(post).innerHTML;
    
    // 댓글 목록 표시
    renderComments(post);
    
    // 모달 열기
    document.getElementById('commentModal').style.display = 'block';
}

// 댓글 모달 닫기
function closeCommentModal() {
    document.getElementById('commentModal').style.display = 'none';
    document.getElementById('commentInput').value = '';
    document.getElementById('secretComment').checked = false;
    currentPostId = null;
}

// 댓글 추가
function addComment() {
    if (!currentPostId) return;
    
    if (!currentUser) {
        alert('댓글 작성은 로그인이 필요합니다.');
        return;
    }
    
    const content = document.getElementById('commentInput').value.trim();
    if (!content) {
        alert('댓글을 입력해주세요.');
        return;
    }
    
    const post = posts.find(p => p.id === currentPostId);
    if (!post) return;
    
    const comment = {
        id: Date.now(),
        authorId: currentUser.username || currentUser.id,
        author: currentUser.name || currentUser.username,
        content: content,
        timestamp: new Date().toISOString(),
        isSecret: document.getElementById('secretComment').checked
    };
    
    post.comments.push(comment);
    savePosts();
    renderComments(post);
    
    // 입력 초기화
    document.getElementById('commentInput').value = '';
    document.getElementById('secretComment').checked = false;
}

// 댓글 렌더링
function renderComments(post) {
    const commentList = document.getElementById('commentList');
    commentList.innerHTML = '';
    
    post.comments.forEach(comment => {
        // 비밀댓글은 작성자와 게시글 작성자만 볼 수 있음
        const currentUserId = currentUser?.username || currentUser?.id;
        if (comment.isSecret && comment.authorId !== currentUserId && post.userId !== currentUserId) {
            return;
        }
        
        const commentDiv = document.createElement('div');
        commentDiv.className = 'comment-item';
        
        const timeAgo = getTimeAgo(new Date(comment.timestamp));
        const isMyComment = currentUser && comment.authorId === (currentUser.username || currentUser.id);
        const isPostAuthor = comment.authorId === post.userId;
        
        let authorDisplay = comment.author;
        if (isMyComment) {
            authorDisplay += ' (나)';
        } else if (isPostAuthor) {
            authorDisplay += ' (작성자)';
        }
        
        commentDiv.innerHTML = `
            <div class="comment-header">
                <div class="comment-author">
                    <div class="anonymous-avatar small">${comment.author.charAt(0)}</div>
                    <span class="author-name">${authorDisplay}</span>
                    ${comment.isSecret ? '<span class="secret-badge">비밀</span>' : ''}
                </div>
                <span class="comment-time">${timeAgo}</span>
            </div>
            <div class="comment-content">${escapeHtml(comment.content)}</div>
        `;
        
        commentList.appendChild(commentDiv);
    });
}

// 시간 표시
function getTimeAgo(date) {
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days < 7) return `${days}일 전`;
    
    return date.toLocaleDateString('ko-KR');
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 데이터 저장/로드
function savePosts() {
    localStorage.setItem('communityPosts', JSON.stringify(posts));
}

function loadPosts() {
    const saved = localStorage.getItem('communityPosts');
    if (saved) {
        posts = JSON.parse(saved);
    } else {
        // 샘플 데이터
        posts = [
            {
                id: 1,
                userId: 'sample1',
                author: '익명',
                realAuthor: '샘플사용자1',
                isAnonymous: true,
                content: '오늘 날씨가 정말 좋네요! 다들 좋은 하루 보내세요 😊',
                images: [],
                links: [],
                timestamp: new Date(Date.now() - 3600000).toISOString(),
                likes: 5,
                likedBy: [],
                reports: [],
                comments: [
                    {
                        id: 1,
                        authorId: 'sample2',
                        author: '샘플사용자2',
                        content: '맞아요! 오늘 정말 좋아요',
                        timestamp: new Date(Date.now() - 1800000).toISOString(),
                        isSecret: false
                    }
                ]
            }
        ];
    }
    renderPosts();
}

// 사용자 에이전트 감지
function isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

// 모바일 최적화
if (isMobile()) {
    document.body.classList.add('is-mobile');
}

// 섹션 전환 함수
function showSection(section) {
    currentSection = section;
    
    // 메뉴 활성화 상태 변경
    document.querySelectorAll('.menu-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');
    
    // 섹션 표시/숨기기
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    
    if (section === 'communication') {
        document.getElementById('communicationSection').classList.add('active');
    } else if (section === 'benefits') {
        document.getElementById('benefitsSection').classList.add('active');
    }
}

// 혜택 정보 게시글 작성
function createBenefitPost() {
    if (!currentUser) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const title = document.getElementById('benefitTitle').value.trim();
    const content = document.getElementById('benefitContent').value.trim();
    
    if (!title || !content) {
        alert('제목과 내용을 모두 입력해주세요.');
        return;
    }
    
    if (window.editingBenefitId) {
        // 수정 모드
        const index = benefitPosts.findIndex(p => p.id === window.editingBenefitId);
        if (index !== -1) {
            benefitPosts[index].title = title;
            benefitPosts[index].content = content;
            benefitPosts[index].images = [...selectedBenefitImages];
            benefitPosts[index].links = [...attachedBenefitLinks];
            benefitPosts[index].isEdited = true;
            benefitPosts[index].editedAt = new Date().toISOString();
        }
        window.editingBenefitId = null;
    } else {
        // 새 게시글
        const benefitPost = {
            id: Date.now(),
            userId: currentUser.username || currentUser.id,
            author: currentUser.name || currentUser.username,
            title: title,
            content: content,
            images: [...selectedBenefitImages],
            links: [...attachedBenefitLinks],
            timestamp: new Date().toISOString(),
            views: 0
        };
        benefitPosts.unshift(benefitPost);
    }
    
    saveBenefitPosts();
    renderBenefitPosts();
    
    // 입력 초기화
    document.getElementById('benefitTitle').value = '';
    document.getElementById('benefitContent').value = '';
    document.getElementById('benefitContent').style.height = 'auto';
    selectedBenefitImages = [];
    attachedBenefitLinks = [];
    document.getElementById('benefitMediaPreview').innerHTML = '';
}

// 혜택 게시글 렌더링
function renderBenefitPosts() {
    const benefitList = document.getElementById('benefitList');
    if (!benefitList) return;
    
    // 기존 샘플 데이터 삭제
    benefitList.innerHTML = '';
    
    benefitPosts.forEach(post => {
        const isMyPost = currentUser && post.userId === (currentUser.username || currentUser.id);
        const postDiv = document.createElement('div');
        postDiv.className = 'benefit-item';
        let mediaHtml = '';
        
        // 이미지 표시
        if (post.images && post.images.length > 0) {
            const imageClass = post.images.length === 1 ? 'single' : '';
            mediaHtml += `<div class="post-images">`;
            post.images.forEach(image => {
                mediaHtml += `<img src="${image}" alt="" class="post-image ${imageClass}" onclick="viewImage('${image}')"/>`;
            });
            mediaHtml += `</div>`;
        }
        
        // 링크 표시
        if (post.links && post.links.length > 0) {
            post.links.forEach(link => {
                mediaHtml += `
                    <a href="${link.url}" target="_blank" rel="noopener noreferrer" class="post-link">
                        <div class="post-link-icon">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                            </svg>
                        </div>
                        <div class="post-link-content">
                            <div class="post-link-title">${link.title || link.url}</div>
                            <div class="post-link-url">${new URL(link.url).hostname}</div>
                        </div>
                    </a>
                `;
            });
        }
        
        postDiv.innerHTML = `
            <div class="benefit-header">
                <h3 class="benefit-title">${escapeHtml(post.title)}</h3>
                <div class="benefit-header-right">
                    <span class="benefit-date">${new Date(post.timestamp).toLocaleDateString('ko-KR')}</span>
                    ${isMyPost ? `
                    <div class="post-menu">
                        <button class="post-menu-btn" onclick="toggleBenefitMenu(${post.id})">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <circle cx="12" cy="12" r="1"></circle>
                                <circle cx="12" cy="5" r="1"></circle>
                                <circle cx="12" cy="19" r="1"></circle>
                            </svg>
                        </button>
                        <div class="post-menu-dropdown" id="benefitMenu-${post.id}">
                            <button class="menu-item" onclick="editBenefitPost(${post.id})">수정</button>
                            <button class="menu-item delete" onclick="deleteBenefitPost(${post.id})">삭제</button>
                        </div>
                    </div>
                    ` : ''}
                </div>
            </div>
            <div class="benefit-content">
                <p>${escapeHtml(post.content).replace(/\n/g, '</p><p>')}</p>
            </div>
            ${mediaHtml}
            <div class="benefit-footer">
                <span class="benefit-author">${escapeHtml(post.author)}</span>
                <button class="btn-text">자세히 보기</button>
            </div>
        `;
        benefitList.appendChild(postDiv);
    });
}

// 혜택 게시글 데이터 저장/로드
function saveBenefitPosts() {
    localStorage.setItem('benefitPosts', JSON.stringify(benefitPosts));
}

function loadBenefitPosts() {
    const saved = localStorage.getItem('benefitPosts');
    if (saved) {
        benefitPosts = JSON.parse(saved);
    } else {
        // 기본 샘플 데이터
        benefitPosts = [
            {
                id: 1,
                userId: 'sample',
                author: '정보공유자',
                title: '부산 청년 월세 지원사업',
                content: '만 19~34세 부산 거주 청년 대상 월 최대 20만원 월세 지원\n신청기간: 2024.04.01 ~ 2024.04.30',
                images: [],
                links: [],
                timestamp: new Date('2024-03-20').toISOString(),
                views: 0
            },
            {
                id: 2,
                userId: 'sample2',
                author: '정보공유자',
                title: '청년 디지털 일자리 사업',
                content: 'IT 분야 청년 채용 기업 대상 인건비 지원\n지원금액: 월 최대 180만원 (최대 6개월)',
                images: [],
                links: [],
                timestamp: new Date('2024-03-18').toISOString(),
                views: 0
            }
        ];
    }
    renderBenefitPosts();
}

// 이미지 선택 처리
function handleImageSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('mediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                selectedImages.push(imageUrl);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${imageUrl}" class="preview-image" alt=""/>
                    <button class="preview-remove" onclick="removeImage(${selectedImages.length - 1})">×</button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    event.target.value = '';
}

// 이미지 제거
function removeImage(index) {
    selectedImages.splice(index, 1);
    updateMediaPreview();
}

// 미디어 미리보기 업데이트
function updateMediaPreview() {
    const preview = document.getElementById('mediaPreview');
    preview.innerHTML = '';
    
    selectedImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${image}" class="preview-image" alt=""/>
            <button class="preview-remove" onclick="removeImage(${index})">×</button>
        `;
        preview.appendChild(previewItem);
    });
    
    attachedLinks.forEach((link, index) => {
        const linkPreview = document.createElement('div');
        linkPreview.className = 'link-preview';
        linkPreview.innerHTML = `
            <div class="link-preview-content">
                <div class="link-preview-title">${link.title || link.url}</div>
                <div class="link-preview-url">${new URL(link.url).hostname}</div>
            </div>
            <button class="preview-remove" onclick="removeLink(${index})">×</button>
        `;
        preview.appendChild(linkPreview);
    });
}

// 링크 다이얼로그 표시
function showLinkDialog() {
    document.getElementById('linkModal').style.display = 'block';
    document.getElementById('linkInput').focus();
}

// 링크 다이얼로그 닫기
function closeLinkDialog() {
    document.getElementById('linkModal').style.display = 'none';
    document.getElementById('linkInput').value = '';
}

// 링크 추가
function addLink() {
    let url = document.getElementById('linkInput').value.trim();
    if (!url) {
        alert('링크를 입력해주세요.');
        return;
    }
    
    // https:// 또는 http://가 없으면 자동으로 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        new URL(url);
    } catch (e) {
        alert('올바른 URL 형식이 아닙니다.');
        return;
    }
    
    // 실제로는 서버에서 메타데이터를 가져와야 하지만, 
    // 예제를 위해 기본 정보로 표시
    const link = {
        url: url,
        title: new URL(url).hostname,
        description: ''
    };
    
    attachedLinks.push(link);
    updateMediaPreview();
    closeLinkDialog();
}

// 링크 제거
function removeLink(index) {
    attachedLinks.splice(index, 1);
    updateMediaPreview();
}

// 이미지 확대 보기
function viewImage(imageUrl) {
    window.open(imageUrl, '_blank');
}

// 드래그 앤 드롭 설정
function setupDragAndDrop() {
    const postComposer = document.getElementById('postComposer');
    if (!postComposer) return;
    
    let dragCounter = 0;
    
    // 드래그 엔터 이벤트
    postComposer.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        this.classList.add('drag-over');
    });
    
    // 드래그 오버 이벤트
    postComposer.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    // 드래그 리브 이벤트
    postComposer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) {
            this.classList.remove('drag-over');
        }
    });
    
    // 드롭 이벤트
    postComposer.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleDroppedFiles(files);
    });
}

// 드롭된 파일 처리
function handleDroppedFiles(files) {
    const preview = document.getElementById('mediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                selectedImages.push(imageUrl);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${imageUrl}" class="preview-image" alt=""/>
                    <button class="preview-remove" onclick="removeImage(${selectedImages.length - 1})">×</button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// 혜택 게시글 메뉴 토글
function toggleBenefitMenu(postId) {
    const menu = document.getElementById(`benefitMenu-${postId}`);
    const allMenus = document.querySelectorAll('.post-menu-dropdown');
    
    // 다른 메뉴 닫기
    allMenus.forEach(m => {
        if (m.id !== `benefitMenu-${postId}`) {
            m.classList.remove('show');
        }
    });
    
    // 현재 메뉴 토글
    menu.classList.toggle('show');
}

// 혜택 게시글 수정
function editBenefitPost(postId) {
    const post = benefitPosts.find(p => p.id === postId);
    if (!post || !currentUser || post.userId !== (currentUser.username || currentUser.id)) {
        alert('수정 권한이 없습니다.');
        return;
    }
    
    // 수정 입력란에 기존 내용 채우기
    document.getElementById('benefitTitle').value = post.title;
    document.getElementById('benefitContent').value = post.content;
    document.getElementById('benefitContent').style.height = 'auto';
    document.getElementById('benefitContent').style.height = document.getElementById('benefitContent').scrollHeight + 'px';
    
    // 기존 이미지와 링크 복원
    selectedBenefitImages = post.images ? [...post.images] : [];
    attachedBenefitLinks = post.links ? [...post.links] : [];
    updateBenefitMediaPreview();
    
    // 수정 모드로 설정
    window.editingBenefitId = postId;
    
    // 스크롤을 작성 영역으로
    document.getElementById('benefitComposer').scrollIntoView({ behavior: 'smooth' });
    
    // 메뉴 닫기
    document.getElementById(`benefitMenu-${postId}`).classList.remove('show');
}

// 혜택 게시글 삭제
function deleteBenefitPost(postId) {
    const post = benefitPosts.find(p => p.id === postId);
    if (!post || !currentUser || post.userId !== (currentUser.username || currentUser.id)) {
        alert('삭제 권한이 없습니다.');
        return;
    }
    
    if (confirm('정말로 삭제하시겠습니까?')) {
        benefitPosts = benefitPosts.filter(p => p.id !== postId);
        saveBenefitPosts();
        renderBenefitPosts();
    }
    
    // 메뉴 닫기
    document.getElementById(`benefitMenu-${postId}`).classList.remove('show');
}

// 혜택 정보 이미지 선택 처리
function handleBenefitImageSelect(event) {
    const files = event.target.files;
    const preview = document.getElementById('benefitMediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                selectedBenefitImages.push(imageUrl);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${imageUrl}" class="preview-image" alt=""/>
                    <button class="preview-remove" onclick="removeBenefitImage(${selectedBenefitImages.length - 1})">×</button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
    
    event.target.value = '';
}

// 혜택 정보 이미지 제거
function removeBenefitImage(index) {
    selectedBenefitImages.splice(index, 1);
    updateBenefitMediaPreview();
}

// 혜택 정보 미디어 미리보기 업데이트
function updateBenefitMediaPreview() {
    const preview = document.getElementById('benefitMediaPreview');
    preview.innerHTML = '';
    
    selectedBenefitImages.forEach((image, index) => {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        previewItem.innerHTML = `
            <img src="${image}" class="preview-image" alt=""/>
            <button class="preview-remove" onclick="removeBenefitImage(${index})">×</button>
        `;
        preview.appendChild(previewItem);
    });
    
    attachedBenefitLinks.forEach((link, index) => {
        const linkPreview = document.createElement('div');
        linkPreview.className = 'link-preview';
        linkPreview.innerHTML = `
            <div class="link-preview-content">
                <div class="link-preview-title">${link.title || link.url}</div>
                <div class="link-preview-url">${new URL(link.url).hostname}</div>
            </div>
            <button class="preview-remove" onclick="removeBenefitLink(${index})">×</button>
        `;
        preview.appendChild(linkPreview);
    });
}

// 혜택 정보 링크 다이얼로그 표시
function showBenefitLinkDialog() {
    document.getElementById('benefitLinkModal').style.display = 'block';
    document.getElementById('benefitLinkInput').focus();
}

// 혜택 정보 링크 다이얼로그 닫기
function closeBenefitLinkDialog() {
    document.getElementById('benefitLinkModal').style.display = 'none';
    document.getElementById('benefitLinkInput').value = '';
}

// 혜택 정보 링크 추가
function addBenefitLink() {
    let url = document.getElementById('benefitLinkInput').value.trim();
    if (!url) {
        alert('링크를 입력해주세요.');
        return;
    }
    
    // https:// 또는 http://가 없으면 자동으로 추가
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
    }
    
    try {
        new URL(url);
    } catch (e) {
        alert('올바른 URL 형식이 아닙니다.');
        return;
    }
    
    const link = {
        url: url,
        title: new URL(url).hostname,
        description: ''
    };
    
    attachedBenefitLinks.push(link);
    updateBenefitMediaPreview();
    closeBenefitLinkDialog();
}

// 혜택 정보 링크 제거
function removeBenefitLink(index) {
    attachedBenefitLinks.splice(index, 1);
    updateBenefitMediaPreview();
}

// 혜택 정보 드래그 앤 드롭 설정
function setupBenefitDragAndDrop() {
    const benefitComposer = document.getElementById('benefitComposer');
    if (!benefitComposer) return;
    
    let dragCounter = 0;
    
    // 드래그 엔터 이벤트
    benefitComposer.addEventListener('dragenter', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter++;
        this.classList.add('drag-over');
    });
    
    // 드래그 오버 이벤트
    benefitComposer.addEventListener('dragover', function(e) {
        e.preventDefault();
        e.stopPropagation();
    });
    
    // 드래그 리브 이벤트
    benefitComposer.addEventListener('dragleave', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter--;
        if (dragCounter === 0) {
            this.classList.remove('drag-over');
        }
    });
    
    // 드롭 이벤트
    benefitComposer.addEventListener('drop', function(e) {
        e.preventDefault();
        e.stopPropagation();
        dragCounter = 0;
        this.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        handleDroppedBenefitFiles(files);
    });
}

// 혜택 정보 드롭된 파일 처리
function handleDroppedBenefitFiles(files) {
    const preview = document.getElementById('benefitMediaPreview');
    
    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                selectedBenefitImages.push(imageUrl);
                
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                previewItem.innerHTML = `
                    <img src="${imageUrl}" class="preview-image" alt=""/>
                    <button class="preview-remove" onclick="removeBenefitImage(${selectedBenefitImages.length - 1})">×</button>
                `;
                preview.appendChild(previewItem);
            };
            reader.readAsDataURL(file);
        }
    });
}

// window 객체에 함수 등록
window.createPost = createPost;
window.toggleLike = toggleLike;
window.openCommentModal = openCommentModal;
window.closeCommentModal = closeCommentModal;
window.addComment = addComment;
window.toggleAnonymous = toggleAnonymous;
window.togglePostMenu = togglePostMenu;
window.editPost = editPost;
window.deletePost = deletePost;
window.reportPost = reportPost;
window.showSection = showSection;
window.createBenefitPost = createBenefitPost;
window.handleImageSelect = handleImageSelect;
window.removeImage = removeImage;
window.showLinkDialog = showLinkDialog;
window.closeLinkDialog = closeLinkDialog;
window.addLink = addLink;
window.removeLink = removeLink;
window.viewImage = viewImage;
window.toggleBenefitMenu = toggleBenefitMenu;
window.editBenefitPost = editBenefitPost;
window.deleteBenefitPost = deleteBenefitPost;
window.handleBenefitImageSelect = handleBenefitImageSelect;
window.removeBenefitImage = removeBenefitImage;
window.showBenefitLinkDialog = showBenefitLinkDialog;
window.closeBenefitLinkDialog = closeBenefitLinkDialog;
window.addBenefitLink = addBenefitLink;
window.removeBenefitLink = removeBenefitLink;