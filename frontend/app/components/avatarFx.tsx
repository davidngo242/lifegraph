'use client';

// Tiện ích dùng chung cho hiệu ứng 3D của bục (AvatarDais) và linh thú (AvatarPet3D):
// hạt (Points + shader nhỏ, không texture ngoài), hình học uốn cong/gradient, giảm chuyển động.

import React, { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/** Ref luôn phản ánh `prefers-reduced-motion: reduce` của người dùng. */
export function usePrefersReducedMotion(): React.MutableRefObject<boolean> {
  const ref = useRef(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    ref.current = mq.matches;
    const onChange = (e: MediaQueryListEvent) => {
      ref.current = e.matches;
    };
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return ref;
}

const disposeDeep = (v: unknown): void => {
  if (!v || typeof v !== 'object') return;
  const d = v as { dispose?: () => void };
  if (typeof d.dispose === 'function') {
    d.dispose();
    return;
  }
  if (Object.getPrototypeOf(v) === Object.prototype) Object.values(v).forEach(disposeDeep);
};

/** Tạo tài nguyên three một lần (geometry/material/texture) và dispose khi unmount. */
export function useAssets<T extends Record<string, unknown>>(factory: () => T): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const assets = useMemo(factory, []);
  useEffect(() => () => disposeDeep(assets), [assets]);
  return assets;
}

/** Hệ số co mắt khi chớp (1 = mở, ~0.08 = nhắm), chu kỳ ~3.9s. */
export function blinkScale(t: number, offset = 0): number {
  const p = (t + offset) % 3.9;
  return p < 0.16 ? 1 - Math.sin((p / 0.16) * Math.PI) * 0.92 : 1;
}

/** Cú liếc ngắn định kỳ: 0 = nhìn camera, 1 = liếc về phía nhân vật. */
export function glanceAmount(t: number, offset = 0): number {
  const p = (t + offset) % 8;
  if (p > 2.6) return 0;
  return Math.sin((p / 2.6) * Math.PI) ** 0.6;
}

const AXIS = { x: 0, y: 1, z: 2 } as const;
type Axis = keyof typeof AXIS;

/** Uốn hình học: cộng vào trục `into` một lượng k * (toạ độ `along` - from)^2. */
export function bendGeometry(geo: THREE.BufferGeometry, along: Axis, into: Axis, k: number, from = 0) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const arr = pos.array as Float32Array;
  const a = AXIS[along];
  const b = AXIS[into];
  for (let i = 0; i < pos.count; i++) {
    const d = arr[i * 3 + a] - from;
    arr[i * 3 + b] += k * d * d;
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Tô gradient màu đỉnh (vertex color) theo một trục; vật liệu phải bật vertexColors. */
export function paintGradient(
  geo: THREE.BufferGeometry,
  axis: Axis,
  from: number,
  to: number,
  c0: string,
  c1: string
) {
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const col = new Float32Array(pos.count * 3);
  const a = new THREE.Color(c0);
  const b = new THREE.Color(c1);
  const m = new THREE.Color();
  const ax = AXIS[axis];
  for (let i = 0; i < pos.count; i++) {
    const t = Math.min(1, Math.max(0, (pos.array[i * 3 + ax] - from) / (to - from || 1)));
    m.copy(a).lerp(b, t);
    col[i * 3] = m.r;
    col[i * 3 + 1] = m.g;
    col[i * 3 + 2] = m.b;
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  return geo;
}

/** Ống thon dần theo đường cong (đuôi, sừng); có thể tô gradient dọc chiều dài. */
export function taperedTube(
  pts: THREE.Vector3[],
  r0: number,
  r1: number,
  tubular = 20,
  radial = 8,
  c0?: string,
  c1?: string
) {
  const curve = new THREE.CatmullRomCurve3(pts);
  const geo = new THREE.TubeGeometry(curve, tubular, 1, radial, false);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  const stride = radial + 1;
  const center = new THREE.Vector3();
  const v = new THREE.Vector3();
  const col = c0 && c1 ? new Float32Array(pos.count * 3) : null;
  const ca = c0 ? new THREE.Color(c0) : null;
  const cb = c1 ? new THREE.Color(c1) : null;
  const cm = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const j = Math.floor(i / stride);
    const u = j / tubular;
    curve.getPointAt(u, center);
    const r = r0 + (r1 - r0) * u;
    v.fromBufferAttribute(pos, i).sub(center).multiplyScalar(r).add(center);
    pos.setXYZ(i, v.x, v.y, v.z);
    if (col && ca && cb) {
      cm.copy(ca).lerp(cb, u);
      col[i * 3] = cm.r;
      col[i * 3 + 1] = cm.g;
      col[i * 3 + 2] = cm.b;
    }
  }
  if (col) geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  pos.needsUpdate = true;
  geo.computeVertexNormals();
  return geo;
}

/** Texture bóng mờ tròn (canvas, không asset ngoài). */
export function makeShadowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 64;
  const g = c.getContext('2d');
  if (g) {
    const grd = g.createRadialGradient(32, 32, 2, 32, 32, 31);
    grd.addColorStop(0, 'rgba(2,6,23,0.62)');
    grd.addColorStop(0.55, 'rgba(2,6,23,0.26)');
    grd.addColorStop(1, 'rgba(2,6,23,0)');
    g.fillStyle = grd;
    g.fillRect(0, 0, 64, 64);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.needsUpdate = true;
  return tex;
}

// ---------------------------------------------------------------------------
// Hạt: một Points + ShaderMaterial. Mỗi hạt có hình (0 chấm sáng, 1 lấp lánh, 2 vảy/kim cương,
// 3 cỏ bốn lá, 4 đồng xu, 5 ngọn lửa, 6 lá). Không thêm đèn.
// ---------------------------------------------------------------------------

const VERT = /* glsl */ `
attribute vec3 aColor;
attribute float aSize;
attribute float aAlpha;
attribute float aShape;
attribute float aSeed;
uniform float uScale;
varying vec3 vColor;
varying float vAlpha;
varying float vShape;
varying float vSeed;
void main() {
  vColor = aColor;
  vAlpha = aAlpha;
  vShape = aShape;
  vSeed = aSeed;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  float s = length(modelViewMatrix[0].xyz);
  gl_PointSize = max(1.0, aSize * s * uScale / max(0.01, -mv.z));
  gl_Position = projectionMatrix * mv;
}
`;

const FRAG = /* glsl */ `
varying vec3 vColor;
varying float vAlpha;
varying float vShape;
varying float vSeed;
uniform float uTime;
vec2 rot2(vec2 p, float a) {
  float c = cos(a); float s = sin(a);
  return vec2(c * p.x - s * p.y, s * p.x + c * p.y);
}
void main() {
  vec2 p = (gl_PointCoord - 0.5) * 2.0;
  p.y = -p.y;
  float a = 0.0;
  vec3 col = vColor;
  float rot = vSeed * 6.2831 + uTime * (0.5 + vSeed);
  float d = length(p);
  if (vShape < 0.5) {
    a = pow(1.0 - smoothstep(0.0, 1.0, d), 1.5);
    col = mix(col, vec3(1.0), (1.0 - d) * 0.45);
  } else if (vShape < 1.5) {
    float v = pow(abs(p.x), 0.5) + pow(abs(p.y), 0.5);
    float core = 1.0 - smoothstep(0.0, 0.38, d);
    a = max(1.0 - smoothstep(0.5, 1.0, v), core);
    col = mix(col, vec3(1.0), core * 0.85);
  } else if (vShape < 2.5) {
    vec2 q = rot2(p, rot * 0.5);
    float v = abs(q.x) * 1.15 + abs(q.y) * 0.8;
    a = 1.0 - smoothstep(0.78, 0.9, v);
    col = mix(col, vec3(1.0), smoothstep(0.25, 0.75, v) * 0.55);
  } else if (vShape < 3.5) {
    vec2 q = rot2(p, rot * 0.3);
    float m = min(min(length(q - vec2(0.42, 0.0)), length(q + vec2(0.42, 0.0))),
                  min(length(q - vec2(0.0, 0.42)), length(q + vec2(0.0, 0.42))));
    a = 1.0 - smoothstep(0.34, 0.42, m);
    col = mix(col * 0.62, col, smoothstep(0.0, 0.55, d));
  } else if (vShape < 4.5) {
    float sx = max(0.14, abs(cos(rot * 1.4)));
    vec2 q = vec2(p.x / sx, p.y);
    float dd = length(q);
    a = 1.0 - smoothstep(0.84, 0.92, dd);
    float ring = smoothstep(0.5, 0.56, dd) * (1.0 - smoothstep(0.62, 0.68, dd));
    col = mix(col, col * 0.55, ring);
    col = mix(col, vec3(1.0), 0.55 * (1.0 - smoothstep(0.0, 0.7, length(q - vec2(-0.3, 0.3)))));
  } else if (vShape < 5.5) {
    float y01 = (p.y + 0.9) / 1.8;
    float wob = sin(p.y * 6.0 + uTime * 9.0 + vSeed * 6.0) * 0.09 * y01;
    float w = 0.6 * pow(max(0.0, sin(3.14159 * pow(clamp(y01, 0.0, 1.0), 0.62))), 0.9) * (1.0 - 0.3 * y01);
    a = (1.0 - smoothstep(w - 0.14, w, abs(p.x + wob))) * step(0.0, y01) * step(y01, 1.0);
    float core = (1.0 - smoothstep(max(w, 0.001) * 0.2, max(w, 0.001) * 0.7, abs(p.x + wob))) * (1.0 - smoothstep(0.1, 0.75, y01));
    col = mix(col, vec3(1.0), core * 0.8);
  } else {
    vec2 q = rot2(p, rot);
    float e = (q.x * q.x) / 0.2 + (q.y * q.y) / 0.72;
    a = 1.0 - smoothstep(0.8, 1.0, e);
    col = mix(col * 0.68, col, smoothstep(0.0, 0.1, abs(q.x)));
  }
  float alpha = a * vAlpha;
  if (alpha < 0.01) discard;
  gl_FragColor = vec4(col, alpha);
}
`;

export type FxOut = {
  x: number;
  y: number;
  z: number;
  size: number;
  alpha: number;
  shape: number;
  s0: number;
  s1: number;
  s2: number;
  s3: number;
  still: boolean;
};
export type FxEmit = (i: number, t: number, o: FxOut) => void;

const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * Hệ hạt tái sử dụng. `emit` ghi vị trí/cỡ/độ mờ/hình của hạt thứ i tại thời điểm t
 * (không cấp phát trong useFrame). Khi reduced-motion bật: tính đúng 1 khung tĩnh rồi dừng.
 */
export function FxParticles({
  count,
  colors,
  emit,
  reducedRef,
  position,
}: {
  count: number;
  colors: string[];
  emit: FxEmit;
  reducedRef: React.MutableRefObject<boolean>;
  position?: [number, number, number];
}) {
  const emitRef = useRef(emit);
  emitRef.current = emit;
  const stillDone = useRef(false);
  const out = useRef<FxOut>({ x: 0, y: 0, z: 0, size: 0, alpha: 0, shape: 0, s0: 0, s1: 0, s2: 0, s3: 0, still: false });
  const colorKey = colors.join('|');

  const { geo, mat, seeds } = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const colorArr = new Float32Array(count * 3);
    const seedArr = new Float32Array(count * 4);
    const pal = colorKey.split('|');
    const tmp = new THREE.Color();
    for (let i = 0; i < count; i++) {
      // Shader xuất thẳng giá trị sRGB nên dùng hex gốc (không chuyển linear).
      tmp.set(pal[i % pal.length]).convertLinearToSRGB();
      colorArr[i * 3] = tmp.r;
      colorArr[i * 3 + 1] = tmp.g;
      colorArr[i * 3 + 2] = tmp.b;
      for (let k = 0; k < 4; k++) seedArr[i * 4 + k] = hash(i * 4 + k + 1);
    }
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 3), 3));
    g.setAttribute('aColor', new THREE.BufferAttribute(colorArr, 3));
    g.setAttribute('aSize', new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute('aAlpha', new THREE.BufferAttribute(new Float32Array(count), 1));
    g.setAttribute('aShape', new THREE.BufferAttribute(new Float32Array(count), 1));
    const seedAttr = new Float32Array(count);
    for (let i = 0; i < count; i++) seedAttr[i] = seedArr[i * 4 + 1];
    g.setAttribute('aSeed', new THREE.BufferAttribute(seedAttr, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 50);
    const m = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uScale: { value: 400 }, uTime: { value: 0 } },
      transparent: true,
      depthWrite: false,
    });
    return { geo: g, mat: m, seeds: seedArr };
  }, [count, colorKey]);

  useEffect(
    () => () => {
      geo.dispose();
      mat.dispose();
    },
    [geo, mat]
  );

  useFrame((state) => {
    const still = reducedRef.current;
    if (still && stillDone.current) return;
    stillDone.current = still;
    const cam = state.camera as THREE.PerspectiveCamera;
    const t = still ? 0 : state.clock.elapsedTime;
    mat.uniforms.uScale.value =
      (state.size.height * state.gl.getPixelRatio()) / (2 * Math.tan(((cam.fov || 36) * Math.PI) / 360));
    mat.uniforms.uTime.value = t;
    const pos = geo.attributes.position as THREE.BufferAttribute;
    const size = geo.attributes.aSize as THREE.BufferAttribute;
    const alpha = geo.attributes.aAlpha as THREE.BufferAttribute;
    const shape = geo.attributes.aShape as THREE.BufferAttribute;
    const o = out.current;
    o.still = still;
    for (let i = 0; i < count; i++) {
      o.s0 = seeds[i * 4];
      o.s1 = seeds[i * 4 + 1];
      o.s2 = seeds[i * 4 + 2];
      o.s3 = seeds[i * 4 + 3];
      o.alpha = 0;
      o.size = 0;
      o.shape = 0;
      emitRef.current(i, t, o);
      pos.setXYZ(i, o.x, o.y, o.z);
      size.setX(i, o.size);
      alpha.setX(i, o.alpha);
      shape.setX(i, o.shape);
    }
    pos.needsUpdate = true;
    size.needsUpdate = true;
    alpha.needsUpdate = true;
    shape.needsUpdate = true;
  });

  return <points geometry={geo} material={mat} position={position} frustumCulled={false} renderOrder={5} />;
}
