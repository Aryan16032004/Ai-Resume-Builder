import { Link } from 'react-router-dom'
import { Button } from './ui/button'

function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col md:flex-row items-center justify-center gap-8 px-4 py-12 max-w-6xl mx-auto">

        <div className="flex-1 space-y-6 text-center md:text-left">
          <div className="flex justify-center md:justify-start">
            <div className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ResumeIt
            </div>
            <span className="ml-2 text-5xl font-bold">✨</span>
          </div>
          
          <h1 className="text-4xl font-bold leading-tight">
            Build a professional resume for free
          </h1>
          
          <p className="text-lg text-gray-600 max-w-lg">
            Create a standout resume in minutes that gets you noticed by employers.
            Our AI-powered builder helps you craft the perfect application.
          </p>
          
          <div className="flex gap-4 justify-center md:justify-start">
            <Button asChild className=" px-6 py-6 text-lg" >
              <Link to="/templates">Create Resume</Link>
            </Button>
             <Button asChild className=" px-6 py-6 text-lg" >
              <Link to="/ats">Check ATS Score</Link>
            </Button>
          </div>
        </div>
        
      <div className="flex-1 flex justify-center relative">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-300 rounded-full mix-blend-multiply opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-20 -left-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply opacity-20 animate-blob" />
        
        <div className="relative">
          <img 
            src="/CV.jpg" 
            alt="Resume Example"
            className="relative z-10 rounded-xl shadow-xl w-full max-w-md border-8 border-white transform hover:scale-105 transition-all duration-300"
          />
          <div className="absolute inset-0 bg-blue-100 rounded-xl shadow-lg transform rotate-3 -z-10" />
        </div>
      </div>
      </main>
  )
}

export default LandingPage
