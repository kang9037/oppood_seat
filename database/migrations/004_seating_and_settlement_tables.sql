-- OPPOOD Supabase Migration - Part 4: Seating and Settlement Tables

-- ========================================
-- 5. 좌석 배치 시스템 테이블
-- ========================================

-- 좌석 배치 세션
CREATE TABLE seating_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_participants INTEGER NOT NULL,
    is_template BOOLEAN DEFAULT FALSE,
    template_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sessions_created_by ON seating_sessions(created_by);
CREATE INDEX idx_sessions_is_template ON seating_sessions(is_template);

-- 좌석 그룹
CREATE TABLE seating_groups (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES seating_sessions(id) ON DELETE CASCADE,
    group_number INTEGER NOT NULL,
    group_size INTEGER NOT NULL,
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(session_id, group_number)
);

CREATE INDEX idx_groups_session_id ON seating_groups(session_id);

-- 좌석 배치 참가자
CREATE TABLE seating_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES seating_sessions(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES seating_groups(id) ON DELETE CASCADE,
    participant_name VARCHAR(100) NOT NULL,
    gender CHAR(1) DEFAULT 'O' CHECK (gender IN ('M', 'F', 'O')),
    seat_position INTEGER NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_seat_participants_session_id ON seating_participants(session_id);
CREATE INDEX idx_seat_participants_group_id ON seating_participants(group_id);

-- 좌석 배치 관계
CREATE TABLE seating_relationships (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES seating_sessions(id) ON DELETE CASCADE,
    participant1_name VARCHAR(100) NOT NULL,
    participant2_name VARCHAR(100) NOT NULL,
    relationship_type VARCHAR(10) NOT NULL CHECK (relationship_type IN ('pair', 'avoid')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_relationships_session_id ON seating_relationships(session_id);
CREATE INDEX idx_relationships_participants ON seating_relationships(participant1_name, participant2_name);

-- ========================================
-- 6. 정산 시스템 테이블
-- ========================================

-- 정산
CREATE TABLE settlements (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    created_by UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settlements_created_by ON settlements(created_by);
CREATE INDEX idx_settlements_status ON settlements(status);

-- 정산 참가자
CREATE TABLE settlement_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    settlement_id UUID NOT NULL REFERENCES settlements(id) ON DELETE CASCADE,
    participant_name VARCHAR(100) NOT NULL,
    amount_owed DECIMAL(12, 2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_settle_participants_settlement_id ON settlement_participants(settlement_id);
CREATE INDEX idx_settle_participants_is_settled ON settlement_participants(is_settled);