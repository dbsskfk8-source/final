'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.', success: null }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.user) {
    return { error: '이메일 또는 비밀번호가 올바르지 않습니다.', success: null }
  }

  // 역할에 따라 리다이렉트 분기
  const role = data.user.user_metadata?.role
  revalidatePath('/', 'layout')
  
  if (role === 'doctor') {
    redirect('/dashboard')
  } else {
    redirect('/my-situation')
  }
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const role = (formData.get('role') as string) || 'general'

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.', success: null }
  }

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        role,  // 'general' | 'patient' | 'doctor' — user_metadata에 저장됨
      }
    }
  })

  if (error) {
    return { error: error.message, success: null }
  }

  revalidatePath('/', 'layout')
  
  // 의사는 바로 대시보드로
  if (role === 'doctor') {
    redirect('/dashboard')
  } else {
    redirect('/my-situation')
  }
}
