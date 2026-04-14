'use client'

import Link from 'next/link'
import { ArrowLeft, Activity, Heart, Shield, BarChart, BookOpen, UserCheck, ArrowRight } from 'lucide-react'

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans selection:bg-[#566e63]/20">
      
      {/* Header */}
      <header className="p-6 md:p-8 flex items-center justify-between sticky top-0 bg-[#faf8f5]/80 backdrop-blur-md z-50 border-b border-[#e8e0d5]">
        <Link href="/" className="flex items-center gap-2 font-bold text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={20} /> 홈으로 돌아가기
        </Link>
        <div className="font-extrabold tracking-widest text-2xl text-[#bfa588]">
          MoodB
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32 px-6 max-w-5xl mx-auto flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="inline-flex items-center gap-2 bg-[#f5ebd9] px-4 py-2 rounded-full text-[#bfa588] font-bold text-sm mb-8 shadow-sm">
          <Shield size={16} /> 안전하고 프라이빗한 마음의 안식처
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-[#222] mb-6 tracking-tight leading-tight break-keep">
          보이지 않던 감정을 <br className="hidden md:block"/>
          <span className="text-[#566e63]">눈에 보이게, 측정 가능하게.</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl leading-relaxed mt-4 break-keep">
          MoodB는 나의 감정 상태를 주파수와 데시벨로 정밀 측정하고, 그 결과에 맞추어 가장 최적화된 치유 방법을 제안하는 지능형 감정 관리 플랫폼입니다.
        </p>
      </section>

      {/* Core Principles */}
      <section className="py-16 bg-white border-y border-[#e8e0d5]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-16 text-center animate-in fade-in zoom-in duration-1000">
            <h2 className="text-3xl font-extrabold text-[#222] mb-4">MoodB의 3단계 치유 원리</h2>
            <p className="text-gray-500 font-medium">감정을 측정하고 다루는 과학적이고 따뜻한 접근 방법</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-10 rounded-[32px] bg-[#fdfbf7] border border-[#f5ebd9] shadow-sm hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#566e63] shadow-md border border-[#e8e0d5] mb-6">
                <BarChart size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#222] mb-4">1. 마음 데시벨 측정</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                눈에 보이지 않는 7가지 핵심 감정(기쁨, 분노, 슬픔, 생각 등)의 크기를 주파수와 데시벨로 객관화합니다. 단 2분의 정밀 진단을 통해 현재 어떤 감정이 범람하고 있는지, 어느 부분이 결핍되어 있는지 진단합니다.
              </p>
            </div>

            <div className="p-10 rounded-[32px] bg-[#fdfbf7] border border-[#f5ebd9] shadow-sm hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#bfa588] shadow-md border border-[#e8e0d5] mb-6">
                <BookOpen size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#222] mb-4">2. 인지 행동 지표화</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                측정된 데이터를 바탕으로 원인이 되는 생각의 고리와 인지 왜곡을 추적합니다. T-점수와 상관 편차 곡선을 통해 집중 관리가 필요한 감정을 선별하고 맞춤형 인지재구성 프로세스를 설계합니다.
              </p>
            </div>

            <div className="p-10 rounded-[32px] bg-[#fdfbf7] border border-[#f5ebd9] shadow-sm hover:-translate-y-2 transition-transform duration-500">
              <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-[#4db4b6] shadow-md border border-[#e8e0d5] mb-6">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-extrabold text-[#222] mb-4">3. 극복 및 다독임 명상</h3>
              <p className="text-gray-500 leading-relaxed font-medium">
                취약한 감정을 다스릴 수 있도록, 들뜬 마음은 가라앉히고 우울한 마음은 위로 끌어올리는 감성 맞춤형 명상 스크립트를 제공합니다. 부드러운 오디오와 함께 내면에 온전히 집중할 수 있도록 안내합니다.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Story & CTA */}
      <section className="py-24 px-6 text-center max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-8 text-[#222] leading-tight">
          당신에겐 아무 문제도 없습니다. <br />그저 감정의 조율이 필요할 뿐입니다.
        </h2>
        <p className="text-xl text-gray-500 font-medium mb-12">
          지금 바로 나의 마음 상태를 측정하고 편안함을 되찾으세요.
        </p>
        <Link href="/select" className="inline-flex items-center gap-3 bg-[#566e63] hover:bg-[#4a5c53] font-bold text-white px-10 py-5 rounded-full text-lg shadow-xl shadow-[#566e63]/30 transition-transform active:scale-95 group">
          <Activity size={24} /> 치유 여정 시작하기 <ArrowRight className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </section>

    </div>
  )
}
