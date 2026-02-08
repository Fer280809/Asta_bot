// Utilidades adicionales para AstaFile

// Gestión de temas
const ThemeManager = {
  init() {
    const savedTheme = localStorage.getItem('astafile_theme') || 'dark'
    this.setTheme(savedTheme)
  },
  
  setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme)
    localStorage.setItem('astafile_theme', theme)
    
    const icon = document.getElementById('themeIcon')
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-moon' : 'fas fa-sun'
    }
  },
  
  toggle() {
    const current = document.documentElement.getAttribute('data-theme') || 'dark'
    const newTheme = current === 'dark' ? 'light' : 'dark'
    this.setTheme(newTheme)
    
    // Mostrar notificación
    showToast(`Tema ${newTheme === 'dark' ? 'oscuro' : 'claro'} activado`, 'info')
  }
}

// Gestión de notificaciones avanzadas
const NotificationManager = {
  show(title, message, type = 'info', duration = 5000) {
    const notification = document.createElement('div')
    notification.className = `notification ${type}`
    notification.innerHTML = `
      <div class="notification-icon">
        <i class="fas ${this.getIcon(type)}"></i>
      </div>
      <div class="notification-content">
        <div class="notification-title">${title}</div>
        <div class="notification-message">${message}</div>
      </div>
      <button class="notification-close" onclick="this.parentElement.remove()">
        <i class="fas fa-times"></i>
      </button>
    `
    
    document.getElementById('notificationContainer').appendChild(notification)
    
    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease'
      setTimeout(() => notification.remove(), 300)
    }, duration)
  },
  
  getIcon(type) {
    const icons = {
      success: 'fa-check-circle',
      error: 'fa-exclamation-circle',
      warning: 'fa-exclamation-triangle',
      info: 'fa-info-circle'
    }
    return icons[type] || 'fa-info-circle'
  }
}

// Gestor de descargas
const DownloadManager = {
  downloadText(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' })
    this.downloadBlob(blob, filename)
  },
  
  downloadJSON(data, filename) {
    const content = JSON.stringify(data, null, 2)
    this.downloadText(content, filename)
  },
  
  downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }
}

// Validaciones
const Validator = {
  isEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return re.test(email)
  },
  
  isURL(url) {
    try {
      new URL(url)
      return true
    } catch {
      return false
    }
  },
  
  isStrongPassword(password) {
    return password.length >= 8 &&
           /[A-Z]/.test(password) &&
           /[a-z]/.test(password) &&
           /[0-9]/.test(password)
  }
}

// Formateadores
const Formatter = {
  formatDate(date, format = 'full') {
    const d = new Date(date)
    const formats = {
      short: d.toLocaleDateString(),
      medium: d.toLocaleDateString('es-ES', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      }),
      full: d.toLocaleDateString('es-ES', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
    return formats[format] || d.toLocaleDateString()
  },
  
  truncateText(text, maxLength = 100) {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  },
  
  formatNumber(num) {
    return new Intl.NumberFormat('es-ES').format(num)
  }
}

// Gestor de cache
const CacheManager = {
  set(key, value, ttl = 3600) {
    const item = {
      value,
      expires: Date.now() + (ttl * 1000)
    }
    localStorage.setItem(`cache_${key}`, JSON.stringify(item))
  },
  
  get(key) {
    const item = localStorage.getItem(`cache_${key}`)
    if (!item) return null
    
    const { value, expires } = JSON.parse(item)
    if (Date.now() > expires) {
      this.remove(key)
      return null
    }
    
    return value
  },
  
  remove(key) {
    localStorage.removeItem(`cache_${key}`)
  },
  
  clear() {
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('cache_')) {
        localStorage.removeItem(key)
      }
    })
  }
}

// Exportar utilidades globalmente
window.ThemeManager = ThemeManager
window.NotificationManager = NotificationManager
window.DownloadManager = DownloadManager
window.Validator = Validator
window.Formatter = Formatter
window.CacheManager = CacheManager

// Inicializar al cargar
document.addEventListener('DOMContentLoaded', () => {
  ThemeManager.init()
  
  // Crear contenedor de notificaciones si no existe
  if (!document.getElementById('notificationContainer')) {
    const container = document.createElement('div')
    container.id = 'notificationContainer'
    container.className = 'notification-container'
    document.body.appendChild(container)
  }
})