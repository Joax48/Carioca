// Todas las plantillas de correo de Carioca en un solo lugar.

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,          // false para 587 STARTTLS
  requireTLS: true,       // fuerza STARTTLS (necesario para Gmail)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,  // evita errores de certificado en algunos hosts
  },
});

// Verificar conexión al iniciar (loguea el error sin crashear el servidor)
transporter.verify().catch(err =>
  console.error('[Email] Error al conectar con el servidor SMTP:', err.message)
);

const SINPE = process.env.STORE_SINPE ?? '';

// ── Plantilla base (HTML compartido) ────────────────────
function baseTemplate(title, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: Georgia, serif; color: #2a2118; background: #FAF8F5; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #fff; border: 1px solid #e8e0d8; }
        .header { background: #2a2118; padding: 32px 40px; text-align: center; }
        .header h1 { color: #C8A882; font-size: 22px; letter-spacing: 0.15em; margin: 0; font-family: Georgia, serif; }
        .body { padding: 40px; line-height: 1.7; font-size: 15px; }
        .body p { margin: 0 0 16px; }
        .footer { padding: 20px 40px; background: #f2ede6; font-size: 12px; color: #888; text-align: center; font-family: sans-serif; }
        .btn { display: inline-block; background: #2a2118; color: #FAF8F5 !important; padding: 14px 36px;
               font-family: sans-serif; font-size: 11px; letter-spacing: 0.12em; text-decoration: none;
               text-transform: uppercase; margin-top: 8px; }
        .sinpe-box { background: #f8f4ef; border-left: 3px solid #C8A882; padding: 16px 20px;
                     margin: 20px 0; font-family: sans-serif; }
        .sinpe-box .label { font-size: 10px; letter-spacing: 0.1em; text-transform: uppercase;
                            color: #9E7E56; font-weight: 600; margin-bottom: 6px; }
        .sinpe-box .phone { font-size: 22px; font-weight: 700; color: #2a2118; letter-spacing: 0.05em; }
        .sinpe-box .note  { font-size: 12px; color: #888; margin-top: 6px; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0;
                    border-bottom: 0.5px solid #e8e0d8; font-family: sans-serif; font-size: 13px; }
        .info-row:last-child { border-bottom: none; }
        .info-row .key { color: #888; }
        .info-row .val { font-weight: 500; color: #2a2118; }
        .total-row { font-size: 15px; font-weight: 700; }
      </style>
    </head>
    <body>
      <div class="wrap">
        <div class="header"><h1>CARIOCA</h1></div>
        <div class="body">${bodyHtml}</div>
        <div class="footer">© ${new Date().getFullYear()} Carioca Athletic Wear · Costa Rica</div>
      </div>
    </body>
    </html>
  `;
}

// ── 1. Confirmación de pedido recibido (estado: pending) ─
export async function sendOrderReceived({ to, customerName, orderId, total, deliveryMethod }) {
  const isPickup   = deliveryMethod === 'pickup';
  const deliveryHtml = isPickup
    ? `<p>📍 <strong>Retiro en tienda</strong> — Te contactaremos para coordinar el horario de retiro en nuestra tienda en <strong>Pozos de Santa Ana</strong>.</p>`
    : `<p>🚚 <strong>Envío a domicilio</strong> — Tu pedido será enviado por mensajería privada una vez confirmado el pago.</p>`;

  const sinpeHtml = SINPE ? `
    <p>Para confirmar tu pedido, realizá la transferencia por SINPE Móvil:</p>
    <div class="sinpe-box">
      <div class="label">Número SINPE Móvil</div>
      <div class="phone">${SINPE}</div>
      <div class="note">Monto: <strong>₡${Number(total).toLocaleString('es-CR')}</strong> · Indicá tu nombre en la descripción</div>
    </div>
    <p style="font-size:13px;color:#888;">Una vez verifiquemos el pago, recibirás un correo de confirmación.</p>
  ` : `
    <p>Te contactaremos a la brevedad con los detalles del pago por SINPE Móvil.</p>
  `;

  const html = baseTemplate('Pedido recibido', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>Recibimos tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong>
       por un total de <strong>₡${Number(total).toLocaleString('es-CR')}</strong>. ¡Gracias por tu compra!</p>

    ${deliveryHtml}
    ${sinpeHtml}

    <p style="font-size:13px;color:#aaa;margin-top:24px;">
      Si tenés alguna duda, respondé este correo o escribinos por Instagram.
    </p>
  `);

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Carioca · Pedido recibido #${orderId.slice(0,8).toUpperCase()}`,
    html,
  });
}

// ── 2. Pedido confirmado (pago verificado) ───────────────
export async function sendOrderConfirmed({ to, customerName, orderId, deliveryMethod }) {
  const isPickup = deliveryMethod === 'pickup';
  const nextStep = isPickup
    ? 'Nos pondremos en contacto para coordinar el horario de retiro en nuestra tienda en <strong>Pozos de Santa Ana</strong>.'
    : 'Ya estamos preparando todo para el envío. Te avisaremos cuando tu pedido esté en camino.';

  const html = baseTemplate('¡Pago confirmado!', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>✅ Confirmamos el pago de tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong>.</p>
    <p>${nextStep}</p>
  `);

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Carioca · ¡Pago confirmado! #${orderId.slice(0,8).toUpperCase()}`,
    html,
  });
}

// ── 3. Pedido enviado (en camino) ───────────────────────
export async function sendOrderShipped({ to, customerName, orderId }) {
  const html = baseTemplate('¡Tu pedido está en camino!', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>🚚 Tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong> ya fue despachado
       y está en camino hacia vos.</p>
    <p>La mensajería se pondrá en contacto para coordinar la entrega.
       Tené a mano tu teléfono por si necesitan confirmarte la dirección.</p>
    <p style="font-size:13px;color:#888;">
      Si tenés alguna duda, respondé este correo o escribinos por Instagram.
    </p>
  `);

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Carioca · ¡Tu pedido #${orderId.slice(0,8).toUpperCase()} está en camino! 🚚`,
    html,
  });
}

// ── 4. Pedido entregado + solicitud de reseña ────────────
export async function sendOrderCompleted({ to, customerName, orderId, reviewUrl }) {
  const html = baseTemplate('¿Cómo fue tu experiencia?', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>Tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong> fue entregado.
       Esperamos que tus prendas te encanten 🤍</p>
    <p>¿Nos contás cómo estuvo tu experiencia? Tu opinión ayuda a otras mujeres
       a descubrir Carioca.</p>
    <p style="text-align:center;margin-top:32px;">
      <a href="${reviewUrl}" class="btn">Dejar mi reseña</a>
    </p>
    <p style="font-size:12px;color:#aaa;margin-top:24px;text-align:center;">
      Solo tomará 2 minutos.
    </p>
  `);

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: 'Carioca · ¡Tu pedido llegó! Contanos cómo estuvo 🤍',
    html,
  });
}

// ── 5. Mensaje de contacto ──────────────────────────────
export async function sendContactMessage({ name, email, subject, message }) {
  const storeEmail = process.env.STORE_EMAIL ?? process.env.EMAIL_FROM ?? 'hola@carioca.cr';
  const html = baseTemplate('Nuevo mensaje de contacto', `
    <p><strong>Nombre:</strong> ${name}</p>
    <p><strong>Correo:</strong> <a href="mailto:${email}">${email}</a></p>
    <p><strong>Asunto:</strong> ${subject || '—'}</p>
    <hr style="border:none;border-top:0.5px solid #e8e0d8;margin:20px 0;" />
    <p style="white-space:pre-wrap;">${message}</p>
  `);

  return transporter.sendMail({
    from:     process.env.EMAIL_FROM,
    to:       storeEmail,
    replyTo:  email,
    subject:  `Carioca · Contacto: ${subject || 'Sin asunto'} (${name})`,
    html,
  });
}
