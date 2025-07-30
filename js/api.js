// API 통신을 위한 공통 함수들

const API_BASE_URL = '/api'; // 실제 서버에서는 전체 URL로 변경

// API 호출 함수
async function apiCall(endpoint, options = {}) {
    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error || '요청 처리 중 오류가 발생했습니다.');
        }
        
        return data;
    } catch (error) {
        console.error('API 호출 오류:', error);
        throw error;
    }
}

// 이벤트 목록 가져오기
async function fetchEvents(params = {}) {
    const queryString = new URLSearchParams(params).toString();
    return await apiCall(`/events.php?${queryString}`);
}

// 이벤트 신청하기
async function submitApplication(applicationData) {
    return await apiCall('/applications.php', {
        method: 'POST',
        body: JSON.stringify(applicationData)
    });
}

// 날짜를 API 형식으로 변환
function formatDateForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 월을 API 형식으로 변환
function formatMonthForAPI(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
}