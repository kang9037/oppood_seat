-- OPPOOD Supabase Migration Script
-- Supabase는 PostgreSQL을 사용하므로 MySQL 문법을 PostgreSQL로 변환

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================
-- 1. 사용자 관리 테이블
-- ========================================

-- 사용자 기본 정보
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    position VARCHAR(100),
    member_type VARCHAR(20) DEFAULT 'general' CHECK (member_type IN ('general', 'instructor')),
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ
);

-- 인덱스
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_member_type ON users(member_type);
CREATE INDEX idx_users_created_at ON users(created_at);

-- 사용자 인증 토큰
CREATE TABLE user_tokens (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('remember_me', 'password_reset', 'email_verification')),
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_tokens_token ON user_tokens(token);
CREATE INDEX idx_user_tokens_user_type ON user_tokens(user_id, type);
CREATE INDEX idx_user_tokens_expires ON user_tokens(expires_at);

-- 사용자 알림 설정
CREATE TABLE user_notification_settings (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    community_replies BOOLEAN DEFAULT TRUE,
    meeting_reminders BOOLEAN DEFAULT TRUE,
    class_updates BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ========================================
-- 2. 커뮤니티 테이블
-- ========================================

-- 커뮤니티 카테고리
CREATE TABLE community_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON community_categories(slug);
CREATE INDEX idx_categories_order ON community_categories(display_order);

-- 커뮤니티 게시글
CREATE TABLE community_posts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER NOT NULL REFERENCES community_categories(id),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    deleted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_user_id ON community_posts(user_id);
CREATE INDEX idx_posts_category ON community_posts(category_id);
CREATE INDEX idx_posts_created_at ON community_posts(created_at);
CREATE INDEX idx_posts_is_deleted ON community_posts(is_deleted);
CREATE INDEX idx_posts_title_content ON community_posts USING gin(to_tsvector('korean', title || ' ' || content));

-- 게시글 첨부 파일
CREATE TABLE post_attachments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    file_type VARCHAR(10) NOT NULL CHECK (file_type IN ('image', 'file', 'link')),
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INTEGER,
    link_title VARCHAR(255),
    link_description TEXT,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_attachments_post_id ON post_attachments(post_id);
CREATE INDEX idx_attachments_type ON post_attachments(file_type);

-- 게시글 좋아요
CREATE TABLE post_likes (
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id)
);

CREATE INDEX idx_likes_user_id ON post_likes(user_id);

-- 댓글
CREATE TABLE comments (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    post_id UUID NOT NULL REFERENCES community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_post_id ON comments(post_id);
CREATE INDEX idx_comments_user_id ON comments(user_id);
CREATE INDEX idx_comments_parent_id ON comments(parent_id);

-- 신고
CREATE TABLE reports (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    reported_type VARCHAR(10) NOT NULL CHECK (reported_type IN ('post', 'comment', 'user')),
    reported_id UUID NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    action_taken TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_reported ON reports(reported_type, reported_id);
CREATE INDEX idx_reports_created_at ON reports(created_at);

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

-- 강사 프로필
CREATE TABLE instructor_profiles (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    expertise TEXT,
    experience TEXT,
    certifications TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

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

-- ========================================
-- 7. 시스템 로그 및 감사 테이블
-- ========================================

-- 활동 로그
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_logs_user_id ON activity_logs(user_id);
CREATE INDEX idx_logs_action ON activity_logs(action);
CREATE INDEX idx_logs_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_logs_created_at ON activity_logs(created_at);

-- ========================================
-- 8. 알림 시스템 테이블
-- ========================================

-- 알림
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- ========================================
-- 함수 및 트리거 (PostgreSQL 버전)
-- ========================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- updated_at 트리거 생성
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_notification_settings_updated_at BEFORE UPDATE ON user_notification_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_community_posts_updated_at BEFORE UPDATE ON community_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meetings_updated_at BEFORE UPDATE ON meetings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meeting_participants_updated_at BEFORE UPDATE ON meeting_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_oneday_classes_updated_at BEFORE UPDATE ON oneday_classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_applications_updated_at BEFORE UPDATE ON class_applications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlements_updated_at BEFORE UPDATE ON settlements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settlement_participants_updated_at BEFORE UPDATE ON settlement_participants
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 게시글 좋아요 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_post_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE community_posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE community_posts SET like_count = like_count - 1 WHERE id = OLD.post_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_post_likes
AFTER INSERT OR DELETE ON post_likes
FOR EACH ROW EXECUTE FUNCTION update_post_like_count();

-- 댓글 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' AND NEW.is_deleted = FALSE THEN
        UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    ELSIF TG_OP = 'UPDATE' THEN
        IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
            UPDATE community_posts SET comment_count = comment_count - 1 WHERE id = NEW.post_id;
        ELSIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
            UPDATE community_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_comment_count
AFTER INSERT OR UPDATE ON comments
FOR EACH ROW EXECUTE FUNCTION update_comment_count();

-- ========================================
-- Row Level Security (RLS) 정책
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE oneday_classes ENABLE ROW LEVEL SECURITY;

-- Users 정책
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Community posts 정책
CREATE POLICY "Anyone can view non-deleted posts" ON community_posts
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- Comments 정책
CREATE POLICY "Anyone can view non-deleted comments" ON comments
    FOR SELECT USING (is_deleted = FALSE);

CREATE POLICY "Users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- 기본 데이터 삽입
-- ========================================

-- 커뮤니티 카테고리 기본 데이터
INSERT INTO community_categories (name, slug, description, display_order) VALUES
('소통해요', 'communication', '자유롭게 소통하는 공간', 1),
('혜택공유', 'benefits', '유용한 정보와 혜택을 공유하는 공간', 2),
('질문답변', 'qna', '궁금한 점을 묻고 답하는 공간', 3),
('모임후기', 'reviews', '모임 참가 후기를 공유하는 공간', 4);