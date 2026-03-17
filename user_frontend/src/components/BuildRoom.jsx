import React, { useRef, useState, useEffect, useMemo, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import myFloorImage from "../assets/room_floor.png";
import room_diamentions from "../assets/room_dimensions.png";

// 3D Engine Imports
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  OrbitControls,
  useTexture,
  Html,
  useGLTF,
  Clone,
  Edges,
} from "@react-three/drei";
import { FaTimes } from "react-icons/fa";

const itemsList = [
  // Doors
  {
    id: "door-single",
    name: "Single Panel Door",
    type: "door",
    width: 98,
    height: 205,
    elevation: 0,
    model: "/models/doors/Single_Panel_Door.glb",
    image: "/pictures/Single Panel Door.jpg",
    yOffset: 0,
  },
  {
    id: "door-glass",
    name: "Glass Door",
    type: "door",
    width: 95,
    height: 210,
    elevation: 0,
    model: "/models/doors/Glass_Door.glb",
    image: "/pictures/Glass Door.jpg",
    yOffset: 0,
    xOffset: -45,
  },
  {
    id: "door-french",
    name: "French Double Door",
    type: "door",
    width: 161,
    height: 206,
    elevation: 0,
    model: "/models/doors/French_Double_Door.glb",
    image: "/pictures/French Double Door.jpg",
    yOffset: 100,
  },
  {
    id: "door-glass-double",
    name: "Glass Double Door",
    type: "door",
    width: 226,
    height: 210,
    elevation: 0,
    model: "/models/doors/Glass_Double_Door.glb",
    image: "/pictures/Glass Double Door.jpg",
    yOffset: 20,
    xOffset: -20,
  },

  // Windows
  {
    id: "window-sliding",
    name: "Sliding Window",
    type: "window",
    width: 110,
    height: 105,
    elevation: 70,
    model: "/models/windows/Sliding_Window.glb",
    image: "/pictures/Sliding Window.jpg",
    yOffset: 0,
    xOffset: 0,
    scale: [5, 5, 1],
  },
];

// 3D COMPONENTS (For Step 3)
const Floor3D = ({ vertices, floorStyle }) => {
  const texture = useTexture(floorStyle || myFloorImage);

  const { width, height, minX, maxY } = useMemo(() => {
    const xs = vertices.map((v) => v[0]);
    const ys = vertices.map((v) => v[1]);
    return {
      width: Math.max(...xs) - Math.min(...xs),
      height: Math.max(...ys) - Math.min(...ys),
      minX: Math.min(...xs),
      maxY: Math.max(...ys),
    };
  }, [vertices]);

  useEffect(() => {
    texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(0.008, 0.008);
    texture.needsUpdate = true;
  }, [texture, width, height, minX, maxY]);

  const shape = useMemo(() => {
    const s = new THREE.Shape();
    vertices.forEach((v, i) => {
      if (i === 0) s.moveTo(v[0], -v[1]);
      else s.lineTo(v[0], -v[1]);
    });
    return s;
  }, [vertices]);

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <shapeGeometry args={[shape]} />
      <meshStandardMaterial
        map={texture}
        side={THREE.DoubleSide}
        color="#ffffff"
        roughness={0.5}
      />
    </mesh>
  );
};

// Item Dispaly & Transprent
const PlacedItem3D = ({
  item,
  wallHeight,
  wallLength,
  placedItems,
  setPlacedItems,
  wallMidX,
  wallMidZ,
  selectedItemId,
  setSelectedItemId,
  isAnyDragging,
  setIsAnyDragging,
}) => {
  const [hovered, setHovered] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isWallVisible, setIsWallVisible] = useState(true);
  const selected = selectedItemId === item.id;
  const { width, height, elevation, model, scale } = item.itemDef;

  // 3D Model (.glb)
  const { scene } = useGLTF(model);

  const clonedScene = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if (child.isMesh) {
        child.material = child.material.clone();
      }
    });
    return clone;
  }, [scene]);

  const modelRef = useRef();
  const isVisibleRef = useRef(true);
  const {
    camera,
    pointer,
    raycaster,
    scene: globalScene,
    controls,
  } = useThree();

  // Cursor (Grab/Grabbing)
  useEffect(() => {
    if (isDragging) document.body.style.cursor = "grabbing";
    else if (hovered) document.body.style.cursor = "grab";
    else document.body.style.cursor = "auto";
    return () => {
      document.body.style.cursor = "auto";
    };
  }, [isDragging, hovered]);

  // Measurements
  const distLeft = wallLength / 2 + item.localX - width / 2;
  const distRight = wallLength / 2 - item.localX - width / 2;
  const distBottom = elevation;
  const distTop = wallHeight - elevation - height;

  const formatInches = (cm) => {
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    if (feet === 0) return `${inches}"`;
    return `${feet}'\u00A0${inches}"`;
  };

  useFrame(() => {
    if (modelRef.current) {
      const wallDir = new THREE.Vector3(wallMidX, 0, wallMidZ).normalize();
      const camDir = camera.position.clone().setY(0).normalize();

      const currentlyVisible = wallDir.dot(camDir) <= 0.2;

      isVisibleRef.current = currentlyVisible;

      if (currentlyVisible !== isWallVisible) {
        setIsWallVisible(currentlyVisible);
      }

      const targetOpacity = currentlyVisible ? 1 : 0;

      modelRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.transparent = true;
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.3
          );
          child.material.depthWrite = child.material.opacity > 0;
        }
      });

      if (!currentlyVisible) {
        if (hovered) setHovered(false);
        if (selected) setSelectedItemId(null);
        if (isDragging) {
          setIsDragging(false);
          setIsAnyDragging(false);
          if (controls) controls.enabled = true;
        }
      }
    }
  });
  const itemLocalY = -wallHeight / 2 + elevation + height / 2;

  return (
    <group position={[item.localX, itemLocalY, 0]}>
      <group
        ref={modelRef}
        scale={scale || [1, 1, 1]}
        position={[
          item.itemDef.xOffset || 0,
          -item.itemDef.height / 2 + (item.itemDef.yOffset || 0),
          item.itemDef.zOffset || 0,
        ]}
        rotation={[
          item.itemDef.rotationX || 0,
          item.itemDef.rotationY || 0,
          item.itemDef.rotationZ || 0,
        ]}
      >
        <primitive object={clonedScene} />
      </group>

      <mesh
        position={[0, 0, 0]}
        onPointerEnter={(e) => {
          e.stopPropagation();
          if (isVisibleRef.current) setHovered(true);
        }}
        onPointerLeave={(e) => {
          e.stopPropagation();
          setHovered(false);
        }}
        // Dragging
        onPointerDown={(e) => {
          e.stopPropagation();
          setSelectedItemId(item.id);
          setIsDragging(true);

          setIsAnyDragging(true);
          if (controls) controls.enabled = false;

          try {
            e.target.setPointerCapture(e.pointerId);
          } catch (err) {}
        }}
        onPointerUp={(e) => {
          e.stopPropagation();
          setIsDragging(false);

          setIsAnyDragging(false);
          if (controls) controls.enabled = true;

          try {
            e.target.releasePointerCapture(e.pointerId);
          } catch (err) {}
        }}
        onPointerMove={(e) => {
          if (isDragging) {
            e.stopPropagation();

            // (Cross-wall Dragging)
            raycaster.setFromCamera(pointer, camera);
            const intersects = raycaster.intersectObjects(
              globalScene.children,
              true
            );
            const hitWallInfo = intersects.find(
              (i) => i.object.userData?.isWall && i.object.material.opacity > 0
            );

            if (
              hitWallInfo &&
              hitWallInfo.object.userData.wallIndex !== item.wallIndex
            ) {
              const newWallIndex = hitWallInfo.object.userData.wallIndex;
              const wallGroup = hitWallInfo.object.parent;
              const localPointNew = wallGroup.worldToLocal(
                hitWallInfo.point.clone()
              );

              setPlacedItems((prev) =>
                prev.map((p) =>
                  p.id === item.id
                    ? { ...p, wallIndex: newWallIndex, localX: localPointNew.x }
                    : p
                )
              );

              return;
            }

            // (Collision)
            const wallGroup = e.object.parent.parent;
            const localPoint = wallGroup.worldToLocal(e.point.clone());
            let newX = localPoint.x;

            const maxW = wallLength / 2 - width / 2;
            let minAllowedX = -maxW;
            let maxAllowedX = maxW;

            const others = placedItems.filter(
              (p) => p.wallIndex === item.wallIndex && p.id !== item.id
            );

            others.forEach((other) => {
              const otherW = other.itemDef.width;
              const otherX = other.localX;
              if (otherX < item.localX) {
                const edge = otherX + otherW / 2 + width / 2;
                if (edge > minAllowedX) minAllowedX = edge + 2;
              } else if (otherX > item.localX) {
                const edge = otherX - otherW / 2 - width / 2;
                if (edge < maxAllowedX) maxAllowedX = edge - 2;
              }
            });

            newX = Math.max(minAllowedX, Math.min(maxAllowedX, newX));

            let newElevation = elevation;
            if (item.itemDef.type === "window") {
              let newY = localPoint.y;
              const maxH = wallHeight / 2 - height / 2;
              const minH = -wallHeight / 2 + height / 2;

              let minAllowedY = minH;
              let maxAllowedY = maxH;

              others.forEach((other) => {
                const otherW = other.itemDef.width;
                const otherH = other.itemDef.height;
                const otherX = other.localX;
                const otherY =
                  -wallHeight / 2 + other.itemDef.elevation + otherH / 2;

                if (
                  newX + width / 2 > otherX - otherW / 2 &&
                  newX - width / 2 < otherX + otherW / 2
                ) {
                  if (otherY < itemLocalY) {
                    const edge = otherY + otherH / 2 + height / 2;
                    if (edge > minAllowedY) minAllowedY = edge + 2;
                  } else {
                    const edge = otherY - otherH / 2 - height / 2;
                    if (edge < maxAllowedY) maxAllowedY = edge - 2;
                  }
                }
              });

              newY = Math.max(minAllowedY, Math.min(maxAllowedY, newY));
              newElevation = newY + wallHeight / 2 - height / 2;
            }

            setPlacedItems((prev) =>
              prev.map((p) =>
                p.id === item.id
                  ? {
                      ...p,
                      localX: newX,
                      itemDef: { ...p.itemDef, elevation: newElevation },
                    }
                  : p
              )
            );
          }
        }}
      >
        <boxGeometry args={[width, height, 15]} />
        <meshBasicMaterial
          color="red"
          transparent
          opacity={0}
          depthWrite={false}
        />
      </mesh>

      {/* Center Marker  */}
      {isWallVisible && !isDragging && (
        <Html
          position={[0, 0, 5]}
          center
          zIndexRange={[90, 0]}
          pointerEvents="none"
        >
          <div className="w-7 h-7 bg-black/20 border-[1.5px] border-white/70 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
        </Html>
      )}

      {(hovered || selected) && isWallVisible && (
        <mesh position={[0, 0, 0]} pointerEvents="none">
          <boxGeometry args={[width + 4, height + 4, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          <Edges scale={1} color="#fbbf24" linewidth={5} />
        </mesh>
      )}

      {/* Drag - Measurements */}
      {isDragging && isWallVisible && (
        <group>
          {/* Left Line */}
          <group position={[-width / 2 - distLeft / 2, 0, 2]}>
            <mesh>
              <boxGeometry args={[distLeft, 1, 1]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[-distLeft / 2, 0, 0]}>
              <boxGeometry args={[0.8, 12, 0.8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[distLeft / 2, 0, 0]}>
              <boxGeometry args={[0.8, 12, 0.8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <Html position={[0, 15, 0]} center zIndexRange={[100, 0]}>
              <div className="bg-[#000000] text-white  text-[13px] font-medium px-1.5 py-0.5 rounded-md shadow-sm">
                {formatInches(distLeft)}
              </div>
            </Html>
          </group>

          {/* Right Line */}
          <group position={[width / 2 + distRight / 2, 0, 2]}>
            <mesh>
              <boxGeometry args={[distRight, 1, 1]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[-distRight / 2, 0, 0]}>
              <boxGeometry args={[0.8, 12, 0.8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <mesh position={[distRight / 2, 0, 0]}>
              <boxGeometry args={[0.8, 12, 0.8]} />
              <meshBasicMaterial color="#000000" />
            </mesh>
            <Html position={[0, 15, 0]} center zIndexRange={[100, 0]}>
              <div className="bg-[#000000] text-white  text-[13px] font-medium px-1.5 py-0.5 rounded-md shadow-sm">
                {formatInches(distRight)}
              </div>
            </Html>
          </group>

          {/* Top/Bottom Lines (For Windows) */}
          {item.itemDef.type === "window" && (
            <>
              <group position={[0, height / 2 + distTop / 2, 2]}>
                <mesh>
                  <boxGeometry args={[1, distTop, 1]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -distTop / 2, 0]}>
                  <boxGeometry args={[12, 0.8, 0.8]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, distTop / 2, 0]}>
                  <boxGeometry args={[12, 0.8, 0.8]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <Html position={[15, 0, 0]} center zIndexRange={[100, 0]}>
                  <div className="bg-[#000000] text-white  text-[13px] font-medium px-1.5 py-0.5 rounded-md shadow-sm">
                    {formatInches(distTop)}
                  </div>
                </Html>
              </group>

              <group position={[0, -height / 2 - distBottom / 2, 2]}>
                <mesh>
                  <boxGeometry args={[1, distBottom, 1]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, -distBottom / 2, 0]}>
                  <boxGeometry args={[12, 0.8, 0.8]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <mesh position={[0, distBottom / 2, 0]}>
                  <boxGeometry args={[12, 0.8, 0.8]} />
                  <meshBasicMaterial color="#000000" />
                </mesh>
                <Html position={[15, 0, 0]} center zIndexRange={[100, 0]}>
                  <div className="bg-[#000000] text-white text-[13px] font-medium px-1.5 py-0.5 rounded-md shadow-sm">
                    {formatInches(distBottom)}
                  </div>
                </Html>
              </group>
            </>
          )}
        </group>
      )}

      {/* Delete Button */}
      {selected && !isDragging && isWallVisible && (
        <Html position={[0, height / 2 + 23, 0]} center zIndexRange={[100, 0]}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlacedItems((prev) => prev.filter((p) => p.id !== item.id));
            }}
            className="bg-black text-white hover:bg-red-500 rounded-full w-8 h-8 flex items-center justify-center shadow-lg transition-colors cursor-pointer"
          >
            <FaTimes size={16} />
          </button>
        </Html>
      )}
    </group>
  );
};

// Main Wall
const Wall3D = ({ v1, v2, index, wallColor }) => {
  const length = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
  const angle = Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
  const midX = (v1[0] + v2[0]) / 2;
  const midZ = (v1[1] + v2[1]) / 2;
  const height = 220;
  const thickness = 4;

  const groupRef = useRef();
  const { camera } = useThree();

  useFrame(() => {
    if (groupRef.current) {
      const wallDir = new THREE.Vector3(midX, 0, midZ).normalize();
      const camDir = camera.position.clone().setY(0).normalize();
      const d = wallDir.dot(camDir);

      let targetOpacity = 1;
      if (d > 0.4) {
        targetOpacity = 0;
      } else if (d < 0.1) {
        targetOpacity = 1;
      } else {
        targetOpacity = 1 - (d - 0.1) / 0.3;
      }

      groupRef.current.traverse((child) => {
        if (child.isMesh) {
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.15
          );

          if (child.material.opacity < 0.01) {
            child.material.visible = false;
          } else {
            child.material.visible = true;
          }
        }
      });
    }
  });

  return (
    <group
      ref={groupRef}
      position={[midX, height / 2, midZ]}
      rotation={[0, -angle, 0]}
    >
      {/* Main Wall */}
      <mesh
        castShadow
        receiveShadow
        userData={{ isWall: true, wallIndex: index }}
      >
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial
          transparent={true}
          color={wallColor}
          roughness={1}
        />
      </mesh>

      {/* Top Border */}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[length + 5, 5, thickness + 5]} />
        <meshStandardMaterial
          transparent={true}
          color="#f0f0f0"
          roughness={0.9}
        />
      </mesh>

      {/* Bottom Baseboard */}
      <mesh position={[0, -height / 2 + 5, 0]}>
        <boxGeometry args={[length + 5, 10, thickness + 5]} />
        <meshStandardMaterial
          transparent={true}
          color="#f0f0f0"
          roughness={0.9}
        />
      </mesh>

      {/* Left Side Border */}
      <mesh position={[-length / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[5, height, thickness + 5]} />
        <meshStandardMaterial
          transparent={true}
          color="#f0f0f0"
          roughness={0.9}
        />
      </mesh>

      {/* Right Side Border */}
      <mesh position={[length / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[5, height, thickness + 5]} />
        <meshStandardMaterial
          transparent={true}
          color="#f0f0f0"
          roughness={0.9}
        />
      </mesh>
    </group>
  );
};

// 3D Design & Auto Repalcement
const Scene3D = ({
  vertices,
  activeItem,
  setActiveItem,
  placedItems,
  setPlacedItems,
  wallColor,
  floorStyle,
}) => {
  const { camera } = useThree();

  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isAnyDragging, setIsAnyDragging] = useState(false);

  const centeredVertices = useMemo(() => {
    const cx =
      (Math.min(...vertices.map((v) => v[0])) +
        Math.max(...vertices.map((v) => v[0]))) /
      2;
    const cy =
      (Math.min(...vertices.map((v) => v[1])) +
        Math.max(...vertices.map((v) => v[1]))) /
      2;
    return vertices.map((v) => [v[0] - cx, v[1] - cy]);
  }, [vertices]);

  useEffect(() => {
    if (!activeItem) return;

    const sortedWalls = centeredVertices
      .map((v1, i) => {
        const v2 = centeredVertices[(i + 1) % centeredVertices.length];
        const midX = (v1[0] + v2[0]) / 2;
        const midZ = (v1[1] + v2[1]) / 2;
        const length = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);

        const wallDir = new THREE.Vector3(midX, 0, midZ).normalize();
        const camDir = camera.position.clone().setY(0).normalize();
        const isVisible = wallDir.dot(camDir) <= 0.2;

        return { index: i, midX, midZ, length, isVisible };
      })
      .sort((a, b) => (b.isVisible === a.isVisible ? 0 : b.isVisible ? 1 : -1));

    let placed = false;

    for (const wall of sortedWalls) {
      const existingOnWall = placedItems.filter(
        (p) => p.wallIndex === wall.index
      );
      const itemW = activeItem.width;
      let testX = 0;
      let overlap = true;

      for (let offset = 0; offset < wall.length / 2 - itemW / 2; offset += 5) {
        const check = (x) =>
          existingOnWall.some((ex) => {
            const min1 = x - itemW / 2 - 5;
            const max1 = x + itemW / 2 + 5;
            const min2 = ex.localX - ex.itemDef.width / 2;
            const max2 = ex.localX + ex.itemDef.width / 2;
            return !(max1 < min2 || min1 > max2);
          });

        if (!check(offset)) {
          testX = offset;
          overlap = false;
          break;
        }
        if (!check(-offset)) {
          testX = -offset;
          overlap = false;
          break;
        }
      }

      if (!overlap) {
        setPlacedItems((prev) => [
          ...prev,
          {
            id: Date.now(),
            wallIndex: wall.index,
            itemDef: activeItem,
            localX: testX,
          },
        ]);
        setActiveItem(null);
        placed = true;
        break;
      }
    }

    if (!placed) {
      alert("Room Filled in Doors and Windows");
      setActiveItem(null);
    }
  }, [
    activeItem,
    camera,
    centeredVertices,
    placedItems,
    setActiveItem,
    setPlacedItems,
  ]);

  return (
    <Suspense
      fallback={
        <Html center>
          <div className="bg-white px-6 py-3 rounded-lg shadow-md font-bold text-gray-700">
            Loading 3D...
          </div>
        </Html>
      }
    >
      <ambientLight intensity={2.5} />
      <directionalLight
        position={[400, 1000, 400]}
        castShadow
        intensity={1}
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />
      <pointLight
        position={[0, 200, 0]}
        intensity={0.8}
        distance={2000}
        decay={2}
      />

      <Floor3D vertices={centeredVertices} floorStyle={floorStyle} />

      {centeredVertices.map((v, i) => {
        const nextV = centeredVertices[(i + 1) % centeredVertices.length];
        return (
          <Wall3D
            key={`wall-${i}`}
            index={i}
            v1={v}
            v2={nextV}
            wallColor={wallColor}
          />
        );
      })}

      {placedItems.map((item) => {
        const v1 = centeredVertices[item.wallIndex];
        const v2 =
          centeredVertices[(item.wallIndex + 1) % centeredVertices.length];
        const length = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
        const angle = Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
        const midX = (v1[0] + v2[0]) / 2;
        const midZ = (v1[1] + v2[1]) / 2;
        const height = 220;

        return (
          <group
            key={item.id}
            position={[midX, height / 2, midZ]}
            rotation={[0, -angle, 0]}
          >
            <PlacedItem3D
              item={item}
              wallHeight={height}
              wallLength={length}
              placedItems={placedItems}
              setPlacedItems={setPlacedItems}
              wallMidX={midX}
              wallMidZ={midZ}
              selectedItemId={selectedItemId}
              setSelectedItemId={setSelectedItemId}
              isAnyDragging={isAnyDragging}
              setIsAnyDragging={setIsAnyDragging}
            />
          </group>
        );
      })}

      <OrbitControls
        makeDefault
        enabled={!isAnyDragging}
        minPolarAngle={0}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableZoom={true}
        target={[0, 100, 0]}
        enableDamping={true}
        dampingFactor={0.03}
        rotateSpeed={0.5}
      />
    </Suspense>
  );
};

// MAIN COMPONENT
const BuildRoom = () => {
  const navigate = useNavigate();
  const svgRef = useRef(null);

  const [currentStep, setCurrentStep] = useState(1);
  const [unit, setUnit] = useState("cm");

  const [customVertices, setCustomVertices] = useState([]);
  const [draggingWall, setDraggingWall] = useState(null);
  const [dragStartScreenPos, setDragStartScreenPos] = useState(null);
  const [dragStartVertices, setDragStartVertices] = useState(null);
  const [stableVertices, setStableVertices] = useState([]);

  // Smooth Animation
  const [animViewBox, setAnimViewBox] = useState("0 0 800 600");
  const [animScale, setAnimScale] = useState(1);
  const currentVBRef = useRef("0 0 800 600");
  const currentScaleRef = useRef(1);

  const [activeItem, setActiveItem] = useState(null);
  const [placedItems, setPlacedItems] = useState([]);
  const [isPreparing, setIsPreparing] = useState(false);

  const [wallColor, setWallColor] = useState("#ffffff");
  const [floorStyle, setFloorStyle] = useState(myFloorImage);

  const wallColorsList = [
    "#ffffff",
    "#e8e5df",
    "#ebdcd0",
    "#c16b32",
    "#8c4f46",
    "#a7c1c5",
    "#607d80",
    "#8ba378",
    "#7a7e75",
    "#9e8e7c",
    "#6f5063",
    "#4e7364",
  ];

  const floorStylesList = [
    { id: "natural-oak", name: "Natural oak", img: myFloorImage },
    {
      id: "Honey pine",
      name: "Honey pine",
      img: "/pictures/Honey_pine_floor.jpg",
    },
    {
      id: "Glossy tile",
      name: "Glossy tile",
      img: "/pictures/Glossy_tile_floor.webp",
    },
    {
      id: "Cherry oak",
      name: "Cherry oak",
      img: "/pictures/Cherry_oak_floor.jpg",
    },
    {
      id: "Walnut brown",
      name: "Walnut brown",
      img: "/pictures/Walnut_brown_floor.jpg",
    },
    {
      id: "Golden teak",
      name: "Golden teak",
      img: "/pictures/Golden_teak_floor.jpg",
    },
    {
      id: "Level loop grey carpet",
      name: "Level loop grey carpet",
      img: "/pictures/Plush_grey_carpet_floor.jpg",
    },
    {
      id: "Marble tile",
      name: "Marble tile",
      img: "/pictures/Marble_tile_floor.webp",
    },
    {
      id: "Beige tile",
      name: "Beige tile",
      img: "/pictures/Beige_tile_floor.avif",
    },
    {
      id: "Saxony grey carpet",
      name: "Saxony grey carpet",
      img: "/pictures/Saxony_beige_carpet_floor.webp",
    },
    {
      id: "Ash grey",
      name: "Ash grey",
      img: "/pictures/Ash_grey_floor.jpg",
    },
  ];

  const roomShapes = [
    {
      id: "rectangular",
      name: "Rectangular",
      vertices: [
        [100, 100, 40, 40],
        [650, 100, -40, 40],
        [650, 500, -40, -40],
        [100, 500, 40, -40],
      ],
    },
    {
      id: "l-shape",
      name: "L-Shape",
      vertices: [
        [100, 100, 40, 40],
        [400, 100, -40, 40],
        [400, 300, -40, 40],
        [650, 300, -40, 40],
        [650, 500, -40, -40],
        [100, 500, 40, -40],
      ],
    },
    {
      id: "cut",
      name: "Cut",
      vertices: [
        [100, 100, 40, 40],
        [500, 100, -20, 40],
        [650, 300, -40, 20],
        [650, 500, -40, -40],
        [100, 500, 40, -40],
      ],
    },
    {
      id: "t-shape",
      name: "T-Shape",
      vertices: [
        [100, 100, 40, 40],
        [650, 100, -40, 40],
        [650, 450, -40, -40],
        [550, 450, -40, -40],
        [550, 500, -40, -40],
        [200, 500, 40, -40],
        [200, 450, 40, -40],
        [100, 450, 40, -40],
      ],
    },
    {
      id: "notched",
      name: "Notched",
      vertices: [
        [100, 100, 40, 40],
        [250, 100, -40, 40],
        [250, 150, -40, 40],
        [500, 150, 40, 40],
        [500, 100, 40, 40],
        [650, 100, -40, 40],
        [650, 500, -40, -40],
        [100, 500, 40, -40],
      ],
    },
    {
      id: "beveled",
      name: "Beveled",
      vertices: [
        [200, 100, 20, 40],
        [550, 100, -20, 40],
        [650, 250, -40, 20],
        [650, 500, -40, -40],
        [100, 500, 40, -40],
        [100, 250, 40, 20],
      ],
    },
  ];

  const [selectedShape, setSelectedShape] = useState(roomShapes[0]);

  useEffect(() => {
    setCustomVertices(selectedShape.vertices.map((v) => [...v]));
    setStableVertices(selectedShape.vertices.map((v) => [...v]));
  }, [selectedShape]);

  const formatDimension = (cm) => {
    if (unit === "cm") return `${Math.round(cm)} cm`;
    const totalInches = cm / 2.54;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}' ${inches}"`;
  };

  const handleMouseDown = (e, index) => {
    if (currentStep !== 2) return;
    setDraggingWall(index);

    setDragStartScreenPos({ x: e.clientX, y: e.clientY });
    setDragStartVertices(customVertices.map((v) => [...v]));
  };

  const handleMouseMove = (e) => {
    if (draggingWall === null || currentStep !== 2) return;

    const CTM = svgRef.current.getScreenCTM();
    const dx = (e.clientX - dragStartScreenPos.x) / CTM.a;
    const dy = (e.clientY - dragStartScreenPos.y) / CTM.d;

    const i1 = draggingWall;
    const i2 = (draggingWall + 1) % customVertices.length;
    const i0 =
      (draggingWall - 1 + customVertices.length) % customVertices.length;
    const i3 = (draggingWall + 2) % customVertices.length;

    const v1 = dragStartVertices[i1];
    const v2 = dragStartVertices[i2];
    const v0 = dragStartVertices[i0];
    const v3 = dragStartVertices[i3];

    const wallDx = v2[0] - v1[0];
    const wallDy = v2[1] - v1[1];
    const wallLen = Math.sqrt(wallDx * wallDx + wallDy * wallDy);
    const nx = wallDy / wallLen;
    const ny = -wallDx / wallLen;

    const shift = dx * nx + dy * ny;

    const newV1x = v1[0] + shift * nx;
    const newV1y = v1[1] + shift * ny;
    const newV2x = v2[0] + shift * nx;
    const newV2y = v2[1] + shift * ny;

    const MIN_LENGTH = 50;

    const dist = (pA, pB) =>
      Math.sqrt(Math.pow(pB[0] - pA[0], 2) + Math.pow(pB[1] - pA[1], 2));
    const len1 = dist(v0, [newV1x, newV1y]);
    const len2 = dist([newV2x, newV2y], v3);

    const adj1_dx = v1[0] - v0[0];
    const adj1_dy = v1[1] - v0[1];
    const new_adj1_dx = newV1x - v0[0];
    const new_adj1_dy = newV1y - v0[1];

    const adj2_dx = v3[0] - v2[0];
    const adj2_dy = v3[1] - v2[1];
    const new_adj2_dx = v3[0] - newV2x;
    const new_adj2_dy = v3[1] - newV2y;

    const dot1 = adj1_dx * new_adj1_dx + adj1_dy * new_adj1_dy;
    const dot2 = adj2_dx * new_adj2_dx + adj2_dy * new_adj2_dy;

    if (dot1 < 0 || dot2 < 0 || len1 < MIN_LENGTH || len2 < MIN_LENGTH) {
      return;
    }

    const newVertices = [...customVertices];
    newVertices[i1] = [newV1x, newV1y, v1[2], v1[3]];
    newVertices[i2] = [newV2x, newV2y, v2[2], v2[3]];

    setCustomVertices(newVertices);
  };

  const handleMouseUp = () => {
    if (currentStep === 2 && draggingWall !== null) {
      setDraggingWall(null);
      setStableVertices([...customVertices]);
    }
  };

  const currentPath =
    customVertices.length > 0
      ? `M ${customVertices.map((v) => `${v[0]} ${v[1]}`).join(" L ")} Z`
      : "";
  const currentCornerPath =
    customVertices.length > 0
      ? customVertices
          .map((v) => `M ${v[0]} ${v[1]} l ${v[2]} ${v[3]}`)
          .join(" ")
      : "";

  // Dynamic ViewBox
  let targetViewBox = "0 0 800 600";
  let targetScale = 1;

  if (stableVertices.length > 0) {
    const xs = stableVertices.map((v) => v[0]);
    const ys = stableVertices.map((v) => v[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 200;
    const cx = minX + width / 2;
    const cy = minY + height / 2;

    const finalWidth = Math.max(width + padding * 2, 800);
    const finalHeight = Math.max(height + padding * 2, 600);

    targetViewBox = `${cx - finalWidth / 2} ${
      cy - finalHeight / 2
    } ${finalWidth} ${finalHeight}`;
    targetScale = Math.max(finalWidth / 800, finalHeight / 600);
  }

  // Smooth Animation Effect
  useEffect(() => {
    let start = null;
    const duration = 700;

    const startVB = currentVBRef.current.split(" ").map(Number);
    const endVB = targetViewBox.split(" ").map(Number);
    const startS = currentScaleRef.current;
    const endS = targetScale;

    if (startVB.join(" ") === endVB.join(" ") && startS === endS) return;

    let frameId;
    const animate = (time) => {
      if (!start) start = time;
      let progress = (time - start) / duration;
      if (progress > 1) progress = 1;

      const ease =
        progress < 0.5
          ? 4 * progress * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currVB = startVB.map((val, i) => val + (endVB[i] - val) * ease);
      const currS = startS + (endS - startS) * ease;

      currentVBRef.current = currVB.join(" ");
      currentScaleRef.current = currS;

      setAnimViewBox(currentVBRef.current);
      setAnimScale(currS);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [targetViewBox, targetScale]);

  const isDraggingAny = draggingWall !== null;
  const animClass = isDraggingAny
    ? ""
    : "transition-all duration-500 ease-in-out";

  return (
    <div className="fixed top-0 left-0 w-full flex h-screen bg-[#f1f1f1] z-[9999] overflow-hidden animate-fade-up">
      {/* Sidebar  */}
      <div className="w-[540px] flex flex-col bg-white h-full shrink-0 shadow-lg z-10 transition-all duration-300">
        {/* Step 1: Select Shape */}
        {currentStep === 1 && (
          <>
            <div className="p-10 pb-1 animate-fade-right">
              <p className="text-zinc-500 font-bold text-[15px] tracking-wide mb-1 uppercase">
                Step 1 of 4
              </p>
              <h2 className="text-[28px] font-extrabold text-gray-800 leading-tight">
                Set the shape and size
              </h2>
              <p className="text-zinc-500 mt-4 text-[15px] mb-5">
                Select the Shape plan on the bottom to match your room’s walls.
              </p>
            </div>

            <div className="flex-1 overflow-y-auto px-8 custom-scrollbar animate-fade-right">
              <div className="grid grid-cols-2 gap-x-2">
                {roomShapes.map((shape) => {
                  const isSelected = selectedShape.id === shape.id;
                  return (
                    <div
                      key={shape.id}
                      onClick={() => setSelectedShape(shape)}
                      className="flex flex-col items-center cursor-pointer group"
                    >
                      <svg
                        viewBox="0 -2 60 60"
                        className="w-[200px] h-[200px] transition-transform duration-300 group-hover:scale-105"
                      >
                        <polygon
                          points={shape.vertices
                            .map((v) => `${v[0] / 12},${v[1] / 12}`)
                            .join(" ")}
                          fill="#cccccc"
                          stroke={isSelected ? "black" : "none"}
                          strokeWidth="1.2"
                          strokeLinejoin="round"
                          className={`transition-all duration-300 ${
                            isSelected
                              ? "stroke-black"
                              : "stroke-transparent group-hover:stroke-black"
                          }`}
                        />
                      </svg>
                      <span
                        className={`text-[16px] -mt-5 ${
                          isSelected
                            ? "font-extrabold text-black"
                            : "font-medium text-zinc-500 group-hover:text-black"
                        }`}
                      >
                        {shape.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Step 2: Adjust Dimensions */}
        {currentStep === 2 && (
          <>
            <div className="p-10 pb-4 animate-fade-right">
              <p className="text-zinc-500 font-bold text-[15px] uppercase tracking-wide mb-1">
                Step 2 of 4
              </p>
              <h2 className="text-[28px] font-extrabold text-gray-800 leading-tight">
                Adjust your dimensions
              </h2>
              <p className="text-zinc-500 mt-4 text-[15px]">
                Edit the floor plan on the right to match your room’s wall
                dimensions.
              </p>
            </div>

            <div className="px-20 mt-6 flex-1 animate-smooth-right">
              <img
                src={room_diamentions}
                alt="Dimension tutorial"
                className="object-cover mb-5 relative"
              />
              <div className="flex bg-white border-2 border-zinc-400 rounded-full p-1 w-max ml-12 mt-8 shadow-sm items-center">
                <button
                  onClick={() => setUnit("feet")}
                  className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all ${
                    unit === "feet"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  Feet
                </button>
                <button
                  onClick={() => setUnit("cm")}
                  className={`px-6 py-2 rounded-full text-[14px] font-bold transition-all ${
                    unit === "cm"
                      ? "bg-black text-white shadow-md"
                      : "text-gray-500 hover:text-black"
                  }`}
                >
                  Centimeters
                </button>
              </div>
            </div>
          </>
        )}

        {/* Step 3: Doors & Windows Sidebar */}
        {currentStep === 3 && (
          <div className="flex flex-col h-full">
            <div className="p-10 pb-4 animate-fade-right">
              <p className="text-zinc-500 font-bold text-[15px] tracking-wide mb-1 uppercase">
                Step 3 of 4
              </p>
              <h2 className="text-[28px] font-extrabold text-gray-800 leading-tight">
                Add doors and windows
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar animate-fade-right">
              {/* Door Styles Section */}
              <h3 className="font-bold text-zinc-700 mb-5 text-[17px]">
                Door styles
              </h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-8 mb-10">
                {itemsList
                  .filter((i) => i.type === "door")
                  .map((item) => {
                    const isActive = activeItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveItem(item)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div className="w-full bg-[#f8f9fa] rounded-md p-3 flex items-center justify-center relative transition-all group-hover:bg-[#f1f1f1] h-[120px]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full object-contain mix-blend-multiply"
                          />
                          <div
                            className={`absolute inset-0 flex items-center justify-center rounded-md transition-all duration-300 ${
                              isActive
                                ? "bg-black/5 opacity-100"
                                : "opacity-0 group-hover:opacity-100 group-hover:bg-black/5"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-2xl font-light shadow-md transition-transform duration-200 hover:scale-110 ${
                                isActive
                                  ? "bg-black"
                                  : "bg-black/60 hover:bg-black"
                              }`}
                            >
                              +
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[14px] text-center mt-3 leading-tight ${
                            isActive
                              ? "font-bold text-black"
                              : "font-medium text-gray-500 group-hover:text-zinc-600"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
              </div>

              <hr className="border-zinc-300 mb-8 border-2 shadow-md" />

              {/* Window Styles Section */}
              <h3 className="font-bold text-zinc-700 mb-5 text-[17px]">
                Window styles
              </h3>
              <div className="grid grid-cols-3 gap-x-4 gap-y-8">
                {itemsList
                  .filter((i) => i.type === "window")
                  .map((item) => {
                    const isActive = activeItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setActiveItem(item)}
                        className="flex flex-col items-center cursor-pointer group"
                      >
                        <div className="w-full bg-[#f8f9fa] rounded-md p-3 flex items-center justify-center relative transition-all group-hover:bg-[#f1f1f1] h-[100px]">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="max-h-full object-contain mix-blend-multiply"
                          />
                          <div
                            className={`absolute inset-0 flex items-center justify-center rounded-md transition-all duration-300 ${
                              isActive
                                ? "bg-black/5 opacity-100"
                                : "opacity-0 group-hover:opacity-100 group-hover:bg-black/5"
                            }`}
                          >
                            <div
                              className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-2xl font-light shadow-md transition-transform duration-200 hover:scale-110 ${
                                isActive
                                  ? "bg-black"
                                  : "bg-black/60 hover:bg-black"
                              }`}
                            >
                              +
                            </div>
                          </div>
                        </div>
                        <span
                          className={`text-[14px] text-center mt-3 leading-tight ${
                            isActive
                              ? "font-bold text-black"
                              : "font-medium text-gray-500 group-hover:text-zinc-600"
                          }`}
                        >
                          {item.name}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}

        {/* Step 4: Choose Room Style (Wall & Floor) */}
        {currentStep === 4 && (
          <div className="flex flex-col h-full">
            <div className="p-10 pb-10 animate-fade-right">
              <p className="text-zinc-500 font-bold text-[15px] tracking-wide mb-1 uppercase">
                Step 4 of 4
              </p>
              <h2 className="text-[28px] font-extrabold text-gray-800 leading-tight">
                Choose your room style
              </h2>
            </div>

            <div className="flex-1 overflow-y-auto px-10 pb-10 custom-scrollbar animate-fade-right">
              {/* Wall Colors */}
              <h3 className="font-bold text-zinc-700 mb-8 text-[16px]">
                Wall color
              </h3>
              <div className="grid grid-cols-6 gap-6 mb-8">
                {wallColorsList.map((color, idx) => (
                  <button
                    key={idx}
                    onClick={() => setWallColor(color)}
                    className={`w-16 h-16 rounded-lg  transition-transform hover:scale-110 ${
                      wallColor === color
                        ? "ring-2 ring-black ring-offset-4 scale-100"
                        : "border border-zinc-300"
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>

              <hr className="border-zinc-300 mb-8" />

              {/* Floor Styles */}
              <h3 className="font-bold text-zinc-700 mb-8 text-[16px]">
                Floor style
              </h3>
              <p className="text-[13px] text-gray-500 mb-5">
                {floorStylesList.find((f) => f.img === floorStyle)?.name ||
                  "Selected floor"}
              </p>
              <div className="grid grid-cols-5 gap-6">
                {floorStylesList.map((floor) => (
                  <button
                    key={floor.id}
                    onClick={() => setFloorStyle(floor.img)}
                    className={`aspect-square rounded-lg shadow-sm bg-gray-200 overflow-hidden transition-transform hover:scale-110 ${
                      floorStyle === floor.img
                        ? "ring-2 ring-black ring-offset-4 scale-100"
                        : "border border-zinc-300"
                    }`}
                  >
                    <img
                      src={floor.img}
                      alt={floor.name}
                      className="w-full h-full object-cover opacity-90"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center gap-4 p-5 bg-white border-t-2 border-zinc-200 shadow-[0_-5px_8px_-2px_rgba(0,0,0,0.1)]">
          {currentStep < 4 ? (
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="w-full bg-[#111] text-white font-bold text-[15px] py-3 rounded-full hover:shadow-md border-2 border-black hover:bg-white
             hover:text-black transition-colors "
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => {
                setIsPreparing(true);

                setTimeout(() => {
                  const roomData = {
                    vertices: stableVertices,
                    placedItems: placedItems,
                    wallColor: wallColor,
                    floorStyle: floorStyle,
                    unit: unit,
                  };
                  navigate("/room-designer", { state: { roomData } });
                }, 3000);
              }}
              className="w-full bg-[#111] text-white font-bold text-[15px] py-3 rounded-full hover:shadow-md border-2 border-black hover:bg-white
             hover:text-black transition-colors "
            >
              Design this room
            </button>
          )}

          {currentStep === 1 ? (
            <button
              onClick={() => navigate(-1)}
              className="w-full text-gray-400 font-bold py-3 hover:text-white hover:bg-black border-2 rounded-full transition-colors text-[15px]"
            >
              Cancel
            </button>
          ) : (
            <button
              onClick={() => {
                setCurrentStep(currentStep - 1);
                setActiveItem(null);
              }}
              className="w-full text-gray-500 font-bold py-3 hover:text-white border-2 hover:bg-black rounded-full transition-colors text-[15px]"
            >
              Go Back
            </button>
          )}
        </div>
      </div>

      {/* Right Side 2D/3D Panel */}
      <div
        className="flex-1 bg-[#cccccc] flex items-center justify-center relative overflow-hidden"
        onMouseMove={(e) => {
          if (currentStep < 3) handleMouseMove(e);
        }}
        onMouseUp={() => {
          if (currentStep < 3) handleMouseUp();
        }}
        onMouseLeave={() => {
          if (currentStep < 3) handleMouseUp();
        }}
      >
        {currentStep < 3 ? (
          // STEP 1 & 2 (2D SVG VIEW)
          <svg
            ref={svgRef}
            key={selectedShape.id}
            viewBox={animViewBox}
            className={`w-full max-w-[1500px] h-auto overflow-visible ${
              isDraggingAny ? "cursor-grabbing" : "animate-fade-up"
            }`}
          >
            <defs>
              <pattern
                id="wood-floor"
                patternUnits="userSpaceOnUse"
                width="400"
                height="600"
              >
                <image
                  href={myFloorImage}
                  y="0"
                  width="400"
                  height="600"
                  preserveAspectRatio="xMidYMid slice"
                />
                <rect
                  x="0"
                  y="0"
                  width="400"
                  height="600"
                  fill="rgba(0, 0, 0, 0.1)"
                />
              </pattern>
              <filter id="shadow-blur">
                <feGaussianBlur stdDeviation="10" />
              </filter>
              <clipPath id="room-clip">
                <path d={currentPath} />
              </clipPath>
            </defs>

            <path d={currentPath} fill="url(#wood-floor)" />
            <path
              d={currentPath}
              fill="none"
              stroke="black"
              strokeWidth="80"
              filter="url(#shadow-blur)"
              clipPath="url(#room-clip)"
              opacity="0.6"
              className={animClass}
            />
            <path
              d={currentPath}
              fill="none"
              stroke="black"
              strokeWidth="15"
              filter="url(#shadow-blur)"
              opacity="0.15"
              className={animClass}
            />
            <path
              d={currentPath}
              fill="none"
              stroke="#ffffff"
              strokeWidth="80"
              strokeLinejoin="miter"
              clipPath="url(#room-clip)"
              className={animClass}
            />
            <path
              d={currentCornerPath}
              fill="none"
              stroke="rgba(0,0,0,0.18)"
              strokeWidth="2"
              strokeLinecap="round"
              clipPath="url(#room-clip)"
              className={animClass}
            />
            <path
              d={currentPath}
              fill="none"
              stroke="#f1f1f1"
              strokeWidth="7"
              strokeLinejoin="round"
              className={animClass}
            />

            {currentStep === 2 &&
              customVertices.map((v, i) => {
                const nextV = customVertices[(i + 1) % customVertices.length];
                const x1 = v[0],
                  y1 = v[1],
                  x2 = nextV[0],
                  y2 = nextV[1];
                const dx = x2 - x1,
                  dy = y2 - y1;
                const length = Math.sqrt(dx * dx + dy * dy);
                const nx = dy / length,
                  ny = -dx / length,
                  wx = dx / length,
                  wy = dy / length;
                const offset = 25 * animScale,
                  textGap = 28 * animScale;
                const sx = x1 + nx * offset,
                  sy = y1 + ny * offset,
                  ex = x2 + nx * offset,
                  ey = y2 + ny * offset;
                const dimMidX = (sx + ex) / 2,
                  dimMidY = (sy + ey) / 2;
                let angle = Math.atan2(dy, dx) * (180 / Math.PI);
                if (angle > 90) angle -= 180;
                else if (angle <= -90) angle += 180;
                if (Math.abs(Math.round(angle)) === 90) angle = -90;

                return (
                  <g
                    key={`wall-${i}`}
                    className="group cursor-grab active:cursor-grabbing"
                  >
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke="transparent"
                      strokeWidth="25"
                      onMouseDown={(e) => handleMouseDown(e, i)}
                      className="cursor-grab active:cursor-grabbing"
                      style={{ strokeLinecap: "round" }}
                    />
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={draggingWall === i ? "#fbbf24" : "black"}
                      strokeWidth="7"
                      className={`pointer-events-none transition-colors duration-200 ${
                        draggingWall === i
                          ? "stroke-[#fbbf24]"
                          : "stroke-black group-hover:stroke-[#fbbf24]"
                      }`}
                      style={{ strokeLinecap: "round" }}
                    />
                    <circle
                      cx={x1}
                      cy={y1}
                      r="5"
                      fill="white"
                      stroke="black"
                      strokeWidth="1"
                      className="pointer-events-none"
                    />

                    <g className="pointer-events-none">
                      <line
                        x1={x1 + nx * 15 * animScale}
                        y1={y1 + ny * 15 * animScale}
                        x2={x1 + nx * (offset + 6 * animScale)}
                        y2={y1 + ny * (offset + 6 * animScale)}
                        stroke="#9ca3af"
                        strokeWidth={1.5 * animScale}
                      />
                      <line
                        x1={x2 + nx * 15 * animScale}
                        y1={y2 + ny * 15 * animScale}
                        x2={x2 + nx * (offset + 6 * animScale)}
                        y2={y2 + ny * (offset + 6 * animScale)}
                        stroke="#9ca3af"
                        strokeWidth={1.5 * animScale}
                      />
                      {length > textGap * 0.5 ? (
                        <>
                          <line
                            x1={sx}
                            y1={sy}
                            x2={dimMidX - wx * textGap}
                            y2={dimMidY - wy * textGap}
                            stroke="#9ca3af"
                            strokeWidth={1.5 * animScale}
                          />
                          <line
                            x1={dimMidX + wx * textGap}
                            y1={dimMidY + wy * textGap}
                            x2={ex}
                            y2={ey}
                            stroke="#9ca3af"
                            strokeWidth={1.5 * animScale}
                          />
                        </>
                      ) : (
                        <line
                          x1={sx}
                          y1={sy}
                          x2={ex}
                          y2={ey}
                          stroke="#9ca3af"
                          strokeWidth="1"
                        />
                      )}
                    </g>

                    <text
                      x={dimMidX}
                      y={dimMidY + 1}
                      transform={`rotate(${angle}, ${dimMidX}, ${dimMidY})`}
                      fill="#333333"
                      fontSize={9 * animScale}
                      fontWeight="semibold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="pointer-events-none select-none"
                    >
                      {formatDimension(length)}
                    </text>
                  </g>
                );
              })}
          </svg>
        ) : (
          // STEP 3 (REAL 3D ENGINE)
          <div className="absolute inset-0 animate-fade-in cursor-grab active:cursor-grabbing">
            <Canvas
              shadows
              camera={{
                position: [500, 500, 500],
                fov: 50,
                near: 0.1,
                far: 10000,
              }}
            >
              <Scene3D
                vertices={stableVertices}
                activeItem={activeItem}
                setActiveItem={setActiveItem}
                placedItems={placedItems}
                setPlacedItems={setPlacedItems}
                wallColor={wallColor}
                floorStyle={floorStyle}
              />
            </Canvas>
          </div>
        )}
      </div>

      {/*  Loading Screen Overlay (Preparing your room) */}
      {isPreparing && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[99999] flex items-center justify-center transition-opacity duration-300">
          <div className="bg-white px-16 py-12 rounded-lg shadow-2xl flex flex-col items-center animate-fade-up">
            <h3 className="text-[17px] font-bold text-gray-800 mb-6">
              Preparing your room ...
            </h3>

            <div className="w-4 h-4 bg-zinc-500 rounded-full animate-bounce"></div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #c1c1c1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #a8a8a8; }
        .animate-fade-in { animation: fadeIn 0.8s ease-in-out; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
};

export default BuildRoom;
