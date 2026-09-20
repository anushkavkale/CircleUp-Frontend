import React, {useEffect, useState} from 'react'
import Navbar from '../Navbar'
import Axios from '../Axios';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {Card, CardContent} from "@/components/ui/card"
import { Button } from '../ui/button';
;
import ProfileTabs from '../ProfileTabs';
import { useParams } from 'react-router';
import PostMedia from '../PostMedia';


import { IoHeartOutline } from "react-icons/io5";
import { IoHeartSharp } from "react-icons/io5";

import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";

const Profile = () => {
  const {username} = useParams();
  const [profile, SetProfile] = useState()
  const [likedPosts, setLikedPosts] = useState([]); 
  const [savedPosts, setSavedPosts] = useState([]);
  const [networkTab, setNetworkTab] = useState(null)
  const [blocked, setBlocked] = useState(false)
  





  const getUser = () => {
      Axios.get(`publicprofile/${username}`).then((res) => {
          SetProfile(res.data)
        })
  }

  const getSavedLiked = () => {
    Axios.get("profile/").then((res) => {
      const LikedIds = res.data.liked_posts.map(post => post.id);
      const SavedIds = res.data.saved_posts.map(post => post.id)

      setLikedPosts(LikedIds)
      setSavedPosts(SavedIds)    
          })
  }

  useEffect(() => {
    getUser()
    getSavedLiked()
  }, [username])

const toggleLike = (postid) => {
  Axios.post(`toggleLike/${postid}/`).then((res) => {
    const { Liked, Count } = res.data;


    SetProfile(prev => ({
      ...prev,
      liked: prev.liked.map(p =>
        p.id === postid ? { ...p, likes: Count } : p
      ),
      saved: prev.saved.map(p =>
        p.id === postid ? { ...p, likes: Count } : p
      )
    }));

    if (Liked) {
      setLikedPosts(prev => [...prev, postid]);
    } else {
      setLikedPosts(prev => prev.filter(id => id !== postid));
    }
  }).catch(err => console.error("Toggle like failed", err));
}

const toggleSave = (postid) => {
  Axios.post(`toggleSave/${postid}/`).then((res) => {
    const { Saved, Count } = res.data;


    SetProfile(prev => ({
      ...prev,
      liked: prev.liked.map(p =>
        p.id === postid ? { ...p, saves: Count } : p
      ),
      saved: prev.saved.map(p =>
        p.id === postid ? { ...p, saves: Count } : p
      )
    }));

    if (Saved) {
      setSavedPosts(prev => [...prev, postid]);
    } else {
      setSavedPosts(prev => prev.filter(id => id !== postid));
    }
  }).catch(err => console.error("Toggle save failed", err));
}

const toggleBlock = async () => {
  try {
    const response = await Axios.post(`block/${username}/`)
    setBlocked(response.data.blocked)
  } catch (error) {
    console.error("Block action failed", error)
  }
}

  return (
    <div className='flex flex-col gap-2'>
      <Navbar/>
      <div className='flex items-center justify-center'>
        <Card className="relative w-full max-w-[65vh] h-[90vh] flex overflow-x-hidden -2 my-scrollable-box flex flex-col items-center ">
          <div className="h-28 w-full shrink-0 overflow-hidden bg-gradient-to-r from-orange-500/30 via-zinc-800 to-zinc-900">
            {profile?.cover && <img src={`https://circleup-backend-2.onrender.com${profile.cover}`} alt="Profile cover" className="h-full w-full object-cover" />}
          </div>
          <div className="flex flex-col gap-2 items-center mt-6">


              <Avatar className="w-[90px] h-auto mt-6">
                  <AvatarImage src={`https://circleup-backend-2.onrender.com${profile?.pfp}`} />
                <AvatarFallback>CN</AvatarFallback>
           </Avatar>
           <div className='flex flex-col gap-2 font-manrope items-center'>
              <p>{profile?.username}</p>
              <p>{profile?.bio}</p>
           </div>

          </div>
          
          <div className='flex items-center justify-center gap-4 mt-6 font-manrope'>
            <div className='flex flex-col items-center w-20'>
              <p>{profile?.posts.length}</p>
              <p>Posts</p>
            </div>
            <button type="button" onClick={() => setNetworkTab(networkTab === "followers" ? null : "followers")} className='flex flex-col items-center w-20'>
              <p>{profile?.followers_count}</p>
              <p>Followers</p>
            </button>
            <button type="button" onClick={() => setNetworkTab(networkTab === "following" ? null : "following")} className='flex flex-col items-center w-20'>
              <p>{profile?.following_count}</p>
              <p>Following</p>
            </button>

          </div>
          {networkTab && (
            <div className="mt-3 w-full max-w-xs rounded-xl bg-white/5 p-3">
              <p className="mb-2 text-xs font-medium uppercase tracking-wider text-orange-400">{networkTab}</p>
              <div className="space-y-1">
                {(profile?.[networkTab] || []).map((person) => <p key={person.id} className="text-sm">{person.username}</p>)}
                {!profile?.[networkTab]?.length && <p className="text-sm text-muted-foreground">No users yet.</p>}
              </div>
            </div>
          )}
          <div className="mt-3 flex gap-2 text-xs text-muted-foreground">
            <span>Followers {profile?.followers_count}</span>
            <span>Following {profile?.following_count}</span>
          </div>

          {!profile?.isowner && profile && (
            <Button variant="outline" size="sm" className="mt-3" onClick={toggleBlock}>
              {blocked ? "Unblock user" : "Block user"}
            </Button>
          )}

          {profile?.isowner ? 

          <div>
            <ProfileTabs profile={profile} toggleSave={toggleSave} toggleLike={toggleLike} savedPosts={savedPosts} likedPosts={likedPosts} />
          </div>

           : 

             <div className="mt-4 w-full max-w-[36rem] px-2 sm:px-0">
            {profile?.posts?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={`https://circleup-backend-2.onrender.com${profile?.pfp}`}/>
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='cursor-pointer'>{profile?.username || "Unknown"}</p>
                </div>
                {/* <div className='flex items-center gap-2'>

                  {following.includes(post.profile.user.id) 
                  ? 
                  <Button size="sm" variant="outline" className="h-[25px]" onClick={() => Follow(post.profile.user.id)}>unfollow</Button> 
                  : 
                  <Button size="sm" className="h-[25px]" onClick={() => Follow(post.profile.user.id)}>Follow</Button> 
                  }   
                    <Button variant="outline" size="icon" className="h-[25px] w-auto p-1" onClick={()=> navigate(`/profile/${username}`)}>
                          <User />
                    </Button>
                </div> */}
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
            }
        </Card>
      </div>
    </div>
  )
}

export default Profile;