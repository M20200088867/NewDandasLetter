import { Resend } from "resend";

function getResend() {
  return new Resend(process.env.RESEND_API_KEY);
}

interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const { data, error } = await getResend().emails.send({
    from: "NewDandasLetter <onboarding@resend.dev>",
    to,
    subject,
    html,
  });

  if (error) {
    throw new Error(`Failed to send email to ${to}: ${error.message}`);
  }

  return data;
}

export async function sendBatchEmails(
  emails: SendEmailParams[]
): Promise<{ sent: number; failed: number; results: Array<{ to: string; id?: string; error?: string }> }> {
  const results: Array<{ to: string; id?: string; error?: string }> = [];
  let sent = 0;
  let failed = 0;

  // Send sequentially to respect rate limits
  for (const email of emails) {
    try {
      const data = await sendEmail(email);
      results.push({ to: email.to, id: data?.id });
      sent++;
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      results.push({ to: email.to, error: message });
      failed++;
    }
  }

  return { sent, failed, results };
}
