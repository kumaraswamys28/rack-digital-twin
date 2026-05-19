import { useEffect, useRef, useCallback } from 'react'

const TWIN_API_URL = import.meta.env.VITE_TWIN_API_URL || 'http://localhost:3030/api/twin/current'

/**
 * useTelemetry
 * Returns a ref map: slotKey (e.g. "RACK_A1:1") -> latest slot data.
 * Calls `onSlotUpdate(slotKey, data)` ONLY when that specific slot changes.
 * No full re-renders triggered.
 */
export function useTelemetry(onSlotUpdate) {
  const cacheRef = useRef({}) // slotKey -> JSON string of last value
  const slotOrder = [
    'RACK_A1:1',
    'RACK_A1:2',
    'RACK_A1:3',
    'RACK_A2:1',
    'RACK_A2:2',
    'RACK_A2:3',
    'RACK_B1:1',
    'RACK_B1:2',
    'RACK_B1:3',
  ]

  const fetchData = useCallback(async () => {
    console.log('Fetching telemetry data...')
    try {
      const res = await fetch(TWIN_API_URL)
      const data = await res.json()
      console.log('Telemetry Data:', data)
      if (!Array.isArray(data)) return

      slotOrder.forEach((slotKey, index) => {
        const item = data[index]
        if (!item) return

        const [rackId, slotIdText] = slotKey.split(':')
        const normalizedItem = {
          ...item,
          rack_id: rackId,
          slot_id: Number(slotIdText),
        }
        const serialized = JSON.stringify(normalizedItem)
        if (cacheRef.current[slotKey] !== serialized) {
          cacheRef.current[slotKey] = serialized
          onSlotUpdate(slotKey, normalizedItem)
        }
      })
    } catch (e) {
      console.error('Telemetry fetch error:', e)
    }
  }, [onSlotUpdate])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 10000)
    return () => clearInterval(id)
  }, [fetchData])
}
