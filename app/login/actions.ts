'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { cookies } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.', success: null }
  }

  const cookieStore = await cookies()
  cookieStore.set('mock_user_email', email, { path: '/' })

  revalidatePath('/', 'layout')
  redirect('/my-situation')
}

export async function signup(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: '이메일과 비밀번호를 입력해주세요.', success: null }
  }

  const cookieStore = await cookies()
  cookieStore.set('mock_user_email', email, { path: '/' })

  revalidatePath('/', 'layout')
  redirect('/my-situation')
}
