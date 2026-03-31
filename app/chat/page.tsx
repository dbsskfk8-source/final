'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Mic, Send, ArrowUp, Sparkles, Database } from 'lucide-react'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '?ˆë…•?˜ì„¸?? ì§€ê¸?ê¸°ë¶„???´ë– ? ê??? ?œë‘ë¥´ì? ?Šê³  ì²œì²œ??ë§ì??˜ì…”??ì¢‹ìŠµ?ˆë‹¤.', sender: 'bot' },
    { id: '2', text: 'ìµœê·¼??ëª¨ë“  ?¼ì˜ ?ë„??ì¡°ê¸ˆ ?•ë„?¹í•˜??ê¸°ë¶„?´ì—?? ê·¸ì? ì¡°ê¸ˆ???‰ì˜¨?¨ì„ ì°¾ê³  ?¶ì–´??', sender: 'user' },
    { id: '3', text: 'ì¶©ë¶„???´í•´?©ë‹ˆ?? ?Œë¡œ???¸ìƒ???ˆë¬´ ?œë„?½ê²Œ ?ê»´ì§????ˆì£ . ?°ë¦¬ ?¨ê»˜ ?¬í˜¸?¡ì„ ?´ë³¼ê¹Œìš”. ì¤€ë¹„ê? ?˜ì‹œë©??¤ëŠ˜ ?˜ë£¨ ?¹ì‹ ?ê²Œ ?‰ì˜¨?¨ì„ ì¤€ ?‘ì? ????ê°€ì§€ë¥?ë§í•´ì£¼ì„¸??', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isIndexing, setIsIndexing] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return

    const userMessage: Message = { id: Date.now().toString(), text: input, sender: 'user' }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsTyping(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input })
      })
      const data = await res.json()

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'ì£„ì†¡?©ë‹ˆ?? ?µë????ì„±?˜ëŠ” ì¤‘ì— ë¬¸ì œê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.',
        sender: 'bot'
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Chat error:', error)
    } finally {
      setIsTyping(false)
    }
  }

  const handleIndexData = async () => {
    setIsIndexing(true)
    try {
      const res = await fetch('/api/index-data', { method: 'POST' })
      const data = await res.json()

      if (!data.success) {
        // ?ëŸ¬ê°€ ?¬ì„ ê²½ìš° êµ¬ì²´?ì¸ ?¬ìœ  ?œì‹œ
        alert(`?¸ë±???¤íŒ¨: ${data.error || '?????†ëŠ” ?¤ë¥˜'}`)
      } else {
        // ?±ê³µ ???°ì´??ê°œìˆ˜?€ ?¨ê»˜ ?œì‹œ
        alert(data.message)
      }
    } catch (error) {
      alert('?œë²„?€ ?µì‹ ?˜ëŠ” ì¤??¤ë¥˜ê°€ ë°œìƒ?ˆìŠµ?ˆë‹¤.')
    } finally {
      setIsIndexing(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="px-10 py-8 flex justify-between items-center bg-transparent max-w-[1200px] mx-auto w-full">
        <div className="font-extrabold text-xl text-[#4a5c53]">?Œì´???œë¹„??/div>
        <div className="flex gap-10 font-medium text-sm text-gray-500">
          <Link href="/select">ì¹˜ìœ  ?¬ì •(Cure)</Link>
          <Link href="/my-situation">???íƒœ ë¶„ì„</Link>
          <Link href="#" className="text-black border-b-2 border-black pb-1">?ë‹´ ì±—ë´‡</Link>
        </div>
        <div className="flex gap-6 items-center">
          <button
            onClick={handleIndexData}
            disabled={isIndexing}
            className="flex items-center gap-2 text-xs font-bold text-gray-600 hover:text-[#566e63] border border-gray-100 px-4 py-2 rounded-full transition-all disabled:opacity-50"
          >
            <Database size={14} className={isIndexing ? 'animate-spin' : ''} />
            {isIndexing ? '?°ì´??ë¶„ì„ ì¤?..' : 'ë§ì¶¤???°ì´??ë¶„ì„'}
          </button>
          <Link href="/login" className="text-sm font-medium text-gray-600">ë¡œê·¸??/Link>
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20">?Œì›ê°€??/Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col max-w-[800px] mx-auto w-full px-6 pb-20 mt-12">
        <header className="mb-20 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#566e63] tracking-[0.2em] mb-3 block">?ˆì „???ë‹´ ê³µê°„</span>
            <h1 className="text-5xl font-extrabold leading-tight text-[#222]">
              ?˜ë? ?Œì•„ë³´ëŠ” ê³ ìš”???œê°„<span className="italic font-serif text-[#566e63] ml-1">.</span>
            </h1>
          </div>
        </header>

        <div className="flex-1 flex flex-col gap-12 mb-10">
          {messages.map((msg, idx) => (
            <div
              key={msg.id}
              className={`flex items-start gap-4 transition-all duration-700 animate-in fade-in slide-in-from-bottom-5 ${msg.sender === 'user' ? 'flex-row-reverse self-end' : 'self-start'}`}
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className="w-4 h-4 mt-6 text-gray-300">
                {msg.sender === 'bot' ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"></path></svg>
                )}
              </div>
              <div className={`p-6 rounded-[30px] text-[1.1rem] leading-relaxed max-w-[500px] shadow-sm font-medium
                ${msg.sender === 'user' ? 'bg-[#efefef] text-black rounded-tr-none' : 'bg-[#fdebda] text-black rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="flex justify-center gap-4 mb-12 flex-wrap animate-in fade-in duration-1000 delay-700">
          {['?„ì¹¨??ì»¤í”¼ ë§ˆì‹œê¸?, 'ê³µì› ì§§ê²Œ ?°ì±…?˜ê¸°', 'ì±?ëª??˜ì´ì§€ ?½ê¸°'].map(text => (
            <button
              key={text}
              onClick={() => { setInput(text); }}
              className="bg-[#f3f3f3] px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-200 transition-all border border-transparent"
            >
              {text}
            </button>
          ))}
        </div>

        {/* Input Area */}
        <div className="relative">
          {/* Breathing Circle Effect - Enhanced pulse during typing or loading */}
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#566e63]/5 -z-10
                ${isTyping ? 'animate-pulse scale-150 duration-[2000ms]' : ''}`}></div>

          <div className="relative flex items-center bg-[#f0f0f0] rounded-full p-2 pl-8 shadow-2xl shadow-black/5 ring-1 ring-black/5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="ë§ˆìŒ???´ì•¼ê¸°ë? ?ì–´ì£¼ì„¸??.."
              className="flex-1 bg-transparent border-none outline-none text-lg py-4 placeholder:text-gray-600 font-medium"
            />
            <div className="flex gap-2">
              <button className="p-4 text-gray-600 hover:text-gray-600 transition-all"><Mic size={24} /></button>
              <button
                onClick={handleSend}
                className="bg-[#566e63] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#4a5c53] transition-all"
              >
                <ArrowUp size={30} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] mb-2 uppercase">ì¢…ë‹¨ ê°??”í˜¸??ë°?ê°œì¸?•ë³´ ë³´í˜¸</p>
            <div className="text-[11px] text-[#566e63]/20 font-bold italic tracking-wider">?ì— ë§ì¶° ?¸í¡??ì¡°ì ˆ?´ë³´?¸ìš”</div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-12 flex flex-col items-center gap-12 border-t border-gray-50 mt-20">
        <div className="font-extrabold text-lg text-[#4a5c53]">?Œì´???œë¹„??/div>
        <div className="flex gap-16 text-xs font-bold text-gray-300 uppercase tracking-widest">
          <Link href="#" className="hover:text-black transition-colors">?Œê°œ</Link>
          <Link href="#" className="hover:text-black transition-colors">ê°œì¸?•ë³´ì²˜ë¦¬ë°©ì¹¨</Link>
          <Link href="#" className="hover:text-black transition-colors">ë¬¸ì˜?˜ê¸°</Link>
          <Link href="#" className="hover:text-black transition-colors">?´ìš©?½ê?</Link>
        </div>
        <div className="text-[10px] text-gray-300 font-bold">Â© 2024 ?Œì´???œë¹„?? ë§ˆìŒ???ˆì‹ì²?</div>
      </footer>
    </div>
  )
}
