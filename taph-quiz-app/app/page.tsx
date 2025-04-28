import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-4xl font-bold mb-6">Software Testing Quiz Platform</h1>
      <p className="text-xl mb-8 max-w-2xl">
        Test your knowledge on various software testing topics and compete with others.
      </p>
      
      <div className="flex gap-4">
        <Link 
          href="/login" 
          className="px-6 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          Log In
        </Link>
        <Link 
          href="/register" 
          className="px-6 py-3 border border-indigo-600 text-indigo-600 rounded-md hover:bg-indigo-50 transition-colors"
        >
          Register
        </Link>
      </div>
    </div>
  )
}