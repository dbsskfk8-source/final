import { NextResponse } from 'next/server'
import { PineconeStore } from '@langchain/pinecone'
import { PineconeEmbeddings } from '@langchain/pinecone'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { getPineconeClient, PINECONE_INDEX_NAME } from '@/utils/pinecone_client'

// thinking_trap 한국어 변환 맵
const TRAP_KO: Record<string, string> = {
  'emotional reasoning': '감정적 추론',
  'overgeneralizing': '과잉 일반화',
  'catastrophizing': '파국화',
  'black and white thinking': '흑백 논리',
  'mind reading': '독심술 (마음 읽기)',
  'fortune telling': '점쟁이 식 사고',
  'personalizing': '개인화',
  'labeling': '낙인찍기',
  'disqualifying the positive': '긍정 무시하기',
  'magnification': '과장',
  'minimization': '축소',
  'should statements': '당위적 사고',
  'jumping to conclusions': '섣부른 결론',
  'all or nothing thinking': '전부 아니면 전무',
}

function translateTrap(trap: string): string {
  const lower = trap.toLowerCase().trim()
  // 직접 매핑
  if (TRAP_KO[lower]) return TRAP_KO[lower]
  // 부분 매핑
  for (const [en, ko] of Object.entries(TRAP_KO)) {
    if (lower.includes(en)) return ko
  }
  return trap
}

export async function POST(req: Request) {
  try {
    const { situation, thought } = await req.json()

    if (!situation || !thought) {
      return NextResponse.json({ error: '상황과 생각을 모두 입력해주세요.' }, { status: 400 })
    }

    const userInput = `상황: ${situation}\n생각: ${thought}`

    // 1. Pinecone 연결 (LangChain PineconeEmbeddings)
    const pc = getPineconeClient()
    const pineconeIndex = pc.Index(PINECONE_INDEX_NAME)

    const embeddings = new PineconeEmbeddings({
      model: 'llama-text-embed-v2',
      apiKey: process.env.PINECONE_API_KEY!,
    })

    // 2. 유사도 검색으로 관련 사례 5개 조회
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: 'main',
    })

    const results = await vectorStore.similaritySearch(userInput, 5)

    // 검색결과에서 reframe, traps 추출
    const contextItems = results.map(doc => ({
      situation_thought: doc.pageContent,
      reframe: doc.metadata.reframe || '',
      traps: doc.metadata.traps || '',
    }))

    const contextText = contextItems
      .map((item, i) => `사례 ${i + 1}:\n${item.situation_thought}\n재구성: ${item.reframe}\n생각의 함정: ${item.traps}`)
      .join('\n\n')

    // 가장 많이 등장한 trap 추출 (단순 빈도 기반)
    const trapFreq: Record<string, number> = {}
    for (const item of contextItems) {
      const traps = item.traps.split(',').map((t: string) => t.trim().toLowerCase()).filter(Boolean)
      for (const t of traps) {
        trapFreq[t] = (trapFreq[t] || 0) + 1
      }
    }
    const topTrap = Object.entries(trapFreq).sort((a, b) => b[1] - a[1])[0]?.[0] || ''
    const thinkingTrap = translateTrap(topTrap)

    // 3. LangChain + OpenAI로 3가지 reframe 생성
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.8,
    })

    const promptTemplate = PromptTemplate.fromTemplate(`
당신은 인지행동치료(CBT) 전문 상담사입니다.
사용자의 상황과 생각을 분석하고, 아래 참고 사례를 활용하여 3가지 서로 다른 관점으로 인지를 재구성해주세요.

[참고 사례]
{context}

[사용자 입력]
상황: {situation}
생각: {thought}

아래 JSON 형식으로만 응답하세요. 다른 텍스트나 마크다운 없이 JSON만 출력하세요:
{{
  "reframes": [
    {{
      "icon": "perspective",
      "title": "성장의 관점",
      "text": "첫 번째 재구성 문장 (성장과 발전에 초점)"
    }},
    {{
      "icon": "balance", 
      "title": "균형의 관점",
      "text": "두 번째 재구성 문장 (균형 잡힌 시각)"
    }},
    {{
      "icon": "action",
      "title": "행동의 관점",
      "text": "세 번째 재구성 문장 (실천과 행동에 초점)"
    }}
  ]
}}
`)

    const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser())
    const rawResponse = await chain.invoke({
      context: contextText,
      situation,
      thought,
    })

    // JSON 파싱
    let parsed: { reframes: { icon: string; title: string; text: string }[] }
    try {
      const jsonMatch = rawResponse.match(/\{[\s\S]*\}/)
      parsed = JSON.parse(jsonMatch ? jsonMatch[0] : rawResponse)
    } catch {
      // JSON 파싱 실패 시 폴백
      parsed = {
        reframes: [
          { icon: 'perspective', title: '성장의 관점', text: rawResponse.slice(0, 200) },
          { icon: 'balance', title: '균형의 관점', text: '이 상황을 다양한 시각으로 바라볼 수 있습니다.' },
          { icon: 'action', title: '행동의 관점', text: '구체적인 행동으로 변화를 만들어 나갈 수 있습니다.' },
        ],
      }
    }

    return NextResponse.json({
      success: true,
      thinkingTrap,
      reframes: parsed.reframes,
    })
  } catch (error: any) {
    console.error('Reframe API 오류:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
