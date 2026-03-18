import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'pwa-install-dismissed'

export default function InstallPWA() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Don't show if previously dismissed
    const dismissed = localStorage.getItem(DISMISS_KEY)
    if (dismissed) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    // Hide if app is already installed
    const installedHandler = () => {
      setVisible(false)
      setDeferredPrompt(null)
    }
    window.addEventListener('appinstalled', installedHandler)

    return () => {
      window.removeEventListener('beforeinstallprompt', handler)
      window.removeEventListener('appinstalled', installedHandler)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setVisible(false)
    setDeferredPrompt(null)
    localStorage.setItem(DISMISS_KEY, 'true')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3
      bg-amazonia-900 dark:bg-amazonia-800 text-white px-5 py-3 rounded-xl shadow-lg
      animate-fadeIn max-w-sm w-[calc(100%-2rem)]">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold truncate">Instalar Amazonia ERP</p>
        <p className="text-xs text-white/70">Acceso rápido desde tu dispositivo</p>
      </div>
      <button
        onClick={handleInstall}
        className="shrink-0 bg-white text-amazonia-900 text-sm font-semibold px-4 py-2
          rounded-lg hover:bg-white/90 transition-colors"
      >
        Instalar
      </button>
      <button
        onClick={handleDismiss}
        className="shrink-0 text-white/60 hover:text-white transition-colors p-1"
        aria-label="Cerrar"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  )
}
