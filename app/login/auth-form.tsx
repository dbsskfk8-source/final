'use client'

import { useState, useActionState, useEffect } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import { login, signup } from './actions'
import { useFormStatus } from 'react-dom'

function SubmitButton({ isLogin }: { isLogin: boolean }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className={`w-full py-3.5 px-4 rounded-full text-white font-medium text-lg mt-6 shadow-sm hover:opacity-90 transition-opacity disabled:opacity-50
        ${isLogin ? 'bg-[#566e63]' : 'bg-[#1e293b]'}`}
    >
      {pending ? '처리 중...' : (isLogin ? '로그인' : '회원가입')}
    </button>
  )
}

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  
  const [loginState, loginAction] = useActionState(login, null)
  const [signupState, signupAction] = useActionState(signup, null)
  
  const state = isLogin ? loginState : signupState
  
  return (
    <div className="w-full max-w-[400px] flex flex-col items-center">
      {/* Social Login placeholders (Visual only as requested) */}
      <div className="w-full space-y-3 mb-6">
        <button type="button" className="w-full py-3 px-4 border border-gray-200 rounded-full flex items-center justify-center gap-3 text-sm font-medium hover:bg-gray-50 transition-colors">
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Google로 계속하기
        </button>
        <div className="flex gap-3">
          <button type="button" className="flex-1 py-3 px-4 bg-[#03C75A] text-white rounded-full flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#02b351] transition-colors">
            <span className="font-extrabold pb-[2px]">N</span> 네이버
          </button>
          <button type="button" className="flex-1 py-3 px-4 bg-[#FEE500] text-[#191919] rounded-full flex items-center justify-center gap-2 text-sm font-bold hover:bg-[#f4dc00] transition-colors">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 3c-5.5 0-10 3.5-10 7.8 0 2.8 1.8 5.2 4.5 6.4-.3 1-.9 2.9-.9 3 0 .2.2.3.4.2 1.4-1 3.5-2.6 4-3 .6.2 1.3.3 2 .3 5.5 0 10-3.5 10-7.8S17.5 3 12 3z"/>
            </svg>
            카카오톡
          </button>
        </div>
      </div>

      <div className="w-full relative flex items-center justify-center mb-6">
        <div className="border-t border-gray-200 w-full absolute"></div>
        <span className="bg-[#faf8f5] px-4 text-xs text-gray-600 relative z-10">또는 이메일로 로그인</span>
      </div>

      {/* Auth Form (Email+Password) */}
      <form action={isLogin ? loginAction : signupAction} className="w-full flex flex-col gap-4">
        {state?.error && (
          <div className="p-3 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm mb-2">
            {state.error}
          </div>
        )}
        {state?.success && (
          <div className="p-3 bg-green-50 text-green-600 border border-green-200 rounded-xl text-sm mb-2">
            {state.success}
          </div>
        )}
        
        <div className="flex flex-col gap-2">
          <label className="text-sm text-gray-600 font-medium">이메일 주소</label>
          <input 
            name="email"
            type="email" 
            placeholder="name@example.com"
            required
            className="w-full py-4 px-5 bg-[#f0ebd8] bg-opacity-40 rounded-[24px] border-none focus:outline-none focus:ring-2 focus:ring-[#566e63]/20"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-sm text-gray-600 font-medium">비밀번호</label>
            {isLogin && (
              <a href="#" className="text-xs text-gray-500 font-medium">비밀번호 찾기</a>
            )}
          </div>
          <div className="relative">
            <input 
              name="password"
              type={showPassword ? "text" : "password"} 
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full py-4 px-5 bg-[#f0ebd8] bg-opacity-40 rounded-[24px] border-none focus:outline-none focus:ring-2 focus:ring-[#566e63]/20 tracking-widest text-lg"
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <SubmitButton isLogin={isLogin} />
      </form>

      <div className="mt-8 text-sm text-gray-600 font-medium">
        {isLogin ? "계정이 없으신가요? " : "이미 계정이 있으신가요? "}
        <button 
          onClick={() => setIsLogin(!isLogin)} 
          className="text-[#566e63] font-bold hover:underline"
        >
          {isLogin ? "새로운 안식처 만들기" : "지금 로그인하기"}
        </button>
      </div>
    </div>
  )
}
