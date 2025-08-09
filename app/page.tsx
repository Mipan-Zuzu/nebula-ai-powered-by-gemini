"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
} from "@/components/ui/sidebar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import {
  Send,
  Sparkles,
  MessageSquare,
  Plus,
  Palette,
  Trash2,
  Download,
  Copy,
  RotateCcw,
  Search,
  Settings,
  Clock,
  X,
  Mic,
  MicOff,
  Folder,
  FolderPlus,
  Edit3,
  Save,
  Share2,
  Bookmark,
  BookmarkCheck,
  Zap,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Pin,
  PinOff,
  Filter,
  SortAsc,
  Archive,
  Tag,
  Bot,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
  reactions?: string[]
  bookmarked?: boolean
  edited?: boolean
  originalContent?: string
  tags?: string[]
}

interface ChatHistory {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  folder?: string
  pinned?: boolean
  archived?: boolean
  shared?: boolean
  tags?: string[]
  model?: string
}

interface ChatFolder {
  id: string
  name: string
  color: string
  chatCount: number
}

interface AppSettings {
  autoScroll: boolean
  soundEnabled: boolean
  fontSize: number
  messagePreview: boolean
  compactMode: boolean
  showTimestamps: boolean
  autoSave: boolean
  voiceEnabled: boolean
}

const themes = {
  default: {
    name: "Default",
    primary: "bg-blue-600 hover:bg-blue-700",
    secondary: "bg-gray-100",
    accent: "text-blue-600",
  },
  purple: {
    name: "Purple",
    primary: "bg-purple-600 hover:bg-purple-700",
    secondary: "bg-purple-50",
    accent: "text-purple-600",
  },
  green: {
    name: "Green",
    primary: "bg-green-600 hover:bg-green-700",
    secondary: "bg-green-50",
    accent: "text-green-600",
  },
  orange: {
    name: "Orange",
    primary: "bg-orange-600 hover:bg-orange-700",
    secondary: "bg-orange-50",
    accent: "text-orange-600",
  },
  teal: {
    name: "Teal",
    primary: "bg-teal-600 hover:bg-teal-700",
    secondary: "bg-teal-50",
    accent: "text-teal-600",
  },
  rose: {
    name: "Rose",
    primary: "bg-rose-600 hover:bg-rose-700",
    secondary: "bg-rose-50",
    accent: "text-rose-600",
  },
}

const aiModels = {
  "gemini-2.0-flash": { name: "Gemini 2.0 Flash", description: "Fast and efficient" },
  "gemini-pro": { name: "Gemini Pro", description: "Advanced reasoning" },
  "gemini-ultra": { name: "Gemini Ultra", description: "Most capable" },
}

const quickPrompts = [
  { title: "Explain Code", prompt: "Please explain this code and how it works:" },
  { title: "Write Email", prompt: "Help me write a professional email about:" },
  { title: "Summarize", prompt: "Please summarize the following text:" },
  { title: "Translate", prompt: "Please translate this to English:" },
  { title: "Debug Code", prompt: "Help me debug this code issue:" },
  { title: "Creative Writing", prompt: "Help me write a creative story about:" },
]

const reactions = ["👍", "👎", "❤️", "😊", "🤔", "🔥", "💯", "🎉"]

export default function NebulaAI() {
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [currentTheme, setCurrentTheme] = useState<keyof typeof themes>("default")
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([])
  const [currentChat, setCurrentChat] = useState<ChatHistory | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSettings, setShowSettings] = useState(false)
  const [folders, setFolders] = useState<ChatFolder[]>([
    { id: "general", name: "General", color: "bg-blue-500", chatCount: 0 },
    { id: "work", name: "Work", color: "bg-green-500", chatCount: 0 },
    { id: "personal", name: "Personal", color: "bg-purple-500", chatCount: 0 },
  ])
  const [selectedFolder, setSelectedFolder] = useState<string | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [editingMessage, setEditingMessage] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [selectedModel, setSelectedModel] = useState<keyof typeof aiModels>("gemini-2.0-flash")
  const [showQuickPrompts, setShowQuickPrompts] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [sortBy, setSortBy] = useState<"date" | "name" | "messages">("date")
  const [filterBy, setFilterBy] = useState<"all" | "pinned" | "bookmarked" | "archived">("all")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolder, setShowNewFolder] = useState(false)
  const [tagInput, setTagInput] = useState("")
  const [showTagInput, setShowTagInput] = useState(false)

  const [settings, setSettings] = useState<AppSettings>({
    autoScroll: true,
    soundEnabled: true,
    fontSize: 14,
    messagePreview: true,
    compactMode: false,
    showTimestamps: true,
    autoSave: true,
    voiceEnabled: true,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])

  useEffect(() => {
    // Load data from localStorage
    const savedHistory = localStorage.getItem("nebula-chat-history")
    const savedFolders = localStorage.getItem("nebula-folders")
    const savedSettings = localStorage.getItem("nebula-settings")

    if (savedHistory) {
      const parsed = JSON.parse(savedHistory)
      setChatHistory(
        parsed.map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        })),
      )
    }

    if (savedFolders) {
      setFolders(JSON.parse(savedFolders))
    }

    if (savedSettings) {
      setSettings(JSON.parse(savedSettings))
    }

    // Keyboard shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case "n":
            e.preventDefault()
            createNewChat()
            break
          case "k":
            e.preventDefault()
            setSearchQuery("")
            document.getElementById("search-input")?.focus()
            break
          case "s":
            e.preventDefault()
            if (currentChat) exportChat(currentChat)
            break
          case "/":
            e.preventDefault()
            setShowQuickPrompts(!showQuickPrompts)
            break
        }
      }
      if (e.key === "Escape") {
        setShowSettings(false)
        setShowQuickPrompts(false)
        setEditingMessage(null)
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [currentChat, showQuickPrompts])

  useEffect(() => {
    if (settings.autoScroll && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [currentChat?.messages, loading, settings.autoScroll])

  useEffect(() => {
    // Update folder chat counts
    const updatedFolders = folders.map((folder) => ({
      ...folder,
      chatCount: chatHistory.filter((chat) => chat.folder === folder.id).length,
    }))
    setFolders(updatedFolders)
    localStorage.setItem("nebula-folders", JSON.stringify(updatedFolders))
  }, [chatHistory])

  useEffect(() => {
    localStorage.setItem("nebula-settings", JSON.stringify(settings))
  }, [settings])

  const playNotificationSound = () => {
    if (settings.soundEnabled) {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuBzvLZiTYIG2m98OScTgwOUarm7blmGgU7k9n1unEiBC13yO/eizEIHWq+8+OWT",
      )
      audio.volume = 0.1
      audio.play().catch(() => {})
    }
  }

  const startVoiceRecording = async () => {
    if (!settings.voiceEnabled) return

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: "audio/wav" })
        // Here you would typically send the audio to a speech-to-text service
        // For now, we'll just show a placeholder
        setInput(input + " [Voice input recorded]")
        stream.getTracks().forEach((track) => track.stop())
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error("Error accessing microphone:", error)
    }
  }

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const isCodeOutput = (text: string) => {
    const codePatterns = [
      /```[\s\S]*```/,
      /`[^`]+`/,
      /function\s+\w+\s*\(/,
      /class\s+\w+/,
      /import\s+.*from/,
      /export\s+(default\s+)?/,
      /console\.log\(/,
      /def\s+\w+\s*\(/,
      /print\s*\(/,
      /<\w+.*>/,
      /\{\s*[\w\s:,'"]+\s*\}/,
    ]
    return codePatterns.some((pattern) => pattern.test(text))
  }

  const createNewChat = (folderId?: string) => {
    const newChat: ChatHistory = {
      id: Date.now().toString(),
      title: "New Chat",
      messages: [],
      createdAt: new Date(),
      folder: folderId || selectedFolder || "general",
      model: selectedModel,
    }
    setCurrentChat(newChat)
  }

  const createNewFolder = () => {
    if (!newFolderName.trim()) return

    const newFolder: ChatFolder = {
      id: Date.now().toString(),
      name: newFolderName,
      color: `bg-${["blue", "green", "purple", "orange", "pink", "indigo"][Math.floor(Math.random() * 6)]}-500`,
      chatCount: 0,
    }

    setFolders([...folders, newFolder])
    setNewFolderName("")
    setShowNewFolder(false)
  }

  const saveChat = (chat: ChatHistory) => {
    const updatedHistory = chatHistory.filter((c) => c.id !== chat.id)
    updatedHistory.unshift(chat)
    setChatHistory(updatedHistory)
    localStorage.setItem("nebula-chat-history", JSON.stringify(updatedHistory))
  }

  const deleteChat = (chatId: string) => {
    const updatedHistory = chatHistory.filter((c) => c.id !== chatId)
    setChatHistory(updatedHistory)
    localStorage.setItem("nebula-chat-history", JSON.stringify(updatedHistory))
    if (currentChat?.id === chatId) {
      setCurrentChat(null)
    }
  }

  const toggleChatPin = (chatId: string) => {
    const updatedHistory = chatHistory.map((chat) => (chat.id === chatId ? { ...chat, pinned: !chat.pinned } : chat))
    setChatHistory(updatedHistory)
    localStorage.setItem("nebula-chat-history", JSON.stringify(updatedHistory))
  }

  const toggleChatArchive = (chatId: string) => {
    const updatedHistory = chatHistory.map((chat) =>
      chat.id === chatId ? { ...chat, archived: !chat.archived } : chat,
    )
    setChatHistory(updatedHistory)
    localStorage.setItem("nebula-chat-history", JSON.stringify(updatedHistory))
  }

  const addReaction = (messageId: string, reaction: string) => {
    if (!currentChat) return

    const updatedMessages = currentChat.messages.map((msg) => {
      if (msg.id === messageId) {
        const reactions = msg.reactions || []
        const hasReaction = reactions.includes(reaction)
        return {
          ...msg,
          reactions: hasReaction ? reactions.filter((r) => r !== reaction) : [...reactions, reaction],
        }
      }
      return msg
    })

    const updatedChat = { ...currentChat, messages: updatedMessages }
    setCurrentChat(updatedChat)
    saveChat(updatedChat)
  }

  const toggleBookmark = (messageId: string) => {
    if (!currentChat) return

    const updatedMessages = currentChat.messages.map((msg) =>
      msg.id === messageId ? { ...msg, bookmarked: !msg.bookmarked } : msg,
    )

    const updatedChat = { ...currentChat, messages: updatedMessages }
    setCurrentChat(updatedChat)
    saveChat(updatedChat)
  }

  const editMessage = (messageId: string, newContent: string) => {
    if (!currentChat) return

    const updatedMessages = currentChat.messages.map((msg) =>
      msg.id === messageId
        ? {
            ...msg,
            originalContent: msg.originalContent || msg.content,
            content: newContent,
            edited: true,
          }
        : msg,
    )

    const updatedChat = { ...currentChat, messages: updatedMessages }
    setCurrentChat(updatedChat)
    saveChat(updatedChat)
    setEditingMessage(null)
    setEditContent("")
  }

  const addTagToChat = (chatId: string, tag: string) => {
    const updatedHistory = chatHistory.map((chat) => {
      if (chat.id === chatId) {
        const tags = chat.tags || []
        return {
          ...chat,
          tags: tags.includes(tag) ? tags : [...tags, tag],
        }
      }
      return chat
    })
    setChatHistory(updatedHistory)
    localStorage.setItem("nebula-chat-history", JSON.stringify(updatedHistory))
  }

  const clearAllChats = () => {
    setChatHistory([])
    setCurrentChat(null)
    localStorage.removeItem("nebula-chat-history")
  }

  const exportChat = (chat: ChatHistory) => {
    const content = `# ${chat.title}\n\nCreated: ${chat.createdAt.toLocaleString()}\nModel: ${aiModels[chat.model as keyof typeof aiModels]?.name || "Unknown"}\nMessages: ${chat.messages.length}\n\n---\n\n${chat.messages
      .map((msg) => {
        const time = msg.timestamp.toLocaleString()
        const role = msg.role === "user" ? "You" : "Nebula"
        const reactions = msg.reactions?.length ? ` [${msg.reactions.join("")}]` : ""
        const bookmarked = msg.bookmarked ? " ⭐" : ""
        const edited = msg.edited ? " (edited)" : ""
        return `**${role}** (${time})${reactions}${bookmarked}${edited}\n${msg.content}`
      })
      .join("\n\n---\n\n")}`

    const blob = new Blob([content], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${chat.title.replace(/[^a-z0-9]/gi, "_")}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content)
    playNotificationSound()
  }

  const shareChat = (chat: ChatHistory) => {
    const shareData = {
      title: `Chat: ${chat.title}`,
      text: `Check out this AI conversation about ${chat.title}`,
      url: window.location.href,
    }

    if (navigator.share) {
      navigator.share(shareData)
    } else {
      navigator.clipboard.writeText(`${shareData.title}\n${shareData.text}\n${shareData.url}`)
    }
  }

  const regenerateResponse = async (messageId: string) => {
    if (!currentChat) return

    const messageIndex = currentChat.messages.findIndex((msg) => msg.id === messageId)
    if (messageIndex === -1 || messageIndex === 0) return

    const userMessage = currentChat.messages[messageIndex - 1]
    if (userMessage.role !== "user") return

    const updatedMessages = currentChat.messages.slice(0, messageIndex)
    const updatedChat = { ...currentChat, messages: updatedMessages }
    setCurrentChat(updatedChat)
    setLoading(true)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage.content }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: data.error ? `Error: ${data.error}` : data.response,
        timestamp: new Date(),
      }

      updatedChat.messages.push(assistantMessage)
      setCurrentChat({ ...updatedChat })
      saveChat(updatedChat)
      playNotificationSound()
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: Date.now().toString(),
        role: "assistant",
        content: "Error: Failed to regenerate response",
        timestamp: new Date(),
      }
      updatedChat.messages.push(errorMessage)
      setCurrentChat({ ...updatedChat })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent, promptText?: string) => {
    e.preventDefault()
    const messageText = promptText || input
    if (!messageText.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: messageText,
      timestamp: new Date(),
    }

    let chat = currentChat
    if (!chat) {
      chat = {
        id: Date.now().toString(),
        title: messageText.slice(0, 50) + (messageText.length > 50 ? "..." : ""),
        messages: [],
        createdAt: new Date(),
        folder: selectedFolder || "general",
        model: selectedModel,
      }
      setCurrentChat(chat)
    }

    chat.messages.push(userMessage)
    setCurrentChat({ ...chat })
    setInput("")
    setLoading(true)
    setShowQuickPrompts(false)

    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: messageText }),
      })

      const data = await response.json()

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: data.error ? `Error: ${data.error}` : data.response,
        timestamp: new Date(),
      }

      chat.messages.push(assistantMessage)
      setCurrentChat({ ...chat })
      saveChat(chat)
      playNotificationSound()
    } catch (error) {
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "Error: Failed to get response",
        timestamp: new Date(),
      }
      chat.messages.push(errorMessage)
      setCurrentChat({ ...chat })
    } finally {
      setLoading(false)
    }
  }

  const filteredChats = chatHistory
    .filter((chat) => {
      if (filterBy === "pinned" && !chat.pinned) return false
      if (filterBy === "archived" && !chat.archived) return false
      if (filterBy === "bookmarked" && !chat.messages.some((msg) => msg.bookmarked)) return false
      if (selectedFolder && chat.folder !== selectedFolder) return false
      return (
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.messages.some((msg) => msg.content.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.title.localeCompare(b.title)
        case "messages":
          return b.messages.length - a.messages.length
        default:
          return b.createdAt.getTime() - a.createdAt.getTime()
      }
    })

  const theme = themes[currentTheme]
  const wordCount = input
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length
  const charCount = input.length

  return (
    <SidebarProvider>
      <div className={`flex h-screen w-full bg-white ${isFullscreen ? "fixed inset-0 z-50" : ""}`}>
        {/* Sidebar */}
        <Sidebar collapsible="offcanvas" className="border-r border-gray-200">
          <SidebarHeader className="p-3 sm:p-4 border-b border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className={`p-1.5 sm:p-2 rounded-lg ${theme.primary} flex-shrink-0`}>
                <Sparkles className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">Nebula AI</h1>
                <p className="text-xs text-gray-500">Powered by {aiModels[selectedModel].name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Button
                onClick={() => createNewChat()}
                className={`w-full ${theme.primary} text-white rounded-lg h-9 sm:h-10 text-sm`}
              >
                <Plus className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Chat</span>
                <span className="sm:hidden">New</span>
              </Button>

              {/* Quick Actions */}
              <div className="flex gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowQuickPrompts(!showQuickPrompts)}
                  className="flex-1 h-8"
                >
                  <Zap className="h-3 w-3 mr-1" />
                  Quick
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsFullscreen(!isFullscreen)} className="h-8">
                  {isFullscreen ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
              </div>
            </div>

            {/* Search */}
            <div className="relative mt-3">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                id="search-input"
                placeholder="Search chats..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-9 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex gap-1 mt-2">
              <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <Filter className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pinned">Pinned</SelectItem>
                  <SelectItem value="bookmarked">Bookmarked</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="h-7 text-xs flex-1">
                  <SortAsc className="h-3 w-3 mr-1" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="messages">Messages</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </SidebarHeader>

          <SidebarContent className="p-2 sm:p-4">
            {/* Folders */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <Folder className="h-3 w-3" />
                  Folders
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowNewFolder(!showNewFolder)}
                  className="h-5 w-5 p-0"
                >
                  <FolderPlus className="h-3 w-3" />
                </Button>
              </SidebarGroupLabel>
              <SidebarGroupContent>
                {showNewFolder && (
                  <div className="flex gap-1 mb-2">
                    <Input
                      placeholder="Folder name"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="h-7 text-xs"
                      onKeyDown={(e) => e.key === "Enter" && createNewFolder()}
                    />
                    <Button variant="outline" size="sm" onClick={createNewFolder} className="h-7 px-2 bg-transparent">
                      <Save className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                <div className="space-y-1">
                  {folders.map((folder) => (
                    <Button
                      key={folder.id}
                      variant={selectedFolder === folder.id ? "secondary" : "ghost"}
                      size="sm"
                      onClick={() => setSelectedFolder(selectedFolder === folder.id ? null : folder.id)}
                      className="w-full justify-between h-7 text-xs"
                    >
                      <span className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${folder.color}`} />
                        {folder.name}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        {folder.chatCount}
                      </Badge>
                    </Button>
                  ))}
                </div>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Chats */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-medium text-gray-500 mb-2 px-2 flex items-center justify-between">
                Recent Chats ({filteredChats.length})
                {chatHistory.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearAllChats}
                    className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                )}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {filteredChats.map((chat) => (
                    <SidebarMenuItem key={chat.id}>
                      <SidebarMenuButton
                        onClick={() => setCurrentChat(chat)}
                        className={`w-full justify-between group rounded-lg p-2 sm:p-3 ${
                          currentChat?.id === chat.id ? "bg-gray-100" : "hover:bg-gray-50"
                        } ${settings.compactMode ? "p-1" : ""}`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <div className="flex items-center gap-1">
                            {chat.pinned && <Pin className="h-3 w-3 text-orange-500" />}
                            {chat.archived && <Archive className="h-3 w-3 text-gray-400" />}
                            <MessageSquare className="h-4 w-4 text-gray-400 flex-shrink-0" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <span className="truncate text-xs sm:text-sm block">{chat.title}</span>
                            <div className="flex items-center gap-2 text-xs text-gray-400">
                              <span>{chat.messages.length} messages</span>
                              {chat.tags && chat.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {chat.tags.slice(0, 2).map((tag) => (
                                    <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>
                              )}
                            </div>
                            {settings.messagePreview && chat.messages.length > 0 && (
                              <p className="text-xs text-gray-400 truncate mt-1">
                                {chat.messages[chat.messages.length - 1].content.slice(0, 50)}...
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleChatPin(chat.id)
                            }}
                          >
                            {chat.pinned ? <PinOff className="h-3 w-3" /> : <Pin className="h-3 w-3" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              shareChat(chat)
                            }}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              exportChat(chat)
                            }}
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 flex-shrink-0"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteChat(chat.id)
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="p-3 sm:p-4 border-t border-gray-200">
            <div className="space-y-2 sm:space-y-3">
              {/* AI Model Selector */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  <Bot className="h-3 w-3 inline mr-1" />
                  AI Model
                </label>
                <Select value={selectedModel} onValueChange={(value: keyof typeof aiModels) => setSelectedModel(value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(aiModels).map(([key, model]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        <div>
                          <div>{model.name}</div>
                          <div className="text-xs text-gray-400">{model.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selector */}
              <div>
                <label className="text-xs font-medium text-gray-500 mb-1 block">
                  <Palette className="h-3 w-3 inline mr-1" />
                  Theme
                </label>
                <Select value={currentTheme} onValueChange={(value: keyof typeof themes) => setCurrentTheme(value)}>
                  <SelectTrigger className="h-8 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(themes).map(([key, theme]) => (
                      <SelectItem key={key} value={key} className="text-xs">
                        {theme.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Settings Toggle */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
                className="w-full justify-start h-8 text-xs bg-transparent"
              >
                <Settings className="h-3 w-3 mr-2" />
                Settings
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1 flex flex-col min-w-0 w-full">
          {/* Header */}
          <header className="flex items-center gap-2 border-b border-gray-200 p-3 sm:p-4 bg-white flex-shrink-0">
            <SidebarTrigger className="lg:hidden" />
            <div className="flex-1 text-center min-w-0">
              <h2 className="text-sm sm:text-lg font-semibold text-gray-900 truncate">
                {currentChat?.title || "Nebula AI"}
              </h2>
              {currentChat && (
                <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                  <span>{currentChat.messages.length} messages</span>
                  <span>•</span>
                  <span>Created {currentChat.createdAt.toLocaleDateString()}</span>
                  {currentChat.folder && (
                    <>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Folder className="h-3 w-3" />
                        {folders.find((f) => f.id === currentChat.folder)?.name}
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {currentChat && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowTagInput(!showTagInput)}
                    className="flex-shrink-0"
                  >
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleChatPin(currentChat.id)}
                    className="flex-shrink-0"
                  >
                    {currentChat.pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => exportChat(currentChat)} className="flex-shrink-0">
                    <Download className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </header>

          {/* Tag Input */}
          {showTagInput && currentChat && (
            <div className="border-b border-gray-200 p-3 bg-gray-50">
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && tagInput.trim()) {
                      addTagToChat(currentChat.id, tagInput.trim())
                      setTagInput("")
                    }
                  }}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    if (tagInput.trim()) {
                      addTagToChat(currentChat.id, tagInput.trim())
                      setTagInput("")
                    }
                  }}
                  className="h-8"
                >
                  Add
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setShowTagInput(false)} className="h-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {currentChat.tags && currentChat.tags.length > 0 && (
                <div className="flex gap-1 mt-2">
                  {currentChat.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quick Prompts */}
          {showQuickPrompts && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900 flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Quick Prompts
                </h3>
                <Button variant="ghost" size="sm" onClick={() => setShowQuickPrompts(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {quickPrompts.map((prompt) => (
                  <Button
                    key={prompt.title}
                    variant="outline"
                    size="sm"
                    onClick={(e) => handleSubmit(e, prompt.prompt)}
                    className="h-auto p-2 text-left justify-start"
                  >
                    <div>
                      <div className="font-medium text-xs">{prompt.title}</div>
                      <div className="text-xs text-gray-500 truncate">{prompt.prompt.slice(0, 30)}...</div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Settings Panel */}
          {showSettings && (
            <div className="border-b border-gray-200 p-4 bg-gray-50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-medium text-gray-900">Settings</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)} className="h-6 w-6 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Auto-scroll</label>
                    <Button
                      variant={settings.autoScroll ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, autoScroll: !settings.autoScroll })}
                      className="h-7"
                    >
                      {settings.autoScroll ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Sound effects</label>
                    <Button
                      variant={settings.soundEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, soundEnabled: !settings.soundEnabled })}
                      className="h-7"
                    >
                      {settings.soundEnabled ? <Volume2 className="h-3 w-3" /> : <VolumeX className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Voice input</label>
                    <Button
                      variant={settings.voiceEnabled ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, voiceEnabled: !settings.voiceEnabled })}
                      className="h-7"
                    >
                      {settings.voiceEnabled ? <Mic className="h-3 w-3" /> : <MicOff className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Message preview</label>
                    <Button
                      variant={settings.messagePreview ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, messagePreview: !settings.messagePreview })}
                      className="h-7"
                    >
                      {settings.messagePreview ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm text-gray-700">Compact mode</label>
                    <Button
                      variant={settings.compactMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSettings({ ...settings, compactMode: !settings.compactMode })}
                      className="h-7"
                    >
                      {settings.compactMode ? "On" : "Off"}
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-gray-700">Font size: {settings.fontSize}px</label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => setSettings({ ...settings, fontSize: value })}
                      min={12}
                      max={20}
                      step={1}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div
            ref={chatContainerRef}
            className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-3 sm:space-y-4 min-h-0"
            style={{ fontSize: `${settings.fontSize}px` }}
          >
            {!currentChat || currentChat.messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center px-4">
                <div className={`p-3 sm:p-4 rounded-full ${theme.primary} mb-4`}>
                  <Sparkles className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">Hello, I'm Nebula</h3>
                <p className="text-sm sm:text-base text-gray-600 max-w-md mb-4">
                  Your intelligent AI assistant powered by advanced language models. Ask me anything, and I'll help you
                  with code, writing, analysis, and more.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {quickPrompts.slice(0, 3).map((prompt) => (
                    <Button
                      key={prompt.title}
                      variant="outline"
                      size="sm"
                      onClick={(e) => handleSubmit(e, prompt.prompt)}
                      className="text-xs"
                    >
                      {prompt.title}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              currentChat.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-2 sm:gap-3 group ${message.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.role === "assistant" && (
                    <div className={`p-1.5 sm:p-2 rounded-lg ${theme.primary} self-start flex-shrink-0`}>
                      <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                    </div>
                  )}

                  <div className="flex flex-col max-w-[85%] sm:max-w-[70%]">
                    <div
                      className={`rounded-lg p-3 sm:p-4 ${
                        message.role === "user"
                          ? `${theme.primary} text-white`
                          : isCodeOutput(message.content)
                            ? "bg-gray-900 border border-gray-700"
                            : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      {editingMessage === message.id ? (
                        <div className="space-y-2">
                          <Textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="min-h-[60px] text-sm"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => editMessage(message.id, editContent)}
                              className="h-7 text-xs"
                            >
                              <Save className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingMessage(null)
                                setEditContent("")
                              }}
                              className="h-7 text-xs"
                            >
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <pre
                          className={`whitespace-pre-wrap ${
                            isCodeOutput(message.content) && message.role === "assistant"
                              ? "text-green-400 font-mono"
                              : message.role === "user"
                                ? "text-white font-sans"
                                : "text-gray-900 font-sans"
                          }`}
                        >
                          {isCodeOutput(message.content) && message.role === "assistant" && (
                            <span className="text-gray-500">$ </span>
                          )}
                          {message.content}
                          {message.edited && <span className="text-xs opacity-70 ml-2">(edited)</span>}
                        </pre>
                      )}
                    </div>

                    {/* Reactions */}
                    {message.reactions && message.reactions.length > 0 && (
                      <div className="flex gap-1 mt-1">
                        {message.reactions.map((reaction, index) => (
                          <span key={index} className="text-sm">
                            {reaction}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Message Actions */}
                    <div className="flex items-center gap-2 mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      {settings.showTimestamps && (
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {message.timestamp.toLocaleTimeString()}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyMessage(message.content)}
                        className="h-6 w-6 p-0"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleBookmark(message.id)}
                        className="h-6 w-6 p-0"
                      >
                        {message.bookmarked ? (
                          <BookmarkCheck className="h-3 w-3 text-yellow-500" />
                        ) : (
                          <Bookmark className="h-3 w-3" />
                        )}
                      </Button>
                      {message.role === "user" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditingMessage(message.id)
                            setEditContent(message.content)
                          }}
                          className="h-6 w-6 p-0"
                        >
                          <Edit3 className="h-3 w-3" />
                        </Button>
                      )}
                      {message.role === "assistant" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => regenerateResponse(message.id)}
                          className="h-6 w-6 p-0"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      {/* Reaction Picker */}
                      <div className="flex gap-1">
                        {reactions.slice(0, 3).map((reaction) => (
                          <Button
                            key={reaction}
                            variant="ghost"
                            size="sm"
                            onClick={() => addReaction(message.id, reaction)}
                            className="h-6 w-6 p-0 text-xs"
                          >
                            {reaction}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {message.role === "user" && (
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-gray-600 flex items-center justify-center self-start flex-shrink-0">
                      <span className="text-white text-xs sm:text-sm font-medium">U</span>
                    </div>
                  )}
                </div>
              ))
            )}

            {loading && (
              <div className="flex gap-2 sm:gap-3 justify-start">
                <div className={`p-1.5 sm:p-2 rounded-lg ${theme.primary} flex-shrink-0`}>
                  <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                    <span className="text-gray-500 text-xs sm:text-sm">Nebula is thinking...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 sm:p-4 bg-white flex-shrink-0">
            <form onSubmit={handleSubmit} className="flex gap-2 sm:gap-3 w-full max-w-full">
              <div className="flex-1 min-w-0">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Message Nebula..."
                  rows={1}
                  className="resize-none min-h-[40px] sm:min-h-[44px] max-h-32 border-gray-300 focus:border-gray-400 text-sm sm:text-base w-full"
                  style={{ fontSize: `${settings.fontSize}px` }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmit(e)
                    }
                    if (e.key === "/" && e.ctrlKey) {
                      e.preventDefault()
                      setShowQuickPrompts(!showQuickPrompts)
                    }
                  }}
                />
                <div className="flex justify-between items-center text-xs text-gray-400 mt-1">
                  <div className="flex items-center gap-2">
                    {input && (
                      <>
                        <span>{charCount} chars</span>
                        <span>•</span>
                        <span>{wordCount} words</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+N</kbd>
                    <span>New</span>
                    <kbd className="px-1 py-0.5 bg-gray-100 rounded text-xs">Ctrl+/</kbd>
                    <span>Quick</span>
                  </div>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {settings.voiceEnabled && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={isRecording ? stopVoiceRecording : startVoiceRecording}
                    className={`min-w-[44px] h-[40px] sm:h-[44px] ${isRecording ? "bg-red-100 border-red-300" : ""}`}
                  >
                    {isRecording ? <MicOff className="h-4 w-4 text-red-600" /> : <Mic className="h-4 w-4" />}
                  </Button>
                )}
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className={`${theme.primary} text-white px-3 sm:px-4 py-2 rounded-lg transition-all duration-200 flex-shrink-0 min-w-[44px] h-[40px] sm:h-[44px]`}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
