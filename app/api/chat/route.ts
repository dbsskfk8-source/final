import { NextResponse } from 'next/server'
import { PineconeStore } from '@langchain/pinecone'
import { PineconeEmbeddings } from '@langchain/pinecone'
import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StringOutputParser } from '@langchain/core/output_parsers'
import { getPineconeClient, PINECONE_INDEX_NAME } from '@/utils/pinecone_client'
import { createClient } from '@/utils/supabase/server'

export async function POST(req: Request) {
  try {
    const { message } = await req.json()
    if (!message) return NextResponse.json({ error: '메시지가 없습니다.' }, { status: 400 })

    // 0. Supabase 인증 및 개인화 데이터(Context) 로드
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    let userContextStr = ""
    if (user) {
      // 가장 최근 칠정 데이터 하나 가져오기
      const { data: cseiData } = await supabase.from('csei_results')
        .select('scores')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        
      if (cseiData && cseiData.length > 0) {
        const topEmotions = cseiData[0].scores
          .sort((a: any, b: any) => b.A - a.A)
          .slice(0, 2)
          .map((s: any) => `${s.subject} ${s.A}%`)
          .join(', ')
        userContextStr += `\n[사용자 개인 상황 요약]\n- 최근 감정 상태(높은 지표): ${topEmotions}`
      }

      // 가장 최근 치료 기록 하나 가져오기
      const { data: cureData } = await supabase.from('cure_history')
        .select('thought, thinking_trap')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)

      if (cureData && cureData.length > 0) {
        userContextStr += `\n- 최근 인지 재구성/생각 함정: ${cureData[0].thought} (${cureData[0].thinking_trap})`
      }
      if(userContextStr) {
        userContextStr = `이 사용자에 대해 다음과 같은 최근 분석 데이터가 있습니다. 해당 감정 및 과거 상황을 고려하여 맥락에 맞는 깊이 있는 공감을 먼저 표현하세요:${userContextStr}`
      }
    }

    // 1. Pinecone 인덱스 연결
    const pc = getPineconeClient()
    const pineconeIndex = pc.Index(PINECONE_INDEX_NAME)

    // 2. LangChain PineconeEmbeddings
    const embeddings = new PineconeEmbeddings({
      model: 'llama-text-embed-v2',
      apiKey: process.env.PINECONE_API_KEY!,
    })

    // 3. 기존 인덱스에서 유사도 검색
    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      namespace: 'main',
    })

    const topKResults = await vectorStore.similaritySearch(message, 3)
    const context = topKResults
      .map((doc, i) => `사례 ${i + 1}:\n${doc.pageContent}\n재구성: ${doc.metadata.reframe || doc.metadata.text || '정보 없음'}`)
      .join('\n\n')

    // 4. OpenAI LLM으로 답변 생성
    const llm = new ChatOpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-4o',
      temperature: 0.7,
    })

    const promptTemplate = PromptTemplate.fromTemplate(`
      당신은 공감적이고 전문적인 인지 행동 치료(CBT) 챗봇입니다. 
      아래 제공된 '지식 텍스트'의 치료 사례를 참고하여 사용자의 걱정이나 부정적인 생각을 부드럽게 재구성해주세요.
      {userContextStr}

      [지식 텍스트 (RAG)]
      {context}

      [사용자의 현재 생각]
      {input}

      챗봇의 답변(한국어로 구체적이고 따뜻하게 작성):
    `)

    const chain = promptTemplate.pipe(llm).pipe(new StringOutputParser())
    const response = await chain.invoke({ context, input: message, userContextStr })

    // 5. 채팅 로그를 Pinecone 'logs' 네임스페이스에 저장
    const logDoc = [{
      pageContent: `User: ${message}\nBot: ${response}`,
      metadata: {
        user_message: message,
        bot_response: response,
        timestamp: new Date().toISOString(),
        type: 'chat_log',
      },
    }]

    await PineconeStore.fromDocuments(logDoc, embeddings, {
      pineconeIndex,
      namespace: 'logs',
    })

    return NextResponse.json({ response })
  } catch (error: any) {
    console.error('Chat Error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
