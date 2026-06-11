import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

const COLORS = [
  new THREE.Color('#6c5ce7'),
  new THREE.Color('#00d68f'),
  new THREE.Color('#54a0ff'),
  new THREE.Color('#ffaa00'),
  new THREE.Color('#ff6b6b'),
];

function Node({ position, color, size, speed, mouse }) {
  const ref = useRef();
  const basePos = useMemo(() => position, [position]);

  useFrame((state) => {
    if (ref.current) {
      const t = state.clock.elapsedTime * speed;
      ref.current.position.x = basePos[0] + Math.sin(t * 0.5 + basePos[1]) * 0.3;
      ref.current.position.y = basePos[1] + Math.cos(t * 0.7 + basePos[0]) * 0.3;
      ref.current.position.z = basePos[2] + Math.sin(t * 0.3 + basePos[2]) * 0.2;

      if (mouse.current) {
        const dx = mouse.current.x * 2 - ref.current.position.x;
        const dy = mouse.current.y * 2 - ref.current.position.y;
        ref.current.position.x += dx * 0.005;
        ref.current.position.y += dy * 0.005;
      }

      ref.current.rotation.x += 0.002;
      ref.current.rotation.y += 0.003;
    }
  });

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.3}>
      <mesh ref={ref} position={position}>
        <icosahedronGeometry args={[size, 0]} />
        <meshPhysicalMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.25}
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.6}
          envMapIntensity={0.4}
          clearcoat={0.3}
          clearcoatRoughness={0.2}
          wireframe={false}
        />
      </mesh>
    </Float>
  );
}

function ConnectionLines({ nodes, mouse }) {
  const lineRef = useRef();

  useFrame(() => {
    if (lineRef.current) {
      const positions = lineRef.current.geometry.attributes.position.array;
      let idx = 0;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dist = Math.sqrt(
            (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
          );
          if (dist < 2.5) {
            positions[idx++] = a[0];
            positions[idx++] = a[1];
            positions[idx++] = a[2];
            positions[idx++] = b[0];
            positions[idx++] = b[1];
            positions[idx++] = b[2];
          }
        }
      }
      lineRef.current.geometry.setDrawRange(0, idx / 3);
      lineRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const pairs = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const a = nodes[i];
      const b = nodes[j];
      const dist = Math.sqrt(
        (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2
      );
      if (dist < 2.5) {
        pairs.push(a[0], a[1], a[2], b[0], b[1], b[2]);
      }
    }
  }

  const positions = new Float32Array(pairs);

  return (
    <lineSegments ref={lineRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#6c5ce7" opacity={0.15} transparent />
    </lineSegments>
  );
}

function Scene({ mouse }) {
  const nodes = useMemo(() => {
    const result = [];
    for (let i = 0; i < 12; i++) {
      result.push({
        position: [
          (Math.random() - 0.5) * 6,
          (Math.random() - 0.5) * 4,
          (Math.random() - 0.5) * 3,
        ],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        size: 0.12 + Math.random() * 0.2,
        speed: 0.2 + Math.random() * 0.4,
      });
    }
    return result;
  }, []);

  const positions = nodes.map((n) => n.position);

  return (
    <>
      <ambientLight intensity={0.2} />
      <pointLight position={[0, 5, 5]} intensity={1} color="#6c5ce7" />
      <pointLight position={[-5, 0, 3]} intensity={0.5} color="#54a0ff" />
      <pointLight position={[5, -3, -2]} intensity={0.3} color="#00d68f" />
      {nodes.map((node, i) => (
        <Node key={i} {...node} mouse={mouse} />
      ))}
      <ConnectionLines nodes={positions} mouse={mouse} />
      <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} />
    </>
  );
}

export default function NodeEngine({ className }) {
  const mouse = useRef({ x: 0, y: 0 });

  return (
    <div
      className={className}
      onMouseMove={(e) => {
        mouse.current = {
          x: (e.clientX / window.innerWidth) * 2 - 1,
          y: -(e.clientY / window.innerHeight) * 2 + 1,
        };
      }}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'auto',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          toneMapping: THREE.ACESFilmicToneMapping,
          toneMappingExposure: 0.8,
        }}
      >
        <Scene mouse={mouse} />
      </Canvas>
    </div>
  );
}
