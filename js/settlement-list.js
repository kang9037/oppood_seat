// 전역 변수
let settlements = [];
let currentPage = 1;
const itemsPerPage = 10;

document.addEventListener('DOMContentLoaded', function() {
    // 관리자 권한 체크
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || sessionStorage.getItem('currentUser') || '{}');
    
    if (!currentUser.isAdmin && currentUser.role !== 'admin') {
        alert('관리자만 접근 가능합니다.');
        window.location.href = 'index.html';
        return;
    }

    // 로컬 스토리지에서 정산 데이터 로드
    loadSettlements();
    
    // 목록 렌더링
    renderSettlementList();
});

function loadSettlements() {
    const saved = localStorage.getItem('settlements');
    if (saved) {
        settlements = JSON.parse(saved);
    }
}

function renderSettlementList() {
    const tbody = document.getElementById('settlementTableBody');
    const emptyState = document.getElementById('emptyState');
    
    if (settlements.length === 0) {
        tbody.parentElement.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    tbody.parentElement.style.display = 'table';
    emptyState.style.display = 'none';
    
    // 페이지네이션 계산
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageSettlements = settlements.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    pageSettlements.forEach((settlement, index) => {
        const row = createTableRow(settlement, startIndex + index + 1);
        tbody.appendChild(row);
    });
    
    renderPagination();
}

function createTableRow(settlement, number) {
    const row = document.createElement('tr');
    
    const settledCount = settlement.participants.filter(p => p.isSettled).length;
    const totalCount = settlement.participants.length;
    const progressPercent = totalCount > 0 ? Math.round((settledCount / totalCount) * 100) : 0;
    const perPersonAmount = Math.ceil(settlement.totalAmount / totalCount);
    
    row.innerHTML = `
        <td class="text-center">${number}</td>
        <td class="title-cell" onclick="viewSettlement('${settlement.id}')">${settlement.title}</td>
        <td class="amount-cell text-right">₩${settlement.totalAmount.toLocaleString()}</td>
        <td class="text-center">${totalCount}명</td>
        <td>
            <div class="progress-cell">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${progressPercent}%"></div>
                </div>
                <span class="progress-text">${settledCount}/${totalCount}</span>
            </div>
        </td>
        <td class="text-center">${new Date(settlement.createdAt).toLocaleDateString()}</td>
        <td>
            <div class="action-buttons">
                <button class="btn btn-sm btn-info" onclick="viewSettlement('${settlement.id}')">보기</button>
            </div>
        </td>
    `;
    
    return row;
}

function renderPagination() {
    const pagination = document.getElementById('pagination');
    const totalPages = Math.ceil(settlements.length / itemsPerPage);
    
    if (totalPages <= 1) {
        pagination.style.display = 'none';
        return;
    }
    
    pagination.style.display = 'flex';
    pagination.innerHTML = '';
    
    // 이전 버튼
    const prevBtn = document.createElement('button');
    prevBtn.textContent = '이전';
    prevBtn.disabled = currentPage === 1;
    prevBtn.onclick = () => changePage(currentPage - 1);
    pagination.appendChild(prevBtn);
    
    // 페이지 번호들
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 2 && i <= currentPage + 2)) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = i === currentPage ? 'active' : '';
            pageBtn.onclick = () => changePage(i);
            pagination.appendChild(pageBtn);
        } else if (i === currentPage - 3 || i === currentPage + 3) {
            const dots = document.createElement('span');
            dots.textContent = '...';
            dots.style.padding = '0 0.5rem';
            pagination.appendChild(dots);
        }
    }
    
    // 다음 버튼
    const nextBtn = document.createElement('button');
    nextBtn.textContent = '다음';
    nextBtn.disabled = currentPage === totalPages;
    nextBtn.onclick = () => changePage(currentPage + 1);
    pagination.appendChild(nextBtn);
}

function changePage(page) {
    currentPage = page;
    renderSettlementList();
}

function viewSettlement(settlementId) {
    // 선택한 정산 ID를 세션 스토리지에 저장
    sessionStorage.setItem('selectedSettlementId', settlementId);
    // 정산 상세 페이지로 이동
    window.location.href = 'settlement.html';
}

// window 객체에 함수 등록
window.viewSettlement = viewSettlement;