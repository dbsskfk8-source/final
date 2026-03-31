import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'

// thinking_trap 한국어 변환 맵 (reframe route와 동일)
const TRAP_KO: Record<string, string> = {
  'emotional reasoning': '감정적 추론',
  'overgeneralizing': '과잉 일반화',
  'catastrophizing': '파국화',
  'black and white thinking': '흑백 논리',
  'all-or-nothing thinking': '흑백 논리',
  'all or nothing thinking': '흑백 논리',
  'mind reading': '독심술 (마음 읽기)',
  'fortune telling': '점쟁이 식 사고',
  'personalizing': '개인화',
  'labeling': '낙인찍기',
  'disqualifying the positive': '긍정 무시하기',
  'magnification': '과장',
  'minimization': '축소',
  'should statements': '당위적 사고',
  'jumping to conclusions': '섣부른 결론',
}

function translateTrap(trap: string): string {
  const lower = trap.toLowerCase().trim()
  if (TRAP_KO[lower]) return TRAP_KO[lower]
  for (const [en, ko] of Object.entries(TRAP_KO)) {
    if (lower.includes(en)) return ko
  }
  // "(숫자%)" 형식 제거하고 반환
  return trap.replace(/\s*\(\d+%\)\s*$/, '').trim()
}

export async function POST(req: Request) {
  try {
    const { thought, situation } = await req.json()

    if (!thought) {
      return NextResponse.json({ message: 'Thought is required' }, { status: 400 })
    }

    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0,
      maxTokens: 50,
    })

    const prompt = `Here are examples of cognitive distortion classification:

Thought: "Everyone will hate me"
Cognitive Distortion: Mind Reading (85%)

Thought: "I will fail again"
Cognitive Distortion: Fortune Telling (90%)

Thought: "I am completely worthless"
Cognitive Distortion: Labeling (80%)

Thought: "If it's not perfect, it's a failure"
Cognitive Distortion: All-or-Nothing Thinking (75%)

Thought: "The worst will happen"
Cognitive Distortion: Catastrophizing (88%)

---

Situation: ${situation || ''}
Thought: ${thought}
Cognitive Distortion:`

    const response = await llm.invoke([
      { role: 'system', content: 'You are an expert in identifying cognitive distortions. Respond with only the distortion name and confidence percentage, nothing else.' },
      { role: 'user', content: prompt },
    ])

    const raw = typeof response.content === 'string' ? response.content.trim() : ''
    const thinkingTrap = translateTrap(raw)

    return NextResponse.json({ thinking_trap: thinkingTrap })
  } catch (error: any) {
    console.error('Classify API 오류:', error)
    return NextResponse.json(
      { message: error.message || 'Internal Server Error' },
      { status: 500 }
    )
  }
}
