'use client'

import { useEffect, useState } from 'react'

interface DevLogData {
  id: string
  commitHash: string
  shortCommitHash: string
  deployTime: string
  formattedDeployTime: string
  buildTime: string
  version: string
  environment: string
  vercelUrl?: string
  description: string
  isProduction: boolean
  isRecent: boolean
  createdAt: string
}

interface DevLogResponse {
  devLogs: DevLogData[]
  totalCount: number
  pagination: {
    limit: number
    offset: number
    hasMore: boolean
  }
}

export default function DevLogPage() {
  const [devLogs, setDevLogs] = useState<DevLogData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDevLogs()
  }, [])

  const fetchDevLogs = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/develog')

      if (!response.ok) {
        throw new Error('Failed to fetch dev logs')
      }

      const data: DevLogResponse = await response.json()
      setDevLogs(data.devLogs)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-500 mb-6">📊 DevLog - Deploy History</h1>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500 mx-auto"></div>
            <p className="mt-4">Loading deployment history...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-yellow-500 mb-6">📊 DevLog - Deploy History</h1>
          <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
            <p className="text-red-400">Error: {error}</p>
            <button
              onClick={fetchDevLogs}
              className="mt-2 px-4 py-2 bg-red-600 hover:bg-red-700 rounded text-white text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-yellow-500">📊 DevLog - Deploy History</h1>
          <button
            onClick={fetchDevLogs}
            className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-black font-semibold"
          >
            🔄 Refresh
          </button>
        </div>

        {devLogs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-400">No deployment logs found.</p>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Deploy Time
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Commit
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Version
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Environment
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {devLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-700/50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-white">{log.formattedDeployTime}</div>
                        <div className="text-xs text-gray-400">{log.buildTime}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <code className="px-2 py-1 bg-gray-600 rounded text-xs font-mono">
                            {log.shortCommitHash}
                          </code>
                          {log.vercelUrl && (
                            <a
                              href={log.vercelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-2 text-blue-400 hover:text-blue-300"
                            >
                              🔗
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs rounded">
                          {log.version}
                        </span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded ${
                          log.isProduction
                            ? 'bg-green-600 text-white'
                            : 'bg-orange-600 text-white'
                        }`}>
                          {log.environment}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-white max-w-md">{log.description}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {log.isRecent && (
                            <span className="px-2 py-1 bg-yellow-600 text-black text-xs rounded font-semibold">
                              🔥 NEW
                            </span>
                          )}
                          <span className="text-green-400">✅</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-400 text-center">
          Total deployments: {devLogs.length} | Last updated: {new Date().toLocaleString('it-IT')}
        </div>
      </div>
    </div>
  )
}