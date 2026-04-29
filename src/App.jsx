import React, { useRef, useCallback, Suspense, useState, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls, Environment, Grid, useGLTF } from '@react-three/drei'
import Rack from './Rack'
import { useTelemetry } from './useTelemetry'

const RACK_CONFIGS = [
  { rackId: 'RACK_A1', position: [-6.5, 0, 0] },
  { rackId: 'RACK_A2', position: [0, 0, 0] },
  { rackId: 'RACK_B1', position: [6.5, 0, 0] },
]

function emptySlot(rackId, slotId) {
  return { rack_id: rackId, slot_id: slotId, ingredient: 'Loading...', weight_grams: 0, status: 'EMPTY', owner_id: '—' }
}

const initialSlots = {
  'RACK_A1': [emptySlot('RACK_A1', 1), emptySlot('RACK_A1', 2), emptySlot('RACK_A1', 3)],
  'RACK_A2': [emptySlot('RACK_A2', 1), emptySlot('RACK_A2', 2), emptySlot('RACK_A2', 3)],
  'RACK_B1': [emptySlot('RACK_B1', 1), emptySlot('RACK_B1', 2), emptySlot('RACK_B1', 3)],
}

function Scene() {
  const cardUpdaters = useRef({})

  const handleSlotUpdate = useCallback((slotKey, data) => {
    const updater = cardUpdaters.current[slotKey]
    if (updater) updater(data)
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
          slots={initialSlots[rackId]}
          dataRef={cardUpdaters}
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
          <div style={{ color: '#556677', fontSize: 11 }}>3 RACKS · 9 SLOTS</div>
          <div style={{ color: '#8899aa', fontSize: 10, marginTop: 2 }}>Polling every 4s</div>
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
        <a href="https://github.com/kumaraswamys28" target="_blank" rel="noopener noreferrer" style={{ color: '#0080ff18', textDecoration: 'none', fontSize: 500, lineHeight: 1.8 }}>
          made by kumar
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
