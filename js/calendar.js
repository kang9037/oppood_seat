// 캘린더 JavaScript
let currentDate = new Date();
let selectedDate = null;

// 캘린더 초기화
document.addEventListener('DOMContentLoaded', function() {
    initCalendar();
});

function initCalendar() {
    renderCalendar();
    
    // 이벤트 있는 날짜 표시
    if (typeof getEventsForMonth === 'function') {
        const events = getEventsForMonth(currentDate);
        markEventDates(events);
    }
}

function renderCalendar() {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const prevLastDay = new Date(year, month, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDate = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    const calendar = document.getElementById('calendar');
    if (!calendar) return;
    
    // 캘린더 HTML 생성
    let html = `
        <div class="calendar-header">
            <button class="calendar-nav" onclick="previousMonth()">‹</button>
            <div class="calendar-title">${year}년 ${month + 1}월</div>
            <button class="calendar-nav" onclick="nextMonth()">›</button>
        </div>
        <div class="calendar-grid">
    `;
    
    // 요일 헤더
    const weekdays = ['일', '월', '화', '수', '목', '금', '토'];
    weekdays.forEach(day => {
        html += `<div class="calendar-weekday">${day}</div>`;
    });
    
    // 이전 달 날짜
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
        const date = prevLastDate - i;
        html += `<div class="calendar-day other-month">${date}</div>`;
    }
    
    // 현재 달 날짜
    const today = new Date();
    for (let date = 1; date <= lastDate; date++) {
        const currentDateObj = new Date(year, month, date);
        const isToday = currentDateObj.toDateString() === today.toDateString();
        const isSelected = selectedDate && currentDateObj.toDateString() === selectedDate.toDateString();
        
        let className = 'calendar-day';
        if (isToday) className += ' today';
        if (isSelected) className += ' selected';
        
        html += `
            <div class="${className}" onclick="selectDate(${year}, ${month}, ${date})">
                <span class="calendar-day-number">${date}</span>
                <div class="calendar-events" id="events-${year}-${month}-${date}"></div>
            </div>
        `;
    }
    
    // 다음 달 날짜
    const remainingDays = 42 - (firstDayOfWeek + lastDate);
    for (let date = 1; date <= remainingDays; date++) {
        html += `<div class="calendar-day other-month">${date}</div>`;
    }
    
    html += '</div>';
    calendar.innerHTML = html;
}

function previousMonth() {
    currentDate.setMonth(currentDate.getMonth() - 1);
    renderCalendar();
    
    if (typeof getEventsForMonth === 'function') {
        const events = getEventsForMonth(currentDate);
        markEventDates(events);
    }
}

function nextMonth() {
    currentDate.setMonth(currentDate.getMonth() + 1);
    renderCalendar();
    
    if (typeof getEventsForMonth === 'function') {
        const events = getEventsForMonth(currentDate);
        markEventDates(events);
    }
}

function selectDate(year, month, date) {
    selectedDate = new Date(year, month, date);
    renderCalendar();
    
    // 날짜 선택 이벤트 발생
    if (typeof onDateSelected === 'function') {
        onDateSelected(selectedDate);
    }
    
    if (typeof getEventsForMonth === 'function') {
        const events = getEventsForMonth(currentDate);
        markEventDates(events);
    }
}

function markEventDates(events) {
    events.forEach(event => {
        const eventDate = new Date(event.date);
        const year = eventDate.getFullYear();
        const month = eventDate.getMonth();
        const date = eventDate.getDate();
        
        const eventsContainer = document.getElementById(`events-${year}-${month}-${date}`);
        if (eventsContainer) {
            const dot = document.createElement('div');
            dot.className = 'event-dot ' + (event.type || 'meeting');
            eventsContainer.appendChild(dot);
        }
    });
}