'use client'

import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip,
  ResponsiveContainer, ReferenceArea,
  Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts'
import { Sparkles, Moon, Smile, Meh, Frown, Search, Filter, ArrowRight, AlertCircle, LogOut, TrendingUp, LayoutGrid, Calendar, User, Bell, Settings, Activity, BrainCircuit, HeartPulse, ChevronRight, CheckCircle2 } from 'lucide-center'
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

const PRE_COLOR = '#22c55e'
const POST_COLOR = '#ef4444'

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
          const resultsArray: ResultData[] = Array.isArray(parsed) ? parsed : [parsed];
          setAllResults(resultsArray)
          
          let foundRecord = idQuery 
            ? resultsArray.find((r: any) => (r.id === idQuery || r.timestamp === idQuery))
            : resultsArray[0];
          
          if (foundRecord) {
            setResultId(foundRecord.id || foundRecord.timestamp)
            setResult(foundRecord)
            if (foundRecord.isPostMeditation && foundRecord.relatedPreTimestamp) {
               const pre = resultsArray.find((r: any) => r.timestamp === foundRecord.relatedPreTimestamp)
               if (pre) setPreResult(pre)
            }
          }
        }
      } catch (e) {
        console.error('Parsing error', e)
      }
    }
    setLoading(false)
  }, [idQuery])

  if (loading || !result) return <div className="p-20 text-center">Loading...</div>

  const { scores } = result
  const attentionRequired = scores.filter(s => s.group !== 'normal')
  const isPost = result.isPostMeditation === true

  const getOverallSummary = () => {
    if (attentionRequired.length > 0) {
      const main = attentionRequired[0]
      return `현재 돌봄이 필요한 감정들이 감지되었습니다. 특히 ${main.subject} 지표가 ${main.groupLabel} 상태입니다.`
    }
    return '현재 전체적인 감정 상태가 안정적이며 매우 평온합니다.'
  }

  const radarData = scores.map(s => {
    const preScore = preResult?.scores.find(ps => ps.subject === s.subject)
    return {
      subject: s.subject.replace(/[^가-힣]/g, ''),
      A: s.A, 
      B: preScore ? preScore.A : null, 
      mean: 50
    }
  })

  return (
    <div className="min-h-screen bg-[#fcfdfc] text-[#333] pb-24">
      <Navbar />
      <main className="max-w-[1200px] mx-auto px-6 pt-10">
        <h1 className="text-4xl font-black mb-10">{isPost ? '치유 효과 분석' : '감정 진단 결과'}</h1>

        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-4 mb-12">
          {scores.map((score, idx) => {
            const preScore = preResult?.scores.find(ps => ps.subject === score.subject)
            const diff = preScore ? score.A - preScore.A : null
            return (
              <div key={idx} className={`p-4 rounded-3xl border-2 ${GROUP_COLOR[score.group]} transition-all hover:scale-105`}>
                <div className="text-[16px] font-black mb-2">{score.subject.replace(/[^가-힣]/g, '')}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-black">{score.A}</span>
                  <span className="text-xs text-gray-400">dB</span>
                </div>
                {preScore && <div className="text-[10px] text-gray-400 font-bold">전: {preScore.A} ({diff && diff > 0 ? `+${diff}` : diff})</div>}
                <div className={`text-[12px] font-black mt-2 ${GROUP_TEXT_COLOR[score.group]}`}>{score.groupLabel}</div>
              </div>
            )
          })}
        </div>

        <div className="grid md:grid-cols-2 gap-10 mb-16">
          <div className="bg-white p-8 rounded-[40px] border border-gray-100 shadow-sm">
            <h2 className="text-xl font-black mb-6">감정 프로파일</h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" tick={{fontSize: 12, fontWeight: 'bold'}} />
                  <Radar name="현재" dataKey="A" stroke={isPost ? POST_COLOR : '#566e63'} fill={isPost ? POST_COLOR : '#566e63'} fillOpacity={0.2} />
                  {preResult && <Radar name="이전" dataKey="B" stroke={PRE_COLOR} fill={PRE_COLOR} fillOpacity={0.1} />}
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#f9faf9] p-10 rounded-[40px] flex flex-col justify-between">
            <div>
              <h2 className="text-xl font-black mb-4">현 상태 요약</h2>
              <p className="text-gray-500 font-medium mb-6 leading-relaxed">{getOverallSummary()}</p>
              
              <div className="bg-white p-6 rounded-3xl border border-[#566e63]/20 mb-8">
                <div className="flex items-center gap-2 mb-2 text-[#566e63]">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Premium Benefit</span>
                </div>
                <p className="text-sm font-bold mb-4">전문의 정밀 분석 리포트를 구매하시겠습니까?</p>
                <Link href="/pricing" className="block w-full py-3 bg-[#566e63] text-white text-center rounded-xl font-black text-xs">리포트 신청하기</Link>
              </div>
            </div>
            <Link href="/dashboard" className="flex items-center gap-2 text-[#566e63] font-black">대시보드로 돌아가기 <ArrowRight size={16} /></Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default function ResultPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResultContent />
    </Suspense>
  )
}
