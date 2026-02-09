import { Resend } from 'resend';

let connectionSettings: any;

async function getCredentials() {
  const hostname = process.env.REPLIT_CONNECTORS_HOSTNAME;
  const xReplitToken = process.env.REPL_IDENTITY
    ? 'repl ' + process.env.REPL_IDENTITY
    : process.env.WEB_REPL_RENEWAL
    ? 'depl ' + process.env.WEB_REPL_RENEWAL
    : null;

  if (!xReplitToken) {
    throw new Error('X_REPLIT_TOKEN not found for repl/depl');
  }

  connectionSettings = await fetch(
    'https://' + hostname + '/api/v2/connection?include_secrets=true&connector_names=resend',
    {
      headers: {
        'Accept': 'application/json',
        'X_REPLIT_TOKEN': xReplitToken
      }
    }
  ).then(res => res.json()).then(data => data.items?.[0]);

  if (!connectionSettings || (!connectionSettings.settings.api_key)) {
    throw new Error('Resend not connected');
  }
  return { apiKey: connectionSettings.settings.api_key, fromEmail: connectionSettings.settings.from_email };
}

async function getResendClient() {
  const { apiKey, fromEmail } = await getCredentials();
  return {
    client: new Resend(apiKey),
    fromEmail
  };
}

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const { client, fromEmail } = await getResendClient();

  await client.emails.send({
    from: fromEmail,
    to: 'info@monipack.com',
    subject: `Contact Form: ${data.subject}`,
    replyTo: data.email,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #c41e3a; border-bottom: 2px solid #c41e3a; padding-bottom: 10px;">New Contact Message</h2>
        <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 100px;">Name:</td>
            <td style="padding: 8px 12px;">${data.name}</td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email:</td>
            <td style="padding: 8px 12px;"><a href="mailto:${data.email}">${data.email}</a></td>
          </tr>
          <tr>
            <td style="padding: 8px 12px; font-weight: bold; color: #555;">Subject:</td>
            <td style="padding: 8px 12px;">${data.subject}</td>
          </tr>
        </table>
        <div style="margin-top: 20px; padding: 16px; background: #f5f5f5; border-radius: 8px;">
          <p style="font-weight: bold; color: #555; margin-bottom: 8px;">Message:</p>
          <p style="white-space: pre-wrap; line-height: 1.6;">${data.message}</p>
        </div>
        <p style="margin-top: 20px; color: #999; font-size: 12px;">Sent from monipack.com contact form</p>
      </div>
    `,
  });
}
