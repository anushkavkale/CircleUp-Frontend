import React, { useEffect, useState } from 'react'
import {Navigate, Outlet } from "react-router-dom"
import Axios from '../components/Axios';

export const Private = () => {
    const [Authed, setAuthed] = useState(false)

    const [loading, setLoading] = useState(true)

    useEffect(() => {
        Axios.get("check/").then(() => {
            console.log("Authenticated")
            setAuthed(true)
            setLoading(false)
        }).catch((err) => {
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
        Axios.get("check/").then(() => {
            console.log("Authenticated")
            setAuthed(true)
            setLoading(false)
        }).catch((err)=>{
            console.log("Not Authenticated")
            setAuthed(false)
            setLoading(false)
        })
    }, [])
    if (loading) return <div>Loading ...</div>

  return Authed ?  <Navigate to="/" replace/> :  <Outlet />
}