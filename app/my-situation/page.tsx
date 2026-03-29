'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import { Sparkles, Moon, Smile, Meh, Frown, Search, Filter, ArrowRight, AlertCircle, LogOut, TrendingUp, LayoutGrid, Calendar, User, Bell, Settings } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

interface RadarItem {
  subject: string
  A: number
  fullMark: number
}

interface HistoryLog {
  id: string | number
  date: string
  type: string
  summary: string
  tags: string[]
  sentiment: 'positive' | 'neutral' | 'negative'
  isAssessment?: boolean
}

const DEFAULT_RADAR: RadarItem[] = [
  { subject: '희 (喜)', A: 84, fullMark: 100 },
  { subject: '노 (怒)', A: 75, fullMark: 100 },
  { subject: '사 (思)', A: 62, fullMark: 100 },
  { subject: '우 (憂)', A: 41, fullMark: 100 },
  { subject: '비 (悲)', A: 70, fullMark: 100 },
  { subject: '공 (恐)', A: 65, fullMark: 100 },
  { subject: '경 (驚)', A: 80, fullMark: 100 },
]

export default function MySituationPage() {
  const [radar, setRadar] = useState<RadarItem[]>(DEFAULT_RADAR)
  const [history, setHistory] = useState<HistoryLog[]>([])
  const [allCsei, setAllCsei] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'radar' | 'line'>('radar')
  const [isGuest, setIsGuest] = useState(true)
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([])
  const router = useRouter()

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsGuest(false)
        const localCsei = localStorage.getItem('final_csei_results')
        const localCure = localStorage.getItem('final_cure_history')
        if (localCsei || localCure) {
          try {
            const res = await fetch('/api/user/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                csei_results: localCsei ? (Array.isArray(JSON.parse(localCsei)) ? JSON.parse(localCsei) : [JSON.parse(localCsei)]) : [],
                cure_history: localCure ? JSON.parse(localCure) : []
              })
            })
            if (res.ok) {
              localStorage.removeItem('final_csei_results')
              localStorage.removeItem('final_cure_history')
            } else {
              console.error('Sync failed with status:', res.status)
            }
          } catch (e) { console.error('Sync exception:', e) }
        }

        const { data: dbCsei } = await supabase
          .from('csei_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (dbCsei && dbCsei.length > 0) {
          setAllCsei(dbCsei)
          setRadar(dbCsei[0].scores)
        }

        const { data: dbCure } = await supabase
          .from('cure_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const combined: HistoryLog[] = []
        if (dbCsei) {
          dbCsei.forEach(item => {
            const topEmotion = [...item.scores].sort((a: any, b: any) => b.A - a.A)[0]
            combined.push({
              id: `csei-${item.id}`,
              date: new Date(item.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
              type: '칠정(七情) 진단 기록',
              summary: `[가장 높은 지표: ${topEmotion.subject} (${topEmotion.A}%)] 전반적 분석 결과입니다.`,
              tags: ['진단', '7정'],
              sentiment: 'neutral',
              isAssessment: true
            })
          })
        }
        if (dbCure) {
          dbCure.forEach(c => {
            combined.push({
              id: c.id,
              date: new Date(c.created_at).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
              type: c.type || 'Session Record',
              summary: c.summary || c.situation || '',
              tags: c.tags || ['CBT'],
              sentiment: (c.sentiment || 'neutral') as any
            })
          })
        }
        setHistory(combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))

      } else {
        setIsGuest(true)
        if (typeof window !== 'undefined') {
          const localCseiStr = localStorage.getItem('final_csei_results')
          const localCsei = localCseiStr ? JSON.parse(localCseiStr) : []
          const resultsArray = Array.isArray(localCsei) ? localCsei : (localCsei.scores ? [localCsei] : [])
          if (resultsArray.length > 0) {
            setAllCsei(resultsArray)
            setRadar(resultsArray[0].scores)
          }
          const localCureStr = localStorage.getItem('final_cure_history')
          setHistory(localCureStr ? JSON.parse(localCureStr) : [])
        }
      }
    }
    loadData()
  }, [])

  const handleLegendClick = (e: any) => {
    const { dataKey } = e
    setHiddenSeries(prev => prev.includes(dataKey) ? prev.filter(s => s !== dataKey) : [...prev, dataKey])
  }

  const handleSelectHistory = (index: number) => {
    setSelectedIndex(index)
    if (allCsei[index]) setRadar(allCsei[index].scores)
  }

  const trendData = [...allCsei].reverse().map(item => {
    const d = new Date(item.created_at || item.timestamp)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    const entry: any = { name: dateStr }
    item.scores.forEach((s: any) => { entry[s.subject] = s.A })
    return entry
  })

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333] font-sans selection:bg-[#566e63]/20">
      <nav className="border-b border-gray-100 px-6 md:px-10 py-6 flex justify-between items-center bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="font-extrabold text-2xl text-[#4a5c53] tracking-tighter">파이널 서비스</Link>
        <div className="hidden md:flex gap-12 text-[10px] font-extrabold tracking-[0.2em] text-gray-400">
           <Link href="/select" className="hover:text-[#566e63] transition-colors">인지재구성(Cure)</Link>
           <Link href="/my-situation" className="text-[#566e63] border-b-2 border-[#566e63] pb-1">내 상태 분석</Link>
           <Link href="/chat" className="hover:text-[#566e63] transition-colors">심리상담 챗봇</Link>
        </div>
        {!isGuest ? (
          <button onClick={logout} className="flex items-center gap-2 group">
             <div className="w-10 h-10 rounded-full bg-[#f0f2f0] flex items-center justify-center text-[#566e63] group-hover:bg-[#566e63] group-hover:text-white transition-all overflow-hidden shadow-inner">
               <LogOut size={16} />
             </div>
             <span className="text-[10px] font-bold text-gray-400 group-hover:text-[#566e63] hidden sm:inline">로그아웃</span>
          </button>
        ) : (
          <Link href="/login" className="bg-[#566e63] text-white px-6 py-2.5 rounded-full text-[10px] font-bold tracking-widest hover:bg-[#43574d] hover:-translate-y-0.5 transition-all shadow-lg active:scale-95">로그인 / 회원가입</Link>
        )}
      </nav>

      <main className="max-w-[1200px] mx-auto px-6 py-12 md:py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16 fade-in">
          <div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tighter mb-4">안녕하세요.</h1>
            <p className="text-gray-400 font-medium text-lg md:text-xl">당신의 마음은 하나의 안식처입니다. 여기 그 청사진이 있습니다.</p>
          </div>
          {isGuest && (
            <div className="bg-[#fff9e6] border border-[#f5e1a4] p-5 rounded-[30px] flex items-center gap-4 shadow-sm animate-pulse">
               <AlertCircle className="text-[#b48d1a]" size={24} />
               <p className="text-[#856404] text-xs font-bold leading-tight">게스트 모드: 로그인하면 데이터를 기기에 상관없이 동기화할 수 있습니다.</p>
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-[1fr_350px] gap-6 mb-20 fade-in slide-in-bottom delay-100">
          <div className="bg-[#fcfaf7] rounded-[40px] p-8 md:p-12 shadow-sm border border-gray-100/50 relative">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-10">
              <div>
                <h2 className="text-xl font-bold text-[#4a5c53]">칠정(七情) 프로파일</h2>
                <p className="text-xs text-gray-400 mt-1 font-medium italic">당신의 마음을 구성하는 7가지 요소</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-white/60 p-1 rounded-full border border-gray-100 flex shadow-sm">
                  <button onClick={() => setViewMode('radar')} className={`p-2 rounded-full transition-all ${viewMode === 'radar' ? 'bg-[#566e63] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}><LayoutGrid size={16} /></button>
                  <button onClick={() => setViewMode('line')} className={`p-2 rounded-full transition-all ${viewMode === 'line' ? 'bg-[#566e63] text-white shadow-md' : 'text-gray-400 hover:text-gray-600'}`}><TrendingUp size={16} /></button>
                </div>
                {allCsei.length > 0 && viewMode === 'radar' && (
                  <div className="relative">
                    <Calendar size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#566e63]" />
                    <select value={selectedIndex} onChange={(e) => handleSelectHistory(Number(e.target.value))} className="bg-white pl-10 pr-4 py-2.5 rounded-full text-xs font-bold border border-gray-100 outline-none focus:ring-2 focus:ring-[#566e63]/10 shadow-sm text-[#4a5c53] appearance-none cursor-pointer">
                      {allCsei.map((item, idx) => (<option key={idx} value={idx}>{new Date(item.created_at || item.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 진단</option>))}
                    </select>
                  </div>
                )}
              </div>
            </div>
            
            <div className="w-full h-[400px] md:h-[500px]">
              <ResponsiveContainer width="100%" height="100%">
                {viewMode === 'radar' ? (
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radar}>
                    <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4a5c53', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                    <Radar name="Student" dataKey="A" stroke="#a3b8ad" strokeWidth={2} fill="#a3b8ad" fillOpacity={0.6} />
                  </RadarChart>
                ) : (
                  <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                    <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#999', fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10, fill: '#999' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', fontSize: '12px' }} />
                    <Legend 
                      verticalAlign="bottom" 
                      align="center" 
                      onClick={handleLegendClick} 
                      wrapperStyle={{ paddingTop: '40px', cursor: 'pointer', fontSize: '11px', fontWeight: 'bold' }} 
                    />
                    <Line type="monotone" name="희 (喜)" dataKey="희 (喜)" hide={hiddenSeries.includes('희 (喜)')} stroke="#8884d8" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" name="노 (怒)" dataKey="노 (怒)" hide={hiddenSeries.includes('노 (怒)')} stroke="#ff8042" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="사 (思)" dataKey="사 (思)" hide={hiddenSeries.includes('사 (思)')} stroke="#ffbb28" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="우 (憂)" dataKey="우 (憂)" hide={hiddenSeries.includes('우 (憂)')} stroke="#82ca9d" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="비 (悲)" dataKey="비 (悲)" hide={hiddenSeries.includes('비 (悲)')} stroke="#0088fe" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="공 (恐)" dataKey="공 (恐)" hide={hiddenSeries.includes('공 (恐)')} stroke="#bdc3c7" strokeWidth={3} dot={{ r: 4 }} />
                    <Line type="monotone" name="경 (驚)" dataKey="경 (驚)" hide={hiddenSeries.includes('경 (驚)')} stroke="#9b59b6" strokeWidth={3} dot={{ r: 4 }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-10">
              {[0, 1, 2].map(idx => (
                <div key={idx} className="bg-[#f0ece5] rounded-3xl py-4 px-6 text-center border border-white/50 shadow-sm">
                  <div className="text-2xl font-extrabold text-[#4a5c53]">{radar[idx]?.A || 0}%</div>
                  <div className="text-[10px] font-bold text-gray-400 tracking-widest mt-1">{radar[idx]?.subject || '-'}</div>
                </div>
              ))}
              <div className="bg-[#e8efe9] rounded-3xl py-4 px-6 text-center flex flex-col items-center justify-center border border-[#566e63]/10 shadow-sm cursor-pointer hover:bg-[#d0dfd3] transition-all active:scale-95 group">
                <Sparkles size={16} className="text-[#566e63] mb-1 group-hover:rotate-12 transition-transform" />
                <div className="text-[10px] font-bold text-[#566e63] uppercase tracking-widest">분석 리포트</div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="bg-[#d2eaf7] rounded-[40px] p-8 md:p-10 flex-1 relative overflow-hidden group border border-[#b8d6e9]">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/30 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
               <Sparkles size={24} className="text-[#3b6b8b] mb-6" />
               <h3 className="text-xl font-bold text-[#222] mb-4 relative z-10 tracking-tight">전문가의 소견</h3>
               <p className="text-[#3b6b8b] font-medium leading-relaxed italic relative z-10 text-[15px]">"지난주에 비해 회복력 지수가 12% 상승했습니다. 업무 중 경계 세우기에 집중했던 성과가 나타나고 있네요. 저녁 루틴을 꾸준히 유지해 보세요."</p>
            </div>
            <div className="bg-[#f0ece5] rounded-[30px] p-8 border border-white/50 shadow-sm">
               <h3 className="text-sm font-bold text-[#222] mb-6">다음 목표</h3>
               <div className="flex items-center gap-4">
                  <div className="bg-white p-3 rounded-2xl text-[#566e63] shadow-sm border border-gray-100"><Moon size={20} /></div>
                  <div className="flex-1">
                     <div className="text-sm font-bold text-[#222] mb-1">수면 패턴 일정하게 유지하기</div>
                     <div className="text-xs text-gray-500 font-medium">현재 주 4/7일 달성 중</div>
                     <div className="h-2 w-full bg-white/60 rounded-full mt-3 overflow-hidden border border-white/50">
                       <div className="h-full bg-[#566e63] w-[57%] rounded-full shadow-[0_0_10px_rgba(86,110,99,0.3)] transition-all duration-1000" />
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        <div className="mb-20 fade-in slide-in-bottom delay-200">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <h2 className="text-3xl font-extrabold mb-2 tracking-tight">히스토리 및 기록</h2>
              <p className="text-gray-400 font-medium text-sm">과거의 인지 재구성 및 심리 진단 기록입니다.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative group">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#566e63] transition-colors" />
                <input type="text" placeholder="기록 검색..." className="bg-white px-10 py-3 rounded-full text-sm outline-none border border-gray-100 focus:ring-4 focus:ring-[#566e63]/5 w-[240px] shadow-sm transition-all" />
              </div>
              <button className="bg-white w-12 h-12 border border-gray-100 shadow-sm rounded-full flex items-center justify-center text-gray-500 hover:bg-[#566e63] hover:text-white transition-all active:scale-90"><Filter size={18} /></button>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {history.map((log: HistoryLog) => (
              <div key={log.id} className={`bg-white rounded-[32px] p-8 shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all cursor-pointer group flex flex-col h-full ${log.isAssessment ? 'ring-2 ring-[#566e63]/5' : ''}`}>
                <div className="flex justify-between items-center mb-6">
                  <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full tracking-widest ${log.isAssessment ? 'bg-[#566e63] text-white' : 'bg-[#f5f5f5] text-gray-500'}`}>{log.date}</span>
                  <div>
                    {log.sentiment === 'positive' && <Smile size={20} className="text-[#566e63]" />}
                    {log.sentiment === 'neutral' && <Meh size={20} className="text-[#8c7457]" />}
                    {log.sentiment === 'negative' && <Frown size={20} className="text-[#b13c3c]" />}
                  </div>
                </div>
                <h3 className="font-bold text-lg leading-tight mb-4 flex-1 group-hover:text-[#566e63] transition-colors">{log.type}</h3>
                <p className="text-xs text-gray-400 leading-relaxed mb-8 line-clamp-3">{log.summary}</p>
                <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-5">
                  <div className="flex gap-2">
                    {log.tags.map((tag: string, idx: number) => (<span key={idx} className={`px-2.5 py-1 rounded-lg text-[9px] font-bold transition-colors ${log.isAssessment ? 'bg-[#f0ece5] text-[#4a5c53]' : 'bg-[#e8efe9] text-[#566e63]'}`}>#{tag}</span>))}
                  </div>
                  <div className="text-[10px] font-bold flex items-center gap-1 text-gray-400 group-hover:text-[#566e63] transition-colors">상세보기 <ArrowRight size={12} /></div>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-center">
            <button className="bg-white border border-gray-100 shadow-sm hover:bg-[#f0ece5] text-[#4a5c53] font-bold text-sm px-10 py-3.5 rounded-full transition-all active:scale-95">이전 기록 더 불러오기</button>
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-100 px-6 md:px-10 py-16 flex flex-col md:flex-row justify-between items-center gap-8 mt-20 bg-white">
        <div>
          <div className="font-extrabold text-lg mb-1 text-[#4a5c53] tracking-tighter">파이널 서비스</div>
          <p className="text-[10px] text-gray-400 font-medium">© 2024 파이널 서비스. 마음의 안식처.</p>
        </div>
        <div className="flex gap-12 text-[10px] font-extrabold text-gray-400 uppercase tracking-[0.2em]">
          <Link href="#" className="hover:text-[#566e63] transition-colors">소개</Link>
          <Link href="#" className="hover:text-[#566e63] transition-colors">개인정보처리방침</Link>
          <Link href="#" className="hover:text-[#566e63] transition-colors">문의하기</Link>
          <Link href="#" className="hover:text-[#566e63] transition-colors">이용약관</Link>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 1.2s cubic-bezier(0.2, 0, 0.2, 1) forwards; opacity: 0; }
        .slide-in-bottom { animation: slideInBottom 1s cubic-bezier(0.2, 0, 0.2, 1) forwards; opacity: 0; }
        .delay-100 { animation-delay: 200ms; }
        .delay-200 { animation-delay: 400ms; }
        .delay-300 { animation-delay: 600ms; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInBottom { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
      `}} />
    </div>
  )
}
