import React, { useEffect, useState } from 'react'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"



import NewPost from './pages/NewPost';
import Notifications  from './NotificationDropdown';

import Axios from './Axios'

import ProfileDropDown from './ProfileDropDown';
import { House, KeyRound, Layers3, MessageCircle, PlaySquare, UserRoundPlus, Camera } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const [profile, SetProfile] = useState()
  const navigate = useNavigate()

  const getUser = () => {
      Axios.get("profile/").then((res) => {
          SetProfile(res.data)
          console.log("profile",res.data)       
         })
  }
  useEffect(() => {
    getUser()
  }, [])
  return (
    <div className='flex justify-center'>
        <Card className="surface-card navbar-shell mobile-full-width mt-2 flex h-[62px] w-full max-w-[55rem] min-w-0 items-center justify-between rounded-2xl px-3 sm:px-5">
          <button type="button" className="navbar-brand" onClick={() => navigate('/feed')} aria-label="Go to feed">
            <span className="navbar-brand-mark">P</span>
            <span className="font-manrope text-lg font-bold tracking-tight text-orange-400">CircleUp</span>
          </button>

          <div className="flex min-w-0 items-center gap-1.5 sm:gap-2">
            <div className="navbar-actions">
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon" title="Feed" aria-label="Open feed" onClick={() => navigate('/feed')}>
                <House size={17} />
              </Button>
              <Notifications />
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon" title="Messages" aria-label="Open messages" onClick={() => navigate('/messages')}>
                <MessageCircle size={17} />
              </Button>
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon hidden sm:inline-flex" title="Friends" aria-label="Open friends" onClick={() => navigate('/friends')}>
                <UserRoundPlus size={17} />
              </Button>
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon hidden sm:inline-flex" title="Groups" aria-label="Open groups" onClick={() => navigate('/groups')}>
                <Layers3 size={17} />
              </Button>
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon" title="Reels" aria-label="Open reels" onClick={() => navigate('/reels')}>
                <PlaySquare size={17} />
              </Button>
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon" title="Stories" aria-label="Open stories" onClick={() => navigate('/stories')}>
                <Camera size={17} />
              </Button>
              <Button size="icon" variant="ghost" className="no-hover-effect navbar-icon hidden sm:inline-flex" title="Security" aria-label="Open security" onClick={() => navigate('/security')}>
                <KeyRound size={17} />
              </Button>
            </div>
            <NewPost />
            <div className="navbar-account min-w-0">
              <Avatar className="size-8 border border-orange-400/30">
                <AvatarImage src={`https://circleup-backend-2.onrender.com${profile?.pfp}`} />
                <AvatarFallback>{profile?.user?.username?.slice(0, 2).toUpperCase() || 'CN'}</AvatarFallback>
              </Avatar>
              <span className="hidden max-w-24 min-w-0 truncate text-sm font-medium sm:inline">{profile?.user?.username}</span>
              <ProfileDropDown username={profile?.user?.username} email={profile?.user?.email} bio={profile?.bio} pfp={`https://circleup-backend-2.onrender.com${profile?.pfp}`} />
            </div>
          </div>
        </Card>
    </div>
  )
}

export default Navbar