// 원데이클래스 페이지 JavaScript

// 샘플 클래스 데이터
const classEvents = [
    {
        id: 1,
        title: "Excel 기초 마스터",
        date: "2025-02-15",
        time: "14:00 - 16:00",
        location: "부산 IT 교육센터",
        price: 50000,
        instructor: "김엑셀 (대기업 데이터분석팀 5년차)",
        currentParticipants: 5,
        maxParticipants: 8,
        description: "엑셀의 기본 기능부터 실무에서 자주 사용하는 함수와 기능들을 체계적으로 학습합니다.",
        materials: "노트북 (엑셀 설치 필수), 필기도구",
        features: ["실습 위주", "1:1 피드백", "교재 제공"],
        bankAccount: "카카오뱅크 3333-02-7654321",
        openChatLink: "https://open.kakao.com/busan-excel",
        type: "class"
    },
    {
        id: 2,
        title: "PPT 디자인 실무",
        date: "2025-02-20",
        time: "19:00 - 22:00",
        location: "센텀 스타트업 파크",
        price: 60000,
        instructor: "박프레젠 (대기업 기획팀 7년차)",
        currentParticipants: 4,
        maxParticipants: 6,
        description: "단순한 슬라이드 제작을 넘어 메시지를 효과적으로 전달하는 프레젠테이션 디자인 스킬을 배웁니다.",
        materials: "노트북, PowerPoint 설치 필수",
        features: ["소규모 정원", "실전 템플릿", "피드백 제공"],
        bankAccount: "국민은행 987-654-321098",
        openChatLink: "https://open.kakao.com/busan-ppt",
        type: "class"
    },
    {
        id: 3,
        title: "데이터 분석 입문",
        date: "2025-03-01",
        time: "10:00 - 14:00",
        location: "부산 디지털 혁신센터",
        price: 80000,
        instructor: "이데이터 (IT기업 데이터사이언티스트)",
        currentParticipants: 2,
        maxParticipants: 6,
        description: "Python과 Excel을 활용한 실무 데이터 분석의 기초를 배웁니다.",
        materials: "노트북, Python 설치 가이드 제공",
        features: ["실습 중심", "프로젝트", "커리어 상담"],
        bankAccount: "신한은행 110-123-456789",
        openChatLink: "https://open.kakao.com/busan-data",
        type: "class"
    },
    {
        id: 4,
        title: "Notion 업무 활용법",
        date: "2025-01-25",
        time: "14:00 - 16:00",
        location: "서면 코워킹스페이스",
        price: 45000,
        instructor: "최노션 (스타트업 PM)",
        currentParticipants: 10,
        maxParticipants: 10,
        description: "Notion을 활용한 개인 및 팀 업무 관리 방법을 배웁니다.",
        materials: "노트북, Notion 계정",
        features: ["템플릿 제공", "실습", "Q&A"],
        bankAccount: "카카오뱅크 3333-11-2345678",
        openChatLink: "https://open.kakao.com/busan-notion",
        type: "class"
    },
    {
        id: 5,
        title: "AI 도구 활용법",
        date: "2025-02-10",
        time: "19:00 - 22:00",
        location: "부산 AI 허브",
        price: 70000,
        instructor: "김에이아이 (AI 스타트업 대표)",
        currentParticipants: 6,
        maxParticipants: 8,
        description: "ChatGPT, Claude 등 AI 도구를 업무에 효과적으로 활용하는 방법을 배웁니다.",
        materials: "노트북, AI 도구 계정",
        features: ["실습 위주", "활용 사례", "프롬프트 가이드"],
        bankAccount: "국민은행 123-456-789012",
        openChatLink: "https://open.kakao.com/busan-ai",
        type: "class"
    },
    {
        id: 6,
        title: "프로젝트 관리 기초",
        date: "2025-03-05",
        time: "19:00 - 22:00",
        location: "해운대 비즈니스센터",
        price: 65000,
        instructor: "정프로젝트 (대기업 PMO 10년차)",
        currentParticipants: 3,
        maxParticipants: 8,
        description: "체계적인 프로젝트 관리 방법론과 실무 도구 활용법을 배웁니다.",
        materials: "노트북, 필기도구",
        features: ["케이스 스터디", "도구 실습", "템플릿"],
        bankAccount: "하나은행 321-654-987654",
        openChatLink: "https://open.kakao.com/busan-pm",
        type: "class"
    },
    {
        id: 7,
        title: "SQL 기초 마스터",
        date: "2025-02-25",
        time: "10:00 - 13:00",
        location: "부산 IT 교육센터",
        price: 55000,
        instructor: "이디비 (데이터베이스 전문가)",
        currentParticipants: 4,
        maxParticipants: 8,
        description: "데이터베이스 조회와 분석을 위한 SQL 기초 문법을 마스터합니다.",
        materials: "노트북, MySQL 설치 가이드 제공",
        features: ["실습 환경", "쿼리 연습", "실무 예제"],
        bankAccount: "우리은행 1002-345-678901",
        openChatLink: "https://open.kakao.com/busan-sql",
        type: "class"
    },
    {
        id: 8,
        title: "Git & GitHub 입문",
        date: "2025-03-10",
        time: "14:00 - 17:00",
        location: "부산 개발자 커뮤니티",
        price: 60000,
        instructor: "김깃헙 (오픈소스 컨트리뷰터)",
        currentParticipants: 2,
        maxParticipants: 8,
        description: "개발 협업의 필수 도구인 Git과 GitHub 사용법을 배웁니다.",
        materials: "노트북, GitHub 계정",
        features: ["실습 중심", "협업 시뮬레이션", "포트폴리오"],
        bankAccount: "카카오뱅크 3333-22-3456789",
        openChatLink: "https://open.kakao.com/busan-git",
        type: "class"
    },
    {
        id: 9,
        title: "Figma UI/UX 디자인",
        date: "2025-01-20",
        time: "10:00 - 14:00",
        location: "부산 디자인센터",
        price: 75000,
        instructor: "박디자인 (UI/UX 디자이너)",
        currentParticipants: 6,
        maxParticipants: 6,
        description: "실무에서 가장 많이 사용하는 Figma를 활용한 UI/UX 디자인을 배웁니다.",
        materials: "노트북, Figma 계정, 마우스",
        features: ["포트폴리오", "실무 프로젝트", "1:1 피드백"],
        bankAccount: "신한은행 110-987-654321",
        openChatLink: "https://open.kakao.com/busan-figma",
        type: "class"
    }
];

// 현재 선택된 클래스
let selectedClass = null;

// 날짜가 선택되었을 때 호출되는 함수
function onDateSelected(date) {
    const dateString = formatDateString(date);
    const classes = classEvents.filter(event => event.date === dateString);
    displayClasses(classes);
}

// 특정 월의 이벤트 가져오기
function getEventsForMonth(date) {
    const year = date.getFullYear();
    const month = date.getMonth();
    
    return classEvents.filter(event => {
        const eventDate = new Date(event.date);
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
    });
}

// 클래스 목록 표시
function displayClasses(classes) {
    const classesList = document.getElementById('classes-list');
    
    if (classes.length === 0) {
        // 날짜별 카드 클래스 확인
        const dateString = formatDateString(new Date());
        const cardClassIds = classSchedule[dateString];
        
        if (cardClassIds && cardClassIds.length > 0) {
            let html = '<p class="no-classes">이 날짜의 클래스는 아래 카드에서 확인하세요:</p>';
            html += '<div class="calendar-class-links">';
            
            cardClassIds.forEach(classId => {
                const classData = classDetails[classId];
                if (classData) {
                    html += `
                        <button class="calendar-link-btn" onclick="scrollToClassCard('${classId}')">
                            ${classData.title} 보러가기
                        </button>
                    `;
                }
            });
            
            html += '</div>';
            classesList.innerHTML = html;
        } else {
            classesList.innerHTML = '<p class="no-classes">선택한 날짜에 예정된 클래스가 없습니다.</p>';
        }
        return;
    }
    
    let html = '';
    classes.forEach(classItem => {
        const isFull = classItem.currentParticipants >= classItem.maxParticipants;
        // 각 클래스에 해당하는 카드 ID 찾기
        let cardId = '';
        for (const [key, value] of Object.entries(classDetails)) {
            if (value.title === classItem.title) {
                cardId = key;
                break;
            }
        }
        
        html += `
            <div class="class-card ${isFull ? 'full' : ''}" onclick="scrollToClassCard('${cardId}')" style="cursor: pointer;">
                <div class="class-header">
                    <h4 class="class-title">${classItem.title}</h4>
                    <span class="class-price">${formatPrice(classItem.price)}</span>
                </div>
                <div class="class-instructor">
                    <span>👨‍🏫 ${classItem.instructor}</span>
                </div>
                <div class="class-details">
                    <p class="class-detail">⏰ ${classItem.time}</p>
                    <p class="class-detail">📍 ${classItem.location}</p>
                </div>
                <div class="class-features">
                    ${classItem.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
                </div>
                <div class="class-footer">
                    <span class="participants-count">
                        신청: ${classItem.currentParticipants}/${classItem.maxParticipants}명
                    </span>
                    <span class="class-status ${isFull ? 'status-full' : ''}">
                        ${isFull ? '마감' : '신청 가능'}
                    </span>
                </div>
            </div>
        `;
    });
    
    classesList.innerHTML = html;
}

// 특정 클래스 카드로 스크롤
function scrollToClassCard(classId) {
    const card = document.querySelector(`[data-id="${classId}"]`);
    if (card) {
        scrollToCard(card);
        card.classList.add('highlight');
        setTimeout(() => {
            card.classList.remove('highlight');
        }, 2000);
    }
}

// 클래스 상세 정보 표시
function showClassDetails(classId) {
    const classItem = classEvents.find(c => c.id === classId);
    if (!classItem) return;
    
    selectedClass = classItem;
    
    // 모달에 정보 입력
    document.getElementById('modal-title').textContent = classItem.title;
    document.getElementById('modal-date').textContent = formatDate(new Date(classItem.date));
    document.getElementById('modal-time').textContent = classItem.time;
    document.getElementById('modal-location').textContent = classItem.location;
    document.getElementById('modal-price').textContent = formatPrice(classItem.price);
    document.getElementById('modal-instructor').textContent = classItem.instructor;
    document.getElementById('modal-participants').textContent = `${classItem.currentParticipants}/${classItem.maxParticipants}명`;
    document.getElementById('modal-description').textContent = classItem.description;
    document.getElementById('modal-materials').textContent = classItem.materials;
    document.getElementById('modal-account').textContent = classItem.bankAccount;
    document.getElementById('modal-chat').href = classItem.openChatLink;
    
    // 모달 표시
    document.getElementById('modal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('modal').style.display = 'none';
    selectedClass = null;
}

// 클래스 신청
function applyForClass() {
    if (!selectedClass) return;
    
    alert(`${selectedClass.title} 신청이 완료되었습니다!\n\n` +
          `수강료: ${formatPrice(selectedClass.price)}\n` +
          `결제 정보: ${selectedClass.bankAccount}\n` +
          `입금 후 오픈채팅으로 연락 부탁드립니다.`);
    
    closeModal();
}

// 날짜 문자열 포맷
function formatDateString(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
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
            closeClassDetailModal();
        }
    });
});

// 더보기 기능
function toggleMoreClasses() {
    const moreClasses = document.querySelectorAll('.more-classes');
    const moreButtonText = document.getElementById('moreButtonText');
    const moreIcon = document.getElementById('moreIcon');
    
    moreClasses.forEach(card => {
        if (card.style.display === 'none') {
            card.style.display = 'block';
        } else {
            card.style.display = 'none';
        }
    });
    
    if (moreButtonText.textContent === '더보기') {
        moreButtonText.textContent = '접기';
        moreIcon.style.transform = 'rotate(180deg)';
    } else {
        moreButtonText.textContent = '더보기';
        moreIcon.style.transform = 'rotate(0deg)';
    }
}

// 클래스 상세 데이터
const classDetails = {
    'excel-basic': {
        title: 'Excel 기초 마스터',
        image: 'https://images.pexels.com/photos/669615/pexels-photo-669615.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '50,000원',
        duration: '2시간',
        level: '초급',
        capacity: '8명',
        instructor: '김엑셀 (대기업 데이터분석팀 5년차)',
        description: '엑셀의 기본 기능부터 실무에서 자주 사용하는 함수와 기능들을 체계적으로 학습합니다. 단순 암기가 아닌 실제 업무 상황을 가정한 실습을 통해 즉시 활용 가능한 스킬을 익힙니다.',
        curriculum: [
            '엑셀 인터페이스와 기본 조작법',
            '데이터 입력과 서식 지정',
            '필수 함수 (SUM, AVERAGE, IF, VLOOKUP)',
            '데이터 정렬과 필터링',
            '피벗테이블 기초',
            '실무 예제 실습'
        ],
        target: [
            '엑셀을 처음 배우시는 분',
            '업무에서 엑셀을 사용하지만 기초가 부족하신 분',
            '체계적으로 엑셀을 배우고 싶으신 분'
        ]
    },
    'ppt-design': {
        title: 'PPT 디자인 실무',
        image: 'https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '60,000원',
        duration: '3시간',
        level: '중급',
        capacity: '6명',
        instructor: '박프레젠 (대기업 기획팀 7년차)',
        description: '단순한 슬라이드 제작을 넘어 메시지를 효과적으로 전달하는 프레젠테이션 디자인 스킬을 배웁니다. 실제 업무에서 사용할 수 있는 템플릿과 디자인 팁을 제공합니다.',
        curriculum: [
            'PPT 디자인의 기본 원칙',
            '색상과 폰트 활용법',
            '도형과 아이콘 활용',
            '인포그래픽 제작',
            '애니메이션과 전환 효과',
            '실무 템플릿 제작 실습'
        ],
        target: [
            '보고서와 제안서를 자주 작성하시는 분',
            'PPT 디자인 스킬을 향상시키고 싶으신 분',
            '효과적인 프레젠테이션을 만들고 싶으신 분'
        ]
    },
    'data-analysis': {
        title: '데이터 분석 입문',
        image: 'https://images.pexels.com/photos/265087/pexels-photo-265087.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '80,000원',
        duration: '4시간',
        level: '초중급',
        capacity: '6명',
        instructor: '이데이터 (IT기업 데이터사이언티스트)',
        description: 'Python과 Excel을 활용한 실무 데이터 분석의 기초를 배웁니다. 프로그래밍 경험이 없어도 따라할 수 있도록 구성되어 있습니다.',
        curriculum: [
            '데이터 분석 개요와 프로세스',
            'Python 기초 (변수, 리스트, 반복문)',
            'Pandas를 활용한 데이터 처리',
            '데이터 시각화 기초',
            'Excel과 Python 연동',
            '실무 데이터 분석 프로젝트'
        ],
        target: [
            '데이터 분석을 시작하고 싶으신 분',
            '업무 자동화에 관심이 있으신 분',
            'Python을 실무에 활용하고 싶으신 분'
        ]
    },
    'notion-workspace': {
        title: 'Notion 업무 활용법',
        image: 'https://images.pexels.com/photos/5717546/pexels-photo-5717546.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '45,000원',
        duration: '2시간',
        level: '초급',
        capacity: '10명',
        instructor: '최노션 (스타트업 PM)',
        description: 'Notion을 활용한 개인 및 팀 업무 관리 방법을 배웁니다. 실제 템플릿을 제공하여 바로 활용할 수 있습니다.',
        curriculum: [
            'Notion 기본 개념과 구조',
            '개인 업무 관리 시스템 구축',
            '데이터베이스 활용법',
            '팀 협업 워크스페이스 구성',
            '자동화와 연동 기능',
            '실무 템플릿 커스터마이징'
        ],
        target: [
            '효율적인 업무 관리 도구를 찾으시는 분',
            '팀 협업 도구를 도입하고 싶으신 분',
            '생산성을 높이고 싶으신 분'
        ]
    },
    'ai-tools': {
        title: 'AI 도구 활용법',
        image: 'https://images.pexels.com/photos/8438918/pexels-photo-8438918.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '70,000원',
        duration: '3시간',
        level: '초중급',
        capacity: '8명',
        instructor: '김에이아이 (AI 스타트업 대표)',
        description: 'ChatGPT, Claude, Midjourney 등 다양한 AI 도구를 업무에 활용하는 방법을 배웁니다. 실제 업무 사례를 통해 실습합니다.',
        curriculum: [
            'AI 도구의 이해와 선택',
            'ChatGPT 프롬프트 엔지니어링',
            '업무 자동화 활용 사례',
            'AI를 활용한 콘텐츠 제작',
            '이미지 생성 AI 활용법',
            'AI 도구 통합 워크플로우'
        ],
        target: [
            'AI 도구를 업무에 활용하고 싶으신 분',
            '업무 효율성을 높이고 싶으신 분',
            '최신 기술 트렌드를 따라가고 싶으신 분'
        ]
    },
    'project-management': {
        title: '프로젝트 관리 기초',
        image: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '65,000원',
        duration: '3시간',
        level: '중급',
        capacity: '8명',
        instructor: '정프로젝트 (대기업 PMO 10년차)',
        description: '체계적인 프로젝트 관리 방법론과 실무 도구 활용법을 배웁니다. 애자일과 워터폴 방법론을 모두 다룹니다.',
        curriculum: [
            '프로젝트 관리 개요',
            '프로젝트 계획 수립',
            '리스크 관리와 이슈 트래킹',
            '애자일 vs 워터폴 방법론',
            '프로젝트 관리 도구 활용',
            '실무 케이스 스터디'
        ],
        target: [
            '프로젝트 관리 역량을 키우고 싶으신 분',
            '팀 리더나 PM을 준비하시는 분',
            '체계적인 업무 관리를 원하시는 분'
        ]
    },
    'sql-basic': {
        title: 'SQL 기초 마스터',
        image: 'https://images.pexels.com/photos/1181677/pexels-photo-1181677.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '55,000원',
        duration: '3시간',
        level: '초급',
        capacity: '8명',
        instructor: '이디비 (데이터베이스 전문가)',
        description: '데이터베이스 조회와 분석을 위한 SQL 기초 문법을 마스터합니다. 실습 위주로 진행되며 즉시 활용 가능한 쿼리를 학습합니다.',
        curriculum: [
            'SQL 기본 개념과 데이터베이스 이해',
            'SELECT 문과 조건절 활용',
            'JOIN으로 테이블 연결하기',
            '그룹화와 집계 함수',
            '서브쿼리 활용법',
            '실무 쿼리 작성 실습'
        ],
        target: [
            'SQL을 처음 배우시는 분',
            '데이터 분석 업무를 시작하시는 분',
            '체계적으로 SQL을 학습하고 싶으신 분'
        ]
    },
    'git-github': {
        title: 'Git & GitHub 입문',
        image: 'https://images.pexels.com/photos/546819/pexels-photo-546819.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '60,000원',
        duration: '3시간',
        level: '초급',
        capacity: '8명',
        instructor: '김깃헙 (오픈소스 컨트리뷰터)',
        description: '개발 협업의 필수 도구인 Git과 GitHub 사용법을 배웁니다. 버전 관리부터 협업 워크플로우까지 실습합니다.',
        curriculum: [
            'Git 기본 개념과 설치',
            '로컬 저장소 관리 (add, commit, push)',
            '브랜치 전략과 머지',
            'GitHub 원격 저장소 활용',
            'Pull Request와 코드 리뷰',
            '협업 워크플로우 실습'
        ],
        target: [
            '버전 관리를 시작하고 싶으신 분',
            '개발 협업 도구를 배우고 싶으신 분',
            'GitHub를 활용하고 싶으신 분'
        ]
    },
    'figma-design': {
        title: 'Figma UI/UX 디자인',
        image: 'https://images.pexels.com/photos/3888151/pexels-photo-3888151.jpeg?auto=compress&cs=tinysrgb&w=800',
        price: '75,000원',
        duration: '4시간',
        level: '초중급',
        capacity: '6명',
        instructor: '박디자인 (UI/UX 디자이너)',
        description: '실무에서 가장 많이 사용하는 Figma를 활용한 UI/UX 디자인을 배웁니다. 프로토타입 제작까지 실습합니다.',
        curriculum: [
            'Figma 인터페이스와 기본 도구',
            '컴포넌트와 스타일 시스템',
            '반응형 디자인 구현',
            '프로토타입 제작',
            '디자인 시스템 구축',
            '개발자와의 협업 방법'
        ],
        target: [
            'UI/UX 디자인을 시작하시는 분',
            'Figma를 체계적으로 배우고 싶으신 분',
            '디자인 협업 도구를 익히고 싶으신 분'
        ]
    }
};

// 클래스 상세 보기 함수
function showClassDetail(classId) {
    const detail = classDetails[classId];
    if (!detail) return;
    
    // 모달 내용 채우기
    document.getElementById('detail-modal-title').textContent = detail.title;
    document.getElementById('detail-image').src = detail.image;
    document.getElementById('detail-price').textContent = detail.price;
    document.getElementById('detail-duration').textContent = detail.duration;
    document.getElementById('detail-level').textContent = detail.level;
    document.getElementById('detail-capacity').textContent = detail.capacity;
    document.getElementById('detail-instructor').textContent = detail.instructor;
    document.getElementById('detail-description').textContent = detail.description;
    
    // 커리큘럼 리스트
    const curriculumList = document.getElementById('detail-curriculum');
    curriculumList.innerHTML = '';
    detail.curriculum.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        curriculumList.appendChild(li);
    });
    
    // 대상 리스트
    const targetList = document.getElementById('detail-target');
    targetList.innerHTML = '';
    detail.target.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        targetList.appendChild(li);
    });
    
    // 현재 선택된 클래스 ID 저장
    window.currentDetailClassId = classId;
    
    // 모달 표시
    document.getElementById('class-detail-modal').style.display = 'block';
}

// 클래스 상세 모달 닫기
function closeClassDetailModal() {
    document.getElementById('class-detail-modal').style.display = 'none';
    window.currentDetailClassId = null;
}

// 상세 모달에서 신청하기
function applyForDetailClass() {
    if (window.currentDetailClassId) {
        alert('클래스 신청이 완료되었습니다!\n자세한 일정은 캘린더에서 확인하실 수 있습니다.');
        closeClassDetailModal();
    }
}

// 카테고리별 필터링
function filterByCategory(category) {
    // 버튼 활성화 상태 변경
    const buttons = document.querySelectorAll('.category-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    // 카드 필터링
    const cards = document.querySelectorAll('.class-item-card');
    cards.forEach(card => {
        const cardCategory = card.getAttribute('data-category');
        
        if (category === 'all' || cardCategory === category) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// 카드로 스크롤 이동
function scrollToCard(card) {
    // 더보기로 숨겨진 카드인 경우 먼저 표시
    if (card.classList.contains('more-classes') && card.style.display === 'none') {
        toggleMoreClasses();
    }
    
    // 카드 위치로 스크롤
    card.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });
}

// 날짜별 클래스 데이터 (카드와 연동용)
const classSchedule = {
    '2025-02-15': ['excel-basic'],
    '2025-02-20': ['ppt-design'],
    '2025-03-01': ['data-analysis'],
    '2025-01-25': ['notion-workspace'],
    '2025-02-10': ['ai-tools'],
    '2025-03-05': ['project-management'],
    '2025-02-25': ['sql-basic'],
    '2025-03-10': ['git-github'],
    '2025-01-20': ['figma-design']
};

// 클래스 등록 모달 표시
function showAddClassModal() {
    document.getElementById('add-class-modal').style.display = 'flex';
}

// 클래스 등록 모달 닫기
function closeAddClassModal() {
    document.getElementById('add-class-modal').style.display = 'none';
    document.getElementById('addClassForm').reset();
}

// 페이지 로드 시 관리자 버튼 표시
document.addEventListener('DOMContentLoaded', function() {
    const user = getCurrentUser();
    const addClassBtn = document.getElementById('addClassBtn');
    
    if (user && user.isAdmin && addClassBtn) {
        addClassBtn.style.display = 'flex';
    }
    
    // 클래스 등록 폼 제출 처리
    const addClassForm = document.getElementById('addClassForm');
    if (addClassForm) {
        addClassForm.addEventListener('submit', handleClassSubmit);
    }
});

// 클래스 등록 처리
function handleClassSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const classData = {
        id: 'custom-' + Date.now(),
        title: formData.get('title'),
        category: formData.get('category'),
        date: formData.get('date'),
        time: formData.get('time'),
        duration: formData.get('duration'),
        price: parseInt(formData.get('price')),
        capacity: parseInt(formData.get('capacity')),
        level: formData.get('level'),
        location: formData.get('location'),
        instructor: formData.get('instructor'),
        imageUrl: formData.get('imageUrl') || 'https://images.pexels.com/photos/3184325/pexels-photo-3184325.jpeg?auto=compress&cs=tinysrgb&w=800',
        shortDescription: formData.get('shortDescription'),
        description: formData.get('description'),
        instructorInfo: formData.get('instructorInfo'),
        curriculum: formData.get('curriculum').split('\n').filter(item => item.trim()),
        target: formData.get('target').split('\n').filter(item => item.trim()),
        materials: formData.get('materials') || '준비물 없음',
        status: 'recruiting',
        currentParticipants: 0
    };
    
    // localStorage에서 기존 클래스 데이터 가져오기
    const savedClasses = JSON.parse(localStorage.getItem('customClasses') || '[]');
    savedClasses.push(classData);
    localStorage.setItem('customClasses', JSON.stringify(savedClasses));
    
    // 클래스 카드 동적 추가
    addClassCard(classData);
    
    alert('클래스가 성공적으로 등록되었습니다!');
    closeAddClassModal();
}

// 클래스 카드 동적 추가
function addClassCard(classData) {
    const classesGrid = document.getElementById('classesGrid');
    
    const cardHTML = `
        <div class="class-item-card" data-category="${classData.status}" data-date="${classData.date}" data-id="${classData.id}" onclick="showCustomClassDetail('${classData.id}')">
            <div class="class-item-image">
                <img src="${classData.imageUrl}" alt="${classData.title}">
                <span class="class-badge new">신규</span>
                <span class="status-badge ${classData.status}">${classData.status === 'recruiting' ? '모집중' : '모집예정'}</span>
            </div>
            <div class="class-item-content">
                <h4 class="class-item-title">${classData.title}</h4>
                <p class="class-item-description">${classData.shortDescription}</p>
                <div class="class-item-info">
                    <span class="class-item-price">${classData.price.toLocaleString()}원</span>
                    <span class="class-item-duration">${classData.duration}</span>
                </div>
            </div>
        </div>
    `;
    
    // 더보기 버튼 앞에 추가
    const moreButtonContainer = document.querySelector('.more-button-container');
    const newCard = document.createElement('div');
    newCard.innerHTML = cardHTML;
    classesGrid.insertBefore(newCard.firstElementChild, moreButtonContainer);
}

// 커스텀 클래스 상세 보기
function showCustomClassDetail(classId) {
    const savedClasses = JSON.parse(localStorage.getItem('customClasses') || '[]');
    const classData = savedClasses.find(c => c.id === classId);
    
    if (!classData) {
        showClassDetail(classId);
        return;
    }
    
    // 모달 내용 채우기
    document.getElementById('detail-modal-title').textContent = classData.title;
    document.getElementById('detail-image').src = classData.imageUrl;
    document.getElementById('detail-price').textContent = classData.price.toLocaleString() + '원';
    document.getElementById('detail-duration').textContent = classData.duration;
    document.getElementById('detail-level').textContent = classData.level;
    document.getElementById('detail-capacity').textContent = classData.capacity + '명';
    document.getElementById('detail-instructor').textContent = classData.instructorInfo;
    document.getElementById('detail-description').textContent = classData.description;
    
    // 커리큘럼 리스트
    const curriculumList = document.getElementById('detail-curriculum');
    curriculumList.innerHTML = '';
    classData.curriculum.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        curriculumList.appendChild(li);
    });
    
    // 대상 리스트
    const targetList = document.getElementById('detail-target');
    targetList.innerHTML = '';
    classData.target.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        targetList.appendChild(li);
    });
    
    window.currentDetailClassId = classId;
    document.getElementById('class-detail-modal').style.display = 'block';
}

// 페이지 로드 시 저장된 클래스 불러오기
document.addEventListener('DOMContentLoaded', function() {
    const savedClasses = JSON.parse(localStorage.getItem('customClasses') || '[]');
    savedClasses.forEach(classData => {
        addClassCard(classData);
    });
});