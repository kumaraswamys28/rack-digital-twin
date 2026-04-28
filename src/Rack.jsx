import React from 'react'
import { useGLTF } from '@react-three/drei'
import SlotCard from './SlotCard'

const SLOT_Y_OFFSETS = [9.7, 6.5, 3.1]
const CARD_Z_OFFSET = 0.3

export default function Rack({ position, rackId, slots, dataRef }) {
  const { scene } = useGLTF('/rack.glb')

  return (
    <group position={position}>
      <primitive object={scene.clone()} scale={[1, 1, 1]} />
      {slots.map((slotData, i) => {
        const slotKey = `${rackId}:${i + 1}`
        const yOff = SLOT_Y_OFFSETS[i]
        return (
          <SlotCard
            key={slotKey}
            slotKey={slotKey}
            position={[0, yOff, CARD_Z_OFFSET]}
            initialData={slotData}
            dataRef={dataRef}
          />
        )
      })}
    </group>
  )
}

useGLTF.preload('/rack.glb')