import React, { useEffect, useRef, useState } from "react"
import { Check, MessageCircle, Pencil, Send, Trash2, UserRound, X } from "lucide-react"
import Axios from "../Axios"
import Navbar from "../Navbar"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { Card } from "../ui/card"
import { Input } from "../ui/input"

const API_ORIGIN = "https://circleup-backend-2.onrender.com"
const WS_ORIGIN = "ws://localhost:8000"

const profileImage = (path) => {
  if (!path) return undefined
  return path.startsWith("http") ? path : `${API_ORIGIN}${path}`
}

const Messages = () => {
  const [users, setUsers] = useState([])
  const [conversations, setConversations] = useState([])
  const [incomingRequests, setIncomingRequests] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState("")
  const [editingMessageId, setEditingMessageId] = useState(null)
  const [editingDraft, setEditingDraft] = useState("")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const socketRef = useRef(null)

  const loadInbox = async () => {
    try {
      const [usersResponse, conversationsResponse, requestsResponse] = await Promise.all([
        Axios.get("all-users/"),
        Axios.get("conversations/"),
        Axios.get("message-requests/"),
      ])
      setUsers((usersResponse.data.users || []).filter((user) => user.is_following))
      setConversations(conversationsResponse.data.conversations || [])
      setIncomingRequests(requestsResponse.data.incoming || [])
      setError("")
    } catch {
      setError("Unable to load messages.")
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async (conversationId) => {
    try {
      const response = await Axios.get(`conversations/${conversationId}/messages/`)
      setMessages(response.data.messages || [])
      setConversations((current) => current.map((conversation) => (
        conversation.id === conversationId
          ? { ...conversation, unread_count: 0 }
          : conversation
      )))
    } catch {
      setError("Unable to load this conversation.")
    }
  }

  useEffect(() => {
    loadInbox()
  }, [])

  useEffect(() => {
    if (!selectedConversation) return undefined

    loadMessages(selectedConversation.id)
    const socketOrigin = window.location.protocol === "https:" ? WS_ORIGIN.replace("ws://", "wss://") : WS_ORIGIN
    const socket = new WebSocket(`${socketOrigin}/ws/conversations/${selectedConversation.id}/`)
    socketRef.current = socket
    socket.onopen = () => setError("")
    socket.onmessage = (event) => {
      const payload = JSON.parse(event.data)
      if (payload.type === "message") {
        setMessages((current) => current.some((message) => message.id === payload.message.id)
          ? current
          : [...current, payload.message])
      }
      if (payload.type === "error") setError(payload.error)
    }
    socket.onerror = () => setError("Live chat unavailable. Using fallback refresh.")
    const intervalId = window.setInterval(() => {
      loadMessages(selectedConversation.id)
    }, 4000)

    return () => {
      window.clearInterval(intervalId)
      socket.close()
      socketRef.current = null
    }
  }, [selectedConversation?.id])

  const startConversation = async (user) => {
    try {
      const existingConversation = conversations.find(
        (conversation) => conversation.other_user.username === user.username,
      )
      if (existingConversation) {
        setSelectedConversation(existingConversation)
        setError("")
        return
      }

      const requestMessage = user.can_message
        ? ""
        : window.prompt(
          "You do not follow each other yet. Enter a message request:",
        )
      if (!user.can_message && !requestMessage?.trim()) return
      const response = await Axios.post("conversations/", {
        username: user.username,
        ...(requestMessage?.trim() ? { content: requestMessage.trim() } : {}),
      })
      if (response.data.request_created) {
        setError("Message request sent. You can chat after it is accepted.")
        return
      }
      const conversation = response.data
      setConversations((current) => {
        const exists = current.some((item) => item.id === conversation.id)
        return exists ? current : [conversation, ...current]
      })
      setSelectedConversation(conversation)
      setError("")
    } catch (err) {
      setError(err.response?.data?.error || "Unable to start conversation.")
    }
  }

  const decideRequest = async (requestId, decision) => {
    try {
      const response = await Axios.post(`message-requests/${requestId}/${decision}/`)
      setIncomingRequests((current) => current.filter((item) => item.id !== requestId))
      if (decision === "accept") {
        setConversations((current) => [response.data.conversation, ...current.filter((item) => item.id !== response.data.conversation.id)])
        setSelectedConversation(response.data.conversation)
        setError("")
      }
    } catch (err) {
      setError(err.response?.data?.error || "Could not update the message request.")
    }
  }

  const sendMessage = async (event) => {
    event.preventDefault()
    const content = draft.trim()
    if (!content || !selectedConversation) return

    try {
      if (socketRef.current?.readyState === WebSocket.OPEN) {
        socketRef.current.send(JSON.stringify({ type: "message", content }))
      } else {
        const response = await Axios.post(
          `conversations/${selectedConversation.id}/messages/`,
          { content },
        )
        setMessages((current) => [...current, response.data])
      }
      setDraft("")
    } catch {
      setError("Message could not be sent.")
    }
  }

  const startEditing = (message) => {
    setEditingMessageId(message.id)
    setEditingDraft(message.content)
    setError("")
  }

  const cancelEditing = () => {
    setEditingMessageId(null)
    setEditingDraft("")
  }

  const updateMessage = async (event, messageId) => {
    event.preventDefault()
    const content = editingDraft.trim()
    if (!content) return

    try {
      const response = await Axios.patch(`messages/${messageId}/`, { content })
      setMessages((current) => current.map((message) => (
        message.id === messageId ? response.data : message
      )))
      cancelEditing()
    } catch (err) {
      setError(err.response?.data?.error || "Message could not be updated.")
    }
  }

  const deleteMessage = async (messageId) => {
    if (!window.confirm("Delete this message?")) return

    try {
      await Axios.delete(`messages/${messageId}/`)
      setMessages((current) => current.filter((message) => message.id !== messageId))
      if (editingMessageId === messageId) cancelEditing()
    } catch (err) {
      setError(err.response?.data?.error || "Message could not be deleted.")
    }
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto w-full max-w-[55rem] px-2 py-3 sm:px-4 sm:py-5">
        <Card className="surface-card grid h-[calc(100vh-7rem)] min-h-[34rem] overflow-hidden rounded-2xl md:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="min-h-0 overflow-y-auto border-b border-white/10 p-3 md:border-b-0 md:border-r">
            <div className="mb-4 flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-orange-400">Inbox</p>
                <h1 className="text-xl font-semibold">Messages</h1>
              </div>
              <MessageCircle className="text-orange-400" size={20} />
            </div>

            <div className="flex gap-2 overflow-x-auto pb-3 md:block md:space-y-2 md:overflow-visible">
              {users.map((user) => (
                <Button
                  key={user.id}
                  variant="ghost"
                  className="h-auto min-w-[9rem] justify-start gap-2 rounded-xl px-3 py-2 md:w-full"
                  onClick={() => startConversation(user)}
                >
                  <Avatar className="size-8 shrink-0">
                    <AvatarImage src={profileImage(user.pfp)} />
                    <AvatarFallback>{user.username?.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <span className="truncate">{user.username}</span>
                </Button>
              ))}
            </div>

            <div className="mt-2 space-y-1 border-t border-white/10 pt-3">
              {incomingRequests.length > 0 && (
                <div className="mb-3 space-y-2 border-b border-white/10 px-2 pb-3">
                  <p className="text-xs font-medium uppercase tracking-[0.16em] text-orange-400">Requests</p>
                  {incomingRequests.map((request) => (
                    <div key={request.id} className="rounded-xl bg-white/5 p-2">
                      <p className="text-sm font-medium">{request.sender.username}</p>
                      <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{request.content}</p>
                      <div className="mt-2 flex gap-2">
                        <Button size="sm" className="h-7 flex-1 rounded-lg text-xs" onClick={() => decideRequest(request.id, "accept")}>
                          Accept
                        </Button>
                        <Button size="sm" variant="outline" className="h-7 flex-1 rounded-lg text-xs" onClick={() => decideRequest(request.id, "reject")}>
                          Reject
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <p className="px-2 pb-1 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Recent</p>
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={selectedConversation?.id === conversation.id ? "secondary" : "ghost"}
                  className="h-auto w-full justify-between gap-2 rounded-xl px-3 py-2"
                  onClick={() => setSelectedConversation(conversation)}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    <UserRound size={16} className="shrink-0 text-orange-400" />
                    <span className="truncate">{conversation.other_user.username}</span>
                  </span>
                  {conversation.unread_count > 0 && (
                    <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs text-black">
                      {conversation.unread_count}
                    </span>
                  )}
                </Button>
              ))}
            </div>
          </aside>

          <section className="flex min-h-0 min-w-0 flex-col">
            {selectedConversation ? (
              <>
                <header className="border-b border-white/10 px-4 py-4">
                  <p className="text-xs text-muted-foreground">Conversation with</p>
                  <h2 className="font-semibold">{selectedConversation.other_user.username}</h2>
                </header>
                <div className="message-scroll min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-3 sm:p-4">
                  {messages.length ? messages.map((message) => {
                    const isMine = message.sender.username !== selectedConversation.other_user.username
                    return (
                      <div key={message.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        {editingMessageId === message.id ? (
                          <form onSubmit={(event) => updateMessage(event, message.id)} className="flex max-w-[85%] gap-1">
                            <Input
                              value={editingDraft}
                              onChange={(event) => setEditingDraft(event.target.value)}
                              maxLength={2000}
                              autoFocus
                              className="rounded-xl bg-white/10"
                            />
                            <Button type="submit" size="icon" className="shrink-0 rounded-xl" aria-label="Save message">
                              <Check size={15} />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="shrink-0 rounded-xl" onClick={cancelEditing} aria-label="Cancel editing">
                              <X size={15} />
                            </Button>
                          </form>
                        ) : (
                          <div className={`group min-w-0 max-w-[85%] break-words rounded-2xl px-3 py-2 text-sm ${isMine ? "bg-orange-500 text-black" : "bg-white/10 text-zinc-100"}`}>
                            <p className="whitespace-pre-wrap break-words">{message.content}</p>
                            <div className="mt-1 flex items-center justify-between gap-3">
                              <p className={`text-[10px] ${isMine ? "text-black/60" : "text-muted-foreground"}`}>
                                {new Date(message.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </p>
                              {isMine && (
                                <span className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                                  <button type="button" onClick={() => startEditing(message)} aria-label="Edit message" className="rounded p-1 hover:bg-black/10">
                                    <Pencil size={12} />
                                  </button>
                                  <button type="button" onClick={() => deleteMessage(message.id)} aria-label="Delete message" className="rounded p-1 hover:bg-black/10">
                                    <Trash2 size={12} />
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  }) : (
                    <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                      Start the conversation.
                    </div>
                  )}
                </div>
                <form onSubmit={sendMessage} className="flex gap-2 border-t border-white/10 p-3">
                  <Input
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    placeholder="Write a message..."
                    maxLength={2000}
                    className="rounded-xl bg-white/5"
                  />
                  <Button type="submit" size="icon" className="shrink-0 rounded-xl" aria-label="Send message">
                    <Send size={16} />
                  </Button>
                </form>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <MessageCircle className="text-orange-400" size={32} />
                <h2 className="text-lg font-semibold">Choose someone to message</h2>
                <p className="max-w-sm text-sm text-muted-foreground">Select a user above to start a private conversation.</p>
              </div>
            )}
            {error && <p className="border-t border-red-500/20 px-4 py-2 text-sm text-red-300">{error}</p>}
            {loading && <p className="px-4 pb-3 text-xs text-muted-foreground">Loading inbox...</p>}
          </section>
        </Card>
      </main>
    </div>
  )
}

export default Messages
