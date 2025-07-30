// 메인 페이지 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // 인기 모임 데이터 (실제로는 API에서 가져와야 함)
    const popularMeetings = [
        {
            title: '부산 카페 투어',
            category: '원데이 클래스',
            date: '2024.12.01',
            participants: '8/10명',
            image: 'images/meeting1.jpg'
        },
        {
            title: '해운대 러닝 모임',
            category: '번개모임',
            date: '2024.11.28',
            participants: '5/8명',
            image: 'images/meeting2.jpg'
        },
        {
            title: '요리 클래스',
            category: '원데이 클래스',
            date: '2024.12.03',
            participants: '12/15명',
            image: 'images/meeting3.jpg'
        }
    ];
    
    // 인기 모임 렌더링
    const meetingsGrid = document.getElementById('popularMeetings');
    
    if (meetingsGrid) {
        popularMeetings.forEach(meeting => {
            const meetingCard = createMeetingCard(meeting);
            meetingsGrid.appendChild(meetingCard);
        });
    }
    
    // 모임 카드 생성 함수
    function createMeetingCard(meeting) {
        const card = document.createElement('div');
        card.className = 'meeting-card';
        card.style.cssText = `
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
            transition: transform 0.3s ease;
            cursor: pointer;
        `;
        
        card.innerHTML = `
            <div class="meeting-image" style="height: 200px; background: #f0f0f0; display: flex; align-items: center; justify-content: center;">
                <span style="color: #999;">이미지 준비 중</span>
            </div>
            <div class="meeting-content" style="padding: 20px;">
                <span class="meeting-category" style="display: inline-block; padding: 4px 12px; background: #e8f5f3; color: #00B4A6; border-radius: 20px; font-size: 0.85rem; margin-bottom: 10px;">
                    ${meeting.category}
                </span>
                <h3 style="margin: 10px 0; font-size: 1.2rem; color: #333;">${meeting.title}</h3>
                <div class="meeting-info" style="color: #666; font-size: 0.95rem;">
                    <p style="margin: 5px 0;">📅 ${meeting.date}</p>
                    <p style="margin: 5px 0;">👥 ${meeting.participants}</p>
                </div>
            </div>
        `;
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
        
        card.addEventListener('click', function() {
            // 실제로는 상세 페이지로 이동
            alert('모임 상세 페이지로 이동합니다.');
        });
        
        return card;
    }
    
    // 애니메이션 효과
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // 애니메이션 적용
    document.querySelectorAll('.feature-card, .meeting-card').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});