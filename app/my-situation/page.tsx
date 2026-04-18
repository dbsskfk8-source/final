'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  Legend,
  ReferenceArea
} from 'recharts'
import { 
  Sparkles, Moon, Smile, Meh, Frown, Search, Filter, ArrowRight, AlertCircle, 
  LogOut, TrendingUp, LayoutGrid, Calendar, User, Bell, Settings, Activity, 
  Brain, Heart, Fingerprint, Wind, Save, Edit2, ChevronRight, Play, ExternalLink,
  Activity as ActivityIcon, Edit3, X, HeartPulse
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface RadarItem {
  subject: string
  A: number
  fullMark: number
  group?: string
  groupLabel?: string
  min?: number
  max?: number
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

interface UserProfile {
  nickname: string
  full_name: string
  gender: string
  birthdate: string
  phone: string
  role?: string
}

const DEFAULT_RADAR: RadarItem[] = [
  { subject: '기쁨', A: 84, fullMark: 100 },
  { subject: '분노', A: 75, fullMark: 100 },
  { subject: '고민', A: 62, fullMark: 100 },
  { subject: '근심', A: 41, fullMark: 100 },
  { subject: '슬픔', A: 70, fullMark: 100 },
  { subject: '두려움', A: 65, fullMark: 100 },
  { subject: '놀람', A: 80, fullMark: 100 },
]

function MySituationContent() {
  const [radar, setRadar] = useState<RadarItem[]>(DEFAULT_RADAR)
  const [history, setHistory] = useState<HistoryLog[]>([])
  const [allCsei, setAllCsei] = useState<any[]>([])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [viewMode, setViewMode] = useState<'radar' | 'line'>('radar')
  const [resumeData, setResumeData] = useState<any>(null)
  const [isGuest, setIsGuest] = useState(true)
  const [hiddenSeries, setHiddenSeries] = useState<string[]>([])
  const [profile, setProfile] = useState<UserProfile>({ nickname: '', full_name: '', gender: '', birthdate: '', phone: '', role: 'user' })
  const [editingProfile, setEditingProfile] = useState(false)
  const [savingProfile, setSavingProfile] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [loading, setLoading] = useState(true)
  const [historySearch, setHistorySearch] = useState('')
  
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    async function loadData() {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setIsGuest(false)

        // 1. 프로필 로드
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        
        if (profileData) {
          setProfile({
            nickname: profileData.nickname || '',
            full_name: profileData.full_name || '',
            gender: profileData.gender || 'male',
            birthdate: profileData.birthdate || '',
            phone: profileData.phone || '',
            role: profileData.role || 'user'
          })
          setDisplayName(profileData.nickname || profileData.full_name || user.user_metadata?.full_name || user.email || '')
        } else {
          setDisplayName(user.user_metadata?.full_name || user.email || '사용자')
        }

        // 2. 로컬 데이터 동기화 (로그인 시 로컬 데이터를 DB로 업로드)
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
            }
          } catch (e) { console.error('Sync exception:', e) }
        }

        // 3. 진단 결과 로드 (DB)
        const { data: dbCsei } = await supabase
          .from('csei_results')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (dbCsei && dbCsei.length > 0) {
          setAllCsei(dbCsei)
          const latestScores = dbCsei[0].scores.map((s: any) => ({
            ...s,
            min: 40,
            max: 60
          }))
          setRadar(latestScores)
        }

        // 4. 치료/상담 기록 로드 (DB)
        const { data: dbCure } = await supabase
          .from('cure_history')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        const combined: HistoryLog[] = []
        if (dbCsei) {
          dbCsei.forEach((item: any) => {
            const topEmotion = [...item.scores].sort((a: any, b: any) => b.A - a.A)[0]
            combined.push({
              id: `csei-${item.id}`,
              date: new Date(item.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase(),
              type: '7가지 감정 진단 기록',
              summary: `[가장 높은 지표: ${topEmotion.subject} (${topEmotion.A}dB)] 전반적 분석 결과입니다.`,
              tags: ['진단', '감정'],
              sentiment: 'neutral',
              isAssessment: true
            })
          })
        }
        if (dbCure) {
          dbCure.forEach((c: any) => {
            combined.push({
              id: c.id,
              date: new Date(c.created_at).toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' }).toUpperCase(),
              type: c.type || 'Session Record',
              summary: c.summary || c.situation || '',
              tags: c.tags || ['CBT'],
              sentiment: (c.sentiment || 'neutral') as any
            })
          })
        }
        setHistory(combined.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()))

      } else {
        // 비회원: 로컬 스토리지에서 로드
        setIsGuest(true)
        setDisplayName('게스트')
        if (typeof window !== 'undefined') {
          const localCseiStr = localStorage.getItem('final_csei_results')
          if (localCseiStr) {
            try {
              const parsed = JSON.parse(localCseiStr)
              const resultsArray = Array.isArray(parsed) ? parsed : (parsed.scores ? [parsed] : [])
              if (resultsArray.length > 0) {
                setAllCsei(resultsArray)
                const latestScores = resultsArray[0].scores.map((s: any) => ({
                  ...s,
                  min: 40,
                  max: 60
                }))
                setRadar(latestScores)
              }
            } catch (e) {}
          }
          
          const localCureStr = localStorage.getItem('final_cure_history')
          if (localCureStr) {
            try {
              setHistory(JSON.parse(localCureStr))
            } catch (e) {}
          }
        }
      }
      setLoading(false)
    }
    loadData()
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      
      const updates = {
        id: user.id,
        nickname: profile.nickname,
        full_name: profile.full_name,
        gender: profile.gender,
        birthdate: profile.birthdate,
        phone: profile.phone,
        updated_at: new Date().toISOString()
      }

      const { error } = await supabase.from('profiles').upsert(updates)
      if (!error) {
        setDisplayName(profile.nickname || profile.full_name || displayName)
        setEditingProfile(false)
        alert('설정이 성공적으로 저장되었습니다.')
      } else {
        throw error
      }
    } catch (e) {
      console.error('프로필 저장 실패', e)
      alert('저장 중 오류가 발생했습니다.')
    } finally {
      setSavingProfile(false)
    }
  }

  // 생년월일로 나이 자동 계산
  const calcAge = (birthdate: string) => {
    if (!birthdate) return ''
    const birth = new Date(birthdate)
    const age = new Date().getFullYear() - birth.getFullYear()
    return `${age}세`
  }

  const handleLegendClick = (e: any) => {
    const { dataKey } = e
    setHiddenSeries(prev => prev.includes(dataKey) ? prev.filter(s => s !== dataKey) : [...prev, dataKey])
  }

  const handleSelectHistory = (index: number) => {
    setSelectedIndex(index)
    if (allCsei[index]) {
      const selectedScores = allCsei[index].scores.map((s: any) => ({
        ...s,
        min: 40,
        max: 60
      }))
      setRadar(selectedScores)
    }
  }

  const trendData = [...allCsei].reverse().map(item => {
    const d = new Date(item.created_at || item.timestamp)
    const dateStr = `${d.getMonth() + 1}/${d.getDate()}`
    const entry: any = { name: dateStr }
    item.scores.forEach((s: any) => { entry[s.subject] = s.A })
    return entry
  })

  if (loading) return <div className="p-20 text-center font-black text-[#566e63] animate-pulse">마이페이지를 불러오는 중...</div>

  const userRole = (profile?.role || '').toLowerCase()
  const isAdmin = userRole === 'doctor' || userRole === 'admin'

  return (
    <div className="min-h-screen bg-[#fcfdfc] pb-24 text-[#333]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 pt-32">
        {/* 상단 인사 섹션 & 관리자 링크 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8 fade-in">
           <div className="flex-1">
              <span className="text-[10px] font-black text-[#566e63] tracking-[0.3em] uppercase mb-4 block">Dashboard</span>
              <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter">
                 안녕하세요, <span className="text-[#566e63]">{displayName || '사용자'}님</span>
              </h1>
              <p className="text-gray-400 font-bold mb-6 text-lg">오늘도 당신의 마음 정원을 가꾸어 볼까요?</p>
              
              <div className="flex flex-wrap gap-4">
                {allCsei.length > 0 && (
                  <Link href="/result" className="inline-flex items-center gap-2 bg-[#566e63] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#566e63]/20 hover:-translate-y-1 transition-all group">
                    <ActivityIcon size={18} className="group-hover:rotate-12 transition-transform" /> 
                    ✨ 최근 진단 결과 요약 보기 <ArrowRight size={18} />
                  </Link>
                )}
                
                {isAdmin && (
                  <Link href="/dashboard" className="inline-flex items-center gap-2 bg-[#bfa588] text-white px-8 py-4 rounded-2xl font-black text-sm shadow-xl shadow-[#bfa588]/20 hover:-translate-y-1 transition-all">
                    의료진 전용 대시보드 바로가기 <ExternalLink size={18} />
                  </Link>
                )}
              </div>
           </div>
           
           <div className="bg-white p-6 rounded-[32px] border border-[#e8e0d5] shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-[#f0f4f1] rounded-2xl flex items-center justify-center text-[#566e63] shadow-inner">
                 <ActivityIcon size={24} />
              </div>
              <div>
                 <p className="text-[10px] font-black text-gray-400 tracking-widest uppercase mb-1">Status</p>
                 <p className="text-sm font-black text-[#566e63]">{allCsei.length > 0 ? '데이터 분석 완료' : '진단 대기 중'}</p>
              </div>
           </div>
        </div>

        {/* ✨ 진행 권장 훈련 (7a1c559 스타일 복원) */}
        {allCsei.length > 0 && (
          <div className="mt-12 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
            {(() => {
              const latestScores = allCsei[0].scores;
              let attentionEmotions = latestScores.filter((s: any) => s.group === 'risk' || s.group === 'caution').sort((a: any, b: any) => b.A - a.A);
              
              if (typeof window !== 'undefined') {
                try {
                  const doneLog = JSON.parse(localStorage.getItem('completed_meditations') || '{}')
                  const testDate = new Date(allCsei[0].created_at || allCsei[0].timestamp).getTime()
                  attentionEmotions = attentionEmotions.filter((emotion: any) => {
                    const doneAt = doneLog[emotion.subject]
                    if (!doneAt) return true
                    return doneAt < testDate
                  })
                } catch (e) {}
              }

              if (attentionEmotions.length === 0) {
                return (
                  <div className="bg-[#f0f9f3] border border-[#d1e8da] rounded-[32px] p-10 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Smile size={32} className="text-[#2fa65a]" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#222] text-xl">현재 모든 감정이 안정권입니다</h3>
                        <p className="text-base text-gray-500 font-medium">특별히 권장되는 치료 훈련이 없습니다. 평온한 하루를 보내세요.</p>
                      </div>
                    </div>
                  </div>
                )
              }

              return (
                <div className="space-y-6">
                  <h3 className="font-extrabold text-sm text-gray-500 flex items-center gap-2 uppercase tracking-widest">
                    <Brain size={18} className="text-[#566e63]" /> 진행 권장 훈련
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {attentionEmotions.map((emotion: any, idx: number) => {
                      const isRisk = emotion.group === 'risk';
                      return (
                        <Link 
                          key={idx}
                          href={`/meditation/${encodeURIComponent(emotion.subject)}`}
                          className={`p-8 rounded-[40px] border transition-all hover:-translate-y-2 hover:shadow-2xl group flex flex-col justify-between h-full relative overflow-hidden
                            ${isRisk ? 'bg-red-50/50 border-red-100' : 'bg-orange-50/50 border-orange-100'}
                          `}
                        >
                          <div className="relative z-10">
                            <div className="flex items-start justify-between mb-8">
                              <div className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest ${isRisk ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                                {emotion.groupLabel}
                              </div>
                              <Sparkles size={24} className={isRisk ? 'text-red-300' : 'text-orange-300'} />
                            </div>
                            
                            <h4 className="font-black text-[#222] text-2xl mb-3">{emotion.subject} 치유 명상</h4>
                            <div className="flex flex-col gap-1 mb-8">
                               <div className="flex items-center gap-2 text-[#566e63]">
                                  <span className="text-lg font-black">T-점수 {Math.round(emotion.A)}점</span>
                               </div>
                               <p className="text-sm text-gray-500 font-bold leading-relaxed">심층 분석 결과, 집중 관리가 필요합니다.</p>
                            </div>
                          </div>
                          
                          <div className={`w-full py-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all relative z-10
                            ${isRisk ? 'bg-red-600 text-white shadow-lg shadow-red-200' : 'bg-orange-500 text-white shadow-lg shadow-orange-200'}
                          `}>
                            훈련 시작하기 <ArrowRight size={18} />
                          </div>
                          <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full blur-3xl opacity-20 ${isRisk ? 'bg-red-400' : 'bg-orange-400'}`} />
                        </Link>
                      )
                    })}
                  </div>
                </div>
              )
            })()}
          </div>
        )
      }

        {/* 게스트 안내 */}
        {isGuest && (
          <div className="bg-[#fff9e6] border border-[#f5e1a4] p-6 rounded-[32px] flex items-center gap-4 shadow-sm mb-12 animate-pulse">
             <AlertCircle className="text-[#b48d1a]" size={24} />
             <p className="text-[#856404] text-sm font-bold">게스트 모드: 로그인하면 데이터를 기기에 상관없이 동기화할 수 있습니다.</p>
          </div>
        )}

        {/* 프로필 설정 섹션 */}
        {!isGuest && (
          <div className="bg-white p-10 rounded-[48px] border border-[#e8e0d5] shadow-sm mb-16 relative fade-in">
             <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#f0f4f1] rounded-2xl flex items-center justify-center text-[#566e63]">
                    <User size={24} />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-[#222]">개인 정보 및 맞춤 설정</h3>
                    <p className="text-sm text-gray-400 font-bold">기본 정보를 설정하면 설문 시 자동으로 입력됩니다.</p>
                  </div>
                </div>
                <button 
                   onClick={() => editingProfile ? handleSaveProfile() : setEditingProfile(true)}
                   className={`p-3 rounded-full transition-all ${editingProfile ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400 hover:text-[#566e63]'}`}
                >
                   {editingProfile ? <X size={20} /> : <Settings size={20} />}
                </button>
             </div>

             {editingProfile ? (
                <div className="grid md:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-6">
                      <div>
                         <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Nickname</label>
                         <input value={profile.nickname} onChange={(e) => setProfile(p => ({...p, nickname: e.target.value}))} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none focus:ring-2 focus:ring-[#566e63]" placeholder="닉네임" />
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Full Name</label>
                         <input value={profile.full_name} onChange={(e) => setProfile(p => ({...p, full_name: e.target.value}))} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none focus:ring-2 focus:ring-[#566e63]" placeholder="이름" />
                      </div>
                      <div className="flex gap-4">
                         {[['male', '남성'], ['female', '여성']].map(([v, l]) => (
                            <button key={v} onClick={() => setProfile(p => ({...p, gender: v}))} className={`flex-1 py-4 rounded-2xl font-black text-xs border ${profile.gender === v ? 'bg-[#566e63] text-white border-transparent' : 'bg-white border-gray-100 text-gray-400'}`}>{l}</button>
                         ))}
                      </div>
                   </div>
                   <div className="flex flex-col justify-between gap-6">
                      <div>
                         <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Birthdate (나이 자동계산)</label>
                         <input type="date" value={profile.birthdate} onChange={(e) => setProfile(p => ({...p, birthdate: e.target.value}))} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none" />
                         {profile.birthdate && <p className="text-xs text-[#566e63] font-bold mt-2 ml-1">→ {calcAge(profile.birthdate)} (자동 계산)</p>}
                      </div>
                      <div>
                         <label className="text-[10px] font-black text-[#566e63] uppercase tracking-widest px-1">Phone</label>
                         <input value={profile.phone} onChange={(e) => setProfile(p => ({...p, phone: e.target.value}))} className="w-full bg-[#faf8f5] border-none rounded-2xl p-4 mt-2 font-black outline-none" placeholder="010-0000-0000" />
                      </div>
                      <button onClick={handleSaveProfile} disabled={savingProfile} className="w-full bg-[#566e63] text-white py-5 rounded-2xl font-black text-sm shadow-xl shadow-[#566e63]/20 flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-all">
                         <Save size={18} /> {savingProfile ? '저장 중...' : '설정 저장하기'}
                      </button>
                   </div>
                </div>
             ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 animate-in fade-in duration-500">
                   {[
                     { label: 'Nickname', value: profile.nickname || '미설정' },
                     { label: 'Full Name', value: profile.full_name || '미설정' },
                     { label: 'Gender', value: profile.gender === 'male' ? '남성' : profile.gender === 'female' ? '여성' : '미설정' },
                     { label: 'Age', value: profile.birthdate ? calcAge(profile.birthdate) : '미설정' },
                     { label: 'Birthdate', value: profile.birthdate || '미설정' },
                     { label: 'Phone', value: profile.phone || '미설정' },
                   ].map((item, i) => (
                      <div key={i} className="bg-[#faf8f5] px-6 py-4 rounded-2xl border border-gray-100">
                         <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest block mb-1">{item.label}</span>
                         <span className="font-bold text-[#222] text-base">{item.value}</span>
                      </div>
                   ))}
                </div>
             )}
          </div>
        )}

        {/* 7가지 감정 프로파일 차트 섹션 */}
        <div className="bg-white p-10 md:p-14 rounded-[56px] border border-[#e8e0d5] shadow-sm mb-20 fade-in">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 mb-16">
              <div>
                <h3 className="text-2xl font-black text-[#222]">칠정(七情) 프로파일 <span className="text-[#566e63]/30 uppercase text-xs tracking-widest ml-4">Analysis</span></h3>
                <p className="text-xs text-gray-400 font-bold mt-1 italic">당신의 마음을 구성하는 7가지 요소</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-gray-50 p-1 rounded-2xl flex border border-gray-100">
                  <button onClick={() => setViewMode('radar')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'radar' ? 'bg-[#566e63] text-white shadow-md' : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
                  <button onClick={() => setViewMode('line')} className={`p-2.5 rounded-xl transition-all ${viewMode === 'line' ? 'bg-[#566e63] text-white shadow-md' : 'text-gray-400'}`}><TrendingUp size={18} /></button>
                </div>
                {allCsei.length > 0 && viewMode === 'radar' && (
                  <select value={selectedIndex} onChange={(e) => handleSelectHistory(Number(e.target.value))} className="bg-gray-50 px-6 py-3 rounded-2xl text-xs font-black border border-gray-100 outline-none text-[#566e63] appearance-none cursor-pointer">
                    {allCsei.map((item, idx) => (<option key={idx} value={idx}>{new Date(item.created_at || item.timestamp).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} 진단</option>))}
                  </select>
                )}
              </div>
           </div>

           <div className="grid lg:grid-cols-2 gap-20 items-center">
              <div className="h-[450px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  {viewMode === 'radar' ? (
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radar}>
                       <PolarGrid stroke="#f1f5f9" />
                       <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: '900', fill: '#64748b'}} />
                       <PolarRadiusAxis domain={[0, 100]} axisLine={false} tick={false} />
                       <Tooltip contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontWeight: 'bold'}} />
                       <Radar name="정서 수치" dataKey="A" stroke="#566e63" strokeWidth={3} fill="#566e63" fillOpacity={0.15} dot={{r: 4, fill: '#566e63'}} />
                    </RadarChart>
                  ) : (
                    <LineChart data={trendData} margin={{ top: 20, right: 30, left: 10, bottom: 20 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b', fontWeight: '900' }} axisLine={false} tickLine={false} />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.05)', fontWeight: 'bold' }} />
                      <Legend onClick={handleLegendClick} wrapperStyle={{ paddingTop: '30px', fontWeight: 'bold' }} />
                      <Line type="monotone" name="희 (喜)" dataKey="희 (喜)" stroke="#facc15" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('희 (喜)')} />
                      <Line type="monotone" name="노 (怒)" dataKey="노 (怒)" stroke="#ef4444" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('노 (怒)')} />
                      <Line type="monotone" name="사 (思)" dataKey="사 (思)" stroke="#a855f7" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('사 (思)')} />
                      <Line type="monotone" name="우 (憂)" dataKey="우 (憂)" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('우 (憂)')} />
                      <Line type="monotone" name="비 (悲)" dataKey="비 (悲)" stroke="#64748b" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('비 (悲)')} />
                      <Line type="monotone" name="경 (驚)" dataKey="경 (驚)" stroke="#f97316" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('경 (驚)')} />
                      <Line type="monotone" name="공 (恐)" dataKey="공 (恐)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} hide={hiddenSeries.includes('공 (恐)')} />
                    </LineChart>
                  )}
                </ResponsiveContainer>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {radar.map((item, idx) => {
                  const group = item.group || 'normal'
                  return (
                    <div key={idx} className="bg-[#faf8f5] p-6 rounded-3xl border border-gray-100 text-center transition-all hover:scale-105">
                      <div className="text-3xl font-black text-[#222] mb-1">{Math.round(item.A)}</div>
                      <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">dB Level</div>
                      <div className="text-base font-black text-[#566e63] mb-3">{item.subject}</div>
                      <div className={`text-[10px] font-black px-3 py-1 rounded-full ${group === 'risk' ? 'bg-red-100 text-red-600' : group === 'caution' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {item.groupLabel || '정상 안심'}
                      </div>
                    </div>
                  )
                })}
              </div>
           </div>
        </div>

        {/* 트래커 섹션 */}
        <div className="bg-[#f0ece5] rounded-[48px] p-10 md:p-14 border border-[#e8e0d5] shadow-sm mb-20 relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-10 fade-in">
           <div className="relative z-10">
               <h3 className="text-2xl font-black text-[#222] mb-3">트래커: 다음 목표</h3>
               <p className="text-gray-500 font-bold max-w-sm">마음의 안정을 위한 장기 과제를 달성해 보세요. 꾸준함이 변화를 만듭니다.</p>
           </div>
           
           <div className="w-full md:w-auto md:min-w-[450px] relative z-10">
              <div className="bg-white p-8 rounded-[32px] border border-white shadow-xl shadow-[#566e63]/5 flex items-center gap-6">
                 <div className="w-14 h-14 bg-[#f0f4f1] rounded-2xl flex items-center justify-center text-[#566e63]">
                   <Moon size={28} />
                 </div>
                 <div className="flex-1">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-black text-[#222]">수면 패턴 일정하게 유지하기</span>
                      <span className="text-xs font-black text-[#566e63]">57%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-50 rounded-full overflow-hidden border border-gray-100">
                      <div className="h-full bg-[#566e63] w-[57%] rounded-full transition-all duration-1000 shadow-inner" />
                    </div>
                    <p className="text-[10px] text-gray-400 font-bold mt-3">현재 주 4/7일 달성 중 • 다음 목표까지 3일 남음</p>
                 </div>
              </div>
           </div>
           <div className="absolute top-[-20%] right-[-10%] w-64 h-64 bg-white/40 rounded-full blur-3xl opacity-50" />
        </div>

        {/* 히스토리 및 기록 섹션 */}
        <div className="mb-24 fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-12">
            <div>
              <h2 className="text-4xl font-black mb-3 tracking-tighter">히스토리 및 기록</h2>
              <p className="text-gray-400 font-bold text-lg">과거의 인지 재구성 및 심리 진단 기록입니다.</p>
            </div>
            <div className="flex gap-4">
              <div className="relative">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" />
                <input 
                  type="text" 
                  value={historySearch}
                  onChange={(e) => setHistorySearch(e.target.value)}
                  placeholder="기록 검색..." 
                  className="bg-white px-14 py-4 rounded-2xl text-sm font-bold outline-none border border-[#e8e0d5] focus:ring-4 focus:ring-[#566e63]/5 w-[280px] shadow-sm transition-all" 
                />
              </div>
              <button className="bg-white w-14 h-14 border border-[#e8e0d5] shadow-sm rounded-2xl flex items-center justify-center text-gray-400 hover:bg-[#566e63] hover:text-white transition-all active:scale-95">
                <Filter size={20} />
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {history
              .filter(log => log.summary.includes(historySearch) || log.type.includes(historySearch))
              .map((log: HistoryLog) => (
              <div 
                key={log.id} 
                onClick={() => log.isAssessment && router.push(`/result?id=${log.id.toString().replace('csei-', '')}`)}
                className={`bg-white rounded-[40px] p-8 shadow-sm border border-[#e8e0d5] hover:shadow-2xl hover:-translate-y-2 transition-all cursor-pointer group flex flex-col h-full ${log.isAssessment ? 'relative ring-2 ring-[#566e63]/5' : ''}`}
              >
                <div className="flex justify-between items-center mb-8">
                  <span className={`text-[9px] font-black px-4 py-2 rounded-full tracking-widest uppercase ${log.isAssessment ? 'bg-[#566e63] text-white' : 'bg-gray-100 text-gray-400'}`}>
                    {log.date}
                  </span>
                  <div className="p-2 bg-gray-50 rounded-xl group-hover:scale-110 transition-transform">
                    {log.sentiment === 'positive' && <Smile size={24} className="text-green-500" />}
                    {log.sentiment === 'neutral' && <Meh size={24} className="text-amber-500" />}
                    {log.sentiment === 'negative' && <Frown size={24} className="text-red-500" />}
                  </div>
                </div>
                
                <h3 className="font-black text-xl leading-tight mb-4 flex-1 group-hover:text-[#566e63] transition-colors">
                  {log.type === '7가지 감정 진단 기록' ? '7가지 감정 진단 리포트' : log.type}
                </h3>
                
                <p className="text-sm text-gray-500 font-medium leading-relaxed mb-8 line-clamp-3">
                  {log.summary}
                </p>
                
                <div className="flex justify-between items-center mt-auto border-t border-gray-50 pt-6">
                  <div className="flex gap-2">
                    {log.tags.map((tag: string, idx: number) => (
                      <span key={idx} className="px-3 py-1.5 bg-gray-50 text-gray-400 rounded-lg text-[9px] font-black uppercase tracking-wider group-hover:bg-[#f0f4f1] group-hover:text-[#566e63] transition-colors">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="text-[10px] font-black flex items-center gap-1.5 text-[#566e63] opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                    {log.isAssessment ? '상세 리포트 보기' : '자세히 보기'} <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <button className="bg-white border border-[#e8e0d5] shadow-sm hover:bg-[#faf8f5] text-[#566e63] font-black text-sm px-12 py-5 rounded-2xl transition-all active:scale-95 flex items-center gap-2">
              이전 기록 더 불러오기 <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{__html: `
        .fade-in { animation: fadeIn 1.2s cubic-bezier(0.2, 0, 0.2, 1) forwards; opacity: 0; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        
        @keyframes slideInUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-in {
          animation: slideInUp 0.8s cubic-bezier(0.2, 0, 0.2, 1) forwards;
        }
      `}} />
    </div>
  )
}

export default function MySituationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcfdfc] font-black text-[#566e63] animate-pulse">데이터를 보호하며 불러오는 중...</div>}>
      <MySituationContent />
    </Suspense>
  )
}
              }}
                          activeDot={{r: 10}} 
                          animationDuration={1500} 
                       />
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
