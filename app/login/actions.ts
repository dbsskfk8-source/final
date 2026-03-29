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

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: '로그인에 실패했습니다. 다시 시도해주세요.', success: null }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.', success: null }
  }

  const supabase = await createClient()

  // Supabase Auth SignUp
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    console.error('Signup error:', error.message)
    return { error: `회원가입 실패: ${error.message}`, success: null }
  }

  // 이메일 인증이 켜져 있는 경우 세션이 바로 생기지 않습니다.
  if (!data.session) {
    return { error: null, success: '이메일 인증 메일이 발송되었습니다. 확인 후 로그인해주세요.' }
  }

  revalidatePath('/', 'layout')
  redirect('/')
}
