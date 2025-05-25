'use client'

import React from 'react'

interface MarkdownRendererProps {
  content: string
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderContent = (content: string) => {
    const lines = content.split('\n')
    const elements: React.ReactNode[] = []
    let currentList: { type: 'ul' | 'ol', items: string[] } | null = null
    let elementCounter = 0

    const getUniqueKey = (type: string) => {
      elementCounter++
      return `${type}-${elementCounter}`
    }

    const flushList = () => {
      if (currentList) {
        if (currentList.type === 'ul') {
          elements.push(
            <ul key={getUniqueKey('ul')} className="list-disc list-inside text-gray-700 leading-relaxed mb-6 ml-4 space-y-2">
              {currentList.items.map((item, idx) => (
                <li key={`ul-item-${elementCounter}-${idx}`} className="mb-2" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ul>
          )
        } else {
          elements.push(
            <ol key={getUniqueKey('ol')} className="list-decimal list-inside text-gray-700 leading-relaxed mb-6 ml-4 space-y-2">
              {currentList.items.map((item, idx) => (
                <li key={`ol-item-${elementCounter}-${idx}`} className="mb-2" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ol>
          )
        }
        currentList = null
      }
    }

    const processInlineFormatting = (text: string): string => {
      // Handle bold text
      text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      
      // Handle italic text
      text = text.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      
      // Handle inline code
      text = text.replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
      
      // Handle internal links with better styling
      const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g
      text = text.replace(linkRegex, (match, linkText, url) => {
        if (url.startsWith('/')) {
          return `<a href="${url}" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">${linkText}</a>`
        }
        return `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-600 hover:text-blue-800 underline font-medium transition-colors duration-200">${linkText}</a>`
      })
      
      return text
    }

    lines.forEach((line, index) => {
      const trimmedLine = line.trim()
      
      // Skip empty lines
      if (trimmedLine === '') {
        flushList()
        elements.push(<div key={getUniqueKey('empty')} className="h-4"></div>)
        return
      }

      // Handle headings
      if (trimmedLine.startsWith('# ')) {
        flushList()
        elements.push(
          <h1 key={getUniqueKey('h1')} className="text-4xl font-bold text-gray-900 mb-8 mt-12 first:mt-0 leading-tight">
            {trimmedLine.slice(2)}
          </h1>
        )
        return
      }
      
      if (trimmedLine.startsWith('## ')) {
        flushList()
        elements.push(
          <h2 key={getUniqueKey('h2')} className="text-3xl font-semibold text-gray-900 mb-6 mt-10 leading-tight">
            {trimmedLine.slice(3)}
          </h2>
        )
        return
      }
      
      if (trimmedLine.startsWith('### ')) {
        flushList()
        elements.push(
          <h3 key={getUniqueKey('h3')} className="text-2xl font-semibold text-gray-900 mb-4 mt-8 leading-tight">
            {trimmedLine.slice(4)}
          </h3>
        )
        return
      }
      
      if (trimmedLine.startsWith('#### ')) {
        flushList()
        elements.push(
          <h4 key={getUniqueKey('h4')} className="text-xl font-semibold text-gray-900 mb-3 mt-6 leading-tight">
            {trimmedLine.slice(5)}
          </h4>
        )
        return
      }

      // Handle blockquotes
      if (trimmedLine.startsWith('> ')) {
        flushList()
        elements.push(
          <blockquote key={getUniqueKey('blockquote')} className="border-l-4 border-blue-500 pl-6 py-4 mb-6 bg-blue-50 text-gray-700 italic rounded-r-lg">
            <span dangerouslySetInnerHTML={{ __html: processInlineFormatting(trimmedLine.slice(2)) }} />
          </blockquote>
        )
        return
      }

      // Handle unordered lists
      if (trimmedLine.startsWith('- ')) {
        if (!currentList || currentList.type !== 'ul') {
          flushList()
          currentList = { type: 'ul', items: [] }
        }
        currentList.items.push(processInlineFormatting(trimmedLine.slice(2)))
        return
      }

      // Handle numbered lists
      if (/^\d+\.\s/.test(trimmedLine)) {
        if (!currentList || currentList.type !== 'ol') {
          flushList()
          currentList = { type: 'ol', items: [] }
        }
        const content = trimmedLine.replace(/^\d+\.\s/, '')
        currentList.items.push(processInlineFormatting(content))
        return
      }

      // Handle regular paragraphs
      flushList()
      const processedParagraph = processInlineFormatting(trimmedLine)
      elements.push(
        <p 
          key={getUniqueKey('paragraph')} 
          className="text-gray-700 leading-relaxed mb-6 text-lg"
          dangerouslySetInnerHTML={{ __html: processedParagraph }}
        />
      )
    })

    // Flush any remaining list
    flushList()

    return elements
  }

  return (
    <div className="prose prose-lg max-w-none">
      {renderContent(content)}
    </div>
  )
} 