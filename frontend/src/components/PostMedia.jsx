import React from "react"

const API_ORIGIN = "https://circleup-backend-2.onrender.com"

const mediaUrl = (value) => {
  if (!value) return null
  return value.startsWith("http") ? value : `${API_ORIGIN}${value}`
}

export default function PostMedia({ post }) {
  if (post.video) {
    return (
      <video
        src={mediaUrl(post.video)}
        controls
        playsInline
        preload="metadata"
        className="w-full max-h-[32rem] rounded-lg object-contain"
      />
    )
  }

  if (post.image) {
    return (
      <img
        src={mediaUrl(post.image)}
        alt="Post media"
        className="w-auto max-h-48 rounded-lg"
      />
    )
  }

  return null
}
