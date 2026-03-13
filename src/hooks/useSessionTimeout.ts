import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store/useStore'

const TIMEOUT_MS = 15 * 60 * 1000   // 15 minutes
const CHECK_MS   = 30_000            // check every 30 seconds

// Throttle: only update lastActivity at most once per 10s
const TOUCH_THROTTLE_MS = 10_000

export function useSessionTimeout() {
  const { isAuthenticated, logout, touchSession } = useStore()
  const navigate  = useNavigate()
  const lastTouch = useRef(0)

  useEffect(() => {
    if (!isAuthenticated) return

    // Update lastActivity on any user interaction (throttled)
    const handleActivity = () => {
      const now = Date.now()
      if (now - lastTouch.current > TOUCH_THROTTLE_MS) {
        lastTouch.current = now
        touchSession()
      }
    }

    const EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click'] as const
    EVENTS.forEach((e) => window.addEventListener(e, handleActivity, { passive: true }))

    // Periodically check if session expired
    const interval = setInterval(() => {
      const { lastActivity, isAuthenticated: isAuth } = useStore.getState()
      if (!isAuth) return
      if (Date.now() - lastActivity > TIMEOUT_MS) {
        logout()
        navigate('/login', { replace: true })
      }
    }, CHECK_MS)

    return () => {
      EVENTS.forEach((e) => window.removeEventListener(e, handleActivity))
      clearInterval(interval)
    }
  }, [isAuthenticated, logout, navigate, touchSession])
}
