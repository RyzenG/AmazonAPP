import { useEffect, useRef } from 'react'
import { useStore } from '../store/useStore'

/**
 * Fires browser push notifications once per session when:
 * - There are supplies with stock below minimum
 * - There are sale orders with pending payment
 *
 * Requests permission on first call. Notifications are deduplicated
 * within a session via a ref so they don't fire repeatedly.
 */
export function usePushNotifications() {
  const { supplies, saleOrders, dataLoaded, addNotification } = useStore()
  const fired = useRef(false)

  useEffect(() => {
    if (!dataLoaded || fired.current) return
    fired.current = true

    // Request browser notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    const canNotify =
      'Notification' in window && Notification.permission === 'granted'

    // ── Low stock check ─────────────────────────────────────────────────────
    const lowStock = supplies.filter((s) => s.stock <= s.minStock)
    if (lowStock.length > 0) {
      const msg =
        lowStock.length === 1
          ? `⚠️ Stock bajo: ${lowStock[0].name} (${lowStock[0].stock} ${lowStock[0].unit})`
          : `⚠️ ${lowStock.length} insumos con stock bajo`

      addNotification({ type: 'warning', category: 'inventory', link: '/inventory', message: msg })

      if (canNotify) {
        new Notification('Amazonia ERP — Stock bajo', {
          body: lowStock.map((s) => `• ${s.name}: ${s.stock} ${s.unit}`).join('\n'),
          icon: '/favicon.ico',
          tag: 'low-stock',
        })
      }
    }

    // ── Pending payment orders ───────────────────────────────────────────────
    const pendingPay = saleOrders.filter((o) => o.paymentStatus === 'pending')
    if (pendingPay.length > 0) {
      const msg = `💳 ${pendingPay.length} orden${pendingPay.length > 1 ? 'es' : ''} con pago pendiente`
      addNotification({ type: 'info', category: 'sales', link: '/sales', message: msg })

      if (canNotify) {
        new Notification('Amazonia ERP — Pagos pendientes', {
          body: pendingPay
            .slice(0, 5)
            .map((o) => `• ${o.orderNumber} — ${o.customer}`)
            .join('\n'),
          icon: '/favicon.ico',
          tag: 'pending-payments',
        })
      }
    }
  }, [dataLoaded]) // eslint-disable-line react-hooks/exhaustive-deps
}
