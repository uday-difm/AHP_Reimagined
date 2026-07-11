'use client';
import { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";
import * as THREE from "three";

/* ─── Procedural Textures (page edges only) ──────────────────────────────── */

function makePageEdges() {
    const W = 64, H = 512;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');

    ctx.fillStyle = '#ede8db';
    ctx.fillRect(0, 0, W, H);

    for (let y = 0; y < H; y += 3) {
        const v = 200 + Math.floor(Math.random() * 20);
        ctx.fillStyle = `rgb(${v}, ${v - 8}, ${v - 20})`;
        ctx.fillRect(0, y, W, 1);
    }

    const shadow = ctx.createLinearGradient(0, 0, 10, 0);
    shadow.addColorStop(0, 'rgba(0,0,0,0.18)');
    shadow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = shadow;
    ctx.fillRect(0, 0, 10, H);

    return new THREE.CanvasTexture(c);
}

function makeTopEdge() {
    const W = 512, H = 64;
    const c = document.createElement('canvas');
    c.width = W; c.height = H;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#e8e0cc';
    ctx.fillRect(0, 0, W, H);
    for (let x = 0; x < W; x += 3) {
        const v = 195 + Math.floor(Math.random() * 18);
        ctx.fillStyle = `rgb(${v}, ${v - 5}, ${v - 18})`;
        ctx.fillRect(x, 0, 1, H);
    }
    return new THREE.CanvasTexture(c);
}

/* ─── Book Component ─────────────────────────────────────────────────────── */

/**
 * Place your images in /public:
 *   /public/front.jpg   ← front cover
 *   /public/back.jpg    ← back cover
 *   /public/spine.jpg   ← spine (tall & narrow, rotated 90° CCW in the file)
 */
export default function Book() {
    const group = useRef();
    const time = useRef(0);

    // Load all 3 user-supplied images at once
    const [frontTex, backTex, spineTex] = useTexture([
        '/front.jpg',
        '/back.jpg',
        '/spine.jpg',
    ]);

    const mats = useMemo(() => {
        // BoxGeometry face order: +X, -X, +Y, -Y, +Z, -Z
        // Book upright facing viewer (+Z = front of book):
        //   +X = right (page edges)
        //   -X = left  (spine)
        //   +Y = top edge
        //   -Y = bottom edge
        //   +Z = front cover  ← your front.jpg
        //   -Z = back cover   ← your back.jpg
        const pages = makePageEdges();
        const top = makeTopEdge();

        return [
            // [0] +X – right page edges (procedural)
            new THREE.MeshStandardMaterial({ map: pages, roughness: 0.92 }),
            // [1] -X – spine (your spine.jpg)
            new THREE.MeshStandardMaterial({ map: spineTex, roughness: 0.35 }),
            // [2] +Y – top page edge (procedural)
            new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 }),
            // [3] -Y – bottom page edge (procedural)
            new THREE.MeshStandardMaterial({ map: top, roughness: 0.95 }),
            // [4] +Z – FRONT COVER (your front.jpg)
            new THREE.MeshStandardMaterial({ map: frontTex, roughness: 0.22, metalness: 0.04 }),
            // [5] -Z – BACK COVER (your back.jpg)
            new THREE.MeshStandardMaterial({ map: backTex, roughness: 0.42 }),
        ];
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [frontTex, backTex, spineTex]);

    useFrame(({ mouse }) => {
        if (!group.current) return;
        time.current += 0.012;
        // Y-axis only — mouse X drives horizontal spin
        const tY = mouse.x * 0.65;
        group.current.rotation.y += (tY - group.current.rotation.y) * 0.05;
        // Lock X and Z — perfectly upright, no tilt, no skew
        group.current.rotation.x = 0;
        group.current.rotation.z = 0;
        // Gentle floating bob
        group.current.position.y = Math.sin(time.current * 0.45) * 0.07;
    });

    const W = 2.5;   // width  (front face)
    const H = 3.7;   // height
    const D = 0.05;  // depth  (thickness / spine width)

    return (
        <group ref={group} rotation={[0, Math.PI / 2, 0]}>
            {/* Main book — single box with 6 unique face materials */}
            <mesh castShadow receiveShadow material={mats}>
                <boxGeometry args={[W, H, D]} />
            </mesh>
        </group>
    );
}
