import { useRef, useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { TreeModel } from './TreeModel';
import { api } from '../services/api';

interface CompletedTreesProps {
  userId: string;
}

export default function CompletedTrees({ userId }: CompletedTreesProps) {
  const [completedTrees, setCompletedTrees] = useState<any[]>([]);

  useEffect(() => {
    loadCompletedTrees();
  }, [userId]);

  const loadCompletedTrees = async () => {
    try {
      const response = await api.getAllTrees();
      const completedTrees = response.trees.filter(tree => !tree.is_current);
      setCompletedTrees(completedTrees);
    } catch (error) {
      console.error('Failed to load completed trees:', error);
    }
  };

  return (
    <>
      {completedTrees.map((tree) => (
        <CompletedTree key={tree.id} tree={tree} />
      ))}
    </>
  );
}

function CompletedTree({ tree }: { tree: any }) {
  const groupRef = useRef<THREE.Group>(null);
  const [targetPosition] = useState({
    x: tree.position_x || 0,
    z: tree.position_z || 0
  });

  useFrame(() => {
    if (groupRef.current) {
      // Smooth transition to target position
      groupRef.current.position.x = THREE.MathUtils.lerp(
        groupRef.current.position.x,
        targetPosition.x,
        0.02
      );
      groupRef.current.position.z = THREE.MathUtils.lerp(
        groupRef.current.position.z,
        targetPosition.z,
        0.02
      );
    }
  });

  const scale = tree.health >= 75 ? 1.2 : tree.health >= 50 ? 0.9 : 0.7;

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <TreeModel position={[0, 0, 0]} scale={scale} />
    </group>
  );
}
