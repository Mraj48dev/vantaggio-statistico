'use client'

import { useEffect, useState } from 'react'

interface BuildInfo {
  buildTime: string
  commitHash: string
  deployTime: string
  version: string
  environment: string
  vercelUrl?: string
  lastUpdate: string
}

export default function DeploymentInfo() {
  const [buildInfo, setBuildInfo] = useState<BuildInfo | null>(null)
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const fetchAndLogBuildInfo = async () => {
      try {
        // Fetch build info
        const buildRes = await fetch('/api/build-info')
        const buildData = await buildRes.json()
        setBuildInfo(buildData)

        // Save to develog database
        await fetch('/api/develog', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            commitHash: buildData.commitHash || 'unknown',
            buildTime: buildData.buildTime || new Date().toISOString(),
            version: buildData.version || '1.0.0',
            environment: buildData.environment || 'development',
            vercelUrl: buildData.vercelUrl,
            description: buildData.lastUpdate || 'Deploy info widget loaded'
          })
        })
      } catch (error) {
        console.error('Error fetching or logging build info:', error)
      }
    }

    fetchAndLogBuildInfo()
  }, [])

  if (!buildInfo || !isVisible) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-4 rounded-lg shadow-lg border border-yellow-500/30 text-xs max-w-sm z-50">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-bold text-yellow-500">🚀 Deploy Info</h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white ml-2"
        >
          ×
        </button>
      </div>

      <div className="space-y-1">
        <div><strong>Last Update:</strong> {buildInfo.lastUpdate}</div>
        <div><strong>Deploy:</strong> {new Date(buildInfo.deployTime).toLocaleString('it-IT')}</div>
        <div><strong>Commit:</strong> {buildInfo.commitHash.substring(0, 8)}</div>
        <div><strong>Env:</strong> {buildInfo.environment}</div>
        <div><strong>Version:</strong> {buildInfo.version}</div>
      </div>

      <div className="mt-2 pt-2 border-t border-gray-700">
        <div className="text-green-400 text-xs">
          ✅ Premium Methods Available
        </div>
        <a
          href="/develog"
          className="text-blue-400 hover:text-blue-300 text-xs mt-1 block"
        >
          📊 View Deploy History
        </a>
      </div>
    </div>
  )
}