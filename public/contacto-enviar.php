<?php
declare(strict_types=1);

/*
|--------------------------------------------------------------------------
| Respuesta JSON
|--------------------------------------------------------------------------
| Este archivo devuelve siempre JSON para que el formulario lo procese
| correctamente desde JavaScript.
*/
header('Content-Type: application/json; charset=utf-8');

/*
|--------------------------------------------------------------------------
| Cargar PHPMailer manualmente
|--------------------------------------------------------------------------
| Se cargan los archivos necesarios de PHPMailer desde la carpeta local.
| Asegúrate de que esta ruta exista también en el servidor.
*/
require __DIR__ . '/phpmailer/src/Exception.php';
require __DIR__ . '/phpmailer/src/PHPMailer.php';
require __DIR__ . '/phpmailer/src/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/*
|--------------------------------------------------------------------------
| Cargar configuración local (solo si existe)
|--------------------------------------------------------------------------
| Permite tener la contraseña SMTP en un archivo local que no subes a Git.
| En producción puedes:
| 1) subir config.local.php, o
| 2) definir SMTP_PASS como variable de entorno en el servidor.
*/
$local = __DIR__ . '/config.local.php';
if (is_file($local)) {
    $cfg = require $local;
    if (is_array($cfg) && !empty($cfg['SMTP_PASS'])) {
        putenv('SMTP_PASS=' . $cfg['SMTP_PASS']);
    }
}

/*
|--------------------------------------------------------------------------
| Configuración del correo de destino
|--------------------------------------------------------------------------
| Dirección donde recibirás los mensajes enviados desde el formulario web.
*/
$TO_EMAIL = 'info@saludanimalcasablanca.es';
$TO_NAME  = 'Salud Animal Casablanca';

/*
|--------------------------------------------------------------------------
| Configuración SMTP
|--------------------------------------------------------------------------
| Datos del servidor de correo saliente.
| Aquí NO hay localhost, así que no hace falta cambiar nada por ese motivo.
| Solo debes asegurarte de que estos datos son correctos en Arsys.
*/
$SMTP_HOST = 'smtp.serviciodecorreo.es';
$SMTP_USER = 'info@saludanimalcasablanca.es';
$SMTP_PASS = getenv('SMTP_PASS') ?: '';
$SMTP_PORT = 465;

/*
|--------------------------------------------------------------------------
| Validar contraseña SMTP
|--------------------------------------------------------------------------
| Si no existe la contraseña, el envío no puede funcionar.
*/
if ($SMTP_PASS === '') {
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => 'Configuración SMTP incompleta (SMTP_PASS no definido)'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Recoger datos del formulario
|--------------------------------------------------------------------------
| Se recogen los campos enviados por POST desde el formulario de contacto.
*/
$nombre    = trim($_POST['nombre'] ?? '');
$email     = trim($_POST['email'] ?? '');
$asunto    = trim($_POST['asunto'] ?? 'Consulta desde la web');
$mensaje   = trim($_POST['mensaje'] ?? '');
$website   = trim($_POST['website'] ?? '');
$form_time = intval($_POST['form_time'] ?? 0);

/*
|--------------------------------------------------------------------------
| Protección anti-spam: honeypot
|--------------------------------------------------------------------------
| El campo "website" debería venir vacío.
| Si llega con contenido, probablemente es un bot.
*/
if ($website !== '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Spam detectado'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Protección anti-spam: envío demasiado rápido
|--------------------------------------------------------------------------
| Si el formulario se envía en menos de 3 segundos desde su carga,
| se considera sospechoso.
*/
if ($form_time > 0 && (time() - $form_time) < 3) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Envío demasiado rápido'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Validación de campos
|--------------------------------------------------------------------------
| Se valida nombre, email y longitud mínima del mensaje.
*/
if ($nombre === '') {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Nombre vacío'
    ]);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Email no válido'
    ]);
    exit;
}

if (mb_strlen($mensaje) < 10) {
    http_response_code(400);
    echo json_encode([
        'ok' => false,
        'message' => 'Mensaje demasiado corto'
    ]);
    exit;
}

/*
|--------------------------------------------------------------------------
| Escapar contenido para HTML
|--------------------------------------------------------------------------
| Se limpian los campos antes de insertarlos en el cuerpo HTML del email.
| Esto evita inyecciones y caracteres problemáticos.
*/
$nombre_h  = htmlspecialchars($nombre, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$email_h   = htmlspecialchars($email, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$asunto_h  = htmlspecialchars($asunto, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
$mensaje_h = nl2br(htmlspecialchars($mensaje, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'));

/*
|--------------------------------------------------------------------------
| Envío del correo con PHPMailer
|--------------------------------------------------------------------------
| Se configura el servidor SMTP, remitente, destinatario y contenido
| del mensaje.
*/
try {
    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 0;
    $mail->CharSet   = 'UTF-8';

    /*
    |--------------------------------------------------------------------------
    | Configuración del servidor SMTP
    |--------------------------------------------------------------------------
    | Usamos autenticación SMTP por SSL en el puerto 465.
    */
    $mail->isSMTP();
    $mail->Host       = $SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = $SMTP_USER;
    $mail->Password   = $SMTP_PASS;
    $mail->SMTPSecure = 'ssl';
    $mail->Port       = $SMTP_PORT;

    /*
    |--------------------------------------------------------------------------
    | Remitente y destinatario
    |--------------------------------------------------------------------------
    | El remitente debe ser una cuenta real del dominio.
    | El email del cliente se coloca como Reply-To para poder responderle.
    */
    $mail->setFrom($SMTP_USER, 'Web Salud Animal');
    $mail->addReplyTo($email, $nombre);
    $mail->addAddress($TO_EMAIL, $TO_NAME);

    /*
    |--------------------------------------------------------------------------
    | Contenido del mensaje
    |--------------------------------------------------------------------------
    | Se envía una versión HTML y otra en texto plano.
    */
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

    /*
    |--------------------------------------------------------------------------
    | Enviar correo
    |--------------------------------------------------------------------------
    */
    $mail->send();

    echo json_encode([
        'ok' => true,
        'message' => 'Mensaje enviado correctamente'
    ]);

} catch (Exception $e) {
    /*
    |--------------------------------------------------------------------------
    | Error en el envío
    |--------------------------------------------------------------------------
    | Si falla el correo, devolvemos error 500 con el mensaje de PHPMailer.
    */
    http_response_code(500);
    echo json_encode([
        'ok' => false,
        'message' => $mail->ErrorInfo
    ]);
}