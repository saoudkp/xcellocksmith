'use client'

import React from 'react'

export const WhatsAppSetupGuide: React.FC = () => {
  return (
    <div style={{
      marginTop: '1.5rem',
      padding: '1.25rem 1.5rem',
      borderRadius: '8px',
      border: '1px solid #25d366',
      background: 'rgba(37,211,102,0.06)',
      fontSize: '0.875rem',
      lineHeight: '1.6',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '1.25rem' }}>📱</span>
        <strong style={{ fontSize: '0.95rem' }}>How to set up WAHA</strong>
      </div>
      <ol style={{ margin: 0, paddingLeft: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
        <li>Install Docker on your server if you haven't already.</li>
        <li>
          Run WAHA:{' '}
          <code style={{ background: '#1a1a1a', color: '#25d366', padding: '1px 6px', borderRadius: '4px', fontSize: '0.8rem' }}>
            docker run -d --name waha -p 3002:3000 devlikeapro/waha
          </code>
        </li>
        <li>Open <strong>http://localhost:3002</strong> → Sessions → Start a session.</li>
        <li>Scan the QR code with your business WhatsApp.</li>
        <li>Fill in the WAHA URL and your business phone number above, then enable notifications.</li>
        <li>Submit a test quote from the website to verify it works.</li>
      </ol>
      <div style={{ marginTop: '0.75rem', color: '#888', fontSize: '0.8rem' }}>
        💡 Use a dedicated WhatsApp number for the business — the session takes over the number from the phone app.
      </div>
    </div>
  )
}

export default WhatsAppSetupGuide
