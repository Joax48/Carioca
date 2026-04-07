// Todas las plantillas de correo de Carioca en un solo lugar.

import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host:   process.env.SMTP_HOST,
  port:   Number(process.env.SMTP_PORT),
  secure: false,        // true para 465, false para 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// ── Plantilla base (HTML compartido) ────────────────────
function baseTemplate(title, bodyHtml) {
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Georgia', serif; color: #2a2118; background: #FAF8F5; margin: 0; padding: 0; }
        .wrap { max-width: 560px; margin: 40px auto; background: #fff; border: 1px solid #e8e0d8; }
        .header { background: #2a2118; padding: 32px 40px; text-align: center; }
        .header h1 { color: #C8A882; font-size: 22px; letter-spacing: 0.15em; margin: 0; }
        .body { padding: 40px; }
        .footer { padding: 20px 40px; background: #f2ede6; font-size: 12px; color: #888; text-align: center; }
        .btn { display: inline-block; background: #2a2118; color: #FAF8F5; padding: 12px 32px;
               font-family: sans-serif; font-size: 12px; letter-spacing: 0.1em; text-decoration: none;
               text-transform: uppercase; margin-top: 24px; }
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
export async function sendOrderReceived({ to, customerName, orderId, total }) {
  const html = baseTemplate('Pedido recibido', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>Recibimos tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong>
       por un total de <strong>₡${Number(total).toLocaleString('es-CR')}</strong>.</p>
    <p>Tu pedido está <strong>pendiente de confirmación de pago</strong>.
       Una vez verifiquemos tu transferencia SINPE, recibirás otro correo confirmando el pedido.</p>
    <p style="font-size:13px;color:#666;">
      Si ya realizaste el pago, no te preocupés — lo estaremos verificando pronto.
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
export async function sendOrderConfirmed({ to, customerName, orderId }) {
  const html = baseTemplate('Pedido confirmado', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>¡Confirmamos el pago de tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong>!
       Ya estamos preparando todo para el envío.</p>
    <p>Te avisaremos cuando tu pedido esté en camino.</p>
  `);

  return transporter.sendMail({
    from:    process.env.EMAIL_FROM,
    to,
    subject: `Carioca · ¡Pago confirmado! #${orderId.slice(0,8).toUpperCase()}`,
    html,
  });
}

// ── 3. Pedido entregado + solicitud de testimonio ────────
export async function sendOrderCompleted({ to, customerName, orderId, reviewUrl }) {
  const html = baseTemplate('¿Cómo fue tu experiencia?', `
    <p>Hola <strong>${customerName}</strong>,</p>
    <p>Tu pedido <strong>#${orderId.slice(0,8).toUpperCase()}</strong> fue entregado.
       Esperamos que tus prendas te encanten 🤍</p>
    <p>¿Nos contás cómo estuvo tu experiencia? Tu opinión ayuda a otras mujeres
       a descubrir Carioca.</p>
    <a href="${reviewUrl}" class="btn">Dejar mi reseña</a>
    <p style="font-size:12px;color:#aaa;margin-top:24px;">
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
