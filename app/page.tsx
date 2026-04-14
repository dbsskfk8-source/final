import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import HeroCanvas from './components/HeroCanvas'
import Footer from './components/Footer'
import NatureCanvas from './components/NatureCanvas'

export default async function HomePage() {
  // Supabase integration: Fetch dynamic content for cards
  const supabase = await createClient()
  const { data: contents }: { data: any[] | null } = await supabase
    .from('app_content')
    .select('*')
    .order('created_at', { ascending: true })

  // 현재 로그인 유저 및 역할 확인
  const { data: { user } } = await supabase.auth.getUser()
  const isDoctor = user?.user_metadata?.role === 'doctor'

  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333]">

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-6 md:px-10 lg:px-20 grid md:grid-cols-2 gap-12 md:gap-20 items-center mb-24 md:mb-32">
          <div className="max-w-xl">
            <h1 className="text-responsive-h1 mb-8">
              내 마음을 읽는 <span className="text-[#566e63] italic font-serif">공간.</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-10 leading-relaxed">
              당신을 가장 잘 이해하는 <span className="font-bold text-[#566e63]">MoodB</span>입니다. 객관적인 정서 진단부터 맞춤형 인지행동치료(CBT)와 명상까지, 온전한 나를 만나는 여정을 시작해 보세요.
            </p>
            
            {/* Chatbot Entry Widget */}
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-4 md:p-6 shadow-[0_8px_30px_rgb(0,0,0,0.06)] mb-10 border border-white hover:shadow-[0_20px_50px_rgb(86,110,99,0.15)] hover:-translate-y-2 transition-all duration-500 group">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-[#566e63] flex items-center justify-center text-white">
                  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                </div>
                <span className="font-bold text-[#222] text-base">오늘은 어떤 마음이신가요?</span>
              </div>
              <form action="/chat" className="flex items-center bg-gray-50 rounded-full px-4 py-2 ring-1 ring-gray-100 placeholder-hide">
                 <input type="text" placeholder="고민을 편하게 남겨주세요." className="flex-1 bg-transparent border-none outline-none text-base py-2 px-2" />
                 <button type="submit" className="bg-[#566e63] w-12 h-12 flex items-center justify-center rounded-full text-white shadow-lg hover:scale-110 hover:shadow-[#566e63]/40 hover:bg-[#4a5c53] active:scale-95 transition-all outline-none"><svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 10l7-7m0 0l7 7m-7-7v18"></path></svg></button>
              </form>
            </div>

            <div className="flex flex-wrap gap-6">
              <Link href="/chat" className="bg-[#566e63] text-white px-10 py-4 rounded-full text-base md:text-lg font-bold shadow-xl shadow-[#566e63]/30 hover:shadow-2xl hover:shadow-[#566e63]/50 hover:bg-[#4a5c53] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 ring-2 ring-transparent hover:ring-white/50">
                ✨ 치유 여정 시작하기
              </Link>
            </div>
          </div>
          
          <div className="relative aspect-square md:aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl group border-[8px] border-white/80 hover:border-white transition-all duration-700 hover:shadow-[0_30px_60px_rgb(86,110,99,0.3)] hover:-translate-y-4">
             {/* Generated UX Design Agent Image */}
            <div className="absolute inset-0 bg-[#fdfbf7]"></div>
            <div className="absolute inset-0 bg-[url('/homepage_hero.png')] bg-cover bg-center mix-blend-multiply group-hover:scale-110 transition-transform duration-[1.5s] ease-out z-0"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#566e63]/30 to-transparent mix-blend-overlay group-hover:opacity-80 transition-opacity duration-1000 z-10"></div>
            
            {/* Interactive Particle Trails */}
            <HeroCanvas />
          </div>
        </section>

        {/* Features / Content Section "Space to Breathe" */}
        <section className="px-6 md:px-10 lg:px-20">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 md:mb-16 gap-6">
            <div>
              <h2 className="text-responsive-h2 mb-4">숨 고르기 전용 공간</h2>
              <p className="text-gray-600 font-medium text-sm md:text-base">정서적 해소와 개인적 회복을 위해 큐레이션된 여정을 탐색해 보세요.</p>
            </div>
            <div className="flex gap-4">
              <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
              </button>
              <button className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-all text-gray-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"/></svg>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Left Column: Dashboard / Meditation Records */}
            <div className="md:col-span-2 bg-[#e8efe9] rounded-[40px] p-12 relative flex flex-col justify-between min-h-[550px] group overflow-hidden shadow-lg hover:shadow-[0_20px_60px_rgb(86,110,99,0.2)] hover:-translate-y-2 transition-all duration-500 border-2 border-white/50">
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:opacity-20 transition-opacity">
                   <svg width="240" height="240" fill="currentColor" viewBox="0 0 24 24" className="text-[#566e63]"><path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/></svg>
                </div>
                
                <div className="relative z-10">
                   <span className="bg-white/50 text-[#566e63] px-5 py-2 rounded-full text-xs font-black tracking-widest uppercase mb-6 inline-block shadow-sm">Dashboard</span>
                   <h3 className="text-4xl md:text-5xl font-black mb-6 text-[#1a231f] leading-tight">오늘의 명상 및 <br/>이전 기록</h3>
                   
                   {/* Mock Dashboard UI */}
                   <div className="flex gap-4 mb-8">
                      <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl flex-1 border border-white/20">
                         <p className="text-[10px] font-bold text-[#566e63]/60 uppercase mb-1">최근 명상 시간</p>
                         <p className="text-2xl font-black text-[#566e63]">42min</p>
                      </div>
                      <div className="bg-white/40 backdrop-blur-sm p-4 rounded-2xl flex-1 border border-white/20">
                         <p className="text-[10px] font-bold text-[#566e63]/60 uppercase mb-1">스트레스 지수</p>
                         <p className="text-2xl font-black text-[#566e63]">Low</p>
                      </div>
                   </div>
                </div>

                <div className="relative z-10">
                  <p className="text-[#566e63]/80 font-bold mb-8 max-w-md text-lg leading-relaxed">지난 여정의 기록을 살피고, 오늘의 안정을 위한 명상으로 하루를 마무리하세요.</p>
                  <Link href="/my-situation" className="flex items-center gap-3 font-extrabold text-[#566e63] text-lg hover:text-[#4a5c53] transition-all group-hover:gap-5">
                    기록 확인하기 <span className="bg-white rounded-full p-2 shadow-sm group-hover:shadow-md transition-shadow"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>
                  </Link>
                </div>
            </div>

            {/* Right Column: Recommended & Measurement */}
            <div className="flex flex-col gap-8">
              {/* Top Right: Recommended Meditation */}
              <div className="bg-[#fcfaf5] rounded-[40px] p-10 flex-1 group hover:bg-white hover:shadow-2xl hover:shadow-[#bfa588]/10 transition-all duration-500 hover:-translate-y-1 border border-[#f5ebd9] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-[#bfa588]/10 group-hover:scale-125 transition-transform duration-700">
                   <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>
                </div>
                <div>
                  <span className="text-[#bfa588] font-black text-[10px] tracking-widest uppercase mb-4 block">가이드 케어</span>
                  <h4 className="text-2xl font-black mb-3 text-[#1a231f] group-hover:text-[#bfa588] transition-colors">추천 명상</h4>
                  <p className="text-gray-500 text-base font-bold leading-relaxed">당신의 현재 상태에 꼭 필요한 맞춤형 명상을 제안합니다.</p>
                </div>
                <Link href="/select" className="mt-6 text-[#bfa588] font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">전체보기 →</Link>
              </div>

              {/* Bottom Right: Emotion Measurement */}
              <div className="bg-[#eef5f5] rounded-[40px] p-10 flex-1 group hover:bg-white hover:shadow-2xl hover:shadow-[#4db4b6]/10 transition-all duration-500 hover:-translate-y-1 border border-[#e0eded] flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 text-[#4db4b6]/10 group-hover:scale-125 transition-transform duration-700">
                   <svg width="80" height="80" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                </div>
                <div>
                  <span className="text-[#4db4b6] font-black text-[10px] tracking-widest uppercase mb-4 block">강점 dB 측정/추정</span>
                  <h4 className="text-2xl font-black mb-3 text-[#1a231f] group-hover:text-[#4db4b6] transition-colors">7가지 감정 측정해보기</h4>
                  <p className="text-gray-500 text-base font-bold leading-relaxed">객관적인 설문을 통해 당신의 숨겨진 감정의 파동을 확인하세요.</p>
                </div>
                <Link href="/select" className="mt-6 text-[#4db4b6] font-black text-sm flex items-center gap-2 group-hover:gap-3 transition-all">측정 시작 →</Link>
              </div>
            </div>
          </div>
        </section>

        {/* Introduction Section: What is MoodB? */}
        <section className="mt-32 max-w-6xl mx-auto px-6 grid md:grid-cols-2 gap-20 items-center">
           <div className="order-2 md:order-1">
              <div className="relative aspect-square bg-[#f5ebd9] rounded-[60px] overflow-hidden shadow-inner">
                 <div className="absolute inset-0 flex items-center justify-center">
                    <img src="/moodb-logo.svg" alt="MoodB Logo" className="w-2/3 opacity-20 grayscale" />
                 </div>
                 <div className="absolute inset-10 border-2 border-[#bfa588]/20 rounded-[40px] flex items-center justify-center p-12 text-center">
                    <p className="text-[#bfa588] font-serif italic text-2xl leading-relaxed">"감정은 흐르는 물과 같아서, 가두지 않고 마주할 때 비로소 평온해집니다."</p>
                 </div>
              </div>
           </div>
           <div className="order-1 md:order-2">
              <h2 className="text-4xl md:text-5xl font-black text-[#222] mb-8 leading-tight">보이지 않는 마음을 <br/><span className="text-[#566e63]">지표로 마주하다</span></h2>
              <p className="text-responsive-p mb-10">MoodB는 단순한 심리 검사를 넘어, 당신의 목소리와 응답에서 추출된 데이터로 감정의 주파수를 맞춰갑니다. 오늘 당신이 느낀 'dB'는 어떤 의미를 담고 있을까요?</p>
              <ul className="space-y-6">
                 {[
                    { t: '정밀한 7가지 감정 척도', d: '동양의 지혜와 서양의 심리학을 결합한 독자적 알고리즘' },
                    { t: '맞춤형 인지재구성(CBT)', d: '왜곡된 생각의 고리를 끊어내는 데이터 기반 솔루션' },
                    { t: '안식처를 닮은 사운드테라피', d: '측정 결과에 따라 실시간 큐레이션되는 치유 명상' }
                 ].map((item, i) => (
                    <li key={i} className="flex gap-4">
                       <div className="w-6 h-6 rounded-full bg-[#566e63] flex-shrink-0 mt-1 flex items-center justify-center text-white text-[10px] font-black">{i+1}</div>
                       <div>
                          <p className="font-black text-[#222] mb-1">{item.t}</p>
                          <p className="text-sm text-gray-500 font-medium">{item.d}</p>
                       </div>
                    </li>
                 ))}
              </ul>
           </div>
        </section>

        {/* Step Indicators Section */}
        <section className="mt-24 md:mt-32 border-t border-gray-100 pt-16 px-6 flex flex-col items-center">
            <div className="flex gap-4 mb-8">
              <span className="w-10 h-10 rounded-full bg-[#566e63] text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xl shadow-[#566e63]/20">1</span>
              <span className="w-10 h-10 rounded-full bg-white text-gray-300 flex items-center justify-center font-bold text-xs">2</span>
              <span className="w-10 h-10 rounded-full bg-white text-gray-300 flex items-center justify-center font-bold text-xs">3</span>
            </div>
            <p className="text-[#566e63] font-black text-sm tracking-widest uppercase">당신의 여정은 현재 1단계에 있습니다</p>
        </section>
        
        {/* Nature Interactive Section */}
        <NatureCanvas />
      </main>

      <Footer />
    </div>
  )
}
