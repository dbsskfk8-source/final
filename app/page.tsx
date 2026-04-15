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

        {/* Introduction Section: What is MoodB? */}
        <section className="mt-20 max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 md:gap-24 items-center">
           <div className="order-2 md:order-1 relative group">
              <div className="relative aspect-square md:aspect-[4/5] rounded-[60px] overflow-hidden shadow-2xl border-[12px] border-white ring-1 ring-gray-100">
                 {/* Premium Gradient Background for Quotes */}
                 <div className="absolute inset-0 bg-gradient-to-br from-[#fdfbf7] via-[#fcfaf5] to-[#f5ebd9]"></div>
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1542273917363-3b1817f69a2d?q=80&w=2074&auto=format&fit=crop')] bg-cover bg-center mix-blend-soft-light opacity-40 group-hover:scale-110 transition-transform duration-[2s]"></div>
                 <div className="absolute inset-0 bg-black/5 group-hover:bg-transparent transition-colors duration-700"></div>
                 
                 <div className="absolute inset-8 md:inset-12 border border-[#bfa588]/30 rounded-[40px] flex flex-col items-center justify-center p-8 md:p-12 text-center backdrop-blur-[2px]">
                    <span className="text-[#bfa588] text-[10px] font-black tracking-[0.3em] uppercase mb-8 block opacity-60">MoodB Philosophy</span>
                    <p className="text-[#8c7457] font-serif italic text-2xl md:text-3xl leading-relaxed mb-8 drop-shadow-sm">
                      "감정은 흐르는 물과 같아서,<br/>가두지 않고 마주할 때<br/>비로소 평온해집니다."
                    </p>
                    <div className="w-12 h-[1px] bg-[#bfa588]/40 mb-8"></div>
                    <img src="/moodb-logo.svg" alt="MoodB Logo" className="w-24 opacity-30 grayscale" />
                 </div>
              </div>
              
              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#566e63]/10 rounded-full blur-3xl -z-10 animate-pulse"></div>
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#bfa588]/10 rounded-full blur-2xl -z-10"></div>
           </div>

           <div className="order-1 md:order-2">
              <span className="text-[#566e63] font-black text-xs tracking-[0.3em] uppercase mb-6 block">Our Approach</span>
              <h2 className="text-4xl md:text-6xl font-black text-[#222] mb-10 leading-[1.1] tracking-tighter">
                내 마음의 <br/>
                <span className="text-[#566e63] relative">
                  감정 지수 알아보기
                  <svg className="absolute -bottom-2 left-0 w-full" height="8" viewBox="0 0 100 8" preserveAspectRatio="none">
                    <path d="M0 7C30 7 70 7 100 2" stroke="#566e63" strokeWidth="4" fill="none" strokeLinecap="round" />
                  </svg>
                </span>
              </h2>
              <p className="text-xl md:text-2xl text-gray-500 font-medium mb-12 leading-relaxed break-keep">
                MoodB는 마음의 7가지 감정의 크기를 보여줍니다.<br/>
                오늘 당신의 마음을 들여다보세요.
              </p>

              <div className="space-y-10 mb-14">
                 {[
                    { t: '마음 진단', d: '7가지 감정 설문과 AI 분석으로 현재 나의 마음 상태를 정확히 확인합니다.' },
                    { t: '치유와 훈련', d: '개인별 지표에 꼭 필요한 맞춤 명상과 인지재구성 훈련으로 마음을 다스립니다.' },
                    { t: '평온한 회복', d: '정기적인 체크와 이력 관리를 통해 어제보다 더 성숙한 내일을 맞이합니다.' }
                 ].map((item, i) => (
                    <div key={i} className="flex gap-6 group">
                       <div className="w-10 h-10 rounded-2xl bg-[#f0f4f1] group-hover:bg-[#566e63] flex-shrink-0 flex items-center justify-center text-[#566e63] group-hover:text-white text-sm font-black transition-all duration-300 shadow-sm border border-[#e8efe9]">
                          0{i+1}
                       </div>
                       <div>
                          <p className="text-lg font-black text-[#222] mb-2 group-hover:text-[#566e63] transition-colors">{item.t}</p>
                          <p className="text-[15px] text-gray-500 font-medium leading-relaxed">{item.d}</p>
                       </div>
                    </div>
                 ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-5">
                <Link href="/questionnaire" className="bg-[#566e63] text-white px-10 py-5 rounded-full text-lg font-bold shadow-2xl shadow-[#566e63]/30 hover:shadow-[#566e63]/50 hover:bg-[#4a5c53] hover:-translate-y-1 active:scale-95 transition-all text-center">
                  ✨ 무료 감정 진단 시작하기
                </Link>
                <Link href="/about" className="bg-white text-gray-500 border border-gray-100 px-10 py-5 rounded-full text-lg font-bold hover:bg-gray-50 transition-all text-center">
                   MoodB 더 알아보기
                </Link>
              </div>
           </div>
        </section>
        <NatureCanvas />
      </main>

      <Footer />
    </div>
  )
}
