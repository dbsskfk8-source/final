'use client'

import Link from 'next/link'
import { ArrowRight, BrainCircuit, Activity, Infinity, Scale, PersonStanding, FileQuestion, Sparkles } from 'lucide-react'

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333] font-sans selection:bg-[#566e63]/20">
      
      {/* Navbar */}
      <nav className="px-6 md:px-10 py-6 flex justify-between items-center bg-transparent max-w-[1400px] mx-auto w-full">
        <Link href="/" className="font-extrabold text-3xl tracking-tight text-[#4a5c53]">MoodB</Link>
        <div className="hidden md:flex gap-12 font-medium text-sm text-gray-500">
          <Link href="/select" className="text-black border-b-2 border-black pb-1">치유 여정(Cure)</Link>
          <Link href="/my-situation" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">마이페이지</Link>
          <Link href="/chat" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">상담 챗봇</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden md:block text-sm font-medium text-gray-600">로그인</Link>
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">회원가입</Link>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 pb-24 pt-16">
        
        {/* Header Title Section */}
        <div className="text-center mb-16 fade-in">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-[#222] break-keep">
            진단부터 치유까지, <br className="md:hidden" />
            나의 마음 관리를 <span className="font-black text-[#566e63] underline decoration-4 underline-offset-8 decoration-[#566e63]/30">시작해 보세요.</span>
          </h1>
          <p className="text-gray-500 font-medium md:text-lg max-w-2xl mx-auto leading-relaxed break-keep">
            감정의 크기 측정부터 나에게 가장 최적화된 명상과 인지재구성 솔루션까지, 이어지는 원스톱 치유 프로세스를 직접 경험합니다.
          </p>
        </div>

        {/* Assessment Banner Section (Moved Up) */}
        <div className="bg-[#f0ece5] rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative fade-in slide-in-bottom mb-10">
          <div className="md:w-[55%] relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">나의 MoodB 측정하기</h2>
            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed mb-10 max-w-md">
              모든 감정에는 크기가 있습니다. 2분 만에 끝나는 감정 주파수(데시벨) 정밀 진단을 통해 현재 나의 감정적 크기와 파동에 가장 알맞은 맞춤형 접근 방식을 추천받아 보세요.
            </p>
            <Link href="/questionnaire" className="bg-[#566e63] hover:bg-[#4a5c53] text-white px-8 py-4 rounded-full font-bold inline-flex items-center w-fit gap-3 transition-colors shadow-xl shadow-black/10">
              오늘의 마음 진단하기 <FileQuestion size={18} />
            </Link>
          </div>
          
          <div className="md:w-[45%] relative z-10 flex justify-center w-full mt-10 md:mt-0">
             <div className="w-full max-w-[350px] aspect-square rounded-[40px] flex items-center justify-center shadow-2xl relative overflow-hidden bg-[#faf8f5] group">
                <img src="/emotion_analysis.png" alt="Emotion Analysis Representation" className="absolute inset-0 w-full h-full object-cover mix-blend-multiply group-hover:scale-105 transition-transform duration-700" />
             </div>
          </div>
        </div>

        {/* Methods Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          {/* Card 1: Mindfulness (Large, span 2 columns) */}
          <Link href="/meditation/peace" className="md:col-span-2 bg-[#f2f1ef] hover:bg-[#e8e7e5] transition-colors rounded-[40px] p-10 md:p-12 relative flex flex-col justify-between group h-full min-h-[350px] fade-in slide-in-bottom">
            <div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6 shadow-sm">
                <Sparkles size={24} className="text-[#3b6b8b]" />
              </div>
              <h2 className="text-3xl md:text-4xl font-extrabold mb-4 text-[#222] tracking-tight">마음챙김 명상</h2>
              <p className="text-gray-600 md:text-lg font-medium leading-relaxed max-w-md mb-8">
                현재에 머무르고 판단하지 않는 알아차림을 기릅니다. 불안이나 스트레스가 심할 때 중심을 잡는 데 도움을 주어, 즉각적인 평온을 되찾아줍니다.
              </p>
            </div>
            
            <div className="flex items-center gap-2 font-bold text-[#3b6b8b] group-hover:gap-4 transition-all z-10 text-lg">
              명상 솔루션 시작하기 <ArrowRight size={20} />
            </div>

            {/* Abstract Graphic */}
            <div className="hidden sm:flex absolute right-0 bottom-0 top-0 w-1/3 min-w-[200px] items-center justify-end overflow-hidden rounded-r-[40px]">
               <div className="w-full h-full bg-gradient-to-l from-[#d0d3d8]/60 to-transparent relative flex items-end justify-center pb-0 group-hover:from-[#d0d3d8] transition-colors duration-700">
                 <div className="w-32 h-40 bg-white/20 rounded-t-full relative z-10 backdrop-blur-md border-t border-l border-r border-white/50 translate-y-4 group-hover:translate-y-0 transition-transform duration-700" />
                 <div className="absolute top-1/4 left-1/4 w-24 h-24 bg-white/50 blur-2xl rounded-full" />
                 <div className="absolute bottom-4 right-1/4 w-32 h-32 bg-white/60 blur-3xl rounded-full" />
               </div>
            </div>
          </Link>

          {/* Card 2: CBT (Normal, span 1 column) */}
          <Link href="/cure" className="md:col-span-1 bg-[#d7eadf] hover:bg-[#cde4d6] transition-colors rounded-[40px] p-8 md:p-10 flex flex-col justify-between group h-full min-h-[350px] fade-in slide-in-bottom delay-100">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-6 shadow-sm">
                <BrainCircuit size={20} className="text-[#4a5c53]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold mb-3 text-[#222] tracking-tight">CBT <span className="block text-xl font-bold mt-1 text-[#4a5c53]">(인지행동치료)</span></h2>
              <p className="text-[#4a5c53] text-base font-medium leading-relaxed mb-6 opacity-90">
                왜곡된 사고 패턴을 식별하고 감정적 반응을 능동적으로 변화시킵니다.
              </p>
            </div>
            <div className="text-base font-bold text-[#222] flex items-center justify-between group-hover:text-[#4a5c53] transition-colors mt-auto w-full border-t border-[#4a5c53]/20 pt-6">
              인지 재구성하기 <ArrowRight size={18} className="transform group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

        </div>


      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
        <div>
          <div className="font-extrabold text-base mb-1 text-[#4a5c53]">MoodB</div>
          <div className="text-xs text-gray-600">© 2024 MoodB. 마음의 안식처.</div>
        </div>
        <div className="flex gap-10 text-[10px] font-bold text-gray-600 uppercase tracking-widest">
          <Link href="#" className="hover:text-black transition-colors">소개</Link>
          <Link href="#" className="hover:text-black transition-colors">개인정보처리방침</Link>
          <Link href="#" className="hover:text-black transition-colors">문의하기</Link>
          <Link href="#" className="hover:text-black transition-colors">이용약관</Link>
        </div>
        {/* Social / Email icons */}
        <div className="flex items-center gap-3">
           <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><polyline points="16 6 12 2 8 6"/><line x1="12" y1="2" x2="12" y2="15"/></svg>
           </button>
           <button className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
           </button>
        </div>
      </footer>

      {/* Basic Global CSS for Fade-In Utilities directly embedded for simplicity if not in globals.css */}
      <style dangerouslySetInnerHTML={{__html: `
        .fade-in {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        .slide-in-bottom {
          animation: slideInBottom 0.8s ease-out forwards;
          opacity: 0;
        }
        .delay-100 { animation-delay: 100ms; }
        .delay-200 { animation-delay: 200ms; }
        .delay-300 { animation-delay: 300ms; }
        .delay-400 { animation-delay: 400ms; }
        .delay-500 { animation-delay: 500ms; }
        
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideInBottom {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}} />
    </div>
  )
}
