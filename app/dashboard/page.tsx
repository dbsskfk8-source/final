'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Search, Filter, Activity, Users, FileText, ChevronDown, Bell, CheckCircle2, AlertCircle, X, Menu } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

// Mock Data for Patients
const MOCK_PATIENTS = [
  { id: 'PT-10023', name: '김하늘', age: 28, gender: '여성', lastTest: '2023-11-20', riskEmotion: '분노', tScore: 78, status: '위험', cbtProgress: 40 },
  { id: 'PT-10045', name: '이바다', age: 34, gender: '남성', lastTest: '2023-11-19', riskEmotion: '우울', tScore: 65, status: '주의', cbtProgress: 80 },
  { id: 'PT-10046', name: '박태양', age: 41, gender: '남성', lastTest: '2023-11-18', riskEmotion: '공포', tScore: 82, status: '위험', cbtProgress: 20 },
  { id: 'PT-10051', name: '최별빛', age: 25, gender: '여성', lastTest: '2023-11-15', riskEmotion: '슬픔', tScore: 59, status: '정상', cbtProgress: 100 },
  { id: 'PT-10088', name: '정우주', age: 52, gender: '여성', lastTest: '2023-11-10', riskEmotion: '생각', tScore: 71, status: '위험', cbtProgress: 0 },
]

export default function DashboardPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<any>(null)
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // Temporary bypass for user request
      setIsAuthorized(true)
    }
    checkAuth()
  }, [])

  const filteredPatients = MOCK_PATIENTS.filter(p => p.name.includes(searchTerm) || p.id.includes(searchTerm))

  if (isAuthorized === false) {
    return (
      <div className="min-h-screen bg-[#faf8f5] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-red-50 text-red-400 rounded-full flex items-center justify-center mb-6">
          <AlertCircle size={40} />
        </div>
        <h1 className="text-3xl font-extrabold text-[#222] mb-4">접근 제한</h1>
        <p className="text-gray-500 font-medium mb-8">
          이 페이지는 의료진(Doctor) 권한이 있는 사용자만 접근할 수 있습니다.<br/>
          (로그인 시 '의료인' 계정으로 로그인해 주세요.)
        </p>
        <button onClick={() => router.push('/')} className="bg-[#566e63] text-white px-8 py-3 rounded-xl font-bold">
          메인 페이지로 돌아가기
        </button>
      </div>
    )
  }

  // 아직 로딩중일 때 빈 화면
  if (isAuthorized === null) return <div className="min-h-screen bg-[#f3ede1]"></div>

  return (
    <div className="min-h-screen bg-[#f3ede1] text-[#333] font-sans selection:bg-[#566e63]/20 flex">
      
      {/* Sidebar for Dashboard */}
      <aside className={`${isSidebarOpen ? 'flex' : 'hidden'} lg:flex flex-col w-[260px] bg-white border-r border-[#e8e0d5] fixed h-full z-[60] transition-all duration-300`}>
        <div className="p-6">
          <div className="flex justify-between items-center mb-10">
            <div className="font-extrabold tracking-widest text-[#bfa588] text-2xl">MoodB<span className="text-sm font-bold text-gray-400 block tracking-normal mt-1">Medical Portal</span></div>
            <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-gray-400">
               <X size={24} />
            </button>
          </div>
          <nav className="flex flex-col gap-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#f5ebd9] text-[#bfa588] font-bold">
              <Users size={18} />
              환자 리스트 뷰어
            </Link>
            <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors font-medium">
              <Activity size={18} />
              메인 서비스로 이동
            </Link>
          </nav>
        </div>
      </aside>

      {/* Main Area */}
      <main className="flex-1 lg:ml-[260px] min-h-screen flex flex-col pt-6 px-6 md:px-10 pb-20">
        
        {/* Mobile Header Toggle */}
        <div className="lg:hidden flex justify-between items-center mb-6 bg-white p-4 rounded-xl border border-[#e8e0d5] shadow-sm">
           <button onClick={() => setIsSidebarOpen(true)} className="p-2 bg-[#faf8f5] rounded-lg text-[#bfa588]">
              <Menu size={24} />
           </button>
           <div className="font-black text-[#566e63] text-lg tracking-tight">MoodB Admin</div>
           <div className="w-10"></div>
        </div>
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4 bg-white p-6 rounded-2xl shadow-sm border border-[#e8e0d5]">
          <div>
            <h1 className="text-responsive-h2">통합 환자 현황 뷰어</h1>
            <p className="text-gray-600 text-lg md:text-[16pt] font-extrabold mt-2">등록된 환자의 CSEI 결과 및 오지상승위치료, CBT 진행 현황입니다.</p>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
            <div className="relative group flex-1 md:w-[280px]">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#bfa588]" />
              <input 
                type="text" 
                placeholder="이름, ID 검색..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#fcfaf5] border border-[#e8e0d5] px-10 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-[#bfa588]/30 transition-all font-medium placeholder-gray-400"
              />
            </div>
            <button className="flex items-center justify-center w-10 h-10 border border-[#e8e0d5] rounded-full text-gray-500 bg-white shadow-sm hover:bg-gray-50 transition-colors shrink-0">
              <Filter size={16} />
            </button>
          </div>
        </header>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-8 rounded-3xl border border-[#e8e0d5] shadow-sm flex items-center gap-6 border-l-8 border-l-[#566e63]">
            <div className="bg-[#f0ece5] p-4 rounded-full text-[#566e63]">
              <Users size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-500">총 등록 환자</p>
              <h3 className="text-4xl font-black text-[#222]">1,208</h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#e8e0d5] shadow-sm flex items-center gap-6 border-l-8 border-l-red-400">
            <div className="bg-red-50 p-4 rounded-full text-red-500">
              <AlertCircle size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-500">위험군 관심 환자</p>
              <h3 className="text-4xl font-black text-[#222]">84</h3>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-[#e8e0d5] shadow-sm flex items-center gap-6 border-l-8 border-l-[#4db4b6]">
            <div className="bg-cyan-50 p-4 rounded-full text-[#4db4b6]">
              <CheckCircle2 size={32} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-500">CBT 솔루션 완료자</p>
              <h3 className="text-4xl font-black text-[#222]">432</h3>
            </div>
          </div>
        </div>

        {/* Table Area */}
        <div className="bg-white border text-sm font-medium border-[#e8e0d5] shadow-sm rounded-2xl overflow-hidden flex-1 flex flex-col">
          <div className="p-4 border-b border-gray-50 flex justify-between items-center lg:hidden">
             <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">환자 데이터 목록</span>
             <span className="text-[10px] text-gray-300 animate-pulse">가로로 밀어서 더 보기 →</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#fcfaf5] border-b border-[#e8e0d5] text-gray-500 uppercase tracking-widest text-[16pt] font-black">
                  <th className="p-8 whitespace-nowrap">환자 ID</th>
                  <th className="p-8 whitespace-nowrap">이름 / 인적</th>
                  <th className="p-8 whitespace-nowrap text-center">진단일</th>
                  <th className="p-8 whitespace-nowrap">주요 취약 감정</th>
                  <th className="p-8 whitespace-nowrap">최고 T-점수</th>
                  <th className="p-8 whitespace-nowrap">상태</th>
                  <th className="p-8 whitespace-nowrap">솔루션 진행률</th>
                  <th className="p-8 text-right whitespace-nowrap">리포트</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? filteredPatients.map((patient, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-[#faf8f5] transition-colors group cursor-pointer text-[16pt]">
                    <td className="p-8 text-gray-500 font-bold">{patient.id}</td>
                    <td className="p-8">
                      <div className="font-black text-[#222] text-[18pt]">{patient.name}</div>
                      <div className="text-sm text-gray-400 mt-1">{patient.age}세 · {patient.gender}</div>
                    </td>
                    <td className="p-8 text-gray-600 text-center">{patient.lastTest}</td>
                    <td className="p-8 text-[#222] font-black bg-[#fcfaf5]">{patient.riskEmotion}</td>
                    <td className="p-8 font-black text-[#bfa588]">{patient.tScore}점</td>
                    <td className="p-8">
                      <span className={`px-5 py-2 rounded-full text-[14pt] font-black ${
                        patient.status === '위험' ? 'bg-red-100 text-red-600' :
                        patient.status === '주의' ? 'bg-orange-100 text-orange-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                    <td className="p-8 w-64">
                      <div className="flex flex-col gap-2">
                        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${patient.cbtProgress === 100 ? 'bg-[#4db4b6]' : 'bg-[#bfa588]'}`} style={{ width: `${patient.cbtProgress}%` }}></div>
                        </div>
                        <span className="text-sm font-black text-gray-400">{patient.cbtProgress}% 완료</span>
                      </div>
                    </td>
                    <td className="p-8 text-right">
                      <button 
                        onClick={() => setSelectedPatient(patient)}
                        className="px-6 py-3 bg-[#566e63] text-white text-sm font-black rounded-xl shadow-lg hover:bg-[#4a5c53] transition-all"
                      >
                        상세보기
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={8} className="p-10 text-center text-gray-400 font-medium">검색된 환자 기록이 없습니다.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
      {/* Mock Detail Modal */}
      {selectedPatient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-[#faf8f5]">
              <div>
                <h2 className="text-xl font-extrabold text-[#222]">{selectedPatient.name} 환자 상세 리포트</h2>
                <p className="text-sm text-gray-500 font-medium">ID: {selectedPatient.id} | 최초 등록일: 2023-01-15</p>
              </div>
              <button onClick={() => setSelectedPatient(null)} className="p-2 bg-white rounded-full text-gray-400 hover:text-[#222] transition-colors border border-gray-200 shadow-sm">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="flex gap-4 mb-8">
                <div className="flex-1 bg-[#fcfaf5] border border-[#e8e0d5] p-5 rounded-xl text-center shadow-sm">
                  <div className="text-gray-500 text-sm font-bold mb-1">최근 주 호소 감정</div>
                  <div className="text-2xl font-extrabold text-[#bfa588]">{selectedPatient.riskEmotion}</div>
                </div>
                <div className="flex-1 bg-[#fcfaf5] border border-[#e8e0d5] p-5 rounded-xl text-center shadow-sm">
                  <div className="text-gray-500 text-sm font-bold mb-1">T-Score 수치</div>
                  <div className="text-2xl font-extrabold text-[#222]">{selectedPatient.tScore}점</div>
                </div>
                <div className="flex-1 bg-[#fcfaf5] border border-[#e8e0d5] p-5 rounded-xl text-center shadow-sm">
                  <div className="text-gray-500 text-sm font-bold mb-1">위험도 판정</div>
                  <div className="text-2xl font-extrabold text-red-500">{selectedPatient.status}</div>
                </div>
              </div>
              
              <h3 className="font-bold text-gray-600 mb-4 px-2 border-b-2 border-[#566e63] inline-block pb-1">CBT 및 명상 진행 기록 (Mock DB)</h3>
              <div className="space-y-4">
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm hover:border-[#bfa588] transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">2023-11-20 14:20</span>
                    <span className="text-xs font-bold text-[#bfa588] bg-[#f5ebd9] px-2 py-1 rounded">CBT 챗봇 진행 (3분)</span>
                  </div>
                  <p className="text-sm font-medium text-[#222]">분노 조절에 대한 인지재구성을 시도함. "내 뜻대로 되지 않으면 폭발할 것 같다"는 핵심 신념을 확인함.</p>
                </div>
                <div className="p-4 border border-gray-100 rounded-xl shadow-sm hover:border-[#566e63] transition-colors">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-bold text-gray-400 bg-gray-100 px-2 py-1 rounded">2023-11-18 09:15</span>
                    <span className="text-xs font-bold text-[#566e63] bg-[#d7eadf] px-2 py-1 rounded">명상 수료 (5분)</span>
                  </div>
                  <p className="text-sm font-medium text-[#222]">아침 명상(분노 치유) 플로우 완료. T-점수가 명상 후 82점에서 78점으로 하락함.</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 border-t border-gray-100 bg-[#fcfaf5] flex justify-end">
              <button 
                onClick={() => alert('실제 배포 환경에서 작동하는 기능입니다.')}
                className="bg-[#566e63] text-white px-6 py-2.5 rounded-lg font-bold hover:bg-[#4a5c53] shadow-md transition-colors"
                >
                히스토리 리포트 다운로드 (PDF)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
