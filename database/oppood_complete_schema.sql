-- OPPOOD 프로젝트 완전한 데이터베이스 스키마
-- 작성일: 2025-07-30
-- 설명: 부산 검증된 직장인 커뮤니티 플랫폼

-- 데이터베이스 생성
CREATE DATABASE IF NOT EXISTS oppood_db 
    DEFAULT CHARACTER SET utf8mb4 
    COLLATE utf8mb4_unicode_ci;

USE oppood_db;

-- ========================================
-- 1. 사용자 관리 테이블
-- ========================================

-- 사용자 기본 정보
CREATE TABLE users (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    company VARCHAR(100),
    position VARCHAR(100),
    member_type ENUM('general', 'instructor') DEFAULT 'general',
    is_active BOOLEAN DEFAULT TRUE,
    is_admin BOOLEAN DEFAULT FALSE,
    profile_image_url VARCHAR(500),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP NULL,
    deleted_at TIMESTAMP NULL,
    INDEX idx_email (email),
    INDEX idx_username (username),
    INDEX idx_member_type (member_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 사용자 인증 토큰 (Remember Me, 비밀번호 재설정 등)
CREATE TABLE user_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    type ENUM('remember_me', 'password_reset', 'email_verification') NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token),
    INDEX idx_user_type (user_id, type),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 사용자 알림 설정
CREATE TABLE user_notification_settings (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT TRUE,
    community_replies BOOLEAN DEFAULT TRUE,
    meeting_reminders BOOLEAN DEFAULT TRUE,
    class_updates BOOLEAN DEFAULT TRUE,
    marketing_emails BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 2. 커뮤니티 테이블
-- ========================================

-- 커뮤니티 카테고리
CREATE TABLE community_categories (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    slug VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_order (display_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 커뮤니티 게시글
CREATE TABLE community_posts (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    category_id INT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50),
    view_count INT UNSIGNED DEFAULT 0,
    like_count INT UNSIGNED DEFAULT 0,
    comment_count INT UNSIGNED DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    deleted_by BIGINT UNSIGNED NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES community_categories(id),
    FOREIGN KEY (deleted_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_category (category_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_deleted (is_deleted),
    FULLTEXT idx_title_content (title, content)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글 첨부 파일
CREATE TABLE post_attachments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    file_type ENUM('image', 'file', 'link') NOT NULL,
    file_url VARCHAR(500) NOT NULL,
    file_name VARCHAR(255),
    file_size INT UNSIGNED,
    link_title VARCHAR(255),
    link_description TEXT,
    display_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_type (file_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 게시글 좋아요
CREATE TABLE post_likes (
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (post_id, user_id),
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 댓글
CREATE TABLE comments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    post_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    parent_id BIGINT UNSIGNED NULL,
    content TEXT NOT NULL,
    is_secret BOOLEAN DEFAULT FALSE,
    is_anonymous BOOLEAN DEFAULT FALSE,
    anonymous_name VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES community_posts(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (parent_id) REFERENCES comments(id) ON DELETE CASCADE,
    INDEX idx_post_id (post_id),
    INDEX idx_user_id (user_id),
    INDEX idx_parent_id (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 신고
CREATE TABLE reports (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    reporter_id BIGINT UNSIGNED NOT NULL,
    reported_type ENUM('post', 'comment', 'user') NOT NULL,
    reported_id BIGINT UNSIGNED NOT NULL,
    reason VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('pending', 'reviewed', 'resolved', 'dismissed') DEFAULT 'pending',
    reviewed_by BIGINT UNSIGNED NULL,
    reviewed_at TIMESTAMP NULL,
    action_taken TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (reporter_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (reviewed_by) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_status (status),
    INDEX idx_reported (reported_type, reported_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 3. 모임 관리 테이블
-- ========================================

-- 모임
CREATE TABLE meetings (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    organizer_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    category ENUM('self-improvement', 'social', 'other') NOT NULL,
    type ENUM('regular', 'casual', 'study', 'networking') NOT NULL,
    description TEXT,
    meeting_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_detail TEXT,
    max_participants INT UNSIGNED NOT NULL,
    current_participants INT UNSIGNED DEFAULT 0,
    price DECIMAL(10, 2) DEFAULT 0,
    bank_account VARCHAR(255),
    open_chat_link VARCHAR(500),
    status ENUM('draft', 'recruiting', 'closed', 'completed', 'cancelled') DEFAULT 'recruiting',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (organizer_id) REFERENCES users(id),
    INDEX idx_organizer (organizer_id),
    INDEX idx_date (meeting_date),
    INDEX idx_status (status),
    INDEX idx_category (category),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 모임 참가자
CREATE TABLE meeting_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    meeting_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    payment_status ENUM('pending', 'paid', 'confirmed', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMP NULL,
    attendance_status ENUM('registered', 'attended', 'absent', 'cancelled') DEFAULT 'registered',
    cancelled_at TIMESTAMP NULL,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_participant (meeting_id, user_id),
    FOREIGN KEY (meeting_id) REFERENCES meetings(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_payment_status (payment_status),
    INDEX idx_attendance (attendance_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 4. 원데이 클래스 테이블
-- ========================================

-- 강사 프로필
CREATE TABLE instructor_profiles (
    user_id BIGINT UNSIGNED PRIMARY KEY,
    expertise TEXT,
    experience TEXT,
    certifications TEXT,
    rating DECIMAL(3, 2) DEFAULT 0,
    total_reviews INT UNSIGNED DEFAULT 0,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 원데이 클래스
CREATE TABLE oneday_classes (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    instructor_id BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    curriculum JSON,
    target_audience VARCHAR(255),
    difficulty ENUM('beginner', 'intermediate', 'advanced') NOT NULL,
    class_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255) NOT NULL,
    location_detail TEXT,
    max_participants INT UNSIGNED NOT NULL,
    current_participants INT UNSIGNED DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    materials TEXT,
    bank_account VARCHAR(255),
    status ENUM('draft', 'open', 'closed', 'completed', 'cancelled') DEFAULT 'open',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (instructor_id) REFERENCES users(id),
    INDEX idx_instructor (instructor_id),
    INDEX idx_date (class_date),
    INDEX idx_status (status),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 클래스 신청
CREATE TABLE class_applications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    status ENUM('pending', 'approved', 'rejected', 'cancelled') DEFAULT 'pending',
    payment_status ENUM('pending', 'paid', 'confirmed', 'refunded') DEFAULT 'pending',
    payment_amount DECIMAL(10, 2),
    payment_date TIMESTAMP NULL,
    application_message TEXT,
    rejection_reason TEXT,
    attendance_status ENUM('registered', 'attended', 'absent') DEFAULT 'registered',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_application (class_id, user_id),
    FOREIGN KEY (class_id) REFERENCES oneday_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 클래스 리뷰
CREATE TABLE class_reviews (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    class_id BIGINT UNSIGNED NOT NULL,
    user_id BIGINT UNSIGNED NOT NULL,
    rating INT UNSIGNED NOT NULL CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_review (class_id, user_id),
    FOREIGN KEY (class_id) REFERENCES oneday_classes(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_class_id (class_id),
    INDEX idx_rating (rating)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 5. 좌석 배치 시스템 테이블
-- ========================================

-- 좌석 배치 세션
CREATE TABLE seating_sessions (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_participants INT UNSIGNED NOT NULL,
    is_template BOOLEAN DEFAULT FALSE,
    template_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_created_by (created_by),
    INDEX idx_is_template (is_template)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 좌석 그룹
CREATE TABLE seating_groups (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    group_number INT UNSIGNED NOT NULL,
    group_size INT UNSIGNED NOT NULL,
    position_x DECIMAL(10, 2) NOT NULL,
    position_y DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES seating_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    UNIQUE KEY unique_group (session_id, group_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 좌석 배치 참가자
CREATE TABLE seating_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    group_id BIGINT UNSIGNED NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    gender ENUM('M', 'F', 'O') DEFAULT 'O',
    seat_position INT UNSIGNED NOT NULL,
    special_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES seating_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (group_id) REFERENCES seating_groups(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_group_id (group_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 좌석 배치 관계 (짝 지정 등)
CREATE TABLE seating_relationships (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    session_id BIGINT UNSIGNED NOT NULL,
    participant1_name VARCHAR(100) NOT NULL,
    participant2_name VARCHAR(100) NOT NULL,
    relationship_type ENUM('pair', 'avoid') NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES seating_sessions(id) ON DELETE CASCADE,
    INDEX idx_session_id (session_id),
    INDEX idx_participants (participant1_name, participant2_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 6. 정산 시스템 테이블
-- ========================================

-- 정산
CREATE TABLE settlements (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    created_by BIGINT UNSIGNED NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    total_amount DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'KRW',
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (created_by) REFERENCES users(id),
    INDEX idx_created_by (created_by),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 정산 참가자
CREATE TABLE settlement_participants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    settlement_id BIGINT UNSIGNED NOT NULL,
    participant_name VARCHAR(100) NOT NULL,
    amount_owed DECIMAL(12, 2) NOT NULL,
    is_settled BOOLEAN DEFAULT FALSE,
    settled_at TIMESTAMP NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (settlement_id) REFERENCES settlements(id) ON DELETE CASCADE,
    INDEX idx_settlement_id (settlement_id),
    INDEX idx_is_settled (is_settled)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 7. 시스템 로그 및 감사 테이블
-- ========================================

-- 활동 로그
CREATE TABLE activity_logs (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50),
    entity_id BIGINT UNSIGNED,
    old_values JSON,
    new_values JSON,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_id (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 8. 알림 시스템 테이블
-- ========================================

-- 알림
CREATE TABLE notifications (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSON,
    is_read BOOLEAN DEFAULT FALSE,
    read_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ========================================
-- 기본 데이터 삽입
-- ========================================

-- 커뮤니티 카테고리 기본 데이터
INSERT INTO community_categories (name, slug, description, display_order) VALUES
('소통해요', 'communication', '자유롭게 소통하는 공간', 1),
('혜택공유', 'benefits', '유용한 정보와 혜택을 공유하는 공간', 2),
('질문답변', 'qna', '궁금한 점을 묻고 답하는 공간', 3),
('모임후기', 'reviews', '모임 참가 후기를 공유하는 공간', 4);

-- 관리자 계정 생성 (비밀번호는 애플리케이션에서 해시 처리 필요)
-- 예시: password123 -> bcrypt hash
INSERT INTO users (username, email, password_hash, name, is_admin) VALUES
('admin', 'admin@oppood.com', '$2b$10$YourHashedPasswordHere', '관리자', TRUE);

-- ========================================
-- 뷰 생성
-- ========================================

-- 활성 모임 뷰
CREATE VIEW active_meetings AS
SELECT 
    m.*,
    u.name as organizer_name,
    u.company as organizer_company,
    COUNT(DISTINCT mp.user_id) as confirmed_participants
FROM meetings m
JOIN users u ON m.organizer_id = u.id
LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id 
    AND mp.payment_status = 'confirmed'
    AND mp.attendance_status != 'cancelled'
WHERE m.status = 'recruiting' 
    AND m.meeting_date >= CURDATE()
    AND m.is_deleted = FALSE
GROUP BY m.id;

-- 인기 게시글 뷰
CREATE VIEW popular_posts AS
SELECT 
    p.*,
    u.name as author_name,
    u.company as author_company,
    c.name as category_name,
    COUNT(DISTINCT pl.user_id) as real_like_count,
    COUNT(DISTINCT cm.id) as real_comment_count
FROM community_posts p
JOIN users u ON p.user_id = u.id
JOIN community_categories c ON p.category_id = c.id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN comments cm ON p.id = cm.post_id AND cm.is_deleted = FALSE
WHERE p.is_deleted = FALSE
    AND p.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
GROUP BY p.id
HAVING real_like_count >= 5 OR real_comment_count >= 10
ORDER BY (real_like_count * 2 + real_comment_count * 3) DESC;

-- ========================================
-- 트리거 생성
-- ========================================

DELIMITER $$

-- 게시글 좋아요 수 업데이트 트리거
CREATE TRIGGER update_post_like_count_after_insert
AFTER INSERT ON post_likes
FOR EACH ROW
BEGIN
    UPDATE community_posts 
    SET like_count = like_count + 1 
    WHERE id = NEW.post_id;
END$$

CREATE TRIGGER update_post_like_count_after_delete
AFTER DELETE ON post_likes
FOR EACH ROW
BEGIN
    UPDATE community_posts 
    SET like_count = like_count - 1 
    WHERE id = OLD.post_id;
END$$

-- 댓글 수 업데이트 트리거
CREATE TRIGGER update_comment_count_after_insert
AFTER INSERT ON comments
FOR EACH ROW
BEGIN
    IF NEW.is_deleted = FALSE THEN
        UPDATE community_posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
    END IF;
END$$

CREATE TRIGGER update_comment_count_after_update
AFTER UPDATE ON comments
FOR EACH ROW
BEGIN
    IF OLD.is_deleted = FALSE AND NEW.is_deleted = TRUE THEN
        UPDATE community_posts 
        SET comment_count = comment_count - 1 
        WHERE id = NEW.post_id;
    ELSEIF OLD.is_deleted = TRUE AND NEW.is_deleted = FALSE THEN
        UPDATE community_posts 
        SET comment_count = comment_count + 1 
        WHERE id = NEW.post_id;
    END IF;
END$$

-- 모임 참가자 수 업데이트 트리거
CREATE TRIGGER update_meeting_participants_count
AFTER INSERT ON meeting_participants
FOR EACH ROW
BEGIN
    IF NEW.payment_status = 'confirmed' AND NEW.attendance_status != 'cancelled' THEN
        UPDATE meetings 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.meeting_id;
    END IF;
END$$

CREATE TRIGGER update_meeting_participants_count_on_update
AFTER UPDATE ON meeting_participants
FOR EACH ROW
BEGIN
    -- 이전에는 확정되지 않았지만 이제 확정된 경우
    IF (OLD.payment_status != 'confirmed' OR OLD.attendance_status = 'cancelled') 
       AND NEW.payment_status = 'confirmed' AND NEW.attendance_status != 'cancelled' THEN
        UPDATE meetings 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.meeting_id;
    -- 이전에는 확정되었지만 이제 취소된 경우
    ELSEIF OLD.payment_status = 'confirmed' AND OLD.attendance_status != 'cancelled'
       AND (NEW.payment_status != 'confirmed' OR NEW.attendance_status = 'cancelled') THEN
        UPDATE meetings 
        SET current_participants = current_participants - 1 
        WHERE id = NEW.meeting_id;
    END IF;
END$$

-- 클래스 참가자 수 업데이트 트리거
CREATE TRIGGER update_class_participants_count
AFTER UPDATE ON class_applications
FOR EACH ROW
BEGIN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE oneday_classes 
        SET current_participants = current_participants + 1 
        WHERE id = NEW.class_id;
    ELSEIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE oneday_classes 
        SET current_participants = current_participants - 1 
        WHERE id = NEW.class_id;
    END IF;
END$$

-- 강사 평점 업데이트 트리거
CREATE TRIGGER update_instructor_rating
AFTER INSERT ON class_reviews
FOR EACH ROW
BEGIN
    DECLARE instructor_id BIGINT;
    DECLARE avg_rating DECIMAL(3,2);
    DECLARE review_count INT;
    
    SELECT oc.instructor_id INTO instructor_id
    FROM oneday_classes oc
    WHERE oc.id = NEW.class_id;
    
    SELECT AVG(cr.rating), COUNT(cr.id) 
    INTO avg_rating, review_count
    FROM class_reviews cr
    JOIN oneday_classes oc ON cr.class_id = oc.id
    WHERE oc.instructor_id = instructor_id;
    
    UPDATE instructor_profiles
    SET rating = avg_rating, total_reviews = review_count
    WHERE user_id = instructor_id;
END$$

DELIMITER ;

-- ========================================
-- 인덱스 전략 (성능 최적화)
-- ========================================

-- 복합 인덱스 추가
CREATE INDEX idx_posts_user_created ON community_posts(user_id, created_at DESC);
CREATE INDEX idx_posts_category_created ON community_posts(category_id, created_at DESC);
CREATE INDEX idx_meetings_date_status ON meetings(meeting_date, status);
CREATE INDEX idx_classes_date_status ON oneday_classes(class_date, status);
CREATE INDEX idx_notifications_user_read_created ON notifications(user_id, is_read, created_at DESC);

-- 커버링 인덱스
CREATE INDEX idx_meeting_participants_covering 
ON meeting_participants(meeting_id, user_id, payment_status, attendance_status);

CREATE INDEX idx_class_applications_covering 
ON class_applications(class_id, user_id, status, payment_status);

-- ========================================
-- 권한 설정
-- ========================================

-- 애플리케이션 사용자 생성 및 권한 부여
-- CREATE USER 'oppood_app'@'localhost' IDENTIFIED BY 'StrongPassword123!';
-- GRANT SELECT, INSERT, UPDATE, DELETE ON oppood_db.* TO 'oppood_app'@'localhost';
-- GRANT EXECUTE ON oppood_db.* TO 'oppood_app'@'localhost';

-- 읽기 전용 사용자 (리포팅용)
-- CREATE USER 'oppood_reader'@'localhost' IDENTIFIED BY 'ReadOnlyPassword123!';
-- GRANT SELECT ON oppood_db.* TO 'oppood_reader'@'localhost';

-- FLUSH PRIVILEGES;