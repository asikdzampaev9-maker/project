<?php
header('Content-Type: text/html; charset=UTF-8');
require_once 'db.php';

// ─── Авторизация (HTTP Basic Auth) ───────────────────
$login    = $_SERVER['PHP_AUTH_USER'] ?? '';
$password = $_SERVER['PHP_AUTH_PW']   ?? '';

// FastCGI fallback
if ($login === '' && !empty($_SERVER['HTTP_AUTHORIZATION'])) {
    $decoded = base64_decode(substr($_SERVER['HTTP_AUTHORIZATION'], 6));
    [$login, $password] = array_pad(explode(':', $decoded, 2), 2, '');
}

$adminLogin    = 'admin';
$adminPassword = 'admin123';

if ($login !== $adminLogin || $password !== $adminPassword) {
    header('WWW-Authenticate: Basic realm="CodeNova Admin"');
    header('HTTP/1.0 401 Unauthorized');
    echo '<p style="font-family:sans-serif;padding:2rem">Доступ запрещён.</p>';
    exit;
}

// ─── Удаление заявки ─────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['delete_id'])) {
    try {
        $db = getDb();
        $stmt = $db->prepare("DELETE FROM requests WHERE id = :id");
        $stmt->execute([':id' => (int)$_POST['delete_id']]);
    } catch (Exception $e) {
        error_log('admin delete error: ' . $e->getMessage());
    }
    header('Location: admin.php');
    exit;
}

// ─── Загружаем заявки ────────────────────────────────
try {
    $db = getDb();
    $total    = $db->query("SELECT COUNT(*) FROM requests")->fetchColumn();
    $requests = $db->query(
        "SELECT id, name, phone, email, message, created_at FROM requests ORDER BY id DESC"
    )->fetchAll();
} catch (Exception $e) {
    error_log('admin.php error: ' . $e->getMessage());
    $total    = 0;
    $requests = [];
}
?>
<!DOCTYPE html>
<html lang="ru">
<head>
  <meta charset="UTF-8">
  <title>Админка — CodeNova</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 14px; background: #0a0a0a; color: #d4f5d4; }
    .wrap { max-width: 1100px; margin: 30px auto; padding: 0 16px; }
    h1 { font-size: 22px; color: #39ff14; margin-bottom: 20px; }
    h2 { font-size: 15px; color: #7dff4f; margin: 20px 0 10px; }
    .stat-card { display: inline-block; background: #111; border: 1px solid rgba(57,255,20,.2);
                 border-radius: 8px; padding: 14px 24px; margin-bottom: 24px; }
    .stat-card .num { font-size: 28px; font-weight: bold; color: #39ff14; }
    .stat-card .lbl { font-size: 12px; color: #6a9e6a; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; background: #0e120e;
            border-radius: 8px; overflow: hidden; border: 1px solid rgba(57,255,20,.15); }
    th { background: #1a2e1a; color: #39ff14; padding: 10px 12px; text-align: left; font-size: 13px; }
    td { padding: 9px 12px; border-bottom: 1px solid rgba(57,255,20,.08); font-size: 13px; vertical-align: top; }
    tr:last-child td { border-bottom: none; }
    tr:hover td { background: rgba(57,255,20,.04); }
    .msg { max-width: 280px; white-space: pre-wrap; word-break: break-word; }
    .date { color: #6a9e6a; font-size: 12px; }
    .btn-del { background: #3a0a0a; color: #ff5252; border: 1px solid #ff5252;
               padding: 4px 10px; border-radius: 4px; cursor: pointer; font-size: 12px; }
    .btn-del:hover { background: #ff5252; color: #fff; }
    .empty { text-align: center; color: #6a9e6a; padding: 24px; }
    a.back { color: #39ff14; text-decoration: none; font-size: 13px; }
    a.back:hover { text-decoration: underline; }
  </style>
</head>
<body>
<div class="wrap">
  <h1>Панель администратора — CodeNova</h1>
  <a class="back" href="index.html">← На сайт</a>

  <h2>Статистика</h2>
  <div class="stat-card">
    <div class="num"><?= (int)$total ?></div>
    <div class="lbl">Всего заявок</div>
  </div>

  <h2>Заявки</h2>
  <table>
    <tr>
      <th>ID</th>
      <th>Имя</th>
      <th>Телефон</th>
      <th>Email</th>
      <th>Сообщение</th>
      <th>Дата</th>
      <th>Действие</th>
    </tr>
    <?php foreach ($requests as $r): ?>
    <tr>
      <td><?= (int)$r['id'] ?></td>
      <td><?= htmlspecialchars($r['name']) ?></td>
      <td><?= htmlspecialchars($r['phone'] ?: '—') ?></td>
      <td><?= htmlspecialchars($r['email']) ?></td>
      <td class="msg"><?= htmlspecialchars($r['message']) ?></td>
      <td class="date"><?= htmlspecialchars($r['created_at']) ?></td>
      <td>
        <form method="POST" onsubmit="return confirm('Удалить заявку #<?= (int)$r['id'] ?>?')">
          <input type="hidden" name="delete_id" value="<?= (int)$r['id'] ?>">
          <button class="btn-del" type="submit">Удалить</button>
        </form>
      </td>
    </tr>
    <?php endforeach; ?>
    <?php if (empty($requests)): ?>
    <tr><td colspan="7" class="empty">Заявок пока нет</td></tr>
    <?php endif; ?>
  </table>
</div>
</body>
</html>
