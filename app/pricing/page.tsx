'use client'

import React from 'react'
import Link from 'next/link'
import { Check, Sparkles, Heart, Brain, Zap, ArrowRight, ShieldCheck } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function PricingPage() {
  const plans = [
    {
      name: 'Free',
      price: '0',
      desc: '기초적인 감정 체크와 일반 마이페이지 기능을 제공합니다.',
      features: ['28문항 기초 감정 진단', '일반 감정 리포트', '기본 명상 가이드 1종', '최근 7일 기록 저장'],
      cta: '현재 플랜',
      highlight: false,
    },
    {
      name: 'Premium Profile',
      price: '9,900',
      unit: '/ 회',
      desc: '한방신경정신과 전문의 분석 로직이 포함된 정밀 리포트를 제공합니다.',
      features: ['전문의 수준 정밀 감정 프로파일링', '오지상승위 기반 맞춤 솔루션', '심층 인지행동치료(CBT) 리포트', 'PDF 결과지 다운로드'],
      cta: '리포트 신청하기',
      highlight: true,
      tag: 'Most Popular'
    },
    {
      name: 'Monthly Care',
      price: '12,000',
      unit: '/ 월',
      desc: '당신의 일상을 완벽하게 케어하는 통합 구독 서비스입니다.',
      features: ['매월 정밀 리포트 2회권', '모든 명상/사운드 라이브러리 잠금해제', 'AI 상담 챗봇 무제한 대화', '장기 추이 분석 및 비즈니스 리포트'],
      cta: '구독 시작하기',
      highlight: false,
    }
  ]

  return (
    <div className="min-h-screen bg-[#fffdfa] text-[#333]">
      <Navbar />
      
      <main className="pt-32 pb-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
          <span className="text-[#566e63] font-black text-xs tracking-[0.3em] uppercase mb-4 block">Pricing Plan</span>
          <h1 className="text-4xl md:text-6xl font-black text-[#222] mb-6 tracking-tighter">
            지속 가능한 <span className="text-[#566e63]">마음 관리</span>를 위한 선택
          </h1>
          <p className="text-lg md:text-xl text-gray-500 font-medium max-w-2xl mx-auto">
            무료 진단을 넘어 전문적인 분석과 체계적인 솔루션을 만나보세요. <br/>
            당신의 마음 건강을 위한 가장 가치 있는 투자입니다.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <div 
              key={i} 
              className={`relative bg-white rounded-[40px] p-10 border transition-all duration-500 hover:-translate-y-4 ${
                plan.highlight 
                  ? 'border-[#566e63] shadow-[0_30px_60px_rgba(86,110,99,0.15)] ring-4 ring-[#566e63]/5' 
                  : 'border-gray-100 shadow-sm hover:shadow-xl'
              }`}
            >
              {plan.tag && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-[#566e63] text-white text-[10px] font-black px-6 py-2 rounded-full shadow-lg tracking-widest uppercase">
                  {plan.tag}
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-xl font-black text-[#222] mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-black text-[#222]">{plan.price}</span>
                  <span className="text-gray-400 font-bold text-sm">원{plan.unit}</span>
                </div>
                <p className="text-sm text-gray-400 font-medium leading-relaxed">{plan.desc}</p>
              </div>

              <div className="space-y-5 mb-10">
                {plan.features.map((feature, j) => (
                  <div key={j} className="flex gap-3 items-start group">
                    <div className={`mt-1 flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${plan.highlight ? 'bg-[#566e63] text-white' : 'bg-gray-100 text-gray-400'}`}>
                      <Check size={10} />
                    </div>
                    <span className="text-[15px] font-bold text-gray-600 transition-colors group-hover:text-[#222]">{feature}</span>
                  </div>
                ))}
              </div>

              <Link href={plan.highlight ? '/checkout' : '#'} className={`w-full py-5 rounded-3xl font-black text-center transition-all flex items-center justify-center gap-2 ${
                plan.highlight 
                  ? 'bg-[#566e63] text-white shadow-xl shadow-[#566e63]/30 hover:bg-[#4a5c53]' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}>
                {plan.cta} {plan.highlight && <ArrowRight size={18} />}
              </Link>
            </div>
          ))}
        </div>

        {/* 기대 효과 & 사회적 가치 섹션 (비즈니스 임원 제안 반영) */}
        <div className="mt-40 grid md:grid-cols-2 gap-20 items-center">
           <div>
              <div className="inline-flex items-center gap-2 bg-[#f0f4f1] text-[#566e63] px-5 py-2 rounded-full mb-8">
                 <ShieldCheck size={18} />
                 <span className="text-xs font-black tracking-widest uppercase">Trusted Value</span>
              </div>
              <h2 className="text-4xl font-black text-[#222] mb-8 leading-tight tracking-tighter">
                당신의 구독은 <br/>
                <span className="text-[#566e63]">사회적 가치</span>로 이어집니다
              </h2>
              <div className="space-y-8">
                <div className="flex gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-50 flex items-center justify-center text-[#566e63]">
                      <Zap size={24} />
                   </div>
                   <div>
                      <h4 className="font-black text-[#222] mb-2">고용 창출 및 전문성 강화</h4>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">MoodB의 성장과 함께 심리 상담사, 명상 콘텐츠 제작자, 한방 전문의 등 새로운 헬스케어 일자리가 창출됩니다.</p>
                   </div>
                </div>
                <div className="flex gap-6">
                   <div className="w-12 h-12 rounded-2xl bg-white shadow-md border border-gray-100 flex items-center justify-center text-[#bfa588]">
                      <Heart size={24} />
                   </div>
                   <div>
                      <h4 className="font-black text-[#222] mb-2">정신건강 민주화</h4>
                      <p className="text-gray-500 text-sm font-medium leading-relaxed">수익의 일부는 취약계층의 심리 진단 지원 및 자살 예방 캠페인 등 사회적 안전망 구축에 사용됩니다.</p>
                   </div>
                </div>
              </div>
           </div>
           <div className="bg-[#fcfaf7] rounded-[60px] p-12 border border-gray-100/50">
              <div className="flex items-center gap-3 mb-8">
                 <Sparkles className="text-[#566e63]" />
                 <span className="text-sm font-black text-[#566e63] uppercase tracking-widest">Medical Insight</span>
              </div>
              <p className="text-xl font-medium text-gray-600 mb-8 italic leading-relaxed">
                "MoodB는 단순한 앱이 아닙니다. 보험 수가로 인정받을 수 있는 전문 치료 가이드(오지상승위)를 일상으로 끌어와, 의료 사각지대를 해소하는 경제적 혁신입니다."
              </p>
              <div className="flex items-center gap-4">
                 <div className="w-14 h-14 rounded-full bg-gray-200 border-4 border-white shadow-sm overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?q=80&w=2070&auto=format&fit=crop" alt="Doctor" className="w-full h-full object-cover" />
                 </div>
                 <div>
                    <p className="font-black text-[#222]">Dr. Park</p>
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">Hanbang Neuropsychiatry Specialist</p>
                 </div>
              </div>
           </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
