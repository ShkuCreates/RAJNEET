import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

interface DebateNotificationEmailProps {
  to: string;
  debateTopic: string;
  debateId: string;
  scheduledAt: Date;
}

export async function sendDebateNotificationEmail({
  to,
  debateTopic,
  debateId,
  scheduledAt,
}: DebateNotificationEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "RAJNEET <notifications@raajneet.com>",
      to: [to],
      subject: `New Debate on RAJNEET: ${debateTopic}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>New Debate Notification</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">RAJNEET</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">New Debate Scheduled</h2>
              <p style="color: #4b5563;">A new debate has been scheduled on RAJNEET:</p>
              
              <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #3b82f6; margin: 20px 0;">
                <h3 style="color: #1f2937; margin-top: 0;">${debateTopic}</h3>
                <p style="color: #6b7280; margin: 5px 0 0 0;">
                  <strong>Scheduled:</strong> ${scheduledAt.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}
                </p>
              </div>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/debates/${debateId}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Join the Debate</a>
              </div>
              
              <p style="color: #6b7280; font-size: 12px; text-align: center; margin-top: 30px;">
                You're receiving this email because you subscribed to debate notifications on RAJNEET.
              </p>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}

interface WeeklyDigestEmailProps {
  to: string;
  topNews: Array<{ headline: string; url: string }>;
  topDebateResult: string;
  topArticle: string;
  topOpinion: string;
}

export async function sendWeeklyDigestEmail({
  to,
  topNews,
  topDebateResult,
  topArticle,
  topOpinion,
}: WeeklyDigestEmailProps) {
  try {
    const { data, error } = await resend.emails.send({
      from: "RAJNEET <digest@raajneet.com>",
      to: [to],
      subject: "RAJNEET Weekly Digest",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Weekly Digest</title>
          </head>
          <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; padding: 20px; background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0; font-size: 24px;">RAJNEET Weekly Digest</h1>
            </div>
            <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; border: 1px solid #e5e7eb;">
              <h2 style="color: #1f2937; margin-top: 0;">Top Stories This Week</h2>
              ${topNews.map(news => `
                <div style="margin: 15px 0; padding: 15px; background: white; border-radius: 8px;">
                  <a href="${news.url}" style="color: #3b82f6; text-decoration: none; font-weight: bold;">${news.headline}</a>
                </div>
              `).join('')}
              
              <h2 style="color: #1f2937; margin-top: 30px;">Top Debate Result</h2>
              <p style="color: #4b5563;">${topDebateResult}</p>
              
              <h2 style="color: #1f2937; margin-top: 30px;">Top Article</h2>
              <p style="color: #4b5563;">${topArticle}</p>
              
              <h2 style="color: #1f2937; margin-top: 30px;">Opinion of the Week</h2>
              <p style="color: #4b5563;">${topOpinion}</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}" style="display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit RAJNEET</a>
              </div>
            </div>
          </body>
        </html>
      `,
    });

    if (error) {
      console.error("Error sending email:", error);
      return { success: false, error };
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error sending email:", error);
    return { success: false, error };
  }
}
