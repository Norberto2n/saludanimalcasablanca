<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

// Cargar PHPMailer manual
require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// ===============================
// CONFIGURACIÓN ARSYS
// ===============================

$TO_EMAIL   = 'info@saludanimalcasablanca.es';
$TO_NAME    = 'Salud Animal Casablanca';

$SMTP_HOST  = 'smtp.serviciodecorreo.es';
$SMTP_USER  = 'info@saludanimalcasablanca.es';
$SMTP_PASS  = getenv('SMTP_PASS');
$SMTP_PORT  = 465;

// ===============================

// Recoger datos
$nombre  = trim($_POST['nombre'] ?? '');
$email   = trim($_POST['email'] ?? '');
$asunto  = trim($_POST['asunto'] ?? 'Consulta desde la web');
$mensaje = trim($_POST['mensaje'] ?? '');

// Validación básica
if (!$nombre || !filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($mensaje) < 5) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'Datos inválidos']);
    exit;
}

try {
    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';

    // Servidor SMTP
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // SSL
    $mail->Port       = $SMTP_PORT;

    // Remitente (DEBE ser el del dominio)
    $mail->setFrom('info@saludanimalcasablanca.es', 'Web Salud Animal');

    // ReplyTo = cliente
    $mail->addReplyTo($email, $nombre);

    // Destino
    $mail->addAddress($TO_EMAIL, $TO_NAME);

    $mail->isHTML(true);
    $mail->Subject = "Nuevo mensaje desde la web: " . htmlspecialchars($asunto, ENT_QUOTES, 'UTF-8');
    $mail->Body = "
        <h2>Nuevo mensaje desde la web</h2>
        <p><strong>Nombre:</strong> " . htmlspecialchars($nombre, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Email:</strong> " . htmlspecialchars($email, ENT_QUOTES, 'UTF-8') . "</p>
        <p><strong>Asunto:</strong> " . htmlspecialchars($asunto, ENT_QUOTES, 'UTF-8') . "</p>
        <hr>
        <p>" . nl2br(htmlspecialchars($mensaje, ENT_QUOTES, 'UTF-8')) . "</p>
    ";

    $mail->AltBody = "Nuevo mensaje\n\nNombre: $nombre\nEmail: $email\nAsunto: $asunto\n\nMensaje:\n$mensaje";

    $mail->send();

    echo json_encode(['ok' => true, 'message' => 'Mensaje enviado correctamente']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error al enviar el mensaje']);
}