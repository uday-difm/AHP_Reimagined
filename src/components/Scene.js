'use client';

import { Suspense } from 'react';
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment } from "@react-three/drei";
import Book from "./Book";

export default function Scene({ frontUrl, backUrl, spineUrl }) {
    return (
        <Canvas
            shadows
            camera={{ position: [0, 0.2, 8.5], fov: 30 }}
            className="!w-[200px] !h-[300px] sm:!w-[240px] sm:!h-[360px] md:!w-[260px] md:!h-[400px] lg:!w-[15vw] lg:!h-[40vh]"
        >
            {/* Background */}
            <color attach="background" args={["#f3f7f8"]} />
            <fog attach="fog" args={["#111820", 20, 60]} />

            {/* Ambient — low, moody */}
            <ambientLight intensity={0.3} color="#c8d8e8" />

            {/* Key light — warm from upper-right */}
            <directionalLight
                intensity={2.0}
                position={[5, 6, 5]}
                color="#ffe8c0"
                castShadow
                shadow-mapSize-width={2048}
                shadow-mapSize-height={2048}
                shadow-camera-near={0.1}
                shadow-camera-far={30}
                shadow-camera-top={6}
                shadow-camera-bottom={-6}
                shadow-camera-left={-6}
                shadow-camera-right={6}
            />

            {/* Cool fill light from left */}
            <directionalLight
                intensity={0.6}
                position={[-5, 2, 3]}
                color="#a8c8e8"
            />

            {/* Rim light from back-top — makes edges pop */}
            <directionalLight
                intensity={0.9}
                position={[0, 4, -5]}
                color="#ffd080"
            />

            {/* Subtle warm point near the book spine */}
            <pointLight position={[-2.5, 1, 2]} intensity={0.8} color="#e8c080" distance={8} decay={2} />

            {/* Floor for shadow reception */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -3, 0]} receiveShadow>
                <planeGeometry args={[40, 40]} />
                <shadowMaterial opacity={0.35} />
            </mesh>

            <Suspense fallback={null}>
                <Book frontUrl={frontUrl} backUrl={backUrl} spineUrl={spineUrl} />
            </Suspense>

            {/* Y-axis only drag — lock polar angle to prevent camera tilt */}
            <OrbitControls
                enableZoom={false}
                enablePan={false}
                minPolarAngle={Math.PI / 2}
                maxPolarAngle={Math.PI / 2}
            />
        </Canvas>
    );
}