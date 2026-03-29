'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts'
import { Sparkles, Moon, Smile, Meh, Frown, Search, Filter, ArrowRight, AlertCircle, LogOut } from 'lucide-react'
import { useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface RadarItem {
  subject: string
  A: number
  fullMark: number
}

interface HistoryLog {
  id: number
  date: string
  type: string
  summary: string
  tags: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
}

// --- Mock Data (Fallback) ---
const DEFAULT_RADAR: RadarItem[] = [
  { subject: '기쁨(喜)', A: 84, fullMark: 100 },
  { subject: '분노(怒)', A: 75, fullMark: 100 },
  { subject: '근심(憂)', A: 41, fullMark: 100 },
  { subject: '생각(思)', A: 62, fullMark: 100 },
  { subject: '슬픔(悲)', A: 70, fullMark: 100 },
  { subject: '공포(恐)', A: 65, fullMark: 100 },
  { subject: '놀람(驚)', A: 80, fullMark: 100 },
]

const DEFAULT_HISTORY: HistoryLog[] = [
  {
    id: 1,
    date: 'OCT 24, 2024',
    type: 'Session: Understanding Workplace Triggers',
    summary:
      '최근 직장에서 느낀 감정을 분석했습니다. 데이터가 없을 경우 표시되는 예시 데이터입니다.',
    tags: ['MT', 'AN'],
    sentiment: 'positive',
  },
]

export default function MySituationPage() {
  const [radar, setRadar] = useState<RadarItem[]>(DEFAULT_RADAR)
  const [history, setHistory] = useState<HistoryLog[]>(DEFAULT_HISTORY)
  const [isGuest, setIsGuest] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsGuest(false)
        console.log('User logged in, trying to sync local data...')
        
        // 1. 로컬 데이터 DB 동기화
        const localCsei = localStorage.getItem('final_csei_results')
        const localCure = localStorage.getItem('final_cure_history')
        
        if (localCsei || localCure) {
          try {
            await fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                csei_results: localCsei ? JSON.parse(localCsei) : [],
                cure_history: localCure ? JSON.parse(localCure) : []
              })
            })
            // 동기화 완료 후 로컬 삭제
            localStorage.removeItem('final_csei_results')
            localStorage.removeItem('final_cure_history')
            console.log('Sync complete!')
          } catch (e) {
            console.error('Sync failed', e)
          }
        }

        // 2. DB에서 내 데이터 가져오기
        const { data: dbCsei } = await supabase
          .from('csei_results')
          .select('scores')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (dbCsei && dbCsei.length > 0) {
          setRadar(dbCsei[0].scores)
        }

        const { data: dbCure } = await supabase
          .from('cure_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (dbCure && dbCure.length > 0) {
          const formattedHistory = dbCure.map(c => ({
            id: c.id,
            date: new Date(c.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
            type: c.type || 'Session Record',
            summary: c.summary || c.situation || '',
            tags: c.tags || [],
            sentiment: (c.sentiment || 'neutral') as 'positive' | 'neutral' | 'negative'
          }))
          setHistory(formattedHistory)
        }

      } else {
        // [비회원(Guest) 모드] - LocalStorage에서 읽기
        setIsGuest(true)
        if (typeof window !== 'undefined') {
          const savedResults = localStorage.getItem('final_csei_results')
          if (savedResults) {
            try {
              const parsed = JSON.parse(savedResults)
              if (Array.isArray(parsed) && parsed.length > 0) {
                setRadar(parsed[0].scores) // 제일 최근 데이터
              } else if (parsed.scores) {
                setRadar(parsed.scores) // v4 하위호환
              }
            } catch (e) {
              console.error('Failed to parse radar data', e)
            }
          }
          
          const savedHistory = localStorage.getItem('final_cure_history')
          if (savedHistory) {
            try {
              const parsed = JSON.parse(savedHistory)
              setHistory(parsed.length > 0 ? parsed : DEFAULT_HISTORY)
            } catch (e) {
              console.error('Failed to parse history data', e)
            }
          }
        }
      }
    }

    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333] font-sans selection:bg-[#566e63]/20">
      {/* Navbar */}
      <nav className="px-6 md:px-10 py-6 flex justify-between items-center bg-transparent max-w-[1400px] mx-auto w-full">
        <Link href="/" className="font-extrabold text-xl tracking-tight text-[#4a5c53]">Final Service</Link>
        <div className="hidden md:flex gap-12 font-medium text-sm text-gray-500">
          <Link href="/select" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">Cure</Link>
          <Link href="/my-situation" className="text-black border-b-2 border-black pb-1">My Situation</Link>
          <Link href="/chat" className="hover:text-black hover:border-b-2 hover:border-black transition-all pb-1">Chat</Link>
        </div>
        <div className="flex items-center gap-6">
          {isGuest ? (
            <>
              <Link href="/login" className="hidden md:block text-sm font-medium text-gray-600">Login</Link>
              <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">Signup</Link>
            </>
          ) : (
            <button 
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                router.push('/login')
              }}
              className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-red-500 transition-colors"
            >
              <LogOut size={16} />
              Logout
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 pb-24 pt-12">
        
        {/* Guest Mode Alert Banner (Only show if guest) */}
        {isGuest && (
          <div className="bg-[#fcecdb] border border-[#f5d5b8] rounded-[28px] p-6 mb-14 flex flex-col md:flex-row items-center justify-between gap-6 fade-in shadow-sm shadow-amber-900/5 transition-all hover:shadow-md">
             <div className="flex items-center gap-5">
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-600 shadow-sm border border-amber-100 shrink-0">
                   <AlertCircle size={28} />
                </div>
                <div className="text-center md:text-left">
                   <h3 className="text-[15px] font-extrabold text-[#222]">현재 '게스트 모드'로 이용 중입니다.</h3>
                   <p className="text-xs text-[#a67c52] font-medium mt-1 leading-relaxed">
                      지금 보시는 데이터는 브라우저에 임시 저장되어 있습니다. <br className="hidden sm:block" />
                      기록을 안전하게 영구 보관하고 분석 리포트를 지속적으로 받으려면 로그인을 진행해 주세요.
                   </p>
                </div>
             </div>
             <Link href="/login" className="bg-white border border-[#f5d5b8] text-amber-700 px-8 py-3 rounded-full text-xs font-bold hover:bg-amber-50 transition-all shadow-sm active:scale-95">
                로그인하고 기록 보관하기
             </Link>
          </div>
        )}

        {/* Header Title */}
        <div className="mb-14 fade-in">
          <span className="bg-[#e8efe9] text-[#566e63] text-[10px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase inline-block mb-4">
            CURRENT SNAPSHOT
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 tracking-tight">
            How you're feeling today.
          </h1>
          <p className="text-gray-500 font-medium md:text-lg">
            최근 기록과 세션 데이터를 바탕으로 분석한 당신의 감정적 풍경입니다.
          </p>
        </div>

        {/* Top Section : Radar Chart & Obs/Goal */}
        <div className="grid lg:grid-cols-[1fr_350px] gap-6 mb-20 fade-in slide-in-bottom delay-100">
          {/* Left Chart Card */}
          <div className="bg-[#fcfaf7] rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100/50 relative">
            <h2 className="text-xl font-bold text-[#4a5c53] mb-6">The Heptagon Profile</h2>
            <div className="absolute top-8 right-8 text-gray-200">
              <Sparkles size={40} className="opacity-50" />
            </div>
            
            <div className="w-full h-[350px] md:h-[450px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radar}>
                  <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#4a5c53', fontSize: 10, fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={false} 
                    axisLine={false} 
                  />
                  <Radar
                    name="Student"
                    dataKey="A"
                    stroke="#a3b8ad"
                    strokeWidth={2}
                    fill="#a3b8ad"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Stat Badges at bottom of chart card */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-[#f0ece5] rounded-full py-4 px-6 text-center border border-white">
                <div className="text-2xl font-extrabold text-[#4a5c53]">{radar[0].A}%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">기쁨 (喜)</div>
              </div>
              <div className="bg-[#f0ece5] rounded-full py-4 px-6 text-center border border-white">
                <div className="text-2xl font-extrabold text-[#4a5c53]">{radar[1].A}%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">분노 (怒)</div>
              </div>
              <div className="bg-[#f0ece5] rounded-full py-4 px-6 text-center border border-white">
                <div className="text-2xl font-extrabold text-[#4a5c53]">{radar[2].A}%</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">근심 (憂)</div>
              </div>
              <div className="bg-[#e8efe9] rounded-full py-4 px-6 text-center flex flex-col items-center justify-center border border-white cursor-pointer hover:bg-[#d0dfd3] transition-colors">
                <Sparkles size={16} className="text-[#566e63] mb-1" />
                <div className="text-[10px] font-bold text-[#566e63] uppercase tracking-widest">분석 리포트</div>
              </div>
            </div>
          </div>

          {/* Right Cards Stack */}
          <div className="flex flex-col gap-6">
            {/* Observation Card */}
            <div className="bg-[#d2eaf7] rounded-[40px] p-8 md:p-10 flex-1 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
               <Sparkles size={24} className="text-[#3b6b8b] mb-6" />
               <h3 className="text-xl font-bold text-[#222] mb-4 relative z-10">Therapist's Observation</h3>
               <p className="text-[#3b6b8b] font-medium leading-relaxed italic relative z-10 text-[15px]">
                 "Your resilience scores have increased by 12% this week. This aligns perfectly with the boundaries you've been setting at work. Keep prioritizing your evening wind-down."
               </p>
            </div>

            {/* Upcoming Goal Card */}
            <div className="bg-[#f0ece5] rounded-[30px] p-8">
               <h3 className="text-sm font-bold text-[#222] mb-6">Upcoming Goal</h3>
               <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-full text-black shadow-sm">
                    <Moon size={20} />
                  </div>
                  <div className="flex-1">
                     <div className="text-sm font-bold text-[#222] mb-1">Improve Sleep Consistency</div>
                     <div className="text-xs text-gray-500 font-medium">4/7 nights achieved</div>
                     {/* Progress Bar */}
                     <div className="h-1.5 w-full bg-white rounded-full mt-3 overflow-hidden">
                       <div className="h-full bg-[#566e63] w-[57%] rounded-full" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* History & Records Section */}
        <div className="mb-20 fade-in slide-in-bottom delay-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold mb-2">History & Records</h2>
              <p className="text-gray-400 font-medium text-sm">과거의 인지 재구성 및 일지 기록을 검토합니다.</p>
            </div>
            {/* Search & Filter */}
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search logs..." 
                  className="bg-[#f5f5f5] pl-10 pr-4 py-3 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#566e63]/20 w-[200px]"
                />
              </div>
              <button className="bg-[#f5f5f5] w-11 h-11 rounded-full flex items-center justify-center text-gray-500 hover:bg-[#e0e0e0] transition-colors">
                <Filter size={18} />
              </button>
            </div>
          </div>

          {/* History Cards Grid */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {history.map((log: HistoryLog) => (
              <div key={log.id} className="bg-white rounded-[30px] p-8 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group flex flex-col h-full">
                <div className="flex justify-between items-center mb-6">
                  <span className="bg-[#f5f5f5] text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest text-gray-500">
                    {log.date}
                  </span>
                  <div>
                    {log.sentiment === 'positive' && <Smile size={20} className="text-[#566e63]" />}
                    {log.sentiment === 'neutral' && <Meh size={20} className="text-[#8c7457]" />}
                    {log.sentiment === 'negative' && <Frown size={20} className="text-[#b13c3c]" />}
                  </div>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 flex-1">{log.type}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-6 line-clamp-3">
                  {log.summary}
                </p>
                <div className="flex justify-between items-center mt-auto">
                  <div className="flex gap-1.5 text-[8px] font-bold">
                    {log.tags.map((tag: string, idx: number) => (
                      <span key={idx} className={`w-6 h-6 rounded-full flex items-center justify-center ${idx===0 ? 'bg-[#cae5df] text-[#4a5c53]' : 'bg-[#badce3] text-[#4a5c53]'}`}>
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] font-bold flex items-center gap-1 group-hover:text-[#566e63] transition-colors">
                    View Details <ArrowRight size={12} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center">
            <button className="bg-[#f0ece5] hover:bg-[#e0dcd5] text-[#222] font-bold text-sm px-8 py-3 rounded-full transition-colors">
              Load previous records
            </button>
          </div>
        </div>

        {/* Healing Banner Section */}
        <div className="bg-[#f0ece5] rounded-[40px] p-8 md:p-16 flex flex-col md:flex-row items-center gap-10 overflow-hidden relative fade-in slide-in-bottom delay-300">
          <div className="md:w-1/2 relative z-10">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6 tracking-tight">Healing is not linear.</h2>
            <p className="text-sm md:text-base text-gray-500 font-medium leading-relaxed mb-8 max-w-md">
              당신의 데이터는 상승과 하강을 보여줍니다. 그리고 그것이 바로 치유가 진행된다는 증거입니다. 
              힘들었던 기록조차도 우리가 함께 만들어가는 명확함에 기여합니다.
            </p>
            <div className="flex flex-wrap gap-4">
              <span className="bg-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest text-[#222] flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#566e63]" />
                CONSISTENCY: 12 DAYS
              </span>
              <span className="bg-white px-4 py-2 rounded-full text-[10px] font-bold tracking-widest text-[#222] flex items-center gap-2 shadow-sm">
                <div className="w-1.5 h-1.5 rounded-full bg-[#3b6b8b]" />
                GROWTH: +14%
              </span>
            </div>
          </div>
          
          <div className="md:w-1/2 relative z-10 flex justify-center w-full">
            {/* Abstract Graphic mimicking the design */}
            <div className="w-full max-w-[400px] aspect-[4/3] bg-[#e1bd95] rounded-3xl relative overflow-hidden shadow-lg border border-white/20">
              <div className="absolute inset-0 bg-[#72aead] w-full h-[150%] rounded-[100%] origin-bottom-left -translate-x-[30%] -translate-y-[20%] rotate-12" />
            </div>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 mt-10">
        <div>
          <div className="font-extrabold text-sm mb-1 text-[#4a5c53]">Final Service</div>
        </div>
        <div className="flex gap-10 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          <Link href="#" className="hover:text-black transition-colors">About</Link>
          <Link href="#" className="hover:text-black transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-black transition-colors">Contact</Link>
          <Link href="#" className="hover:text-black transition-colors">Terms</Link>
        </div>
        <div className="text-[10px] text-gray-300 font-bold">
          © 2024 Final Service. The Living Sanctuary.
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
