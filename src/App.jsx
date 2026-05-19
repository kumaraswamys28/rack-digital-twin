import React, { useRef, useCallback, Suspense, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, useGLTF } from '@react-three/drei'
import Rack from './Rack'
import { useTelemetry } from './useTelemetry'

function emptySlot(rackId, slotId) {
  return { rack_id: rackId, slot_id: slotId, ingredient: '0', weight_grams: 0, status: 'EMPTY', owner_id: '—' }
}

const SLOT_COUNT = 3

const RACK_CONFIGS = [
  { rackId: 'RACK_A1', position: [-6.5, 0, 0] },
  { rackId: 'RACK_A2', position: [0, 0, 0] },
  { rackId: 'RACK_B1', position: [6.5, 0, 0] },
]

const INITIAL_SLOTS = {
  'RACK_A1': [emptySlot('RACK_A1', 1), emptySlot('RACK_A1', 2), emptySlot('RACK_A1', 3)],
  'RACK_A2': [emptySlot('RACK_A2', 1), emptySlot('RACK_A2', 2), emptySlot('RACK_A2', 3)],
  'RACK_B1': [emptySlot('RACK_B1', 1), emptySlot('RACK_B1', 2), emptySlot('RACK_B1', 3)],
}

function buildRackSlots(rackId, slotDataByKey) {
  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const slotId = index + 1
    const slotKey = `${rackId}:${slotId}`
    return slotDataByKey[slotKey] ?? emptySlot(rackId, slotId)
  })
}

function getRackPosition(index, rackCount) {
  if (rackCount <= 1) return [0, 0, 0]
  if (rackCount === 2) return index === 0 ? [-4.2, 0, 0] : [4.2, 0, 0]

  const centeredOffsets = [-1, 0, 1]
  return [centeredOffsets[index] * 6.5, 0, 0]
}

function Scene() {
  const [slotDataByKey, setSlotDataByKey] = useState(() => ({
    'RACK_A1:1': emptySlot('RACK_A1', 1),
    'RACK_A1:2': emptySlot('RACK_A1', 2),
    'RACK_A1:3': emptySlot('RACK_A1', 3),
    'RACK_A2:1': emptySlot('RACK_A2', 1),
    'RACK_A2:2': emptySlot('RACK_A2', 2),
    'RACK_A2:3': emptySlot('RACK_A2', 3),
    'RACK_B1:1': emptySlot('RACK_B1', 1),
    'RACK_B1:2': emptySlot('RACK_B1', 2),
    'RACK_B1:3': emptySlot('RACK_B1', 3),
  }))

  const handleSlotUpdate = useCallback((slotKey, data) => {
    setSlotDataByKey((prev) => ({
      ...prev,
      [slotKey]: data,
    }))
  }, [])

  useTelemetry(handleSlotUpdate)

  return (
    <>
      <color attach="background" args={['#f5f2eb']} />
      <fog attach="fog" args={['#f5f2eb', 12, 35]} />
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 8, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 3, -5]} intensity={0.3} color="#fff5e6" />
      <Environment preset="apartment" />
      <Grid
        position={[0, 0, 0]}
        args={[30, 30]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#888888"
        sectionSize={5}
        sectionThickness={1}
        sectionColor="#aaaaaa"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />

      {RACK_CONFIGS.map(({ rackId, position }) => (
        <Rack
          key={rackId}
          rackId={rackId}
          position={position}
          slots={INITIAL_SLOTS[rackId]}
          slotDataByKey={slotDataByKey}
        />
      ))}

      <OrbitControls
        makeDefault
        enablePan={true}
        minDistance={2}
        maxDistance={18}
        minPolarAngle={0.1}
        maxPolarAngle={Math.PI / 1.8}
        target={[0, 3.5, 0]}
      />
    </>
  )
}

export default function App() {
  const rackCount = 3

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
        padding: '16px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'linear-gradient(to bottom, #f5f2eeee, transparent)',
        fontFamily: "'Space Mono', monospace",
      }}>
        <div>
          <div style={{ color: '#00aa66', fontSize: 11, letterSpacing: 4, textTransform: 'uppercase', marginBottom: 2 }}>
            ● LIVE
          </div>
          <div style={{ color: '#1a1a1a', fontSize: 22, fontFamily: "'Syne', sans-serif", fontWeight: 800, letterSpacing: -0.5 }}>
            Rack Telemetry Dashboard
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ color: '#556677', fontSize: 11 }}>{rackCount} RACKS · {rackCount * SLOT_COUNT} SLOTS</div>
          <div style={{ color: '#8899aa', fontSize: 10, marginTop: 2 }}>Polling every 10s</div>
        </div>
      </div>

      <div style={{
        position: 'absolute', bottom: 24, left: 24, zIndex: 10,
        display: 'flex', gap: 16, fontFamily: "'Space Mono', monospace",
      }}>
        {[['ACTIVE', '#00aa66'], ['LOW_STOCK', '#cc8800'], ['EMPTY', '#cc3355']].map(([label, color]) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
            <span style={{ color: '#556677', fontSize: 10 }}>{label}</span>
          </div>
        ))}
      </div>

      <div style={{
        position: 'absolute', bottom: 24, right: 24, zIndex: 10,
        fontFamily: "'Space Mono', monospace", color: '#aabbcc', fontSize: 10,
        textAlign: 'right', lineHeight: 1.8,
      }}>
        Drag to orbit · Scroll to zoom<br />
        <a href="https://github.com/kumaraswamys28" target="_blank" rel="noopener noreferrer" style={{ color: '#aabbcc', textDecoration: 'none', fontSize: 10, lineHeight: 1.8 }}>
          
        </a>
      </div>

      <Canvas
        camera={{ position: [0, 4, 14], fov: 55 }}
        shadows
        gl={{ antialias: true, alpha: false }}
        style={{ background: '#f5f2eb' }}
      >
        <Suspense fallback={null}>
          <Scene />
        </Suspense>
      </Canvas>
    </div>
  )
}
