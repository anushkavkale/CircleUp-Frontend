import React, { useEffect, useState } from 'react'
import Navbar from '../Navbar'
import Axios from '../Axios'
import {Card} from "@/components/ui/card"
import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { MessageCircle, UserPlus } from "lucide-react";
import { useNavigate } from 'react-router-dom';
const Notification = () => {
  const navigate = useNavigate()

  function timeAgoShort(dateString) {
    const date = new Date(dateString);
    const now = new Date();

    const diffMins = differenceInMinutes(now, date);
    if (diffMins < 60) return `${diffMins}m`;

    const diffHours = differenceInHours(now, date);
    if (diffHours < 24) return `${diffHours}h`;

    const diffDays = differenceInDays(now, date);
    return `${diffDays}d`;
}


  const [noti, setNoti] = useState([])
    const getNotifications = () => {
      Axios.get("getNoti/", { params : {mode:"page"}}).then((res) => {
        const sortedNoti = res.data.notifications.sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );
        setNoti(sortedNoti)
      })
  }

  const markAllRead = () => {
    Axios.post("notifications/read/").then(() => setNoti((current) => current.map((item) => ({ ...item, is_read: true }))))
  }

  useEffect(() => {
    getNotifications();
  }, [])
  return (
    <div>
        <Navbar/>
            <div className="my-scrollable-box flex h-[86vh] w-full max-w-[38rem] flex-col items-center gap-3 overflow-x-hidden px-2 pb-4">
              <div className="flex w-full justify-end"><button type="button" onClick={markAllRead} className="text-xs text-orange-400 hover:underline">Mark all as read</button></div>
                {noti.length>0
                ? 
                <>
                  {noti?.map((noti) => (
                    <Card className="surface-card w-full rounded-2xl" key={noti.id}>
                      <div className='p-2 flex justify-between items-center'>
                        <div className='flex items-center gap-2'>
                                <Avatar className="w-[30px] h-auto">
                                    <AvatarImage src={noti.user_pfp} />
                                   <AvatarFallback>CN</AvatarFallback>
                              </Avatar>
                          <button type="button" className='cursor-pointer text-left' onClick={() => {
                            if (noti.notif_type === "MESSAGE" || noti.notif_type === "REQUEST") navigate('/messages')
                          }}>
                            <span className="mb-1 flex items-center gap-1 text-xs font-medium text-orange-400">
                              {noti.notif_type === "MESSAGE" ? <MessageCircle size={13} /> : <UserPlus size={13} />}
                              {noti.notif_type === "MESSAGE" ? "New message" : noti.notif_type === "REQUEST" ? "Message request" : "Activity"}
                            </span>
                            <span>{noti?.message}</span>
                          </button>
                        </div>

                          <span className="text-xs text-muted-foreground"> {timeAgoShort(noti.created)} ago</span>
                      </div>
                    </Card>
                  ))}
                </>
                :
                <div>No notifications yet</div>
            }
                  
              </div>
    </div>
  )
}

export default Notification;
