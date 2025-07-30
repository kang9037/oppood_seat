// Supabase를 사용한 API 통신 모듈
import { eventsAPI, applicationsAPI } from './supabase.js';

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

// 이벤트 목록 가져오기
async function fetchEvents(params = {}) {
    try {
        let events;
        
        if (params.type) {
            // 특정 타입의 이벤트 가져오기
            events = await eventsAPI.getEventsByType(params.type);
        } else if (params.date) {
            // 특정 날짜의 이벤트 가져오기
            events = await eventsAPI.getEventsByDate(params.date);
        } else {
            // 모든 이벤트 가져오기
            events = await eventsAPI.getAllEvents();
        }
        
        return { success: true, data: events };
    } catch (error) {
        console.error('이벤트 목록 가져오기 오류:', error);
        return { success: false, error: error.message };
    }
}

// 이벤트 신청하기
async function submitApplication(applicationData) {
    try {
        const result = await applicationsAPI.createApplication(applicationData);
        return { success: true, data: result };
    } catch (error) {
        console.error('신청 제출 오류:', error);
        return { success: false, error: error.message };
    }
}

// 이벤트 상세 정보 가져오기
async function getEventDetails(eventId) {
    try {
        const event = await eventsAPI.getEventById(eventId);
        return { success: true, data: event };
    } catch (error) {
        console.error('이벤트 상세 정보 가져오기 오류:', error);
        return { success: false, error: error.message };
    }
}

// 내 신청 목록 가져오기
async function getMyApplications(email) {
    try {
        const applications = await applicationsAPI.getApplicationsByEmail(email);
        return { success: true, data: applications };
    } catch (error) {
        console.error('신청 목록 가져오기 오류:', error);
        return { success: false, error: error.message };
    }
}

// 신청 취소하기
async function cancelApplication(applicationId) {
    try {
        const result = await applicationsAPI.cancelApplication(applicationId);
        return { success: true, data: result };
    } catch (error) {
        console.error('신청 취소 오류:', error);
        return { success: false, error: error.message };
    }
}

// Export 모든 API 함수들
export {
    fetchEvents,
    submitApplication,
    getEventDetails,
    getMyApplications,
    cancelApplication,
    formatDateForAPI,
    formatMonthForAPI
};