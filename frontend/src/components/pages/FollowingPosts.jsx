import React from 'react'
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
import PostMedia from '../PostMedia';

 const FollowingPosts = ({posts, setPosts,following,likedPosts,dislikedPosts = [],setDislikedPosts,savedPosts, getSavedLiked, getFollowing}) => {

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
    Axios.post(`follow/${userid}/`).then((res) => {
      getFollowing()
    })
  }




  return (
    <div className="my-scrollable-box flex h-[86vh] w-full max-w-[38rem] flex-col gap-3 overflow-x-hidden px-0.5 pb-4 sm:px-0">
        {posts.length>0
        ? 
        <>
          {posts?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={post?.profile?.pfp} />
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
                  
                </div>
              </div>
              <div className='flex flex-col m-4 border-y py-2 gap-2'>
                <p>{post.content}</p>

                  <div>
                    <PostMedia post={post} />
                  </div>           
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
        </>
        :
        <div>No posts yet — start following people to see their posts here!</div>
    }
          
      </div>
  )
}
export default FollowingPosts;