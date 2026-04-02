'use client'

import React, { useState, useEffect, useCallback } from 'react'

export const WhatsAppConnectionPanel: React.FC = () => {
  const [status, setStatus] = useState<string>('checking...')
  const [connected, setConnected] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/waha?action=status')
      const data = await res.json()
      setConnected(data.connected)
      setStatus(data.status)
      setPhone(data.phone)
      setName(data.name)
      setError(null)
      if (data.connected) setQrUrl(null)
    } catch (e: any) {
      setError(e.message)
      setStatus('ERROR')
    }
  }, [])

  useEffect(() => {
    checkStatus()
    const interval = setInterval(checkStatus, 5000)
    return () => clearInterval(interval)
  }, [checkStatus])

  const startSession = async () => {
    setLoading(true)
    setError(null)
    try {
      await fetch('/api/waha?action=start', { method: 'POST' })
      // Wait a moment then show QR
      await new Promise(r => setTimeout(r, 2000))
      setQrUrl(`/api/waha?action=qr&t=${Date.now()}`)
      // Poll for connection
      const poll = setInterval(async () => {
        const res = await fetch('/api/waha?action=status')
        const data = await res.json()
        if (data.connected) {
          clearInterval(poll)
          setConnected(true)
          setStatus('WORKING')
          setPhone(data.phone)
          setName(data.name)
          setQrUrl(null)
        }
      }, 3000)
      setTimeout(() => clearInterval(poll), 120000) // Stop polling after 2 min
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    setLoading(true)
    try {
      await fetch('/api/waha?action=stop', { method: 'POST' })
      setConnected(false)
      setStatus('STOPPED')
      setPhone(null)
      setName(null)
      setQrUrl(null)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const res = await fetch('/api/waha?action=groups')
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch { setGroups([]) }
  }

  const statusColor = connected ? '#25d366' : status === 'SCAN_QR_CODE' ? '#f59e0b' : '#ef4444'

  return (
    <div style={{ marginTop: '1.5rem', padding: '1.25rem', borderRadius: '8px', border: '1px solid #333', background: '#1a1a2e' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
        <div style={{ width: 12, height: 12, borderRadius: '50%', background: statusColor }} />
        <strong style={{ fontSize: '0.95rem', color: '#fff' }}>WhatsApp Connection</strong>
        <span style={{ fontSize: '0.8rem', color: '#888', marginLeft: 'auto' }}>{status}</span>
      </div>

      {error && (
        <div style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#ef4444', fontSize: '0.8rem', marginBottom: '0.75rem' }}>
          {error}
        </div>
      )}

      {connected && phone && (
        <div style={{ padding: '0.75rem', borderRadius: '6px', background: 'rgba(37,211,102,0.08)', border: '1px solid rgba(37,211,102,0.2)', marginBottom: '0.75rem' }}>
          <div style={{ fontSize: '0.85rem', color: '#25d366', fontWeight: 600 }}>Connected</div>
          <div style={{ fontSize: '0.8rem', color: '#aaa', marginTop: '0.25rem' }}>
            {name && <span>{name} &middot; </span>}+{phone}
          </div>
        </div>
      )}

      {qrUrl && !connected && (
        <div style={{ textAlign: 'center', marginBottom: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>Scan this QR code with WhatsApp on the business phone:</p>
          <img src={qrUrl} alt="WhatsApp QR Code" style={{ width: 256, height: 256, borderRadius: '8px', border: '2px solid #333' }} />
          <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>QR refreshes automatically. Waiting for scan...</p>
        </div>
      )}

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {!connected && !qrUrl && (
          <button onClick={startSession} disabled={loading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#25d366', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
            {loading ? 'Starting...' : 'Connect WhatsApp'}
          </button>
        )}
        {connected && (
          <>
            <button onClick={disconnect} disabled={loading} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#ef4444', color: '#fff', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
              Disconnect
            </button>
            <button onClick={loadGroups} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: '#333', color: '#fff', border: '1px solid #555', cursor: 'pointer', fontSize: '0.85rem' }}>
              Load Groups
            </button>
          </>
        )}
        <button onClick={checkStatus} style={{ padding: '0.5rem 1rem', borderRadius: '6px', background: 'transparent', color: '#888', border: '1px solid #444', cursor: 'pointer', fontSize: '0.85rem' }}>
          Refresh Status
        </button>
      </div>

      {groups.length > 0 && (
        <div style={{ marginTop: '0.75rem' }}>
          <p style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>Select a group to receive quote notifications:</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => { navigator.clipboard.writeText(g.id); alert(`Group ID copied: ${g.id}\n\nPaste it in the "WhatsApp Group ID" field above and save.`) }}
                style={{ padding: '0.5rem 0.75rem', borderRadius: '6px', background: '#222', border: '1px solid #444', color: '#ddd', cursor: 'pointer', fontSize: '0.8rem', textAlign: 'left' }}>
                {g.name || g.id} <span style={{ color: '#666', fontSize: '0.7rem' }}>({g.id})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppConnectionPanel
