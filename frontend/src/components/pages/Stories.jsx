import React, { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight, Eye, Heart, ImagePlus, MessageCircle, Plus, Send, Trash2, X } from "lucide-react"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { useLocation, useNavigate } from "react-router-dom"
import { Button } from "../ui/button"
import { Card } from "../ui/card"

const API_ORIGIN = "https://circleup-backend-2.onrender.com"

const mediaUrl = (value) => value?.startsWith("http") ? value : value ? `${API_ORIGIN}${value}` : ""

const Stories = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [content, setContent] = useState("")
  const [privacy, setPrivacy] = useState("public")
  const [media, setMedia] = useState(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [replyDrafts, setReplyDrafts] = useState({})
  const [viewers, setViewers] = useState(null)
  const currentUserId = Number(localStorage.getItem("userId"))
  const [activeIndex, setActiveIndex] = useState(null)
  const [progress, setProgress] = useState(0)

  const loadStories = async () => {
    setLoading(true)
    try {
      const response = await Axios.get("stories/")
      setStories(response.data.stories || [])
      setError("")
    } catch (err) {
      setError(err.response?.data?.error || "Unable to load stories.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadStories() }, [])

  useEffect(() => {
    const requestedStoryId = location.state?.storyId
    if (!requestedStoryId || !stories.length) return
    const requestedIndex = stories.findIndex((story) => story.id === requestedStoryId)
    if (requestedIndex >= 0) setActiveIndex(requestedIndex)
  }, [stories, location.state])

  useEffect(() => {
    if (activeIndex === null || !stories[activeIndex]) return undefined
    setProgress(0)
    const startedAt = Date.now()
    const timer = setInterval(() => {
      const nextProgress = (Date.now() - startedAt) / 6000
      if (nextProgress >= 1) {
        setActiveIndex((current) => current === null || current >= stories.length - 1 ? null : current + 1)
      } else {
        setProgress(nextProgress)
      }
    }, 80)
    markViewed(stories[activeIndex])
    return () => clearInterval(timer)
  }, [activeIndex, stories.length])

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (activeIndex === null) return
      if (event.key === "Escape") setActiveIndex(null)
      if (event.key === "ArrowRight") setActiveIndex((current) => current === null || current >= stories.length - 1 ? 0 : current + 1)
      if (event.key === "ArrowLeft") setActiveIndex((current) => current === null || current <= 0 ? stories.length - 1 : current - 1)
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [activeIndex, stories.length])

  const openStory = (index) => {
    setActiveIndex(index)
    setProgress(0)
  }

  const createStory = async (event) => {
    event.preventDefault()
    if (!media) {
      setError("Choose an image or video first.")
      return
    }
    const formData = new FormData()
    formData.append(media.type.startsWith("video/") ? "video" : "image", media)
    formData.append("content", content)
    formData.append("privacy", privacy)
    setSubmitting(true)
    setError("")
    try {
      await Axios.post("stories/", formData)
      setContent("")
      setPrivacy("public")
      setMedia(null)
      const mediaInput = document.getElementById("story-media-input")
      if (mediaInput) mediaInput.value = ""
      setSuccess("Your story is live for 24 hours.")
      await loadStories()
      navigate("/feed")
    } catch (err) {
      setError(err.response?.data?.error || "Unable to publish story.")
    } finally {
      setSubmitting(false)
    }
  }

  const markViewed = async (story) => {
    try {
      await Axios.post(`stories/${story.id}/view/`)
      setStories((current) => current.map((item) => item.id === story.id ? { ...item, viewers: Math.max(item.viewers, 1) } : item))
    } catch { }
  }

  const reactToStory = async (story, reaction) => {
    try {
      const response = await Axios.post(`stories/${story.id}/react/`, { reaction })
      setStories((current) => current.map((item) => item.id === story.id ? { ...item, my_reaction: response.data.reaction, reactions: response.data.reactions } : item))
    } catch (err) {
      setError(err.response?.data?.error || "Unable to react to story.")
    }
  }

  const replyToStory = async (event, story) => {
    event.preventDefault()
    const contentValue = replyDrafts[story.id]?.trim()
    if (!contentValue) return
    try {
      const response = await Axios.post(`stories/${story.id}/reply/`, { content: contentValue })
      setStories((current) => current.map((item) => item.id === story.id ? { ...item, replies: [...item.replies, response.data] } : item))
      setReplyDrafts((current) => ({ ...current, [story.id]: "" }))
    } catch (err) {
      setError(err.response?.data?.error || "Unable to send reply.")
    }
  }

  const showViewers = async (story) => {
    try {
      const response = await Axios.get(`stories/${story.id}/viewers/`)
      setViewers({ story, users: response.data.viewers || [] })
    } catch (err) {
      setError(err.response?.data?.error || "Only the story owner can view this list.")
    }
  }

  const deleteStory = async (story) => {
    try {
      await Axios.delete(`stories/${story.id}/`)
      setStories((current) => current.filter((item) => item.id !== story.id))
    } catch (err) {
      setError(err.response?.data?.error || "Unable to delete story.")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-3xl space-y-4 px-3 py-5">
        <Card className="surface-card rounded-2xl p-4">
          <div className="mb-4 flex items-center gap-2"><Plus className="text-orange-400" size={20} /><h1 className="text-xl font-semibold">Stories</h1></div>
          <form onSubmit={createStory} className="space-y-3">
            <textarea value={content} onChange={(event) => setContent(event.target.value)} maxLength={250} placeholder="Add a caption..." className="min-h-20 w-full resize-y rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm outline-none focus:border-orange-400" />
            <div className="grid gap-3 sm:grid-cols-[1fr_10rem_auto] sm:items-end">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 px-3 py-2 text-sm text-muted-foreground hover:border-orange-400"><ImagePlus size={16} />{media ? media.name : "Choose image or video"}<input id="story-media-input" type="file" accept="image/*,video/*" onChange={(event) => setMedia(event.target.files?.[0] || null)} className="sr-only" /></label>
              <select value={privacy} onChange={(event) => setPrivacy(event.target.value)} className="rounded-lg border border-white/10 bg-background px-3 py-2 text-sm"><option value="public">Everyone</option><option value="friends">Friends</option><option value="private">Only me</option></select>
              <Button type="submit" disabled={submitting}>{submitting ? "Posting..." : "Post story"}</Button>
            </div>
          </form>
          {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          {success && <p className="mt-3 text-sm text-emerald-300">{success}</p>}
        </Card>

        {!loading && stories.length > 0 && <Card className="surface-card rounded-2xl p-4"><div className="flex gap-4 overflow-x-auto pb-1">{stories.map((story, index) => <button type="button" key={story.id} onClick={() => openStory(index)} className="flex w-16 shrink-0 flex-col items-center gap-1.5 text-center"><span className="rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600 p-[3px]"><Avatar className="size-14 border-2 border-zinc-950"><AvatarImage src={story.author_pfp || undefined} /><AvatarFallback>{story.author.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar></span><span className="w-full truncate text-xs">{story.author.id === currentUserId ? "Your story" : story.author.username}</span></button>)}</div></Card>}

        {loading && <Card className="surface-card rounded-2xl p-6 text-center text-sm text-muted-foreground">Loading stories...</Card>}
        {!loading && !stories.length && <Card className="surface-card rounded-2xl p-6 text-center text-sm text-muted-foreground">No active stories yet. Share something that disappears tomorrow.</Card>}
        {false && <div className="space-y-4">
          {stories.map((story) => {
            const isVideo = Boolean(story.video)
            return <Card key={story.id} className="surface-card overflow-hidden rounded-2xl">
              <div className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3"><Avatar className="size-10"><AvatarImage src={story.author_pfp || undefined} /><AvatarFallback>{story.author.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div className="min-w-0"><p className="truncate font-medium">{story.author.username}</p><p className="text-xs text-muted-foreground">{story.expires_in} remaining · {story.privacy}</p></div></div>
                <div className="flex items-center gap-1">{story.author.id === currentUserId && <><Button size="icon" variant="ghost" title="Viewers" onClick={() => showViewers(story)}><Eye size={16} /></Button><span className="text-xs text-muted-foreground">{story.viewers}</span><Button size="icon" variant="ghost" title="Delete story" onClick={() => deleteStory(story)}><Trash2 size={16} /></Button></>}</div>
              </div>
              {isVideo ? <video src={mediaUrl(story.video)} controls onPlay={() => markViewed(story)} className="max-h-[38rem] w-full bg-black object-contain" /> : <img src={mediaUrl(story.image)} alt={`${story.author.username}'s story`} onLoad={() => markViewed(story)} className="max-h-[38rem] w-full bg-black object-contain" />}
              {story.content && <p className="px-4 pt-3 text-sm">{story.content}</p>}
              <div className="flex items-center gap-2 px-4 py-3"><Button size="sm" variant={story.my_reaction === "like" ? "default" : "outline"} onClick={() => reactToStory(story, "like")}><Heart size={15} />Like {story.reactions?.like || 0}</Button><Button size="sm" variant={story.my_reaction === "love" ? "default" : "outline"} onClick={() => reactToStory(story, "love")}>Love {story.reactions?.love || 0}</Button><Button size="sm" variant={story.my_reaction === "laugh" ? "default" : "outline"} onClick={() => reactToStory(story, "laugh")}>Laugh {story.reactions?.laugh || 0}</Button></div>
              <div className="border-t border-white/10 p-4"><div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><MessageCircle size={14} />Replies</div>{story.replies?.map((reply) => <p key={reply.id} className="mb-1 text-sm"><strong>{reply.author.username}</strong> {reply.content}</p>)}<form onSubmit={(event) => replyToStory(event, story)} className="mt-3 flex gap-2"><input value={replyDrafts[story.id] || ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [story.id]: event.target.value }))} maxLength={500} placeholder="Reply to this story..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm" /><Button type="submit" size="icon" aria-label="Send reply"><Send size={15} /></Button></form></div>
            </Card>
          })}
        </div>}
      </main>
      {activeIndex !== null && stories[activeIndex] && <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/90 p-2 sm:p-6">
        <div className="relative flex h-[min(92vh,48rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl bg-zinc-950 shadow-2xl">
          <div className="absolute left-3 right-3 top-3 z-10 flex gap-1">{stories.map((story, index) => <span key={story.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"><span className="block h-full rounded-full bg-white transition-[width] duration-75" style={{ width: index < activeIndex ? "100%" : index === activeIndex ? `${progress * 100}%` : "0%" }} /></span>)}</div>
          <div className="absolute left-4 right-3 top-7 z-10 flex items-center justify-between"><div className="flex items-center gap-2"><Avatar className="size-9 border border-white/40"><AvatarImage src={stories[activeIndex].author_pfp || undefined} /><AvatarFallback>{stories[activeIndex].author.username.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar><div><p className="text-sm font-semibold text-white">{stories[activeIndex].author.username}</p><p className="text-xs text-white/70">{stories[activeIndex].expires_in} left</p></div></div><div className="flex items-center gap-1">{stories[activeIndex].author.id === currentUserId && <Button size="icon" variant="ghost" className="text-white hover:bg-red-500/30" aria-label="Delete story" title="Delete story" onClick={() => { deleteStory(stories[activeIndex]); setActiveIndex(null) }}><Trash2 size={18} /></Button>}<Button size="icon" variant="ghost" className="text-white hover:bg-white/10" aria-label="Close story" onClick={() => setActiveIndex(null)}><X size={20} /></Button></div></div>
          {stories[activeIndex].video ? <video src={mediaUrl(stories[activeIndex].video)} autoPlay onEnded={() => setActiveIndex((current) => current >= stories.length - 1 ? null : current + 1)} className="h-full w-full object-contain" /> : <img src={mediaUrl(stories[activeIndex].image)} alt={`${stories[activeIndex].author.username}'s story`} className="h-full w-full object-contain" />}
          <button type="button" aria-label="Previous story" onClick={() => setActiveIndex((current) => current <= 0 ? stories.length - 1 : current - 1)} className="absolute left-2 top-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/60"><ChevronLeft size={24} /></button>
          <button type="button" aria-label="Next story" onClick={() => setActiveIndex((current) => current >= stories.length - 1 ? null : current + 1)} className="absolute right-2 top-1/2 rounded-full bg-black/30 p-2 text-white hover:bg-black/60"><ChevronRight size={24} /></button>
          <div className="absolute bottom-0 left-0 right-0 space-y-3 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-16"><p className="text-sm text-white">{stories[activeIndex].content}</p><div className="flex gap-2"><Button size="sm" variant={stories[activeIndex].my_reaction === "like" ? "default" : "outline"} onClick={() => reactToStory(stories[activeIndex], "like")}><Heart size={14} /> {stories[activeIndex].reactions?.like || 0}</Button><Button size="sm" variant={stories[activeIndex].my_reaction === "love" ? "default" : "outline"} onClick={() => reactToStory(stories[activeIndex], "love")}>Love</Button><form onSubmit={(event) => replyToStory(event, stories[activeIndex])} className="flex min-w-0 flex-1 gap-2"><input value={replyDrafts[stories[activeIndex].id] || ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [stories[activeIndex].id]: event.target.value }))} placeholder="Reply..." className="min-w-0 flex-1 rounded-full border border-white/20 bg-white/10 px-3 text-sm text-white outline-none placeholder:text-white/60" /><Button type="submit" size="icon" aria-label="Send story reply" className="rounded-full"><Send size={14} /></Button></form></div></div>
        </div>
      </div>}
      {viewers && <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4" onClick={() => setViewers(null)}><Card className="surface-card w-full max-w-sm rounded-2xl p-4" onClick={(event) => event.stopPropagation()}><div className="mb-3 flex items-center justify-between"><h2 className="font-semibold">Viewed by</h2><Button size="sm" variant="ghost" onClick={() => setViewers(null)}>Close</Button></div>{viewers.users.length ? viewers.users.map((user) => <p key={user.id} className="border-b border-white/10 py-2 text-sm">{user.username}</p>) : <p className="text-sm text-muted-foreground">No viewers yet.</p>}</Card></div>}
    </div>
  )
}

export default Stories
