import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchContainers = async () => {
    try {
      const response = await fetch('/api/containers')
      if (!response.ok) {
        throw new Error('Failed to fetch containers')
      }
      const data = await response.json()
      setContainers(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContainers()
    const interval = setInterval(fetchContainers, 30000) // Refresh every 30 seconds
    return () => clearInterval(interval)
  }, [])

  const openContainer = (ports) => {
    if (ports && ports.length > 0) {
      const port = ports[0].PublicPort
      const url = `http://ani.local:${port}/`
      window.open(url, '_blank')
    }
  }

  if (loading) {
    return <div className="loading">Loading containers...</div>
  }

  if (error) {
    return <div className="error">Error: {error}</div>
  }

  return (
    <div className="app">
      <header className="header">
        <h1>🐳 Docker Containers</h1>
        <p>Click on a container to open its port</p>
      </header>

      {containers.length === 0 ? (
        <div className="no-containers">
          <p>No running containers found</p>
        </div>
      ) : (
        <div className="container-grid">
          {containers.map((container) => (
            <div
              key={container.Id}
              className="container-card"
              onClick={() => openContainer(container.Ports)}
              style={{ cursor: container.Ports?.length > 0 ? 'pointer' : 'default' }}
            >
              <div className="container-name">{container.Names[0].replace('/', '')}</div>
              <div className="container-id">{container.Id.substring(0, 12)}</div>
              <div className="container-status">{container.Status}</div>
              {container.Ports && container.Ports.length > 0 && (
                <div className="container-ports">
                  {container.Ports.map((port, idx) => (
                    <div key={idx} className="port-badge">
                      Port: {port.PublicPort}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default App
