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
    { id: '1', text: '안녕하세요. 지금 기분이 어떠신가요? 서두르지 않고 천천히 말씀하셔도 좋습니다.', sender: 'bot' },
    { id: '2', text: '최근에 모든 일의 속도에 조금 압도당하는 기분이에요. 그저 조금의 평온함을 찾고 싶어요.', sender: 'user' },
    { id: '3', text: '충분히 이해합니다. 때로는 세상이 너무 시끄럽게 느껴질 수 있죠. 우리 함께 심호흡을 해볼까요. 준비가 되시면 오늘 하루 당신에게 평온함을 준 작은 일 한 가지를 말해주세요.', sender: 'bot' }
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
        text: data.response || '죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다.',
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
        // 에러가 났을 경우 구체적인 사유 표시
        alert(`인덱싱 실패: ${data.error || '알 수 없는 오류'}`)
      } else {
        // 성공 시 데이터 개수와 함께 표시
        alert(data.message)
      }
    } catch (error) {
      alert('서버와 통신하는 중 오류가 발생했습니다.')
    } finally {
      setIsIndexing(false)
    }
  }


  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans">
      {/* Navbar */}
      <nav className="px-10 py-8 flex justify-between items-center bg-transparent max-w-[1200px] mx-auto w-full">
        <div className="font-extrabold text-xl text-[#4a5c53]">파이널 서비스</div>
        <div className="flex gap-10 font-medium text-sm text-gray-500">
          <Link href="/select">치유 여정(Cure)</Link>
          <Link href="/my-situation">내 상태 분석</Link>
          <Link href="#" className="text-black border-b-2 border-black pb-1">상담 챗봇</Link>
        </div>
        <div className="flex gap-6 items-center">
          <button
            onClick={handleIndexData}
            disabled={isIndexing}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-[#566e63] border border-gray-100 px-4 py-2 rounded-full transition-all disabled:opacity-50"
          >
            <Database size={14} className={isIndexing ? 'animate-spin' : ''} />
            {isIndexing ? '데이터 분석 중...' : '맞춤형 데이터 분석'}
          </button>
          <Link href="/login" className="text-sm font-medium text-gray-400">로그인</Link>
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20">회원가입</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col max-w-[800px] mx-auto w-full px-6 pb-20 mt-12">
        <header className="mb-20 flex justify-between items-start">
          <div>
            <span className="text-[10px] font-bold text-[#566e63] tracking-[0.2em] mb-3 block">안전한 상담 공간</span>
            <h1 className="text-5xl font-extrabold leading-tight text-[#222]">
              나를 돌아보는 고요한 시간<span className="italic font-serif text-[#566e63] ml-1">.</span>
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
          {['아침에 커피 마시기', '공원 짧게 산책하기', '책 몇 페이지 읽기'].map(text => (
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
              placeholder="마음속 이야기를 적어주세요..."
              className="flex-1 bg-transparent border-none outline-none text-lg py-4 placeholder:text-gray-400 font-medium"
            />
            <div className="flex gap-2">
              <button className="p-4 text-gray-400 hover:text-gray-600 transition-all"><Mic size={24} /></button>
              <button
                onClick={handleSend}
                className="bg-[#566e63] w-14 h-14 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-[#4a5c53] transition-all"
              >
                <ArrowUp size={30} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] mb-2 uppercase">종단 간 암호화 및 개인정보 보호</p>
            <div className="text-[11px] text-[#566e63]/20 font-bold italic tracking-wider">원에 맞춰 호흡을 조절해보세요</div>
          </div>
        </div>
      </main>

      <footer className="px-10 py-12 flex flex-col items-center gap-12 border-t border-gray-50 mt-20">
        <div className="font-extrabold text-lg text-[#4a5c53]">파이널 서비스</div>
        <div className="flex gap-16 text-xs font-bold text-gray-300 uppercase tracking-widest">
          <Link href="#" className="hover:text-black transition-colors">소개</Link>
          <Link href="#" className="hover:text-black transition-colors">개인정보처리방침</Link>
          <Link href="#" className="hover:text-black transition-colors">문의하기</Link>
          <Link href="#" className="hover:text-black transition-colors">이용약관</Link>
        </div>
        <div className="text-[10px] text-gray-300 font-bold">© 2024 파이널 서비스. 마음의 안식처.</div>
      </footer>
    </div>
  )
}
