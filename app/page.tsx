import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'
import HeroCanvas from './components/HeroCanvas'

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
      {/* Header and Nav */}
      <header className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md bg-white/30">
        <Link href="/"><img src="/moodb-logo.svg" alt="MoodB" className="h-10 w-auto" /></Link>
        <nav className="sm:flex hidden gap-12 font-medium text-base text-gray-500">
          <Link href="/about" className="hover:text-black font-bold">MoodB 소개</Link>
          <Link href="/select" className="hover:text-black">인지재구성(Cure)</Link>
          <Link href="/my-situation" className="hover:text-black">마이페이지</Link>
          <Link href="/chat" className="hover:text-black">상담 챗봇</Link>
          {isDoctor && (
            <Link href="/dashboard" className="text-[#bfa588] hover:text-[#a68a6d] font-bold">관리자 뷰어</Link>
          )}
        </nav>
        <div className="flex items-center gap-6">
          {user ? (
            <>
              <span className="text-sm text-gray-500 font-medium">{user.email?.split('@')[0]}</span>
              <Link href="/my-situation" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-base font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">마이페이지</Link>
            </>
          ) : (
            <>
              <Link href="/login" className="text-base font-medium text-gray-600">로그인</Link>
              <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-base font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">회원가입</Link>
            </>
          )}
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-10 lg:px-20 grid md:grid-cols-2 gap-20 items-center mb-32">
          <div className="max-w-xl">
            <h1 className="text-[3.5rem] md:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-8">
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
              <Link href="/select" className="bg-[#566e63] text-white px-10 py-4 rounded-full text-base md:text-lg font-bold shadow-xl shadow-[#566e63]/30 hover:shadow-2xl hover:shadow-[#566e63]/50 hover:bg-[#4a5c53] hover:-translate-y-1.5 active:scale-95 transition-all duration-300 ring-2 ring-transparent hover:ring-white/50">
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
        <section className="px-10 lg:px-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">숨 고르기 전용 공간</h2>
              <p className="text-gray-600 font-medium">정서적 해소와 개인적 회복을 위해 큐레이션된 여정을 탐색해 보세요.</p>
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
            {/* Supabase Dynamic Card 1: Main Feature */}
            {contents && contents.find(c => c.title === 'Deep Emotional Cleansing') ? (
              <div className="md:col-span-2 bg-[#e8efe9] rounded-[40px] p-12 relative flex flex-col justify-end min-h-[500px] group overflow-hidden shadow-lg hover:shadow-[0_20px_60px_rgb(86,110,99,0.2)] hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-white">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#6f8c67]/10 to-transparent transform group-hover:scale-110 transition-transform duration-1000"></div>
                {/* Abstract Water ripple representation */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-[2s]"></div>
                <div className="relative z-10 transform group-hover:translate-x-2 transition-transform duration-500">
                  <span className="bg-white/50 text-[#566e63] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 inline-block shadow-sm">심리적 존재감</span>
                  <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1a231f]">{contents.find(c => c.title === 'Deep Emotional Cleansing')?.title === 'Deep Emotional Cleansing' ? '깊은 정서적 정화' : contents.find(c => c.title === 'Deep Emotional Cleansing')?.title}</h3>
                  <p className="text-[#566e63]/80 font-semibold mb-8 max-w-md text-lg leading-relaxed">{contents.find(c => c.title === 'Deep Emotional Cleansing')?.description}</p>
                  <Link href="/chat" className="flex items-center gap-3 font-extrabold text-[#566e63] text-lg hover:text-[#4a5c53] transition-all group-hover:gap-5">
                    상담 시작하기 <span className="bg-white rounded-full p-2 shadow-sm group-hover:shadow-md transition-shadow"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>
                  </Link>
                </div>
              </div>
            ) : (
                <div className="md:col-span-2 bg-[#e8efe9] rounded-[40px] p-12 relative flex flex-col justify-end min-h-[500px] group overflow-hidden shadow-lg hover:shadow-[0_20px_60px_rgb(86,110,99,0.2)] hover:-translate-y-2 transition-all duration-500 border-2 border-transparent hover:border-white">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#6f8c67]/10 to-transparent transform group-hover:scale-110 transition-transform duration-1000"></div>
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-150 transition-transform duration-[2s]"></div>
                  <div className="relative z-10 transform group-hover:translate-x-2 transition-transform duration-500">
                    <span className="bg-white/50 text-[#566e63] px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 inline-block shadow-sm">심리적 존재감</span>
                    <h3 className="text-4xl md:text-5xl font-extrabold mb-4 text-[#1a231f]">깊은 정서적 정화</h3>
                    <p className="text-[#566e63]/80 font-semibold mb-8 max-w-md text-lg leading-relaxed">내면의 억눌린 감정을 해소하고 마음의 평온을 되찾는 전문적인 상담 과정을 경험해 보세요.</p>
                    <Link href="/chat" className="flex items-center gap-3 font-extrabold text-[#566e63] text-lg hover:text-[#4a5c53] transition-all group-hover:gap-5">
                      상담 시작하기 <span className="bg-white rounded-full p-2 shadow-sm group-hover:shadow-md transition-shadow"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg></span>
                    </Link>
                  </div>
                </div>
            )}

            {/* Smaller Cards for Guided Care and The Sanctuary */}
            <div className="flex flex-col gap-8">
              {contents && contents.filter(c => c.category === 'service').length > 0 ? contents.filter(c => c.category === 'service').map(service => (
                <div key={service.id} className="bg-gray-50/50 rounded-[40px] p-8 flex-1 group hover:bg-white hover:shadow-2xl hover:shadow-[#566e63]/10 transition-all duration-500 hover:-translate-y-1 border border-transparent hover:border-gray-50 flex flex-col justify-center">
                  <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                     <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                        <path d={service.title.includes('Care') ? "M12 2C8 2 4 5 4 10C4 16.5 12 22 12 22S20 16.5 20 10C20 5 16 2 12 2Z" : "M21 21H3V3h18v18zM12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"}/>
                     </svg>
                  </div>
                  <h4 className="text-xl font-extrabold mb-3 text-[#1a231f] group-hover:text-[#566e63] transition-colors">{service.title === 'Guided Care' ? '가이드 케어' : (service.title === 'The Sanctuary' ? '안식처 제공' : service.title)}</h4>
                  <p className="text-gray-500 text-base font-medium line-clamp-3 leading-relaxed">{service.description}</p>
                </div>
              )) : (
                <>
                  <div className="bg-gray-50/50 rounded-[32px] p-8 flex-1 group hover:bg-white hover:shadow-xl hover:shadow-[#566e63]/5 transition-all duration-500 hover:-translate-y-1 border border-transparent hover:border-gray-50 flex flex-col justify-center">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                       <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8 2 4 5 4 10C4 16.5 12 22 12 22S20 16.5 20 10C20 5 16 2 12 2Z"/>
                       </svg>
                    </div>
                    <h4 className="text-xl font-extrabold mb-3 text-[#1a231f] group-hover:text-[#566e63] transition-colors">가이드 케어</h4>
                    <p className="text-gray-500 text-base font-medium line-clamp-3 leading-relaxed">전문적인 인지 재구성 도구를 통해 생각을 정리하고 긍정적인 변화를 이끌어냅니다.</p>
                  </div>
                  <div className="bg-gray-50/50 rounded-[32px] p-8 flex-1 group hover:bg-white hover:shadow-xl hover:shadow-[#566e63]/5 transition-all duration-500 hover:-translate-y-1 border border-transparent hover:border-gray-50 flex flex-col justify-center">
                    <div className="w-14 h-14 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-8 group-hover:scale-110 group-hover:shadow-md transition-all duration-500">
                       <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 21H3V3h18v18zM12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"/>
                       </svg>
                    </div>
                    <h4 className="text-xl font-extrabold mb-3 text-[#1a231f] group-hover:text-[#566e63] transition-colors">내 마음의 안식처</h4>
                    <p className="text-gray-500 text-base font-medium line-clamp-3 leading-relaxed">일상의 소음에서 벗어나 오직 자신에게 집중할 수 있는 정서적 안전지대를 제공합니다.</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>

        {/* Footer info from design */}
        <section className="mt-32 border-t border-gray-100 pt-16 px-10 flex flex-col items-center">
            <div className="flex gap-4 mb-8">
              <span className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center font-bold text-xs ring-4 ring-white shadow-xl">1</span>
              <span className="w-10 h-10 rounded-full bg-white text-gray-300 flex items-center justify-center font-bold text-xs">2</span>
              <span className="w-10 h-10 rounded-full bg-white text-gray-300 flex items-center justify-center font-bold text-xs">3</span>
            </div>
            <div className="flex gap-20 text-xs font-bold text-gray-600 uppercase tracking-widest">
                <Link href="#" className="hover:text-black">소개</Link>
                <Link href="#" className="hover:text-black">개인정보처리방침</Link>
                <Link href="#" className="hover:text-black">문의하기</Link>
                <Link href="#" className="hover:text-black">이용약관</Link>
            </div>
        </section>
      </main>

      <footer className="px-10 py-10 border-t border-gray-50 flex justify-between items-center bg-[#fafafa]/50">
        <div>
          <div className="font-extrabold text-sm mb-1">MoodB</div>
          <div className="text-xs text-gray-600">© 2024 MoodB. 마음의 안식처.</div>
        </div>
      </footer>
    </div>
  )
}
