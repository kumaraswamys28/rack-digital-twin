import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'

// Status color map
const STATUS_COLORS = {
  ACTIVE: '#00ff88',
  LOW_STOCK: '#ffaa00',
  EMPTY: '#ff4455',
}

const STATUS_BG = {
  ACTIVE: '#003322',
  LOW_STOCK: '#332200',
  EMPTY: '#220011',
}

function makeCardTexture(data) {
  const W = 256
  const H = 180
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')

  const status = data?.status || 'EMPTY'
  const color = STATUS_COLORS[status] || '#888'
  const bg = STATUS_BG[status] || '#111'

  // Background
  ctx.fillStyle = '#0a0c10ee'
  roundRect(ctx, 0, 0, W, H, 14)
  ctx.fill()

  // Border glow
  ctx.strokeStyle = color
  ctx.lineWidth = 2.5
  roundRect(ctx, 1.5, 1.5, W - 3, H - 3, 13)
  ctx.stroke()

  // Status badge
  ctx.fillStyle = bg
  ctx.beginPath()
  ctx.roundRect(W - 96, 10, 84, 22, 8)
  ctx.fill()
  ctx.fillStyle = color
  ctx.font = 'bold 11px monospace'
  ctx.textAlign = 'center'
  ctx.fillText(status, W - 54, 25)

  // Ingredient name
  ctx.fillStyle = '#ffffff'
  ctx.font = 'bold 22px sans-serif'
  ctx.textAlign = 'left'
  ctx.fillText(data?.ingredient || '—', 14, 50)

  // Slot label
  ctx.fillStyle = '#8899aa'
  ctx.font = '11px monospace'
  ctx.fillText(`SLOT ${data?.slot_id ?? '?'} · ${data?.rack_id ?? ''}`, 14, 68)

  // Divider
  ctx.strokeStyle = '#ffffff22'
  ctx.lineWidth = 1
  ctx.beginPath()
  ctx.moveTo(14, 78)
  ctx.lineTo(W - 14, 78)
  ctx.stroke()

  // Weight
  ctx.fillStyle = '#ccddee'
  ctx.font = '13px monospace'
  ctx.fillText('⚖  Weight', 14, 98)
  ctx.fillStyle = color
  ctx.font = 'bold 16px monospace'
  ctx.fillText(`${data?.weight_grams ?? 0} g`, 14, 116)

  // Temp & Humidity
  ctx.fillStyle = '#ccddee'
  ctx.font = '13px monospace'
  ctx.fillText('🌡 Temp', 14, 138)
  ctx.fillStyle = '#aabbcc'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`${data?.metadata?.temp ?? '--'}°C`, 14, 154)

  ctx.fillStyle = '#ccddee'
  ctx.font = '13px monospace'
  ctx.fillText('💧 Humidity', 120, 138)
  ctx.fillStyle = '#aabbcc'
  ctx.font = 'bold 14px monospace'
  ctx.fillText(`${data?.metadata?.humidity ?? '--'}%`, 120, 154)

  // Owner
  ctx.fillStyle = '#556677'
  ctx.font = '10px monospace'
  ctx.fillText(`owner: ${data?.owner_id ?? '?'}`, 14, 172)

  return canvas
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

export default function SlotCard({ position, slotKey, initialData, dataRef }) {
  const meshRef = useRef()
  const textureRef = useRef()
  const { camera } = useThree()

  // Create initial texture
  const initialTexture = useMemo(() => {
    const canvas = makeCardTexture(initialData)
    const tex = new THREE.CanvasTexture(canvas)
    return tex
  }, [])

  useEffect(() => {
    textureRef.current = initialTexture
  }, [initialTexture])

  // Register this card so App can push updates directly
  useEffect(() => {
    if (!dataRef) return
    dataRef.current[slotKey] = (newData) => {
      const canvas = makeCardTexture(newData)
      if (textureRef.current) {
        textureRef.current.image = canvas
        textureRef.current.needsUpdate = true
      }
    }
    return () => {
      delete dataRef.current[slotKey]
    }
  }, [slotKey, dataRef])

  // Billboard: face camera every frame
  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.lookAt(camera.position)
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <planeGeometry args={[3.6, 2.55]} />
      <meshBasicMaterial
        map={initialTexture}
        transparent
        depthWrite={false}
        side={THREE.DoubleSide}
      />
    </mesh>
  )
}
