'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceArea,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Sparkles, Moon, Smile, Meh, Frown, Search, Filter, ArrowRight, AlertCircle, LogOut, TrendingUp, LayoutGrid, Calendar, User, Bell, Settings, Activity, BrainCircuit, HeartPulse, ChevronRight, CheckCircle2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

interface EmotionScore {
  subject: string
  A: number
  fullMark: number
  group: 'normal' | 'caution' | 'risk'
  groupLabel: string
  rawScore: number
}

interface ResultData {
  id?: string
  timestamp: string
  gender: string
  ageGroup: string
  scores: EmotionScore[]
  overallTScore: number
  overallGroup: 'normal' | 'caution' | 'risk'
  isPostMeditation?: boolean
  relatedPreTimestamp?: string
}

const GROUP_COLOR: Record<string, string> = {
  normal: 'bg-green-50 text-green-700 border-green-200',
  caution: 'bg-amber-50 text-amber-700 border-amber-200',
  risk: 'bg-red-50 text-red-700 border-red-200',
}

const GROUP_TEXT_COLOR: Record<string, string> = {
  normal: 'text-green-600',
  caution: 'text-amber-500',
  risk: 'text-red-500',
}

function ResultContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const idQuery = searchParams.get('id')
  
  const [result, setResult] = useState<ResultData | null>(null)
  const [preResult, setPreResult] = useState<ResultData | null>(null)
  const [resultId, setResultId] = useState<string | null>(null)
  const [allResults, setAllResults] = useState<ResultData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('final_csei_results')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        if (parsed && parsed.length > 0) {
          let foundRecord: ResultData | undefined;
          const resultsArray: ResultData[] = Array.isArray(parsed) ? parsed : [parsed];
          
          if (resultsArray.length > 0) {
            if (idQuery) {
              foundRecord = resultsArray.find((r: any) => 
                (r.id === idQuery || `csei-${r.id}` === idQuery || r.timestamp === idQuery)
              )
            }
            if (!foundRecord) {
              foundRecord = resultsArray[0]
            }
          }
          
          setAllResults(resultsArray)
          
          if (foundRecord) {
            setResultId(foundRecord.id ? `csei-${foundRecord.id}` : foundRecord.timestamp)
            setResult(foundRecord)

            if ((foundRecord as any).isPostMeditation && (foundRecord as any).relatedPreTimestamp) {
               const pre = resultsArray.find((r: any) => r.timestamp === (foundRecord as any).relatedPreTimestamp)
               if (pre) setPreResult(pre)
            }
          }
        }
      } catch (e) {
        console.error('결과 데이터를 파싱하는 중 오류가 발생했습니다.', e)
      }
    }
    setLoading(false)
  }, [idQuery])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]">
        <div className="animate-spin w-10 h-10 border-4 border-[#566e63] border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!result || !result.scores) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fcfdfc] text-center px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">분석 결과를 찾을 수 없습니다</h2>
        <p className="text-gray-500 mb-8">설문을 먼저 완료해 주세요.</p>
        <Link href="/questionnaire" className="bg-[#566e63] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:bg-[#4a5c53] transition-colors">
          설문하러 가기
        </Link>
      </div>
    )
  }

  const { scores } = result
  const attentionRequired = scores.filter(s => s.group !== 'normal')
  const isPost = result.isPostMeditation === true

  const getEmotionComment = (score: EmotionScore) => {
    if (score.group === 'risk') return `'${score.subject}' 감정이 위험 수준입니다. 각별한 관리와 주의가 필요합니다.`
    if (score.group === 'caution') return `'${score.subject}' 감정이 다소 불안정합니다. 편안한 휴식이 도움이 될 수 있습니다.`
    return `'${score.subject}' 측면에서 안정적입니다.`
  }

  const getOverallSummary = () => {
    if (attentionRequired.length > 0) {
      const mainEmotion = attentionRequired.reduce((prev, current) => 
        (current.group === 'risk' ? current : prev), attentionRequired[0])
      return `현재 돌봄이 필요한 감정들이 감지되었습니다. 특히 ${mainEmotion.subject} 지표가 ${mainEmotion.groupLabel} 상태입니다. 이 부분을 중심으로 전문적인 접근 방향을 모색해보는 것이 좋습니다.`
    }
    return '현재 전체적인 감정 상태가 모두 정상 범위에 있으며 매우 평온합니다. 지금의 안정을 유지하기 위한 가벼운 마음챙김 명상이나 일상 속 관리를 계속해 주세요.'
  }

  const radarData = scores.map(s => {
    const preScore = preResult?.scores.find(ps => ps.subject === s.subject)
    return {
      subject: s.subject.replace(/[^가-힣]/g, ''),
      fullSubject: s.subject,
      // A = 사후(현재), B = 사전(Pre)
      A: s.A,
      B: preScore ? preScore.A : null,
      mean: 50,
      groupLabel: s.groupLabel,
      group: s.group,
      preGroupLabel: preScore?.groupLabel
    }
  })

  // 사전/사후 색상: 사전=초록, 사후=붉은색
  const PRE_COLOR = '#22c55e'   // 사전 초록
  const POST_COLOR = '#ef4444'  // 사후 붉은색

  const CustomRadarTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-gray-100 min-w-[200px] animate-in fade-in zoom-in duration-200">
          <div className="text-sm font-black text-gray-400 mb-3 tracking-widest uppercase">{data.fullSubject}</div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-6">
                <div className="flex flex-col">
                <span className="text-[10px] font-bold text-gray-400 uppercase">
                  {preResult ? '사후 점수(Post)' : '현재 점수'}
                </span>
                <span className={`text-lg font-black ${GROUP_TEXT_COLOR[data.group]}`}>
                   {data.groupLabel}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-3xl font-black text-[#222]">{data.A}</div>
                <span className="px-1.5 py-0.5 bg-gray-100 rounded text-[10px] font-black text-gray-400">dB</span>
              </div>
            </div>

            {preResult && data.B !== null && (
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-6">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">사전 점수(Pre)</span>
                  <span className="text-xs font-bold text-gray-500">{data.preGroupLabel}</span>
                </div>
                <div className="flex items-center gap-2">
                   <div className="text-xl font-bold text-[#22c55e]">{data.B}</div>
                   <span className="px-2 py-0.5 bg-green-50 rounded-md text-[10px] font-bold text-green-600">dB</span>
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <span className="text-[10px] font-bold text-gray-300 uppercase">MoodB 평균 가이드</span>
              <span className="px-2 py-0.5 bg-gray-50 rounded text-[10px] font-black text-gray-300">50 dB</span>
            </div>
          </div>
          {preResult && data.B !== null && (
             <div className="mt-4 py-2 bg-gray-50 rounded-xl text-center">
                <span className="text-[10px] font-bold text-gray-400">
                   점수 변화: {data.A - data.B > 0 ? `+${data.A - data.B}` : data.A - data.B}dB
                </span>
             </div>
          )}
        </div>
      )
    }
    return null
  }

  // 이전 진단 목록: 사전/사후를 쌍으로 묶기
  const buildSessionPairs = () => {
    const pairs: { pre: ResultData; post?: ResultData; preId: string }[] = []
    const used = new Set<string>()

    allResults.forEach(rec => {
      const recId = rec.id ? `csei-${rec.id}` : rec.timestamp
      if (used.has(recId)) return

      if (rec.isPostMeditation) return // 사후는 별도 처리

      // 사전 찾기
      const matchingPost = allResults.find(r =>
        r.isPostMeditation && r.relatedPreTimestamp === rec.timestamp
      )

      const postId = matchingPost ? (matchingPost.id ? `csei-${matchingPost.id}` : matchingPost.timestamp) : undefined

      used.add(recId)
      if (postId) used.add(postId)

      pairs.push({ pre: rec, post: matchingPost, preId: recId })
    })

    // 고아 사후(연결된 사전 없는)도 단독으로 추가
    allResults.forEach(rec => {
      const recId = rec.id ? `csei-${rec.id}` : rec.timestamp
      if (!used.has(recId)) {
        pairs.push({ pre: rec, preId: recId })
        used.add(recId)
      }
    })

    return pairs
  }

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#333] pb-24">
      <Navbar />

      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        <div className="mb-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <span className="text-sm font-bold text-[#566e63] tracking-[0.2em] uppercase mb-4 block">
            RESULT SUMMARY
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#222]">
            {isPost ? '명상 효과 분석 리포트' : '나의 감정 진단 요약'}
          </h1>
        </div>

        {/* ① 감정 점수 카드 - 개선: 글자 16pt+, dB 숫자 뒤, 분류 글자 크게 */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-6 duration-500 delay-100">
          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3 md:gap-4">
            {scores.map((score, idx) => {
              // 사후일 때 이전(사전) 점수를 구해 변화량 표시
              const preScore = preResult?.scores.find(ps => ps.subject === score.subject)
              const diff = preScore ? score.A - preScore.A : null
              return (
                <div 
                  key={idx} 
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border ${GROUP_COLOR[score.group]} transition-all`}
                >
                  {/* 감정 단어 16pt */}
                  <span className="text-[16px] font-extrabold tracking-tight text-[#333] mb-2 truncate max-w-full">
                    {score.subject.replace(/[^가-힣]/g, '') || score.subject}
                  </span>
                  {/* 숫자 + dB (숫자 뒤에 dB) */}
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-3xl font-black">{score.A}</span>
                    <span className="text-[11px] font-black text-gray-500">dB</span>
                  </div>
                  {/* 사후일 때 사전 점수 + 변화량 */}
                  {preScore && diff !== null && (
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-xs text-gray-400 font-bold">전: {preScore.A}</span>
                      <span className={`text-xs font-black ${diff < 0 ? 'text-green-600' : diff > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                        {diff > 0 ? `+${diff}` : diff}
                      </span>
                    </div>
                  )}
                  {/* 분류 표시 12pt */}
                  <div className={`text-[12px] font-black px-2 py-0.5 rounded-full bg-white/60 ${GROUP_TEXT_COLOR[score.group]} whitespace-nowrap`}>
                    {score.groupLabel}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* ② 레이더 차트 - 사전=초록, 사후=붉은색 */}
        <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-150">
          <div className="bg-white p-8 md:p-12 rounded-[32px] border border-gray-100 shadow-sm flex flex-col items-center">
            <div className="text-center mb-8 w-full flex flex-col md:flex-row justify-between items-center">
              <div className="text-left">
                <h2 className="text-2xl font-extrabold text-[#222]">7가지 감정 프로파일</h2>
                <p className="text-sm font-medium text-gray-500 mt-2">
                  {preResult ? '명상 전후의 감정 변화를 한눈에 비교해 보세요.' : '당신의 마음을 구성하는 7가지 요소'}
                </p>
              </div>
              {preResult && (
                <div className="flex gap-4 mt-4 md:mt-0">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: PRE_COLOR, opacity: 0.7 }}></div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">사전(PRE) - 초록</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ background: POST_COLOR }}></div>
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">사후(POST) - 붉은색</span>
                  </div>
                </div>
              )}
            </div>
            <div className="w-full max-w-lg h-[350px] md:h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="75%" data={radarData}>
                  <PolarGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                  <PolarAngleAxis 
                    dataKey="subject" 
                    tick={{ fill: '#4b5563', fontSize: 13, fontWeight: 'bold' }} 
                  />
                  <PolarRadiusAxis 
                    angle={90} 
                    domain={[0, 100]} 
                    tick={false} 
                    axisLine={false} 
                  />
                  <RechartsTooltip content={<CustomRadarTooltip />} />
                  
                  <Radar
                    name="MoodB 평균"
                    dataKey="mean"
                    stroke="#94a3b8"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    fill="none"
                    fillOpacity={0}
                  />

                  {/* 사전: 초록색 점선 */}
                  {preResult && (
                    <Radar
                      name="사전 점수(Pre)"
                      dataKey="B"
                      stroke={PRE_COLOR}
                      strokeWidth={2}
                      strokeOpacity={0.7}
                      fill={PRE_COLOR}
                      fillOpacity={0.1}
                    />
                  )}

                  {/* 사후(현재): 붉은색 실선 */}
                  <Radar
                    name={preResult ? "사후 점수(Post)" : "감정 지수"}
                    dataKey="A"
                    stroke={isPost ? POST_COLOR : '#566e63'}
                    strokeWidth={preResult ? 3 : 2}
                    fill={isPost ? POST_COLOR : '#566e63'}
                    fillOpacity={0.15}
                    isAnimationActive={false}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* ③ 라인 차트 + 현 상태 요약 */}
        <div className="grid md:grid-cols-5 gap-8 mb-16 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-200">
          <div className="md:col-span-3 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm flex flex-col justify-center">
            <h3 className="text-xl font-bold text-gray-700 mb-6 flex items-center gap-2">
              <Activity size={24} /> 7가지 감정 지수 프로파일 (Line Chart)
            </h3>
            <div className="w-full h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scores} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <ReferenceArea y1={40} y2={60} fill="#22c55e" fillOpacity={0.05} />
                  <ReferenceArea y1={60} y2={70} fill="#f59e0b" fillOpacity={0.08} />
                  <ReferenceArea y1={30} y2={40} fill="#f59e0b" fillOpacity={0.08} />
                  <ReferenceArea y1={70} y2={100} fill="#ef4444" fillOpacity={0.05} />
                  <ReferenceArea y1={0} y2={30} fill="#ef4444" fillOpacity={0.05} />

                  <XAxis 
                    dataKey="subject" 
                    tick={{ fontSize: 14, fill: '#333', fontWeight: 'bold' }} 
                    axisLine={false} 
                    tickLine={false} 
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    tick={{ fontSize: 14, fill: '#555' }} 
                    axisLine={false} 
                    tickLine={false} 
                    label={{ value: 'dB', angle: -90, position: 'insideLeft', fill: '#999', fontSize: 12 }}
                  />
                  <RechartsTooltip
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.08)' }}
                    formatter={(val: any, name: any, props: any) => [
                      val, 
                      props.payload.groupLabel
                    ]}
                  />
                  {/* 사전 라인: 초록 점선 */}
                  {preResult && (
                    <Line
                      type="monotone"
                      dataKey={(entry) => preResult.scores.find(s => s.subject === (entry as any).subject)?.A ?? null}
                      name="사전(Pre)"
                      stroke={PRE_COLOR}
                      strokeWidth={2}
                      strokeDasharray="5 3"
                      dot={{ r: 4, fill: PRE_COLOR }}
                    />
                  )}
                  {/* 사후(현재) 라인 */}
                  <Line 
                    type="monotone" 
                    dataKey="A" 
                    name={preResult ? "사후(Post)" : "감정 지수"}
                    stroke={isPost ? POST_COLOR : '#566e63'} 
                    strokeWidth={3} 
                    dot={{ r: 5, fill: isPost ? POST_COLOR : '#566e63', strokeWidth: 2, stroke: '#fff' }} 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="md:col-span-2 bg-[#f9faf9] p-8 md:p-10 rounded-[32px] flex flex-col justify-between">
            <div>
               <h3 className="text-xl font-extrabold mb-6 text-[#222] tracking-tight">현 상태 요약</h3>
               <p className="text-[#555] font-medium leading-relaxed mb-6 text-[15px]">
                 {getOverallSummary()}
               </p>
               <div className="space-y-3">
                 {attentionRequired.map((score, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <AlertCircle size={16} className={`mt-0.5 ${GROUP_TEXT_COLOR[score.group]} shrink-0`} />
                      <p className="text-xs text-gray-600 font-bold leading-normal">{getEmotionComment(score)}</p>
                    </div>
                 ))}
                 {attentionRequired.length === 0 && (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="mt-0.5 text-green-500 shrink-0" />
                      <p className="text-xs text-gray-600 font-bold leading-normal">모든 감정 영역이 통제 범위 내에 있습니다.</p>
                    </div>
                 )}
               </div>
            </div>
            
            <Link href={`/dashboard`} className="mt-8 bg-white border border-gray-200 text-[#4a5c53] font-bold py-3 px-8 rounded-full inline-flex items-center gap-2 hover:bg-gray-50 transition-colors shadow-sm self-start group">
              <BrainCircuit size={16} className="group-hover:text-[#566e63]" />
              의학적 심층 리포트 보기
              <ArrowRight size={16} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* ④ 어떤 감정을 먼저 다룰까요? - 사후 설문결과에서 숨김 */}
        {!isPost && (
          <div className="mb-20 animate-in fade-in slide-in-from-bottom-10 duration-500 delay-300">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-extrabold mb-4 tracking-tight text-[#222]">
                어떤 감정을 먼저 다룰까요?
              </h2>
              <p className="text-gray-500 font-medium text-sm">
                방금 검사에서 집중 관리가 필요하다고 판정된 감정들입니다. 심리 치료를 선택하고 마음의 짐을 가볍게 내려놓으세요.
              </p>
            </div>

            {attentionRequired.length > 0 ? (
              <div className="flex flex-wrap justify-center gap-6">
                {attentionRequired.map((score, idx) => (
                  <Link 
                    href={`/meditation/${encodeURIComponent(score.subject)}`} 
                    key={idx}
                    className="w-full sm:w-[280px] bg-white border-2 border-[#eaeced] hover:border-[#566e63] rounded-[24px] p-8 text-center group hover:shadow-xl hover:-translate-y-1 transition-all flex flex-col items-center"
                  >
                    <div className={`w-full py-4 rounded-2xl flex items-center justify-center font-black text-xl mb-4 ${GROUP_COLOR[score.group]}`}>
                      {score.subject}
                    </div>
                    <h3 className="text-lg font-extrabold text-[#222] mb-2">{score.subject}</h3>
                    <div className={`text-[12px] font-black mb-6 ${GROUP_TEXT_COLOR[score.group]}`}>{score.groupLabel} 상태</div>
                    
                    <div className="w-full py-3 bg-[#f9faf9] group-hover:bg-[#566e63] group-hover:text-white rounded-xl font-bold text-sm text-gray-500 transition-colors flex items-center justify-center gap-2">
                      치유 시작하기 <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-[#f0f9f3] border border-[#d1e8da] rounded-[32px] p-10 md:p-14 text-center max-w-3xl mx-auto flex flex-col items-center">
                <div className="w-16 h-16 bg-[#e3f4ea] rounded-full flex items-center justify-center mb-6">
                  <Smile size={32} className="text-[#2fa65a]" />
                </div>
                <h3 className="text-2xl font-extrabold text-[#222] mb-4">
                  현재는 치유가 <span className="text-[#2fa65a]">가장 급한 감정</span>이 없어요
                </h3>
                <p className="text-gray-600 font-medium mb-8 max-w-md leading-relaxed">
                  모든 감정 지표가 안정권입니다. 치유를 서두르기보다 오늘의 평안함을 유지하기 위한 가벼운 마음챙김 명상이나 산책을 추천합니다.
                </p>
                <Link href="/select" className="inline-flex items-center gap-2 bg-[#2fa65a] text-white px-8 py-3.5 rounded-full font-bold shadow-lg hover:bg-[#258748] transition-colors">
                  <HeartPulse size={18} /> 추천 프로그램 둘러보기
                </Link>
              </div>
            )}
          </div>
        )}

        {/* ⑤ 이전 진단 목록: 사전/사후 쌍으로 표시 */}
        {allResults.length > 1 && (() => {
          const pairs = buildSessionPairs()
          return (
            <div className="mb-20 pt-10 border-t border-gray-200 animate-in fade-in slide-in-from-bottom-8 duration-500 delay-500">
              <h3 className="text-xl font-extrabold text-[#222] mb-6 flex items-center gap-2">
                <Calendar size={20} className="text-[#566e63]" />
                나의 이전 진단 목록
              </h3>
              
              <div className="flex flex-col gap-4">
                {pairs.map((pair, idx) => {
                  const preId = pair.preId
                  const postId = pair.post ? (pair.post.id ? `csei-${pair.post.id}` : pair.post.timestamp) : null
                  const d = new Date(pair.pre.timestamp)
                  const displayDate = d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', year: 'numeric' })
                  const isCurrentPre = preId === resultId
                  const isCurrentPost = postId === resultId

                  return (
                    <div key={idx} className={`rounded-2xl border p-4 flex flex-col sm:flex-row gap-3 transition-all ${isCurrentPre || isCurrentPost ? 'border-[#566e63] bg-[#f0f4f1]' : 'border-gray-200 bg-white hover:border-[#566e63] hover:shadow-sm'}`}>
                      <div className="flex-1">
                        <div className="text-[11px] font-bold text-gray-400 mb-1">{displayDate}</div>
                        {/* 사전 */}
                        <Link href={isCurrentPre ? '#' : `/result?id=${preId}`}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm mr-2 ${isCurrentPre ? 'bg-[#22c55e] text-white' : 'bg-green-50 text-green-700 hover:bg-green-100'}`}
                        >
                          <span>🟢 사전 진단</span>
                          <span className="text-xs opacity-70">{pair.pre.overallGroup === 'risk' ? '위험' : pair.pre.overallGroup === 'caution' ? '주의' : '안정'} · {Math.round(pair.pre.overallTScore)}dB</span>
                          {isCurrentPre && <CheckCircle2 size={14} />}
                        </Link>
                        {/* 사후 */}
                        {pair.post ? (
                          <Link href={isCurrentPost ? '#' : `/result?id=${postId}`}
                            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl font-bold text-sm ${isCurrentPost ? 'bg-[#ef4444] text-white' : 'bg-red-50 text-red-700 hover:bg-red-100'}`}
                          >
                            <span>🔴 사후 진단</span>
                            <span className="text-xs opacity-70">{pair.post.overallGroup === 'risk' ? '위험' : pair.post.overallGroup === 'caution' ? '주의' : '안정'} · {Math.round(pair.post.overallTScore)}dB</span>
                            {isCurrentPost && <CheckCircle2 size={14} />}
                          </Link>
                        ) : (
                          <Link href={`/questionnaire?mode=post&emotion=all`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-500 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                          >
                            <span>⚪ 사후 진단 미완료</span>
                            <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })()}
      </main>
      <Footer />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#fcfdfc]"><div className="animate-spin w-10 h-10 border-4 border-[#566e63] border-t-transparent rounded-full" /></div>}>
      <ResultContent />
    </Suspense>
  )
}
