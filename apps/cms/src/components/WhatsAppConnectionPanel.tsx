"use client"

import React, { useState, useEffect, useCallback, useRef } from "react"

export const WhatsAppConnectionPanel: React.FC = () => {
  const [status, setStatus] = useState<string>("checking...")
  const [connected, setConnected] = useState(false)
  const [phone, setPhone] = useState<string | null>(null)
  const [name, setName] = useState<string | null>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const [showingQr, setShowingQr] = useState(false)
  const [groups, setGroups] = useState<Array<{ id: string; name: string }>>([])
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveMsg, setSaveMsg] = useState<string | null>(null)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const qrPollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopPolling = () => {
    if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null }
    if (qrPollRef.current) { clearInterval(qrPollRef.current); qrPollRef.current = null }
  }

  const checkStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/waha?action=status")
      const data = await res.json()
      if (!showingQr) {
        setConnected(data.connected)
        setStatus(data.status)
        setPhone(data.phone)
        setName(data.name)
      }
      setError(null)
      return data
    } catch (e: any) { setError(e.message); setStatus("ERROR"); return null }
  }, [showingQr])

  useEffect(() => {
    checkStatus()
    pollRef.current = setInterval(() => { if (!showingQr) checkStatus() }, 6000)
    return stopPolling
  }, [])

  const fetchQr = async () => {
    try {
      const res = await fetch("/api/waha?action=qr")
      const data = await res.json()
      if (data.qr) setQrData(data.qr)
    } catch {}
  }

  const startSession = async () => {
    setLoading(true); setError(null); setShowingQr(true); setConnected(false); setQrData(null); stopPolling()
    try {
      await fetch("/api/waha?action=stop", { method: "POST" })
      await new Promise(r => setTimeout(r, 4000))
      await fetch("/api/waha?action=start", { method: "POST" })
      await new Promise(r => setTimeout(r, 4000))
      await fetchQr()
      qrPollRef.current = setInterval(async () => {
        const res = await fetch("/api/waha?action=status")
        const data = await res.json()
        if (data.connected) {
          stopPolling(); setConnected(true); setStatus("WORKING"); setPhone(data.phone); setName(data.name); setQrData(null); setShowingQr(false)
          pollRef.current = setInterval(checkStatus, 6000)
        } else { await fetchQr() }
      }, 5000)
      setTimeout(() => { if (qrPollRef.current) { clearInterval(qrPollRef.current); qrPollRef.current = null }; setShowingQr(false); setQrData(null); pollRef.current = setInterval(checkStatus, 6000) }, 120000)
    } catch (e: any) { setError(e.message); setShowingQr(false); pollRef.current = setInterval(checkStatus, 6000) }
    finally { setLoading(false) }
  }

  const disconnect = async () => {
    setLoading(true); stopPolling()
    try { await fetch("/api/waha?action=stop", { method: "POST" }); setConnected(false); setStatus("STOPPED"); setPhone(null); setName(null); setQrData(null); setShowingQr(false) }
    catch (e: any) { setError(e.message) }
    finally { setLoading(false); pollRef.current = setInterval(checkStatus, 6000) }
  }

  const loadGroups = async () => {
    try { const res = await fetch("/api/waha?action=groups"); const data = await res.json(); setGroups(Array.isArray(data) ? data : []) }
    catch { setGroups([]) }
  }

  const updateAndSave = async () => {
    setSaveMsg(null)
    const parts: string[] = []
    if (phone) parts.push("Phone: " + phone)
    if (selectedGroup) parts.push("Group: " + selectedGroup)
    if (!parts.length) { setSaveMsg("Nothing to update"); return }
    // Copy to clipboard and instruct user
    const text = [phone || "", selectedGroup || ""].filter(Boolean).join("\n")
    navigator.clipboard.writeText(text).catch(() => {})
    setSaveMsg("Values copied! Paste the phone number (" + (phone || "none") + ") and group ID (" + (selectedGroup || "none") + ") into the Recipient fields below, then click Save at the top of the page.")
  }

  const sc = connected ? "#25d366" : showingQr ? "#f59e0b" : "#ef4444"

  return (
    <div style={{ marginBottom: "1.5rem", padding: "1.25rem", borderRadius: "8px", border: "1px solid #333", background: "#1a1a2e" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
        <div style={{ width: 12, height: 12, borderRadius: "50%", background: sc, boxShadow: "0 0 8px " + sc }} />
        <strong style={{ fontSize: "0.95rem", color: "#fff" }}>WhatsApp Connection</strong>
        <span style={{ fontSize: "0.8rem", color: "#888", marginLeft: "auto" }}>{status}</span>
      </div>

      {error && <div style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#ef4444", fontSize: "0.8rem", marginBottom: "0.75rem" }}>{error}</div>}

      {connected && phone && (
        <div style={{ padding: "0.75rem", borderRadius: "6px", background: "rgba(37,211,102,0.08)", border: "1px solid rgba(37,211,102,0.2)", marginBottom: "0.75rem" }}>
          <div style={{ fontSize: "0.85rem", color: "#25d366", fontWeight: 600 }}>Connected</div>
          <div style={{ fontSize: "0.8rem", color: "#aaa", marginTop: "0.25rem" }}>{name && <span>{name} - </span>}+{phone}</div>
        </div>
      )}

      {showingQr && !connected && (
        <div style={{ textAlign: "center", marginBottom: "0.75rem", padding: "1rem", background: "#111", borderRadius: "8px" }}>
          <p style={{ fontSize: "0.85rem", color: "#fff", marginBottom: "0.75rem", fontWeight: 600 }}>Scan this QR code with WhatsApp:</p>
          {qrData ? <img src={qrData} alt="QR" style={{ width: 280, height: 280, borderRadius: "8px", border: "3px solid #25d366" }} />
            : <div style={{ width: 280, height: 280, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto", background: "#222", borderRadius: "8px", color: "#888" }}>Generating QR...</div>}
          <p style={{ fontSize: "0.75rem", color: "#666", marginTop: "0.75rem" }}>WhatsApp - Settings - Linked Devices - Link a Device</p>
          <button onClick={() => { stopPolling(); setShowingQr(false); setQrData(null); pollRef.current = setInterval(checkStatus, 6000) }}
            style={{ marginTop: "0.5rem", padding: "0.4rem 0.75rem", borderRadius: "4px", background: "transparent", color: "#888", border: "1px solid #444", cursor: "pointer", fontSize: "0.75rem" }}>Cancel</button>
        </div>
      )}

      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
        {!connected && !showingQr && <button onClick={startSession} disabled={loading} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#25d366", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>{loading ? "Starting..." : "Connect WhatsApp"}</button>}
        {connected && (
          <>
            <button onClick={disconnect} disabled={loading} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#ef4444", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600, opacity: loading ? 0.6 : 1 }}>Disconnect</button>
            <button onClick={loadGroups} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#333", color: "#fff", border: "1px solid #555", cursor: "pointer", fontSize: "0.85rem" }}>Load Groups</button>
            <button onClick={updateAndSave} style={{ padding: "0.5rem 1rem", borderRadius: "6px", background: "#3b82f6", color: "#fff", border: "none", cursor: "pointer", fontSize: "0.85rem", fontWeight: 600 }}>Copy Values</button>
          </>
        )}
      </div>

      {saveMsg && <div style={{ marginTop: "0.5rem", fontSize: "0.8rem", color: saveMsg.includes("Saved") ? "#25d366" : "#f59e0b" }}>{saveMsg}</div>}

      {groups.length > 0 && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.8rem", color: "#aaa", marginBottom: "0.5rem" }}>Select a group (click to select, then click Update &amp; Save):</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
            {groups.map(g => (
              <button key={g.id} onClick={() => setSelectedGroup(g.id)}
                style={{ padding: "0.5rem 0.75rem", borderRadius: "6px", background: selectedGroup === g.id ? "#1e3a5f" : "#222", border: selectedGroup === g.id ? "2px solid #3b82f6" : "1px solid #444", color: "#ddd", cursor: "pointer", fontSize: "0.8rem", textAlign: "left" }}>
                {g.name || g.id} {selectedGroup === g.id && <span style={{ color: "#3b82f6", marginLeft: "0.5rem" }}>Selected</span>}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default WhatsAppConnectionPanel
