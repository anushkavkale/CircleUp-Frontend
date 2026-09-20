import React,{useState} from 'react'
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import AxiosInstance from '../Axios';
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
import { toast } from 'sonner';

const SignUp = () => {

  const navigate = new useNavigate();

  const [Username, SetUsername] = useState();
  const [Email, SetEmail] = useState();
  const [Password, SetPassword] = useState();

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const username = Username.toLowerCase()
    const data = {username: username,
                  email: Email, 
                  password: Password}
                  
    try{
       const response = await AxiosInstance.post("signup/", data, {withCredentials:true})

       if(response.status === 200){
        navigate("/signin")
       }

    } catch(err){
      let error = err.response.data;
      console.log(error)
      if(error.username){
        toast.error("A user with that username already exists.")
      } else if(error.email){
        toast.error("An account with this email already exists.")
      }
    } 
  }
  return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-4 py-8">
          <form onSubmit={handleSubmit} className="flex w-full justify-center">

      <Card className="surface-card w-full max-w-sm rounded-2xl">
      <CardHeader>
        <CardTitle>Create your account</CardTitle>
        <CardDescription>
          Enter your email below to login to your account
        </CardDescription>

      </CardHeader>
      <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Username</Label>
              <Input
                placeholder="Enter your username"
                required
                onChange={(e) => SetUsername(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                type="email"
                placeholder="Enter your email"
                required
                onChange={(e) => SetEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                type="password" 
                required
                placeholder="Enter your password"
                onChange={(e) => SetPassword(e.target.value)}/>
            </div>
          </div>
      </CardContent>
      <CardFooter className="flex-col gap-2">
        <Button type="submit" className="w-full">
          Sign Up
        </Button>
            <p href="" className='text-sm text-muted-foreground my-2'>
              <a className='underline cursor-pointer' onClick={() => navigate("/signin")}>Aleady have an account ?</a>
            </p>   
      </CardFooter>
    </Card>
</form>
    </div>
  )
}
export default SignUp;
