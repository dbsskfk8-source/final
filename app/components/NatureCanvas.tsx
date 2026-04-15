'use client'

import React, { useEffect, useRef, useState } from 'react'

interface GrassBlade {
  x: number
  height: number
  width: number
  angle: number
  curve: number
  speed: number
  color: string
}

export default function NatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [grass, setGrass] = useState<GrassBlade[]>([])

  useEffect(() => {
    const blades: GrassBlade[] = []
    const count = 450 // 풍성하게 갯수 증가
    const colors = ['#34d399', '#10b981', '#059669', '#047857', '#065f46', '#064e3b']

    for (let i = 0; i < count; i++) {
      blades.push({
        x: Math.random() * 100, // % 단위
        height: 60 + Math.random() * 120, // 더 풍성한 높이
        width: 3 + Math.random() * 6,
        angle: 0,
        curve: Math.random() * 20 - 10,
        speed: 0.02 + Math.random() * 0.03,
        color: colors[Math.floor(Math.random() * colors.length)]
      })
    }
    setGrass(blades)

    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth
        canvasRef.current.height = 300
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    let animationFrame: number
    const render = (time: number) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // 하단 그라데이션 (땅의 깊이감)
      const groundGrad = ctx.createLinearGradient(0, canvas.height - 50, 0, canvas.height)
      groundGrad.addColorStop(0, 'rgba(255, 255, 255, 0)')
      groundGrad.addColorStop(1, 'rgba(236, 253, 245, 0.5)')
      ctx.fillStyle = groundGrad
      ctx.fillRect(0, canvas.height - 50, canvas.width, 50)

      // 잔디 그리기
      blades.forEach((blade, i) => {
        const x = (blade.x / 100) * canvas.width
        const y = canvas.height
        
        // 바람 효과 (사인파)
        const wind = Math.sin(time * 0.002 + blade.x) * 15

        ctx.beginPath()
        ctx.moveTo(x, y)
        
        // 2번 사진처럼 부드러운 곡선의 잔디 구현
        const cp1x = x + blade.curve
        const cp1y = y - blade.height / 2
        const cp2x = x + blade.curve + wind
        const cp2y = y - blade.height
        
        ctx.quadraticCurveTo(cp1x, cp1y, cp2x, cp2y)
        
        ctx.lineWidth = blade.width
        ctx.strokeStyle = blade.color
        ctx.lineCap = 'round'
        ctx.stroke()

        // 끝부분에 살짝 더 밝은 색으로 하이라이트 (입체감)
        ctx.beginPath()
        ctx.moveTo(cp1x, cp1y)
        ctx.quadraticCurveTo(cp1x + wind * 0.5, cp1y - 10, cp2x, cp2y)
        ctx.lineWidth = blade.width / 2
        ctx.strokeStyle = 'rgba(255,255,255,0.2)'
        ctx.stroke()
      })

      animationFrame = requestAnimationFrame(render)
    }

    animationFrame = requestAnimationFrame(render)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(animationFrame)
    }
  }, [])

  return (
    <div className="relative w-full h-[250px] bg-white overflow-hidden">
      <div className="absolute top-0 left-0 w-full text-center z-10">
         <p className="text-sm font-black text-[#566e63] opacity-20 tracking-[0.6em] pointer-events-none uppercase">Breath of the Shelter</p>
      </div>
      <canvas 
        ref={canvasRef} 
        className="absolute bottom-0 left-0 w-full h-full pointer-events-none"
      />
      {/* 반딧불이 효과 추가 */}
      {[...Array(12)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[2px] animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${50 + Math.random() * 40}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${2 + Math.random() * 3}s`,
            opacity: 0.4
          }}
        />
      ))}
    </div>
  )
}
