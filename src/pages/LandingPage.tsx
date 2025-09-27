
export default function LandingPage() {
  const handleLogin = () => {
    window.location.href = '/api/login'
  }

  return (
    <div className="min-h-screen bg-gradient-primary flex flex-col items-center justify-center p-6">
      <div className="text-center max-w-md">
        <h1 className="text-4xl font-bold text-text-inverse mb-4">
          CelestiNav
        </h1>
        <p className="text-text-inverse/80 mb-8">
          Offline Survival Navigation System with AI-powered weather analysis
        </p>

        <div className="space-y-4">
          <button
            onClick={handleLogin}
            className="w-full bg-gradient-blue text-white py-3 px-6 rounded-button font-semibold hover:bg-blue-600 transition-colors shadow-button hover:shadow-button-hover"
          >
            Login with Replit
          </button>

          <p className="text-text-inverse/60 text-sm">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  )
}