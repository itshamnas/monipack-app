import { Resend } from 'resend';

export async function sendContactEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY not configured');
  }

  const resend = new Resend(apiKey);

  await resend.emails.send({
    from: 'MoniPack Contact <onboarding@resend.dev>',
    to: 'connect@imshamnas.com',
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
