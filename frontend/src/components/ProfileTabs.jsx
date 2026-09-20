import React from 'react'
import { useState, useEffect } from "react";
import Axios from "./Axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import { Button } from '../components/ui/button';

import {Card,} from "@/components/ui/card";

import { IoHeartOutline } from "react-icons/io5";
import { IoHeartSharp } from "react-icons/io5";

import { IoBookmarkOutline } from "react-icons/io5";
import { IoBookmark } from "react-icons/io5";
import { toast } from 'sonner'

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import PostMedia from './PostMedia';

const ProfileTabs = ({profile, toggleLike, toggleSave, likedPosts, savedPosts}) => {

  const DeletePost = (id) => {
    Axios.post("deletepost/", {"id":id}).then((res)=>{
      console.log(res.data)
      console.log("profile",profile)
      toast.success("Post deleted!")
    })
  }


  return (
    <Tabs defaultValue="tab-1" className="items-center mt-6">
      <TabsList className="flex items-center justify-center">
        <TabsTrigger value="tab-1">Posts</TabsTrigger>
        <TabsTrigger value="tab-2">Liked</TabsTrigger>
        <TabsTrigger value="tab-3">Saved</TabsTrigger>

      </TabsList>

      <TabsContent value="tab-1">

             <div className="mt-4 flex w-full max-w-[36rem] flex-col gap-3 px-2 sm:px-0">
            {profile?.posts?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={`https://circleup-backend-2.onrender.com${profile?.pfp}`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='cursor-pointer'>{profile?.username || "Unknown"}</p>
                </div>
                <Button size="sm" variant="destructive" className="h-[25px]" onClick={() => DeletePost(post.id)}>Delete</Button> 
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

      </TabsContent>
       
      <TabsContent value="tab-2">
         <div className="mt-4 flex w-full max-w-[36rem] flex-col gap-3 px-2 sm:px-0">
            {profile?.liked?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={`https://circleup-backend-2.onrender.com${post?.profile?.pfp}`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='cursor-pointer'>{post?.profile?.user?.username || "Unknown"}</p>
                </div>
                <Button size="sm" variant="destructive" className="h-[25px]" onClick={() => DeletePost(post.id)}>Delete</Button> 
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
      </TabsContent>

      <TabsContent value="tab-3">
         <div className="mt-4 flex w-full max-w-[36rem] flex-col gap-3 px-2 sm:px-0">
            {profile?.saved?.map((post) => (
            <Card className="surface-card w-full rounded-2xl" key={post.id}>
              <div className='ml-4 mr-4 mt-4 flex justify-between items-center'>
                <div className='flex items-center gap-1'>
                  <Avatar className="w-[30px] h-auto">
                    <AvatarImage src={`https://circleup-backend-2.onrender.com${post?.profile?.pfp}`} />
                    <AvatarFallback>CN</AvatarFallback>
                  </Avatar>
                  <p className='cursor-pointer'>{post?.profile?.user?.username || "Unknown"}</p>
                </div>
                <Button size="sm" variant="destructive" className="h-[25px]" onClick={() => DeletePost(post.id)}>Delete</Button> 
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
      </TabsContent>
    </Tabs>
  )
    
}

export default ProfileTabs;