import React, { useEffect, useRef, useState } from "react"
import { Heart, Volume2, VolumeX, Share2, Eye } from "lucide-react"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"

const API_ORIGIN = "https://circleup-backend-2.onrender.com"
const mediaUrl = (value) => value?.startsWith("http") ? value : `${API_ORIGIN}${value}`

const Reels = () => {
  const [reels, setReels] = useState([])
  const [muted, setMuted] = useState(true)
  const [error, setError] = useState("")
  const videoRefs = useRef(new Map())
  const viewed = useRef(new Set())

  useEffect(() => {
    Axios.get("reels/").then((response) => setReels(response.data || []))
      .catch(() => setError("Unable to load reels."))
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const video = entry.target
        const postId = Number(video.dataset.postId)
        if (entry.isIntersecting && entry.intersectionRatio >= 0.65) {
          video.play().catch(() => {})
          if (!viewed.current.has(postId)) {
            viewed.current.add(postId)
            Axios.post(`reels/${postId}/view/`).then((response) => {
              setReels((current) => current.map((reel) => reel.id === postId ? { ...reel, views: response.data.views } : reel))
            }).catch(() => {})
          }
        } else {
          video.pause()
        }
      })
    }, { threshold: [0.65] })

    videoRefs.current.forEach((video) => observer.observe(video))
    return () => observer.disconnect()
  }, [reels])

  const shareReel = async (reel) => {
    try {
      const shareUrl = `${window.location.origin}/reels#reel-${reel.id}`
      if (navigator.share) await navigator.share({ title: "CircleUp reel", text: reel.content || "Check out this reel", url: shareUrl })
      else await navigator.clipboard.writeText(shareUrl)
      const response = await Axios.post(`reels/${reel.id}/share/`)
      setReels((current) => current.map((item) => item.id === reel.id ? { ...item, share_count: response.data.shares } : item))
    } catch {
      // Sharing can be cancelled by the user; no error state is needed.
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto flex w-full max-w-[55rem] justify-center px-2 py-3 sm:py-5">
        <div className="reels-feed">
          <header className="reels-heading">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.2em] text-orange-400">CircleUp video</p>
              <h1 className="text-2xl font-semibold">Reels</h1>
            </div>
            <Button size="icon" variant="ghost" className="no-hover-effect" onClick={() => setMuted((value) => !value)} aria-label={muted ? "Unmute reels" : "Mute reels"}>
              {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </Button>
          </header>
          {error && <p className="p-4 text-sm text-red-300">{error}</p>}
          {!error && !reels.length && <p className="p-8 text-center text-sm text-muted-foreground">No reels yet. Upload a video from New Post.</p>}
          {reels.map((reel) => (
            <article id={`reel-${reel.id}`} className="reel-card" key={reel.id}>
              <video
                ref={(node) => node && videoRefs.current.set(reel.id, node)}
                data-post-id={reel.id}
                src={mediaUrl(reel.video)}
                poster={mediaUrl(reel.thumbnail)}
                muted={muted}
                loop
                playsInline
                preload="metadata"
                className="reel-video"
                onClick={(event) => event.currentTarget.paused ? event.currentTarget.play() : event.currentTarget.pause()}
              />
              <div className="reel-overlay">
                <div className="flex items-center gap-2">
                  <Avatar className="size-9 border border-white/30"><AvatarImage src={mediaUrl(reel.profile?.pfp)} /><AvatarFallback>{reel.profile?.user?.username?.slice(0, 2).toUpperCase()}</AvatarFallback></Avatar>
                  <span className="font-medium">{reel.profile?.user?.username}</span>
                </div>
                {reel.content && <p className="mt-2 max-w-[80%] text-sm">{reel.content}</p>}
                <div className="mt-3 flex items-center gap-3 text-xs text-zinc-200">
                  <span className="flex items-center gap-1"><Eye size={14} />{reel.views || 0}</span>
                  <span className="flex items-center gap-1"><Heart size={14} />{reel.likes || 0}</span>
                  <span>{reel.share_count || 0} shares</span>
                  <Button size="icon" variant="ghost" className="no-hover-effect ml-auto text-white" onClick={() => shareReel(reel)} aria-label="Share reel"><Share2 size={17} /></Button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </main>
    </div>
  )
}

export default Reels
