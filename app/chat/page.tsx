'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Mic, Send, ArrowUp, Sparkles, Database } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', text: '안녕하세요. MoodB 상담 인테이크 센터입니다. 지금 마음이 어떠신지, 최근에 어떤 일이 있었는지 편하게 들려주세요.', sender: 'bot' }
  ])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isIndexing, setIsIndexing] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    const checkRole = async () => {
      const supabase = (await import('@/utils/supabase/client')).createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUserRole(user?.user_metadata?.role || 'general')
    }
    checkRole()
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
        alert(`인덱싱 실패: ${data.error || '알 수 없는 오류'}`)
      } else {
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
      <Navbar />

      <main className="flex-1 flex flex-col max-w-[800px] mx-auto w-full px-6 pb-20 mt-12">
        <header className="mb-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
          <div className="max-w-2xl px-2">
            <span className="text-[10px] font-bold text-[#566e63] tracking-[0.2em] mb-3 block">정서 상담 인테이크 센터</span>
            <h1 className="text-responsive-h1">
              마음의 이야기를 <br className="sm:hidden" /> 들려주세요<span className="italic font-serif text-[#566e63] ml-1">.</span>
            </h1>
          </div>
          {userRole === 'general' && (
            <Link href="/questionnaire" className="bg-white border border-gray-200 text-gray-400 px-6 py-3 rounded-full text-xs font-bold hover:bg-gray-50 transition-all shadow-sm">
              상담 건너뛰고 진단하기
            </Link>
          )}
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
              <div className={`p-4 md:p-6 rounded-[24px] md:rounded-[30px] text-sm md:text-[1.1rem] leading-relaxed max-w-[85%] sm:max-w-[500px] shadow-sm font-medium
                ${msg.sender === 'user' ? 'bg-[#efefef] text-black rounded-tr-none' : 'bg-[#fdebda] text-black rounded-tl-none'}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          {messages.length >= 4 && (
             <div className="mt-10 p-8 bg-[#f5ebd9]/30 border border-[#f5ebd9] rounded-[40px] text-center animate-in fade-in zoom-in-95 duration-700">
               <p className="text-sm font-bold text-[#bfa588] mb-6">충분히 말씀해 주셨군요. 이제 당신의 마음 상태를 객관적인 수치로 측정해 볼까요?</p>
               <Link href="/questionnaire" className="bg-[#bfa588] text-white px-10 py-4 rounded-full font-bold shadow-xl shadow-[#bfa588]/30 hover:bg-[#a68a6d] transition-all inline-flex items-center gap-2">
                 마음의 데시벨 측정하기 <ArrowUp size={18} className="rotate-90" />
               </Link>
             </div>
          )}
        </div>

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

        <div className="relative">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-[#566e63]/5 -z-10
                ${isTyping ? 'animate-pulse scale-150 duration-[2000ms]' : ''}`}></div>

          <div className="relative flex items-center bg-[#f0f0f0] rounded-full p-2 pl-8 shadow-2xl shadow-black/5 ring-1 ring-black/5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="마음속 이야기를 적어주세요..."
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
            <p className="text-[10px] font-bold text-gray-300 tracking-[0.2em] mb-2 uppercase">종단 간 암호화 및 개인정보 보호</p>
            <div className="text-[11px] text-[#566e63]/20 font-bold italic tracking-wider">원에 맞춰 호흡을 조절해보세요</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
