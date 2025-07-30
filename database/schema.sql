-- Supabase 데이터베이스 스키마
-- 부산 검증된 직장인 커뮤니티

-- 이벤트 테이블 생성
CREATE TABLE IF NOT EXISTS events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    time VARCHAR(50) NOT NULL,
    location VARCHAR(255) NOT NULL,
    price INTEGER DEFAULT 0,
    current_participants INTEGER DEFAULT 0,
    max_participants INTEGER NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('meeting', 'class')),
    instructor VARCHAR(255),
    materials TEXT,
    bank_account VARCHAR(255),
    open_chat_link VARCHAR(255),
    features JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_type ON events(type);

-- updated_at 자동 업데이트를 위한 트리거 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 트리거 생성
CREATE TRIGGER update_events_updated_at BEFORE UPDATE ON events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 신청 테이블 생성
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    event_id INTEGER NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE,
    UNIQUE(event_id, email)
);

-- 인덱스 생성
CREATE INDEX idx_applications_event_id ON applications(event_id);
CREATE INDEX idx_applications_email ON applications(email);

-- RLS (Row Level Security) 활성화
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- events 테이블에 대한 정책
-- 모든 사용자가 이벤트를 읽을 수 있음
CREATE POLICY "Allow public read access on events" ON events
    FOR SELECT USING (true);

-- 인증된 사용자만 이벤트를 생성할 수 있음
CREATE POLICY "Allow authenticated users to create events" ON events
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 인증된 사용자만 이벤트를 업데이트할 수 있음
CREATE POLICY "Allow authenticated users to update events" ON events
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 인증된 사용자만 이벤트를 삭제할 수 있음
CREATE POLICY "Allow authenticated users to delete events" ON events
    FOR DELETE USING (auth.role() = 'authenticated');

-- applications 테이블에 대한 정책
-- 모든 사용자가 신청할 수 있음
CREATE POLICY "Allow public to create applications" ON applications
    FOR INSERT WITH CHECK (true);

-- 본인의 신청만 조회할 수 있음
CREATE POLICY "Users can view their own applications" ON applications
    FOR SELECT USING (email = auth.jwt() ->> 'email' OR auth.role() = 'authenticated');

-- 본인의 신청만 업데이트할 수 있음
CREATE POLICY "Users can update their own applications" ON applications
    FOR UPDATE USING (email = auth.jwt() ->> 'email');

-- 관리자만 모든 신청을 삭제할 수 있음
CREATE POLICY "Only admins can delete applications" ON applications
    FOR DELETE USING (auth.role() = 'authenticated');

-- 샘플 데이터 삽입
INSERT INTO events (title, date, time, location, price, max_participants, description, type, bank_account, open_chat_link, current_participants) VALUES
('부산 직장인 네트워킹 모임', '2025-01-25', '19:00 - 21:00', '서면 스타벅스 2층', 10000, 20, 
 '부산 지역 직장인들이 모여 네트워킹하는 모임입니다. 편안한 분위기에서 다양한 분야의 사람들과 교류할 수 있습니다.', 
 'meeting', '카카오뱅크 3333-01-1234567', 'https://open.kakao.com/busan-networking', 12),

('독서 토론 모임', '2025-01-28', '19:30 - 21:30', '센텀시티 교보문고 카페', 5000, 15,
 '이번 달 선정 도서 ''아몬드''를 읽고 함께 토론하는 시간입니다. 책을 읽고 오시면 더욱 풍성한 대화를 나눌 수 있습니다.',
 'meeting', '국민은행 123-456-789012', 'https://open.kakao.com/busan-bookclub', 8),

('주말 등산 모임', '2025-02-01', '08:00 - 12:00', '금정산 입구', 0, 15,
 '금정산을 함께 오르며 건강도 챙기고 친목도 다지는 모임입니다. 등산 후 간단한 식사를 함께 합니다.',
 'meeting', '무료 모임', 'https://open.kakao.com/busan-hiking', 15);

INSERT INTO events (title, date, time, location, price, max_participants, description, type, instructor, materials, features, bank_account, open_chat_link, current_participants) VALUES
('실무 엑셀 마스터 클래스', '2025-01-30', '19:00 - 21:00', '부산 IT 교육센터', 50000, 15,
 '업무 효율을 높이는 엑셀 고급 기능을 배웁니다. VLOOKUP, 피벗테이블, 매크로 기초까지 실습 위주로 진행됩니다.',
 'class', '김엑셀 (마이크로소프트 공인강사)', '노트북 (엑셀 설치 필수), 필기도구',
 '["실습 위주", "1:1 피드백", "교재 제공"]', '카카오뱅크 3333-02-7654321', 'https://open.kakao.com/busan-excel', 10),

('프레젠테이션 스킬업', '2025-02-05', '19:30 - 21:30', '센텀 스타트업 파크', 40000, 12,
 '성공적인 비즈니스 프레젠테이션의 핵심 스킬을 배웁니다. 스토리텔링, 시각 자료 활용, 발표 기법을 실습합니다.',
 'class', '박프로 (기업 교육 전문가)', '노트북, 발표 자료 (선택사항)',
 '["소규모 정원", "실전 발표", "피드백 제공"]', '국민은행 987-654-321098', 'https://open.kakao.com/busan-presentation', 8),

('직장인 요리 클래스', '2025-02-08', '10:00 - 12:00', '해운대 쿠킹 스튜디오', 60000, 8,
 '바쁜 직장인을 위한 간편하고 건강한 요리법을 배웁니다. 일주일 도시락 만들기와 간편 저녁 메뉴를 실습합니다.',
 'class', '이셰프 (호텔 출신 요리사)', '앞치마 (재료는 제공됩니다)',
 '["재료 제공", "레시피북", "시식 포함"]', '신한은행 110-123-456789', 'https://open.kakao.com/busan-cooking', 6);