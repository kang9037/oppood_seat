# OPPOOD 데이터베이스 ERD (Entity Relationship Diagram)

## 개요
OPPOOD 프로젝트는 부산 지역 검증된 직장인을 위한 커뮤니티 플랫폼으로, 사용자 관리, 커뮤니티, 모임, 원데이 클래스, 좌석 배치, 정산 등의 기능을 제공합니다.

## 주요 엔티티 그룹

### 1. 사용자 관리 (User Management)
```
┌─────────────────────────┐
│        users            │
├─────────────────────────┤
│ PK: id (BIGINT)        │
│ UK: username           │
│ UK: email              │
│ password_hash          │
│ name                   │
│ member_type            │
│ is_admin               │
│ created_at             │
└─────────────────────────┘
          │
          ├──────┬──────┬──────┐
          │      │      │      │
          ▼      ▼      ▼      ▼
┌──────────────┐┌──────────────┐┌───────────────────────┐
│ user_tokens  ││notification_ ││instructor_profiles    │
├──────────────┤│settings      │├───────────────────────┤
│PK: id        │├──────────────┤│PK,FK: user_id        │
│FK: user_id   ││PK,FK: user_id││expertise             │
│token         ││email_notif...││rating                │
│type          ││push_notif... ││is_verified           │
└──────────────┘└──────────────┘└───────────────────────┘
```

### 2. 커뮤니티 시스템 (Community System)
```
┌─────────────────────┐      ┌──────────────────┐
│community_categories │      │  community_posts │
├─────────────────────┤      ├──────────────────┤
│ PK: id             │◄─────│ PK: id           │
│ name               │      │ FK: user_id      │
│ slug               │      │ FK: category_id  │
└─────────────────────┘      │ title            │
                            │ content          │
                            │ is_anonymous     │
                            │ like_count       │
                            └──────────────────┘
                                    │
                    ┌───────────────┼───────────────┐
                    │               │               │
                    ▼               ▼               ▼
          ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
          │post_likes    │ │comments      │ │post_         │
          ├──────────────┤ ├──────────────┤ │attachments   │
          │PK: post_id,  │ │PK: id        │ ├──────────────┤
          │    user_id   │ │FK: post_id   │ │PK: id        │
          │FK: post_id   │ │FK: user_id   │ │FK: post_id   │
          │FK: user_id   │ │FK: parent_id │ │file_url      │
          └──────────────┘ │content       │ │file_type     │
                          │is_secret     │ └──────────────┘
                          └──────────────┘
```

### 3. 모임 관리 (Meeting Management)
```
┌─────────────────────┐      ┌──────────────────────┐
│      meetings       │      │meeting_participants  │
├─────────────────────┤      ├──────────────────────┤
│ PK: id             │◄─────│ PK: id               │
│ FK: organizer_id   │      │ FK: meeting_id       │
│ title              │      │ FK: user_id          │
│ category           │      │ payment_status       │
│ type               │      │ attendance_status    │
│ meeting_date       │      └──────────────────────┘
│ location           │
│ max_participants   │
│ price              │
│ status             │
└─────────────────────┘
```

### 4. 원데이 클래스 (One-day Classes)
```
┌─────────────────────┐      ┌──────────────────────┐
│  oneday_classes     │      │ class_applications   │
├─────────────────────┤      ├──────────────────────┤
│ PK: id             │◄─────│ PK: id               │
│ FK: instructor_id  │      │ FK: class_id         │
│ title              │      │ FK: user_id          │
│ curriculum         │      │ status               │
│ class_date         │      │ payment_status       │
│ location           │      └──────────────────────┘
│ max_participants   │              │
│ price              │              │
└─────────────────────┘              │
         ▲                          ▼
         │                  ┌──────────────────┐
         │                  │ class_reviews    │
         │                  ├──────────────────┤
         └──────────────────│ PK: id           │
                           │ FK: class_id     │
                           │ FK: user_id      │
                           │ rating           │
                           └──────────────────┘
```

### 5. 좌석 배치 시스템 (Seating System)
```
┌─────────────────────┐
│  seating_sessions   │
├─────────────────────┤
│ PK: id             │
│ FK: created_by     │
│ title              │
│ is_template        │
└─────────────────────┘
         │
         ├───────────────┬──────────────┐
         ▼               ▼              ▼
┌──────────────┐ ┌──────────────────┐ ┌────────────────────┐
│seating_groups│ │seating_          │ │seating_            │
├──────────────┤ │participants      │ │relationships       │
│PK: id        │ ├──────────────────┤ ├────────────────────┤
│FK: session_id│◄│PK: id            │ │PK: id              │
│group_number  │ │FK: session_id    │ │FK: session_id      │
│position_x/y  │ │FK: group_id      │ │participant1_name   │
└──────────────┘ │participant_name  │ │participant2_name   │
                │gender            │ │relationship_type   │
                └──────────────────┘ └────────────────────┘
```

### 6. 정산 시스템 (Settlement System)
```
┌─────────────────────┐      ┌──────────────────────┐
│    settlements      │      │settlement_participants│
├─────────────────────┤      ├──────────────────────┤
│ PK: id             │◄─────│ PK: id               │
│ FK: created_by     │      │ FK: settlement_id    │
│ title              │      │ participant_name     │
│ total_amount       │      │ amount_owed          │
│ status             │      │ is_settled           │
└─────────────────────┘      └──────────────────────┘
```

### 7. 시스템 관리 (System Management)
```
┌─────────────────────┐      ┌──────────────────┐
│   activity_logs     │      │   notifications  │
├─────────────────────┤      ├──────────────────┤
│ PK: id             │      │ PK: id           │
│ FK: user_id        │      │ FK: user_id      │
│ action             │      │ type             │
│ entity_type        │      │ message          │
│ entity_id          │      │ is_read          │
└─────────────────────┘      └──────────────────┘

┌─────────────────────┐
│      reports        │
├─────────────────────┤
│ PK: id             │
│ FK: reporter_id    │
│ FK: reviewed_by    │
│ reported_type      │
│ reported_id        │
│ status             │
└─────────────────────┘
```

## 주요 관계 설명

### 1:N (One-to-Many) 관계
- users → community_posts: 한 사용자는 여러 게시글 작성 가능
- users → meetings: 한 사용자는 여러 모임 주최 가능
- users → oneday_classes: 한 강사는 여러 클래스 개설 가능
- community_posts → comments: 한 게시글에 여러 댓글 가능
- community_posts → post_attachments: 한 게시글에 여러 첨부파일 가능
- meetings → meeting_participants: 한 모임에 여러 참가자 가능
- oneday_classes → class_applications: 한 클래스에 여러 신청 가능
- settlements → settlement_participants: 한 정산에 여러 참가자 가능

### N:M (Many-to-Many) 관계
- users ↔ community_posts (through post_likes): 사용자와 게시글 좋아요
- users ↔ meetings (through meeting_participants): 사용자와 모임 참가
- users ↔ oneday_classes (through class_applications): 사용자와 클래스 신청

### 자기 참조 관계
- comments → comments (parent_id): 댓글의 대댓글 구조

## 인덱스 전략

### 기본 인덱스
- 모든 Primary Key에 자동 인덱스
- 모든 Foreign Key에 인덱스 추가
- Unique 제약조건에 자동 인덱스

### 성능 최적화 인덱스
1. **시간 기반 조회**
   - `idx_created_at`: 최신순 정렬
   - `idx_date`: 날짜별 필터링

2. **상태 기반 조회**
   - `idx_status`: 상태별 필터링
   - `idx_is_deleted`: 삭제 여부 필터링

3. **복합 인덱스**
   - `idx_posts_user_created`: 사용자별 최신 게시글
   - `idx_meetings_date_status`: 날짜와 상태로 모임 조회
   - `idx_notifications_user_read_created`: 사용자별 읽지 않은 알림

4. **전문 검색**
   - `FULLTEXT idx_title_content`: 게시글 제목과 내용 검색

## 데이터 무결성 보장

### 제약조건
- **NOT NULL**: 필수 필드
- **UNIQUE**: 중복 방지 (username, email 등)
- **CHECK**: 값 범위 제한 (rating 1-5)
- **FOREIGN KEY**: 참조 무결성

### 트리거
- 게시글 좋아요/댓글 수 자동 업데이트
- 모임/클래스 참가자 수 자동 업데이트
- 강사 평점 자동 계산

### 트랜잭션
- InnoDB 엔진 사용으로 ACID 보장
- 중요 작업은 트랜잭션으로 묶어 처리

## 확장성 고려사항

1. **파티셔닝 준비**
   - 시간 기반 테이블은 날짜별 파티셔닝 가능
   - activity_logs, notifications 등

2. **아카이빙**
   - 오래된 데이터는 별도 테이블로 이동
   - deleted_at 필드로 소프트 삭제 구현

3. **캐싱 전략**
   - 자주 조회되는 데이터는 Redis 캐싱 고려
   - 인기 게시글, 활성 모임 등

4. **읽기 전용 복제본**
   - 리포팅용 읽기 전용 DB 분리
   - 마스터-슬레이브 구조 고려