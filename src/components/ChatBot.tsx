'use client'

import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Loader2 } from 'lucide-react'

export default function AskAI() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat()

  const formatMessage = (content: string) => {
    // Check if the message contains numbered points
    if (content.includes('1.')) {
      const points = content.split(/\d+\.\s/).filter(Boolean)
      return (
        <div className="space-y-2">
          {points.map((point, index) => (
            <div key={index} className="flex gap-2">
              <span className="font-bold">{index + 1}.</span>
              <div dangerouslySetInnerHTML={{ 
                __html: point.replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>') 
              }} />
            </div>
          ))}
        </div>
      )
    }
    // Handle bullet points
    if (content.includes('•')) {
      const points = content.split('•').filter(Boolean)
      return (
        <div className="space-y-2">
          {points.map((point, index) => (
            <div key={index} className="flex gap-2">
              <span>•</span>
              <span>{point.trim()}</span>
            </div>
          ))}
        </div>
      )
    }
    return content
  }

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Ask AI about Your Budget</h2>
      <div className="space-y-4">
        {messages.map(m => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-md p-4 rounded-lg ${
              m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100'
            }`}>
              {typeof m.content === 'string' ? formatMessage(m.content) : m.content}
            </div>
          </div>
        ))}
      </div>
      <form onSubmit={handleSubmit} className="mt-4 flex space-x-2">
        <Input
          value={input}
          onChange={handleInputChange}
          placeholder="Ask a question about your budget..."
          className="flex-grow"
        />
        <Button type="submit" disabled={isLoading}>
          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Send'}
        </Button>
      </form>
    </div>
  )
}