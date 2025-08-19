"use client"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  List,
  ListOrdered,
  Link,
  Quote,
  Code,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react"

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  label?: string
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, label, placeholder, className }: RichTextEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showPreview, setShowPreview] = useState(false)

  const insertTag = (openTag: string, closeTag = "") => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)

    let newText
    if (selectedText) {
      // Wrap selected text
      newText = value.substring(0, start) + openTag + selectedText + closeTag + value.substring(end)
    } else {
      // Insert tags at cursor position
      newText = value.substring(0, start) + openTag + closeTag + value.substring(end)
    }

    onChange(newText)

    // Set cursor position after the opening tag
    setTimeout(() => {
      textarea.focus()
      const newCursorPos = selectedText
        ? start + openTag.length + selectedText.length + closeTag.length
        : start + openTag.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
    }, 0)
  }

  const formatButtons = [
    { icon: Type, label: "P", action: () => insertTag("<p>", "</p>") },
    { icon: Type, label: "H1", action: () => insertTag("<h1>", "</h1>") },
    { icon: Type, label: "H2", action: () => insertTag("<h2>", "</h2>") },
    { icon: Type, label: "H3", action: () => insertTag("<h3>", "</h3>") },
    { icon: Bold, label: "Bold", action: () => insertTag("<strong>", "</strong>") },
    { icon: Italic, label: "Italic", action: () => insertTag("<em>", "</em>") },
    { icon: Underline, label: "Underline", action: () => insertTag("<u>", "</u>") },
    { icon: Strikethrough, label: "Strike", action: () => insertTag("<s>", "</s>") },
    { icon: Code, label: "Code", action: () => insertTag("<code>", "</code>") },
    { icon: Quote, label: "Quote", action: () => insertTag("<blockquote>", "</blockquote>") },
    { icon: List, label: "UL", action: () => insertTag("<ul><li>", "</li></ul>") },
    { icon: ListOrdered, label: "OL", action: () => insertTag("<ol><li>", "</li></ol>") },
    { icon: Link, label: "Link", action: () => insertTag('<a href="">', "</a>") },
    { icon: AlignLeft, label: "Left", action: () => insertTag('<div style="text-align: left;">', "</div>") },
    { icon: AlignCenter, label: "Center", action: () => insertTag('<div style="text-align: center;">', "</div>") },
    { icon: AlignRight, label: "Right", action: () => insertTag('<div style="text-align: right;">', "</div>") },
  ]

  return (
    <div className={className}>
      {label && <Label className="text-slate-700 font-medium mb-2 block">{label}</Label>}

      {/* Toolbar */}
      <div className="border border-slate-200 rounded-t-xl bg-gradient-to-r from-slate-50 to-blue-50 p-2">
        <div className="flex flex-wrap gap-1">
          {formatButtons.map((button, index) => (
            <Button
              key={index}
              type="button"
              variant="ghost"
              size="sm"
              onClick={button.action}
              className="h-8 w-8 p-0 hover:bg-white/80 hover:shadow-sm rounded-lg transition-all duration-200"
              title={button.label}
            >
              <button.icon className="h-3.5 w-3.5 text-slate-600" />
            </Button>
          ))}
          <div className="ml-auto flex gap-1">
            <Button
              type="button"
              variant={showPreview ? "default" : "ghost"}
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
              className="text-xs px-3 h-8 rounded-lg transition-all duration-200"
            >
              {showPreview ? "Edit" : "Preview"}
            </Button>
          </div>
        </div>
      </div>

      {/* Editor/Preview */}
      {showPreview ? (
        <div
          className="min-h-[120px] p-4 border-x border-b border-slate-200 rounded-b-xl bg-white prose prose-sm max-w-none"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="min-h-[120px] border-x border-b border-slate-200 rounded-b-xl rounded-t-none border-t-0 focus:border-blue-500 focus:ring-blue-500/20 bg-white resize-none"
        />
      )}

      {/* Helper text */}
      <p className="text-xs text-slate-500 mt-1">
        Use the toolbar buttons to format your content with HTML tags. Click Preview to see how it will look.
      </p>
    </div>
  )
}
