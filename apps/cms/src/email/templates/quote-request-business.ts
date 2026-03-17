/**
 * HTML email template for business notification when a new quote request is submitted.
 */

export interface QuoteRequestBusinessData {
  name: string;
  phone: string;
  email?: string | null;
  serviceType?: string | null;
  location?: string | null;
  notes?: string | null;
}

export function quoteRequestBusinessTemplate(data: QuoteRequestBusinessData): string {
  const rows = [
    { label: 'Name', value: data.name },
    { label: 'Phone', value: data.phone },
    { label: 'Email', value: data.email || '—' },
    { label: 'Service Type', value: data.serviceType || '—' },
    { label: 'Location', value: data.location || '—' },
    { label: 'Notes', value: data.notes || '—' },
  ];

  const tableRows = rows
    .map(
      (r) =>
        `<tr>
          <td style="padding:8px 12px;font-weight:bold;border-bottom:1px solid #eee;color:#333;">${r.label}</td>
          <td style="padding:8px 12px;border-bottom:1px solid #eee;color:#555;">${escapeHtml(r.value)}</td>
        </tr>`,
    )
    .join('');

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8" /></head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:24px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;">
        <tr>
          <td style="background:#1e3a5f;padding:20px 24px;">
            <h1 style="margin:0;color:#ffffff;font-size:20px;">New Quote Request</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;">
            <p style="margin:0 0 16px;color:#333;font-size:15px;">A new quote request has been submitted on the Xcel Locksmith website.</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #eee;border-radius:4px;">
              ${tableRows}
            </table>
            <p style="margin:24px 0 0;color:#888;font-size:13px;">Please follow up with the customer as soon as possible.</p>
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
