'use client'

import { useState, useRef, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ChevronDown, ChevronRight, File, Folder, MessageSquare, Play, Plus, Trash, Moon, Sun } from 'lucide-react'
import { useTheme } from "next-themes"
import { ThemeProvider } from "next-themes"

type FileSystemItem = {
  id: string
  name: string
  type: 'file' | 'folder'
  children?: FileSystemItem[]
  isOpen?: boolean
}

export function AiSoftwareEngineer() {
  const [fileSystem, setFileSystem] = useState<FileSystemItem[]>([
    { id: '1', name: 'src', type: 'folder', isOpen: true, children: [
      { id: '2', name: 'index.js', type: 'file' },
      { id: '3', name: 'styles.css', type: 'file' },
    ]},
    { id: '4', name: 'package.json', type: 'file' },
    { id: '5', name: 'README.md', type: 'file' },
  ])
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [code, setCode] = useState<{[key: string]: string}>({
    'src/index.js': '// Write your code here',
    'src/styles.css': '/* Write your styles here */',
    'package.json': '{\n  "name": "my-project",\n  "version": "1.0.0"\n}',
    'README.md': '# My Project\n\nDescription goes here.',
  })
  const [terminal, setTerminal] = useState("")
  const [console, setConsole] = useState("")
  const [chatInput, setChatInput] = useState("")
  const [chatHistory, setChatHistory] = useState<{ role: string; content: string }[]>([])
  const [bottomBarHeight, setBottomBarHeight] = useState(200)
  const [isResizing, setIsResizing] = useState(false)
  const [newItemName, setNewItemName] = useState("")
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false)
  const resizeRef = useRef<HTMLDivElement>(null)
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing) {
        const newHeight = window.innerHeight - e.clientY
        setBottomBarHeight(Math.max(100, Math.min(newHeight, window.innerHeight - 200)))
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
    }

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing])

  const handleRunCode = () => {
    setConsole("Running code...\n" + (selectedFile ? code[selectedFile] : ''))
    setTerminal("$ node " + (selectedFile || 'script.js') + "\n> Code execution simulated")
  }

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (chatInput.trim()) {
      setChatHistory([...chatHistory, { role: 'user', content: chatInput }])
      // Simulate AI response
      setTimeout(() => {
        setChatHistory(prev => [...prev, { role: 'assistant', content: "I'm an AI assistant. How can I help you with your code?" }])
      }, 1000)
      setChatInput("")
    }
  }

  const handleFileClick = (item: FileSystemItem) => {
    if (item.type === 'file') {
      setSelectedFile(item.name)
    } else {
      toggleFolder(item.id)
    }
  }

  const toggleFolder = (id: string) => {
    setFileSystem(prevSystem => {
      const newSystem = JSON.parse(JSON.stringify(prevSystem))
      const toggleItem = (items: FileSystemItem[]) => {
        for (let item of items) {
          if (item.id === id) {
            item.isOpen = !item.isOpen
            return true
          }
          if (item.children && toggleItem(item.children)) {
            return true
          }
        }
        return false
      }
      toggleItem(newSystem)
      return newSystem
    })
  }

  const deleteItem = (id: string) => {
    setFileSystem(prevSystem => {
      const newSystem = JSON.parse(JSON.stringify(prevSystem))
      const deleteFromSystem = (items: FileSystemItem[]) => {
        for (let i = 0; i < items.length; i++) {
          if (items[i].id === id) {
            items.splice(i, 1)
            return true
          }
          if (items[i].children && deleteFromSystem(items[i].children)) {
            return true
          }
        }
        return false
      }
      deleteFromSystem(newSystem)
      return newSystem
    })
  }

  const addNewItem = () => {
    const newItem: FileSystemItem = {
      id: Date.now().toString(),
      name: newItemName,
      type: newItemType,
      children: newItemType === 'folder' ? [] : undefined
    }
    setFileSystem(prevSystem => [...prevSystem, newItem])
    setNewItemName("")
    setIsNewItemDialogOpen(false)
  }

  const renderFileSystem = (items: FileSystemItem[]) => {
    return items.map((item) => (
      <div key={item.id} className="ml-4">
        <div className="flex items-center group">
          {item.type === 'folder' && (
            <button onClick={() => toggleFolder(item.id)} className="mr-1">
              {item.isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          )}
          <button 
            className={`flex items-center flex-grow py-1 px-2 rounded-md ${selectedFile === item.name ? 'bg-accent text-accent-foreground' : 'hover:bg-accent hover:text-accent-foreground'}`}
            onClick={() => handleFileClick(item)}
          >
            {item.type === 'folder' ? <Folder className="h-4 w-4 mr-2" /> : <File className="h-4 w-4 mr-2" />}
            <span>{item.name}</span>
          </button>
          <button onClick={() => deleteItem(item.id)} className="opacity-0 group-hover:opacity-100 ml-2">
            <Trash className="h-4 w-4 text-destructive" />
          </button>
        </div>
        {item.type === 'folder' && item.isOpen && item.children && (
          <div className="ml-4">
            {renderFileSystem(item.children)}
          </div>
        )}
      </div>
    ))
  }

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
    <div className={`h-screen flex flex-col`}>
      <div className="flex-1 flex overflow-hidden">
        {/* File Manager */}
        <div className="w-64 bg-background border-r p-4 overflow-y-auto">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Files</h2>
            <Dialog open={isNewItemDialogOpen} onOpenChange={setIsNewItemDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon"><Plus className="h-4 w-4" /></Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Item</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Name
                    </Label>
                    <Input
                      id="name"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="type" className="text-right">
                      Type
                    </Label>
                    <select
                      id="type"
                      value={newItemType}
                      onChange={(e) => setNewItemType(e.target.value as 'file' | 'folder')}
                      className="col-span-3"
                    >
                      <option value="file">File</option>
                      <option value="folder">Folder</option>
                    </select>
                  </div>
                </div>
                <Button onClick={addNewItem}>Create</Button>
              </DialogContent>
            </Dialog>
          </div>
          {renderFileSystem(fileSystem)}
        </div>

        {/* IDE */}
        <div className="flex-1 p-4 bg-background overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">Editor</h2>
          {selectedFile ? (
            <Textarea
              value={code[selectedFile] || ''}
              onChange={(e) => setCode({...code, [selectedFile]: e.target.value})}
              className="w-full h-[calc(100%-2rem)] font-mono bg-background text-foreground"
              placeholder="Write your code here..."
            />
          ) : (
            <p>Select a file to edit</p>
          )}
        </div>

        {/* AI Chat Sidebar */}
        <div className="w-80 bg-background border-l p-4 flex flex-col">
          <h2 className="text-lg font-semibold mb-4">AI Chat</h2>
          <ScrollArea className="flex-1 pr-4">
            {chatHistory.map((msg, index) => (
              <div key={index} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                <span className={`inline-block p-2 rounded-lg ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                  {msg.content}
                </span>
              </div>
            ))}
          </ScrollArea>
          <form onSubmit={handleChatSubmit} className="mt-4 flex">
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask AI for help..."
              className="flex-1 mr-2"
            />
            <Button type="submit">Send</Button>
          </form>
        </div>
      </div>

      {/* Resizable Bottom Bar */}
      <div 
        className="bg-background border-t"
        style={{ height: `${bottomBarHeight}px` }}
      >
        <div 
          className="h-2 bg-accent cursor-row-resize"
          onMouseDown={() => setIsResizing(true)}
          ref={resizeRef}
        />
        <Tabs defaultValue="terminal" className="h-[calc(100%-0.5rem)]">
          <div className="flex justify-between items-center px-4 py-2">
            <TabsList>
              <TabsTrigger value="terminal">Terminal</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>
            <div className="flex items-center space-x-2">
              <Button onClick={handleRunCode} size="sm">
                <Play className="mr-2 h-4 w-4" /> Run Code
              </Button>
              <Switch
                checked={theme === "dark"}
                onCheckedChange={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="ml-4"
              />
              {theme === "dark" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            </div>
          </div>
          <TabsContent value="terminal" className="h-[calc(100%-3rem)] p-4">
            <ScrollArea className="h-full bg-black text-green-500 p-4 font-mono rounded">
              {terminal}
            </ScrollArea>
          </TabsContent>
          <TabsContent value="console" className="h-[calc(100%-3rem)] p-4">
            <ScrollArea className="h-full bg-black text-green-500 p-4 font-mono rounded">
              {console}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    </ThemeProvider>
  )
}