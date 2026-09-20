import { useState, useEffect } from "react";
import Axios from "./Axios";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"

import PostCard from "./pages/Discover";
import FollowingPosts from "./pages/FollowingPosts";
export default function Tab() {

    const [posts, setPosts] = useState([]);
    const [fposts, setfPosts] = useState([])
    const [users, setUsers] = useState([])

    const [likedPosts, setLikedPosts] = useState([]); 
    const [dislikedPosts, setDislikedPosts] = useState([]);
    const [savedPosts, setSavedPosts] = useState([]); 
    
    const [following, setFollowing] = useState([])
  
    const getFollowing = () => {
    Axios.get(`getfollow/`).then((res) => {
      const followings = res.data.followings;
      const ids = followings.map(user => user.id)
      setFollowing(ids)
    })
  }
    const getPosts = () => {
      Axios.get("feed/").then((res) => {
          setPosts(res.data)
          console.log("posts :", res.data)
        })
  }
    const getFollowingPosts = () => {
      Axios.get("followingsposts/").then((res) => {
          setfPosts(res.data.posts)
          console.log(res.data.posts)
        })
  }
    const getUsers = () => {
      Axios.get("all-users/").then((res) => {
          setUsers(res.data.users)
        })
  }
  const getSavedLiked = () => {
    Axios.get("profile/").then((res) => {
      const LikedIds = res.data.liked_posts.map(post => post.id);
      const DislikedIds = res.data.disliked_posts?.map(post => post.id) || [];
      const SavedIds = res.data.saved_posts.map(post => post.id)

      setLikedPosts(LikedIds)
      setDislikedPosts(DislikedIds)
      setSavedPosts(SavedIds)    
    })
  }

    useEffect(()=>{
      getPosts()
      getSavedLiked()
      getFollowing()
      getFollowingPosts()
      getUsers()
    },[])
  return (
    <Tabs defaultValue="tab-1" className="items-center">
      <TabsList className="flex items-center justify-center">
        <TabsTrigger value="tab-1">Discover</TabsTrigger>
        <TabsTrigger value="tab-2">Following</TabsTrigger>
      </TabsList>
      <TabsContent value="tab-1">
          <PostCard liked={likedPosts} posts={posts} users={users} setPosts={setPosts} savedPosts={savedPosts} likedPosts={likedPosts} dislikedPosts={dislikedPosts} setDislikedPosts={setDislikedPosts} following={following} getSavedLiked={getSavedLiked} getFollowing={getFollowing} />
      </TabsContent>

      <TabsContent value="tab-2">
          <FollowingPosts liked={likedPosts} posts={fposts} setPosts={setfPosts} savedPosts={savedPosts} likedPosts={likedPosts} dislikedPosts={dislikedPosts} setDislikedPosts={setDislikedPosts} following={following} getSavedLiked={getSavedLiked} getFollowing={getFollowing}/>
      </TabsContent>
    </Tabs>
  );
}
