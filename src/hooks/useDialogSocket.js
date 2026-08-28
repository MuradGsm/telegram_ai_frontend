import { useEffect, useRef, useState, useCallback } from 'react'
import { WS_URL, getAccessToken } from '../api/client'

const BACKOFF_STEPS_MS = [1000, 2000, 4000, 8000, 15000]

export function useDialogSocket(workspaceId, dialogId, handlers) {
  const [connectionState, setConnectionState] = useState('connecting')
  const wsRef = useRef(null)
  const reconnectTimerRef = useRef(null)
  const attemptRef = useRef(0)
  const isFirstConnectionRef = useRef(true)
  const manuallyClosedRef = useRef(false)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const connect = useCallback(() => {
    const token = getAccessToken()
    
    // Очищаем WS_URL от лишних слэшей в конце
    const cleanWsUrl = (WS_URL || '').replace(/\/+$/, '')
    const url = `${cleanWsUrl}/workspaces/${workspaceId}/dialogs/${dialogId}/ws?token=${encodeURIComponent(token || '')}`
    
    const ws = new WebSocket(url)
    wsRef.current = ws
    setConnectionState('connecting')

    ws.onopen = () => {
      setConnectionState('open')
      attemptRef.current = 0
      if (!isFirstConnectionRef.current) handlersRef.current.onReconnect?.()
      isFirstConnectionRef.current = false
    }

    ws.onmessage = (event) => {
      let payload
      try { payload = JSON.parse(event.data) } catch { return }
      if (payload.type === 'message') handlersRef.current.onMessage?.(payload.data)
      else if (payload.type === 'status') handlersRef.current.onStatus?.(payload.data.status)
      else if (payload.type === 'error') handlersRef.current.onError?.(payload.detail)
    }

    ws.onclose = () => {
      setConnectionState('closed')
      if (manuallyClosedRef.current) return
      const delay = BACKOFF_STEPS_MS[Math.min(attemptRef.current, BACKOFF_STEPS_MS.length - 1)]
      attemptRef.current += 1
      reconnectTimerRef.current = setTimeout(connect, delay)
    }

    ws.onerror = () => ws.close()
  }, [workspaceId, dialogId])

  useEffect(() => {
    manuallyClosedRef.current = false
    isFirstConnectionRef.current = true
    attemptRef.current = 0
    connect()
    return () => {
      manuallyClosedRef.current = true
      clearTimeout(reconnectTimerRef.current)
      wsRef.current?.close()
    }
  }, [connect])

  const send = useCallback((payload) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(payload))
      return true
    }
    return false
  }, [])

  return { connectionState, send }
}