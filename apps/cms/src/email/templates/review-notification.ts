/**
 * HTML email template for admin notification when a new review is submitted.
 */

export interface ReviewNotificationData {
  customerName: string;
  starRating: number;
  reviewText: string;
}

export function reviewNotificationTemplate(data: ReviewNotificationData): string {
  const stars = '★'.repeat(data.starRating) + '☆'.repeat(5 - data.starRating);

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#1e3a5f;padding:20px 24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">New Review Submitted</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;color:#333;font-size:15px;">A new review has been submitted on the Xcel Locksmith website.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
              <tr>
                <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#333;">Customer</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${escapeHtml(data.customerName)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#333;">Rating</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#f59e0b;font-size:18px;">${stars}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:bold;color:#333;">Review</td>
                <td style="padding:8px 12px;color:#555;">${escapeHtml(data.reviewText)}</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#888;font-size:13px;">
              This review requires approval before it appears on the website. Log in to the admin panel to review and approve.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
