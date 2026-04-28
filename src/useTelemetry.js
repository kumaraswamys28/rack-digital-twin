import { useEffect, useRef, useCallback } from 'react'

const SUPABASE_URL = 'https://iaofxztriabmscunwzqw.supabase.co/rest/v1/rack_telemetry_live?select=*'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlhb2Z4enRyaWFibXNjdW53enF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MzE1MTgsImV4cCI6MjA5MjQwNzUxOH0.Ko2U9nYb5kMoExXk1g2N_V14bpD4Sm0xF5FYiO0fZJw'

/**
 * useTelemetry
 * Returns a ref map: slotKey (e.g. "RACK_A1:1") -> latest slot data.
 * Calls `onSlotUpdate(slotKey, data)` ONLY when that specific slot changes.
 * No full re-renders triggered.
 */
export function useTelemetry(onSlotUpdate) {
  const cacheRef = useRef({}) // slotKey -> JSON string of last value

  const fetchData = useCallback(async () => {
    console.log('Fetching telemetry data...')
    try {
      const res = await fetch(SUPABASE_URL, {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json',
        },
      })
      const data = await res.json()
      console.log('Telemetry Data:', data)
      if (!Array.isArray(data)) return

      data.forEach((item) => {
        const key = `${item.rack_id}:${item.slot_id}`
        const serialized = JSON.stringify(item)
        if (cacheRef.current[key] !== serialized) {
          cacheRef.current[key] = serialized
          onSlotUpdate(key, item)
        }
      })
    } catch (e) {
      console.error('Telemetry fetch error:', e)
    }
  }, [onSlotUpdate])

  useEffect(() => {
    fetchData()
    const id = setInterval(fetchData, 4000)
    return () => clearInterval(id)
  }, [fetchData])
}
