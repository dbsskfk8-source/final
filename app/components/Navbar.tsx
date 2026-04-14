'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, User, LogOut, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
    }
    getUser()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    router.refresh()
    router.push('/')
  }

  const navLinks = [
    { name: 'MoodB 소개', href: '/about' },
    { name: '인지재구성(Cure)', href: '/select' },
    { name: '마이페이지', href: '/my-situation' },
    { name: '심리상담 챗봇', href: '/chat' },
    { name: '관리자 뷰어', href: '/dashboard', highlight: true },
  ]

  return (
    <header 
      className={`fixed top-0 w-full z-[100] transition-all duration-300 px-6 md:px-10 py-4 md:py-6 ${
        isScrolled ? 'bg-white/80 backdrop-blur-lg shadow-sm' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center text-gray-500">
        <Link href="/" className="z-[110]">
          <img src="/moodb-logo.svg" alt="MoodB" className="h-8 md:h-10 w-auto" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex gap-10 font-bold text-sm tracking-tight text-gray-500">
          {navLinks.map((link) => (
            <Link 
              key={link.href} 
              href={link.href} 
              className={`hover:text-[#566e63] transition-colors ${link.highlight ? 'text-[#bfa588] font-black' : ''}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions (Desktop) */}
        <div className="hidden lg:flex items-center gap-6">
          {user ? (
            <div className="flex items-center gap-6 font-bold">
              <span className="text-gray-400 text-sm tracking-widest">{user.user_metadata?.full_name || 'wwww'}</span>
              <button 
                onClick={handleLogout}
                className="flex items-center gap-2 text-gray-400 hover:text-black transition-colors text-sm"
              >
                <div className="bg-gray-100 p-2 rounded-full">
                  <LogOut size={16} />
                </div>
                <span>로그아웃</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/login" className="text-sm font-bold hover:text-black">로그인</Link>
              <Link href="/login" className="bg-[#566e63] text-white px-6 py-2 rounded-full text-xs font-black shadow-lg shadow-[#566e63]/20 hover:bg-[#4a5c53] transition-all">
                마이페이지
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="lg:hidden z-[110] p-2 text-gray-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {/* Mobile Menu Overlay */}
        <div 
          className={`fixed inset-0 bg-white z-[100] flex flex-col pt-32 px-10 transition-transform duration-500 ease-in-out lg:hidden ${
            isOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          <nav className="flex flex-col gap-8 mb-12">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                onClick={() => setIsOpen(false)}
                className={`text-2xl font-black flex items-center justify-between group ${
                  link.highlight ? 'text-[#bfa588]' : 'text-[#222]'
                }`}
              >
                {link.name}
                <ChevronRight className="opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </nav>

          <div className="mt-auto pb-12 border-t border-gray-100 pt-8 flex flex-col gap-4">
            {user ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                   <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-[#566e63] font-bold">
                     <User size={20} />
                   </div>
                   <span className="font-bold text-gray-700">{user.email}</span>
                </div>
                <button 
                  onClick={handleLogout}
                  className="w-full py-4 border border-gray-200 rounded-2xl font-bold text-gray-500 hover:bg-gray-50 flex items-center justify-center gap-2"
                >
                  <LogOut size={18} /> 로그아웃
                </button>
                <Link 
                  href="/my-situation" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-[#566e63] text-white rounded-2xl font-bold text-center shadow-lg"
                >
                  마이페이지 바로가기
                </Link>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 border border-gray-200 rounded-2xl font-bold text-center text-[#222]"
                >
                  로그인
                </Link>
                <Link 
                  href="/login" 
                  onClick={() => setIsOpen(false)}
                  className="w-full py-4 bg-[#566e63] text-white rounded-2xl font-bold text-center shadow-lg"
                >
                  회원가입 시작하기
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
