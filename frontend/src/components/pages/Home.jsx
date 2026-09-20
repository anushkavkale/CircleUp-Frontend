import React, {useEffect, useState} from 'react'
import Axios from '../Axios';
import Tabs from "@/components/FeedTabs"
import {Card, CardContent} from "@/components/ui/card"

import Navbar from '../Navbar';
import StoryTray from '../StoryTray';

const Home = () => {

  const CheckUser = () => {
    Axios.get("check/").then((res)=>{
      console.log(res.data)
    })
  }
    useEffect(() => {
      CheckUser()
    }, [])
  return (
  <div className="flex flex-col items-center">
        <Navbar/>
        <div className='mobile-content flex w-full max-w-[38rem] flex-col gap-3 p-2'>
          <div className="w-full">
            <StoryTray />
          </div>
          {/* Posts use .map!! */}
          <div className='flex justify-center w-full'>
            <Tabs/>
          </div>

        </div>

        {/* <Card className="mt-24">
          <CardContent className="flex flex-col items-center justify-center p-4">
            <h1 className='text-xl font-bold mb-4'>Liked Posts</h1>
                    {likedPosts?.map((post) => {
                    return(
                      <div key={post.id}>
                        {post.content}
                        <img src={post.image} className='w-48 h-38 rounded-lg' alt="" />
                      </div>
                    )
                  })}
          </CardContent>
          
        </Card> */}

        {/* <Card>
          <CardContent className="flex flex-col items-center justify-center p-4">
            <h1 className='text-xl font-bold mb-4'>Saved Posts</h1>
                    {savedPosts?.map((post) => {
                    return(
                      <div key={post.id}>
                        {post.content}
                        <img src={post.image} className='w-48 h-38 rounded-lg' alt="" />
                      </div>
                    )
                  })}
          </CardContent>
          
        </Card> */}
    </div>
  )
}
export default Home;
