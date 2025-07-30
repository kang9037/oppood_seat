# OPPOOD 데이터베이스 마이그레이션 가이드

## 개요
이 가이드는 OPPOOD 프로젝트의 데이터베이스를 Supabase에 설정하는 방법을 설명합니다.

## 사전 준비사항
1. Supabase 프로젝트가 생성되어 있어야 합니다
2. Supabase Dashboard에 접근 권한이 있어야 합니다
3. 프로젝트가 읽기 전용 모드가 아니어야 합니다

## 마이그레이션 순서

### 1단계: 읽기 전용 모드 해제
Supabase SQL Editor에서 다음 명령 실행:
```sql
SET default_transaction_read_only = 'off';
```

### 2단계: 마이그레이션 파일 실행
다음 순서대로 SQL 파일을 실행하세요:

1. **001_initial_setup.sql** - 기본 사용자 테이블 및 인증 설정
2. **002_community_tables.sql** - 커뮤니티 관련 테이블
3. **003_meeting_and_class_tables.sql** - 모임 및 클래스 테이블
4. **004_seating_and_settlement_tables.sql** - 좌석 배치 및 정산 테이블
5. **005_system_tables.sql** - 시스템 로그 및 알림 테이블
6. **006_triggers_and_functions.sql** - 트리거 및 함수
7. **007_views_and_indexes.sql** - 뷰 및 성능 인덱스
8. **008_rls_policies.sql** - Row Level Security 정책

### 3단계: 실행 방법
1. [Supabase Dashboard](https://supabase.com/dashboard)에 로그인
2. 해당 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭
4. 각 마이그레이션 파일의 내용을 복사하여 붙여넣기
5. **Run** 버튼 클릭하여 실행

### 4단계: 마이그레이션 확인
모든 마이그레이션이 완료되면 다음을 확인하세요:
- Table Editor에서 모든 테이블이 생성되었는지 확인
- 기본 카테고리 데이터가 삽입되었는지 확인

## 주의사항

### 에러 처리
- 이미 존재하는 테이블 에러가 발생하면 해당 부분을 건너뛰고 진행
- 권한 에러가 발생하면 읽기 전용 모드가 해제되었는지 확인

### 데이터 백업
- 프로덕션 환경에서는 마이그레이션 전 반드시 백업 수행
- Supabase Dashboard의 Backups 섹션 활용

### RLS (Row Level Security)
- 008_rls_policies.sql 실행 후 RLS가 활성화됩니다
- 애플리케이션에서 적절한 인증 토큰을 사용해야 합니다

## 다음 단계

### 1. Supabase Auth 설정
프로젝트에서 Supabase Auth를 사용하려면:
```javascript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_ANON_KEY
)
```

### 2. 테스트 데이터 생성
필요한 경우 테스트 데이터를 생성하여 애플리케이션 테스트

### 3. 애플리케이션 연동
- API 호출을 localStorage에서 Supabase로 변경
- 인증 시스템을 Supabase Auth로 마이그레이션

## 문제 해결

### 일반적인 문제들

1. **UUID 확장이 설치되지 않음**
   ```sql
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   ```

2. **권한 부족**
   - Supabase Dashboard에서 Database Settings 확인
   - 필요시 프로젝트 소유자에게 권한 요청

3. **외래키 제약 조건 오류**
   - 마이그레이션 순서가 올바른지 확인
   - 참조하는 테이블이 먼저 생성되었는지 확인

## 지원
문제가 발생하면:
1. Supabase 공식 문서 참조
2. 프로젝트 관리자에게 문의
3. Supabase Discord 커뮤니티 활용