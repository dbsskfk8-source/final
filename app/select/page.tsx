'use client'

import Link from 'next/link'
import { ArrowRight, BrainCircuit, Activity, Infinity, Scale, PersonStanding, FileQuestion, Sparkles } from 'lucide-react'

export default function SelectPage() {
  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333] font-sans selection:bg-[#566e63]/20">
      
      {/* Navbar */}
      <nav className="px-6 md:px-10 py-6 flex justify-between items-center bg-transparent max-w-[1400px] mx-auto w-full">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-[#4a5c53]">Final Service</Link>
        <div className="hidden md:flex gap-12 font-medium text-sm text-gray-500">
          <Link href="/select" className="text-black border-b-2 border-black pb-1">Cure</Link>
          <Link href="/my-situation" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">My Situation</Link>
          <Link href="/chat" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">Chat</Link>
        </div>
        <div className="flex items-center gap-6">
          <Link href="/login" className="hidden md:block text-sm font-medium text-gray-600">Login</Link>
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">Signup</Link>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-6 pb-24 pt-16">
        
        {/* Header Title Section */}
        <div className="text-center mb-16 fade-in">
          <span className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mb-4 block">
            THE PATH TO CLARITY
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight text-[#222]">
            나에게 맞는 치유 방법을 <br className="hidden md:block" />
            <span className="italic font-serif text-[#566e63]">찾아보세요.</span>
          </h1>
          <p className="text-gray-500 font-medium md:text-lg max-w-2xl mx-auto leading-relaxed">
            치유는 목적지가 아니라 리듬 있는 여정입니다. 현재 내 감정 상태에 맞는 치료적 접근 방식을 둘러보고 선택하세요.
          </p>
        </div>

        {/* Methods Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
          
          {/* Card 1 (Large, span 2 columns): CBT */}
          <Link href="/cure" className="md:col-span-2 bg-[#d7eadf] hover:bg-[#cde4d6] transition-colors rounded-[40px] p-10 md:p-12 relative flex flex-col justify-between group h-full min-h-[350px] fade-in slide-in-bottom">
            <div>
              <div className="w-12 h-12 rounded-full bg-white/50 flex items-center justify-center mb-6">
                <BrainCircuit size={24} className="text-[#4a5c53]" />
              </div>
              <h2 className="text-3xl font-extrabold mb-4 text-[#222]">CBT (인지행동치료)</h2>
              <p className="text-[#4a5c53] font-medium leading-relaxed max-w-sm mb-8">
                도움이 되지 않는 사고 패턴을 식별하고 도전하여 감정적 반응을 변화시키는 인지 재구성 도구입니다.
              </p>
            </div>
            
            <div className="flex items-center gap-2 font-bold text-[#222] group-hover:gap-4 transition-all">
              인지 재구성 시작하기 <ArrowRight size={18} />
            </div>

            {/* Abstract Graphic */}
            <div className="hidden sm:block absolute top-8 right-8">
               <div className="w-24 h-24 bg-[#a3b8ad]/30 rounded-[30px] flex items-center justify-center rotate-12 group-hover:rotate-45 transition-transform duration-700">
                  <BrainCircuit size={48} className="text-[#a3b8ad]" />
               </div>
            </div>
          </Link>

          {/* Card 2: Mindfulness */}
          <div className="bg-[#f2f1ef] rounded-[40px] p-10 md:p-12 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 transition-all fade-in slide-in-bottom delay-100 cursor-not-allowed">
            <div>
              <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mb-6">
                <Sparkles size={20} className="text-[#3b6b8b]" />
              </div>
              <h2 className="text-2xl font-extrabold mb-3 text-[#222]">마음챙김 명상</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                현재에 머무르고 판단하지 않는 알아차림을 기릅니다. 불안이나 스트레스가 심할 때 중심을 잡는 데 도움을 줍니다.
              </p>
            </div>
            
            {/* Minimal Placeholder graphic */}
            <div className="mt-8 h-24 w-full bg-[#d0d3d8] rounded-2xl relative overflow-hidden flex items-end justify-center">
              <div className="w-16 h-20 bg-[#222] rounded-t-full relative z-10" />
              <div className="absolute top-4 left-4 w-12 h-12 bg-white/20 blur-xl rounded-full" />
              <div className="absolute top-4 right-4 w-12 h-12 bg-white/20 blur-xl rounded-full" />
            </div>
          </div>

          {/* Card 3: ACT */}
          <div className="bg-[#fcecdb] rounded-[40px] p-10 md:p-12 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 transition-all fade-in slide-in-bottom delay-200 cursor-not-allowed">
            <div>
              <div className="mb-6 text-[#bd8f67]">
                <Infinity size={32} strokeWidth={1.5} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3 text-[#222]">ACT (수용전념치료)</h2>
              <p className="text-[#bd8f67] text-sm font-medium leading-relaxed mb-8">
                통제할 수 없는 것을 부드럽게 받아들이고 내 삶을 풍요롭게 하는 행동과 가치에 전념하는 법을 배웁니다.
              </p>
            </div>
            <div className="self-end w-10 h-10 rounded-full bg-[#bd8f67] text-white flex items-center justify-center opacity-80 group-hover:opacity-100 transition-opacity">
              <span className="text-xl leading-none font-light">+</span>
            </div>
          </div>

          {/* Card 4: DBT */}
          <div className="bg-white rounded-[40px] p-10 md:p-12 border border-gray-100 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 transition-all fade-in slide-in-bottom delay-300 cursor-not-allowed">
            <div>
              <div className="mb-6 text-[#4a5c53]">
                <Scale size={28} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3 text-[#222]">DBT (변증법적 행동)</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-6">
                감정 조절, 고통 감내, 그리고 대인 관계 효율성 기술을 집중적으로 훈련하여 정서적 균형을 찾습니다.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex -space-x-2">
                <div className="w-6 h-6 rounded-full bg-[#badce3]" />
                <div className="w-6 h-6 rounded-full bg-[#d7eadf]" />
                <div className="w-6 h-6 rounded-full bg-[#fcecdb]" />
              </div>
              <span className="text-[10px] font-bold text-gray-400 tracking-wider">EXPERT GUIDED</span>
            </div>
          </div>

          {/* Card 5: Somatic */}
          <div className="bg-[#fafaf7] rounded-[40px] p-10 md:p-12 flex flex-col justify-between group hover:shadow-lg hover:-translate-y-1 transition-all fade-in slide-in-bottom delay-400 cursor-not-allowed">
            <div>
              <div className="mb-6 text-[#3b6b8b]">
                <PersonStanding size={28} />
              </div>
              <h2 className="text-2xl font-extrabold mb-3 text-[#222]">Somatic (신체 중심)</h2>
              <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
                신체 감각을 추적하여 갇힌 물리적 긴장을 풀고 신경계에 저장된 트라우마를 부드럽게 치유합니다.
              </p>
            </div>
            <div className="text-sm font-medium italic text-gray-400">
              "몸은 기억한다."
            </div>
          </div>

        </div>

        {/* Assessment Banner Section */}
        <div className="bg-[#f0ece5] rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative fade-in slide-in-bottom delay-500">
          <div className="md:w-[55%] relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">어디서부터 시작해야 할지 모르겠나요?</h2>
            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed mb-10 max-w-md">
              모든 여정은 특별합니다. 2분 만에 끝나는 "상황 진단"을 통해 현재 나의 감정적 필요에 가장 알맞은 치료적 접근 방식을 추천받아 보세요.
            </p>
            <Link href="/questionnaire" className="bg-[#333] hover:bg-black text-white px-8 py-4 rounded-full font-bold inline-flex items-center w-fit gap-3 transition-colors shadow-xl shadow-black/10">
              진단 시작하기 <FileQuestion size={18} />
            </Link>
          </div>
          
          <div className="md:w-[45%] relative z-10 flex justify-center w-full mt-10 md:mt-0">
             {/* Abstract Teal Room Graphic Placeholder */}
             <div className="w-full max-w-[350px] aspect-square rounded-[40px] bg-gradient-to-br from-[#4db4b6] to-[#127a7c] flex items-center justify-center shadow-2xl relative overflow-hidden">
                {/* Inner screen frame mimicking the design */}
                <div className="w-[85%] h-[85%] border-4 border-white/30 rounded-2xl relative flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center">
                     <Sparkles size={16} className="text-white/80" />
                  </div>
                </div>
                {/* Small items at bottom */}
                <div className="absolute bottom-6 left-6 w-12 h-4 bg-white/20 rounded-sm" />
                <div className="absolute bottom-6 right-8 w-10 h-8 bg-white/30 rounded-t-md shrink-0" />
             </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
        <div>
          <div className="font-extrabold text-sm mb-1 text-[#4a5c53]">Final Service</div>
          <div className="text-[10px] text-gray-400">© 2024 Final Service. The Living Sanctuary.</div>
        </div>
        <div className="flex gap-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="#" className="hover:text-black transition-colors">About</Link>
          <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          <Link href="#" className="hover:text-black transition-colors">Terms</Link>
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
