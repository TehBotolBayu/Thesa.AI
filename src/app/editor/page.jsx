'use client';
import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'

const LiveDemoEditor = dynamic(() => import('@/app/editor/components/DemoEditor'), { ssr: false })

export default function Page() {
  const [demoMarkdown, setDemoMarkdown] = useState('')

  useEffect(() => {
    // Fetch the markdown file from the public folder
    fetch('/live-demo-contents.md')
      .then(response => response.text())
      .then(text => setDemoMarkdown(text))
      .catch(error => {
        console.error('Error loading markdown file:', error)
        // Fallback content if file doesn't exist
        setDemoMarkdown(`# Welcome to MDXEditor Demo

This is a live demo of MDXEditor, an open-source React component for markdown editing.

## Features

- **Rich Text Editing**: Full markdown support with live preview
- **Toolbar**: Complete set of formatting tools
- **Code Blocks**: Syntax highlighting for multiple languages
- **Tables**: Easy table creation and editing
- **Links**: Simple link insertion and editing

## Getting Started

Start typing in the editor below to see MDXEditor in action!

---

*This is a demo of the MDXEditor component.*`)
      })
  }, [])

  if (!demoMarkdown) {
    return <div>Loading...</div>
  }

  return <LiveDemoEditor markdown={demoMarkdown} />
}
