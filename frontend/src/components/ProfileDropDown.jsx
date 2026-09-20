import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import { ChevronDown, LogOut } from 'lucide-react';

import Settings from "./Settings";

import { useNavigate } from "react-router";

import Axios from "./Axios";
import { clearTokens } from "../services/auth";

export default function ProfileDropDown({username,email , pfp, bio}) {
  const navigate = new useNavigate()

  const logout = () => {
    Axios.post("logout/").catch(() => {}).finally(() => {
      clearTokens()
      navigate("/signin")
    })
  }


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          variant="ghost"
          className="rounded-full shadow-none"
          aria-label="Open edit menu">
         <ChevronDown/>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[140px]">
        <div className="flex flex-col gap-1">
             <Button size="sm" className="h-[22px] mx-2 mt-1" onClick={()=>navigate("/feed")} >Feed</Button>
             <Button size="sm" className="h-[22px] mx-2" onClick={()=>navigate(`/profile/${username}`)} >Profile</Button>
             <Button size="sm" className="h-[22px] mx-2" onClick={()=>navigate("/notification")}>Notifications</Button>
              <div className="flex items-center justify-between mx-2 gap-1">

                  <Settings pfp={pfp} bio={bio} username={username} email={email}/>

                <Button size="sm" variant="destructive" className="w-4 h-6" onClick={()=> logout()}>
                  <LogOut/>
                </Button>

             </div>

        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
