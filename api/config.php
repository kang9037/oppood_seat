<?php
// 데이터베이스 설정
define('DB_HOST', 'localhost');
define('DB_NAME', 'busan_workers');
define('DB_USER', 'root');
define('DB_PASS', '');

// 시간대 설정
date_default_timezone_set('Asia/Seoul');

// CORS 헤더 설정
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

// 에러 표시 설정 (개발 환경)
error_reporting(E_ALL);
ini_set('display_errors', 1);

// 데이터베이스 연결 함수
function getDB() {
    try {
        $db = new PDO(
            'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
            DB_USER,
            DB_PASS,
            array(PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION)
        );
        return $db;
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => '데이터베이스 연결 실패: ' . $e->getMessage()]);
        exit();
    }
}

// JSON 응답 함수
function jsonResponse($data, $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit();
}

// 요청 데이터 가져오기
function getRequestData() {
    $contentType = isset($_SERVER["CONTENT_TYPE"]) ? $_SERVER["CONTENT_TYPE"] : '';
    
    if (stripos($contentType, 'application/json') !== false) {
        $data = json_decode(file_get_contents('php://input'), true);
        return $data ?: [];
    }
    
    return $_POST;
}
?>