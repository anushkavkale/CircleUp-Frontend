import React, { useEffect, useState } from "react"
import { Plus } from "lucide-react"
import { useNavigate } from "react-router-dom"
import Axios from "./Axios"
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar"
import { Card } from "./ui/card"

const StoryTray = () => {
  const navigate = useNavigate()
  const [stories, setStories] = useState([])
  const [loading, setLoading] = useState(true)
  const currentUserId = Number(localStorage.getItem("userId"))

  useEffect(() => {
    Axios.get("stories/")
      .then((response) => setStories(response.data.stories || []))
      .catch(() => setStories([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stories.length) return null

  return (
    <Card className="surface-card w-full rounded-2xl px-4 py-3">
      <div className="flex gap-4 overflow-x-auto pb-1">
        {stories.map((story) => (
          <button
            type="button"
            key={story.id}
            onClick={() => navigate("/stories", { state: { storyId: story.id } })}
            className="flex w-[4.5rem] shrink-0 flex-col items-center gap-1.5 text-center"
          >
            <span className="rounded-full bg-gradient-to-tr from-yellow-400 via-orange-500 to-fuchsia-600 p-[3px]">
              <Avatar className="size-14 border-2 border-zinc-950">
                <AvatarImage src={story.author_pfp || undefined} />
                <AvatarFallback>{story.author.username.slice(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
            </span>
            <span className="flex w-full items-center justify-center gap-1 truncate text-xs">
              {story.author.id === currentUserId && <Plus size={12} className="text-orange-400" />}
              {story.author.id === currentUserId ? "Your story" : story.author.username}
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}

export default StoryTray
