import React, { useEffect, useState } from "react"
import { ArrowLeft, Search, Shield, UserMinus, UserPlus, UsersRound } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import PostMedia from "../PostMedia"

const API_ORIGIN = "https://circleup-backend-2.onrender.com"
const GroupDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [error, setError] = useState("")
  const [memberQuery, setMemberQuery] = useState("")
  const [memberResults, setMemberResults] = useState([])
  const [actionMessage, setActionMessage] = useState("")

  const load = async () => {
    try { setGroup((await Axios.get(`groups/${id}/`)).data) } catch (err) { setError(err.response?.data?.error || "Unable to load group.") }
  }
  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (!memberQuery.trim() || !group?.can_manage) {
      setMemberResults([])
      return undefined
    }
    const timer = setTimeout(async () => {
      try {
        const response = await Axios.get("users/search/", { params: { q: memberQuery } })
        setMemberResults(response.data.users || [])
      } catch { setError("Unable to search members.") }
    }, 250)
    return () => clearTimeout(timer)
  }, [memberQuery, group?.can_manage])

  const memberAction = async (userId, action) => {
    try {
      const response = await Axios.post(`groups/${id}/members/${userId}/${action}/`)
      setActionMessage(response.data.message)
      setMemberQuery("")
      await load()
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update group membership.")
    }
  }

  if (error) return <div className="min-h-screen"><Navbar /><p className="mx-auto mt-8 max-w-xl px-4 text-red-300">{error}</p></div>
  if (!group) return <div className="min-h-screen"><Navbar /><p className="p-8 text-center text-muted-foreground">Loading group...</p></div>

  return <div className="min-h-screen"><Navbar /><main className="mx-auto w-full max-w-[55rem] px-3 py-5">
    <Button variant="ghost" onClick={() => navigate("/groups")}><ArrowLeft size={16} />Groups</Button>
    <Card className="surface-card mt-3 overflow-hidden rounded-2xl">
      <div className="h-40 bg-gradient-to-r from-orange-500/30 to-zinc-800">{group.cover && <img src={`${API_ORIGIN}${group.cover}`} alt="Group cover" className="h-full w-full object-cover" />}</div>
      <div className="p-5"><div className="flex items-center gap-3"><Avatar className="size-14"><AvatarImage src={group.avatar ? `${API_ORIGIN}${group.avatar}` : undefined} /><AvatarFallback><UsersRound /></AvatarFallback></Avatar><div><h1 className="text-2xl font-semibold">{group.name}</h1><p className="text-sm text-muted-foreground">{group.visibility} group · {group.member_count} members</p></div></div><p className="mt-4 text-sm text-muted-foreground">{group.description || "No description"}</p></div>
    </Card>
    {actionMessage && <p className="mt-3 text-sm text-emerald-300">{actionMessage}</p>}
    <div className="mt-4 grid gap-4 md:grid-cols-[1fr_18rem]"><section className="space-y-3"><h2 className="font-semibold">Group posts</h2>{group.posts?.map((post) => <Card className="surface-card rounded-2xl p-4" key={post.id}><p>{post.content}</p><PostMedia post={post} /></Card>)}{!group.posts?.length && <p className="text-sm text-muted-foreground">No group posts yet.</p>}</section><div className="space-y-4"><Card className="surface-card h-fit rounded-2xl p-4"><h2 className="mb-3 font-semibold">Members</h2><div className="space-y-2">{group.members?.map((member) => <div className="flex items-center justify-between gap-2 text-sm" key={member.id}><div className="flex min-w-0 items-center gap-2"><Avatar className="size-7"><AvatarImage src={member.pfp || undefined} /><AvatarFallback>{member.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><span className="truncate">{member.username}</span></div>{member.role !== "member" ? <span className="text-xs text-orange-300">{member.role}</span> : group.can_manage ? <div className="flex gap-1"><Button size="icon" variant="ghost" title="Promote to moderator" onClick={() => memberAction(member.id, "promote")}><Shield size={14} /></Button><Button size="icon" variant="ghost" title="Remove member" onClick={() => memberAction(member.id, "remove")}><UserMinus size={14} /></Button></div> : null}</div>)}</div></Card>{group.can_manage && <Card className="surface-card rounded-2xl p-4"><h2 className="mb-3 font-semibold">Manage members</h2><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><input value={memberQuery} onChange={(event) => setMemberQuery(event.target.value)} placeholder="Search to add member" className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-9 pr-3 text-sm" /></div>{memberResults.map((member) => <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-white/5 p-2 text-sm" key={member.id}><span>{member.username}</span><Button size="sm" onClick={() => memberAction(member.id, "add")}><UserPlus size={14} />Add</Button></div>)}{group.pending_members?.length > 0 && <div className="mt-4"><h3 className="mb-2 text-sm font-medium">Pending requests</h3>{group.pending_members.map((member) => <div className="mt-2 flex items-center justify-between gap-2 text-sm" key={member.id}><span>{member.username}</span><div className="flex gap-1"><Button size="sm" onClick={() => memberAction(member.id, "approve")}>Approve</Button><Button size="sm" variant="outline" onClick={() => memberAction(member.id, "reject")}>Reject</Button></div></div>)}</div>}</Card>}</div></div>
    {group.can_manage && group.members?.some((member) => member.role === "moderator") && <Card className="surface-card mt-4 rounded-2xl p-4"><h2 className="mb-3 font-semibold">Moderator management</h2><div className="flex flex-wrap gap-2">{group.members.filter((member) => member.role === "moderator").map((member) => <div className="flex gap-2" key={member.id}><Button size="sm" variant="outline" onClick={() => memberAction(member.id, "demote")}><Shield size={14} />Demote {member.username}</Button><Button size="sm" variant="destructive" onClick={() => memberAction(member.id, "remove")}><UserMinus size={14} />Remove</Button></div>)}</div></Card>}
  </main></div>
}
export default GroupDetail
