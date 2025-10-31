"use client";

import { useRef, useEffect, useState } from "react";
import { Renderer, Program, Triangle, Mesh } from "ogl";

export type RaysOrigin =
    | "top-center"
    | "top-center-offset"
    | "top-left"
    | "top-right"
    | "right"
    | "left"
    | "bottom-center"
    | "bottom-right"
    | "bottom-left";

interface LightRaysProps {
    raysOrigin?: RaysOrigin;
    raysColor?: string;
    raysSpeed?: number;
    lightSpread?: number;
    rayLength?: number;
    pulsating?: boolean;
    fadeDistance?: number;
    saturation?: number;
    followMouse?: boolean;
    mouseInfluence?: number;
    noiseAmount?: number;
    distortion?: number;
    className?: string;
}

const DEFAULT_COLOR = "#88ccff"; // 💡 Softer cool-blue glow

const hexToRgb = (hex: string): [number, number, number] => {
    const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return m
        ? [
            parseInt(m[1], 16) / 255,
            parseInt(m[2], 16) / 255,
            parseInt(m[3], 16) / 255,
        ]
        : [1, 1, 1];
};

const getAnchorAndDir = (
    origin: RaysOrigin,
    w: number,
    h: number
): { anchor: [number, number]; dir: [number, number] } => {
    const outside = 0.2;
    switch (origin) {
        case "top-left":
            return { anchor: [0, -outside * h], dir: [0, 1] };
        case "top-right":
            return { anchor: [w, -outside * h], dir: [0, 1] };
        case "top-center-offset":
            return { anchor: [0.5 * w + 0.2 * w, -outside * h], dir: [-0.2, 1] };
        case "left":
            return { anchor: [-outside * w, 0.5 * h], dir: [1, 0] };
        case "right":
            return { anchor: [(1 + outside) * w, 0.5 * h], dir: [-1, 0] };
        case "bottom-left":
            return { anchor: [0, (1 + outside) * h], dir: [0, -1] };
        case "bottom-center":
            return { anchor: [0.5 * w, (1 + outside) * h], dir: [0, -1] };
        case "bottom-right":
            return { anchor: [w, (1 + outside) * h], dir: [0, -1] };
        default: // "top-center"
            return { anchor: [0.5 * w, -outside * h], dir: [0, 1] };
    }
};

const LightRays: React.FC<LightRaysProps> = ({
                                                 raysOrigin = "top-center",
                                                 raysColor = DEFAULT_COLOR,
                                                 raysSpeed = 1,
                                                 lightSpread = 1.2,
                                                 rayLength = 2.5,
                                                 pulsating = true,
                                                 fadeDistance = 1.0,
                                                 saturation = 1.2,
                                                 followMouse = true,
                                                 mouseInfluence = 0.15,
                                                 noiseAmount = 0.05,
                                                 distortion = 0.15,
                                                 className = "",
                                             }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const uniformsRef = useRef<Record<string, { value: any }>>(null);
    const rendererRef = useRef<Renderer | null>(null);
    const mouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const smoothMouseRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const animationIdRef = useRef<number | null>(null);
    const meshRef = useRef<Mesh | null>(null);
    const cleanupFunctionRef = useRef<(() => void) | null>(null);
    const [isVisible, setIsVisible] = useState(false);
    const observerRef = useRef<IntersectionObserver | null>(null);

    // Track visibility for performance
    useEffect(() => {
        if (!containerRef.current) return;
        observerRef.current = new IntersectionObserver(
            ([entry]) => setIsVisible(entry.isIntersecting),
            { threshold: 0.1 }
        );
        observerRef.current.observe(containerRef.current);
        return () => observerRef.current?.disconnect();
    }, []);

    // Core WebGL logic
    useEffect(() => {
        if (!isVisible || !containerRef.current) return;

        if (cleanupFunctionRef.current) cleanupFunctionRef.current();

        const initializeWebGL = async () => {
            if (!containerRef.current) return;

            const renderer = new Renderer({
                dpr: Math.min(window.devicePixelRatio, 2),
                alpha: true,
            });
            rendererRef.current = renderer;
            const gl = renderer.gl;
            gl.canvas.style.width = "100%";
            gl.canvas.style.height = "100%";

            // Clear container before appending
            containerRef.current.replaceChildren(gl.canvas);

            const vert = `
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = position * 0.5 + 0.5;
          gl_Position = vec4(position, 0.0, 1.0);
        }`;

            const frag = `
        precision highp float;
        uniform float iTime;
        uniform vec2  iResolution;
        uniform vec2  rayPos;
        uniform vec2  rayDir;
        uniform vec3  raysColor;
        uniform float raysSpeed;
        uniform float lightSpread;
        uniform float rayLength;
        uniform float pulsating;
        uniform float fadeDistance;
        uniform float saturation;
        uniform vec2  mousePos;
        uniform float mouseInfluence;
        uniform float noiseAmount;
        uniform float distortion;
        varying vec2 vUv;

        float noise(vec2 st) {
          return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
        }

        float rayStrength(vec2 source, vec2 direction, vec2 coord, float seedA, float seedB, float speed) {
          vec2 toCoord = coord - source;
          vec2 normDir = normalize(toCoord);
          float angle = dot(normDir, direction);
          float distorted = angle + distortion * sin(iTime + length(toCoord) * 0.02);
          float spread = pow(max(distorted, 0.0), 1.0 / max(lightSpread, 0.001));
          float dist = length(toCoord);
          float maxDist = iResolution.x * rayLength;
          float lengthFalloff = clamp((maxDist - dist) / maxDist, 0.0, 1.0);
          float fade = clamp((iResolution.x * fadeDistance - dist) / (iResolution.x * fadeDistance), 0.5, 1.0);
          float pulse = pulsating > 0.5 ? (0.9 + 0.1 * sin(iTime * speed * 2.5)) : 1.0;

          float base = clamp(
            (0.45 + 0.15 * sin(distorted * seedA + iTime * speed)) +
            (0.3 + 0.2 * cos(-distorted * seedB + iTime * speed)),
            0.0, 1.0
          );

          return base * lengthFalloff * fade * spread * pulse;
        }

        void mainImage(out vec4 fragColor, in vec2 fragCoord) {
          vec2 coord = vec2(fragCoord.x, iResolution.y - fragCoord.y);
          vec2 dir = rayDir;
          if (mouseInfluence > 0.0) {
            vec2 mouse = mousePos * iResolution.xy;
            vec2 mouseDir = normalize(mouse - rayPos);
            dir = normalize(mix(rayDir, mouseDir, mouseInfluence));
          }
          vec4 rays1 = vec4(rayStrength(rayPos, dir, coord, 36.2, 21.1, 1.3 * raysSpeed));
          vec4 rays2 = vec4(rayStrength(rayPos, dir, coord, 22.4, 18.0, 1.1 * raysSpeed));
          fragColor = rays1 * 0.6 + rays2 * 0.5;

          if (noiseAmount > 0.0) {
            float n = noise(coord * 0.02 + iTime * 0.05);
            fragColor.rgb *= (1.0 - noiseAmount + noiseAmount * n);
          }

          float brightness = 1.0 - (coord.y / iResolution.y);
          fragColor.rgb *= mix(vec3(0.1,0.2,0.3), raysColor, brightness);
          float gray = dot(fragColor.rgb, vec3(0.299, 0.587, 0.114));
          fragColor.rgb = mix(vec3(gray), fragColor.rgb, saturation);
        }

        void main() {
          vec4 c;
          mainImage(c, gl_FragCoord.xy);
          gl_FragColor = vec4(c.rgb, 1.0);
        }`;

            const uniforms = {
                iTime: { value: 0 },
                iResolution: { value: [1, 1] },
                rayPos: { value: [0, 0] },
                rayDir: { value: [0, 1] },
                raysColor: { value: hexToRgb(raysColor) },
                raysSpeed: { value: raysSpeed },
                lightSpread: { value: lightSpread },
                rayLength: { value: rayLength },
                pulsating: { value: pulsating ? 1.0 : 0.0 },
                fadeDistance: { value: fadeDistance },
                saturation: { value: saturation },
                mousePos: { value: [0.5, 0.5] },
                mouseInfluence: { value: mouseInfluence },
                noiseAmount: { value: noiseAmount },
                distortion: { value: distortion },
            };
            uniformsRef.current = uniforms;

            const geometry = new Triangle(gl);
            const program = new Program(gl, { vertex: vert, fragment: frag, uniforms });
            const mesh = new Mesh(gl, { geometry, program });
            meshRef.current = mesh;

            const updatePlacement = () => {
                if (!containerRef.current) return;
                const { clientWidth: w, clientHeight: h } = containerRef.current;
                renderer.setSize(w, h);
                const { anchor, dir } = getAnchorAndDir(raysOrigin, w, h);
                uniforms.iResolution.value = [w, h];
                uniforms.rayPos.value = anchor;
                uniforms.rayDir.value = dir;
            };

            const renderLoop = (t: number) => {
                uniforms.iTime.value = t * 0.001;
                const smoothing = 0.9;
                smoothMouseRef.current.x =
                    smoothMouseRef.current.x * smoothing + mouseRef.current.x * (1 - smoothing);
                smoothMouseRef.current.y =
                    smoothMouseRef.current.y * smoothing + mouseRef.current.y * (1 - smoothing);
                uniforms.mousePos.value = [smoothMouseRef.current.x, smoothMouseRef.current.y];
                renderer.render({ scene: mesh });
                animationIdRef.current = requestAnimationFrame(renderLoop);
            };

            window.addEventListener("resize", updatePlacement);
            updatePlacement();
            animationIdRef.current = requestAnimationFrame(renderLoop);

            cleanupFunctionRef.current = () => {
                if (animationIdRef.current) cancelAnimationFrame(animationIdRef.current);
                window.removeEventListener("resize", updatePlacement);
                renderer.gl.getExtension("WEBGL_lose_context")?.loseContext();
                rendererRef.current = null;
            };
        };

        initializeWebGL();
        return () => cleanupFunctionRef.current?.();
    }, [isVisible]);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!containerRef.current) return;
            const rect = containerRef.current.getBoundingClientRect();
            mouseRef.current = {
                x: (e.clientX - rect.left) / rect.width,
                y: (e.clientY - rect.top) / rect.height,
            };
        };
        if (followMouse) {
            window.addEventListener("mousemove", handleMouseMove);
            return () => window.removeEventListener("mousemove", handleMouseMove);
        }
    }, [followMouse]);

    return (
        <div
            ref={containerRef}
            className={`pointer-events-none relative h-full w-full overflow-hidden ${className}`}
        />
    );
};

export default LightRays;
