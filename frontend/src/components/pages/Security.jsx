import React, { useEffect, useState } from "react"
import { ShieldCheck } from "lucide-react"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

const Security = () => {
  const [history, setHistory] = useState([])
  const [sessions, setSessions] = useState([])
  const [message, setMessage] = useState("")

  const load = async () => {
    const [historyResponse, sessionsResponse] = await Promise.all([Axios.get("login-history/"), Axios.get("sessions/")])
    setHistory(historyResponse.data.history)
    setSessions(sessionsResponse.data.sessions)
  }

  useEffect(() => { load().catch(() => setMessage("Unable to load security data.")) }, [])

  const revoke = async () => {
    await Axios.delete("sessions/")
    setMessage("Other active sessions were revoked.")
    await load()
  }

  return (
    <div className="min-h-screen"><Navbar /><main className="mx-auto w-full max-w-[55rem] space-y-4 px-3 py-5">
      <Card className="surface-card rounded-2xl p-5"><div className="flex items-center gap-2"><ShieldCheck className="text-orange-400" /><h1 className="text-xl font-semibold">Security</h1></div>{message && <p className="mt-2 text-sm text-muted-foreground">{message}</p>}</Card>
      <Card className="surface-card rounded-2xl p-5"><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Active sessions</h2><Button size="sm" variant="outline" onClick={revoke}>Revoke other sessions</Button></div><div className="space-y-2">{sessions.map((session) => <div key={session.session_key} className="rounded-lg bg-white/5 p-3 text-sm">{session.current ? "Current browser" : "Other browser"}<span className="ml-2 text-muted-foreground">expires {new Date(session.expires_at).toLocaleString()}</span></div>)}</div></Card>
      <Card className="surface-card rounded-2xl p-5"><h2 className="mb-3 font-semibold">Login history</h2><div className="space-y-2">{history.map((entry) => <div key={entry.id} className="rounded-lg bg-white/5 p-3 text-sm"><p>{new Date(entry.created_at).toLocaleString()}</p><p className="text-xs text-muted-foreground">{entry.ip_address || "Unknown IP"} · {entry.user_agent}</p></div>)}</div></Card>
    </main></div>
  )
}

export default Security
