'use client'

import React, { useRef, useEffect } from 'react'

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  opacity: number
}

export default function NatureCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let animationFrameId: number
    
    // Resize handling
    const resize = () => {
      canvas.width = window.innerWidth
      canvas.height = 300 // Height of the nature strip
    }
    resize()
    window.addEventListener('resize', resize)

    // Particles (Fireflies)
    const particles: Particle[] = []
    const particleCount = 20
    
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 1,
        vy: (Math.random() - 0.5) * 1,
        size: Math.random() * 2 + 1,
        color: '#fdfd96', // Yellowish firefly
        opacity: Math.random()
      })
    }

    // Grass blades
    const grassBlades: { x: number, height: number, offset: number, bend: number }[] = []
    const bladeCount = 150
    for (let i = 0; i < bladeCount; i++) {
      grassBlades.push({
        x: Math.random() * canvas.width,
        height: Math.random() * 40 + 60,
        offset: Math.random() * Math.PI * 2,
        bend: 0
      })
    }

    // Mouse tracking
    let mouseX = -1000
    let mouseY = -1000
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouseX = e.clientX - rect.left
      mouseY = e.clientY - rect.top
    }
    window.addEventListener('mousemove', handleMouseMove)

    const draw = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      
      const wind = Math.sin(time / 1000) * 5

      // Draw Grass
      ctx.strokeStyle = '#566e63'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      
      grassBlades.forEach(blade => {
        const sway = Math.sin(time / 1000 + blade.offset) * 10
        ctx.beginPath()
        ctx.moveTo(blade.x, canvas.height)
        
        // Mouse distance for grass compression effect
        const dx = blade.x - mouseX
        const dy = canvas.height - 20 - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        const bend = dist < 60 ? (dx > 0 ? 40 : -40) * (1 - dist / 60) : 0
        
        ctx.quadraticCurveTo(
          blade.x + wind + bend, 
          canvas.height - blade.height / 2, 
          blade.x + sway + wind + bend, 
          canvas.height - blade.height
        )
        ctx.stroke()
      })

      // Draw Fireflies
      particles.forEach(p => {
        // Move
        p.x += p.vx
        p.y += p.vy
        
        // Boundaries
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1
        
        // Mouse evasion
        const dx = p.x - mouseX
        const dy = p.y - mouseY
        const dist = Math.sqrt(dx * dx + dy * dy)
        
        if (dist < 80) {
          const angle = Math.atan2(dy, dx)
          p.vx += Math.cos(angle) * 1
          p.vy += Math.sin(angle) * 1
        } else {
          // Slow down
          p.vx *= 0.99
          p.vy *= 0.99
          // Random erratic movement
          p.vx += (Math.random() - 0.5) * 0.1
          p.vy += (Math.random() - 0.5) * 0.1
        }

        // Limit speed
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy)
        if (speed > 2) {
          p.vx = (p.vx / speed) * 2
          p.vy = (p.vy / speed) * 2
        }

        // Glow
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 4)
        const alpha = (Math.sin(time / 500 + p.opacity * 10) + 1) / 2
        gradient.addColorStop(0, `rgba(253, 253, 150, ${alpha * 0.8})`)
        gradient.addColorStop(1, 'rgba(253, 253, 150, 0)')
        
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size * 4, 0, Math.PI * 2)
        ctx.fill()
        
        ctx.fillStyle = `rgba(253, 253, 150, ${alpha})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(draw)
    }

    animationFrameId = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  return (
    <div className="w-full overflow-hidden bg-gradient-to-b from-transparent to-[#fdfbf7]/50 mt-20 relative h-[300px]">
      <canvas 
        ref={canvasRef} 
        className="block w-full h-full cursor-none"
      />
      {/* Interactive label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20 text-[#566e63] font-serif italic text-xl select-none">
        안식처의 숨결을 느껴보세요
      </div>
    </div>
  )
}
