'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/client'
import { 
  Settings, Activity, Sparkles, Calendar, HeartPulse, ChevronRight, Edit3, Save, X, ExternalLink, Activity as ActivityIcon
} from 'lucide-react'
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface EmotionScore {
  subject: string
  A: number
  fullMark: number
}

interface ResultData {
  timestamp: string
  gender: string
  ageGroup: string
  scores: EmotionScore[]
  overallTScore: number
  overallGroup: 'normal' | 'caution' | 'risk'
}

function MySituationContent() {
  const [results, setResults] = useState<ResultData[]>([])
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  
  // 편집 입력값 상태
  const [editName, setEditName] = useState('')
  const [editGender, setEditGender] = useState('')
  const [editAge, setEditAge] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadAllData() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // 1. 프로필 로드 (DB)
        const { data: profileData } = await supabase.from('profiles').select('*').eq('id', user.id).single()
        if (profileData) {
          setProfile(profileData)
          setEditName(profileData.full_name || user.user_metadata?.full_name || '')
          setEditGender(profileData.gender || 'male')
          setEditAge(profileData.age_group || '30s')
        } else {
          setProfile({ full_name: user.user_metadata?.full_name || '사용자', role: 'user' })
        }

        // 2. 진단 히스토리 로드 (localStorage)
        const stored = localStorage.getItem('final_csei_results')
        if (stored) {
          try {
            const parsed = JSON.parse(stored)
            if (Array.isArray(parsed)) setResults(parsed)
          } catch (e) {}
        }
      } else {
        router.push('/login')
      }
      setLoading(false)
    }
    loadAllData()
  }, [])

  // 프로필 저장 로직 (실제로 작동하게 수정)
  const handleSaveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const updates = {
      id: user.id,
      full_name: editName,
      gender: editGender,
      age_group: editAge,
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase.from('profiles').upsert(updates)
    if (!error) {
      setProfile({ ...profile, ...updates })
      setIsEditing(false)
      alert('설정이 성공적으로 저장되었습니다.')
    } else {
      console.error(error)
      alert('저장 중 오류가 발생했습니다.')
    }
  }

  if (loading) return <div className="p-20 text-center font-black text-[#566e63] animate-pulse">마이페이지를 불러오는 중...</div>

  const latest = results[0]
  const radarData = latest ? latest.scores.map(s => ({
    subject: s.subject.includes('(') ? s.subject.split(' ')[0] : s.subject,
    A: s.A,
    fullMark: 100
  })) : [
    { subject: '기쁨', A: 80, fullMark: 100 },
    { subject: '분노', A: 40, fullMark: 100 },
    { subject: '고민', A: 60, fullMark: 100 },
    { subject: '근심', A: 50, fullMark: 100 },
    { subject: '슬픔', A: 30, fullMark: 100 },
    { subject: '두려움', A: 20, fullMark: 100 },
    { subject: '놀람', A: 10, fullMark: 100 }
  ]

  const lineData = [...results].reverse().map(r => ({
    date: new Date(r.timestamp).toLocaleDateString().slice(5),
    score: Math.round(r.overallTScore)
  }))

  const userRole = (profile?.role || '').toLowerCase()
  const isAdmin = userRole === 'doctor' || userRole === 'admin'

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#333]">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 pt-24 pb-20">
        
        {/* 상단 인사 섹션 & 관리자 링크 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
           <div>
              <span className="text-[10px] font-black text-[#566e63] tracking-[0.3em] uppercase mb-4 block">Dashboard</span>
              <h1 className="text-4xl md:text-5xl font-black mb-4">
                 안녕하세요, <span className="text-[#566e63]">{profile?.full_name || '사용자'}님</span>
              </h1>
              <p className="text-gray-400 font-bold mb-6">오늘도 당신의 마음 정원을 가꾸어 볼까요?</p>
              
              {isAdmin && (
                 <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#bfa588] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#bfa588]/20 hover:-translate-y-1 transition-all">
                    의료진 전용 대시보드 바로가기 <ExternalLink size={18} />
                 </Link>
              )}
           </div>
           
           <div className="bg-white p-6 rounded-[32px] border border-[#e8e0d5] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f0f4f1] rounded-2xl flex items-center justify-center text-[#566e63] shadow-inner">
                 <ActivityIcon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">Status</p>
                 <p className="text-sm font-black text-[#566e63]">{latest ? '데이터 분석 완료' : '진단 대기 중'}</p>
              </div>
           </div>
        </div>

        {/* 퀵 액션 그리드: 명상 & 설정 */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
           <div className="lg:col-span-1">
              <div className="bg-[#566e63] p-10 h-full rounded-[48px] text-white flex flex-col justify-between shadow-2xl shadow-[#566e63]/20 relative overflow-hidden group">
                 <div className="relative z-10">
                    <HeartPulse className="mb-6 opacity-40 group-hover:scale-110 transition-transform" size={40} />
                    <h3 className="text-2xl font-black mb-3">명상 이어서 하기</h3>
                    <p className="text-white/70 font-medium text-sm leading-relaxed">진행 중이던 <span className="text-white font-bold">기쁨 명상</span>이 19% 남았습니다.</p>
                 </div>
                 <Link href="/meditation/joy" className="w-full bg-white text-[#566e63] py-4 rounded-2xl font-black text-center text-xs mt-10 hover:bg-white/90 transition-all z-10">
                    RESUME NOW
                 </Link>
                 <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl"></div>
              </div>
           </div>

           <div className="lg:col-span-2">
              <div className="bg-white p-10 h-full rounded-[48px] border border-[#e8e0d5] shadow-sm relative">
                 <div className="flex justify-between items-center mb-10">
                    <h3 className="text-xl font-black text-[#222]">개인 정보 및 맞춤 설정</h3>
                    <button 
                       onClick={() => setIsEditing(!isEditing)}
                       className={`p-3 rounded-full transition-all ${isEditing ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-[#566e63]'}`}
                    >
                       {isEditing ? <X size={20} /> : <Settings size={20} />}
                    </button>
                 </div>

                 {!isEditing ? (
                    <div className="flex flex-wrap gap-4 animate-in fade-in duration-500">
                       <div className="bg-[#faf8f5] px-6 py-4 rounded-2xl border border-gray-100 flex-1 min-w-[150px]">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nickname</span>
                          <span className="font-bold text-[#222] text-lg">{profile?.full_name || '사용자'}</span>
                       </div>
                       <div className="bg-[#faf8f5] px-6 py-4 rounded-2xl border border-gray-100 flex-1 min-w-[150px]">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Gender</span>
                          <span className="font-bold text-[#222] text-lg">{profile?.gender === 'female' ? '여성 (Female)' : '남성 (Male)'}</span>
                       </div>
                       <div className="bg-[#faf8f5] px-6 py-4 rounded-2xl border border-gray-100 flex-1 min-w-[150px]">
                          <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">Age</span>
                          <span className="font-bold text-[#222] text-lg">{profile?.age_group === '50s_plus' ? '50대 이상' : (profile?.age_group || '30s').replace('s', '대')}</span>
                       </div>
                    </div>
                 ) : (
                    <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                       <div className="space-y-6">
                          <div>
                             <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Nickname</label>
                             <input value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none focus:ring-2 focus:ring-[#566e63]" />
                          </div>
                          <div className="flex gap-4">
                             {[['male', '남성'], ['female', '여성']].map(([v, l]) => (
                                <button key={v} onClick={() => setEditGender(v)} className={`flex-1 py-4 rounded-2xl font-black text-xs border ${editGender === v ? 'bg-[#566e63] text-white border-transparent' : 'bg-white border-gray-100 text-gray-400'}`}>{l}</button>
                             ))}
                          </div>
                       </div>
                       <div className="flex flex-col justify-between gap-6">
                          <div>
                             <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Age Group</label>
                             <select value={editAge} onChange={(e) => setEditAge(e.target.value)} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none appearance-none">
                                <option value="20s">20대</option>
                                <option value="30s">30대</option>
                                <option value="40s">40대</option>
                                <option value="50s_plus">50대 이상</option>
                             </select>
                          </div>
                          <button onClick={handleSaveProfile} className="w-full bg-[#566e63] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-[#566e63]/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all">
                             <Save size={18} /> 설정 저장하기
                          </button>
                       </div>
                    </div>
                 )}
              </div>
           </div>
        </div>

        {/* 지표 분석: 레이더 & 라인 그래프 */}
        <div className="bg-white p-10 md:p-14 rounded-[56px] border border-[#e8e0d5] shadow-sm">
           <div className="flex justify-between items-center mb-16">
              <h3 className="text-2xl font-black text-[#222]">나의 정서 지표 <span className="text-[#566e63]/30 uppercase text-xs tracking-widest ml-4">Trends</span></h3>
              <div className="text-[9px] font-black tracking-widest text-[#bfa588] bg-[#fdfbf7] border border-[#f5ebd9] px-5 py-2 rounded-full uppercase">Realtime Data</div>
           </div>

           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="h-[380px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                       <PolarGrid stroke="#f1f5f9" />
                       <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: '900', fill: '#64748b'}} />
                       <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                       <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontWeight: 'bold'}} />
                       <Radar name="정서 수치" dataKey="A" stroke="#566e63" strokeWidth={3} fill="#566e63" fillOpacity={0.15} dot={{r: 4, fill: '#566e63'}} />
                    </RadarChart>
                 </ResponsiveContainer>
              </div>

              <div className="h-[380px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={lineData}>
                       <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="#f1f5f9" />
                       <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fontSize: 11, fontWeight: 'bold', fill: '#94a3b8'}} />
                       <YAxis hide domain={[0, 100]} />
                       <Tooltip contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', fontWeight: 'bold'}} />
                       <Line type="monotone" dataKey="score" stroke="#566e63" strokeWidth={6} dot={{r: 8, fill: '#566e63', stroke: 'white', strokeWidth: 4}} activeDot={{r: 10, shadow: '0 0 10px rgba(0,0,0,0.2)'}} animationDuration={1500} />
                    </LineChart>
                 </ResponsiveContainer>
              </div>
           </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function MySituationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#faf8f5] font-black text-[#566e63] animate-pulse">데이터를 보호하며 불러오는 중...</div>}>
      <MySituationContent />
    </Suspense>
  )
}
