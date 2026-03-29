import Image from 'next/image'
import AuthForm from './auth-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#faf8f5]">
      {/* Left side: Hero area */}
      <div className="w-full md:w-[45%] lg:w-[40%] bg-[#e8efe9] flex flex-col p-8 md:p-12 lg:p-20 relative overflow-hidden">
        <div className="flex-1 flex flex-col justify-center max-w-[500px] z-10 text-[#4a5c53]">
          <h1 className="text-[2.5rem] leading-[1.1] md:text-5xl lg:text-6xl font-extrabold mb-6 tracking-tight">
            Return to your<br />peace of mind.
          </h1>
          <p className="text-[#64746b] text-lg lg:text-xl font-medium leading-normal mb-12">
            Join our sanctuary of healing and rediscovery. Your journey towards emotional balance continues here.
          </p>
          
          <div className="w-full aspect-[4/3] rounded-3xl overflow-hidden shadow-sm relative mt-4">
            {/* Using a placeholder gradient visually similar to the image, since we don't have the explicit image file */}
            <div className="absolute inset-0 bg-gradient-to-br from-[#4b5d4e] via-[#6f8c67] to-[#e4d173] opacity-90"></div>
            <div className="absolute top-0 right-0 w-[150%] h-[150%] bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-[#fff8be] via-transparent to-transparent opacity-40 mix-blend-overlay"></div>
          </div>
        </div>
        
        {/* Footer brand area */}
        <div className="mt-auto pt-16 flex items-center font-bold text-[#4a5c53] text-lg z-10 gap-3">
          <div className="w-10 h-10 bg-[#566e63] rounded-full flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6 text-white" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22C12 22 20 18 20 12C20 6 12 2 12 2C12 2 4 6 4 12C4 18 12 22 12 22Z" fill="currentColor"/>
              <path d="M12 22V12" stroke="white"/>
            </svg>
          </div>
          Final Service
        </div>
      </div>

      {/* Right side: Auth Form area */}
      <div className="w-full md:w-[55%] lg:w-[60%] flex flex-col items-center justify-center p-8 lg:p-12 min-h-screen md:min-h-0 bg-[#faf8f5]">
        <div className="w-full max-w-[420px] mb-10 text-center flex flex-col items-center">
          <h2 className="text-4xl font-extrabold text-[#2a2e2b] mb-3">Welcome Back</h2>
          <p className="text-gray-500 font-medium">Sign in to your sanctuary</p>
        </div>
        
        <AuthForm />
      </div>
    </div>
  )
}
