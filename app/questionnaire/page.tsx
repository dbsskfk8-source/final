'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import {
  Bell,
  Settings,
  User,
  ClipboardList,
  Contact,
  BookOpen,
  BarChart2,
  Calendar,
  Info,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { analyzeResults, Gender, AgeGroup } from '@/utils/diagnostics'

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
  const router = useRouter()
  // currentStep -2: Intro, -1: Info input, 0~27: questions
  const [currentStep, setCurrentStep] = useState(-2)
  const [answers, setAnswers] = useState<Record<number, number>>({})
  const [gender, setGender] = useState<Gender | ''>('')
  const [ageGroup, setAgeGroup] = useState<AgeGroup | ''>('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  // Load from local storage
  useEffect(() => {
    const saved = localStorage.getItem('moodb_draft')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.gender) setGender(parsed.gender)
        if (parsed.ageGroup) setAgeGroup(parsed.ageGroup)
        if (parsed.answers) setAnswers(parsed.answers)
        if (parsed.currentStep !== undefined) setCurrentStep(parsed.currentStep)
      } catch (e) {}
    }
  }, [])

  // Auto save
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
    // Automatically proceed to the next step when selected to remove the bug
    setTimeout(() => {
      handleNext(val)
    }, 150) // Slight delay for visual feedback
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

    let saveToLocal = true

    if (user) {
      const { error } = await supabase.from('csei_results').insert([{
        user_id: user.id,
        gender,
        age_group: ageGroup,
        scores: dbScores,
        overall_t_score: overall.tScore,
        overall_group: overall.group,
        created_at: new Date().toISOString()
      }])
      
      if (!error) {
        saveToLocal = false
      }
    }

    if (saveToLocal && typeof window !== 'undefined') {
      const resultData = {
        timestamp: new Date().toISOString(),
        gender,
        ageGroup,
        scores: dbScores,
        overallTScore: overall.tScore,
        overallGroup: overall.group
      }
      const existingResults = JSON.parse(localStorage.getItem('final_csei_results') || '[]')
      const normalizedExisting = Array.isArray(existingResults) ? existingResults : (existingResults.scores ? [existingResults] : [])
      localStorage.setItem('final_csei_results', JSON.stringify([resultData, ...normalizedExisting]))
    }
    
    // Clear draft
    localStorage.removeItem('moodb_draft')
    router.push('/result')
  }

  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  const progress = currentStep < 0 ? 0 : ((currentStep + 1) / QUESTIONS.length) * 100

  return (
    <div className="min-h-screen flex bg-[#faf8f5] text-[#333] font-sans selection:bg-[#bfa588]/20">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#fdfbf7] border-r border-[#e8e0d5] fixed h-full z-20 overflow-y-auto">
        <div className="p-8">
          <Link href="/" className="font-extrabold text-[#bfa588] text-3xl block hover:opacity-80 transition-opacity">
            MoodB
          </Link>
          <div className="text-[10px] uppercase font-bold text-[#8c7b68] tracking-widest mt-1">임상 진단 도구</div>
        </div>
        
        <nav className="flex-1 mt-4">
          <ul className="space-y-1">
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 bg-white border-l-[3px] border-[#bfa588] text-[#222] font-bold shadow-sm">
                <ClipboardList size={20} className="text-[#bfa588]" />
                설문 진행 (진단)
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f5ebd9] transition-colors font-medium border-l-[3px] border-transparent">
                <Contact size={20} />
                내 정보
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f5ebd9] transition-colors font-medium border-l-[3px] border-transparent">
                <BookOpen size={20} />
                진단 안내
              </Link>
            </li>
            <li>
              <Link href="/my-situation" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f5ebd9] transition-colors font-medium border-l-[3px] border-transparent">
                <BarChart2 size={20} />
                결과 리포트
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col relative pb-[120px] min-h-screen">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#e8e0d5] px-6 lg:px-10 py-5 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="lg:hidden font-extrabold text-[#bfa588] text-3xl">MoodB</h1>
            <nav className="flex gap-4 md:gap-6 text-sm font-bold text-gray-500 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 whitespace-nowrap">
               <span className="text-[#bfa588] border-b-2 border-[#bfa588] pb-1 cursor-default shrink-0">칠정 진단</span>
               <Link href="/select" className="hover:text-black cursor-pointer transition-colors shrink-0 pt-0.5">인지재구성(Cure)</Link>
               <Link href="/my-situation" className="hover:text-[#bfa588] cursor-pointer transition-colors shrink-0 pt-0.5">마이페이지</Link>
               <Link href="/chat" className="hover:text-black cursor-pointer transition-colors shrink-0 pt-0.5">심리상담 챗봇</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 text-gray-500">
             <button className="w-10 h-10 rounded-full hover:bg-[#f5ebd9] flex items-center justify-center transition-colors">
                <Bell size={18} />
             </button>
             <button className="w-10 h-10 rounded-full hover:bg-[#f5ebd9] flex items-center justify-center transition-colors">
                <Settings size={18} />
             </button>
             <div className="w-9 h-9 rounded-full bg-[#a68a6d] overflow-hidden ml-2 ring-2 ring-white shadow-sm flex items-center justify-center text-white">
                <User size={18} />
             </div>
          </div>
        </header>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-[#e8e0d5]">
          <div 
            className="h-full bg-[#bfa588] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Content Body */}
        <main className="flex-1 flex flex-col px-6 lg:px-10 py-10 max-w-[800px] w-full mx-auto justify-center">
          
          {currentStep === -2 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-2xl mx-auto w-full bg-white rounded-3xl p-8 shadow-sm border border-[#e8e0d5]">
              <div className="mb-8">
                <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-[#222]">
                  핵심칠정척도 단축형 (CSEI-s)
                </h2>
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
                  본 진단은 28문항에 걸쳐 사용자의 '7가지 핵심 감정(기쁨, 분노, 우울, 생각, 슬픔, 두려움, 놀람)' 밸런스를 측정하여 다차원적인 심리/정서적 상태를 도출합니다. 진단 이후 맞춤형 인지재구성(CBT) 챗봇과 명상 솔루션을 제공받을 수 있습니다.
                </p>
              </div>
            </div>
          ) : currentStep === -1 ? (
             <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-xl mx-auto w-full">
                <div className="mb-10 text-center">
                  <h2 className="text-3xl font-extrabold tracking-tight mb-4 text-[#222]">진단 준비</h2>
                  <p className="text-gray-500 font-medium text-base leading-relaxed break-keep">
                    정교한 분석을 위해 기기 연동에 사용할 최소한의 성별과 연령대 정보를 입력해 주세요.
                  </p>
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
                  <h2 className="text-3xl md:text-5xl font-extrabold text-[#222] leading-tight break-keep">
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
        <div className="fixed bottom-0 left-0 lg:left-[260px] right-0 bg-[#f3ede1] border-t border-[#e8e0d5] p-5 z-30 flex items-center justify-between shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
           <button 
             onClick={handlePrev}
             disabled={currentStep === -2}
             className={`flex items-center gap-2 font-bold px-6 py-3 rounded-xl transition-all ${currentStep === -2 ? 'opacity-30 cursor-not-allowed text-gray-500' : 'bg-white text-[#222] hover:bg-[#f5ebd9] shadow-sm'}`}
           >
             <ArrowLeft size={18} />
             이전
           </button>
           
           <button 
             onClick={() => handleNext()}
             disabled={isSubmitting}
             className={`flex items-center gap-2 font-bold px-8 py-3 rounded-xl transition-all shadow-md ${isSubmitting ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-[#bfa588] hover:bg-[#ab8f70] text-white'}`}
           >
             {isSubmitting ? '저장 중...' : currentStep === -2 ? '시작하기' : currentStep >= QUESTIONS.length - 1 ? '완료하기' : '다음'}
             {!isSubmitting && currentStep < QUESTIONS.length - 1 && <ArrowRight size={18} />}
           </button>
        </div>
      </div>
    </div>
  )
}
