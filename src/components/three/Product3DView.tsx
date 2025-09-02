// INSANYCK STEP 3
"use client";

import * as THREE from "three";
import { Canvas } from "@react-three/fiber";
import { ContactShadows, OrbitControls, useGLTF } from "@react-three/drei";
import { Suspense, useEffect, useMemo, useRef } from "react";

type Variant = "front" | "back" | "detail";

function ShirtModel({ url }: { url: string }) {
  // carrega glb (se não existir, cai num placeholder)
  const { scene } = useGLTF(url, true) as any;
  return <primitive object={scene} />;
}


export default function Product3DView({
  modelUrl = "/models/shirt.glb",
  variant = "front",
}: {
  modelUrl?: string;
  variant?: Variant;
}) {
  const group = useRef<THREE.Group>(null);

  useEffect(() => {
    if (!group.current) return;
    group.current.rotation.y =
      variant === "back" ? Math.PI : variant === "detail" ? Math.PI / 6 : 0;
  }, [variant]);

  // pedestal
  const base = useMemo(() => {
    const geo = new THREE.CylinderGeometry(1.6, 1.6, 0.18, 64);
    const mat = new THREE.MeshStandardMaterial({
      color: new THREE.Color("#101010"),
      roughness: 0.4,
      metalness: 0.15,
    });
    return { geo, mat };
  }, []);

  return (
    <div className="w-full h-[520px] rounded-3xl bg-[#0a0a0a] border border-white/10 overflow-hidden">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 1.1, 3.2], fov: 35 }}
        onCreated={({ gl, scene }) => {
          // studio look
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.outputColorSpace = THREE.SRGBColorSpace;
          gl.shadowMap.enabled = true;
          gl.shadowMap.type = THREE.PCFSoftShadowMap;
          scene.background = new THREE.Color("#0a0a0a");
        }}
      >
        {/* luz de estúdio */}
        <ambientLight intensity={0.35} />
        <spotLight
          position={[5, 8, 6]}
          angle={0.35}
          penumbra={0.6}
          intensity={90}
          decay={2}
          distance={40}
          castShadow
          color={"#ffffff"}
        />
        <directionalLight
          position={[-5, 8, -2]}
          intensity={0.9}
          color={"#fff"}
          castShadow
        />

        {/* modelo */}
        <Suspense fallback={null}>
          <group ref={group} position={[0, 0.2, 0]} scale={1.25} castShadow>
            {/* tenta carregar o GLB; se falhar, renderiza placeholder */}
            <ShirtModel url={modelUrl} />
          </group>
        </Suspense>

        {/* pedestal */}
        <mesh geometry={base.geo} material={base.mat} position={[0, -0.78, 0]} receiveShadow />
        <ContactShadows
          position={[0, -0.72, 0]}
          opacity={0.55}
          blur={2.8}
          far={3}
          scale={5}
          color="#000000"
        />

        {/* HDR opcional (coloque /hdr/studio.hdr se tiver) */}
        {/* <Environment files="/hdr/studio.hdr" /> */}

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 2.4}
          maxPolarAngle={Math.PI / 2.0}
          rotateSpeed={0.6}
        />
      </Canvas>
    </div>
  );
}
