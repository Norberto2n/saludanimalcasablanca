<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Cargar PHPMailer manual
require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/*
|--------------------------------------------------------------------------
| Cargar configuración local (solo si existe)
|--------------------------------------------------------------------------
| Permite usar config.local.php en local sin subir credenciales a Git
*/
$local = __DIR__ . '/../config.local.php';
if (is_file($local)) {
    $cfg = require $local;
    if (is_array($cfg) && !empty($cfg['SMTP_PASS'])) {
        putenv('SMTP_PASS=' . $cfg['SMTP_PASS']);
    }
}

// ===============================
// CONFIGURACIÓN ARSYS
// ===============================
$TO_EMAIL   = 'info@saludanimalcasablanca.es';
$TO_NAME    = 'Salud Animal Casablanca';

$SMTP_HOST  = 'smtp.serviciodecorreo.es';
$SMTP_USER  = 'info@saludanimalcasablanca.es';
$SMTP_PASS  = getenv('SMTP_PASS') ?: '';
$SMTP_PORT  = 465;

// Validar que existe la pass en entorno
if ($SMTP_PASS === '') {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Configuración SMTP incompleta (SMTP_PASS no definido)'
    ]);
    exit;
}

// ===============================
// Recoger datos
// ===============================
$nombre  = trim($_POST['nombre'] ?? '');
$email   = trim($_POST['email'] ?? '');
$asunto  = trim($_POST['asunto'] ?? 'Consulta desde la web');
$mensaje = trim($_POST['mensaje'] ?? '');

// Validación básica
if ($nombre === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($mensaje) < 5) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Datos inválidos']);
    exit;
}

// Escapar para HTML (evita inyección)
$nombre_h  = htmlspecialchars($nombre, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$email_h   = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$asunto_h  = htmlspecialchars($asunto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$mensaje_h = nl2br(htmlspecialchars($mensaje, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

try {
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';

    // Servidor SMTP
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL/TLS implícito
    $mail->Port       = $SMTP_PORT;

    // Remitente (DEBE ser el del dominio)
    $mail->setFrom($SMTP_USER, 'Web Salud Animal');

    // ReplyTo = cliente
    $mail->addReplyTo($email, $nombre);

    // Destino
    $mail->addAddress($TO_EMAIL, $TO_NAME);

    $mail->isHTML(true);
    $mail->Subject = "Nuevo mensaje desde la web: {$asunto_h}";
    $mail->Body = "
        <h2>Nuevo mensaje desde la web</h2>
        <p><strong>Nombre:</strong> {$nombre_h}</p>
        <p><strong>Email:</strong> {$email_h}</p>
        <p><strong>Asunto:</strong> {$asunto_h}</p>
        <hr>
        <p>{$mensaje_h}</p>
    ";

    $mail->AltBody =
        "Nuevo mensaje desde la web\n\n" .
        "Nombre: {$nombre}\n" .
        "Email: {$email}\n" .
        "Asunto: {$asunto}\n\n" .
        "Mensaje:\n{$mensaje}\n";

    $mail->send();

    echo json_encode(['ok' => true, 'message' => 'Mensaje enviado correctamente']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al enviar el mensaje']);
}