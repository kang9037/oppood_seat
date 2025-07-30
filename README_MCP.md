# MCP 서버 설정 가이드

## Claude Code에서 MCP 서버 사용하기

### 1. 환경 변수 설정

PowerShell을 관리자 권한으로 실행하고 다음 명령을 실행하세요:

```powershell
# 프로젝트 디렉토리로 이동
cd "C:\Users\kangd\OneDrive - 부산광역시교육청\바탕 화면\cursor\MyProjcet\oppood_seat"

# 스크립트 실행 정책 임시 변경 (필요한 경우)
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope Process

# 환경 변수 설정 스크립트 실행
.\setup-mcp.ps1
```

### 2. Claude Code 재시작

환경 변수 설정 후 Claude Code를 완전히 종료하고 다시 시작해야 합니다.

### 3. MCP 서버 확인

Claude Code에서 다음 명령으로 MCP 서버 상태를 확인할 수 있습니다:

```
/mcp
```

### 설정된 MCP 서버

1. **Playwright** - 웹 자동화 및 테스트
2. **Notion** - Notion API 연동
3. **Threads** - Meta Threads API 연동  
4. **MySQL** - MySQL 데이터베이스 연동
5. **Supabase** - Supabase 백엔드 연동
6. **GitHub** - GitHub API 연동

### 주의사항

- `.env` 파일에는 민감한 정보가 포함되어 있으므로 절대 Git에 커밋하지 마세요
- 토큰이 만료되면 `.env` 파일을 업데이트하고 환경 변수를 다시 설정해야 합니다
- Notion API 토큰은 실제 통합 토큰으로 교체해야 합니다