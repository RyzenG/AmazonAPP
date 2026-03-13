import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

/**
 * Requests browser push notification permission once per session and fires
 * OS-level notifications for critical events (low stock, pending payments).
 * In-app notifications are handled by checkAlerts() in the store.
 */
export function usePushNotifications() {
  const { supplies, saleOrders, dataLoaded } = useStore()
  const fired = useRef(false)

  useEffect(() => {
    if (!dataLoaded || fired.current) return
    fired.current = true

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const canNotify = 'Notification' in window && Notification.permission === 'granted'
    if (!canNotify) return

    // ── OS-level: Low stock ──────────────────────────────────────────────────
    const lowStock = supplies.filter((s) => s.stock <= s.minStock)
    if (lowStock.length > 0) {
      new Notification('Amazonia ERP — Stock bajo', {
        body: lowStock.slice(0, 5).map((s) => `• ${s.name}: ${s.stock} ${s.unit}`).join('\n'),
        icon: '/favicon.ico',
        tag: 'low-stock',
      })
    }

    // ── OS-level: Pending payments ───────────────────────────────────────────
    const pendingPay = saleOrders.filter((o) => o.paymentStatus === 'pending')
    if (pendingPay.length > 0) {
      new Notification('Amazonia ERP — Pagos pendientes', {
        body: pendingPay.slice(0, 5).map((o) => `• ${o.orderNumber} — ${o.customer}`).join('\n'),
        icon: '/favicon.ico',
        tag: 'pending-payments',
      })
    }
  }, [dataLoaded]) // eslint-disable-line react-hooks/exhaustive-deps
}
