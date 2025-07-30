<?php
require_once 'config.php';

// 요청 메소드 확인
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'POST':
        handleApplication();
        break;
    default:
        jsonResponse(['error' => '지원하지 않는 메소드입니다.'], 405);
}

// 이벤트 신청 처리
function handleApplication() {
    $data = getRequestData();
    
    // 필수 필드 검증
    if (!isset($data['event_id']) || !isset($data['name']) || !isset($data['phone']) || !isset($data['email'])) {
        jsonResponse(['error' => '필수 정보가 누락되었습니다.'], 400);
    }
    
    try {
        $db = getDB();
        
        // 트랜잭션 시작
        $db->beginTransaction();
        
        // 이벤트 정보 조회 및 잠금
        $stmt = $db->prepare("SELECT * FROM events WHERE id = :id FOR UPDATE");
        $stmt->execute([':id' => $data['event_id']]);
        $event = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$event) {
            $db->rollback();
            jsonResponse(['error' => '존재하지 않는 이벤트입니다.'], 404);
        }
        
        // 정원 확인
        if ($event['current_participants'] >= $event['max_participants']) {
            $db->rollback();
            jsonResponse(['error' => '정원이 마감되었습니다.'], 400);
        }
        
        // 중복 신청 확인
        $stmt = $db->prepare("SELECT id FROM applications WHERE event_id = :event_id AND email = :email");
        $stmt->execute([
            ':event_id' => $data['event_id'],
            ':email' => $data['email']
        ]);
        
        if ($stmt->fetch()) {
            $db->rollback();
            jsonResponse(['error' => '이미 신청하신 이벤트입니다.'], 400);
        }
        
        // 신청 정보 저장
        $stmt = $db->prepare("INSERT INTO applications (event_id, name, phone, email, message, created_at) 
                             VALUES (:event_id, :name, :phone, :email, :message, NOW())");
        $stmt->execute([
            ':event_id' => $data['event_id'],
            ':name' => $data['name'],
            ':phone' => $data['phone'],
            ':email' => $data['email'],
            ':message' => isset($data['message']) ? $data['message'] : null
        ]);
        
        // 참가자 수 업데이트
        $stmt = $db->prepare("UPDATE events SET current_participants = current_participants + 1 WHERE id = :id");
        $stmt->execute([':id' => $data['event_id']]);
        
        // 트랜잭션 커밋
        $db->commit();
        
        // 신청 확인 이메일 발송 (실제 환경에서는 이메일 발송 로직 추가)
        // sendConfirmationEmail($data['email'], $event);
        
        jsonResponse([
            'success' => true,
            'message' => '신청이 완료되었습니다.',
            'event_title' => $event['title'],
            'event_date' => $event['date'],
            'bank_account' => $event['bank_account']
        ]);
        
    } catch (Exception $e) {
        $db->rollback();
        jsonResponse(['error' => '신청 처리 실패: ' . $e->getMessage()], 500);
    }
}
?>