// 모임 신청 페이지 JavaScript

// localStorage에서 모임 데이터 불러오기
function loadMeetings() {
    const savedMeetings = JSON.parse(localStorage.getItem('customMeetings') || '[]');
    const defaultMeetings = [
    {
        id: 1,
        title: "부산 직장인 네트워킹 모임",
        date: "2025-01-25",
        time: "19:00 - 21:00",
        location: "서면 스타벅스 2층",
        price: 10000,
        currentParticipants: 12,
        maxParticipants: 20,
        description: "부산 지역 직장인들이 모여 네트워킹하는 모임입니다. 편안한 분위기에서 다양한 분야의 사람들과 교류할 수 있습니다.",
        bankAccount: "카카오뱅크 3333-01-1234567",
        openChatLink: "https://open.kakao.com/busan-networking",
        type: "meeting"
    },
    {
        id: 2,
        title: "독서 토론 모임",
        date: "2025-01-28",
        time: "19:30 - 21:30",
        location: "센텀시티 교보문고 카페",
        price: 5000,
        currentParticipants: 8,
        maxParticipants: 15,
        description: "이번 달 선정 도서 '아몬드'를 읽고 함께 토론하는 시간입니다. 책을 읽고 오시면 더욱 풍성한 대화를 나눌 수 있습니다.",
        bankAccount: "국민은행 123-456-789012",
        openChatLink: "https://open.kakao.com/busan-bookclub",
        type: "meeting"
    },
    {
        id: 3,
        title: "주말 등산 모임",
        date: "2025-02-01",
        time: "08:00 - 12:00",
        location: "금정산 입구",
        price: 0,
        currentParticipants: 15,
        maxParticipants: 15,
        description: "금정산을 함께 오르며 건강도 챙기고 친목도 다지는 모임입니다. 등산 후 간단한 식사를 함께 합니다.",
        bankAccount: "무료 모임",
        openChatLink: "https://open.kakao.com/busan-hiking",
        type: "meeting"
    }
];
    
    return [...defaultMeetings, ...savedMeetings];
}

// 모임 데이터
let meetingEvents = loadMeetings();

// 현재 선택된 이벤트
let selectedEvent = null;
let currentMeetingId = null;

// 날짜가 선택되었을 때 호출되는 함수
function onDateSelected(date) {
    const dateString = formatDateString(date);
    meetingEvents = loadMeetings(); // 최신 데이터 로드
    const events = meetingEvents.filter(event => event.date === dateString);
    displayEvents(events);
}

// 특정 월의 이벤트 가져오기
function getEventsForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return meetingEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
}

// 이벤트 목록 표시
function displayEvents(events) {
    const eventsList = document.getElementById('events-list');
    
    if (events.length === 0) {
        eventsList.innerHTML = '<p class="no-events">선택한 날짜에 예정된 모임이 없습니다.</p>';
        return;
    }
    
    let html = '';
    events.forEach(event => {
        const isFull = event.currentParticipants >= event.maxParticipants;
        
        html += `
            <div class="event-card ${isFull ? 'full' : ''}" onclick="${!isFull ? `showEventDetails(${event.id})` : ''}">
                <div class="event-header">
                    <h4 class="event-title">${event.title}</h4>
                    <span class="event-price">${formatPrice(event.price)}</span>
                </div>
                <div class="event-details">
                    <p class="event-detail">📅 ${event.time}</p>
                    <p class="event-detail">📍 ${event.location}</p>
                </div>
                <div class="event-participants">
                    <span class="participants-count">
                        참가자: ${event.currentParticipants}/${event.maxParticipants}명
                    </span>
                    <span class="event-status ${isFull ? 'status-full' : 'status-available'}">
                        ${isFull ? '마감' : '신청 가능'}
                    </span>
                </div>
            </div>
        `;
    });
    
    eventsList.innerHTML = html;
}

// 이벤트 상세 정보 표시
function showEventDetails(eventId) {
    const event = meetingEvents.find(e => e.id == eventId);
    if (!event) return;
    
    selectedEvent = event;
    
    // 모달에 정보 입력
    document.getElementById('modal-title').textContent = event.title;
    document.getElementById('modal-date').textContent = formatDate(new Date(event.date));
    document.getElementById('modal-time').textContent = event.time;
    document.getElementById('modal-location').textContent = event.location;
    document.getElementById('modal-price').textContent = formatPrice(event.price);
    document.getElementById('modal-participants').textContent = `${event.currentParticipants}/${event.maxParticipants}명`;
    document.getElementById('modal-description').textContent = event.description;
    document.getElementById('modal-account').textContent = event.bankAccount;
    document.getElementById('modal-chat').href = event.openChatLink;
    
    // 모달 표시
    document.getElementById('modal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    selectedEvent = null;
}

// 이벤트 신청
function applyForEvent() {
    if (!selectedEvent) return;
    
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }
    
    if (selectedEvent.price > 0) {
        // 유료 모임인 경우 입금 확인 모달 표시
        currentMeetingId = selectedEvent.id;
        document.getElementById('payment-account').textContent = selectedEvent.bankAccount;
        document.getElementById('payment-amount').textContent = formatPrice(selectedEvent.price);
        document.getElementById('payment-confirm-modal').style.display = 'flex';
    } else {
        // 무료 모임인 경우 바로 신청 완료
        addParticipant(selectedEvent.id, user, 'confirmed');
        alert('모임 신청이 완료되었습니다!');
        closeModal();
    }
}

// 날짜 문자열 포맷
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 참여자 목록 토글
function toggleParticipantsList() {
    const participantsList = document.getElementById('participantsList');
    const button = event.target;
    
    if (participantsList.style.display === 'none') {
        showParticipants();
        participantsList.style.display = 'block';
        button.textContent = '참여자 숨기기';
    } else {
        participantsList.style.display = 'none';
        button.textContent = '참여자 보기';
    }
}

// 참여자 목록 표시
function showParticipants() {
    if (!selectedEvent) return;
    
    const participants = getParticipants(selectedEvent.id);
    const listElement = document.getElementById('participants-list');
    
    if (participants.length === 0) {
        listElement.innerHTML = '<li>아직 참여자가 없습니다.</li>';
        return;
    }
    
    let html = '';
    participants.forEach(participant => {
        html += `
            <li>
                <span>${participant.name} (${participant.company || '회사 미등록'})</span>
                <span class="participant-status ${participant.paymentStatus === 'paid' ? 'status-paid' : 'status-pending'}">
                    ${participant.paymentStatus === 'paid' ? '입금완료' : '입금대기'}
                </span>
            </li>
        `;
    });
    
    listElement.innerHTML = html;
}

// 참여자 추가
function addParticipant(meetingId, user, paymentStatus) {
    const participants = JSON.parse(localStorage.getItem('meetingParticipants') || '{}');
    
    if (!participants[meetingId]) {
        participants[meetingId] = [];
    }
    
    // 중복 신청 체크
    const alreadyApplied = participants[meetingId].some(p => p.userId === user.id);
    if (alreadyApplied) {
        alert('이미 신청한 모임입니다.');
        return;
    }
    
    participants[meetingId].push({
        userId: user.id,
        name: user.name,
        email: user.email,
        company: user.company,
        appliedAt: new Date().toISOString(),
        paymentStatus: paymentStatus
    });
    
    localStorage.setItem('meetingParticipants', JSON.stringify(participants));
    
    // 참가자 수 업데이트
    updateParticipantCount(meetingId);
}

// 참여자 목록 가져오기
function getParticipants(meetingId) {
    const participants = JSON.parse(localStorage.getItem('meetingParticipants') || '{}');
    return participants[meetingId] || [];
}

// 참가자 수 업데이트
function updateParticipantCount(meetingId) {
    const participants = getParticipants(meetingId);
    const meeting = meetingEvents.find(m => m.id === meetingId);
    if (meeting) {
        meeting.currentParticipants = participants.length;
    }
}

// 모임 생성 모달 표시
function showCreateMeetingModal() {
    document.getElementById('create-meeting-modal').style.display = 'flex';
}

// 모임 생성 모달 닫기
function closeCreateMeetingModal() {
    document.getElementById('create-meeting-modal').style.display = 'none';
    document.getElementById('createMeetingForm').reset();
}

// 입금 확인 모달 닫기
function closePaymentModal() {
    document.getElementById('payment-confirm-modal').style.display = 'none';
    document.getElementById('depositorName').value = '';
}

// 입금 확인
function confirmPayment() {
    const depositorName = document.getElementById('depositorName').value;
    if (!depositorName.trim()) {
        alert('입금자명을 입력해주세요.');
        return;
    }
    
    const user = getCurrentUser();
    if (!user || !currentMeetingId) return;
    
    // 참여자 추가 (입금 완료 상태)
    addParticipant(currentMeetingId, user, 'paid');
    
    alert('입금 확인이 완료되었습니다!\n모임 참여가 확정되었습니다.');
    
    closePaymentModal();
    closeModal();
    
    // 페이지 새로고침하여 최신 상태 반영
    window.location.reload();
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // 사용자 권한에 따라 모임 만들기 버튼 표시
    const user = getCurrentUser();
    const createMeetingBtn = document.getElementById('createMeetingBtn');
    
    if (user && createMeetingBtn) {
        // 일반 사용자도 모임을 만들 수 있음
        createMeetingBtn.style.display = 'flex';
    }
    
    // 모임 생성 폼 제출 처리
    const createMeetingForm = document.getElementById('createMeetingForm');
    if (createMeetingForm) {
        createMeetingForm.addEventListener('submit', handleMeetingSubmit);
    }
    
    // 모달 배경 클릭 시 닫기
    const modalBackdrop = document.querySelector('.modal-backdrop');
    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeModal);
    }
    
    // 모달 닫기 버튼
    const modalClose = document.querySelector('.modal-close');
    if (modalClose) {
        modalClose.addEventListener('click', closeModal);
    }
    
    // ESC 키로 모달 닫기
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeCreateMeetingModal();
            closePaymentModal();
        }
    });
    
    // 모임 카드 표시
    displayMeetingCards();
    
    // localStorage에서 저장된 모임 불러와서 표시
    const savedMeetings = JSON.parse(localStorage.getItem('customMeetings') || '[]');
    savedMeetings.forEach(meeting => {
        // 이미 displayMeetingCards()에서 표시되므로 추가 처리 불필요
    });
});

// 모임 생성 처리
function handleMeetingSubmit(e) {
    e.preventDefault();
    
    const user = getCurrentUser();
    if (!user) {
        alert('로그인이 필요합니다.');
        return;
    }
    
    const formData = new FormData(e.target);
    const meetingData = {
        id: Date.now(), // 숫자형 ID로 변경
        title: formData.get('title'),
        category: formData.get('category'),
        type: formData.get('type'),
        date: formData.get('date'),
        time: formData.get('time'),
        location: formData.get('location'),
        maxParticipants: parseInt(formData.get('maxPeople')),
        price: 0, // 무료로 고정
        bankAccount: '무료 모임',
        openChatLink: '#',
        description: formData.get('description'),
        currentParticipants: 0,
        createdBy: user.id,
        createdAt: new Date().toISOString()
    };
    
    // localStorage에 저장
    const savedMeetings = JSON.parse(localStorage.getItem('customMeetings') || '[]');
    savedMeetings.push(meetingData);
    localStorage.setItem('customMeetings', JSON.stringify(savedMeetings));
    
    // 모임 배열 업데이트
    meetingEvents = loadMeetings();
    
    // 카드 추가
    addMeetingCard(meetingData);
    
    alert('모임이 성공적으로 생성되었습니다!');
    closeCreateMeetingModal();
}

// 모임 카드 표시
function displayMeetingCards() {
    const meetingsGrid = document.getElementById('meetingsGrid');
    meetingEvents = loadMeetings();
    
    if (meetingEvents.length === 0) {
        meetingsGrid.innerHTML = '<p class="no-meetings">아직 등록된 모임이 없습니다.</p>';
        return;
    }
    
    // 현재 날짜 기준으로 상태 결정
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    let html = '';
    meetingEvents.forEach(meeting => {
        const meetingDate = new Date(meeting.date);
        meetingDate.setHours(0, 0, 0, 0);
        
        // 상태 결정
        let status = 'recruiting';
        if (meetingDate < today) {
            status = 'closed';
        } else if (meetingDate > today) {
            const daysDiff = Math.ceil((meetingDate - today) / (1000 * 60 * 60 * 24));
            if (daysDiff > 7) {
                status = 'upcoming';
            }
        }
        
        // 참가자 비율 계산
        const participantRatio = (meeting.currentParticipants / meeting.maxParticipants) * 100;
        
        // 모임 유형 뱃지 클래스
        const typeClass = meeting.type || 'meeting';
        const typeName = {
            'regular': '정기모임',
            'casual': '번개',
            'study': '스터디',
            'networking': '네트워킹',
            'meeting': '모임'
        }[typeClass] || '모임';
        
        html += `
            <div class="meeting-card" data-status="${status}" data-category="${meeting.category || 'other'}" data-id="${meeting.id}" onclick="showEventDetails(${meeting.id})">
                <div class="meeting-card-header">
                    <span class="meeting-type-badge ${typeClass}">${typeName}</span>
                    <h3 class="meeting-card-title">${meeting.title}</h3>
                    <div class="meeting-card-info">
                        <div class="meeting-info-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                            </svg>
                            <span>${formatDate(new Date(meeting.date))}</span>
                        </div>
                        <div class="meeting-info-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <span>${meeting.time}</span>
                        </div>
                        <div class="meeting-info-item">
                            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            </svg>
                            <span>${meeting.location}</span>
                        </div>
                    </div>
                </div>
                <div class="meeting-card-body">
                    <p class="meeting-card-description">${meeting.description}</p>
                </div>
                <div class="meeting-card-footer">
                    <div class="meeting-participants-info">
                        <span>${meeting.currentParticipants}/${meeting.maxParticipants}명</span>
                        <div class="participants-bar">
                            <div class="participants-progress" style="width: ${participantRatio}%"></div>
                        </div>
                    </div>
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <span class="meeting-price ${meeting.price === 0 ? 'free' : ''}">
                            ${meeting.price === 0 ? '무료' : formatPrice(meeting.price)}
                        </span>
                        <span class="meeting-status-badge status-${status}">
                            ${status === 'recruiting' ? '모집중' : status === 'upcoming' ? '모집예정' : '모집완료'}
                        </span>
                    </div>
                </div>
            </div>
        `;
    });
    
    meetingsGrid.innerHTML = html;
}

// 현재 필터 상태
let currentStatusFilter = 'all';
let currentCategoryFilter = 'all';

// 상태별 필터링
function filterByStatus(status) {
    currentStatusFilter = status;
    
    // 버튼 활성화 상태 변경
    const statusButtons = document.querySelectorAll('.filter-group:first-child .category-btn');
    statusButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    applyFilters();
}

// 카테고리별 필터링
function filterByCategory(category) {
    currentCategoryFilter = category;
    
    // 버튼 활성화 상태 변경
    const categoryButtons = document.querySelectorAll('.filter-group:last-child .category-btn');
    categoryButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    applyFilters();
}

// 필터 적용
function applyFilters() {
    const cards = document.querySelectorAll('.meeting-card');
    const meetingsGrid = document.getElementById('meetingsGrid');
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardStatus = card.getAttribute('data-status');
        const cardCategory = card.getAttribute('data-category');
        
        const statusMatch = currentStatusFilter === 'all' || cardStatus === currentStatusFilter;
        const categoryMatch = currentCategoryFilter === 'all' || cardCategory === currentCategoryFilter;
        
        if (statusMatch && categoryMatch) {
            card.classList.remove('hidden');
            visibleCount++;
        } else {
            card.classList.add('hidden');
        }
    });
    
    // 빈 상태 메시지 처리
    const existingEmptyMessage = document.querySelector('.empty-message');
    if (existingEmptyMessage) {
        existingEmptyMessage.remove();
    }
    
    if (visibleCount === 0) {
        const statusText = {
            'recruiting': '모집중인',
            'upcoming': '모집예정인',
            'closed': '모집완료된',
            'all': ''
        }[currentStatusFilter] || '';
        
        const categoryText = {
            'self-improvement': '자기계발',
            'social': '친목',
            'other': '기타',
            'all': ''
        }[currentCategoryFilter] || '';
        
        let messageText = '해당하는 모임이 없습니다.';
        if (statusText || categoryText) {
            messageText = `${statusText} ${categoryText} 모임이 없습니다.`.trim();
        }
        
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-message';
        emptyMessage.innerHTML = `
            <div class="empty-icon">📅</div>
            <p>${messageText}</p>
            <button class="btn btn-secondary" onclick="resetFilters()">전체 모임 보기</button>
        `;
        meetingsGrid.appendChild(emptyMessage);
    }
}

// 필터 초기화
function resetFilters() {
    currentStatusFilter = 'all';
    currentCategoryFilter = 'all';
    
    // 모든 버튼의 active 클래스 제거
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
    
    // 첫 번째 버튼들에 active 클래스 추가
    document.querySelector('.filter-group:first-child .category-btn:first-child').classList.add('active');
    document.querySelector('.filter-group:last-child .category-btn:first-child').classList.add('active');
    
    applyFilters();
}

// 모임 카드 동적 추가
function addMeetingCard(meetingData) {
    const meetingsGrid = document.getElementById('meetingsGrid');
    
    // 현재 날짜 기준으로 상태 결정
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const meetingDate = new Date(meetingData.date);
    meetingDate.setHours(0, 0, 0, 0);
    
    let status = 'recruiting';
    if (meetingDate < today) {
        status = 'closed';
    } else if (meetingDate > today) {
        const daysDiff = Math.ceil((meetingDate - today) / (1000 * 60 * 60 * 24));
        if (daysDiff > 7) {
            status = 'upcoming';
        }
    }
    
    // 모임 유형 뱃지 클래스
    const typeClass = meetingData.type || 'meeting';
    const typeName = {
        'regular': '정기모임',
        'casual': '번개',
        'study': '스터디',
        'networking': '네트워킹',
        'meeting': '모임'
    }[typeClass] || '모임';
    
    const cardHTML = `
        <div class="meeting-card" data-status="${status}" data-category="${meetingData.category || 'other'}" data-id="${meetingData.id}" onclick="showEventDetails(${meetingData.id})">
            <div class="meeting-card-header">
                <span class="meeting-type-badge ${typeClass}">${typeName}</span>
                <h3 class="meeting-card-title">${meetingData.title}</h3>
                <div class="meeting-card-info">
                    <div class="meeting-info-item">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <span>${formatDate(new Date(meetingData.date))}</span>
                    </div>
                    <div class="meeting-info-item">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <span>${meetingData.time}</span>
                    </div>
                    <div class="meeting-info-item">
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                        </svg>
                        <span>${meetingData.location}</span>
                    </div>
                </div>
            </div>
            <div class="meeting-card-body">
                <p class="meeting-card-description">${meetingData.description}</p>
            </div>
            <div class="meeting-card-footer">
                <div class="meeting-participants-info">
                    <span>${meetingData.currentParticipants}/${meetingData.maxParticipants}명</span>
                    <div class="participants-bar">
                        <div class="participants-progress" style="width: 0%"></div>
                    </div>
                </div>
                <div style="display: flex; align-items: center; gap: 15px;">
                    <span class="meeting-price free">무료</span>
                    <span class="meeting-status-badge status-${status}">
                        ${status === 'recruiting' ? '모집중' : status === 'upcoming' ? '모집예정' : '모집완료'}
                    </span>
                </div>
            </div>
        </div>
    `;
    
    // 빈 메시지가 있으면 제거
    const emptyMessage = document.querySelector('.no-meetings');
    if (emptyMessage) {
        emptyMessage.remove();
    }
    
    // 새 카드 추가
    const newCard = document.createElement('div');
    newCard.innerHTML = cardHTML;
    meetingsGrid.insertBefore(newCard.firstElementChild, meetingsGrid.firstChild);
    
    // 필터 재적용
    applyFilters();
}

// 특정 모임 카드로 스크롤
function scrollToMeetingCard(meetingId) {
    const card = document.querySelector(`[data-id="${meetingId}"]`);
    if (card) {
        // 카드가 숨겨진 경우 모든 필터 초기화
        if (card.classList.contains('hidden')) {
            resetFilters();
        }
        
        // 카드로 스크롤
        card.scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });
        
        // 하이라이트 효과
        card.classList.add('highlight');
        setTimeout(() => {
            card.classList.remove('highlight');
        }, 2000);
        
        // 모달 열기
        const event = meetingEvents.find(e => e.id == meetingId);
        if (event) {
            selectedEvent = event;
            
            // 모달에 정보 입력
            document.getElementById('modal-title').textContent = event.title;
            document.getElementById('modal-date').textContent = formatDate(new Date(event.date));
            document.getElementById('modal-time').textContent = event.time;
            document.getElementById('modal-location').textContent = event.location;
            document.getElementById('modal-price').textContent = formatPrice(event.price);
            document.getElementById('modal-participants').textContent = `${event.currentParticipants}/${event.maxParticipants}명`;
            document.getElementById('modal-description').textContent = event.description;
            document.getElementById('modal-account').textContent = event.bankAccount;
            document.getElementById('modal-chat').href = event.openChatLink;
            
            // 모달 표시
            setTimeout(() => {
                document.getElementById('modal').style.display = 'block';
            }, 1000);
        }
    }
}