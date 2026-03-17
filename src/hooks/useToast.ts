// Simple toast notification system using DOM injection.
// No external dependencies — renders fixed-position toasts at bottom-right.

type ToastType = 'error' | 'success' | 'warning'

const TOAST_COLORS: Record<ToastType, { bg: string; border: string; text: string }> = {
  error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.3)', text: '#f87171' },
  success: { bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)', text: '#34d399' },
  warning: { bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.3)', text: '#fbbf24' },
}

const TOAST_DURATIONS: Record<ToastType, number> = {
  error: 4000,
  success: 3000,
  warning: 4000,
}

let containerEl: HTMLElement | null = null

function getContainer(): HTMLElement {
  if (containerEl && document.body.contains(containerEl)) return containerEl
  containerEl = document.createElement('div')
  containerEl.id = 'logintel-toasts'
  containerEl.style.cssText =
    'position:fixed;bottom:24px;right:24px;z-index:9999;display:flex;flex-direction:column-reverse;gap:8px;pointer-events:none;'
  document.body.appendChild(containerEl)
  return containerEl
}

function showToast(message: string, type: ToastType) {
  const container = getContainer()
  const colors = TOAST_COLORS[type]
  const duration = TOAST_DURATIONS[type]

  const el = document.createElement('div')
  el.style.cssText = `
    background:${colors.bg};
    border:1px solid ${colors.border};
    color:${colors.text};
    padding:12px 20px;
    border-radius:12px;
    font-size:13px;
    font-family:inherit;
    max-width:360px;
    pointer-events:auto;
    opacity:0;
    transform:translateY(8px);
    transition:opacity 0.2s,transform 0.2s;
    backdrop-filter:blur(8px);
  `
  el.textContent = message
  container.appendChild(el)

  // Animate in
  requestAnimationFrame(() => {
    el.style.opacity = '1'
    el.style.transform = 'translateY(0)'
  })

  // Auto-dismiss
  setTimeout(() => {
    el.style.opacity = '0'
    el.style.transform = 'translateY(8px)'
    setTimeout(() => el.remove(), 200)
  }, duration)
}

export function showErrorToast(message: string) {
  showToast(message, 'error')
}

export function showSuccessToast(message: string) {
  showToast(message, 'success')
}

export function showWarningToast(message: string) {
  showToast(message, 'warning')
}
