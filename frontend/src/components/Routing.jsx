import React, { useEffect, useState } from 'react'
import {Navigate, Outlet } from "react-router-dom"
import { checkAuth } from '../services/auth';

export const Private = () => {
    const [Authed, setAuthed] = useState(false)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth().then((authenticated) => {
            if (!authenticated) throw new Error("Not authenticated")
            console.log("Authenticated")
            setAuthed(true)
            setLoading(false)
        }).catch(() => {
            console.log("Not Authenticated")
            setAuthed(false)
            setLoading(false)
        })
    }, [])
    if (loading) return <div>Loading ...</div>
  return Authed ? <Outlet /> : <Navigate to="/signin" replace/>
}
export const Public = () => {
    const [Authed, setAuthed] = useState(false)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        checkAuth().then((authenticated) => {
            if (!authenticated) throw new Error("Not authenticated")
            console.log("Authenticated")
            setAuthed(true)
            setLoading(false)
        }).catch(()=>{
            console.log("Not Authenticated")
            setAuthed(false)
            setLoading(false)
        })
    }, [])
    if (loading) return <div>Loading ...</div>

  return Authed ?  <Navigate to="/" replace/> :  <Outlet />
}