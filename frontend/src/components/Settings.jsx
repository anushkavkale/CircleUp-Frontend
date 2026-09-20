import {React, useEffect, useState} from 'react'

import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

import { Settings as SettingsIcon} from 'lucide-react';

import { Info , UserPen , User } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { CircleUserRoundIcon } from "lucide-react"

import { useFileUpload } from "@/hooks/use-file-upload"
import { useNavigate } from 'react-router-dom';

import Axios from '../components/Axios'
const Settings = ({pfp,bio, username, email}) => {
  const [ActiveTap, setActiveTap] = useState("Profile")

  const [Username, setUsername] = useState(username)
  const [Email, setEmail] = useState(email)


  const [Bio, setBio] = useState(bio)
  const [coverFile, setCoverFile] = useState(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [preferences, setPreferences] = useState({ likes: true, comments: true, follows: true, messages: true, requests: true, groups: true })
  


  const navigate = new useNavigate()

  const [{ files }, { removeFile, openFileDialog, getInputProps }] =
      useFileUpload({
        accept: "image/*",
      })

  useEffect(() => {
    Axios.get("notification-preferences/").then((res) => setPreferences(res.data)).catch(() => {})
  }, [])

    const previewUrl = files[0]?.preview || pfp
    const fileName = files[0]?.file.name || null

    const Public = () => {

          Axios.post("visibility/", {"visibility":"public"}).then((res) => {
            console.log(res.data)
          })
    }
    const Private = () => {
      
          Axios.post("visibility/", {"visibility":"private"}).then((res) => {
            console.log(res.data)
          })
    }
    



    // useEffect(() => {
    //   if (stats?.user?.username) {
    //     setUsername(stats.user.username);
    //   }
    // }, [stats?.user?.username]);
    // useEffect(() => {
    //   if (stats?.user?.email) {
    //     setEmail(stats.user.email);
    //   }
    // }, [stats?.user?.email]);

    const handleUsername = (e) => {
      setUsername(e.target.value)
    } 

    const handleEmail = (e) => {
      setEmail(e.target.value)
    } 

    const handleBio = (e) => {
      setBio(e.target.value);
    }
 
  

    const UpdateAccount = async () => {
      try{
        const response = await Axios.patch(
          "updateaccount/",
          {
            username : Username,
            email : Email
          },
        )

      if(response.status === 200){
          console.log(response.data.message)
          toast.success("You account has been updated successfully")
        }
    } catch (error) {
      const message = error.response.data.error
      if (message === "Username is already taken"){
        toast.error(message)

      } else if(message === "Email is already taken"){
        toast.error(message)

      } else if(message === "Invalid Username or email"){
        toast.error(message)
      } else{
        console.log(error)
      }
    }
  };



    const Submit = () => {
        try {
            const formData = new FormData();
            
            formData.append("bio", Bio);
            
            if(files[0]){
                formData.append("pfp", files[0].file)
            }
            if (coverFile) formData.append("cover", coverFile)

            Axios.patch("profile/", formData).then((res) => {
                  console.log(res.data)
                  toast.success("Your profile has been updated successfully!")
                })
        } catch(err){
            console.log("", err.message)
        }

        const changePassword = async () => {
          try {
            await Axios.post("change-password/", { current_password: currentPassword, new_password: newPassword })
            setCurrentPassword("")
            setNewPassword("")
            toast.success("Password changed successfully")
          } catch (error) {
            toast.error(error.response?.data?.error || "Could not change password")
          }
        }

        const updatePreference = (field, value) => {
          const next = { ...preferences, [field]: value }
          setPreferences(next)
          Axios.patch("notification-preferences/", { [field]: value }).catch(() => toast.error("Could not update notification preference"))
        }
    }

  const deleteUser = async () => {
    try{
      const response = await Axios.post(
        "deleteuser/",
        {},
      ) 
      navigate("/")
    } catch (error) {
      console.log(error)
    }
  };

    const logout = async () => {
    try{
      const response = await Axios.post(
        "logout",
        {},

      ) 
      navigate("/signin")
    } catch (error) {
    console.log(error.response?.data || error.message);
    }
  };


  const items = [
    {
      title: "Profile",
      icon: UserPen,
    },
    {
      title: "Account",
      icon: User,
    },
  ]

  
  return (
    <Dialog>
            <DialogTrigger asChild>
               <Button size="sm" className="w-4 h-6">
                    <SettingsIcon/>
                </Button> 

            </DialogTrigger>

            <DialogContent className="h-[500px] w-[400px] md:w-[700px] max-w-none p-0 overflow-hidden flex ">
              
              <div style={{ backgroundColor: "hsl(240, 5.9%, 10%)" }}
                  className=" w-[140px] max-w-[200px] md:w-[200px]">

                <p className="text-xs font-medium text-sidebar-foreground/70 p-2">
                  Settings
                </p>
                {items.map((item)=> (       
                  <div key={item.title} className="flex gap-1 p-2 items-center text-sm">
                    <Button variant="ghost" className="w-full justify-start items-left p-2 h-[30px]" onClick={() => setActiveTap(item.title)}>
                      <item.icon/>
                      <p className="font-manrope">{item.title}</p>
                    </Button>
                  </div>
                ))}
                <p className="flex font-manrope text-center justify-center border-t-2 text-xs tracking-wide p-2 text-muted-foreground cursor-default">
                </p>

              </div>

              <div>
                {ActiveTap === "Profile" ? (

  <div>
        <h2 className="text-lg font-semibold mt-2 -ml-2">Profile</h2> 
        <Card className="flex justify-center items-center mt-1 ">
            <CardContent className="flex flex-col justify-between max-w-[450px] md:w-[450px] h-[450px] p-4">
                <div>
                <Label >Bio</Label>
                <Textarea  value={Bio} onChange={handleBio} className="[resize:none]"  placeholder="Tell us about yourself!" />

                <div className="flex justify-between items-center gap-2 mt-2">
                <div>
                <Label>Profile Picture</Label>
                <div className="flex flex-col justify-between">
                    <div className="inline-flex items-center gap-2 ">
                        <div
                            className="border-input relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border"
                            aria-label={
                            previewUrl ? "Preview of uploaded image" : "Default user avatar"
                            }
                        >
                            {previewUrl ? (
                            <img
                                className="size-full object-cover"
                                src={previewUrl}
                                alt="Preview of uploaded image"
                                width={32}
                                height={32}
                            />
                            ) : (
                            <div aria-hidden="true">
                                <CircleUserRoundIcon className="opacity-60" size={16} />
                            </div>
                            )}
                        </div>
                            <div className="relative inline-block ">
                              <Button onClick={openFileDialog} aria-haspopup="dialog"  size={4}>
                                <p className="text-xs p-2">{fileName ? "Change image" : "Upload image"}</p>
                                </Button>
                                <input
                                {...getInputProps()}
                                className="sr-only"
                                type="file"
                                aria-label="Upload image file"
                                tabIndex={-1}
                                />
                            </div>
                        </div>
                            {fileName && (
                            <div className="flex justify-between  gap-2 text-xs">
                                <p className="text-muted-foreground truncate" aria-live="polite">
                                {fileName}
                                </p>{" "}
                                <button
                                onClick={() => removeFile(files[0]?.id)}
                                className="text-destructive font-medium hover:underline"
                                aria-label={`Remove ${fileName}`}
                                >
                                Remove
                                </button>
                            </div>
                            )}


                </div>
            </div>
            <div className="mt-3">
              <Label>Cover photo</Label>
              <Input type="file" accept="image/*" onChange={(event) => setCoverFile(event.target.files?.[0] || null)} />
            </div>
  <div className="flex items-center mt-5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-auto text-xs w-[75px] h-[30px] px-6"
            aria-label="Open edit menu"
          >
            Visibility
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-[60px]">
          <div className="flex flex-col gap-1 p-1">
            <Button size="sm" className="h-[22px] mx-2 mt-1" onClick={() => Public()}>Public</Button>
            <Button size="sm" className="h-[22px] mx-2" onClick={() => Private()}>Private</Button>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
      </div>
      </div>
          <Button className=" self-end" onClick={Submit}>Submit</Button>


        </CardContent>
      </Card>                 
       </div>

    ) : ActiveTap === "Account" && (

      <div>
          <h2 className="text-lg font-semibold mt-2 -ml-2">Account</h2> 
          <Card className="flex justify-center items-center mt-1">
            <CardContent className="flex flex-col max-w-[450px] md:w-[450px] h-[450px] p-4">
              <div className="flex flex-col mt-2 gap-3 flex-grow">
                <div className="text-sm">

                  <Label className="text-xs">Username</Label>
                  <Input id="username" type="text" value={Username} onChange={handleUsername} placeholder="Enter your new username!"/>

                </div>

                <div>
                  <Label className="text-xs">email</Label>
                  <Input id="username" type="text" value={Email} onChange={handleEmail}  placeholder="Enter your new email!"/>
                </div>
                  <div className="flex flex-col gap-2 md:gap-0 md:flex-row md:justify-between">
                    <Button variant="outline" className="text-xs w-[125px] h-[30px] px-12" onClick={changePassword}>Change Password</Button>
                      <div className='flex gap-2'>
                        <Button variant='outline' className="text-xs w-[100px] h-[30px] px-12" onClick={logout}>logout</Button>
                        <AlertDialog>
                            <AlertDialogTrigger>
                                        <Button variant='destructive' className="text-xs w-[100px] h-[30px] px-12"  >Delete Account</Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Are you  sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  This action cannot be undone. This will permanently delete your account
                                  and remove your data from our servers.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={deleteUser}>Continue</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                      </div>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs">Current password</Label>
                    <Input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} />
                    <Label className="text-xs">New password</Label>
                    <Input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} placeholder="At least 8 characters" />
                  </div>
                  <div className="mt-3 border-t border-white/10 pt-3">
                    <p className="mb-2 text-xs font-medium">Notification preferences</p>
                    {Object.entries(preferences).map(([field, enabled]) => (
                      <label key={field} className="flex items-center justify-between text-xs capitalize">
                        {field}
                        <input type="checkbox" checked={enabled} onChange={(event) => updatePreference(field, event.target.checked)} />
                      </label>
                    ))}
                  </div>
                  
              </div>


              <Button className="mt-2 self-end" onClick={UpdateAccount}>Submit</Button>


              </CardContent>
            </Card>                 
          </div>

        ) }

      </div>
            </DialogContent>

    </Dialog>
  )
}

export default Settings