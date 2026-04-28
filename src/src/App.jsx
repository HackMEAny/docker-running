import { useState, useEffect } from 'react'
import './App.css'

// Map of common Docker images to their icons (using emoji for simplicity)
const IMAGE_ICONS = {
  'nginx': '🌐',
  'apache': '🌐',
  'httpd': '🌐',
  'redis': '🔴',
  'postgres': '🐘',
  'mysql': '🐬',
  'mariadb': '🐬',
  'mongo': '🍃',
  'mongodb': '🍃',
  'elasticsearch': '🔍',
  'kibana': '📊',
  'grafana': '📈',
  'prometheus': '📉',
  'jenkins': '⚙️',
  'gitlab': '🦊',
  'wordpress': '📝',
  'nextcloud': '☁️',
  'portainer': '🐳',
  'traefik': '🚦',
  'haproxy': '⚖️',
  'rabbitmq': '🐰',
  'kafka': '📬',
  'zookeeper': '🦓',
  'sonarqube': '📊',
  'nexus': '📦',
  'gitea': '🦆',
  'drone': '🚁',
  'registry': '🗄️',
  'consul': '📋',
  'vault': '🔒',
  'nomad': '🏕️',
  'minio': '💾',
  'influxdb': '∞',
  'telegraf': '📡',
  'fluentd': '🪵',
  'logstash': '📜',
  'filebeat': '📄',
  'metabase': '📊',
  'superset': '📈',
  'airflow': '✈️',
  'jupyter': '📘',
  'node': '🟢',
  'python': '🐍',
  'php': '🐘',
  'java': '☕',
  'tomcat': '🐱',
  'golang': '🐹',
  'rust': '🦀',
  'dotnet': '🔷',
  'mssql': '🗄️',
  'oracle': '🔶',
  'cassandra': '🌙',
  'neo4j': '🕸️',
  'memcached': '💾',
  'homeassistant': '🏠',
  'mosquitto': '🦟',
  'pihole': '🛡️',
  'adguard': '🛡️',
  'plex': '🎬',
  'jellyfin': '🎭',
  'emby': '🎪',
  'lidarr': '🎵',
  'radarr': '🎬',
  'sonarr': '📺',
  'transmission': '📥',
  'qbittorrent': '🧲',
  'calibre': '📚',
  'navidrome': '🎵',
  'tautulli': '📊',
  'default': '📦'
}

function getIconForImage(imageName) {
  const lowerName = imageName.toLowerCase()
  if (IMAGE_ICONS[lowerName]) return IMAGE_ICONS[lowerName]
  for (const [key, icon] of Object.entries(IMAGE_ICONS)) {
    if (lowerName.includes(key)) return icon
  }
  return IMAGE_ICONS['default']
}

function App() {
  const [containers, setContainers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [baseUrl, setBaseUrl] = useState('http://ani.local')

  useEffect(() => {
    fetch('/api/config')
      .then(res => res.json())
      .then(data => {
        if (data.baseUrl) setBaseUrl(data.baseUrl)
      })
      .catch(err => console.error('Failed to fetch config:', err))
  }, [])

  const fetchContainers = async () => {
    try {
      const response = await fetch('/api/containers')
      if (!response.ok) throw new Error('Failed to fetch containers')
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
    const interval = setInterval(fetchContainers, 30000)
    return () => clearInterval(interval)
  }, [])

  const openContainer = (container) => {
    let port = null
    if (container.Ports && container.Ports.length > 0) {
      const portWithPublic = container.Ports.find(p => p.PublicPort)
      if (portWithPublic) port = portWithPublic.PublicPort
    }
    if (!port && container.HostConfig?.PortBindings) {
      const bindings = container.HostConfig.PortBindings
      for (const [key, value] of Object.entries(bindings)) {
        if (value && value.length > 0 && value[0].HostPort) {
          port = parseInt(value[0].HostPort)
          break
        }
      }
    }
    if (port) {
      window.open(`${baseUrl}:${port}/`, '_blank')
    } else {
      alert('No exposed port found for this container')
    }
  }

  if (loading) return <div className="loading">Loading containers...</div>
  if (error) return <div className="error">Error: {error}</div>

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
          {containers.map((container) => {
            const imageName = container.ImageName || 'unknown'
            const icon = getIconForImage(imageName)
            return (
              <div
                key={container.Id}
                className="container-card"
                onClick={() => openContainer(container)}
                style={{ cursor: 'pointer' }}
              >
                <div className="container-icon">{icon}</div>
                <div className="container-name">{container.Names[0].replace('/', '')}</div>
                <div className="container-image">{imageName}</div>
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
            )
          })}
        </div>
      )}
    </div>
  )
}

export default App
