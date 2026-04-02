"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"

export const WhatsAppConnectionPanel: React.FC = () => {
  const [status, setStatus] = useState<string>("checking...")
  const [connected, setConnected] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [qrUrl, setQrUrl] = useState<string | null>(null)
  const [showingQr, setShowingQr] = useState(false)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const checkStatus = useCallback(async () => {
    if (showingQr) return // Don't poll while showing QR
    try {
      const res = await fetch("/api/waha?action=status")
      const data = await res.json()
      setConnected(data.connected)
      setStatus(data.status)
      setPhone(data.phone)
      setName(data.name)
      setError(null)
    } catch (e: any) {
      setError(e.message)
      setStatus("ERROR")
    }
  }, [showingQr])

  useEffect(() => {
    checkStatus()
    pollRef.current = setInterval(checkStatus, 5000)
    return () => { if (pollRef.current) clearInterval(pollRef.current) }
  }, [checkStatus])

  const startSession = async () => {
    setLoading(true)
    setError(null)
    setShowingQr(true)
    setConnected(false)
    setQrUrl(null)
    // Stop polling while we set up
    if (pollRef.current) clearInterval(pollRef.current)

    try {
      // Stop and delete existing session
      await fetch("/api/waha?action=stop", { method: "POST" })
      // Wait for session to fully stop
      await new Promise(r => setTimeout(r, 3000))
      // Start fresh session
      await fetch("/api/waha?action=start", { method: "POST" })
      // Wait for session to initialize
      await new Promise(r => setTimeout(r, 3000))
      // Show QR
      setQrUrl(`/api/waha?action=qr&t=${Date.now()}`)

      // Poll for connection (separate from status poll)
      const qrPoll = setInterval(async () => {
        try {
          const res = await fetch("/api/waha?action=status")
          const data = await res.json()
          if (data.connected) {
            clearInterval(qrPoll)
            setConnected(true)
            setStatus("WORKING")
            setPhone(data.phone)
            setName(data.name)
            setQrUrl(null)
            setShowingQr(false)
            // Resume normal polling
            pollRef.current = setInterval(checkStatus, 5000)
          } else if (data.status === "SCAN_QR_CODE") {
            // Refresh QR image
            setQrUrl(`/api/waha?action=qr&t=${Date.now()}`)
          }
        } catch {}
      }, 4000)

      // Stop QR polling after 2 minutes
      setTimeout(() => {
        clearInterval(qrPoll)
        if (!connected) {
          setShowingQr(false)
          setQrUrl(null)
          pollRef.current = setInterval(checkStatus, 5000)
        }
      }, 120000)
    } catch (e: any) {
      setError(e.message)
      setShowingQr(false)
      pollRef.current = setInterval(checkStatus, 5000)
    } finally {
      setLoading(false)
    }
  }

  const disconnect = async () => {
    setLoading(true)
    try {
      await fetch("/api/waha?action=stop", { method: "POST" })
      setConnected(false)
      setStatus("STOPPED")
      setPhone(null)
      setName(null)
      setQrUrl(null)
      setShowingQr(false)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const loadGroups = async () => {
    try {
      const res = await fetch("/api/waha?action=groups")
      const data = await res.json()
      setGroups(Array.isArray(data) ? data : [])
    } catch { setGroups([]) }
  }

  const statusColor = connected ? "#25d366" : showingQr ? "#f59e0b" : "#ef4444"

  return (
    <div style={{ marginBottom: "1.5rem", padding: "1.25rem", borderRadius: "8px", border: "1px solid #333", background: "#1a1a2e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: statusColor, boxShadow: `0 0 8px ${statusColor}` }} />
        <strong style={{ fontSize: "0.95rem", color: "#fff" }}>WhatsApp Connection</strong>
        <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "auto" }}>{status}</span>
      </div>

      {error && (
        <div style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }}>
          {error}
        </div>
      )}

      {connected && phone && (
        <div style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#25d366", fontWeight: 600 }}>&#x2705; Connected</div>
          <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "0.25rem" }}>
            {name && <span>{name} &middot; </span>}+{phone}
          </div>
        </div>
      )}

      {showingQr && !connected && (
        <div style={{ textAlign: "center", marginBottom: "0.75rem", padding: "1rem", background: "#111", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.85rem", color: "#fff", marginBottom: "0.75rem", fontWeight: 600 }}>Scan this QR code with WhatsApp:</p>
          {qrUrl ? (
            <img src={qrUrl} alt="WhatsApp QR Code" style={{ width: 280, height: 280, borderRadius: "8px", border: "3px solid #25d366" }} />
          ) : (
            <div style={{ width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "#222", borderRadius: "8px", color: "#888" }}>
              Generating QR code...
            </div>
          )}
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.75rem" }}>Open WhatsApp on your phone &rarr; Settings &rarr; Linked Devices &rarr; Link a Device</p>
          <button onClick={() => { setShowingQr(false); setQrUrl(null); pollRef.current = setInterval(checkStatus, 5000) }}
            style={{ marginTop: "0.5rem", padding: "0.4rem 0.75rem", borderRadius: "4px", background: "transparent", color: "#888", border: "1px solid #444", cursor: "pointer", fontSize: "0.75rem" }}>
            Cancel
          </button>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {!connected && !showingQr && (
          <button onClick={startSession} disabled={loading}
            style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#25d366", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
            {loading ? "Starting..." : "Connect WhatsApp"}
          </button>
        )}
        {connected && (
          <>
            <button onClick={disconnect} disabled={loading}
              style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>
              Disconnect
            </button>
            <button onClick={loadGroups}
              style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#333", color: "#fff", border: "1px solid #555", cursor: "pointer", fontSize: "0.85rem" }}>
              Load Groups
            </button>
          </>
        )}
      </div>

      {groups.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "0.5rem" }}>Click a group to copy its ID, then paste in the Group ID field below:</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => { navigator.clipboard.writeText(g.id); alert("Group ID copied: " + g.id + "\n\nPaste it in the WhatsApp Group ID field and save.") }}
                style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "#222", border: "1px solid #444", color: "#ddd", cursor: "pointer", fontSize: "0.8rem", textAlign: "left" }}>
                {g.name || g.id} <span style={{ color: "#666", fontSize: "0.7rem" }}>({g.id})</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppConnectionPanel
