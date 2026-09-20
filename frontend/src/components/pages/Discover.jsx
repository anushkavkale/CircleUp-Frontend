import React, { useState } from 'react'
import Axios from '../Axios';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {Card} from "@/components/ui/card"
import { Button } from '../ui/button';

import { IoHeartOutline } from "react-icons/io5";
import { IoHeartSharp } from "react-icons/io5";

import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { IoThumbsDownOutline, IoThumbsDownSharp } from "react-icons/io5";
import { User } from 'lucide-react';
import { useNavigate } from "react-router";
import { toast } from 'sonner';
import PostMedia from '../PostMedia';

 const Discover = ({posts, users, savedPosts, likedPosts, dislikedPosts = [], setDislikedPosts, following, getSavedLiked, getFollowing, setPosts}) => {
  const [openComments, setOpenComments] = useState(null)
  const [comments, setComments] = useState({})
  const [commentDrafts, setCommentDrafts] = useState({})
  const [replyDrafts, setReplyDrafts] = useState({})
  const [editingComment, setEditingComment] = useState(null)
  const [editingDraft, setEditingDraft] = useState("")

  const navigate = new useNavigate()

  const toggleLike = (postid) => {
    Axios.post(`toggleLike/${postid}/`).then((res) => {
    getSavedLiked()
    setDislikedPosts?.((current) => current.filter((id) => id !== postid))
    setPosts(posts.map(p => 
      p.id === postid ? { ...p, likes:res.data.Count, is_liked: res.data.Liked, is_disliked: false}
      : p
    ))
    })
  }

  const toggleDislike = (postid) => {
    Axios.post(`toggleDislike/${postid}/`).then((res) => {
      getSavedLiked()
      setDislikedPosts?.((current) => res.data.Disliked ? [...current.filter((id) => id !== postid), postid] : current.filter((id) => id !== postid))
      setPosts(posts.map(p => p.id === postid ? { ...p, dislikes: res.data.Count, is_disliked: res.data.Disliked, is_liked: false } : p))
    })
  }
  
  const toggleSave = (postid) => {
    Axios.post(`toggleSave/${postid}/`).then((res) => {
      getSavedLiked()
      setPosts(posts.map(p => 
      p.id === postid ? { ...p, saves:res.data.Count}
      : p
    ))
    })
  }
  const Follow = (userid) => {
    Axios.post(`follow/${userid}/`).then(() => {
      getFollowing()
    }).catch((err) => {
      toast.error(err.response.data.error)
    })
  }

  const loadComments = async (postId) => {
    const response = await Axios.get(`comments/${postId}/`)
    setComments((current) => ({ ...current, [postId]: response.data.comments }))
  }

  const toggleComments = async (postId) => {
    if (openComments === postId) {
      setOpenComments(null)
      return
    }
    await loadComments(postId)
    setOpenComments(postId)
  }

  const addComment = async (event, postId) => {
    event.preventDefault()
    const content = commentDrafts[postId]?.trim()
    if (!content) return
    await Axios.post(`comments/${postId}/`, { content })
    await loadComments(postId)
    setCommentDrafts((current) => ({ ...current, [postId]: "" }))
  }

  const addReply = async (event, postId, parentId) => {
    event.preventDefault()
    const content = replyDrafts[parentId]?.trim()
    if (!content) return
    await Axios.post(`comments/${postId}/`, { content, parent: parentId })
    await loadComments(postId)
    setReplyDrafts((current) => ({ ...current, [parentId]: "" }))
  }

  const saveComment = async (comment, postId) => {
    const content = editingDraft.trim()
    if (!content) return
    await Axios.patch(`comment/${comment.id}/`, { content })
    await loadComments(postId)
    setEditingComment(null)
    setEditingDraft("")
  }

  const deleteComment = async (comment, postId) => {
    await Axios.delete(`comment/${comment.id}/`)
    await loadComments(postId)
  }

  const renderComment = (comment, postId, depth = 0) => (
    <div key={comment.id} className={`${depth ? "ml-4 border-l border-white/10 pl-3" : ""} space-y-1`}>
      {editingComment === comment.id ? (
        <div className="flex gap-2">
          <input value={editingDraft} onChange={(event) => setEditingDraft(event.target.value)} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-sm" autoFocus />
          <Button size="sm" onClick={() => saveComment(comment, postId)}>Save</Button>
          <Button size="sm" variant="ghost" onClick={() => setEditingComment(null)}>Cancel</Button>
        </div>
      ) : (
        <>
          <p className="text-sm"><strong>{comment.author.username}</strong> {comment.content}</p>
          <div className="flex gap-3 text-xs text-muted-foreground">
            <button type="button" onClick={() => setReplyDrafts((current) => ({ ...current, [comment.id]: current[comment.id] || " " }))}>Reply</button>
            {comment.author.id === Number(localStorage.getItem('userId')) && <>
              <button type="button" onClick={() => { setEditingComment(comment.id); setEditingDraft(comment.content) }}>Edit</button>
              <button type="button" onClick={() => deleteComment(comment, postId)}>Delete</button>
            </>}
          </div>
          {replyDrafts[comment.id] !== undefined && (
            <form onSubmit={(event) => addReply(event, postId, comment.id)} className="flex gap-2 py-1">
              <input value={replyDrafts[comment.id].trimStart()} onChange={(event) => setReplyDrafts((current) => ({ ...current, [comment.id]: event.target.value }))} placeholder="Write a reply..." maxLength={500} className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-2 py-1 text-sm" />
              <Button type="submit" size="sm">Reply</Button>
            </form>
          )}
        </>
      )}
      {comment.replies?.map((reply) => renderComment(reply, postId, depth + 1))}
    </div>
  )


  return (
        <div className="my-scrollable-box flex h-[86vh] w-full max-w-[38rem] flex-col gap-3 overflow-x-hidden px-0.5 pb-4 sm:px-0">
          <Card className="surface-card w-full rounded-2xl p-4">
              <div className='flex items-center justify-between mb-3'>
                <h3 className='text-lg font-semibold'>Suggested people</h3>
              </div>
              <div className='flex gap-3 overflow-x-auto pb-2'>
                {users?.filter(user => user.id !== Number(localStorage.getItem('userId')))?.slice(0, 6).map((user) => (
                  <div key={user.id} className='min-w-[180px] border rounded-lg p-3 flex flex-col gap-2'>
                    <div className='flex items-center gap-2'>
                      <Avatar className="w-[34px] h-[34px]">
                        <AvatarImage src={user.pfp ? `https://circleup-backend-2.onrender.com${user.pfp}` : undefined}/>
                        <AvatarFallback>{user.username?.charAt(0)?.toUpperCase() || 'U'}</AvatarFallback>
                      </Avatar>
                      <p className='font-medium'>{user.username}</p>
                    </div>
                    <p className='text-sm text-muted-foreground line-clamp-2'>{user.bio || 'No bio yet'}</p>
                    <div className='flex gap-2 mt-auto'>
                      <Button size="sm" className='flex-1' onClick={() => navigate(`/profile/${user.username}`)}>View</Button>
                      {following.includes(user.id)
                        ? <Button size="sm" variant="outline" className='flex-1' onClick={() => Follow(user.id)}>Unfollow</Button>
                        : <Button size="sm" className='flex-1' onClick={() => Follow(user.id)}>Follow</Button>
                      }
                    </div>
                  </div>
                ))}
              </div>
            </Card>
            {posts?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={`https://circleup-backend-2.onrender.com${post?.profile?.pfp}`}/>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='cursor-pointer'>{post.profile?.user?.username || "Unknown"}</p>
                </div>
                <div className='flex items-center gap-2'>

                  {following.includes(post.profile.user.id) 
                  ? 
                  <Button size="sm" variant="outline" className="h-[25px]" onClick={() => Follow(post.profile.user.id)}>unfollow</Button> 
                  : 
                  <Button size="sm" className="h-[25px]" onClick={() => Follow(post.profile.user.id)}>Follow</Button> 
                  }   
                    <Button variant="outline" size="icon" className="h-[25px] w-auto p-1" onClick={()=> navigate(`/profile/${post?.profile?.user?.username}`)}>
                          <User />
                    </Button>
                </div>
              </div>
              <div className='flex flex-col m-4 border-y py-2 gap-2'>
                <p>{post.content}</p>

                  <div>
                  <PostMedia post={post} />

                </div>
                <button type="button" className="w-fit text-sm text-orange-400 hover:underline" onClick={() => toggleComments(post.id)}>
                  {openComments === post.id ? "Hide comments" : "Comments"}
                </button>
                {openComments === post.id && (
                  <div className="space-y-2 rounded-xl bg-white/5 p-3">
                    {(comments[post.id] || []).map((comment) => renderComment(comment, post.id))}
                    <form onSubmit={(event) => addComment(event, post.id)} className="flex gap-2">
                      <input
                        value={commentDrafts[post.id] || ""}
                        onChange={(event) => setCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                        placeholder="Write a comment..."
                        maxLength={500}
                        className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-sm outline-none"
                      />
                      <Button type="submit" size="sm">Post</Button>
                    </form>
                  </div>
                )}
              </div>
              <div className='flex items-center  mb-2 justify-between'>

                <p className='text-sm text-muted-foreground ml-4'>{post.created}</p>
                <div className='flex mr-4 gap-2'>
                  <div className='flex items-center gap-1'>
                    {likedPosts.includes(post.id) ?
                      <IoHeartSharp  onClick={() => toggleLike(post.id)} size={20} className='cursor-pointer'/>
                      :
                      <IoHeartOutline onClick={() => toggleLike(post.id)} size={20} className='cursor-pointer' />
                    }

                    <p className='text-sm text-muted-foreground'>{post.likes}</p>
                  </div>

                  <div className='flex items-center gap-1'>
                    <button type="button" aria-label={dislikedPosts.includes(post.id) ? "Remove dislike" : "Dislike post"} aria-pressed={dislikedPosts.includes(post.id)} onClick={() => toggleDislike(post.id)}>
                      {dislikedPosts.includes(post.id) ? <IoThumbsDownSharp size={20} /> : <IoThumbsDownOutline size={20} />}
                    </button>
                    <p className='text-sm text-muted-foreground'>{post.dislikes || 0}</p>
                  </div>

                  <div className='flex items-center gap-1'>
                    {savedPosts.includes(post.id)
                     ? <IoBookmark size={20} onClick={() => toggleSave(post.id)} className='cursor-pointer' />
                     : <IoBookmarkOutline size={20} onClick={() => toggleSave(post.id)} className='cursor-pointer' /> }
                    
                    <p className='text-sm text-muted-foreground'>{post.saves}</p>
                  </div>
                 
                </div>
              </div>
            </Card>
          ))}
      </div>
  )
}
export default Discover;