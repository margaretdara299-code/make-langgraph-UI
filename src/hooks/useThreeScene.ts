/**
 * useThreeScene
 * Encapsulates the full Three.js lifecycle: init, animate, resize, mouse, cleanup.
 * Returns { init } — call init(containerEl) inside a useEffect and use the
 * returned cleanup function as the useEffect teardown.
 */

import { useCallback, useRef } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface ThreeRefs {
    scene: THREE.Scene | null;
    camera: THREE.PerspectiveCamera | null;
    renderer: THREE.WebGLRenderer | null;
    particles: THREE.Points | null;
    frameId: number | null;
}

// ---------------------------------------------------------------------------
// Particle sphere builder
// ---------------------------------------------------------------------------
function buildParticleSphere(): THREE.Points {
    const count = typeof navigator !== 'undefined' && navigator.hardwareConcurrency > 4
        ? 3000
        : 800;

    const positions = new Float32Array(count * 3);
    const colors    = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
        const i3 = i * 3;

        // Uniform spherical distribution (Marsaglia method)
        const radius = 2.8 + Math.random() * 1.4;
        const theta  = Math.random() * Math.PI * 2;
        const phi    = Math.acos(2 * Math.random() - 1);

        positions[i3]     = radius * Math.sin(phi) * Math.cos(theta);
        positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i3 + 2] = radius * Math.cos(phi);

        // Indigo → violet → cyan gradient
        const t = Math.random();
        colors[i3]     = 0.25 + t * 0.35;          // R
        colors[i3 + 1] = 0.20 + t * 0.25;          // G
        colors[i3 + 2] = 0.75 + (1 - t) * 0.25;    // B
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color',    new THREE.BufferAttribute(colors,    3));

    const material = new THREE.PointsMaterial({
        size:         0.028,
        vertexColors: true,
        transparent:  true,
        opacity:      0.85,
        blending:     THREE.AdditiveBlending,
        depthWrite:   false,
        sizeAttenuation: true,
    });

    return new THREE.Points(geometry, material);
}

// ---------------------------------------------------------------------------
// Ring accent builder (subtle orbiting ring)
// ---------------------------------------------------------------------------
function buildRing(): THREE.Line {
    const curve = new THREE.EllipseCurve(0, 0, 3.8, 3.8, 0, Math.PI * 2, false, 0);
    const pts   = curve.getPoints(120);
    const geo   = new THREE.BufferGeometry().setFromPoints(pts);
    const mat   = new THREE.LineBasicMaterial({
        color:       0x6366f1,
        transparent: true,
        opacity:     0.12,
    });
    const ring = new THREE.Line(geo, mat);
    ring.rotation.x = Math.PI / 3;
    return ring;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------
export function useThreeScene() {
    const refs = useRef<ThreeRefs>({
        scene:    null,
        camera:   null,
        renderer: null,
        particles: null,
        frameId:  null,
    });

    const mouseRef = useRef({ x: 0, y: 0 });

    const init = useCallback((container: HTMLDivElement): (() => void) => {
        const r = refs.current;

        // ── Scene ──────────────────────────────────────────────────────────
        const scene = new THREE.Scene();
        r.scene = scene;

        // ── Camera ─────────────────────────────────────────────────────────
        const { clientWidth: W, clientHeight: H } = container;
        const camera = new THREE.PerspectiveCamera(70, W / H, 0.1, 100);
        camera.position.z = 6;
        r.camera = camera;

        // ── Renderer ───────────────────────────────────────────────────────
        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(W, H);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setClearColor(0x000000, 0);           // transparent bg
        if (!container.querySelector('canvas')) {
            container.appendChild(renderer.domElement);
        }
        r.renderer = renderer;

        // ── Objects ────────────────────────────────────────────────────────
        const particles = buildParticleSphere();
        scene.add(particles);
        r.particles = particles;

        const ring = buildRing();
        scene.add(ring);

        // Soft ambient fog for depth
        scene.fog = new THREE.FogExp2(0x080d1a, 0.04);

        // ── Mouse tracking ─────────────────────────────────────────────────
        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current.x = (e.clientX / window.innerWidth)  * 2 - 1;
            mouseRef.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener('mousemove', handleMouseMove, { passive: true });

        // ── Visibility pause ───────────────────────────────────────────────
        let paused = false;
        const handleVisibility = () => { paused = document.hidden; };
        document.addEventListener('visibilitychange', handleVisibility);

        // ── Animation loop ─────────────────────────────────────────────────
        const clock = new THREE.Clock();
        const animate = () => {
            r.frameId = requestAnimationFrame(animate);
            if (paused) return;

            const t = clock.getElapsedTime();

            // Idle rotation
            particles.rotation.y  = t * 0.06;
            particles.rotation.x += 0.0004;

            // Subtle mouse parallax
            particles.rotation.x += (mouseRef.current.y * 0.012 - particles.rotation.x) * 0.025;
            particles.rotation.y += (mouseRef.current.x * 0.012 - particles.rotation.y) * 0.025;

            ring.rotation.z = t * 0.04;

            renderer.render(scene, camera);
        };
        animate();

        // ── Resize ─────────────────────────────────────────────────────────
        let resizeTimer: ReturnType<typeof setTimeout>;
        const handleResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                const W2 = container.clientWidth;
                const H2 = container.clientHeight;
                camera.aspect = W2 / H2;
                camera.updateProjectionMatrix();
                renderer.setSize(W2, H2);
            }, 100);
        };
        window.addEventListener('resize', handleResize, { passive: true });

        // ── Cleanup ────────────────────────────────────────────────────────
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('visibilitychange', handleVisibility);
            clearTimeout(resizeTimer);

            if (r.frameId !== null) cancelAnimationFrame(r.frameId);

            // Dispose GPU resources
            particles.geometry.dispose();
            (particles.material as THREE.Material).dispose();
            ring.geometry.dispose();
            (ring.material as THREE.Material).dispose();

            renderer.dispose();
            if (container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }

            r.scene    = null;
            r.camera   = null;
            r.renderer = null;
            r.particles = null;
            r.frameId  = null;
        };
    }, []);

    return { init };
}
