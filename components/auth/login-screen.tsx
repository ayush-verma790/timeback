"use client"

import { useState, useContext } from "react"
import { Loader2, LogIn } from "lucide-react"
import { AppContext } from "../../context/app-context"

export const LoginScreen = () => {
  const { login, isLoading, setBaseUrl }: any = useContext(AppContext)
  const [token, setToken] = useState("")
  const [environment, setEnvironment] = useState<"staging" | "production">("staging")
  const [isGeneratingToken, setIsGeneratingToken] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    if (token) login(token)
  }

  const handleEnvironmentChange = (env: "staging" | "production") => {
    setEnvironment(env)
    // Set the appropriate BASE_URL based on environment
    if (env === "staging") {
      setBaseUrl("https://api.staging.alpha-1edtech.com")
    } else {
      setBaseUrl("https://api.alpha-1edtech.com") // Assuming production URL
    }
  }

  const generateBearerToken = async () => {
    setIsGeneratingToken(true)
    try {
      const authUrl = environment === "staging" 
        ? "https://alpha-auth-development-idp.auth.us-west-2.amazoncognito.com/oauth2/token"
        : "https://alpha-auth-production-idp.auth.us-west-2.amazoncognito.com/oauth2/token"

      const clientId = environment === "staging" 
        ? "2bkvfhtfq5o59goglr7n8pei3m" 
        : "6km4pkf4as1kbmscrlat6cbve2"
      
      const clientSecret = environment === "staging" 
        ? "15sdlh3396vom882vq8ehpb3bbsl0i694977hn9rnf0ij5n3srsr" 
        : "1umq9887b48fapc808iuebungogsvbcshsemockp91pb5g2vssfr"

      const formData = new URLSearchParams()
      formData.append('grant_type', 'client_credentials')
      formData.append('client_id', clientId)
      formData.append('client_secret', clientSecret)

      const response = await fetch(authUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: formData
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setToken(data.access_token)
    } catch (error) {
      console.error('Error generating token:', error)
      alert('Failed to generate token. Please check console for details.')
    } finally {
      setIsGeneratingToken(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-100">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-xl shadow-lg border border-slate-200">
          <h1 className="text-2xl font-bold text-center mb-2 text-slate-900">EduPlatform UI</h1>
          <p className="text-center text-slate-500 mb-6">Enter your Bearer Token to continue.</p>

          <div className="mb-4 flex gap-2">
            <button
              type="button"
              onClick={() => handleEnvironmentChange("staging")}
              className={`flex-1 py-2 px-4 rounded-md border ${environment === "staging" ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
            >
              Staging
            </button>
            <button
              type="button"
              onClick={() => handleEnvironmentChange("production")}
              className={`flex-1 py-2 px-4 rounded-md border ${environment === "production" ? 'bg-blue-100 border-blue-500 text-blue-700' : 'bg-slate-100 border-slate-300 text-slate-700'}`}
            >
              Production
            </button>
          </div>

          <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
              <label htmlFor="token" className="block text-sm font-medium text-slate-700">
                Bearer Token
              </label>
              <button
                type="button"
                onClick={generateBearerToken}
                disabled={isGeneratingToken}
                className="text-xs text-blue-600 hover:text-blue-800 hover:underline disabled:text-blue-300"
              >
                {isGeneratingToken ? 'Generating token...' : 'Generate token'}
              </button>
            </div>
            <textarea
              id="token"
              rows={4}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-2 border border-slate-300 rounded-md shadow-sm font-mono text-xs focus:ring-blue-500 focus:border-blue-500"
              placeholder="Paste your token here or generate one..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !token}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors shadow-sm"
          >
            <Loader2 className={`w-5 h-5 animate-spin ${!isLoading && "hidden"}`} />
            <LogIn className={`w-5 h-5 ${isLoading && "hidden"}`} />
            Login
          </button>
        </form>
      </div>
    </div>
  )
}