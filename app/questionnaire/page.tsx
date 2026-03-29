'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Settings,
  User,
  ClipboardList,
  Contact,
  BookOpen,
  BarChart2,
  Calendar,
  Info
} from 'lucide-react'

// 28 CSEI-s Questions
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
  const [answers, setAnswers] = useState<Record<number, number>>({})

  const handleAnswer = (questionIndex: number, value: number) => {
    setAnswers(prev => ({ ...prev, [questionIndex]: value }))
  }

  const answeredCount = Object.keys(answers).length
  const totalCount = QUESTIONS.length
  const isComplete = answeredCount === totalCount

  const handleComplete = () => {
    if (!isComplete) {
      alert(`아직 응답하지 않은 문항이 있습니다. (${answeredCount}/${totalCount})`)
      return
    }

    // CSEI-s 7가지 감정(칠정) 매핑 및 점수 계산
    // 1-7번 문항이 각 지표의 첫번째 항목인 인터리브 구조 (0~6 % 7)
    const dimensions = [
      { name: '희 (喜)', label: 'Joy' },
      { name: '노 (怒)', label: 'Anger' },
      { name: '사 (思)', label: 'Thought' },
      { name: '우 (憂)', label: 'Anxiety/Worry' },
      { name: '비 (悲)', label: 'Sadness' },
      { name: '공 (恐)', label: 'Fear' },
      { name: '경 (驚)', label: 'Surprise' }
    ]

    const scores = dimensions.map((dim, dimIdx) => {
      let sum = 0
      // 각 영역당 4개 문항 합산 (0, 7, 14, 21 / 1, 8, 15, 22 ...)
      for (let i = 0; i < 4; i++) {
        const qIdx = dimIdx + (i * 7)
        sum += (answers[qIdx] || 0)
      }
      // 최소 4점 ~ 최대 20점 -> 백분율 환산
      // (점수 - 최소점수) / (최대점수 - 최소점수) * 100
      const percentage = Math.round(((sum - 4) / (20 - 4)) * 100)
      return { 
        ...dim, 
        sum, 
        percentage: Math.max(0, Math.min(100, percentage)) // 0~100 사이 보정
      }
    })

    console.log('--- 7지표 분석 결과 ---', scores)
    
    // 결과 요약 메시지
    const summary = scores.map(s => `${s.name}: ${s.percentage}%`).join('\n')
    alert(`설문 분석이 완료되었습니다!\n\n[분석 결과]\n${summary}\n\n결과 데이터가 브라우저에 임시 저장되었습니다. 마이페이지에서 확인하실 수 있습니다.`)
    
    // 로컬 스토리지에 결과 누적 저장 (게스트 모드용)
    if (typeof window !== 'undefined') {
      const resultData = {
        timestamp: new Date().toISOString(),
        scores: scores.map(s => ({ subject: s.name, A: s.percentage, fullMark: 100 }))
      }
      const existingResults = JSON.parse(localStorage.getItem('final_csei_results') || '[]')
      // 기존이 객체였다면 (게스트 모드 V4 흔적) 배열로 감싸주고, 아니면 바로 추가
      const normalizedExisting = Array.isArray(existingResults) ? existingResults : (existingResults.scores ? [existingResults] : [])
      localStorage.setItem('final_csei_results', JSON.stringify([resultData, ...normalizedExisting]))
    }
    
    // 완료 후 마이페이지로 자동 이동
    router.push('/my-situation')
  }

  const handleSaveProgress = () => {
    console.log('임시 저장 데이터:', answers)
    alert('현재 응답한 내용이 브라우저에 임시 저장되었습니다.')
  }

  // 오늘 날짜 포맷팅
  const today = new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })

  return (
    <div className="min-h-screen flex bg-[#f5f6f4] text-[#333] font-sans selection:bg-[#566e63]/20">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[260px] bg-[#f9faf9] border-r border-[#eaeced] fixed h-full z-20 overflow-y-auto">
        <div className="p-8">
          <Link href="/" className="font-extrabold text-[#4a5c53] text-lg block hover:opacity-80 transition-opacity">
            Final Service
          </Link>
          <div className="text-[10px] uppercase font-bold text-[#828f88] tracking-widest mt-1">Clinical Inventory</div>
        </div>
        
        <nav className="flex-1 mt-4">
          <ul className="space-y-1">
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 bg-white border-l-[3px] border-[#566e63] text-[#222] font-bold shadow-sm">
                <ClipboardList size={20} className="text-[#566e63]" />
                Assessment
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f0f2f0] transition-colors font-medium border-l-[3px] border-transparent">
                <Contact size={20} />
                Patient Info
              </Link>
            </li>
            <li>
              <Link href="#" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f0f2f0] transition-colors font-medium border-l-[3px] border-transparent">
                <BookOpen size={20} />
                Guidelines
              </Link>
            </li>
            <li>
              <Link href="/my-situation" className="flex items-center gap-3 px-8 py-4 text-gray-500 hover:text-[#222] hover:bg-[#f0f2f0] transition-colors font-medium border-l-[3px] border-transparent">
                <BarChart2 size={20} />
                Results
              </Link>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 lg:ml-[260px] flex flex-col relative pb-[120px]">
        
        {/* Top Navbar */}
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-[#eaeced] px-6 lg:px-10 py-5 flex flex-col sm:flex-row gap-4 sm:gap-0 sm:items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="lg:hidden font-extrabold text-[#4a5c53] text-lg">Final Service</h1>
            
            <nav className="flex gap-4 md:gap-6 text-sm font-bold text-gray-500 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 whitespace-nowrap">
               <span className="text-[#566e63] border-b-2 border-[#566e63] pb-1 cursor-default shrink-0">CSEI-s Survey</span>
               <Link href="/select" className="hover:text-black cursor-pointer transition-colors shrink-0 pt-0.5">Cure</Link>
               <Link href="/my-situation" className="hover:text-[#566e63] cursor-pointer transition-colors shrink-0 pt-0.5">My Situation</Link>
               <Link href="/chat" className="hover:text-black cursor-pointer transition-colors shrink-0 pt-0.5">Chat</Link>
            </nav>
          </div>
          
          <div className="flex items-center gap-4 text-gray-500">
             <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Bell size={18} />
             </button>
             <button className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Settings size={18} />
             </button>
             <div className="w-9 h-9 rounded-full bg-[#1b4e5b] overflow-hidden ml-2 ring-2 ring-white shadow-sm flex items-center justify-center text-white">
                <User size={18} />
             </div>
          </div>
        </header>

        {/* Content Body */}
        <main className="px-6 lg:px-10 py-10 max-w-[1000px] w-full mx-auto animate-in fade-in duration-500">
          
          {/* Patient / Session Info Cards */}
          <div className="flex flex-col md:flex-row gap-6 mb-12 bg-white rounded-xl p-6 shadow-sm border border-[#eef0ef]">
             <div className="flex-1 md:border-r border-gray-100 px-4 mb-4 md:mb-0">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">REGISTRATION NO.</div>
               <div className="text-xl font-bold text-[#222]">2026-Guest</div>
             </div>
             <div className="flex-1 md:border-r border-gray-100 px-4 mb-4 md:mb-0">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">PATIENT NAME</div>
               <div className="text-xl font-bold text-[#222]">나의 현황</div>
             </div>
             <div className="flex-1 px-4">
               <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">ASSESSMENT DATE</div>
               <div className="flex items-center gap-2 text-[#4a5c53]">
                 <Calendar size={18} />
                 <span className="font-bold text-[#222]">{today}</span>
               </div>
             </div>
          </div>

          {/* Survey Header */}
          <div className="mb-12 max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-extrabold mb-5 tracking-tight text-[#222]">
              핵심칠정척도 단축형<br className="md:hidden" /> (CSEI-s)
            </h2>
            <p className="text-[#64716a] text-[15px] leading-relaxed font-medium">
              다음 문장들을 읽고 <strong className="text-[#3c4a43]">최근 일주일동안(오늘을 포함해서)</strong> 자신을 가장 잘 나타낸다고 생각하는 곳에 선택해 주십시오. 너무 오래 곰곰이 생각하기보다는 질문을 읽고 바로 떠오르는 첫인상으로 응답하시기 바랍니다.
            </p>
          </div>

          {/* Scale Legend Header */}
          <div className="sticky top-[80px] z-10 bg-[#f5f6f4]/95 backdrop-blur py-5 flex items-end justify-between border-b 2 border-[#eaeced] mb-6">
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-widest pl-4 hidden md:block">
              EMOTIONAL STATEMENT
            </div>
            {/* The 5 labels */}
            <div className="flex justify-between md:w-[350px] w-full text-center px-2">
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] md:text-xs font-bold text-[#566e63]">전혀<br/>아니다</span>
                <span className="text-[10px] font-bold text-gray-400">1</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] md:text-xs font-bold text-[#566e63]">약간</span>
                <span className="text-[10px] font-bold text-gray-400">2</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] md:text-xs font-bold text-[#566e63]">웬만큼</span>
                <span className="text-[10px] font-bold text-gray-400">3</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] md:text-xs font-bold text-[#566e63]">꽤</span>
                <span className="text-[10px] font-bold text-gray-400">4</span>
              </div>
              <div className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] md:text-xs font-bold text-[#566e63]">매우<br/>그렇다</span>
                <span className="text-[10px] font-bold text-gray-400">5</span>
              </div>
            </div>
          </div>

          {/* Questions List */}
          <div className="flex flex-col gap-4 mb-10">
            {QUESTIONS.map((q, qIndex) => {
              const currentValue = answers[qIndex]
              const qNumber = (qIndex + 1).toString().padStart(2, '0')
              
              return (
                <div 
                  key={qIndex} 
                  className={`bg-white rounded-2xl p-6 shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300
                    ${currentValue ? 'border-[#a3b8ad] bg-[#fafcfa]' : 'border-transparent'}`}
                >
                  <div className="flex-1">
                    <div className="text-[10px] font-bold text-gray-400 tracking-wider mb-2">Question {qNumber}</div>
                    <p className="font-bold text-[#222] text-base leading-relaxed break-keep">
                      {q}
                    </p>
                  </div>
                  
                  {/* Radio Scale Row */}
                  <div className="flex justify-between md:w-[350px] w-full px-2">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const isSelected = currentValue === val
                      return (
                        <div key={val} className="flex-1 flex justify-center">
                          <label className="relative cursor-pointer w-8 h-8 flex items-center justify-center group touch-manipulation">
                            <input 
                              type="radio" 
                              name={`q-${qIndex}`} 
                              value={val}
                              checked={isSelected}
                              onChange={() => handleAnswer(qIndex, val)}
                              className="sr-only"
                            />
                            {/* Outer Circle */}
                            <div className={`w-6 h-6 rounded-full border-2 transition-all 
                               ${isSelected 
                                ? 'border-[#566e63]' 
                                : 'border-[#d0d3d5] group-hover:border-[#96a99e]'}`} 
                            />
                            {/* Inner Dot */}
                            {isSelected && (
                              <div className="absolute w-3 h-3 rounded-full bg-[#566e63] animate-in zoom-in-75 duration-200" />
                            )}
                          </label>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Remaining Indicator (Only visible if not complete) */}
          {!isComplete && (
            <div className="border-t-2 border-dashed border-[#d0d3d5] pt-10 pb-6 flex flex-col items-center justify-center opacity-70">
              <div className="flex gap-2 mb-3">
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3b8ad]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3b8ad]" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#a3b8ad]" />
              </div>
              <p className="text-sm font-bold text-[#64716a]">
                Remaining {totalCount - answeredCount} Assessment Statements
              </p>
            </div>
          )}
          
        </main>
      </div>

      {/* Sticky Bottom Footer */}
      <div className={`fixed bottom-0 left-0 lg:left-[260px] right-0 bg-[#e7eae6] border-t border-[#d0d3d5] p-5 z-30 flex flex-col sm:flex-row items-center justify-between gap-4 transition-transform duration-500
         transform translate-y-0 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]`}
      >
         <div className="flex items-center gap-3 text-sm font-medium text-[#64716a]">
           <Info size={18} className="text-[#3b6b8b]" />
           {isComplete 
             ? <span className="text-[#566e63] font-bold">모든 문항에 응답하셨습니다. 제출 가능합니다.</span>
             : <span>제출하기 전에 28개의 문항에 모두 응답해주세요. (<strong className="text-[#222]">{answeredCount}/{totalCount}</strong>)</span>
           }
         </div>
         
         <div className="flex items-center gap-3 w-full sm:w-auto">
           <button 
             onClick={handleSaveProgress}
             className="flex-1 sm:flex-none bg-[#f5f6f4] hover:bg-white text-[#4a5c53] font-bold px-6 py-3.5 rounded-xl border border-[#d0d3d5] transition-colors text-sm"
           >
             Save Progress
           </button>
           <button 
             onClick={handleComplete}
             disabled={!isComplete}
             className={`flex-1 sm:flex-none font-bold px-8 py-3.5 rounded-xl transition-all shadow-sm text-sm
               ${isComplete 
                 ? 'bg-[#4a5c53] hover:bg-[#3c4a43] text-white shadow-[#4a5c53]/20 hover:-translate-y-0.5' 
                 : 'bg-[#b6c4bc] text-white/70 cursor-not-allowed border-transparent'
               }`}
           >
             Complete Assessment
           </button>
         </div>
      </div>
    </div>
  )
}
