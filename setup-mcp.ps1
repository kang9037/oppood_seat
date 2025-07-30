# MCP 서버 환경 변수 설정 스크립트

Write-Host "MCP 서버 환경 변수 설정 중..." -ForegroundColor Green

# .env 파일 읽기
$envFile = ".\.env"
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^([^#]\S+)=(.+)$') {
            $name = $matches[1]
            $value = $matches[2]
            [System.Environment]::SetEnvironmentVariable($name, $value, [System.EnvironmentVariableTarget]::User)
            Write-Host "✓ $name 설정 완료" -ForegroundColor Yellow
        }
    }
    Write-Host "`n환경 변수 설정이 완료되었습니다!" -ForegroundColor Green
    Write-Host "Claude Code를 재시작하면 MCP 서버가 활성화됩니다." -ForegroundColor Cyan
} else {
    Write-Host ".env 파일을 찾을 수 없습니다!" -ForegroundColor Red
}