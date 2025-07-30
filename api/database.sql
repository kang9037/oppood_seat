-- 부산 검증된 직장인 데이터베이스 스키마

CREATE DATABASE IF NOT EXISTS busan_workers DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE busan_workers;

-- 이벤트 테이블
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price INT DEFAULT 0,
    current_participants INT DEFAULT 0,
    max_participants INT NOT NULL,
    description TEXT,
    type ENUM('meeting', 'class') NOT NULL,
    instructor VARCHAR(255),
    materials TEXT,
    bank_account VARCHAR(255),
    open_chat_link VARCHAR(255),
    features JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 신청 테이블
CREATE TABLE IF NOT EXISTS applications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_id INT NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    status ENUM('pending', 'confirmed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE KEY unique_application (event_id, email),
    INDEX idx_event_id (event_id),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 샘플 데이터 삽입
INSERT INTO events (title, date, time, location, price, max_participants, description, type, bank_account, open_chat_link) VALUES
('부산 직장인 네트워킹 모임', '2025-01-25', '19:00 - 21:00', '서면 스타벅스 2층', 10000, 20, 
 '부산 지역 직장인들이 모여 네트워킹하는 모임입니다. 편안한 분위기에서 다양한 분야의 사람들과 교류할 수 있습니다.', 
 'meeting', '카카오뱅크 3333-01-1234567', 'https://open.kakao.com/busan-networking'),

('독서 토론 모임', '2025-01-28', '19:30 - 21:30', '센텀시티 교보문고 카페', 5000, 15,
 '이번 달 선정 도서 \'아몬드\'를 읽고 함께 토론하는 시간입니다. 책을 읽고 오시면 더욱 풍성한 대화를 나눌 수 있습니다.',
 'meeting', '국민은행 123-456-789012', 'https://open.kakao.com/busan-bookclub'),

('주말 등산 모임', '2025-02-01', '08:00 - 12:00', '금정산 입구', 0, 15,
 '금정산을 함께 오르며 건강도 챙기고 친목도 다지는 모임입니다. 등산 후 간단한 식사를 함께 합니다.',
 'meeting', '무료 모임', 'https://open.kakao.com/busan-hiking');

INSERT INTO events (title, date, time, location, price, max_participants, description, type, instructor, materials, features, bank_account, open_chat_link) VALUES
('실무 엑셀 마스터 클래스', '2025-01-30', '19:00 - 21:00', '부산 IT 교육센터', 50000, 15,
 '업무 효율을 높이는 엑셀 고급 기능을 배웁니다. VLOOKUP, 피벗테이블, 매크로 기초까지 실습 위주로 진행됩니다.',
 'class', '김엑셀 (마이크로소프트 공인강사)', '노트북 (엑셀 설치 필수), 필기도구',
 '["실습 위주", "1:1 피드백", "교재 제공"]', '카카오뱅크 3333-02-7654321', 'https://open.kakao.com/busan-excel'),

('프레젠테이션 스킬업', '2025-02-05', '19:30 - 21:30', '센텀 스타트업 파크', 40000, 12,
 '성공적인 비즈니스 프레젠테이션의 핵심 스킬을 배웁니다. 스토리텔링, 시각 자료 활용, 발표 기법을 실습합니다.',
 'class', '박프로 (기업 교육 전문가)', '노트북, 발표 자료 (선택사항)',
 '["소규모 정원", "실전 발표", "피드백 제공"]', '국민은행 987-654-321098', 'https://open.kakao.com/busan-presentation'),

('직장인 요리 클래스', '2025-02-08', '10:00 - 12:00', '해운대 쿠킹 스튜디오', 60000, 8,
 '바쁜 직장인을 위한 간편하고 건강한 요리법을 배웁니다. 일주일 도시락 만들기와 간편 저녁 메뉴를 실습합니다.',
 'class', '이셰프 (호텔 출신 요리사)', '앞치마 (재료는 제공됩니다)',
 '["재료 제공", "레시피북", "시식 포함"]', '신한은행 110-123-456789', 'https://open.kakao.com/busan-cooking');

-- 일부 이벤트에 참가자 추가
UPDATE events SET current_participants = 12 WHERE id = 1;
UPDATE events SET current_participants = 8 WHERE id = 2;
UPDATE events SET current_participants = 15 WHERE id = 3;
UPDATE events SET current_participants = 10 WHERE id = 4;
UPDATE events SET current_participants = 8 WHERE id = 5;
UPDATE events SET current_participants = 6 WHERE id = 6;