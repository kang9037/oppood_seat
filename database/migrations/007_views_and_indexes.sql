-- OPPOOD Supabase Migration - Part 7: Views and Performance Indexes

-- ========================================
-- 뷰 생성
-- ========================================

-- 활성 모임 뷰
CREATE VIEW active_meetings AS
SELECT 
    m.*,
    u.name as organizer_name,
    u.company as organizer_company,
    COUNT(DISTINCT mp.user_id) FILTER (WHERE mp.payment_status = 'confirmed' AND mp.attendance_status != 'cancelled') as confirmed_participants
FROM meetings m
JOIN users u ON m.organizer_id = u.id
LEFT JOIN meeting_participants mp ON m.id = mp.meeting_id
WHERE m.status = 'recruiting' 
    AND m.meeting_date >= CURRENT_DATE
    AND m.is_deleted = FALSE
GROUP BY m.id, u.name, u.company;

-- 인기 게시글 뷰
CREATE VIEW popular_posts AS
SELECT 
    p.*,
    u.name as author_name,
    u.company as author_company,
    c.name as category_name,
    COUNT(DISTINCT pl.user_id) as real_like_count,
    COUNT(DISTINCT cm.id) FILTER (WHERE cm.is_deleted = FALSE) as real_comment_count
FROM community_posts p
JOIN users u ON p.user_id = u.id
JOIN community_categories c ON p.category_id = c.id
LEFT JOIN post_likes pl ON p.id = pl.post_id
LEFT JOIN comments cm ON p.id = cm.post_id
WHERE p.is_deleted = FALSE
    AND p.created_at >= CURRENT_TIMESTAMP - INTERVAL '7 days'
GROUP BY p.id, u.name, u.company, c.name
HAVING COUNT(DISTINCT pl.user_id) >= 5 OR COUNT(DISTINCT cm.id) FILTER (WHERE cm.is_deleted = FALSE) >= 10
ORDER BY (COUNT(DISTINCT pl.user_id) * 2 + COUNT(DISTINCT cm.id) FILTER (WHERE cm.is_deleted = FALSE) * 3) DESC;

-- ========================================
-- 추가 성능 인덱스
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