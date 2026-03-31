import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/utils/supabase/server'

export default async function HomePage() {
  // Supabase integration: Fetch dynamic content for cards
  const supabase = await createClient()
  const { data: contents } = await supabase
    .from('app_content')
    .select('*')
    .order('created_at', { ascending: true })

  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333]">
      {/* Header and Nav */}
      <header className="fixed top-0 w-full z-50 px-10 py-6 flex justify-between items-center backdrop-blur-md bg-white/30">
        <div className="font-extrabold text-xl tracking-tight text-[#4a5c53]">?Œì´???œë¹„??/div>
        <nav className="sm:flex hidden gap-12 font-medium text-sm text-gray-500">
          <Link href="/select" className="hover:text-black">?¸ì??¬êµ¬??Cure)</Link>
          <Link href="/my-situation" className="hover:text-black">???íƒœ ë¶„ì„</Link>
          <Link href="/chat" className="hover:text-black">?ë‹´ ì±—ë´‡</Link>
        </nav>
        <div className="flex items-center gap-6">
          <Link href="/login" className="text-sm font-medium text-gray-600">ë¡œê·¸??/Link>
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">?Œì›ê°€??/Link>
        </div>
      </header>

      <main className="pt-32 pb-20">
        {/* Hero Section */}
        <section className="px-10 lg:px-20 grid md:grid-cols-2 gap-20 items-center mb-32">
          <div className="max-w-xl">
            <h1 className="text-[3.5rem] md:text-[5rem] font-extrabold leading-[1.05] tracking-tight mb-8">
              ë¹„ìš°??<span className="text-[#566e63] italic font-serif">?ˆìˆ .</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-500 font-medium mb-12 leading-relaxed">
              ?•ì„œ???„í™˜???„í•œ ?ˆì‹ì²˜ì…?ˆë‹¤. ?¹ì‹ ??ì§Šì–´????ë¬´ê²Œë¥??´ë ¤?“ê³ , ?ì„ ?‰í™”ë¡œìš´ ?œì‘?¼ë¡œ ë°”ê? ???ˆëŠ” ?„êµ¬?€ ê³µê°„???œê³µ?©ë‹ˆ??
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/chat" className="bg-[#566e63] text-white px-10 py-4 rounded-full text-lg font-bold shadow-xl shadow-[#566e63]/30 hover:transform hover:-translate-y-1 transition-all">
                ?¬ì • ?œì‘?˜ê¸°
              </Link>
              <button className="bg-gray-100/80 px-10 py-4 rounded-full text-lg font-bold flex items-center gap-3 hover:bg-gray-200 transition-all text-gray-700">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center p-2 shadow-sm text-[#566e63]">
                  <svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                </div>
                ?Œê°œ ?ìƒ ë³´ê¸°
              </button>
            </div>
          </div>
          
          <div className="relative aspect-square md:aspect-[4/5] rounded-[40px] overflow-hidden shadow-2xl group">
             {/* Using an abstract CSS-based representation of the grass field in home.png if img doesn't exist yet */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#f48c06]/80 via-[#fb8500]/40 to-[#023047]/10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511216335778-7cb8f49fa7a3?auto=format&fit=crop&q=80&w=1000')] bg-cover bg-center mix-blend-overlay group-hover:scale-110 transition-transform duration-700"></div>
            <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-white/20 to-transparent"></div>
          </div>
        </section>

        {/* Features / Content Section "Space to Breathe" */}
        <section className="px-10 lg:px-20">
          <div className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-extrabold mb-4">??ê³ ë¥´ê¸??„ìš© ê³µê°„</h2>
              <p className="text-gray-600 font-medium">?•ì„œ???´ì†Œ?€ ê°œì¸???Œë³µ???„í•´ ?ë ˆ?´ì…˜???¬ì •???ìƒ‰??ë³´ì„¸??</p>
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
              <div className="md:col-span-2 bg-[#e8efe9] rounded-[40px] p-12 relative flex flex-col justify-end min-h-[500px] group overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#6f8c67]/10 to-transparent"></div>
                {/* Abstract Water ripple representation */}
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                <div className="relative">
                  <span className="bg-white/40 text-[#566e63] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">?¬ë¦¬??ì¡´ì¬ê°?/span>
                  <h3 className="text-4xl font-extrabold mb-4">{contents.find(c => c.title === 'Deep Emotional Cleansing')?.title === 'Deep Emotional Cleansing' ? 'ê¹Šì? ?•ì„œ???•í™”' : contents.find(c => c.title === 'Deep Emotional Cleansing')?.title}</h3>
                  <p className="text-[#566e63]/70 font-medium mb-8 max-w-md">{contents.find(c => c.title === 'Deep Emotional Cleansing')?.description}</p>
                  <Link href="/chat" className="flex items-center gap-2 font-bold text-[#566e63] group-hover:gap-4 transition-all">
                    ?ë‹´ ?œì‘?˜ê¸° <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                  </Link>
                </div>
              </div>
            ) : (
                <div className="md:col-span-2 bg-[#e8efe9] rounded-[40px] p-12 relative flex flex-col justify-end min-h-[500px] group overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-[#6f8c67]/10 to-transparent"></div>
                  <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white rounded-full opacity-10 -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
                  <div className="relative">
                    <span className="bg-white/40 text-[#566e63] px-4 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase mb-6 inline-block">?¬ë¦¬??ì¡´ì¬ê°?/span>
                    <h3 className="text-4xl font-extrabold mb-4">ê¹Šì? ?•ì„œ???•í™”</h3>
                    <p className="text-[#566e63]/70 font-medium mb-8 max-w-md">?´ë©´???µëˆŒë¦?ê°ì •???´ì†Œ?˜ê³  ë§ˆìŒ???‰ì˜¨???˜ì°¾???„ë¬¸?ì¸ ?ë‹´ ê³¼ì •??ê²½í—˜??ë³´ì„¸??</p>
                    <Link href="/chat" className="flex items-center gap-2 font-bold text-[#566e63] group-hover:gap-4 transition-all">
                      ?ë‹´ ?œì‘?˜ê¸° <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
                    </Link>
                  </div>
                </div>
            )}

            {/* Smaller Cards for Guided Care and The Sanctuary */}
            <div className="flex flex-col gap-8">
              {contents && contents.filter(c => c.category === 'service').length > 0 ? contents.filter(c => c.category === 'service').map(service => (
                <div key={service.id} className="bg-gray-50/50 rounded-[40px] p-8 flex-1 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50">
                  <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-12">
                     <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d={service.title.includes('Care') ? "M12 2C8 2 4 5 4 10C4 16.5 12 22 12 22S20 16.5 20 10C20 5 16 2 12 2Z" : "M21 21H3V3h18v18zM12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"}/>
                     </svg>
                  </div>
                  <h4 className="text-xl font-extrabold mb-3">{service.title === 'Guided Care' ? 'ê°€?´ë“œ ì¼€?? : (service.title === 'The Sanctuary' ? '?ˆì‹ì²??œê³µ' : service.title)}</h4>
                  <p className="text-gray-600 text-sm font-medium line-clamp-3">{service.description}</p>
                </div>
              )) : (
                <>
                  <div className="bg-gray-50/50 rounded-[40px] p-8 flex-1 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-12">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C8 2 4 5 4 10C4 16.5 12 22 12 22S20 16.5 20 10C20 5 16 2 12 2Z"/>
                       </svg>
                    </div>
                    <h4 className="text-xl font-extrabold mb-3">ê°€?´ë“œ ì¼€??/h4>
                    <p className="text-gray-600 text-sm font-medium line-clamp-3">?„ë¬¸?ì¸ ?¸ì? ?¬êµ¬???„êµ¬ë¥??µí•´ ?ê°???•ë¦¬?˜ê³  ê¸ì •?ì¸ ë³€?”ë? ?´ëŒ?´ëƒ…?ˆë‹¤.</p>
                  </div>
                  <div className="bg-gray-50/50 rounded-[40px] p-8 flex-1 group hover:bg-white hover:shadow-xl transition-all border border-transparent hover:border-gray-50">
                    <div className="w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center text-[#566e63] mb-12">
                       <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M21 21H3V3h18v18zM12 6c-3.3 0-6 2.7-6 6s2.7 6 6 6 6-2.7 6-6-2.7-6-6-6z"/>
                       </svg>
                    </div>
                    <h4 className="text-xl font-extrabold mb-3">??ë§ˆìŒ???ˆì‹ì²?/h4>
                    <p className="text-gray-600 text-sm font-medium line-clamp-3">?¼ìƒ???ŒìŒ?ì„œ ë²—ì–´???¤ì§ ?ì‹ ?ê²Œ ì§‘ì¤‘?????ˆëŠ” ?•ì„œ???ˆì „ì§€?€ë¥??œê³µ?©ë‹ˆ??</p>
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
                <Link href="#" className="hover:text-black">?Œê°œ</Link>
                <Link href="#" className="hover:text-black">ê°œì¸?•ë³´ì²˜ë¦¬ë°©ì¹¨</Link>
                <Link href="#" className="hover:text-black">ë¬¸ì˜?˜ê¸°</Link>
                <Link href="#" className="hover:text-black">?´ìš©?½ê?</Link>
            </div>
        </section>
      </main>

      <footer className="px-10 py-10 border-t border-gray-50 flex justify-between items-center bg-[#fafafa]/50">
        <div>
          <div className="font-extrabold text-sm mb-1">?Œì´???œë¹„??/div>
          <div className="text-[10px] text-gray-600">Â© 2024 ?Œì´???œë¹„?? ë§ˆìŒ???ˆì‹ì²?</div>
        </div>
      </footer>
    </div>
  )
}
