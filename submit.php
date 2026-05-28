<?php
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Origin: *');

require_once 'db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Method Not Allowed']);
    exit;
}

// Получаем и чистим данные
$name    = trim($_POST['name']    ?? '');
$phone   = trim($_POST['phone']   ?? '');
$email   = trim($_POST['email']   ?? '');
$message = trim($_POST['message'] ?? '');

// Валидация
$errors = [];
if (mb_strlen($name) < 2)         $errors[] = 'Введите имя';
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) $errors[] = 'Некорректный email';
if (mb_strlen($message) < 10)     $errors[] = 'Сообщение слишком короткое';

if ($errors) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

try {
    $db = getDb();
    $stmt = $db->prepare(
        "INSERT INTO requests (name, phone, email, message, created_at)
         VALUES (:name, :phone, :email, :message, NOW())"
    );
    $stmt->execute([
        ':name'    => $name,
        ':phone'   => $phone,
        ':email'   => $email,
        ':message' => $message,
    ]);

    echo json_encode(['ok' => true]);
} catch (Exception $e) {
    error_log('submit.php error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Ошибка сервера. Попробуйте позже.']);
}
