import { useRef, useMemo } from 'react';
import { OrbitControls, Sky, Cloud } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import Plant from './Plant';
import Princess from './Princess';
import Ground from './Ground';
import Trees from './Trees';
import Particles from './Particles';
import RealBirds from './RealBirds';
import EnvironmentalEffects from './EnvironmentalEffects';
import CompletedTrees from './CompletedTrees';
import { useHabitStore } from '../store/habitStore';
import Tents from './Tents';
import Mountains from './Mountains';


interface ForestSceneProps {
  currentTree?: any;
}

const generateCloudPositions = () => {
  const positions: [number, number, number][] = [];
  for (let i = 0; i < 20; i++) {
    positions.push([
      (Math.random() - 0.5) * 150,
      Math.random() * 20 + 30,
      (Math.random() - 0.5) * 150,
    ]);
  }
  return positions;
};

export default function ForestScene({ currentTree }: ForestSceneProps) {
  const lightRef = useRef<THREE.DirectionalLight>(null);
  const { brightness } = useHabitStore();
  const cloudPositions = useMemo(generateCloudPositions, []);

  return (
    <>
      <Sky sunPosition={[0, 100, 0]} turbidity={1} rayleigh={0.5} />

      {/* Randomly placed clouds */}
      {cloudPositions.map((pos, index) => (
        <Cloud key={index} position={pos} speed={0.2} opacity={0.8} />
      ))}

      <RealBirds />
      <Princess />
      <Particles />

      {/* Early morning sun lighting */}
      <ambientLight intensity={0.7} color="#fff4e6" />
      <directionalLight
        ref={lightRef}
        position={[20, 25, 10]}
        intensity={1.2}
        color="#fffaf0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-far={200}
        shadow-camera-left={-150}
        shadow-camera-right={150}
        shadow-camera-top={150}
        shadow-camera-bottom={-150}
        shadow-bias={-0.0001}
      />
      
      {/* Hemisphere light for realistic ambient */}
      <hemisphereLight
        color="#ffffff"
        groundColor="#8B7355"
        intensity={0.5}
      />

      {/* Warm sun glow */}
      <pointLight position={[20, 20, -10]} intensity={0.6} color="#ffd700" distance={50} />
      <pointLight position={[-15, 12, 8]} intensity={0.4} color="#ffebcd" distance={40} />

      <OrbitControls
        enableZoom={true}
        enablePan={true}
        enableRotate={true}
        minDistance={10}
        maxDistance={100}
        maxPolarAngle={Math.PI / 2.2}
      />
      {/* Scene elements */}
      <Ground />
      <Trees />
      <Tents />
      <Mountains />
      <Plant currentTree={currentTree} />
      {currentTree && <CompletedTrees userId={currentTree.user_id} />}
    </>
  );
}
