<?php
require_once 'config.php';

// 요청 메소드 확인
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        handleGetEvents();
        break;
    case 'POST':
        handleCreateEvent();
        break;
    default:
        jsonResponse(['error' => '지원하지 않는 메소드입니다.'], 405);
}

// 이벤트 목록 조회
function handleGetEvents() {
    $type = isset($_GET['type']) ? $_GET['type'] : null;
    $date = isset($_GET['date']) ? $_GET['date'] : null;
    $month = isset($_GET['month']) ? $_GET['month'] : null;
    
    try {
        $db = getDB();
        $sql = "SELECT * FROM events WHERE 1=1";
        $params = [];
        
        if ($type) {
            $sql .= " AND type = :type";
            $params[':type'] = $type;
        }
        
        if ($date) {
            $sql .= " AND date = :date";
            $params[':date'] = $date;
        }
        
        if ($month) {
            $sql .= " AND DATE_FORMAT(date, '%Y-%m') = :month";
            $params[':month'] = $month;
        }
        
        $sql .= " ORDER BY date ASC, time ASC";
        
        $stmt = $db->prepare($sql);
        $stmt->execute($params);
        $events = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        jsonResponse(['events' => $events]);
    } catch (Exception $e) {
        jsonResponse(['error' => '이벤트 조회 실패: ' . $e->getMessage()], 500);
    }
}

// 이벤트 생성 (관리자용)
function handleCreateEvent() {
    $data = getRequestData();
    
    // 필수 필드 검증
    $required = ['title', 'date', 'time', 'location', 'price', 'max_participants', 'type', 'description'];
    foreach ($required as $field) {
        if (!isset($data[$field]) || empty($data[$field])) {
            jsonResponse(['error' => $field . ' 필드가 필요합니다.'], 400);
        }
    }
    
    try {
        $db = getDB();
        
        $sql = "INSERT INTO events (
            title, date, time, location, price, 
            current_participants, max_participants, 
            description, type, instructor, materials, 
            bank_account, open_chat_link, features
        ) VALUES (
            :title, :date, :time, :location, :price,
            0, :max_participants,
            :description, :type, :instructor, :materials,
            :bank_account, :open_chat_link, :features
        )";
        
        $stmt = $db->prepare($sql);
        $stmt->execute([
            ':title' => $data['title'],
            ':date' => $data['date'],
            ':time' => $data['time'],
            ':location' => $data['location'],
            ':price' => $data['price'],
            ':max_participants' => $data['max_participants'],
            ':description' => $data['description'],
            ':type' => $data['type'],
            ':instructor' => isset($data['instructor']) ? $data['instructor'] : null,
            ':materials' => isset($data['materials']) ? $data['materials'] : null,
            ':bank_account' => isset($data['bank_account']) ? $data['bank_account'] : '계좌정보 문의',
            ':open_chat_link' => isset($data['open_chat_link']) ? $data['open_chat_link'] : '#',
            ':features' => isset($data['features']) ? json_encode($data['features']) : null
        ]);
        
        $eventId = $db->lastInsertId();
        jsonResponse(['success' => true, 'event_id' => $eventId], 201);
    } catch (Exception $e) {
        jsonResponse(['error' => '이벤트 생성 실패: ' . $e->getMessage()], 500);
    }
}
?>