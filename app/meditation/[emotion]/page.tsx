'use client'

import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Brain, MessageCircle, Heart, Fingerprint, Activity, Wind, Sparkles } from 'lucide-react'

// 아이콘 매핑용 Smile 폴백
const Smile = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
)

// 감정별 메타데이터 매핑
const MEDITATION_MAP: Record<string, any> = {
  '기쁨': {
    target: '희(喜)',
    principle: '공승희 (恐勝喜)',
    name: '호흡명상',
    description: '과도하게 들뜬 기운(喜)을 차분한 두려움(恐)의 원리로 눌러주어, 심장의 화기를 가라앉히는 호흡 훈련입니다.',
    color: 'from-pink-400 to-rose-300',
    bgColor: 'bg-rose-50',
    icon: Wind,
    cbt: false
  },
  '분노': {
    target: '노(怒)',
    principle: '비승노 (悲勝怒)',
    name: '리소스명상',
    description: '위로 치밀어 오르는 화(怒)를 차분한 감동과 슬픔(悲)의 원리로 다독여 간의 기운을 다스리는 리소스 명상입니다.',
    color: 'from-orange-500 to-amber-400',
    bgColor: 'bg-orange-50',
    icon: Sparkles,
    cbt: false
  },
  '생각': {
    target: '사(思)',
    principle: '노승사 (怒勝思)',
    name: '신체감각명상',
    description: '끊임없이 맴도는 잡념(思)을 강한 결단력(怒)의 원리로 쳐내고, 현재 내 몸의 감각으로 주의를 돌리는 훈련입니다.',
    color: 'from-blue-400 to-cyan-300',
    bgColor: 'bg-blue-50',
    icon: Fingerprint,
    cbt: false
  },
  '우울': {
    target: '우(憂)',
    principle: '희승우 (喜勝憂)',
    name: '희희명상',
    description: '가라앉고 막힌 기운(憂)을 기쁨(喜)의 에너지를 통해 위로 끌어올려 폐의 호흡을 열어주는 긍정 훈련입니다.',
    color: 'from-gray-500 to-slate-400',
    bgColor: 'bg-slate-50',
    icon: Smile,
    cbt: false
  },
  '슬픔': {
    target: '비(悲)',
    principle: '희승비 (喜勝悲)',
    name: '중단전명상',
    description: '전신이 무기력해지는 슬픔(悲)을 가슴 중심부(중단전)의 기쁨(喜)과 연결하여 따뜻한 에너지를 채우는 훈련입니다.',
    color: 'from-stone-500 to-zinc-400',
    bgColor: 'bg-stone-50',
    icon: Heart,
    cbt: false
  },
  '두려움': {
    target: '공(恐)',
    principle: '사승공 (思勝恐)',
    name: '하단전명상',
    description: '깊은 곳에서 올라오는 공포(恐)를 이성적인 집중(思)의 원리로 통제하고, 하단전에 단단한 뿌리를 내리는 훈련입니다.',
    color: 'from-purple-600 to-indigo-500',
    bgColor: 'bg-indigo-50',
    icon: Activity,
    cbt: true
  },
  '놀람': {
    target: '경(驚)',
    principle: '사승공 (思勝恐)',
    name: '신체감각명상',
    description: '갑작스레 흩어진 기운(驚)을 이성적인 인지(思)를 통해 다시 몸 안으로 거두어들여 심장을 안정시키는 훈련입니다.',
    color: 'from-violet-500 to-fuchsia-400',
    bgColor: 'bg-fuchsia-50',
    icon: Fingerprint,
    cbt: true
  }
}

export default function MeditationPage({ params }: { params: Promise<{ emotion: string }> }) {
  const router = useRouter()
  // Next 15+ 에서는 params를 비동기로 언래핑해야 함
  const resolvedParams = use(params)
  
  // URL에서 감정 키워드 추출 (예: '경(놀람)'에서 '놀람' 매칭)
  let rawEmotion = decodeURIComponent(resolvedParams.emotion)
  const emotionKey = Object.keys(MEDITATION_MAP).find(key => rawEmotion.includes(key)) || '기쁨'

  const data = MEDITATION_MAP[emotionKey]
  const Icon = data.icon || Brain

  const [isPlaying, setIsPlaying] = useState(false)
  const [progress, setProgress] = useState(0)

  // 가상의 타이머 로직 (프로토타입용 및 완료 이력 저장)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            setIsPlaying(false)
            
            // ⭐️ 명상을 100% 완료했을 때 완료 이력을 로컬 스토리지에 저장
            try {
              const doneLog = JSON.parse(localStorage.getItem('completed_meditations') || '{}')
              doneLog[rawEmotion] = Date.now() // '경(놀람)' 등 URL에서 받은 원본 문자열을 키로 저장
              localStorage.setItem('completed_meditations', JSON.stringify(doneLog))
              console.log('명상 완료 기록됨:', rawEmotion)
            } catch (e) {
              console.error('완료 이력 저장 실패', e)
            }
            
            return 100
          }
          return prev + 0.5
        })
      }, 50) // 10초 명상 데모
    }
    return () => clearInterval(interval)
  }, [isPlaying, rawEmotion])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const resetPlay = () => {
    setIsPlaying(false)
    setProgress(0)
  }

  return (
    <div className={`min-h-screen ${data.bgColor} text-[#333] font-sans selection:bg-black/10 flex flex-col`}>
      {/* HEADER */}
      <header className="p-6 md:p-8 flex justify-between items-center relative z-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={20} /> 돌아가기
        </button>
        <div className="font-extrabold tracking-widest text-[#222]">
          FINAL SERVICE
        </div>
        <div className="w-24"></div> {/* 여백 밸런스 */}
      </header>

      {/* 메인 콘텐츠 영역 */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 max-w-4xl mx-auto w-full relative z-10">
        
        {/* 설명 헤더 */}
        <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm text-sm font-bold text-gray-600 mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500"></span>
            한방 심리 훈련소
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#222] mb-4">
            {data.name}
          </h1>
          <p className="text-gray-500 md:text-lg font-medium max-w-lg mx-auto leading-relaxed">
            "{data.principle}" 원리에 따라, {data.target} 감정을 다스립니다. <br className="hidden md:block" /> {data.description}
          </p>
        </div>

        {/* 인터랙티브 명상 서클 (핵심 UI) */}
        <div className="relative w-[280px] h-[280px] md:w-[360px] md:h-[360px] flex items-center justify-center mb-12 animate-in fade-in zoom-in-95 duration-1000 delay-200">
          {/* 바깥쪽 숨쉬는 애니메이션 원형 */}
          <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.color} opacity-20 blur-xl ${isPlaying ? 'animate-ping' : ''}`} style={{ animationDuration: '4s' }}></div>
          <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${data.color} opacity-30 blur-md ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDuration: '3s' }}></div>
          
          {/* 안쪽 실제 인터페이스 */}
          <div className="relative z-10 bg-white/80 backdrop-blur-md border border-white/50 w-[240px] h-[240px] md:w-[300px] md:h-[300px] rounded-full shadow-[0_20px_40px_-5px_rgba(0,0,0,0.1)] flex flex-col items-center justify-center">
             <Icon size={48} className={`mb-6 opacity-30 ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
             
             <div className="text-4xl font-extrabold text-[#222]">
                {Math.floor(progress)}<span className="text-lg opacity-50">%</span>
             </div>
             
             {/* 상태 텍스트 */}
             <div className="mt-2 text-xs font-bold tracking-widest text-gray-400 uppercase">
                {isPlaying ? '숨을 깊게 들이마시세요' : '명상을 시작하려면 터치'}
             </div>
          </div>
          
          {/* 원형 프로그레스 바 (가상) */}
          <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
            <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="6" className="text-black/20 transition-all duration-100" strokeDasharray="301.59%" strokeDashoffset={`${301.59 - (progress / 100) * 301.59}%`} />
          </svg>
        </div>

        {/* 컨트롤 패널 */}
        <div className="flex items-center gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
          <button onClick={resetPlay} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-black shadow-sm transition-all hover:scale-105 active:scale-95">
            <RotateCcw size={24} />
          </button>
          
          <button onClick={togglePlay} className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-gray-800' : 'bg-gradient-to-br ' + data.color}`}>
            {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
          </button>
        </div>

      </main>

      {/* CBT / 심층 처방 연계 버튼 (공, 경 감정일 때만 활성화) */}
      {data.cbt && (
        <div className="fixed bottom-0 left-0 w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-full duration-1000 delay-700 z-20">
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/50 p-6 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <h4 className="text-sm font-extrabold text-[#222] mb-1 flex items-center justify-center sm:justify-start gap-2">
                <Brain size={16} className="text-indigo-500" />
                추가적인 인지 교정이 필요하신가요?
              </h4>
              <p className="text-xs text-gray-500 font-medium">현재 이 감정은 명상뿐만 아니라 인지행동치료(CBT)를 병행하면 더욱 큰 효과를 볼 수 있습니다.</p>
            </div>
            <Link href="/cure" className="shrink-0 bg-indigo-600 text-white font-bold px-6 py-3 rounded-full hover:bg-indigo-700 transition-colors shadow-md flex items-center gap-2">
              <MessageCircle size={18} />
              CBT 챗봇 입장
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
