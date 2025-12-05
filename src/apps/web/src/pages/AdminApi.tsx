import React, { useEffect, useState } from 'react'
import axios from 'axios'

const AdminApi: React.FC = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking')
  const [apiVersion, setApiVersion] = useState<string>('')

  // Prefer env-based API base URL; fallback to local backend
  const API_BASE = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:8000'

  const check = async () => {
    setLoading(true)
    setError(null)
    setData(null)

    try {
      // axios to explicit backend host/port (dev-friendly), 3s timeout
      const url = `${API_BASE}/api/health`
      const response = await axios.get(url, { timeout: 3000 })

      setData({ endpoint: url, status: 'ok', body: response.data })
      if (response.data?.status === 'healthy') {
        setApiStatus('connected')
        setApiVersion(response.data?.version || '')
      } else {
        setApiStatus('disconnected')
      }
      setLoading(false)
    } catch (e: any) {
      setApiStatus('disconnected')
      setError(e?.message || 'Request failed')
      setLoading(false)
    }
  }

  useEffect(() => {
    check()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">
      <div className="max-w-3xl mx-auto bg-white/95 p-8 rounded-2xl shadow-md">
        <h2 className="text-2xl font-bold mb-4">Admin: Backend API Connectivity</h2>

        {/* API Status Card */}
        <div className={`p-6 rounded-lg shadow-md mb-6 ${
          apiStatus === 'connected' ? 'bg-green-50 border border-green-200' :
          apiStatus === 'disconnected' ? 'bg-red-50 border border-red-200' :
          'bg-gray-50 border border-gray-200'
        }`}>
          <h3 className="text-xl font-semibold mb-3 text-gray-800">Backend API Status</h3>

          <div className="flex items-center gap-3 mb-3">
            <div className={`w-3 h-3 rounded-full ${
              apiStatus === 'connected' ? 'bg-green-500' :
              apiStatus === 'disconnected' ? 'bg-red-500' :
              'bg-gray-400 animate-pulse'
            }`} />
            <span className="font-medium text-gray-700">
              {apiStatus === 'connected' && `Connected ${apiVersion ? `(v${apiVersion})` : ''}`}
              {apiStatus === 'disconnected' && 'Not Connected'}
              {apiStatus === 'checking' && 'Checking...'}
            </span>
          </div>

          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Endpoint:</span>{' '}
              <a href={API_BASE} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {API_BASE}
              </a>
            </p>
            <p>
              <span className="font-medium">API Docs:</span>{' '}
              <a href={`${API_BASE}/docs`} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {`${API_BASE}/docs`}
              </a>
            </p>
            {apiStatus === 'disconnected' && (
              <p className="text-red-600 mt-2">
                 Make sure the backend server is running:
                <br />
                <code className="bg-red-100 px-2 py-1 rounded text-xs">
                  cd src\apps\api &amp;&amp; .venv\Scripts\python.exe -m uvicorn brightsum_api.main:app --reload
                </code>
              </p>
            )}
          </div>
        </div>

        <div className="mb-4">
          <button
            onClick={check}
            className="px-4 py-2 bg-slate-900 text-white rounded-md mr-3"
            disabled={loading}
          >
            {loading ? 'Checking…' : 'Check API'}
          </button>
        </div>

        {error && (
          <div className="mb-4 text-red-600">
            <h4 className="font-semibold">Errors</h4>
            <pre className="whitespace-pre-wrap">{error}</pre>
          </div>
        )}

        {data ? (
          <div>
            <h4 className="font-semibold">Success</h4>
            <p className="text-sm text-slate-600 mb-2">Endpoint: <code>{data.endpoint}</code></p>
            <pre className="bg-slate-100 p-3 rounded-md overflow-auto">{JSON.stringify(data.body, null, 2)}</pre>
          </div>
        ) : (
          !loading && <p className="text-slate-600">No successful response yet. Use the button to retry.</p>
        )}
      </div>
    </main>
  )
}

export default AdminApi
