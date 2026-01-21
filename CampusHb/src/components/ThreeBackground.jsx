import React, { useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Sphere, MeshDistortMaterial } from '@react-three/drei';

// Animated 3D Background Component
const AnimatedSphere = () => {
    const meshRef = useRef();

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.x = state.clock.getElapsedTime() * 0.1;
            meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.15;
        }
    });

    return (
        <Sphere ref={meshRef} args={[1, 100, 200]} scale={2.4}>
            <MeshDistortMaterial
                color="#3b82f6"
                distort={0.4}
                speed={1.5}
                roughness={0.1}
                metalness={0.8}
            />
        </Sphere>
    );
};

export const ThreeBackground = () => {
    return (
        <div
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: -1,
                background: '#f8fafc',
                pointerEvents: 'none'
            }}
        >
            <Canvas camera={{ position: [0, 0, 5] }} dpr={[1, 2]}>
                <Suspense fallback={null}>
                    <ambientLight intensity={0.8} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} />
                    <AnimatedSphere />
                    <OrbitControls enableZoom={false} enablePan={false} />
                </Suspense>
            </Canvas>
        </div>
    );
};
