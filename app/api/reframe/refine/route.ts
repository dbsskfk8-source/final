import { NextResponse } from 'next/server'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'

type RefineMode = 'empathy' | 'action' | 'specific'

const REFINE_INSTRUCTIONS: Record<RefineMode, string> = {
  empathy: '더 따뜻하고 공감적인 어조로, 감정을 충분히 인정하며 위로하는 방식으로',
  action: '더 실행력 있고 구체적인 행동 방안이 담기도록, 실천 가능한 단계를 제시하는 방식으로',
  specific: '더 구체적이고 상세하게, 현실적인 예시나 세부 사항을 포함하는 방식으로',
}

export async function POST(req: Request) {
  try {
    const { originalText, mode, situation, thought } = await req.json()

    if (!originalText || !mode) {
      return NextResponse.json({ error: '텍스트와 다듬기 방향을 입력해주세요.' }, { status: 400 })
    }

    const instruction = REFINE_INSTRUCTIONS[mode as RefineMode]
    if (!instruction) {
      return NextResponse.json({ error: '올바른 다듬기 방향을 선택해주세요.' }, { status: 400 })
    }

    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.7,
    })

    const promptTemplate = PromptTemplate.fromTemplate(`
당신은 인지행동치료(CBT) 전문 상담사입니다.
아래의 인지 재구성 문장을 "{instruction}" 수정해주세요.

[원본 상황]
상황: {situation}
생각: {thought}

[원본 재구성 문장]
{originalText}

수정된 재구성 문장만 출력하세요. 추가 설명, 제목, 마크다운 없이 한 단락으로만 작성하세요.
`)

    const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser())
    const refinedText = await chain.invoke({
      instruction,
      situation: situation || '',
      thought: thought || '',
      originalText,
    })

    return NextResponse.json({
      success: true,
      refinedText: refinedText.trim(),
    })
  } catch (error: any) {
    console.error('Refine API 오류:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
