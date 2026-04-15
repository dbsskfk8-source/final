'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Clock, Send, CheckCircle2 } from 'lucide-react'

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 5000)
  }

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans selection:bg-[#566e63]/20">
      {/* Header */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-[#e8e0d5] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#566e63] transition-all font-bold group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 홈으로 돌아가기
        </Link>
        <div className="text-xl font-black tracking-widest text-[#bfa588]">MoodB</div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-6xl mx-auto grid md:grid-cols-5 gap-12 items-start">
        {/* Left: Contact Info */}
        <div className="md:col-span-2 animate-in fade-in slide-in-from-left-4 duration-700">
          <h1 className="text-4xl md:text-6xl font-black text-[#222] mb-8 leading-tight">궁금한 점이 <br />있으신가요?</h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 break-keep">
            무드비팀은 여러분의 소중한 의견을 기다립니다. 서비스 이용 중 겪으신 불편함이나 제안하고 싶은 아이디어를 자유롭게 보내주세요.
          </p>

          <div className="space-y-8">
            <div className="flex gap-4 items-center group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#566e63] shadow-sm border border-[#e8efe9] group-hover:bg-[#566e63] group-hover:text-white transition-all">
                <Mail size={24} />
              </div>
              <div>
                <span className="block text-sm text-gray-400 font-black tracking-widest uppercase mb-1">Email Us</span>
                <span className="text-lg font-bold text-[#222]">support@moodb.kr</span>
              </div>
            </div>

            <div className="flex gap-4 items-center group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#bfa588] shadow-sm border border-[#e8efe9] group-hover:bg-[#bfa588] group-hover:text-white transition-all">
                <MessageCircle size={24} />
              </div>
              <div>
                <span className="block text-sm text-gray-400 font-black tracking-widest uppercase mb-1">Chat Support</span>
                <span className="text-lg font-bold text-[#222]">카카오톡 @무드비</span>
              </div>
            </div>

            <div className="flex gap-4 items-center group">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-[#4db4b6] shadow-sm border border-[#e8efe9] group-hover:bg-[#4db4b6] group-hover:text-white transition-all">
                <Clock size={24} />
              </div>
              <div>
                <span className="block text-sm text-gray-400 font-black tracking-widest uppercase mb-1">Response Time</span>
                <span className="text-lg font-bold text-[#222]">평일 기준 24시간 이내</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Contact Form */}
        <div className="md:col-span-3 bg-white p-8 md:p-12 rounded-[48px] border border-[#f5ebd9] shadow-xl shadow-[#566e63]/5 animate-in fade-in slide-in-from-right-4 duration-700">
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-[#566e63] mb-2 px-1">성함</label>
                  <input type="text" required placeholder="홍길동" className="w-full bg-[#fcfaf5] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#566e63] transition-all outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-black text-[#566e63] mb-2 px-1">이메일 주소</label>
                  <input type="email" required placeholder="example@email.com" className="w-full bg-[#fcfaf5] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#566e63] transition-all outline-none font-medium" />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-black text-[#566e63] mb-2 px-1">문의 제목</label>
                <input type="text" required placeholder="무엇을 도와드릴까요?" className="w-full bg-[#fcfaf5] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#566e63] transition-all outline-none font-medium" />
              </div>

              <div>
                <label className="block text-sm font-black text-[#566e63] mb-2 px-1">문의 내용</label>
                <textarea required rows={5} placeholder="상세한 내용을 입력해 주세요." className="w-full bg-[#fcfaf5] border-none rounded-2xl py-4 px-6 focus:ring-2 focus:ring-[#566e63] transition-all outline-none font-medium resize-none"></textarea>
              </div>

              <button type="submit" className="w-full bg-[#566e63] hover:bg-[#4a5c53] text-white py-5 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                <Send size={20} /> 문의 메시지 보내기
              </button>
            </form>
          ) : (
            <div className="py-20 text-center animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-[#f0f4f1] text-[#566e63] rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-3xl font-black text-[#222] mb-4">메시지가 잘 전달되었습니다!</h3>
              <p className="text-lg text-gray-500 font-medium break-keep">
                무드비팀이 내용을 확인한 후 <br /> 남겨주신 이메일로 빠르게 답변 드리겠습니다.
              </p>
              <button onClick={() => setSubmitted(false)} className="mt-10 text-[#566e63] font-bold underline underline-offset-4">새로운 문의 작성하기</button>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
