import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeModel } from './TreeModel';

export default function Trees() {
  // Generate trees in multiple rings around center for full 360° forest
  const generateTreePositions = () => {
    const positions: [number, number, number][] = [];
    
    // Inner ring - 6 trees
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const radius = 15 + Math.random() * 5;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    
    // Middle ring - 12 trees
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const radius = 35 + Math.random() * 8;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    
    // Outer ring - 18 trees
    for (let i = 0; i < 18; i++) {
      const angle = (i / 18) * Math.PI * 2;
      const radius = 60 + Math.random() * 15;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    
    // Far ring - 24 trees for dense forest
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const radius = 90 + Math.random() * 20;
      positions.push([
        Math.cos(angle) * radius,
        0,
        Math.sin(angle) * radius
      ]);
    }
    
    return positions;
  };

  const treePositions = generateTreePositions();

  return (
    <group>
      {treePositions.map((pos, index) => (
        <TreeModel 
          key={index} 
          position={pos as [number, number, number]}
          scale={0.8 + Math.random() * 0.4}
        />
      ))}
    </group>
  );
}
