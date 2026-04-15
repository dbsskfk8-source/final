'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  ArrowRight, 
  Settings, 
  Activity, 
  Sparkles, 
  Calendar, 
  Heart, 
  User, 
  Bell, 
  LogOut,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  Frown,
  Smile,
  Meh
} from 'lucide-react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface RadarItem {
  subject: string
  A: number
  fullMark: number
}

interface HistoryLog {
  id?: string
  date: string
  type: string
  summary: string
  sentiment: 'positive' | 'neutral' | 'negative'
  tags: string[]
  isAssessment?: boolean
  timestamp?: string
}

const DEFAULT_RADAR: RadarItem[] = [
  { subject: '기쁨', A: 85, fullMark: 100 },
  { subject: '분노', A: 40, fullMark: 100 },
  { subject: '고민', A: 90, fullMark: 100 },
  { subject: '근심', A: 50, fullMark: 100 },
  { subject: '슬픔', A: 30, fullMark: 100 },
  { subject: '두려움', A: 25, fullMark: 100 },
  { subject: '놀람', A: 10, fullMark: 100 },
]

export default function MySituationPage() {
  const [radar, setRadar] = useState<RadarItem[]>(DEFAULT_RADAR)
  const [history, setHistory] = useState<HistoryLog[]>([])
  const [viewMode, setViewMode] = useState<'radar' | 'line'>('radar')
  const [userNickname, setUserNickname] = useState('사용자')
  const [resumeData, setResumeData] = useState<any>(null)
  const [chartWidth, setChartWidth] = useState(500)
  const router = useRouter()

  useEffect(() => {
    const updateWidth = () => setChartWidth(Math.min(window.innerWidth - 80, 800))
    updateWidth()
    window.addEventListener('resize', updateWidth)
    return () => window.removeEventListener('resize', updateWidth)
  }, [])

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase.from('profiles').select('username').eq('id', user.id).single()
        if (profile?.username) setUserNickname(profile.username)
      }

      // 이어서 하기 데이터
      const savedResume = localStorage.getItem('meditation_resume')
      if (savedResume) {
        try {
          const parsed = JSON.parse(savedResume)
          if ((Date.now() - parsed.savedAt) < (1000 * 60 * 60 * 24)) setResumeData(parsed)
        } catch (e) {}
      }

      // 진단 결과 로그 로드
      const stored = localStorage.getItem('final_csei_results')
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed) && parsed.length > 0) {
            const latest = parsed[0]
            const newRadar = latest.scores.map((s: any) => ({
              subject: s.subject,
              A: s.A,
              fullMark: 100
            }))
            setRadar(newRadar)
            
            setHistory(parsed.map((r: any) => ({
              id: r.id || r.timestamp,
              date: new Date(r.timestamp).toLocaleDateString(),
              type: r.isPostMeditation ? '상담 사후 기록' : '7가지 감정 진단 기록',
              summary: `${r.overallGroup === 'risk' ? '집중 관리가 필요한' : '안정적인'} 정서 상태입니다. 7개 감정의 dB 지수가 균형있게 유지되도록 가이드합니다.`,
              sentiment: r.overallGroup === 'risk' ? 'negative' : 'positive',
              tags: r.scores.slice(0, 2).map((s: any) => s.subject),
              isAssessment: true
            })))
          }
        } catch (e) {}
      }
    }
    loadData()
  }, [])

  return (
    <div className="min-h-screen bg-[#fcfdfc] pb-24">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        {/* 상단 인사 섹션 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div>
              <span className="text-[10px] font-black text-[#566e63] tracking-[0.3em] uppercase mb-2 block">DASHBOARD</span>
              <h1 className="text-4xl font-black text-[#222] tracking-tight">
                 안녕하세요, <span className="text-[#566e63]">{userNickname}</span>님
              </h1>
              <p className="text-gray-500 font-medium mt-2">오늘도 당신의 마음 정원을 가꾸어 볼까요?</p>
           </div>
           
           <div className="flex bg-white p-1 rounded-2xl border border-gray-100 shadow-sm">
              <button onClick={() => setViewMode('radar')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] transition-all ${viewMode === 'radar' ? 'bg-[#566e63] text-white shadow-lg' : 'text-gray-400'}`}>7-EMOTION RADAR</button>
              <button onClick={() => setViewMode('line')} className={`px-6 py-2.5 rounded-xl font-black text-[10px] transition-all ${viewMode === 'line' ? 'bg-[#566e63] text-white shadow-lg' : 'text-gray-400'}`}>HISTORY LINE</button>
           </div>
        </div>

        {/* 퀵 액션 그리드 */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
           <div className="lg:col-span-1">
              {resumeData ? (
                 <div className="bg-gradient-to-br from-[#566e63] to-[#4a5c53] p-8 rounded-[40px] text-white shadow-2xl shadow-[#566e63]/20 h-full flex flex-col justify-between">
                    <div>
                       <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center mb-6"><Activity size={24} /></div>
                       <h3 className="text-xl font-black mb-2">명상 이어서 하기</h3>
                       <p className="text-sm text-white/70 mb-8 font-medium">진행 중이던 <span className="text-white font-bold">{resumeData.emotionKey}</span> 명상이 {resumeData.progress}% 남았습니다.</p>
                    </div>
                    <Link href={`/meditation/${resumeData.emotion}`} className="w-full py-4 bg-white text-[#566e63] rounded-[20px] font-black text-center text-xs shadow-inner">RESUME NOW</Link>
                 </div>
              ) : (
                 <div className="bg-white border border-gray-100 p-8 rounded-[40px] shadow-sm flex flex-col items-center justify-center h-full text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4"><Sparkles size={24} className="text-gray-200" /></div>
                    <h3 className="text-lg font-black text-[#222]">새로운 검사를 시작하세요</h3>
                    <p className="text-xs text-gray-400 mt-2">최근 기록이 없으시군요.</p>
                 </div>
              )}
           </div>

           <div className="lg:col-span-2 bg-white border border-gray-100 p-10 rounded-[40px] shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="flex-1">
                 <h3 className="text-xl font-black text-[#222] mb-3">개인 정보 및 규준 설정</h3>
                 <p className="text-sm text-gray-400 font-medium mb-8">감정 분석의 정확도를 높이기 위해 기입 정보를 정기적으로 확인해 주세요.</p>
                 <div className="flex gap-4">
                    <div className="px-5 py-3 bg-[#fcfdfc] border border-gray-50 rounded-xl text-xs font-bold text-[#566e63]">여성 (Female)</div>
                    <div className="px-5 py-3 bg-[#fcfdfc] border border-gray-50 rounded-xl text-xs font-bold text-[#566e63]">30대 (30s)</div>
                 </div>
              </div>
              <button className="p-5 bg-gray-50 text-[#566e63] rounded-3xl hover:bg-[#566e63] hover:text-white transition-all"><Settings size={28} /></button>
           </div>
        </div>

        {/* 메인 차트 구역 */}
        <div className="bg-white border border-gray-100 p-10 rounded-[50px] shadow-sm mb-16 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
           <div className="flex justify-between items-center mb-12">
              <h3 className="text-2xl font-black text-[#222]">
                 나의 정서 지표 <span className="text-[#566e63] ml-2 opacity-30 tracking-[0.2em]">{viewMode.toUpperCase()}</span>
              </h3>
              <div className="px-4 py-2 bg-[#fcfdfc] rounded-full text-[10px] font-black text-[#bfa588] border border-[#f5f0e8] uppercase tracking-widest">Live Updates</div>
           </div>

           <div className="w-full flex justify-center py-6 min-h-[400px]">
              {viewMode === 'radar' ? (
                <RadarChart cx="50%" cy="50%" outerRadius="80%" width={chartWidth} height={400} data={radar}>
                  <PolarGrid stroke="#f1f1f1" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: '#999', fontSize: 13, fontWeight: 'bold' }} />
                  <Radar name="내 마음" dataKey="A" stroke="#566e63" fill="#566e63" fillOpacity={0.15} dot strokeWidth={3} />
                  <Tooltip />
                </RadarChart>
              ) : (
                <LineChart width={chartWidth} height={400} data={radar}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f1f1" />
                  <XAxis dataKey="subject" axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#999', fontSize: 12 }} />
                  <Tooltip />
                  <Line type="monotone" dataKey="A" stroke="#566e63" strokeWidth={4} dot={{ r: 6, fill: '#566e63', strokeWidth: 0 }} activeDot={{ r: 8 }} />
                </LineChart>
              )}
           </div>
        </div>

        {/* 히스토리 타임라인 */}
        <div className="mb-20 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
           <div className="flex justify-between items-end mb-10">
              <h3 className="text-2xl font-black text-[#222]">진단 및 치유 히스토리</h3>
              <Link href="/reports" className="text-xs font-black text-[#566e63] flex items-center gap-1 hover:gap-2 transition-all">전체보기 <ChevronRight size={14} /></Link>
           </div>

           <div className="grid md:grid-cols-2 gap-6">
              {history.map((log, idx) => (
                <div key={idx} className="bg-white border border-gray-50 p-8 rounded-[40px] hover:shadow-xl hover:shadow-[#566e63]/5 transition-all group">
                   <div className="flex justify-between items-start mb-6">
                      <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">{log.date}</span>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${log.sentiment === 'positive' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'}`}>
                         {log.sentiment === 'positive' ? <Smile size={20} /> : <Frown size={20} />}
                      </div>
                   </div>
                   <h4 className="text-lg font-black text-[#222] mb-3 group-hover:text-[#566e63] transition-colors">{log.type}</h4>
                   <p className="text-sm text-gray-400 font-medium leading-relaxed mb-8">{log.summary}</p>
                   <div className="flex gap-2">
                      {log.tags.map((t, i) => (<span key={i} className="px-3 py-1 bg-gray-50 rounded-lg text-[9px] font-extrabold text-[#566e63]">#{t}</span>))}
                   </div>
                </div>
              ))}
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
