import React, { Suspense, useState, useMemo, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  useGLTF,
  Environment,
  Center,
  Html,
  Line,
  useCursor,
} from "@react-three/drei";
import * as THREE from "three";

import {
  EffectComposer,
  Outline,
  Selection,
  Select,
} from "@react-three/postprocessing";

// DimensionLine Component
const DimensionLine = ({ start, end, label, rotation1, rotation2 }) => {
  const color = "#0058a3";
  const labelStyle =
    "bg-white text-[#0058a3] border border-[#0058a3] text-[12px] font-bold px-2 py-0.5 rounded-full shadow-sm whitespace-nowrap pointer-events-none";

  return (
    <group>
      <Line points={[start, end]} color={color} lineWidth={2} />
      <mesh position={start} rotation={rotation1}>
        <coneGeometry args={[0.04, 0.12, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <mesh position={end} rotation={rotation2}>
        <coneGeometry args={[0.04, 0.12, 16]} />
        <meshBasicMaterial color={color} />
      </mesh>
      <Html
        position={[
          (start[0] + end[0]) / 2,
          (start[1] + end[1]) / 2,
          (start[2] + end[2]) / 2,
        ]}
        center
        zIndexRange={[100, 0]}
      >
        <div className={labelStyle}>{label}</div>
      </Html>
    </group>
  );
};

const ModelWithDimensions = ({
  path,
  showDimensions,
  onClick,
  selectedColor,
}) => {
  const { scene } = useGLTF(path);
  const scale = 1.2;

  const [hovered, setHovered] = useState(false);
  useCursor(hovered);

  useEffect(() => {
    if (scene) {
      scene.traverse((child) => {
        if (child.isMesh && child.name === "mesh_0") {
          child.material.color.set(selectedColor);
        }
      });
    }
  }, [selectedColor, scene]);

  const size = useMemo(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const modelSize = new THREE.Vector3();
    box.getSize(modelSize);
    return modelSize.multiplyScalar(scale);
  }, [scene, scale]);

  const w = size.x / 2;
  const h = size.y / 2;
  const d = size.z / 2;

  const cmX = Math.round(size.x * 100);
  const cmY = Math.round(size.y * 100);
  const cmZ = Math.round(size.z * 100);

  return (
    <group onClick={onClick}>
      <Select enabled={hovered}>
        <primitive
          object={scene}
          scale={scale}
          onPointerOver={(e) => {
            e.stopPropagation();
            setHovered(true);
          }}
          onPointerOut={(e) => {
            e.stopPropagation();
            setHovered(false);
          }}
        />
      </Select>

      {showDimensions && (
        <group>
          <DimensionLine
            start={[-w - 0.2, -h, 0]}
            end={[-w - 0.2, h, 0]}
            label={`${cmY} cm`}
            rotation1={[Math.PI, 0, 0]}
            rotation2={[0, 0, 0]}
          />
          <DimensionLine
            start={[-w, -h - 0.15, d + 0.15]}
            end={[w, -h - 0.15, d + 0.15]}
            label={`${cmX} cm`}
            rotation1={[0, 0, Math.PI / 2]}
            rotation2={[0, 0, -Math.PI / 2]}
          />
          <DimensionLine
            start={[w + 0.15, -h - 0.15, -d]}
            end={[w + 0.15, -h - 0.15, d]}
            label={`${cmZ} cm`}
            rotation1={[-Math.PI / 2, 0, 0]}
            rotation2={[Math.PI / 2, 0, 0]}
          />
        </group>
      )}
    </group>
  );
};

const ModelViewer = ({ modelPath, isDarkMode, selectedColor }) => {
  const [showDimensions, setShowDimensions] = useState(false);

  const [isDelayed, setIsDelayed] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsDelayed(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      className={`w-full h-full rounded-l-xl overflow-hidden cursor-grab active:cursor-grabbing transition-colors duration-500 relative ${
        isDarkMode ? "bg-[#1a1a1ac9]" : "bg-[#f9f9f9]"
      }`}
    >
      <Canvas
        camera={{ position: [0, 1.5, 4], fov: 50 }}
        className="z-10 relative"
      >
        <ambientLight intensity={isDarkMode ? 0.3 : 0.6} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Environment preset="city" />
        {isDelayed ? (
          <Html center>
            <div className="text-[10px] font-bold px-5 py-2 rounded-full shadow-sm bg-white border border-dashed whitespace-nowrap">
              3D Design Loading...
            </div>
          </Html>
        ) : (
          <Suspense
            fallback={
              <Html center>
                <div className="text-[10px] font-bold px-5 py-2 rounded-full shadow-sm bg-white border border-dashed whitespace-nowrap">
                  3D Design Loading...
                </div>
              </Html>
            }
          >
            <Selection>
              <EffectComposer autoClear={false}>
                <Outline
                  blur
                  visibleEdgeColor="#fbbf24"
                  hiddenEdgeColor="#fbbf24"
                  edgeStrength={5}
                  width={1000}
                />
              </EffectComposer>

              <Center>
                <ModelWithDimensions
                  path={modelPath}
                  showDimensions={showDimensions}
                  selectedColor={selectedColor}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowDimensions(!showDimensions);
                  }}
                />
              </Center>
            </Selection>
          </Suspense>
        )}

        <OrbitControls
          enableZoom={true}
          autoRotate={!showDimensions}
          autoRotateSpeed={2.5}
        />
      </Canvas>

      {!showDimensions && (
        <div
          className={`absolute bottom-6 left-1/2 -translate-x-1/2 text-[12px] font-medium px-4 py-2 rounded-full pointer-events-none transition-colors ${
            isDarkMode
              ? "bg-zinc-800/80 text-zinc-300"
              : "bg-white/80 text-zinc-600 shadow-sm"
          }`}
        >
          Tap object to show dimensions
        </div>
      )}
    </div>
  );
};

export default ModelViewer;
