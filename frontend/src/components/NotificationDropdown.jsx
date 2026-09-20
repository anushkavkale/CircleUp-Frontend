import { useEffect, useState } from "react";
import { BsBell } from "react-icons/bs";
import { BsBellFill } from "react-icons/bs";
import { MessageCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { differenceInMinutes, differenceInHours, differenceInDays } from "date-fns";

import Axios from "@/components/Axios"

import { useNavigate } from "react-router";
export default function Notification() {
  const [noti, setNoti] = useState([])
  const [unreadCount, setUnreadCount] = useState(0)

  const navigate = new useNavigate()

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

  const getNotifications = () => {
    Axios.get("getNoti/", {params:{mode:"bell"}}).then((res) => {
      console.log("Notifications:",res.data.notifications)
      const sortedNoti = res.data.notifications.sort(
      (a, b) => new Date(b.created) - new Date(a.created)
    );
      setNoti(sortedNoti)
      setUnreadCount(res.data.unread_count || 0)
    })
  }

  const markAllRead = () => {
    Axios.post("notifications/read/").then(() => {
      setNoti((current) => current.map((item) => ({ ...item, is_read: true })))
      setUnreadCount(0)
    })
  }

  useEffect(() => {
    getNotifications()
    const intervalId = window.setInterval(getNotifications, 10000)
    return () => window.clearInterval(intervalId)
  }, [])
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full shadow-none"
          aria-label="Open edit menu">
          <span className="relative">
            {unreadCount > 0 ? <BsBellFill size={16} aria-hidden="true"/> : <BsBell size={16} aria-hidden="true" />}
            {unreadCount > 0 && <span className="absolute -right-2 -top-2 min-w-4 rounded-full bg-orange-500 px-1 text-center text-[9px] text-black">{unreadCount > 9 ? "9+" : unreadCount}</span>}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="h-[190px]">
        <div className="flex flex-col z-0 h-[150px]">
          <p className="text-xs font-medium border-b pb-2">Notifications.</p>
          {unreadCount > 0 && <button type="button" onClick={markAllRead} className="mt-1 text-left text-[10px] text-orange-400 hover:underline">Mark all as read</button>}
          <div className="flex flex-col w-[225px]  gap-4 mt-1">
            
            {noti.length>0 ? noti.map((noti) => {
              return(
                <div key={noti.id} className="flex flex-col justify-start  ">
                  <div className="flex cursor-pointer justify-between" onClick={() => {
                    if (noti.notif_type === "MESSAGE" || noti.notif_type === "REQUEST") navigate("/messages")
                  }}>
                    <p className="flex items-center gap-1 text-xs font-medium leading-none">
                      {noti.notif_type === "MESSAGE" && <><MessageCircle size={12} />New message</>}
                      {noti.notif_type === "REQUEST" && <><UserPlus size={12} />Message request</>}
                      {noti.notif_type === "LIKE" && "New like"}
                      {noti.notif_type === "FOLLOW" && "New follow"}
                      {!['MESSAGE', 'REQUEST', 'LIKE', 'FOLLOW'].includes(noti.notif_type) && "New notification"}
                    </p>
                    <span className="text-xs text-muted-foreground"> {timeAgoShort(noti.created)} ago</span>
                  </div>
                  <p className={`text-xs ${noti.is_read ? "text-muted-foreground" : "font-medium text-zinc-100"}`}>{noti.message}</p>
                  
                </div>
                
              )
            }) : <div className="flex item-center justify-center h-screen"> <p>Nothing new here</p> </div>}

            {noti.length>0 && <p className="text-xs text-muted-foreground -mt-2 cursor-pointer" onClick={() => navigate("/notification")}>Show more</p>}
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
