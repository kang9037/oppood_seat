-- OPPOOD Supabase Migration - Part 3: Meeting and Class Tables

-- ========================================
-- 3. 모임 관리 테이블
-- ========================================

-- 모임
CREATE TABLE meetings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    organizer_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    category VARCHAR(20) NOT NULL CHECK (category IN ('self-improvement', 'social', 'other')),
    type VARCHAR(20) NOT NULL CHECK (type IN ('regular', 'casual', 'study', 'networking')),
    description TEXT,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_detail TEXT,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    bank_account VARCHAR(255),
    open_chat_link VARCHAR(500),
    status VARCHAR(20) DEFAULT 'recruiting' CHECK (status IN ('draft', 'recruiting', 'closed', 'completed', 'cancelled')),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_meetings_organizer ON meetings(organizer_id);
CREATE INDEX idx_meetings_date ON meetings(meeting_date);
CREATE INDEX idx_meetings_status ON meetings(status);
CREATE INDEX idx_meetings_category ON meetings(category);
CREATE INDEX idx_meetings_type ON meetings(type);

-- 모임 참가자
CREATE TABLE meeting_participants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    meeting_id UUID NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'confirmed', 'refunded')),
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMPTZ,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent', 'cancelled')),
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(meeting_id, user_id)
);

CREATE INDEX idx_participants_user_id ON meeting_participants(user_id);
CREATE INDEX idx_participants_payment_status ON meeting_participants(payment_status);
CREATE INDEX idx_participants_attendance ON meeting_participants(attendance_status);

-- ========================================
-- 4. 원데이 클래스 테이블
-- ========================================

-- 원데이 클래스
CREATE TABLE oneday_classes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    instructor_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    curriculum JSONB,
    target_audience VARCHAR(255),
    difficulty VARCHAR(20) NOT NULL CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_detail TEXT,
    max_participants INTEGER NOT NULL,
    current_participants INTEGER DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    materials TEXT,
    bank_account VARCHAR(255),
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('draft', 'open', 'closed', 'completed', 'cancelled')),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_classes_instructor ON oneday_classes(instructor_id);
CREATE INDEX idx_classes_date ON oneday_classes(class_date);
CREATE INDEX idx_classes_status ON oneday_classes(status);
CREATE INDEX idx_classes_difficulty ON oneday_classes(difficulty);

-- 클래스 신청
CREATE TABLE class_applications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES oneday_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'confirmed', 'refunded')),
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMPTZ,
    application_message TEXT,
    rejection_reason TEXT,
    attendance_status VARCHAR(20) DEFAULT 'registered' CHECK (attendance_status IN ('registered', 'attended', 'absent')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, user_id)
);

CREATE INDEX idx_applications_user_id ON class_applications(user_id);
CREATE INDEX idx_applications_status ON class_applications(status);
CREATE INDEX idx_applications_payment_status ON class_applications(payment_status);

-- 클래스 리뷰
CREATE TABLE class_reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    class_id UUID NOT NULL REFERENCES oneday_classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, user_id)
);

CREATE INDEX idx_reviews_class_id ON class_reviews(class_id);
CREATE INDEX idx_reviews_rating ON class_reviews(rating);