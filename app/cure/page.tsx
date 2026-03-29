'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowRight, RotateCcw, Sparkles, Heart, Zap, Target, CheckCircle2, Brain, AlertCircle } from 'lucide-react'

// --- Types ---
type Stage = 'input' | 'loading' | 'result'
type RefineMode = 'empathy' | 'action' | 'specific'

interface ReframeCard {
  icon: string
  title: string
  text: string
}

// --- Icon map ---
const ICON_MAP: Record<string, React.ReactNode> = {
  perspective: <Sparkles size={22} />,
  balance: <Target size={22} />,
  action: <Zap size={22} />,
}

const REFINE_BUTTONS: { mode: RefineMode; label: string; icon: React.ReactNode }[] = [
  { mode: 'empathy', label: '💙 더 공감되게', icon: <Heart size={16} /> },
  { mode: 'action', label: '⚡ 더 실행력 있게', icon: <Zap size={16} /> },
  { mode: 'specific', label: '🔍 더 구체적으로', icon: <Target size={16} /> },
]

export default function CurePage() {
  const [stage, setStage] = useState<Stage>('input')
  const [situation, setSituation] = useState('')
  const [thought, setThought] = useState('')
  const [thinkingTrap, setThinkingTrap] = useState('')
  const [reframes, setReframes] = useState<ReframeCard[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [refiningIndex, setRefiningIndex] = useState<number | null>(null)
  const [error, setError] = useState('')

  // 분석 시작
  const handleAnalyze = async () => {
    if (!situation.trim() || !thought.trim()) {
      setError('현재 상황과 내 생각을 모두 입력해주세요.')
      return
    }
    setError('')
    setStage('loading')

    try {
      const res = await fetch('/api/reframe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ situation, thought }),
      })
      const data = await res.json()

      if (!data.success) {
        setError(data.error || '분석 중 오류가 발생했습니다.')
        setStage('input')
        return
      }

      setThinkingTrap(data.thinkingTrap)
      setReframes(data.reframes)
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
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
      type: `Cure: ${reframes[selectedIndex].title}`,
      situation,
      thought,
      summary: reframes[selectedIndex].text,
      thinkingTrap,
      sentiment: 'positive',
      tags: ['CBT']
    }

    if (typeof window !== 'undefined') {
      const existingHistory = JSON.parse(localStorage.getItem('final_cure_history') || '[]')
      localStorage.setItem('final_cure_history', JSON.stringify([newLog, ...existingHistory]))
    }

    alert('치료 기록이 브라우저에 임시 저장되었습니다. 마이페이지에서 확인하실 수 있습니다.')
    // router.push('/my-situation')
  }

  // 다시 시작
  const handleReset = () => {
    setSituation('')
    setThought('')
    setThinkingTrap('')
    setReframes([])
    setSelectedIndex(null)
    setError('')
    setStage('input')
  }

  return (
    <div className="min-h-screen bg-[#f8f7f4] text-[#222] font-sans">

      {/* Nav */}
      <nav className="px-6 md:px-10 py-6 flex justify-between items-center bg-transparent">
        <Link href="/" className="font-extrabold text-xl text-[#4a5c53]">Final Service</Link>
        <div className="hidden md:flex gap-10 text-sm font-medium text-gray-400">
          <Link href="/select" className="text-black border-b-2 border-black pb-1">Cure</Link>
          <Link href="/my-situation" className="hover:text-black">My Situation</Link>
          <Link href="/chat" className="hover:text-black">Chat</Link>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/login" className="text-sm font-medium text-gray-400 hidden md:block">Login</Link>
          <Link href="/login" className="bg-[#566e63] text-white px-5 py-2 rounded-full text-sm font-bold">Signup</Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 md:px-6 py-16 md:py-24">

        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">인지 재구성</h1>
          <p className="text-gray-500 text-base md:text-lg leading-relaxed">
            지금 마음속에 있는 생각을 새로운 시각으로 바라봐요.<br className="hidden md:block"/>
            현재 상황과 마음속 생각을 적어주세요.
          </p>
        </div>

        {/* === STAGE: INPUT === */}
        {(stage === 'input' || stage === 'loading') && (
          <div className="animate-in fade-in duration-500">
            {/* Input cards */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              {/* 현재 상황 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 text-[#566e63]">
                  <div className="w-8 h-8 rounded-lg bg-[#e8efe9] flex items-center justify-center">
                    <Target size={16} />
                  </div>
                  <h2 className="font-bold text-base">현재 상황</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">사건이나 상황을 최대한 객관적으로 적어주세요.</p>
                <textarea
                  value={situation}
                  onChange={e => setSituation(e.target.value)}
                  placeholder="예: 오늘 프로젝트 발표에서 상사에게 피드백을 받았어요..."
                  rows={5}
                  disabled={stage === 'loading'}
                  className="w-full bg-[#f8f7f4] rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-[#566e63]/20 placeholder:text-gray-300 disabled:opacity-60 leading-relaxed"
                />
              </div>

              {/* 내 생각 */}
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-4 text-[#566e63]">
                  <div className="w-8 h-8 rounded-lg bg-[#e8efe9] flex items-center justify-center">
                    <Brain size={16} />
                  </div>
                  <h2 className="font-bold text-base">내 생각</h2>
                </div>
                <p className="text-xs text-gray-400 mb-4">그 상황에서 마음속에 바로 떠오른 생각을 솔직하게 적어주세요.</p>
                <textarea
                  value={thought}
                  onChange={e => setThought(e.target.value)}
                  placeholder="예: 나는 이 일에 소질이 없는 것 같아. 앞으로도 계속 실패할 거야..."
                  rows={5}
                  disabled={stage === 'loading'}
                  className="w-full bg-[#f8f7f4] rounded-2xl p-4 text-sm resize-none outline-none focus:ring-2 focus:ring-[#566e63]/20 placeholder:text-gray-300 disabled:opacity-60 leading-relaxed"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-red-500 text-sm mb-6 justify-center">
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* CTA Button */}
            <div className="flex justify-center">
              <button
                onClick={handleAnalyze}
                disabled={stage === 'loading'}
                className="flex items-center gap-3 bg-[#566e63] text-white px-12 py-4 rounded-full text-base font-bold shadow-lg shadow-[#566e63]/30 hover:-translate-y-0.5 hover:bg-[#4a5c53] transition-all disabled:opacity-70"
              >
                {stage === 'loading' ? (
                  <>
                    <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                    <span className="animate-pulse">AI가 분석 중이에요...</span>
                  </>
                ) : (
                  <>
                    분석 시작하기
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </div>

            {/* Loading Pulse Bg */}
            {stage === 'loading' && (
              <div className="mt-16 flex justify-center">
                <div className="relative flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full bg-[#566e63]/10 animate-ping absolute" />
                  <div className="w-20 h-20 rounded-full bg-[#566e63]/20 animate-pulse absolute" />
                  <div className="w-10 h-10 rounded-full bg-[#566e63]/40" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* === STAGE: RESULT === */}
        {stage === 'result' && (
          <div className="animate-in fade-in duration-700 slide-in-from-bottom-4">

            {/* 생각의 함정 배지 */}
            {thinkingTrap && (
              <div className="flex justify-center mb-12 animate-in fade-in duration-500 delay-100">
                <div className="inline-flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-6 py-4">
                  <Brain size={18} className="text-amber-500 shrink-0" />
                  <div>
                    <p className="text-[10px] font-bold text-amber-500 uppercase tracking-wider mb-0.5">분석된 생각의 함정</p>
                    <p className="text-sm font-bold text-amber-900">
                      당신의 생각 속에 <span className="text-amber-600">'{thinkingTrap}'</span> 패턴이 있을 수 있어요.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Section Label */}
            <div className="flex justify-center mb-8">
              <span className="bg-[#e8efe9] text-[#566e63] text-[11px] font-bold px-4 py-1.5 rounded-full tracking-widest uppercase">
                재구성 관점
              </span>
            </div>
            <h2 className="text-center text-2xl md:text-3xl font-extrabold mb-8">나아갈 방향을 선택해보세요</h2>
            <p className="text-center text-gray-400 text-sm mb-10">마음에 드는 관점을 선택한 후, 원하는 방향으로 다듬을 수 있어요.</p>

            {/* Reframe Cards */}
            <div className="grid md:grid-cols-3 gap-5 mb-10">
              {reframes.map((card, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedIndex(i)}
                  style={{ animationDelay: `${i * 120}ms` }}
                  className={`
                    relative cursor-pointer rounded-3xl p-7 border-2 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3
                    ${selectedIndex === i
                      ? 'border-[#566e63] bg-[#e8efe9] shadow-lg shadow-[#566e63]/10'
                      : 'border-transparent bg-white hover:border-[#566e63]/30 hover:shadow-md'
                    }
                    ${refiningIndex === i ? 'opacity-60' : ''}
                  `}
                >
                  {/* 선택 체크 */}
                  {selectedIndex === i && (
                    <div className="absolute top-4 right-4 text-[#566e63]">
                      <CheckCircle2 size={20} />
                    </div>
                  )}

                  {/* 아이콘 */}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${selectedIndex === i ? 'bg-[#566e63] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    {ICON_MAP[card.icon] || <Sparkles size={22} />}
                  </div>

                  {/* 카드 내용 */}
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">{card.title}</p>
                  <p className="text-sm leading-relaxed text-gray-700 italic">
                    "{refiningIndex === i ? '다듬는 중...' : card.text}"
                  </p>

                  {/* 선택 or 활성화 표시 */}
                  <div className="mt-6 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${selectedIndex === i ? 'bg-[#566e63]' : 'bg-gray-200'}`} />
                    <span className="text-[11px] font-bold text-gray-400">
                      {selectedIndex === i ? '선택됨' : '관점 선택하기'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* 다듬기 패널 */}
            <div className={`bg-white rounded-3xl p-8 border border-gray-100 shadow-sm mb-10 transition-all duration-300 ${selectedIndex !== null ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
              <h3 className="text-center font-bold text-base mb-2">이 관점을 다듬어볼까요?</h3>
              <p className="text-center text-xs text-gray-400 mb-6">현재 감정 상태에 맞게 톤을 조절해 보세요.</p>
              {error && (
                <div className="flex items-center justify-center gap-2 text-red-500 text-sm mb-4">
                  <AlertCircle size={14} />
                  {error}
                </div>
              )}
              <div className="flex flex-wrap justify-center gap-3">
                {REFINE_BUTTONS.map(({ mode, label }) => (
                  <button
                    key={mode}
                    onClick={() => handleRefine(mode)}
                    disabled={refiningIndex !== null}
                    className="bg-[#f8f7f4] hover:bg-[#e8efe9] hover:text-[#566e63] text-gray-600 font-bold text-sm px-7 py-3 rounded-full border border-transparent hover:border-[#566e63]/20 transition-all disabled:opacity-50"
                  >
                    {refiningIndex !== null ? '처리 중...' : label}
                  </button>
                ))}
              </div>
            </div>

            {/* 액션 버튼 */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
              <button
                onClick={handleReset}
                className="flex items-center gap-2 text-sm text-gray-400 hover:text-gray-600 font-medium transition-all order-2 sm:order-1"
              >
                <RotateCcw size={15} />
                처음부터 다시 시작하기
              </button>
              
              <button
                onClick={handleSave}
                disabled={selectedIndex === null}
                className={`order-1 sm:order-2 flex items-center gap-3 bg-[#566e63] text-white px-10 py-4 rounded-full text-base font-bold shadow-lg shadow-[#566e63]/30 hover:-translate-y-0.5 hover:bg-[#4a5c53] transition-all disabled:opacity-50
                   ${selectedIndex === null ? 'grayscale cursor-not-allowed' : ''}
                `}
              >
                저장하고 완료하기
                <CheckCircle2 size={18} />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 mt-20 px-6 md:px-10 py-12 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-400 font-medium">
        <div>
          <div className="font-extrabold text-sm text-[#4a5c53] mb-1">Final Service</div>
          <div>© 2024 Final Service. The Living Sanctuary.</div>
        </div>
        <div className="flex gap-10 uppercase tracking-widest font-bold">
          <Link href="#">About</Link>
          <Link href="#">Privacy</Link>
          <Link href="#">Contact</Link>
          <Link href="#">Terms</Link>
        </div>
      </footer>
    </div>
  )
}
