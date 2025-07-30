// 전역 변수
let settlements = [];

document.addEventListener('DOMContentLoaded', function() {
    // 관리자 권한 체크
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
    console.log('Current user:', currentUser);
    
    if (!currentUser.isAdmin && currentUser.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        window.location.href = 'index.html';
        return;
    }

    // 로컬 스토리지에서 정산 데이터 로드
    loadSettlements();

    // 이벤트 리스너
    document.getElementById('createSettlementBtn').addEventListener('click', openModal);
    document.getElementById('viewListBtn').addEventListener('click', goToListPage);
    document.getElementById('settlementForm').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);
    document.querySelector('.close').addEventListener('click', closeModal);

    // 모달 외부 클릭 시 닫기
    window.onclick = function(event) {
        const settlementModal = document.getElementById('settlementModal');
        if (event.target == settlementModal) {
            closeModal();
        }
    }

    // 참여자 명단 입력 시 인원수 자동 업데이트
    document.getElementById('participantNames').addEventListener('input', updateParticipantCount);

    // 선택된 정산 ID가 있는지 확인
    const selectedSettlementId = sessionStorage.getItem('selectedSettlementId');
    if (selectedSettlementId) {
        // 특정 정산 표시
        sessionStorage.removeItem('selectedSettlementId');
        renderSingleSettlement(selectedSettlementId);
    } else {
        // 초기 렌더링
        renderSettlements();
    }
});

function loadSettlements() {
    const saved = localStorage.getItem('settlements');
    if (saved) {
        settlements = JSON.parse(saved);
    }
}

function saveSettlements() {
    localStorage.setItem('settlements', JSON.stringify(settlements));
}

function renderSettlements() {
    const settlementList = document.getElementById('settlementList');
    settlementList.innerHTML = '';

    if (settlements.length === 0) {
        settlementList.innerHTML = `
            <div class="empty-state">
                <p>아직 생성된 정산이 없습니다.</p>
                <p>"정산 테이블 만들기" 버튼을 눌러 시작하세요.</p>
            </div>
        `;
        return;
    }

    settlements.forEach(settlement => {
        const card = createSettlementCard(settlement);
        settlementList.appendChild(card);
    });
}

function createSettlementCard(settlement) {
    const card = document.createElement('div');
    card.className = 'settlement-card';
    
    const settledCount = settlement.participants.filter(p => p.isSettled).length;
    const totalCount = settlement.participants.length;
    const perPersonAmount = Math.ceil(settlement.totalAmount / totalCount);
    
    card.innerHTML = `
        <div class="card-header">
            <div>
                <h3>${settlement.title}</h3>
                <div class="card-actions">
                    <button class="btn btn-sm btn-success" onclick="exportToExcel('${settlement.id}')">엑셀 다운로드</button>
                    <button class="btn btn-sm btn-danger" onclick="deleteSettlement('${settlement.id}')">삭제</button>
                </div>
            </div>
        </div>
        <div class="card-info">
            <div class="info-item">
                <span class="label">전체 정산금액:</span>
                <span class="value">₩${settlement.totalAmount.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">참여 인원:</span>
                <span class="value">${totalCount}명</span>
            </div>
            <div class="info-item">
                <span class="label">1인당 금액:</span>
                <span class="value">₩${perPersonAmount.toLocaleString()}</span>
            </div>
            <div class="info-item">
                <span class="label">정산 완료:</span>
                <span class="value ${settledCount === totalCount ? 'complete' : ''}">${settledCount}/${totalCount}명</span>
            </div>
        </div>
        <div class="participant-table-container">
            <table class="participant-table">
                <thead>
                    <tr>
                        <th width="50">연번</th>
                        <th width="150">사람명</th>
                        <th width="120">정산금액</th>
                        <th width="100">정산여부</th>
                    </tr>
                </thead>
                <tbody>
                    ${settlement.participants.map((participant, index) => `
                        <tr>
                            <td class="text-center">${index + 1}</td>
                            <td>${participant.name}</td>
                            <td class="text-right">₩${perPersonAmount.toLocaleString()}</td>
                            <td class="text-center">
                                <input type="checkbox" 
                                       ${participant.isSettled ? 'checked' : ''} 
                                       onchange="toggleSettlement('${settlement.id}', ${index})">
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        <div class="card-footer">
            <small>생성일: ${new Date(settlement.createdAt).toLocaleDateString()}</small>
        </div>
    `;
    
    return card;
}

function openModal() {
    document.getElementById('settlementForm').reset();
    document.getElementById('settlementModal').style.display = 'block';
}

function closeModal() {
    document.getElementById('settlementModal').style.display = 'none';
    document.getElementById('settlementForm').reset();
}

function updateParticipantCount() {
    const names = document.getElementById('participantNames').value;
    const participants = names.split(',').map(name => name.trim()).filter(name => name);
    document.getElementById('participantCount').value = participants.length;
}

function handleFormSubmit(e) {
    e.preventDefault();
    
    const title = document.getElementById('settlementTitle').value;
    const totalAmount = parseInt(document.getElementById('totalAmount').value);
    const participantNames = document.getElementById('participantNames').value;
    
    const participants = participantNames.split(',')
        .map(name => name.trim())
        .filter(name => name)
        .map(name => ({
            name: name,
            isSettled: false
        }));
    
    if (participants.length === 0) {
        alert('참여자를 입력해주세요.');
        return;
    }
    
    const newSettlement = {
        id: Date.now().toString(),
        title: title,
        totalAmount: totalAmount,
        participants: participants,
        createdAt: new Date().toISOString()
    };
    
    settlements.unshift(newSettlement); // 최신 정산을 앞에 추가
    saveSettlements();
    renderSettlements();
    closeModal();
}

function toggleSettlement(settlementId, participantIndex) {
    const settlement = settlements.find(s => s.id === settlementId);
    if (settlement) {
        settlement.participants[participantIndex].isSettled = 
            !settlement.participants[participantIndex].isSettled;
        saveSettlements();
        renderSettlements();
    }
}

function deleteSettlement(settlementId) {
    if (confirm('이 정산을 삭제하시겠습니까?')) {
        settlements = settlements.filter(s => s.id !== settlementId);
        saveSettlements();
        renderSettlements();
    }
}

function exportToExcel(settlementId) {
    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement) return;
    
    const perPersonAmount = Math.ceil(settlement.totalAmount / settlement.participants.length);
    
    // 엑셀 데이터 준비
    const excelData = settlement.participants.map((participant, index) => ({
        '연번': index + 1,
        '사람명': participant.name,
        '정산금액': perPersonAmount,
        '정산여부': participant.isSettled ? 'O' : 'X'
    }));
    
    // 요약 정보 추가
    excelData.push({});
    excelData.push({
        '연번': '',
        '사람명': '전체 정산금액',
        '정산금액': settlement.totalAmount,
        '정산여부': ''
    });
    excelData.push({
        '연번': '',
        '사람명': '참여 인원',
        '정산금액': settlement.participants.length + '명',
        '정산여부': ''
    });
    excelData.push({
        '연번': '',
        '사람명': '1인당 금액',
        '정산금액': perPersonAmount,
        '정산여부': ''
    });
    
    const settledCount = settlement.participants.filter(p => p.isSettled).length;
    excelData.push({
        '연번': '',
        '사람명': '정산 완료',
        '정산금액': `${settledCount}/${settlement.participants.length}명`,
        '정산여부': ''
    });
    
    // 워크시트 생성
    const ws = XLSX.utils.json_to_sheet(excelData);
    
    // 워크북 생성
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '정산');
    
    // 파일명 생성
    const filename = `${settlement.title}_정산.xlsx`;
    
    // 다운로드
    XLSX.writeFile(wb, filename);
}

// 목록 페이지로 이동
function goToListPage() {
    window.location.href = 'settlement-list.html';
}

// 특정 정산만 렌더링
function renderSingleSettlement(settlementId) {
    const settlement = settlements.find(s => s.id === settlementId);
    if (!settlement) {
        renderSettlements();
        return;
    }

    const settlementList = document.getElementById('settlementList');
    settlementList.innerHTML = '';
    
    const card = createSettlementCard(settlement);
    settlementList.appendChild(card);
    
    // 하이라이트 효과
    setTimeout(() => {
        card.style.transition = 'all 0.3s ease';
        card.style.boxShadow = '0 0 20px rgba(0, 123, 255, 0.5)';
        setTimeout(() => {
            card.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
        }, 2000);
    }, 100);
}

// window 객체에 함수 등록 (인라인 이벤트 핸들러용)
window.toggleSettlement = toggleSettlement;
window.deleteSettlement = deleteSettlement;
window.exportToExcel = exportToExcel;