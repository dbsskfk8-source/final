'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, RotateCcw, Sparkles, Heart, Zap, Target, CheckCircle2, Brain, AlertCircle, Activity } from 'lucide-react'

// --- Types ---
type Stage = 'input' | 'loading' | 'result' | 'completed'
type RefineMode = 'empathy' | 'actionability' | 'specificity'

interface ReframeCard {
  icon: string
  title: string
  text: string
}

interface SimilarCase {
  id: number
  situationThought: string
  reframe: string
  traps: string
}

interface ThinkingTrapItem {
  name: string
  description: string
}

// --- Icon map ---
const ICON_MAP: Record<string, React.ReactNode> = {
  perspective: <Sparkles size={22} />,
  balance: <Target size={22} />,
  action: <Zap size={22} />,
}

const REFINE_BUTTONS: { mode: RefineMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'empathy', label: '💙 더 공감되게', icon: <Heart size={16} /> },
  { mode: 'actionability', label: '⚡ 더 실행력 있게', icon: <Zap size={16} /> },
  { mode: 'specificity', label: '🔍 더 구체적으로', icon: <Target size={16} /> },
]

// --- Text Formatting Helpers ---
const parseBold = (text: string) => {
  const boldRegex = /\*\*(.*?)\*\*/g;
  const parts = text.split(boldRegex);
  return parts.map((part, index) => {
    // 홀수 인덱스는 **로 감싸여 있던 부분
    if (index % 2 === 1) {
      return <strong key={index} className="font-black text-[#222]">{part}</strong>;
    }
    return part;
  });
};

const formatReframeText = (text: string) => {
  // 숫자로 시작하는 리스트 항목 분리 (예: "1. ", "2. ")
  const regex = /(\d+\.\s+)/g;
  const parts = text.split(regex);
  
  if (parts.length <= 1) {
    // 리스트 형태가 아니면 기본 파싱해서 반환
    return <p className="text-[15px] leading-loose text-gray-900 font-medium whitespace-pre-wrap">{parseBold(text)}</p>;
  }

  const elements: React.ReactNode[] = [];
  let introText = parts[0];
  if (introText.trim()) {
    elements.push(<p key="intro" className="text-[15px] leading-loose text-gray-900 font-medium mb-4">{parseBold(introText)}</p>);
  }

  for (let i = 1; i < parts.length; i += 2) {
    const numberStr = parts[i];
    const contentStr = parts[i + 1] || '';
    elements.push(
      <div key={i} className="flex gap-3 mt-3 mb-2">
        <span className="font-bold text-[#566e63] shrink-0 mt-0.5">{numberStr.trim()}</span>
        <span className="text-[15px] leading-loose text-gray-900 font-medium">{parseBold(contentStr)}</span>
      </div>
    );
  }
  return <div className="flex flex-col">{elements}</div>;
};

export default function CurePage() {
  const [stage, setStage] = useState<Stage>('input')
  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [detectedTraps, setDetectedTraps] = useState<ThinkingTrapItem[]>([])
  const [reframes, setReframes] = useState<ReframeCard[]>([])
  const [similarCases, setSimilarCases] = useState<SimilarCase[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null)
  const [error, setError] = useState('')
  const [expandedCase, setExpandedCase] = useState<number | null>(null)
  const [loadingStep, setLoadingStep] = useState<'classify' | 'reframe'>('classify')

  // 분석 시작: classify → reframe 순차 호출
  const handleAnalyze = async () => {
    if (!situation.trim() || !thought.trim()) {
      setError('현재 상황과 내 생각을 모두 입력해주세요.')
      return
    }
    setError('')
    setStage('loading')
    setLoadingStep('classify')

    try {
      const classifyRes = await fetch('/api/classify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thought, situation }),
      })
      const classifyData = await classifyRes.json()
      const traps = classifyData.thinking_traps || []
      setDetectedTraps(traps)

      setLoadingStep('reframe')
      const reframeRes = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, thought }),
      })
      const reframeData = await reframeRes.json()

      if (!reframeData.success) {
        setError(reframeData.error || '분석 중 오류가 발생했습니다.')
        setStage('input')
        return
      }

      setReframes(reframeData.reframes)
      setSimilarCases(reframeData.similarCases || [])
      setSelectedIndex(null)
      setStage('result')
    } catch {
      setError('서버와 통신 중 오류가 발생했습니다.')
      setStage('input')
    }
  }

  // 다듬기
  const handleRefine = async (mode: RefineMode) => {
    if (selectedIndex === null) {
      setError('먼저 마음에 드는 관점을 선택해주세요.')
      return
    }
    setError('')
    setRefiningIndex(selectedIndex)

    try {
      const res = await fetch('/api/reframe/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalText: reframes[selectedIndex].text,
          mode,
          situation,
          thought,
        }),
      })
      const data = await res.json()

      if (data.success) {
        setReframes(prev =>
          prev.map((r, i) =>
            i === selectedIndex ? { ...r, text: data.refinedText } : r
          )
        )
      } else {
        setError(data.error || '다듬기 중 오류가 발생했습니다.')
      }
    } catch {
      setError('다듬기 중 오류가 발생했습니다.')
    } finally {
      setRefiningIndex(null)
    }
  }

  // 저장 및 완료
  const handleSave = () => {
    if (selectedIndex === null) {
      alert('저장할 재구성 관점을 먼저 선택해 주세요.')
      return
    }

    const newLog = {
      id: Date.now(),
      date: new Date().toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' }),
      type: `인지 재구성: ${reframes[selectedIndex].title}`,
      situation,
      thought,
      summary: reframes[selectedIndex].text,
      thinkingTrap: detectedTraps.map(t => t.name).join(', '),
      sentiment: 'positive',
      tags: ['CBT']
    }

    if (typeof window !== 'undefined') {
      const existingHistory = JSON.parse(localStorage.getItem('final_cure_history') || '[]')
      localStorage.setItem('final_cure_history', JSON.stringify([newLog, ...existingHistory]))
    }

    setStage('completed')
  }

  // 다시 시작
  const handleReset = () => {
    setSituation('')
    setThought('')
    setDetectedTraps([])
    setReframes([])
    setSimilarCases([])
    setSelectedIndex(null)
    setError('')
    setStage('input')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#222] font-sans">
      <nav className="px-6 md:px-10 py-6 flex justify-between items-center bg-transparent">
        <Link href="/" className="font-extrabold text-3xl tracking-tight text-[#4a5c53]">MoodB</Link>
        <div className="hidden md:flex gap-10 text-sm font-medium text-gray-600">
          <Link href="/select" className="text-black border-b-2 border-black pb-1">치유 여정(Cure)</Link>
          <Link href="/my-situation" className="hover:text-black">마이페이지</Link>
          <Link href="/chat" className="hover:text-black">상담 챗봇</Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-600 hidden md:block">로그인</Link>
          <Link href="/login" className="bg-[#566e63] text-white px-5 py-2 rounded-full text-sm font-bold">회원가입</Link>
        </div>
      </nav>

      <main className={`mx-auto px-4 md:px-6 py-16 md:py-24 transition-all duration-500 ${stage === 'result' || stage === 'completed' ? 'max-w-5xl' : 'max-w-3xl'}`}>
        {stage !== 'completed' && (
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">인지 재구성</h1>
            <p className="text-gray-500 text-base md:text-lg leading-relaxed">
              지금 마음속에 있는 생각을 새로운 시각으로 바라봐요.<br className="hidden md:block"/>
              현재 상황과 마음속 생각을 적어주세요.
            </p>
          </div>
        )}

        {/* INPUT Stage */}
        {(stage === 'input' || stage === 'loading') && (
          <div className="animate-in fade-in duration-500">
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 text-[#566e63]">
                  <div className="w-8 h-8 rounded-lg bg-[#e8efe9] flex items-center justify-center"><Target size={16} /></div>
                  <h2 className="font-bold text-base">현재 상황</h2>
                </div>
                <p className="text-xs text-gray-600 mb-4">사건이나 상황을 최대한 객관적으로 적어주세요.</p>
                <textarea
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder="예: 오늘 프로젝트 발표에서 상사에게 피드백을 받았어요..."
                  rows={5}
                  disabled={stage === 'loading'}
                  className="w-full bg-[#f8f7f4] rounded-2xl p-4 text-[15px] text-gray-800 resize-none outline-none focus:ring-2 focus:ring-[#566e63]/20 disabled:opacity-60 leading-relaxed"
                />
              </div>
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 text-[#566e63]">
                  <div className="w-8 h-8 rounded-lg bg-[#e8efe9] flex items-center justify-center"><Brain size={16} /></div>
                  <h2 className="font-bold text-base">내 생각</h2>
                </div>
                <p className="text-xs text-gray-600 mb-4">그 상황에서 마음속에 바로 떠오른 생각을 솔직하게 적어주세요.</p>
                <textarea
                  value={thought}
                  onChange={e => setThought(e.target.value)}
                  placeholder="예: 나는 이 일에 소질이 없는 것 같아. 앞으로도 계속 실패할 거야..."
                  rows={5}
                  disabled={stage === 'loading'}
                  className="w-full bg-[#f8f7f4] rounded-2xl p-4 text-[15px] text-gray-800 resize-none outline-none focus:ring-2 focus:ring-[#566e63]/20 disabled:opacity-60 leading-relaxed"
                />
              </div>
            </div>
            {error && <div className="flex items-center gap-2 text-red-500 text-sm mb-6 justify-center"><AlertCircle size={16} />{error}</div>}
            <div className="flex justify-center">
              <button onClick={handleAnalyze} disabled={stage === 'loading'} className="flex items-center gap-3 bg-[#566e63] text-white px-12 py-4 rounded-full text-base font-bold shadow-lg shadow-[#566e63]/30 hover:-translate-y-0.5 hover:bg-[#4a5c53] transition-all disabled:opacity-70">
                {stage === 'loading' ? (
                  <><div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" /><span className="animate-pulse">{loadingStep === 'classify' ? '🔍 사고 패턴 분석 중...' : '✨ 재구성 생성 중...'}</span></>
                ) : (<>분석 시작하기<ArrowRight size={18} /></>)}
              </button>
            </div>
          </div>
        )}

        {/* RESULT Stage */}
        {stage === 'result' && (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">
            {detectedTraps.length > 0 && (
              <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100 mb-8 animate-in fade-in slide-in-from-bottom-3">
                <div className="flex items-center gap-2 mb-4 text-amber-900 font-bold"><Zap size={20} className="text-amber-500" /><span>감지된 사고의 함정</span></div>
                <div className="space-y-3">
                  {detectedTraps.map((trap, idx) => (
                    <div key={idx} className="bg-white/80 p-4 rounded-xl shadow-sm border border-amber-100/50">
                      <div className="text-amber-900 font-bold text-[15px] mb-1">{trap.name}</div>
                      {trap.description && <div className="text-gray-600 text-sm leading-relaxed">{trap.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-center mb-8"><span className="bg-[#e8efe9] text-[#566e63] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">재구성 관점</span></div>
            <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-8">나아갈 방향을 선택해보세요</h2>
            <div className="flex flex-col gap-4 mb-10">
              {reframes.map((card, i) => (
                <div key={i} onClick={() => setSelectedIndex(i)} className={`relative cursor-pointer rounded-3xl border-2 transition-all duration-300 ${selectedIndex === i ? 'border-[#566e63] bg-[#e8efe9] shadow-lg' : 'border-transparent bg-white hover:border-[#566e63]/30 shadow-sm'}`}>
                  <div className="flex flex-col md:flex-row gap-6 p-6 md:p-8">
                    <div className="flex md:flex-col items-center gap-4 md:gap-3 md:w-36 md:shrink-0">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${selectedIndex === i ? 'bg-[#566e63] text-white' : 'bg-gray-100 text-gray-500'}`}>{ICON_MAP[card.icon] || <Sparkles size={22} />}</div>
                      <div className="md:text-center"><p className="text-xs font-bold text-gray-600 uppercase">{card.title}</p></div>
                    </div>
                    <div className="flex-1 md:border-l md:border-gray-100 md:pl-6">{formatReframeText(card.text)}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10 ${selectedIndex !== null ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <h3 className="text-center font-bold text-base mb-6">이 관점을 다듬어볼까요?</h3>
              <div className="flex flex-wrap justify-center gap-3">
                {REFINE_BUTTONS.map(({ mode, label }) => (
                  <button key={mode} onClick={() => handleRefine(mode)} className="bg-[#f8f7f4] hover:bg-[#e8efe9] hover:text-[#566e63] text-gray-600 font-bold text-sm px-7 py-3 rounded-full border border-transparent hover:border-[#566e63]/20 transition-all">{label}</button>
                ))}
              </div>
            </div>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <button onClick={handleReset} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-600 font-medium transition-all order-2 sm:order-1"><RotateCcw size={15} />처음부터 다시 시작하기</button>
              <button onClick={handleSave} disabled={selectedIndex === null} className="order-1 sm:order-2 flex items-center gap-3 bg-[#566e63] text-white px-10 py-4 rounded-full text-base font-bold shadow-lg hover:bg-[#4a5c53] transition-all">저장하고 완료하기<CheckCircle2 size={18} /></button>
            </div>
          </div>
        )}

        {/* COMPLETED Stage */}
        {stage === 'completed' && (
          <div className="animate-in fade-in zoom-in duration-700 max-w-2xl mx-auto text-center py-10">
            <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-10 shadow-inner">
               <CheckCircle2 size={48} className="text-[#2fa65a]" />
            </div>
            <h2 className="text-4xl font-extrabold text-[#222] mb-6">치유 기록이 저장되었습니다</h2>
            <p className="text-gray-500 text-lg mb-12 leading-relaxed font-medium">왜곡된 생각을 바로잡으려 노력한 당신의 용기에 박수를 보냅니다.<br/>이제 이 노력이 당신의 마음에 어떤 변화를 가져왔는지 확인해볼까요?</p>
            <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-xl shadow-gray-200/50 mb-12 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-5"><Sparkles size={120} /></div>
               <h3 className="text-sm font-black text-[#566e63] uppercase tracking-[0.2em] mb-4">Post-Treatment Survey</h3>
               <p className="text-2xl font-black text-[#222] mb-8">마음의 데시벨(dB) 재측정</p>
               <Link href="/questionnaire" className="inline-flex items-center gap-3 bg-[#566e63] text-white px-12 py-5 rounded-full text-lg font-bold shadow-2xl hover:bg-[#4a5c53] transition-all group">✨ 7가지 감정 설문 시작하기<ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" /></Link>
            </div>
            <div className="flex justify-center gap-8">
               <button onClick={handleReset} className="text-gray-400 font-bold text-sm hover:text-gray-600 flex items-center gap-2"><RotateCcw size={16} /> 다른 생각 재구성하기</button>
               <Link href="/my-situation" className="text-gray-400 font-bold text-sm hover:text-gray-600 flex items-center gap-2"><Activity size={16} /> 기록실로 가기</Link>
            </div>
          </div>
        )}
      </main>

      <footer className="border-t border-gray-100 mt-20 px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600 font-medium">
        <div><div className="font-extrabold text-sm text-[#4a5c53] mb-1">MoodB</div><div>© 2024 MoodB. 마음의 안식처.</div></div>
        <div className="flex gap-10 uppercase tracking-widest font-bold">
          <Link href="#" className="hover:text-black transition-colors">소개</Link>
          <Link href="#" className="hover:text-black transition-colors">개인정보처리방침</Link>
          <Link href="#" className="hover:text-black transition-colors">문의하기</Link>
          <Link href="#" className="hover:text-black transition-colors">이용약관</Link>
        </div>
      </footer>
    </div>
  )
}
