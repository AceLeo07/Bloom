import { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useHabitStore } from '../store/habitStore';

interface PlantProps {
  currentTree?: any;
}

export default function Plant({ currentTree }: PlantProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { plantStage, plantHealth } = useHabitStore();
  const targetScale = useRef(0.1);
  const currentScale = useRef(0.1);

  useEffect(() => {
    if (currentTree) {
      useHabitStore.setState({
        plantHealth: currentTree.health || 50,
        plantStage: currentTree.stage || 'seed'
      });
    }
  }, [currentTree]);

  useEffect(() => {
    if (!currentTree) return;
    
    const dayProgress = Math.min(currentTree.day / 7, 1);
    const healthFactor = Math.max(0.2, currentTree.health / 100);
    
    // More dramatic scaling based on growth
    if (currentTree.stage === 'bloom' || currentTree.health >= 75) {
      targetScale.current = 3.5 * dayProgress * healthFactor;
    } else if (currentTree.stage === 'sapling' || currentTree.health >= 50) {
      targetScale.current = 2.2 * dayProgress * healthFactor;
    } else if (currentTree.stage === 'decay' || currentTree.health < 25) {
      targetScale.current = 0.6 * dayProgress * healthFactor;
    } else {
      targetScale.current = 0.3 + (1.5 * dayProgress * healthFactor);
    }
  }, [currentTree?.day, currentTree?.health, currentTree?.stage]);

  useFrame((state) => {
    if (groupRef.current) {
      currentScale.current = THREE.MathUtils.lerp(
        currentScale.current,
        targetScale.current,
        0.03
      );
      groupRef.current.scale.setScalar(currentScale.current);

      const time = state.clock.getElapsedTime();
      const breathe = Math.sin(time * 1.5) * 0.05 + 1;
      groupRef.current.scale.y = currentScale.current * breathe;
      groupRef.current.rotation.y = time * 0.2;
    }
  });

  const getPlantColor = () => {
    if (plantStage === 'decay') return '#8B4513';
    if (plantStage === 'seed') return '#6B8E23';
    if (plantStage === 'sapling') return '#32CD32';
    return '#228B22';
  };

  const getEmissive = () => {
    if (plantStage === 'bloom') return '#FFD700';
    if (plantStage === 'sapling') return '#90EE90';
    return '#000000';
  };

  const scale = currentScale.current;
  const isMature = scale >= 2.0;

  return (
    <group ref={groupRef} position={[currentTree?.position_x || 0, 0, currentTree?.position_z || 0]}>
      <mesh position={[0, 0.5, 0]} castShadow>
        <cylinderGeometry args={[0.08, 0.12, 1, 12]} />
        <meshStandardMaterial
          color={isMature ? '#5d4037' : getPlantColor()}
          roughness={0.9}
          emissive={getEmissive()}
          emissiveIntensity={plantStage === 'bloom' ? 0.3 : 0.1}
        />
      </mesh>

      {plantStage === 'seed' && (
        <mesh position={[0, 0.2, 0]} castShadow>
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial color="#8B7355" roughness={0.8} />
        </mesh>
      )}

      {(plantStage === 'sapling' || scale > 0.5) && plantStage !== 'seed' && (
        <>
          <mesh position={[0, 1, 0]} castShadow>
            <sphereGeometry args={[0.25, 16, 16]} />
            <meshStandardMaterial color={getPlantColor()} roughness={0.6} />
          </mesh>
          <mesh position={[0.2, 0.8, 0]} castShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshStandardMaterial color={getPlantColor()} roughness={0.6} />
          </mesh>
        </>
      )}

      {isMature && (
        <mesh position={[0, 1.2, 0]} castShadow>
          <sphereGeometry args={[0.8, 24, 24]} />
          <meshStandardMaterial color={getPlantColor()} roughness={0.7} />
        </mesh>
      )}

      {plantStage === 'bloom' && (
        <>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <mesh
              key={i}
              position={[
                Math.cos((i * Math.PI) / 3) * 0.3,
                1.2,
                Math.sin((i * Math.PI) / 3) * 0.3,
              ]}
              castShadow
            >
              <sphereGeometry args={[0.15, 12, 12]} />
              <meshStandardMaterial
                color="#FF69B4"
                emissive="#FFD700"
                emissiveIntensity={0.5}
                roughness={0.4}
              />
            </mesh>
          ))}
          <mesh position={[0, 1.2, 0]} castShadow>
            <sphereGeometry args={[0.2, 12, 12]} />
            <meshStandardMaterial
              color="#FFD700"
              emissive="#FFD700"
              emissiveIntensity={0.8}
              roughness={0.3}
            />
          </mesh>
        </>
      )}

      {plantStage === 'decay' && (
        <mesh position={[0, 0.6, 0]} castShadow>
          <sphereGeometry args={[0.2, 8, 8]} />
          <meshStandardMaterial color="#8B4513" roughness={0.9} />
        </mesh>
      )}
    </group>
  );
}

