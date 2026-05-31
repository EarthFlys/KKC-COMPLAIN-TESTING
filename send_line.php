<?php
// ตั้งค่า Header สำหรับ API
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

// จัดการ Request แบบ OPTIONS (Preflight) ของ Browser
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// รับข้อมูล JSON ที่ส่งมาจากหน้าเว็บ
$data = json_decode(file_get_contents("php://input"));
$message = isset($data->message) ? $data->message : '';

if (empty($message)) {
    http_response_code(400);
    echo json_encode(["error" => "ไม่มีข้อความส่งมา"]);
    exit;
}

// Token ที่ได้มาจากระบบ (Channel Access Token)
$lineToken = 'n8IV3g+a9mkQPJ/Wg+MzaTfrqjKsn9hGF/JlE8v8KzplhNSN9xAfcl9p2F1NF8/9TolFzBUnIE3HDlbwINrTz6sJzorst4JZSO39NWa0t4qIokPAeuHxGarC+Qtbuwi/7m0g4JRz5D7KiFbna4bgswdB04t89/1O/w1cDnyilFU=';

// ตั้งค่า cURL เพื่อส่งไป LINE Messaging API
$ch = curl_init('https://api.line.me/v2/bot/message/broadcast');
$payload = json_encode([
    'messages' => [
        ['type' => 'text', 'text' => $message]
    ]
]);

curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $lineToken
]);

$response = curl_exec($ch);
$httpcode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpcode == 200) {
    http_response_code(200);
    echo json_encode(["status" => "success", "response" => json_decode($response)]);
} else {
    http_response_code($httpcode);
    echo json_encode(["status" => "error", "message" => "ส่ง LINE ไม่สำเร็จ", "line_response" => json_decode($response)]);
}
?>
