'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Bell,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle2,
  Clock,
  LayoutGrid,
  Heart,
  Brain,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Activity,
  User,
  ShieldCheck,
  Star,
  Settings,
  ClipboardList,
  Contact,
  BookOpen,
  BarChart2,
  Calendar
} from 'lucide-react'
import { analyzeResults, Gender, AgeGroup } from '@/utils/diagnostics'
import Navbar from '../components/Navbar'

const QUESTIONS = [
  "내게 좋은 일이 생길 것 같다.",
  "나는 주변 사람들에게 화를 잘 낸다.",
  "나는 생각이 많다.",
  "나는 아무 일도 하고 싶은 의욕이 없다.",
  "나는 서글플 때가 있다.",
  "나는 간이 작은 것 같다.",
  "나는 깜짝깜짝 놀랜다.",
  "나는 기분이 들뜬다.",
  "나는 다른 사람보다 화를 자주 낸다.",
  "나는 고민거리가 많다.",
  "내 미래는 어두울 것 같다.",
  "나는 구슬플 때가 있다.",
  "나는 쉽게 당황한다.",
  "나는 잘 놀랜다.",
  "나는 활기차다.",
  "나도 모르게 불끈 성을 낸다.",
  "나는 걱정을 많이 한다.",
  "나는 만사가 귀찮다.",
  "나는 슬플 때가 있다.",
  "나는 낯선 사람이 두렵다.",
  "나는 놀라서 소스라치곤 한다.",
  "내 삶은 만족스럽다.",
  "내 주변에는 나를 화나게 하는 게 많다.",
  "나는 반복적으로 떠오르는 생각을 지우기가 어렵다.",
  "내 미래는 희망이 없을 것 같다.",
  "나는 외롭다.",
  "나는 여러 사람 앞에 나가 이야기하는 것이 어렵다.",
  "나는 작은 소리에도 잘 놀란다.",
]

export default function QuestionnairePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#faf8f5]"><div className="animate-spin w-10 h-10 border-4 border-[#bfa588] border-t-transparent rounded-full" /></div>}>
      <QuestionnaireContent />
    </Suspense>
  )
}

function QuestionnaireContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const mode = searchParams.get('mode')
  const emotionParam = searchParams.get('emotion')

  const [currentStep, setCurrentStep] = useState(-2)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [gender, setGender] = useState<Gender | ''>('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  // 로그인 유저라면 프로필에서 성별/생년월일 자동입력
  useEffect(() => {
    async function loadProfile() {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('gender, birthdate')
            .eq('id', user.id)
            .single()
          if (profile) {
            if (profile.gender) setGender(profile.gender as Gender)
            if (profile.birthdate) {
              const birth = new Date(profile.birthdate)
              const age = new Date().getFullYear() - birth.getFullYear()
              if (age < 30) setAgeGroup('20s')
              else if (age < 40) setAgeGroup('30s')
              else if (age < 50) setAgeGroup('40s')
              else setAgeGroup('50s_plus')
              setAutoFilled(true)
            }
          }
        }
      } catch (e) {}
    }
    loadProfile()
  }, [])

  useEffect(() => {
    const saved = localStorage.getItem('moodb_draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // 자동입력된 경우 draft의 gender/ageGroup 덮어쓰지 않음
        if (!autoFilled) {
          if (parsed.gender) setGender(parsed.gender)
          if (parsed.ageGroup) setAgeGroup(parsed.ageGroup)
        }
        if (parsed.answers) setAnswers(parsed.answers)
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep)
      } catch (e) {}
    }
  }, [autoFilled])

  useEffect(() => {
    localStorage.setItem('moodb_draft', JSON.stringify({ gender, ageGroup, answers, currentStep }))
  }, [gender, ageGroup, answers, currentStep])

  const handleNext = (manualAnswer?: number) => {
    if (currentStep === -2) {
      setCurrentStep(-1)
    } else if (currentStep === -1) {
      if (!gender || !ageGroup) {
        alert('성별과 연령대를 먼저 선택해 주세요.')
        return
      }
      setCurrentStep(0)
    } else {
      if (manualAnswer === undefined && !answers[currentStep]) {
        alert('답변을 선택해 주세요.')
        return
      }
      if (currentStep < QUESTIONS.length - 1) {
        setCurrentStep(prev => prev + 1)
      } else {
        setIsSubmitting(true)
        handleComplete(manualAnswer)
      }
    }
  }

  const handlePrev = () => {
    if (currentStep > -2) setCurrentStep(prev => prev - 1)
  }

  const handleAnswerChange = (val: number) => {
    setAnswers(prev => ({ ...prev, [currentStep]: val }))
    setTimeout(() => {
      handleNext(val)
    }, 150)
  }

  const handleComplete = async (finalAnswerContext?: number) => {
    const finalAnswers = { ...answers, ...(finalAnswerContext !== undefined ? { [currentStep]: finalAnswerContext } : {}) }
    const { factors, overall } = analyzeResults(finalAnswers, gender as Gender, ageGroup as AgeGroup)
    
    const dbScores = factors.map(f => ({
      subject: f.name,
      A: f.tScore,
      fullMark: 100,
      group: f.group,
      groupLabel: f.groupLabel,
      rawScore: f.rawScore
    }))

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    let existingResults: any = []
    try {
      const stored = localStorage.getItem('final_csei_results')
      if (stored) existingResults = JSON.parse(stored)
    } catch (e) {}

    if (user) {
      await supabase.from('csei_results').insert([{
        user_id: user.id,
        gender,
        age_group: ageGroup,
        scores: dbScores,
        overall_t_score: overall.tScore,
        overall_group: overall.group,
        created_at: new Date().toISOString()
      }])
    }

    const resultData: any = {
      timestamp: new Date().toISOString(),
      gender,
      ageGroup,
      scores: dbScores,
      overallTScore: overall.tScore,
      overallGroup: overall.group,
    }

    if (mode === 'post') {
      resultData.isPostMeditation = true
      resultData.relatedEmotion = emotionParam
      const normalizedExisting = Array.isArray(existingResults) ? existingResults : (existingResults.scores ? [existingResults] : [])
      const preResult = normalizedExisting.find((r: any) => !r.isPostMeditation)
      if (preResult) {
         resultData.relatedPreTimestamp = preResult.timestamp
      }
    }

    const normalizedExisting = Array.isArray(existingResults) ? existingResults : (existingResults.scores ? [existingResults] : [])
    localStorage.setItem('final_csei_results', JSON.stringify([resultData, ...normalizedExisting]))
    
    localStorage.removeItem('moodb_draft')
    router.push(mode === 'post' ? '/result?isPost=true' : '/result')
  }

  const progress = currentStep < 0 ? 0 : ((currentStep + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans pb-20 overflow-x-hidden">
      <Navbar />

      <main className="max-w-[800px] mx-auto px-6 pt-12">
        {currentStep === -2 ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8">
              <h1 className="text-4xl sm:text-7xl font-black text-[#566e63] tracking-tighter leading-[1.1] mb-8">
                당신의 마음을<br/>가장 잘 아는<br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#566e63] to-[#bfa588]">7가지 감정 프로파일</span>
              </h1>
              <div className="w-12 h-1 bg-[#bfa588] rounded-full mb-6"></div>
              <p className="text-[#8c7b68] text-base leading-relaxed font-medium mb-4">
                다음 문장들을 읽고 <strong className="text-[#a68a6d]">최근 일주일동안(오늘을 포함해서)</strong> 자신을 가장 잘 나타낸다고 생각하는 곳에 선택해 주십시오. 
              </p>
              <p className="text-[#8c7b68] text-base leading-relaxed font-medium">
                너무 오래 곰곰이 생각하기보다는 질문을 읽고 바로 떠오르는 첫인상으로 응답하시기 바랍니다.
              </p>
            </div>
            <div className="bg-[#fcfaf5] rounded-2xl p-6 border border-[#f5ebd9]">
              <h3 className="font-extrabold text-[#a68a6d] mb-2 flex items-center gap-2">
                <BookOpen size={18} /> MoodB 임상 진단 시스템 안내
              </h3>
              <p className="text-sm text-[#bfa588] leading-relaxed">
                본 진단은 28문항에 걸쳐 사용자의 '7가지 감정(기쁨, 분노, 우울, 생각, 슬픔, 두려움, 놀람)' 밸런스를 측정하여 다차원적인 심리/정서적 상태를 도출합니다.
              </p>
            </div>
          {/* 시작 화면 */}
      {currentStep === -2 && (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 animate-in fade-in zoom-in duration-700">
           <div className="w-24 h-24 bg-[#566e63] rounded-[32px] flex items-center justify-center mb-8 shadow-2xl shadow-[#566e63]/20">
              <ClipboardList size={40} className="text-white" />
           </div>
           <h2 className="text-3xl md:text-4xl font-black text-[#222] mb-4 tracking-tight">마음 진단 시작하기</h2>
           <p className="text-gray-500 font-medium mb-12 max-w-sm leading-relaxed">
             당신의 현재 심리 상태를 정확히 분석하여<br />
             개인 맞춤형 치유 솔루션을 제안해 드립니다.
           </p>
           <button 
             onClick={() => handleNext()}
             className="w-full max-w-[280px] bg-[#566e63] text-white py-5 rounded-3xl font-black text-lg shadow-xl shadow-[#566e63]/30 hover:bg-[#4a5c53] hover:scale-105 transition-all flex items-center justify-center gap-3 group"
           >
             검사 시작하기
             <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
           </button>
           <div className="mt-8 flex items-center gap-6 text-gray-400">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                 <Clock size={14} /> 약 3분 소요
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold">
                 <ShieldCheck size={14} /> 철저한 익명 보장
              </div>
           </div>
        </div>
      )}
             </div>
        ) : currentStep === -1 ? (
           <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="mb-10 text-center">
                <h2 className="text-3xl font-bold text-[#222] mb-4">진단 준비</h2>
                 <p className="text-gray-500 font-medium">정교한 분석을 위해 최소한의 정보를 입력해 주세요.</p>
                 {autoFilled && (
                   <div className="mt-3 inline-flex items-center gap-2 bg-green-50 text-green-700 text-xs font-bold px-4 py-2 rounded-full border border-green-200">
                     ✅ 프로필 기본정보가 자동으로 입력되었습니다. 확인 후 다음을 눌러주세요.
                   </div>
                 )}
               </div>
              <div className="bg-white rounded-2xl p-8 shadow-sm border border-[#e8e0d5]">
                <div className="mb-8">
                  <label className="text-xs font-bold text-[#bfa588] uppercase tracking-widest mb-3 block">성별 선택</label>
                  <div className="flex gap-3">
                    {([['male', '남성'], ['female', '여성']] as const).map(([val, label]) => (
                      <button
                        key={val}
                        onClick={() => setGender(val)}
                        className={`flex-1 py-4 rounded-xl font-bold text-base transition-all ${gender === val ? 'bg-[#bfa588] text-white shadow-md' : 'bg-[#faf8f5] border border-[#e8e0d5] text-gray-600 hover:bg-[#f5ebd9]'}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#bfa588] uppercase tracking-widest mb-3 block">연령대 선택</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['20s', '30s', '40s', '50s_plus'] as const).map((val) => (
                      <button
                        key={val}
                        onClick={() => setAgeGroup(val)}
                        className={`py-4 rounded-xl font-bold text-base transition-all ${ageGroup === val ? 'bg-[#bfa588] text-white shadow-md' : 'bg-[#faf8f5] border border-[#e8e0d5] text-gray-600 hover:bg-[#f5ebd9]'}`}
                      >
                        {val === '50s_plus' ? '50대 이상' : val.replace('s', '대')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
           </div>
        ) : (
           <div key={currentStep} className="animate-in fade-in slide-in-from-right-8 duration-300">
              <div className="mb-12">
                <span className="text-sm font-bold text-[#bfa588] bg-[#f5ebd9] px-3 py-1 rounded-full inline-block mb-6 tracking-widest">
                  문항 {currentStep + 1} / {QUESTIONS.length}
                </span>
                <h2 className="text-2xl sm:text-3xl md:text-5xl font-extrabold text-[#222] leading-tight break-keep">
                  {QUESTIONS[currentStep]}
                </h2>
              </div>

              <div className="flex flex-col gap-3">
                {[
                  { val: 1, label: '전혀 아니다' },
                  { val: 2, label: '약간 그렇다' },
                  { val: 3, label: '웬만큼 그렇다' },
                  { val: 4, label: '꽤 그렇다' },
                  { val: 5, label: '매우 그렇다' }
                ].map((item) => {
                  const isSelected = answers[currentStep] === item.val
                  return (
                    <button
                      key={item.val}
                      onClick={() => handleAnswerChange(item.val)}
                      className={`w-full text-left px-8 py-5 rounded-2xl font-bold text-base flex items-center gap-2 transition-all border-2 ${
                        isSelected ? 'border-[#bfa588] bg-[#fcfaf5] text-[#bfa588]' : 'border-transparent bg-white text-[#222] shadow-sm hover:border-[#bfa588]/50'
                      }`}
                    >
                      <span className="inline-block w-8 font-extrabold text-gray-400">{item.val}</span>
                      {item.label}
                    </button>
                  )
                })}
              </div>
           </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#f3ede1] border-t border-[#e8e0d5] p-5 z-30 flex items-center justify-center gap-4 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
         {currentStep !== -2 && (
           <button 
             onClick={handlePrev}
             disabled={currentStep === -2}
             className="flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all bg-white text-[#222] hover:bg-[#f5ebd9] shadow-sm"
           >
             <ArrowLeft size={18} />
             이전
           </button>
         )}
         
         <button 
           onClick={() => handleNext()}
           disabled={isSubmitting}
           className={`flex items-center gap-2 font-bold px-10 py-3 rounded-xl transition-all shadow-md text-lg ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#bfa588] hover:bg-[#ab8f70] text-white'}`}
         >
           {isSubmitting ? '저장 중...' : currentStep === -2 ? '시작하기 →' : currentStep >= QUESTIONS.length - 1 ? '완료하기' : '다음'}
           {!isSubmitting && currentStep >= 0 && currentStep < QUESTIONS.length - 1 && <ArrowRight size={18} />}
         </button>
      </div>
    </div>
  )
}
