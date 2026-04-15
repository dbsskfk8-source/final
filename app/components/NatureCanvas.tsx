'use client'

import React from 'react'

export default function NatureCanvas() {
  return (
    <div className="relative w-full h-[180px] bg-white overflow-hidden select-none pointer-events-none">
      <div className="absolute top-4 left-0 w-full text-center z-20">
         <p className="text-[10px] font-black text-[#566e63] opacity-20 tracking-[0.8em] uppercase">Breath of Nature</p>
      </div>
      
      {/* 2D 잔디 일러스트 레이어 (CSS/SVG 기반) */}
      <div className="absolute bottom-0 left-0 w-full h-full flex items-end">
        <svg 
          viewBox="0 0 1440 200" 
          preserveAspectRatio="none" 
          className="w-full h-full animate-soft-sway"
        >
          <defs>
            <linearGradient id="grassGrad" x1="0%" y1="100%" x2="0%" y2="0%">
              <stop offset="0%" stopColor="#22c55e" />
              <stop offset="100%" stopColor="#86efac" />
            </linearGradient>
            
            {/* 개별 잔디 가닥 템플릿 */}
            <symbol id="grass-blade">
              <path d="M0,0 Q2,-15 5,-30 Q8,-15 10,0 Z" fill="url(#grassGrad)" opacity="0.8" />
            </symbol>
            
            <symbol id="grass-tall">
               <path d="M0,0 Q-2,-40 0,-80 T5,-120" stroke="#4ade80" fill="none" strokeWidth="1" opacity="0.6" />
               <circle cx="5" cy="-120" r="1.5" fill="#fde047" opacity="0.4" />
            </symbol>
          </defs>

          {/* 배경이 되는 빽빽한 잔디 레이어 (2D 일러스트 느낌) */}
          {[...Array(120)].map((_, i) => (
            <use 
              key={`bg-${i}`} 
              href="#grass-blade" 
              x={i * 12 + (Math.random() * 5)} 
              y={200} 
              scale={0.5 + Math.random()} 
            />
          ))}

          {/* 포인트가 되는 긴 줄기들 (첨부사진 스타일) */}
          {[...Array(40)].map((_, i) => (
            <use 
              key={`tall-${i}`} 
              href="#grass-tall" 
              x={i * 40 + (Math.random() * 20)} 
              y={200}
              className="animate-sway"
              style={{ animationDelay: `${Math.random() * 4}s` }}
            />
          ))}
        </svg>
      </div>

      <style jsx>{`
        @keyframes soft-sway {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        .animate-sway {
          animation: sway 5s ease-in-out infinite alternate;
          transform-origin: bottom;
        }
        @keyframes sway {
          from { transform: skewX(-2deg); }
          to { transform: skewX(2deg); }
        }
      `}</style>

      {/* 반딧불이 (유지) */}
      {[...Array(8)].map((_, i) => (
        <div 
          key={i}
          className="absolute w-1 h-1 bg-yellow-200 rounded-full blur-[2.5px] animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${40 + Math.random() * 40}%`,
            animationDelay: `${Math.random() * 3}s`,
            animationDuration: `${2 + Math.random() * 2}s`,
            opacity: 0.3
          }}
        />
      ))}
    </div>
  )
}
