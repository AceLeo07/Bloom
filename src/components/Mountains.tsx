import { useGLTF } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';

export default function Mountains() {
  const { scene } = useGLTF('/lost_orb_in_the_mountains.gltf');

  const mountains = useMemo(() => {
    if (!scene) return [];

    // Create fewer mountains that spread outward from the tree circle
    const mountainInstances = [];
    const count = 4; // Further reduced to 4 mountains
    const radius = 160; // Much further out to ensure no overlap with trees (trees end at ~110)

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;

      const mountainMesh = scene.clone();

      mountainMesh.position.set(x, 0, z);
      mountainMesh.rotation.y = angle;
      
      // Stretch outward to cover more space without going inward
      mountainMesh.scale.set(15, 18, 20); // Further increased height (Y-axis from 12 to 18)

      // Disable shadows
      mountainMesh.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = false;
          child.receiveShadow = false;
        }
      });

      mountainInstances.push(<primitive key={i} object={mountainMesh} />);
    }

    return mountainInstances;
  }, [scene]);

  return <>{mountains}</>;
}