import React, { useEffect, useState } from "react"
import { Plus, UsersRound } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

const Groups = () => {
  const [groups, setGroups] = useState([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [visibility, setVisibility] = useState("public")
  const [error, setError] = useState("")
  const navigate = useNavigate()

  const load = async () => {
    const response = await Axios.get("groups/all/")
    setGroups(response.data.groups)
  }

  useEffect(() => { load().catch(() => setError("Unable to load groups.")) }, [])

  const createGroup = async (event) => {
    event.preventDefault()
    if (!name.trim()) return
    try {
      await Axios.post("groups/", { name: name.trim(), description: description.trim(), visibility })
      setName("")
      setDescription("")
      setVisibility("public")
      await load()
    } catch (err) {
      setError(err.response?.data?.error || "Unable to create group.")
    }
  }

  const membership = async (group, action) => {
    try {
      await Axios.post(`groups/${group.id}/${action}/`)
      await load()
    } catch (err) {
      setError(err.response?.data?.error || "Unable to update membership.")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-3 py-5">
        <Card className="surface-card rounded-2xl p-4">
          <div className="mb-4 flex items-center gap-2"><UsersRound className="text-orange-400" /><h1 className="text-xl font-semibold">Groups</h1></div>
          <form onSubmit={createGroup} className="space-y-2">
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Group name" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
            <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description" className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2" />
            <select value={visibility} onChange={(event) => setVisibility(event.target.value)} className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"><option value="public">Public group</option><option value="private">Private group (approval required)</option></select>
            <Button type="submit"><Plus size={16} />Create group</Button>
          </form>
          {error && <p className="mt-2 text-sm text-red-300">{error}</p>}
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {groups.map((group) => (
            <Card className="surface-card rounded-2xl p-4" key={group.id}>
              <button type="button" className="text-left font-semibold hover:text-orange-400" onClick={() => navigate(`/groups/${group.id}`)}>{group.name}</button>
              <p className="mt-1 text-sm text-muted-foreground">{group.description || "No description"}</p>
              <p className="mt-3 text-xs text-muted-foreground">{group.member_count} members · Owner: {group.owner.username}</p>
              <Button className="mt-4 w-full" variant={group.is_member ? "outline" : "default"} disabled={group.membership_status === "pending"} onClick={() => membership(group, group.is_member ? "leave" : "join")}>
                {group.membership_status === "pending" ? "Request pending" : group.is_member ? "Leave group" : "Join group"}
              </Button>
            </Card>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Groups
