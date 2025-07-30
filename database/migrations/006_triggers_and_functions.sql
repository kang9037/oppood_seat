-- OPPOOD Supabase Migration - Part 6: Triggers and Functions

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
CREATE TRIGGER update_instructor_profiles_updated_at BEFORE UPDATE ON instructor_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_seating_sessions_updated_at BEFORE UPDATE ON seating_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_class_reviews_updated_at BEFORE UPDATE ON class_reviews
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

-- 모임 참가자 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_meeting_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.payment_status = 'confirmed' AND NEW.attendance_status != 'cancelled' THEN
            UPDATE meetings SET current_participants = current_participants + 1 WHERE id = NEW.meeting_id;
        END IF;
    ELSIF TG_OP = 'UPDATE' THEN
        -- 이전에는 확정되지 않았지만 이제 확정된 경우
        IF (OLD.payment_status != 'confirmed' OR OLD.attendance_status = 'cancelled') 
           AND NEW.payment_status = 'confirmed' AND NEW.attendance_status != 'cancelled' THEN
            UPDATE meetings SET current_participants = current_participants + 1 WHERE id = NEW.meeting_id;
        -- 이전에는 확정되었지만 이제 취소된 경우
        ELSIF OLD.payment_status = 'confirmed' AND OLD.attendance_status != 'cancelled'
           AND (NEW.payment_status != 'confirmed' OR NEW.attendance_status = 'cancelled') THEN
            UPDATE meetings SET current_participants = current_participants - 1 WHERE id = NEW.meeting_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_meeting_participants
AFTER INSERT OR UPDATE ON meeting_participants
FOR EACH ROW EXECUTE FUNCTION update_meeting_participant_count();

-- 클래스 참가자 수 업데이트 함수
CREATE OR REPLACE FUNCTION update_class_participant_count()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != 'approved' AND NEW.status = 'approved' THEN
        UPDATE oneday_classes SET current_participants = current_participants + 1 WHERE id = NEW.class_id;
    ELSIF OLD.status = 'approved' AND NEW.status != 'approved' THEN
        UPDATE oneday_classes SET current_participants = current_participants - 1 WHERE id = NEW.class_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_class_participants
AFTER UPDATE ON class_applications
FOR EACH ROW EXECUTE FUNCTION update_class_participant_count();

-- 강사 평점 업데이트 함수
CREATE OR REPLACE FUNCTION update_instructor_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_instructor_id UUID;
    v_avg_rating DECIMAL(3,2);
    v_review_count INT;
BEGIN
    SELECT oc.instructor_id INTO v_instructor_id
    FROM oneday_classes oc
    WHERE oc.id = NEW.class_id;
    
    SELECT AVG(cr.rating), COUNT(cr.id) 
    INTO v_avg_rating, v_review_count
    FROM class_reviews cr
    JOIN oneday_classes oc ON cr.class_id = oc.id
    WHERE oc.instructor_id = v_instructor_id;
    
    UPDATE instructor_profiles
    SET rating = v_avg_rating, total_reviews = v_review_count
    WHERE user_id = v_instructor_id;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_instructor_rating
AFTER INSERT ON class_reviews
FOR EACH ROW EXECUTE FUNCTION update_instructor_rating();