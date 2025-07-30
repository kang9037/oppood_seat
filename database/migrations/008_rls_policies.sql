-- OPPOOD Supabase Migration - Part 8: Row Level Security (RLS) Policies

-- ========================================
-- Row Level Security (RLS) 정책
-- ========================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE instructor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetings ENABLE ROW LEVEL SECURITY;
ALTER TABLE meeting_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE oneday_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE seating_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlements ENABLE ROW LEVEL SECURITY;
ALTER TABLE settlement_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- ========================================
-- Users 정책
-- ========================================

-- 모든 사용자는 다른 사용자의 공개 정보를 볼 수 있음
CREATE POLICY "Users can view public profiles" ON users
    FOR SELECT USING (true);

-- 사용자는 자신의 프로필만 수정 가능
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- 새로운 사용자 등록은 누구나 가능
CREATE POLICY "Anyone can create user" ON users
    FOR INSERT WITH CHECK (true);

-- ========================================
-- User Tokens 정책
-- ========================================

-- 사용자는 자신의 토큰만 관리 가능
CREATE POLICY "Users can manage own tokens" ON user_tokens
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- User Notification Settings 정책
-- ========================================

-- 사용자는 자신의 알림 설정만 관리 가능
CREATE POLICY "Users can manage own notification settings" ON user_notification_settings
    FOR ALL USING (auth.uid() = user_id);

-- ========================================
-- Community Posts 정책
-- ========================================

-- 삭제되지 않은 게시글은 누구나 볼 수 있음
CREATE POLICY "Anyone can view non-deleted posts" ON community_posts
    FOR SELECT USING (is_deleted = FALSE);

-- 로그인한 사용자는 게시글 작성 가능
CREATE POLICY "Authenticated users can create posts" ON community_posts
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 사용자는 자신의 게시글만 수정 가능
CREATE POLICY "Users can update own posts" ON community_posts
    FOR UPDATE USING (auth.uid() = user_id);

-- 사용자는 자신의 게시글만 삭제(soft delete) 가능
CREATE POLICY "Users can delete own posts" ON community_posts
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- Post Attachments 정책
-- ========================================

-- 게시글의 첨부파일은 누구나 볼 수 있음
CREATE POLICY "Anyone can view attachments" ON post_attachments
    FOR SELECT USING (true);

-- 게시글 작성자만 첨부파일 추가 가능
CREATE POLICY "Post authors can add attachments" ON post_attachments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM community_posts 
            WHERE id = post_id AND user_id = auth.uid()
        )
    );

-- ========================================
-- Post Likes 정책
-- ========================================

-- 좋아요 목록은 누구나 볼 수 있음
CREATE POLICY "Anyone can view likes" ON post_likes
    FOR SELECT USING (true);

-- 로그인한 사용자는 좋아요 가능
CREATE POLICY "Authenticated users can like posts" ON post_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 좋아요만 취소 가능
CREATE POLICY "Users can unlike own likes" ON post_likes
    FOR DELETE USING (auth.uid() = user_id);

-- ========================================
-- Comments 정책
-- ========================================

-- 삭제되지 않은 댓글은 누구나 볼 수 있음 (비밀 댓글 제외)
CREATE POLICY "View non-deleted comments" ON comments
    FOR SELECT USING (
        is_deleted = FALSE AND (
            is_secret = FALSE OR 
            auth.uid() = user_id OR
            EXISTS (
                SELECT 1 FROM community_posts 
                WHERE id = comments.post_id AND user_id = auth.uid()
            )
        )
    );

-- 로그인한 사용자는 댓글 작성 가능
CREATE POLICY "Authenticated users can create comments" ON comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 사용자는 자신의 댓글만 수정 가능
CREATE POLICY "Users can update own comments" ON comments
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- Meetings 정책
-- ========================================

-- 삭제되지 않은 모임은 누구나 볼 수 있음
CREATE POLICY "Anyone can view active meetings" ON meetings
    FOR SELECT USING (is_deleted = FALSE);

-- 로그인한 사용자는 모임 생성 가능
CREATE POLICY "Authenticated users can create meetings" ON meetings
    FOR INSERT WITH CHECK (auth.uid() = organizer_id);

-- 주최자만 자신의 모임 수정 가능
CREATE POLICY "Organizers can update own meetings" ON meetings
    FOR UPDATE USING (auth.uid() = organizer_id);

-- ========================================
-- Meeting Participants 정책
-- ========================================

-- 모임 주최자와 참가자 본인만 참가자 정보 조회 가능
CREATE POLICY "View meeting participants" ON meeting_participants
    FOR SELECT USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM meetings 
            WHERE id = meeting_id AND organizer_id = auth.uid()
        )
    );

-- 로그인한 사용자는 모임 참가 신청 가능
CREATE POLICY "Users can join meetings" ON meeting_participants
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 참가자 본인만 자신의 참가 정보 수정 가능
CREATE POLICY "Users can update own participation" ON meeting_participants
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- Classes 정책
-- ========================================

-- 삭제되지 않은 클래스는 누구나 볼 수 있음
CREATE POLICY "Anyone can view active classes" ON oneday_classes
    FOR SELECT USING (is_deleted = FALSE);

-- 강사 회원만 클래스 생성 가능
CREATE POLICY "Instructors can create classes" ON oneday_classes
    FOR INSERT WITH CHECK (
        auth.uid() = instructor_id AND
        EXISTS (
            SELECT 1 FROM users 
            WHERE id = auth.uid() AND member_type = 'instructor'
        )
    );

-- 강사만 자신의 클래스 수정 가능
CREATE POLICY "Instructors can update own classes" ON oneday_classes
    FOR UPDATE USING (auth.uid() = instructor_id);

-- ========================================
-- Notifications 정책
-- ========================================

-- 사용자는 자신의 알림만 조회 가능
CREATE POLICY "Users can view own notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- 시스템만 알림 생성 가능 (service role)
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (auth.jwt() ->> 'role' = 'service_role');

-- 사용자는 자신의 알림 읽음 처리만 가능
CREATE POLICY "Users can mark own notifications as read" ON notifications
    FOR UPDATE USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);