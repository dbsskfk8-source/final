"use server"

import { createClient } from "@/utils/supabase/server"

/**
 * 의사에게 배정된 환자 목록 및 기본 정보 조회
 */
export async function getAssignedPatients() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // medical_assignments 테이블과 profiles 테이블을 조인하여 환자 정보 획득
  const { data, error } = await supabase
    .from("medical_assignments")
    .select(`
      patient_id,
      profiles:patient_id (
        id,
        email,
        age,
        gender,
        role,
        credits
      )
    `)
    .eq("doctor_id", user.id)

  if (error) {
    console.error("Error fetching patients:", error)
    return []
  }

  // 조인 결과 정규화 (profiles가 단일 객체로 오지 않을 경우 대비)
  return data.map((d: any) => d.profiles).filter(Boolean)
}

/**
 * 특정 환자의 모든 진단 이력 및 임상 데이터 조회
 */
export async function getPatientResults(patientId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from("diagnostic_results")
    .select("*")
    .eq("user_id", patientId)
    .order("created_at", { ascending: true })

  if (error) {
    console.error("Error fetching results:", error)
    return []
  }

  return data
}

/**
 * 사용자 정보 (Role 등) 상세 조회
 */
export async function getUserProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (error) {
    console.error("Error fetching profile:", error)
    return null
  }

  return data
}
