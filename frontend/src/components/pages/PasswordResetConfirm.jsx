import React, { useState } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import Axios from "../Axios"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"

const PasswordResetConfirm = () => {
  const [params] = useSearchParams()
  const [password, setPassword] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  const submit = async (event) => {
    event.preventDefault()
    try {
      const response = await Axios.post("password-reset/confirm/", {
        uid: params.get("uid"),
        token: params.get("token"),
        new_password: password,
      })
      setMessage(response.data.message)
    } catch (error) {
      setMessage(error.response?.data?.error || "Unable to reset password.")
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <Card className="surface-card w-full max-w-sm space-y-4 rounded-2xl p-6">
        <div><p className="text-xs uppercase tracking-widest text-orange-400">CircleUp security</p><h1 className="text-xl font-semibold">Choose a new password</h1></div>
        <form onSubmit={submit} className="space-y-3"><Input type="password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="New password" /><Button type="submit" className="w-full">Reset password</Button></form>
        {message && <p className="text-sm text-muted-foreground">{message}</p>}
        <Button variant="ghost" onClick={() => navigate("/signin")}>Back to sign in</Button>
      </Card>
    </main>
  )
}

export default PasswordResetConfirm
