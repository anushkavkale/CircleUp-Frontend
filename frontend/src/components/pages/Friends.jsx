import React, { useEffect, useState } from "react"
import { Search, UserPlus, Users } from "lucide-react"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"

const Friends = () => {
  const [data, setData] = useState({ incoming: [], outgoing: [], friends: [] })
  const [username, setUsername] = useState("")
  const [results, setResults] = useState([])
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [submitting, setSubmitting] = useState(false)

  const load = async () => {
    const response = await Axios.get("friend-requests/")
    setData(response.data)
  }

  useEffect(() => { load().catch(() => setError("Unable to load friend requests.")) }, [])

  useEffect(() => {
    const query = username.trim()
    if (!query) {
      setResults([])
      return undefined
    }
    const timer = setTimeout(async () => {
      setSearching(true)
      try {
        const response = await Axios.get("users/search/", { params: { q: query } })
        setResults(response.data.users || [])
      } catch {
        setError("Unable to search users.")
      } finally {
        setSearching(false)
      }
    }, 250)
    return () => clearTimeout(timer)
  }, [username])

  const sendRequest = async (event) => {
    event.preventDefault()
    if (!username.trim()) return
    setError("")
    setSuccess("")
    setSubmitting(true)
    try {
      const response = await Axios.post("friend-requests/", { username: username.trim() })
      setUsername("")
      setSuccess(response.data.message || "Friend request sent.")
      await load()
    } catch (err) {
      setError(err.response?.data?.error || err.response?.data?.detail || "User not found or request could not be sent.")
    } finally {
      setSubmitting(false)
    }
  }

  const decide = async (id, decision) => {
    try {
      await Axios.post(`friend-requests/${id}/${decision}/`)
      await load()
    } catch {
      setError("Unable to update request.")
    }
  }

  const addSearchResult = async (result) => {
    setError("")
    try {
      await Axios.post("friend-requests/", { username: result.username })
      setSuccess(`Friend request sent to ${result.username}.`)
      await load()
      setResults((current) => current.map((item) => item.id === result.id ? { ...item, relationship: "pending" } : item))
    } catch (err) {
      setError(err.response?.data?.error || "Could not send friend request.")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-3 py-5">
        <Card className="surface-card rounded-2xl p-4">
          <div className="mb-4 flex items-center gap-2"><Users className="text-orange-400" /><h1 className="text-xl font-semibold">Friends</h1></div>
          <form onSubmit={sendRequest} className="flex gap-2">
            <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={username} onChange={(event) => setUsername(event.target.value)} placeholder="Search users by username" autoComplete="off" className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3" /></div>
            <Button type="submit" disabled={submitting}><UserPlus size={16} />{submitting ? "Sending..." : "Add"}</Button>
          </form>
          {username.trim() && <div className="mt-3 space-y-2">{searching && <p className="text-sm text-muted-foreground">Searching...</p>}{!searching && !results.length && <p className="text-sm text-muted-foreground">No users found.</p>}{results.map((result) => <div key={result.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3"><div className="flex min-w-0 items-center gap-3"><Avatar className="size-9"><AvatarImage src={result.pfp || undefined} /><AvatarFallback>{result.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="font-medium">{result.username}</p><p className="truncate text-xs text-muted-foreground">{result.bio || "No bio yet"}</p></div></div>{result.relationship === "friends" ? <span className="text-xs text-emerald-300">Friends</span> : result.relationship === "pending" ? <span className="text-xs text-muted-foreground">Pending</span> : <Button size="sm" onClick={() => addSearchResult(result)}>Add friend</Button>}</div>)}</div>}
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
          {success && <p className="mt-2 text-sm text-emerald-300">{success}</p>}
        </Card>
        <Card className="surface-card rounded-2xl p-4">
          <h2 className="mb-3 font-semibold">Incoming requests</h2>
          <div className="space-y-2">
            {data.incoming.filter((item) => item.status === "pending").map((item) => (
              <div key={item.id} className="flex items-center justify-between rounded-xl bg-white/5 p-3">
                <span>{item.sender.username}</span>
                <div className="flex gap-2"><Button size="sm" onClick={() => decide(item.id, "accept")}>Accept</Button><Button size="sm" variant="outline" onClick={() => decide(item.id, "reject")}>Reject</Button></div>
              </div>
            ))}
            {!data.incoming.filter((item) => item.status === "pending").length && <p className="text-sm text-muted-foreground">No pending requests.</p>}
          </div>
        </Card>
        <Card className="surface-card rounded-2xl p-4">
          <h2 className="mb-3 font-semibold">Friends</h2>
          <div className="grid gap-2 sm:grid-cols-2">{data.friends.map((friend) => <div key={friend.id} className="rounded-xl bg-white/5 p-3">{friend.username}</div>)}</div>
        </Card>
      </main>
    </div>
  )
}

export default Friends
