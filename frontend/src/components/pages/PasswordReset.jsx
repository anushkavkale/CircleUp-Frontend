import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import Axios from "../Axios"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"

const PasswordReset = () => {
  const [email, setEmail] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    const response = await Axios.post("password-reset/", { email })
    setMessage(response.data.message)
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="surface-card w-full max-w-sm space-y-4 rounded-2xl p-6">
        <div><p className="text-xs uppercase tracking-widest text-orange-400">CircleUp security</p><h1 className="text-xl font-semibold">Reset password</h1></div>
        <form onSubmit={submit} className="space-y-3">
          <Input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Email address" />
          <Button type="submit" className="w-full">Send reset email</Button>
        </form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button variant="ghost" onClick={() => navigate("/signin")}>Back to sign in</Button>
      </Card>
    </main>
  )
}

export default PasswordReset
