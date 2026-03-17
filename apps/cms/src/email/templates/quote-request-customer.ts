/**
 * HTML email template for customer confirmation when a quote request is submitted.
 */

export interface QuoteRequestCustomerData {
  name: string;
  businessPhone: string;
  businessEmail: string;
}

export function quoteRequestCustomerTemplate(data: QuoteRequestCustomerData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#1e3a5f;padding:20px 24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">Thank You, ${escapeHtml(data.name)}!</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;color:#333;font-size:15px;">
              We have received your quote request and a member of our team will be in touch shortly.
            </p>
            <p style="margin:0 0 16px;color:#333;font-size:15px;">
              If you need immediate assistance, feel free to contact us directly:
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
              <tr>
                <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#333;">Phone</td>
                <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${escapeHtml(data.businessPhone)}</td>
              </tr>
              <tr>
                <td style="padding:8px 12px;font-weight:bold;color:#333;">Email</td>
                <td style="padding:8px 12px;color:#555;">${escapeHtml(data.businessEmail)}</td>
              </tr>
            </table>
            <p style="margin:24px 0 0;color:#888;font-size:13px;">
              Thank you for choosing Xcel Locksmith. We look forward to helping you!
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
