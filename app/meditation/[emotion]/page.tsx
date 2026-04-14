'use client'

import { useEffect, useState, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Play, Pause, RotateCcw, Brain, MessageCircle, Heart, Fingerprint, Activity, Wind, Sparkles, Volume2, FileText, Settings, Type, Download } from 'lucide-react'
import { getScriptForMeditation } from '@/utils/meditationScripts'

const VOICE_OPTIONS = [
  { id: 'female1', name: '여성 1 (기본 안정)', file: '리소스 명상리딩.m4a' },
  { id: 'female2', name: '여성 2 (중단전 집중)', file: '중단전 마음챙김 명상 리딩.m4a' },
  { id: 'male1', name: '남성 1 (신체 감각)', file: '신체감각명상.m4a' },
]

// 아이콘 매핑용 Smile 폴백
const Smile = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" x2="9.01" y1="9" y2="9"/><line x1="15" x2="15.01" y1="9" y2="9"/></svg>
)

// 감정별 메타데이터 매핑
const MEDITATION_MAP: Record<string, any> = {
  '기쁨': {
    target: '들뜬 마음(기쁨)',
    name: '호흡명상',
    description: '과도하게 들뜬 기운을 차분하게 눌러주어, 마음의 화기를 가라앉히는 숨고르기 명상 훈련입니다.',
    color: 'from-pink-400 to-rose-300',
    bgColor: 'bg-rose-50',
    icon: Wind,
    cbt: false
  },
  '분노': {
    target: '치밀어오르는 화(분노)',
    name: '리소스명상',
    description: '위로 솟구치는 화를 차분한 감동의 에너지로 다독여 흥분된 기운을 부드럽게 다스리는 리소스 명상입니다.',
    color: 'from-orange-500 to-amber-400',
    bgColor: 'bg-orange-50',
    icon: Sparkles,
    cbt: false
  },
  '생각': {
    target: '끊임없는 잡념(생각)',
    name: '신체감각명상',
    description: '머릿속을 맴도는 수많은 잡념들을 멈추고, 현재 내 몸에서 느껴지는 감각으로 온전히 주의를 돌리는 훈련입니다.',
    color: 'from-blue-400 to-cyan-300',
    bgColor: 'bg-blue-50',
    icon: Fingerprint,
    cbt: false
  },
  '우울': {
    target: '가라앉은 마음(우울)',
    name: '희희명상',
    description: '가라앉고 답답하게 막힌 기운을 긍정의 에너지를 통해 위로 조심스럽게 끌어올려주는 밝은 훈련입니다.',
    color: 'from-gray-500 to-slate-400',
    bgColor: 'bg-slate-50',
    icon: Smile,
    cbt: false
  },
  '슬픔': {
    target: '무기력한 마음(슬픔)',
    name: '중단전명상',
    description: '온몸이 무기력해지는 슬픔을 가슴 중심부의 따뜻한 호흡과 연결하여 스스로를 다독이며 에너지를 채우는 훈련입니다.',
    color: 'from-stone-500 to-zinc-400',
    bgColor: 'bg-stone-50',
    icon: Heart,
    cbt: false
  },
  '공포': {
    target: '불안과 공포',
    name: '하단전명상',
    description: '마음 깊은 곳에서 올라오는 막연한 공포를 통제하고, 흔들리지 않는 단단한 뿌리를 내리는 안정화 훈련입니다.',
    color: 'from-purple-600 to-indigo-500',
    bgColor: 'bg-indigo-50',
    icon: Activity,
    cbt: true
  },
  '놀람': {
    target: '흩어진 기운(놀람)',
    name: '신체감각명상',
    description: '갑작스레 놀라서 흩어진 마음의 기운을 다시 몸 안으로 거두어들여 심장을 차분히 안정시키는 훈련입니다.',
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
  
  // 다양한 포맷('경(놀람)', '경 (驚)', '놀람')에 방어적으로 대응하는 매칭 딕셔너리
  const MATCH_KEYS: Record<string, string[]> = {
    '기쁨': ['희', '기쁨', '喜'],
    '분노': ['노', '분노', '怒'],
    '생각': ['사', '생각', '思'],
    '우울': ['우', '우울', '憂'],
    '슬픔': ['비', '슬픔', '悲'],
    '공포': ['공', '공포', '恐'],
    '놀람': ['경', '놀람', '驚']
  }

  let rawEmotion = decodeURIComponent(resolvedParams.emotion)
  const emotionKey = Object.keys(MEDITATION_MAP).find(key => 
    MATCH_KEYS[key].some(k => rawEmotion.includes(k))
  ) || '기쁨'

  const data = MEDITATION_MAP[emotionKey]
  const Icon = data.icon || Brain

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTimeSec, setCurrentTimeSec] = useState(0)
  const [durationSec, setDurationSec] = useState(300)

  // Studio States
  const [activeTab, setActiveTab] = useState<'script' | 'audio' | 'subtitle' | 'export'>('audio')
  const [selectedVoice, setSelectedVoice] = useState('female1')
  const [voiceVolume, setVoiceVolume] = useState(100)
  const [bgmVolume, setBgmVolume] = useState(30)
  const [showSubtitle, setShowSubtitle] = useState(true)
  
  const voiceRef = useRef<HTMLAudioElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Youtube BGM 제어 (postMessage API)
  useEffect(() => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      if (isPlaying) {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'playVideo', args: [] }), '*')
      } else {
        iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }), '*')
      }
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'setVolume', args: [bgmVolume] }), '*')
    }
  }, [isPlaying, bgmVolume])

  // 보이스 오디오 제어
  useEffect(() => {
    if (voiceRef.current) {
      voiceRef.current.volume = voiceVolume / 100
      if (isPlaying) {
        voiceRef.current.play().catch(e => console.warn('Audio play restricted:', e))
      } else {
        voiceRef.current.pause()
      }
    }
  }, [isPlaying, voiceVolume, selectedVoice])

  // 오디오 메타데이터 로드 시 전체 길이 업데이트
  const handleAudioLoaded = () => {
    if (voiceRef.current && voiceRef.current.duration !== Infinity && !isNaN(voiceRef.current.duration)) {
      setDurationSec(voiceRef.current.duration)
    }
  }

  // 현재 명상 기호에 맞는 실제 스크립트 도출
  const activeScripts = getScriptForMeditation(data.name)
  const currentScript = activeScripts.slice().reverse().find(s => currentTimeSec >= s.time)?.text || ""

  // 타이머 로직 (재생 동기화)
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        if (voiceRef.current) {
          const current = voiceRef.current.currentTime
          setCurrentTimeSec(current)
          
          if (current >= durationSec - 1 || voiceRef.current.ended) {
            setIsPlaying(false)
            try {
              const doneLog = JSON.parse(localStorage.getItem('completed_meditations') || '{}')
              doneLog[rawEmotion] = Date.now() 
              localStorage.setItem('completed_meditations', JSON.stringify(doneLog))
            } catch (e) {
              console.error('완료 이력 저장 실패', e)
            }
          }
        }
      }, 500) 
    }
    return () => clearInterval(interval)
  }, [isPlaying, durationSec, rawEmotion])

  const togglePlay = () => setIsPlaying(!isPlaying)
  const resetPlay = () => {
    setIsPlaying(false)
    setCurrentTimeSec(0)
    if (voiceRef.current) voiceRef.current.currentTime = 0
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(JSON.stringify({ event: 'command', func: 'seekTo', args: [0, true] }), '*')
    }
  }

  const progressPercent = (currentTimeSec / durationSec) * 100

  return (
    <div className={`min-h-screen ${data.bgColor} text-[#333] font-sans selection:bg-black/10 flex flex-col`}>
      {/* HEADER */}
      <header className="p-6 md:p-8 flex justify-between items-center relative z-20">
        <button onClick={() => router.back()} className="flex items-center gap-2 font-black text-xs uppercase tracking-widest text-[#566e63] hover:text-black transition-colors bg-white/50 px-4 py-2 rounded-full shadow-sm">
          <ArrowLeft size={16} /> 돌아가기
        </button>
        <div className="font-extrabold tracking-widest text-[#222] text-xl md:text-2xl hidden sm:block">
          MoodB <span className="text-[10px] font-bold text-gray-400">7가지 감정 STUDIO</span>
        </div>
        <div className="w-10 sm:w-24"></div> {/* 여백 밸런스 */}
      </header>

      {/* 메인 스튜디오 구조 (가로 2분할) */}
      <main className={`flex-1 w-full max-w-7xl mx-auto flex flex-col lg:flex-row gap-8 p-6 lg:p-10 relative z-10 ${data.cbt ? 'pb-40' : 'pb-12'}`}>
        
        {/* 숨김 오디오 / Iframe */}
        <audio 
          ref={voiceRef} 
          src={`/audio/${VOICE_OPTIONS.find(v => v.id === selectedVoice)?.file}`} 
          onLoadedMetadata={handleAudioLoaded}
          className="hidden" 
        />
        <iframe 
          ref={iframeRef}
          src="https://www.youtube.com/embed/EsL7TErAQKc?enablejsapi=1&autoplay=0&loop=1&playlist=EsL7TErAQKc" 
          allow="autoplay"
          className="hidden"
        />

        {/* 1. 좌측: 명상 플레이어 영역 */}
        <div className="flex-1 bg-white/80 backdrop-blur-md rounded-[40px] shadow-2xl border border-white p-6 md:p-8 flex flex-col items-center justify-center relative overflow-hidden min-h-[500px]">
          
          <div className="absolute top-6 left-6 md:top-8 md:left-8 inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm text-[10px] font-bold text-gray-600">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            스튜디오 믹싱 모드
          </div>

          <h1 className="text-responsive-h2 mt-12 mb-2 text-center">
            {data.name}
          </h1>
          <p className="text-xs font-bold text-gray-400 mb-6 uppercase tracking-widest">{data.target}</p>

          {/* 인터랙티브 명상 서클 */}
          <div className="relative w-[210px] h-[210px] sm:w-[240px] sm:h-[240px] md:w-[300px] md:h-[300px] flex items-center justify-center my-6">
            <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${data.color} opacity-20 blur-2xl ${isPlaying ? 'animate-ping' : ''}`} style={{ animationDuration: '4s' }}></div>
            <div className={`absolute inset-4 rounded-full bg-gradient-to-br ${data.color} opacity-40 blur-lg ${isPlaying ? 'animate-pulse' : ''}`} style={{ animationDuration: '3s' }}></div>
            
            <div className="relative z-10 bg-white border border-white/50 w-[180px] h-[180px] sm:w-[200px] sm:h-[200px] md:w-[240px] md:h-[240px] rounded-full shadow-lg flex flex-col items-center justify-center space-y-1">
               <Icon size={32} className={`opacity-40 text-[#566e63] ${isPlaying ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }} />
               <div className="text-2xl md:text-3xl font-black text-[#222]">
                  {Math.min(100, progressPercent).toFixed(0)}<span className="text-sm md:text-lg opacity-50">%</span>
               </div>
               <div className="text-[10px] md:text-xs font-black tracking-widest text-[#566e63]">
                  {isPlaying ? `${Math.floor(currentTimeSec / 60)}:${String(Math.floor(currentTimeSec % 60)).padStart(2, '0')}` : 'READY'}
               </div>
            </div>
            
            {/* 프로그레스 바 */}
            <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none">
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(0,0,0,0.05)" strokeWidth="6" />
              <circle cx="50%" cy="50%" r="48%" fill="none" stroke="currentColor" strokeWidth="6" className="text-black/20 transition-all duration-500 linear" strokeDasharray="301.59%" strokeDashoffset={`${301.59 - (Math.min(100, progressPercent) / 100) * 301.59}%`} />
            </svg>
          </div>

          {/* 자막 구역 */}
          {showSubtitle && (
            <div className="h-20 flex items-center justify-center text-center w-full px-4 mb-6">
              <p className="text-base md:text-xl font-bold bg-white/50 px-6 py-2 rounded-2xl text-[#444] break-keep transition-all duration-700 shadow-sm border border-white/50">
                {currentScript || "조용히 숨을 고릅니다..."}
              </p>
            </div>
          )}

          {/* 컨트롤 패널 */}
          <div className="flex items-center gap-6 mt-6">
            <button onClick={resetPlay} className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 hover:text-black hover:bg-white shadow-sm transition-all active:scale-95">
              <RotateCcw size={18} />
            </button>
            <button onClick={togglePlay} className={`w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${isPlaying ? 'bg-gray-800' : 'bg-gradient-to-br ' + data.color}`}>
              {isPlaying ? <Pause size={28} /> : <Play size={28} className="ml-1" />}
            </button>
            <button onClick={() => router.push('/')} className="w-12 h-12 md:w-14 md:h-14 bg-gray-50 rounded-full flex items-center justify-center text-red-300 hover:text-red-500 hover:bg-white shadow-sm transition-all active:scale-95 font-black text-[9px] tracking-widest uppercase">
              종료
            </button>
          </div>
        </div>

        {/* 2. 우측: 기능 제어 탭 (Studio Tools) */}
        <div className="lg:w-[400px] flex flex-col bg-white border border-gray-100 rounded-[40px] overflow-hidden shadow-xl">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-100 bg-[#faf8f5] overflow-x-auto no-scrollbar">
            <button onClick={() => setActiveTab('audio')} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'audio' ? 'text-[#566e63] bg-white border-b-2 border-[#566e63]' : 'text-gray-400 hover:bg-white'}`}>
               <Settings size={16} className="mx-auto mb-1.5" /> 오디오
            </button>
            <button onClick={() => setActiveTab('script')} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'script' ? 'text-[#566e63] bg-white border-b-2 border-[#566e63]' : 'text-gray-400 hover:bg-white'}`}>
               <FileText size={16} className="mx-auto mb-1.5" /> 스크립트
            </button>
            <button onClick={() => setActiveTab('subtitle')} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'subtitle' ? 'text-[#566e63] bg-white border-b-2 border-[#566e63]' : 'text-gray-400 hover:bg-white'}`}>
               <Type size={16} className="mx-auto mb-1.5" /> 자막
            </button>
            <button onClick={() => setActiveTab('export')} className={`flex-1 min-w-[80px] py-4 text-[10px] font-black uppercase tracking-widest transition-colors ${activeTab === 'export' ? 'text-[#566e63] bg-white border-b-2 border-[#566e63]' : 'text-gray-400 hover:bg-white'}`}>
               <Download size={16} className="mx-auto mb-1.5" /> 내보내기
            </button>
          </div>

          {/* Tab Contents */}
          <div className="p-8 flex-1 overflow-y-auto bg-white">
            
            {activeTab === 'audio' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div>
                  <h3 className="font-extrabold text-[#222] mb-4 text-lg">리딩 보이스 (AI/성우 대체)</h3>
                  <div className="flex flex-col gap-3">
                    {VOICE_OPTIONS.map(voice => (
                      <label key={voice.id} className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${selectedVoice === voice.id ? 'border-[#566e63] bg-[#566e63]/5' : 'border-gray-100 hover:border-gray-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="voice" className="hidden" checked={selectedVoice === voice.id} onChange={() => setSelectedVoice(voice.id)} />
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selectedVoice === voice.id ? 'border-[#566e63]' : 'border-gray-300'}`}>
                            {selectedVoice === voice.id && <div className="w-2.5 h-2.5 rounded-full bg-[#566e63]"></div>}
                          </div>
                          <span className="font-bold text-gray-700">{voice.name}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-[#222] mb-4 flex items-center gap-2">
                    <Volume2 size={18} /> 오디오 믹서 (스마트 호흡 매칭)
                  </h3>
                  <div className="space-y-6 bg-[#faf8f5] p-5 rounded-2xl border border-gray-100">
                    <div>
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>보이스 볼륨</span>
                        <span>{voiceVolume}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={voiceVolume} onChange={(e) => setVoiceVolume(Number(e.target.value))} className="w-full accent-[#566e63]" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm font-bold text-gray-600 mb-2">
                        <span>자연 배경소리 (BGM)</span>
                        <span>{bgmVolume}%</span>
                      </div>
                      <input type="range" min="0" max="100" value={bgmVolume} onChange={(e) => setBgmVolume(Number(e.target.value))} className="w-full accent-blue-400" />
                      <p className="text-xs text-gray-400 mt-2 font-medium">BGM은 Youtube 소스를 자동으로 사용합니다.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'script' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-extrabold text-[#222] mb-4 text-lg">심리학적 템플릿 스크립트</h3>
                <div className="space-y-4">
                  {activeScripts.map((line, idx) => (
                    <div key={idx} className={`p-4 rounded-xl text-sm leading-relaxed font-medium transition-colors ${currentTimeSec >= line.time ? 'bg-[#566e63]/10 text-[#222] font-bold border border-[#566e63]/20' : 'text-gray-400'}`}>
                      {line.text}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'subtitle' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                <h3 className="font-extrabold text-[#222] mb-4 text-lg">디스플레이 및 자막</h3>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                  <span className="font-bold text-gray-700">명상 중 자막 표시</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={showSubtitle} onChange={(e) => setShowSubtitle(e.target.checked)} />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#566e63]"></div>
                  </label>
                </div>
                <div className="p-4 border border-gray-100 rounded-2xl">
                  <h4 className="text-sm font-bold text-gray-500 mb-3">미리보기 서체 세팅</h4>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 rounded-lg bg-gray-100 font-serif font-bold hover:bg-gray-200">나눔명조</button>
                    <button className="flex-1 py-2 rounded-lg bg-[#566e63] text-white font-sans font-bold">기본고딕</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'export' && (
              <div className="animate-in fade-in duration-300 text-center py-6 space-y-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                   <Download size={32} />
                </div>
                <h3 className="font-extrabold text-[#222] text-xl">멀티 플랫폼 인코딩</h3>
                <p className="text-gray-500 font-medium text-sm">현재 작성된 믹싱 설정(스크립트, BGM, 자막)으로 하나의 영상 파일을 생성합니다.</p>
                <div className="grid grid-cols-2 gap-3 mt-6">
                  <button onClick={() => alert('인코딩 프로세스 (Mock)')} className="p-4 border border-gray-200 rounded-2xl hover:border-[#566e63] hover:text-[#566e63] transition-colors font-bold flex flex-col items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">16:9</span> 유튜브용
                  </button>
                  <button onClick={() => alert('인코딩 프로세스 (Mock)')} className="p-4 border border-gray-200 rounded-2xl hover:border-[#566e63] hover:text-[#566e63] transition-colors font-bold flex flex-col items-center gap-2">
                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">9:16</span> 쇼츠 / 릴스용
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* CBT / 심층 처방 연계 버튼 (공, 경 감정일 때만 활성화) */}
      {data.cbt && currentTimeSec < durationSec && (
        <div className="fixed bottom-0 left-0 w-full p-4 md:p-8 animate-in fade-in slide-in-from-bottom-full duration-1000 delay-700 z-30">
          <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-md rounded-2xl border border-gray-200/50 p-5 md:p-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6">
            <div className="text-center md:text-left">
              <h4 className="text-xs md:text-sm font-black text-[#222] mb-1 flex items-center justify-center md:justify-start gap-2">
                <Brain size={16} className="text-indigo-500" />
                추가적인 인지 교정이 필요하신가요?
              </h4>
              <p className="text-[10px] md:text-xs text-gray-400 font-bold uppercase tracking-wider">CBT 인지행동치료 병행 솔루션</p>
            </div>
            <Link href="/cure" className="w-full md:w-auto shrink-0 bg-indigo-600 text-white font-black px-6 py-3 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg flex items-center justify-center gap-2 text-xs">
              <MessageCircle size={16} />
              CBT 챗봇 입장
            </Link>
          </div>
        </div>
      )}

      {/* 명상 완료 시 다시 검사 플로우 */}
      {currentTimeSec >= durationSec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#faf8f5]/95 backdrop-blur-sm animate-in fade-in duration-1000 p-4">
          <div className="max-w-md w-full bg-white rounded-[32px] border border-[#d7eadf] p-8 md:p-10 shadow-2xl flex flex-col items-center text-center">
            <div className="w-20 h-20 bg-[#f5ebd9] rounded-full flex items-center justify-center mb-6 text-[#bfa588] shadow-inner">
               <Heart size={40} className="animate-pulse" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#222] mb-3">명상을 무사히 마쳤습니다.</h3>
            <p className="text-gray-500 font-medium leading-relaxed mb-8 break-keep">
              짧은 휴식으로도 마음의 크기는 달라집니다.<br className="hidden md:block" />나의 감정 크기를 다시 측정하여 이전 진단 결과와 어떻게 달라졌는지 비교해 보세요.
            </p>
            
            <Link href={`/questionnaire?mode=post&emotion=${encodeURIComponent(rawEmotion)}`} className="w-full bg-[#566e63] text-white font-bold py-4 rounded-xl hover:bg-[#4a5c53] shadow-lg transition-transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2 mb-4">
              <Activity size={20} />
              나의 감정 크기 다시 확인하기
            </Link>
            
            <button onClick={() => router.push('/')} className="text-sm font-bold text-gray-400 hover:text-gray-600 underline underline-offset-4">
              나중에 하기
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
