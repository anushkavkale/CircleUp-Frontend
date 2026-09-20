import React, { useEffect, useState } from 'react'
import AxiosInstance from '../Axios'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose
} from "@/components/ui/dialog"
import { Button } from '../ui/button'
import { Textarea } from "@/components/ui/textarea"

import FileUpload from '../FileUpload'
import { toast } from 'sonner'


const NewPost = () => {

  const [content, setContent] = useState()
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState(null);
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("");

  const [open, setOpen] = useState(false);

  useEffect(() => {
    AxiosInstance.get("groups/").then((res) => setGroups(res.data.groups || []))
  }, [])




  const submit = async (e) => {
    try {
      if (selectedMedia?.type.startsWith("video/")) {
        const duration = await new Promise((resolve, reject) => {
          const video = document.createElement("video")
          video.preload = "metadata"
          video.onloadedmetadata = () => {
            URL.revokeObjectURL(video.src)
            resolve(video.duration)
          }
          video.onerror = reject
          video.src = URL.createObjectURL(selectedMedia)
        })
        if (duration > 90) {
          toast.error("Reels must be 90 seconds or shorter.")
          return
        }
      }
      const formData = new FormData();
      
      formData.append("content", content)
      if(selectedMedia){
        const fieldName = selectedMedia.type.startsWith("video/") ? "video" : "image"
        formData.append(fieldName, selectedMedia)
      }
      if (selectedThumbnail && selectedMedia?.type.startsWith("video/")) {
        formData.append("thumbnail", selectedThumbnail)
      }
      if (selectedGroup) formData.append("group", selectedGroup)

      const res = await AxiosInstance.post("posts/",  formData);
      toast.success("Posted!")
      setSelectedGroup("")
      setSelectedThumbnail(null)
      setOpen(false)
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger>    
            <Button size="sm" variant="outline"> New Post </Button>
        </DialogTrigger>
      <DialogContent>
        <DialogHeader className="flex flex-col gap-2">
          <DialogTitle>New Post</DialogTitle>

          <DialogDescription className="flex flex-col gap-2 items-center" >

            <Textarea placeholder="What's on your mind?" onChange={(e) => setContent(e.target.value)} className="resize-none h-[125px]" />
            <select value={selectedGroup} onChange={(e) => setSelectedGroup(e.target.value)} className="w-full rounded-lg border border-white/10 bg-background px-3 py-2 text-sm">
              <option value="">Post to your profile</option>
              {groups.map((group) => <option key={group.id} value={group.id}>Post to {group.name}</option>)}
            </select>
            {selectedMedia?.type.startsWith("video/") && (
              <label className="w-full text-sm text-muted-foreground">
                Reel thumbnail
                <input type="file" accept="image/*" onChange={(event) => setSelectedThumbnail(event.target.files?.[0] || null)} className="mt-1 block w-full text-xs" />
              </label>
            )}
            <FileUpload onFileSelect={setSelectedMedia}/>

          </DialogDescription>

        </DialogHeader>
        <div className="flex justify-between">

          <DialogClose>
            <Button size="sm" variant="destructive">Cancle</Button>
          </DialogClose>

          <Button size="sm" onClick={submit}>Submit</Button>
        </div>
      </DialogContent>
    </Dialog>

  )
}
export default NewPost;
