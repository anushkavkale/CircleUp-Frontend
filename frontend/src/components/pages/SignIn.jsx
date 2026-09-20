import React, { useEffect,useState } from 'react'
import Axios from '../Axios';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from 'sonner'

const SignIn = () => {
  const [Username, SetUsername] = useState()
  const [Password, SetPassword] = useState()

  const navigate = new useNavigate();

  useEffect(() => {
    Axios.get("csrftoken/").catch(() => {
      toast.error("Unable to connect to the server.")
    })
  }, [])
  const handleSubmit = async (e) => {
      e.preventDefault()    
      const data = 
          {
            username: Username.trim().toLowerCase(),
            password: Password
          }
          try{
            await Axios.get("csrftoken/")
            const response = await Axios.post("signin/", data)
            if(response.status === 200){
              localStorage.setItem("userId", response.data.user_id)
              navigate("/feed")
            }
          } catch(err){
                toast.error(err.response?.data?.error || "Invalid username or password.")
            
          }

      }

  return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 py-8">
          <form onSubmit={handleSubmit}>
          <Card className="surface-card w-full max-w-sm rounded-2xl">
          <CardHeader>
            <CardTitle>Login to your account</CardTitle>
            <CardDescription>
              Enter your email below to login to your account
            </CardDescription>
          </CardHeader>
          <CardContent>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label>Username</Label>
                  <Input
                    required
                    placeholder="Enter your username"
                    onChange={(e) => SetUsername(e.target.value)} 
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input 
                  id="password" 
                  type="password" 
                  placeholder="Enter your password"
                  required 
                  onChange={(e) => SetPassword(e.target.value)}
                  />
                </div>
              </div>
          </CardContent>
          <CardFooter className="flex-col gap-2">
            <Button type="submit" className="w-full">
              Login
            </Button>
            <p href="" className='text-sm text-muted-foreground my-2'>
              Don't have an accout ?, <a className='underline cursor-pointer' onClick={() => navigate("/signup")}>Create Account</a>
            </p>
            <a className="text-xs text-orange-400 underline" onClick={() => navigate("/password-reset")}>Forgot password?</a>
          </CardFooter>
        </Card>
    </form>
        </div>
  )
}
export default SignIn;
