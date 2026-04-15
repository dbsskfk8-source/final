'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Lock, Eye, FileText } from 'lucide-react'

export default function PrivacyPage() {
  const sections = [
    {
      title: '1. 개인정보의 수집 항목 및 방법',
      content: '무드비는 감정 정밀 진단 및 맞춤형 케어 서비스 제공을 위해 최소한의 개인정보를 수집합니다. 수집 항목에는 이메일, 닉네임, 성별, 연령대 및 서비스 이용 과정에서 생성되는 감정 진단 데이터가 포함됩니다.'
    },
    {
      title: '2. 개인정보의 이용 목적',
      content: '수집된 정보는 사용자 본인 확인, 서비스 품질 개선, 개인별 맞춤형 인지행동치료(CBT) 로직 설계, 통계적 분석을 통한 학술 연구 목적으로만 활용됩니다.'
    },
    {
      title: '3. 개인정보의 보유 및 이용 기간',
      content: '사용자의 개인정보는 원칙적으로 서비스 탈퇴 시 지체 없이 파기합니다. 단, 관계 법령에 따라 보전할 필요가 있는 경우 해당 기간 동안 안전하게 보관합니다.'
    },
    {
      title: '4. 개인정보 보호를 위한 노력',
      content: '무드비는 사용자의 데이터를 암호화하여 저장하며, 외부 해킹이나 정보 유출 방지를 위해 기술적/관리적 보호 대책을 철저히 시행하고 있습니다.'
    }
  ]

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#333] font-sans selection:bg-[#566e63]/20">
      {/* Navigation */}
      <header className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-[#e8e0d5] px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-gray-500 hover:text-[#566e63] transition-all font-bold group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> 홈으로 돌아가기
        </Link>
        <div className="text-xl font-black tracking-widest text-[#bfa588]">MoodB</div>
      </header>

      <main className="pt-32 pb-24 px-6 max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="w-16 h-16 bg-[#f0f4f1] text-[#566e63] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm border border-[#e8efe9]">
            <ShieldCheck size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-[#222] mb-6 tracking-tight">개인정보처리방침</h1>
          <p className="text-lg text-gray-500 font-medium">무드비는 사용자의 소중한 감정 데이터와 정보를 안전하게 보호합니다.</p>
        </div>

        {/* Content Cards */}
        <div className="space-y-6">
          {sections.map((section, idx) => (
            <div key={idx} className="bg-white p-8 md:p-10 rounded-[32px] border border-[#f5ebd9] shadow-sm hover:shadow-md transition-shadow">
              <h2 className="text-xl md:text-2xl font-black text-[#222] mb-4 flex items-center gap-3">
                <span className="w-1 h-6 bg-[#566e63] rounded-full"></span>
                {section.title}
              </h2>
              <p className="text-gray-500 leading-relaxed font-medium break-keep text-base md:text-lg">
                {section.content}
              </p>
            </div>
          ))}
        </div>

        {/* Summary Boxes */}
        <div className="grid md:grid-cols-3 gap-6 mt-12">
          <div className="bg-[#f0f4f1]/50 p-6 rounded-3xl border border-[#566e63]/10 text-center">
            <Lock className="mx-auto mb-3 text-[#566e63]" size={24} />
            <span className="block font-bold text-[#222]">데이터 암호화</span>
          </div>
          <div className="bg-[#f5ebd9]/50 p-6 rounded-3xl border border-[#bfa588]/10 text-center">
            <Eye className="mx-auto mb-3 text-[#bfa588]" size={24} />
            <span className="block font-bold text-[#222]">투명한 관리</span>
          </div>
          <div className="bg-[#e8f3f3]/50 p-6 rounded-3xl border border-[#4db4b6]/10 text-center">
            <FileText className="mx-auto mb-3 text-[#4db4b6]" size={24} />
            <span className="block font-bold text-[#222]">법규 준수</span>
          </div>
        </div>

        <footer className="mt-20 text-center text-sm text-gray-400 font-medium pb-20 border-t border-gray-100 pt-10">
          최종 개정일: 2026년 4월 15일 | 무드비 개인정보 보호 위원회
        </footer>
      </main>
    </div>
  )
}
