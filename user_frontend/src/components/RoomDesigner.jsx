import React, { useState, useMemo, useRef, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, useTexture, useGLTF, Html } from "@react-three/drei";
import toast, { CheckmarkIcon, ErrorIcon } from "react-hot-toast";

import { MdAdd } from "react-icons/md";
import { HiOutlineClipboardList } from "react-icons/hi";
import { RiHeart3Line } from "react-icons/ri";
import { FaSearch, FaTimes } from "react-icons/fa";
import { FaLessThan } from "react-icons/fa6";
import { TbBoxAlignTopLeft } from "react-icons/tb";
import { MdOutlineViewInAr } from "react-icons/md";
import { RiDeleteBin6Line } from "react-icons/ri";
import { MdRotateRight } from "react-icons/md";
import {
  MdOutlineWarehouse,
  MdCheck,
  MdOutlineColorLens,
  MdOutlineStraighten,
  MdZoomOutMap,
  MdBrightnessMedium,
} from "react-icons/md";
import { IoArrowUndo } from "react-icons/io5";
import { IoArrowRedo } from "react-icons/io5";
import { IoSaveSharp } from "react-icons/io5";
import { useWishlist } from "../context/WishlistContext";
import { useCart } from "../context/CartContext";
import { FaShoppingCart } from "react-icons/fa";
import CartDrawer from "../components/CartDrawer";

import { auth, db } from "../firebase";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  onSnapshot,
} from "firebase/firestore";

// Room Render Components
const Floor3D = ({ vertices, floorStyle }) => {
  const texture = useTexture(floorStyle);
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

  React.useEffect(() => {
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

const Wall3D = ({ v1, v2, index, wallColor, viewMode, showRuler }) => {
  const length = Math.hypot(v2[0] - v1[0], v2[1] - v1[1]);
  const angle = Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
  const midX = (v1[0] + v2[0]) / 2;
  const midZ = (v1[1] + v2[1]) / 2;
  const height = 220;
  const thickness = 6;

  const groupRef = useRef();
  const dimensionGroupRef = useRef();
  const { camera } = useThree();

  const lengthInches = length / 2.54;
  const feet = Math.floor(lengthInches / 12);
  const inches = Math.round(lengthInches % 12);
  const dimensionText = `${feet}' ${inches}"`;

  useFrame(() => {
    if (groupRef.current) {
      const wallDir = new THREE.Vector3(midX, 0, midZ).normalize();
      const camDir = camera.position.clone().setY(0).normalize();
      const isVisible = viewMode === "top" ? true : wallDir.dot(camDir) <= 0.2;
      const targetOpacity = isVisible ? 1 : 0;

      groupRef.current.traverse((child) => {
        if (child.isMesh && !child.userData.keepOpaque) {
          child.material.transparent = true;
          child.material.opacity = THREE.MathUtils.lerp(
            child.material.opacity,
            targetOpacity,
            0.3
          );
          child.material.depthWrite = child.material.opacity > 0.95;
        }
      });
      if (dimensionGroupRef.current) {
        const targetY = isVisible ? height / 2 + 10 : -height / 2 + 2;
        dimensionGroupRef.current.position.y = THREE.MathUtils.lerp(
          dimensionGroupRef.current.position.y,
          targetY,
          0.15
        );
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={[midX, height / 2, midZ]}
      rotation={[0, -angle, 0]}
    >
      {showRuler && (
        <group ref={dimensionGroupRef} position={[0, height / 2 + 10, 0]}>
          <mesh>
            <boxGeometry args={[length, 1.5, 1.5]} />
            <meshBasicMaterial color="#888" />
          </mesh>

          <mesh position={[-length / 2, 0, 0]}>
            <boxGeometry args={[1.5, 20, 1.5]} />
            <meshBasicMaterial color="#888" />
          </mesh>

          <mesh position={[length / 2, 0, 0]}>
            <boxGeometry args={[1.5, 20, 1.5]} />
            <meshBasicMaterial color="#888" />
          </mesh>

          <Html center position={[0, 15, 0]} zIndexRange={[50, 0]}>
            <div className="px-2 py-0.5 rounded text-black font-semiold text-[15px] tracking-wider shadow-sm pointer-events-none whitespace-nowrap">
              {dimensionText}
            </div>
          </Html>
        </group>
      )}

      {/* Main Wall */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[length, height, thickness]} />
        <meshStandardMaterial color={wallColor} roughness={1} />
      </mesh>

      {/* Top Border */}
      <mesh position={[0, height / 2, 0]} receiveShadow>
        <boxGeometry args={[length, 5, thickness + 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={0.9} />
      </mesh>

      {/* Bottom Baseboard */}
      <mesh
        position={[0, -height / 2 + 4.5, 0]}
        userData={{ keepOpaque: true }}
      >
        <boxGeometry args={[length - 2, 8, thickness + 1.5]} />
        <meshStandardMaterial
          color="#ffffff"
          roughness={1}
          transparent={false}
          depthWrite={true}
        />
      </mesh>

      {/* Left Side Border */}
      <mesh position={[-length / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[5, height, thickness + 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>

      {/* Right Side Border */}
      <mesh position={[length / 2, 0, 0]} receiveShadow>
        <boxGeometry args={[5, height, thickness + 1.5]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
    </group>
  );
};

// Smooth  Fly Controller
const CameraController = ({
  viewMode,
  activeSideView,
  isDragging,
  setIsOrbiting,
  controlsRef,
  zoomCommand,
  setZoomCommand,
}) => {
  const { camera } = useThree();
  const targetPos = React.useRef(new THREE.Vector3(700, 600, 700));
  const targetLook = React.useRef(new THREE.Vector3(0, 0, 0));
  const [isAnimating, setIsAnimating] = React.useState(false);

  // Smooth Zoom
  React.useEffect(() => {
    if (zoomCommand !== 0 && controlsRef.current) {
      const currentTarget = controlsRef.current.target;
      const currentDistance = camera.position.distanceTo(currentTarget);
      const direction = new THREE.Vector3()
        .subVectors(camera.position, currentTarget)
        .normalize();

      let newDistance = currentDistance;

      if (zoomCommand > 0 && currentDistance > 50) {
        newDistance = currentDistance * 0.9;
      } else if (zoomCommand < 0 && currentDistance < 3000) {
        newDistance = currentDistance * 1.1;
      }

      targetPos.current
        .copy(currentTarget)
        .add(direction.multiplyScalar(newDistance));
      targetLook.current.copy(currentTarget);

      setIsAnimating(true);
      setZoomCommand(0);
    }
  }, [zoomCommand, camera, controlsRef, setZoomCommand]);

  React.useEffect(() => {
    if (viewMode === "dollhouse") {
      targetPos.current.set(550, 550, 550);
      targetLook.current.set(0, 0, 0);
    } else if (viewMode === "top") {
      targetPos.current.set(0, 1000, 1);
      targetLook.current.set(0, 0, 0);
    } else if (viewMode === "side") {
      if (activeSideView === "front") {
        targetPos.current.set(0, 150, 600);
      } else if (activeSideView === "back") {
        targetPos.current.set(0, 150, -600);
      } else if (activeSideView === "left") {
        targetPos.current.set(600, 150, 0);
      } else if (activeSideView === "right") {
        targetPos.current.set(-600, 150, 0);
      }
      targetLook.current.set(0, 150, 0);
    }
    setIsAnimating(true);
  }, [viewMode, activeSideView]);

  useFrame(() => {
    // If animation is finished, do nothing
    if (!isAnimating) return;

    // Smoothly move camera to new position
    camera.position.lerp(targetPos.current, 0.06);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLook.current, 0.06);
    }

    // Stop animation when close enough
    camera.lookAt(
      controlsRef.current ? controlsRef.current.target : targetLook.current
    );

    if (camera.position.distanceTo(targetPos.current) < 2) {
      camera.position.copy(targetPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLook.current);
        controlsRef.current.update();
      }
      setIsAnimating(false);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enableDamping
      dampingFactor={0.03}
      minPolarAngle={0}
      maxPolarAngle={Math.PI / 2 - 0.05}
      rotateSpeed={0.5}
      enableRotate={viewMode !== "top"}
      target={[0, 100, 0]}
      enabled={!isAnimating && !isDragging}
      onStart={() => setIsOrbiting && setIsOrbiting(true)}
      onEnd={() => setIsOrbiting && setIsOrbiting(false)}
    />
  );
};

const sharedDragPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const sharedIntersectPoint = new THREE.Vector3();

// 3D (Draggable Furniture)
const DraggableFurniture = ({
  item,
  isSelected,
  setSelectedFurnId,
  setDraggedFurnId,
  draggedFurnId,
  updateFurniture,
  removeFurniture,
  baseBounds,
  furniture,
  isOrbiting,
  productsList,
}) => {
  const { scene } = useGLTF(item.model);
  const [activeMenu, setActiveMenu] = React.useState(null);
  const [showRotate, setShowRotate] = React.useState(false);
  const [showScale, setShowScale] = React.useState(false);
  const [showColor, setShowColor] = React.useState(false);
  const [hovered, setHovered] = React.useState(false);
  const { controls } = useThree();

  const outerGroupRef = useRef();
  const scaleGroupRef = useRef();
  const isDraggingLocal = useRef(false);
  const targetDragPos = useRef(new THREE.Vector3(...item.position));

  // Furniture Colors List
  const furnitureColors = [
    "default",
    "#ffffff",
    "#1a1a1a",
    "#8B4513",
    "#5d6e73",
    "#a33a3a",
    "#3a5a40",
    "#d1bfae",
  ];

  // Base Scale
  const baseScale = React.useMemo(() => {
    const product = productsList.find((p) => p.id === item.productId);
    return product?.scale || 400;
  }, [item.productId, productsList]);

  const targetScale = item.scale || 400;
  const isDragging = draggedFurnId === item.id;
  const appliedColor = item.color || "default";
  const appliedShade = item.shade !== undefined ? item.shade : 1;

  useEffect(() => {
    if (!isDraggingLocal.current && outerGroupRef.current) {
      outerGroupRef.current.position.set(...item.position);
    }
  }, [item.position]);

  useEffect(() => {
    if (outerGroupRef.current) {
      outerGroupRef.current.rotation.set(0, (item.rotation * Math.PI) / 180, 0);
    }
  }, [item.rotation]);

  // Clone scene and add "Outline" mesh
  const clonedScene = React.useMemo(() => {
    const clone = scene.clone();
    const outlinesToAdd = [];

    clone.traverse((child) => {
      if (child.isMesh && child.name !== "custom-outline") {
        child.material = child.material.clone();

        if (!child.userData.originalMaterial) {
          child.userData.originalMaterial = child.material.clone();
        }

        if (appliedColor !== "default") {
          const baseCol = new THREE.Color(appliedColor);
          child.material.color = baseCol.multiplyScalar(appliedShade);
        } else {
          const baseCol = child.userData.originalMaterial.color.clone();
          child.material.color = baseCol.multiplyScalar(appliedShade);
        }

        const outlineMaterial = new THREE.MeshBasicMaterial({
          color: "#eab308",
          side: THREE.BackSide,
          transparent: true,
          opacity: 0,
        });

        const outlineMesh = new THREE.Mesh(child.geometry, outlineMaterial);
        outlineMesh.scale.set(1.08, 1.08, 1.08);
        outlineMesh.name = "custom-outline";

        outlinesToAdd.push({ parent: child, outline: outlineMesh });
      }
    });

    outlinesToAdd.forEach(({ parent, outline }) => {
      parent.add(outline);
    });

    return clone;
  }, [scene, appliedColor, appliedShade]);

  // 3D Glow Highlight
  React.useEffect(() => {
    clonedScene.traverse((child) => {
      if (child.isMesh && child.name === "custom-outline") {
        if (isSelected) {
          child.material.opacity = 1;
        } else if (hovered) {
          child.material.opacity = 0.5;
        } else {
          child.material.opacity = 0;
        }
      }
    });
  }, [clonedScene, hovered, isSelected]);

  const { height, yOffset } = React.useMemo(() => {
    const box = new THREE.Box3().setFromObject(clonedScene);
    const size = new THREE.Vector3();
    box.getSize(size);
    return {
      height: size.y,
      yOffset: -box.min.y,
    };
  }, [clonedScene]);

  useFrame(() => {
    if (scaleGroupRef.current) {
      scaleGroupRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.15
      );
    }

    if (isDraggingLocal.current && outerGroupRef.current) {
      outerGroupRef.current.position.lerp(targetDragPos.current, 0.1);
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);

    if (controls) controls.enabled = false;

    isDraggingLocal.current = true;
    setSelectedFurnId(item.id);
    setDraggedFurnId(item.id);
    targetDragPos.current.copy(outerGroupRef.current.position);
  };

  const handlePointerUp = (e) => {
    e.stopPropagation();
    e.target.releasePointerCapture(e.pointerId);

    if (controls) controls.enabled = true;

    if (isDraggingLocal.current) {
      isDraggingLocal.current = false;
      setDraggedFurnId(null);

      if (outerGroupRef.current) {
        updateFurniture(item.id, {
          position: [targetDragPos.current.x, 0, targetDragPos.current.z],
        });
      }
    }
  };

  const handlePointerMove = (e) => {
    if (!isDraggingLocal.current) return;
    e.stopPropagation();

    e.ray.intersectPlane(sharedDragPlane, sharedIntersectPoint);

    if (sharedIntersectPoint) {
      let newX = sharedIntersectPoint.x;
      let newZ = sharedIntersectPoint.z;

      const mX = item.marginX || 50;
      const mZ = item.marginZ || 50;
      const angle = (item.rotation * Math.PI) / 180;
      const currentScaleMultiplier = targetScale / baseScale;
      const dynamicMarginX =
        Math.abs(Math.cos(angle)) * mX + Math.abs(Math.sin(angle)) * mZ;
      const dynamicMarginZ =
        Math.abs(Math.sin(angle)) * mX + Math.abs(Math.cos(angle)) * mZ;

      if (baseBounds) {
        newX = Math.max(
          baseBounds.minX + dynamicMarginX,
          Math.min(baseBounds.maxX - dynamicMarginX, newX)
        );
        newZ = Math.max(
          baseBounds.minZ + dynamicMarginZ,
          Math.min(baseBounds.maxZ - dynamicMarginZ, newZ)
        );
      }

      let isColliding = false;
      for (let f of furniture) {
        if (f.id !== item.id) {
          const dist = Math.hypot(f.position[0] - newX, f.position[2] - newZ);
          const safeDistance = Math.max(dynamicMarginX, dynamicMarginZ) + 20;
          if (dist < safeDistance) {
            isColliding = true;
            break;
          }
        }
      }

      if (!isColliding) {
        targetDragPos.current.set(newX, 0, newZ);
      }
    }
  };

  const menuYPosition = height * 0.1 * baseScale + 80;

  return (
    <group
      ref={outerGroupRef}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onPointerMove={handlePointerMove}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        setHovered(false);
      }}
    >
      <group ref={scaleGroupRef} scale={[0.01, 0.01, 0.01]}>
        <group scale={[0.1, 0.1, 0.1]}>
          <primitive object={clonedScene} position={[0, yOffset, 0]} />
        </group>
      </group>

      {/* Center Indicator Dot */}
      {!isSelected && !isDraggingLocal.current && !isOrbiting && (
        <Html
          position={[0, height * 0.05 * targetScale, 0]}
          center
          zIndexRange={[90, 0]}
        >
          <div className="w-7 h-7 bg-black/20 border-[1.5px] border-white/70 rounded-full flex items-center justify-center backdrop-blur-sm shadow-sm">
            <div className="w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
          </div>
        </Html>
      )}

      {isSelected && !isDragging && (
        <Html position={[0, menuYPosition, 0]} zIndexRange={[100, 0]}>
          <div
            className="relative flex flex-col items-center select-none"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Color Palette Menu */}
            {activeMenu === "color" && (
              <div
                className="absolute bottom-full mb-1 bg-[#222] p-2 rounded-xl shadow-2xl animate-fade-up grid grid-cols-4 gap-2"
                onPointerDown={(e) => e.stopPropagation()}
              >
                {furnitureColors.map((color) => (
                  <button
                    key={color}
                    onClick={(e) => {
                      e.stopPropagation();
                      updateFurniture(item.id, { color: color });
                    }}
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center overflow-hidden transition-transform ${
                      appliedColor === color
                        ? "ring-2 ring-white ring-offset-1 scale-100"
                        : "border border-zinc-400 hover:scale-110"
                    }`}
                    style={{
                      backgroundColor: color === "default" ? "#f1f1f1" : color,
                    }}
                  >
                    {color === "default" && (
                      <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45"></div>
                    )}
                  </button>
                ))}
              </div>
            )}

            {/* Scale Slider Menu */}
            {activeMenu === "scale" && (
              <div
                className="absolute bottom-full mb-1 bg-[#222] text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-up flex flex-col items-center w-[200px]"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-[12px] font-bold mb-2">
                  Size: {Math.round((targetScale / baseScale) * 100)}%
                </span>
                <input
                  type="range"
                  min={baseScale * 0.5}
                  max={baseScale * 1.5}
                  step={baseScale * 0.05}
                  value={targetScale}
                  onChange={(e) =>
                    updateFurniture(item.id, {
                      scale: parseFloat(e.target.value),
                    })
                  }
                  className="w-full cursor-pointer"
                />
              </div>
            )}

            {/* Rotate Slider */}
            {activeMenu === "rotate" && (
              <div
                className="absolute bottom-full mb-1 bg-[#222] text-white px-4 py-0.5 rounded-xl shadow-2xl animate-fade-up flex flex-col items-center w-[200px]"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-[12px] font-bold mb-2">
                  {item.rotation}°
                </span>
                <input
                  type="range"
                  min="-180"
                  max="180"
                  step="45"
                  list="rotation-marks"
                  value={item.rotation}
                  onChange={(e) =>
                    updateFurniture(item.id, {
                      rotation: parseInt(e.target.value),
                    })
                  }
                  className="w-full cursor-pointer"
                />

                <datalist
                  id="rotation-marks"
                  className="flex justify-between w-full mt-1 text-[10px] text-gray-00"
                >
                  <option value="-180" label="-180"></option>
                  <option value="-90" label="-90"></option>
                  <option value="0" label="0"></option>
                  <option value="90" label="90"></option>
                  <option value="180" label="180"></option>
                </datalist>
              </div>
            )}

            {/* Shade (Brightness) Slider Menu */}
            {activeMenu === "shade" && (
              <div
                className="absolute bottom-full mb-1 bg-[#222] text-white px-4 py-2.5 rounded-xl shadow-2xl animate-fade-up flex flex-col items-center w-[200px]"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <span className="text-[12px] font-bold mb-2">
                  Brightness: {Math.round(appliedShade * 100)}%
                </span>
                <input
                  type="range"
                  min="0.2"
                  max="1"
                  step="0.1"
                  value={appliedShade}
                  onChange={(e) =>
                    updateFurniture(item.id, {
                      shade: parseFloat(e.target.value),
                    })
                  }
                  className="w-full cursor-pointer accent-purple-400"
                />
              </div>
            )}

            {/* MAIN BUTTONS */}
            <div className="bg-[#222] text-white rounded-full shadow-2xl flex items-center px-1 py-1.5 gap-1 animate-fade-up">
              {/* Color Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === "color" ? null : "color");
                }}
                className={`flex flex-col items-center justify-center px-4 transition-colors ${
                  showColor ? "text-green-400" : "hover:text-green-400"
                }`}
              >
                <span className="text-[15px] mb-0.5">
                  <MdOutlineColorLens size={17} />
                </span>
                <span className="text-[11px] font-bold">Color</span>
              </button>

              <div className="w-[2px] h-9 bg-zinc-600 mx-1"></div>

              {/* Shade Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === "shade" ? null : "shade");
                }}
                className={`flex flex-col items-center justify-center px-4 transition-colors ${
                  activeMenu === "shade"
                    ? "text-purple-400"
                    : "hover:text-purple-400"
                }`}
              >
                <span className="text-[15px] mb-0.5">
                  <MdBrightnessMedium size={17} />
                </span>
                <span className="text-[11px] font-bold">Shade</span>
              </button>

              <div className="w-[2px] h-9 bg-zinc-600 mx-1"></div>

              {/* Size Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === "scale" ? null : "scale");
                }}
                className={`flex flex-col items-center justify-center px-4 transition-colors ${
                  showScale ? "text-yellow-400" : "hover:text-yellow-400"
                }`}
              >
                <span className="text-[15px] mb-0.5">
                  <MdZoomOutMap size={16} />
                </span>
                <span className="text-[11px] font-bold">Size</span>
              </button>

              <div className="w-[2px] h-9 bg-zinc-600 mx-1"></div>

              {/* Rotate Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === "rotate" ? null : "rotate");
                }}
                className="flex flex-col items-center justify-center px-4 hover:text-yellow-400 transition-colors"
              >
                <span className="text-[15px] mb-0.5">
                  <MdRotateRight size={18} />
                </span>
                <span className="text-[11px] font-bold">Rotate</span>
              </button>

              <div className="w-[2px] h-9 bg-zinc-600 mx-1"></div>

              {/* Remove Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFurniture(item.id);
                }}
                className="flex flex-col items-center justify-center px-4 hover:text-red-400 transition-colors"
              >
                <span className="text-[15px] mb-0.5">
                  <RiDeleteBin6Line />
                </span>
                <span className="text-[11px] font-bold">Remove</span>
              </button>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

// Door/ Window Component
const StaticPlacedItem3D = ({ item, wallHeight, wallMidX, wallMidZ }) => {
  const { width, height, elevation, model, scale } = item.itemDef;
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
  const { camera } = useThree();

  useFrame(() => {
    if (modelRef.current) {
      const wallDir = new THREE.Vector3(wallMidX, 0, wallMidZ).normalize();
      const camDir = camera.position.clone().setY(0).normalize();
      const targetOpacity = wallDir.dot(camDir) <= 0.2 ? 1 : 0;

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
    </group>
  );
};

const RoomDesigner = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const searchParams = new URLSearchParams(location.search);
  const uid = searchParams.get("uid");
  const did = searchParams.get("did");
  const isAdminMode = !!(uid && did);

  const initialLoadDesign = location.state?.loadDesign;
  const initialRoomData = initialLoadDesign
    ? initialLoadDesign.roomData
    : location.state?.roomData;

  const [roomData, setRoomData] = useState(initialRoomData || null);
  const [furniture, setFurniture] = useState(
    initialLoadDesign ? initialLoadDesign.furniture : []
  );
  const [currentWallColor, setCurrentWallColor] = useState(
    initialLoadDesign?.wallColor || "default"
  );
  const [designName, setDesignName] = useState(
    initialLoadDesign ? initialLoadDesign.name : "Untitled Design"
  );
  const [currentDesignId, setCurrentDesignId] = useState(
    initialLoadDesign ? initialLoadDesign.id : Date.now()
  );
  const [isLoadingShared, setIsLoadingShared] = useState(isAdminMode);

  const [customerName, setCustomerName] = useState("");

  useEffect(() => {
    const fetchSharedDesign = async () => {
      if (isAdminMode) {
        try {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const uData = userSnap.data();
            setCustomerName(
              uData.firstName
                ? `${uData.firstName} ${uData.lastName}`
                : uData.name || "Unknown User"
            );
          }

          const docRef = doc(db, "users", uid, "savedDesigns", did);
          const docSnap = await getDoc(docRef);

          if (docSnap.exists()) {
            const data = docSnap.data();
            setRoomData(data.roomData);
            setFurniture(data.furniture || []);
            setDesignName(data.name || "Untitled Design");
            setCurrentWallColor(data.wallColor || "default");
            setCurrentDesignId(data.id || did);
          } else {
            toast.error("Design not found!");
          }
        } catch (error) {
          console.error("Error fetching shared design:", error);
        } finally {
          setIsLoadingShared(false);
        }
      }
    };
    fetchSharedDesign();
  }, [isAdminMode, uid, did]);
  const centeredVertices = React.useMemo(() => {
    if (!roomData?.vertices) return [];
    const cx =
      (Math.min(...roomData.vertices.map((v) => v[0])) +
        Math.max(...roomData.vertices.map((v) => v[0]))) /
      2;
    const cy =
      (Math.min(...roomData.vertices.map((v) => v[1])) +
        Math.max(...roomData.vertices.map((v) => v[1]))) /
      2;
    return roomData.vertices.map((v) => [v[0] - cx, v[1] - cy]);
  }, [roomData]);

  const baseBounds = React.useMemo(() => {
    if (!centeredVertices || centeredVertices.length === 0) return null;
    const xs = centeredVertices.map((v) => v[0]);
    const zs = centeredVertices.map((v) => v[1]);
    return {
      minX: Math.min(...xs),
      maxX: Math.max(...xs),
      minZ: Math.min(...zs),
      maxZ: Math.max(...zs),
    };
  }, [centeredVertices]);

  const [activeTab, setActiveTab] = useState("add");
  const [viewMode, setViewMode] = useState("dollhouse");
  const [activeSideView, setActiveSideView] = useState("front");
  const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [showRuler, setShowRuler] = useState(false);

  const wallColors = [
    "default",
    "#f9f9f9",
    "#e6ded5",
    "#dcd3cb",
    "#a85d26",
    "#6c4127",
    "#b9c6c9",
    "#536872",
    "#8b9474",
    "#7b7a78",
    "#45413f",
    "#674f63",
  ];

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isCategoryMenuOpen, setIsCategoryMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFurnId, setSelectedFurnId] = useState(null);
  const [draggedFurnId, setDraggedFurnId] = useState(null);
  const [isOrbiting, setIsOrbiting] = useState(false);
  const { wishlistItems, removeFromWishlist } = useWishlist();
  const [showExitModal, setShowExitModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [zoomCommand, setZoomCommand] = useState(0);
  const controlsRef = useRef();
  const {
    cartItems,
    addToCart,
    removeFromCart,
    updateQuantity,
    setIsCartOpen,
  } = useCart();

  const [past, setPast] = useState([]);
  const [future, setFuture] = useState([]);
  const isUndoRedoRef = useRef(false);
  const [isSavingDesign, setIsSavingDesign] = useState(false);
  const [roomBrightness, setRoomBrightness] = useState(1);

  const [productsList, setProductsList] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Firebase
  useEffect(() => {
    const productsRef = collection(db, "products");

    const unsubscribe = onSnapshot(productsRef, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          ...data,
          id: data.id || doc.id,
          image: data.img || "",
          model: data.modelPath || "",
          description: data.desc || data.description || "",
          scale: data.scale || 400,
          marginX: data.marginX || 50,
          marginZ: data.marginZ || 50,
        };
      });
      setProductsList(fetched);
      setLoadingProducts(false);
    });

    return () => unsubscribe();
  }, []);

  // Cart Toast Notifications
  const handleCartNavigation = (path) => {
    toast(
      (t) => (
        <div className="flex flex-col gap-3 min-w-[280px]">
          <div className="flex items-center gap-2">
            <span className="text-xl">🎨</span>
            <p className="font-bold text-gray-900 text-[15px]">
              Save before you leave?
            </p>
          </div>
          <p className="text-[13px] text-gray-500 font-medium">
            Don't lose your amazing room design!
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => {
                toast.dismiss(t.id);
                handleSaveDesign();
                setTimeout(() => navigate(path), 2000);
              }}
              className="flex-1 bg-black text-white px-3 py-2 rounded-md text-[13px] font-bold hover:bg-gray-800 transition-colors"
            >
              Save & Go
            </button>
            <button
              onClick={() => {
                toast.dismiss(t.id);
                toast.custom(
                  (t) => (
                    <div
                      className={`${
                        t.visible ? "toast-enter" : "toast-exit"
                      } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                    >
                      <ErrorIcon size={20} className="text-red-400" />
                      <span className="text-[14px] font-medium">
                        Design Unsaved!
                      </span>
                    </div>
                  ),
                  { position: "top-right", duration: 3000 }
                );
                setTimeout(() => navigate(path), 2000);
              }}
              className="flex-1 bg-gray-200 text-black px-3 py-2 rounded-md text-[13px] font-bold hover:bg-gray-300 border-2 transition-colors"
            >
              Skip
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          padding: "16px",
          borderRadius: "12px",
          boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        },
      }
    );
  };

  // Design Save Local Storage
  const handleSaveDesign = async () => {
    const targetUid = isAdminMode ? uid : auth?.currentUser?.uid;

    if (!targetUid) {
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <ErrorIcon size={20} className="text-red-400" />
            <span className="text-[14px] font-medium">
              Please login to save designs!
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
      return;
    }

    setIsSavingDesign(true);

    const canvasElement = document.querySelector("canvas");
    let capturedImage = "";
    if (canvasElement) {
      capturedImage = canvasElement.toDataURL("image/jpeg", 0.2);
    }

    const designToSave = {
      id: currentDesignId || Date.now(),
      name: designName || "Untitled Design",
      date: new Date().toLocaleDateString(),
      totalPrice: totalPrice || 0,
      roomData: roomData || {},
      furniture: furniture || [],
      wallColor: currentWallColor || "default",
      image: capturedImage || (loadDesign ? loadDesign.image : "") || "",
    };

    const cleanDesignToSave = JSON.parse(JSON.stringify(designToSave));

    if (
      cleanDesignToSave.roomData &&
      Array.isArray(cleanDesignToSave.roomData.vertices)
    ) {
      cleanDesignToSave.roomData.vertices =
        cleanDesignToSave.roomData.vertices.map((v) => {
          return Array.isArray(v) ? { ...v } : v;
        });
    }

    try {
      const designRef = doc(
        db,
        "users",
        targetUid,
        "savedDesigns",
        currentDesignId.toString()
      );
      const docSnap = await getDoc(designRef);
      const isUpdating = docSnap.exists();

      await setDoc(designRef, cleanDesignToSave);

      setIsSavingDesign(false);
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "toast-enter" : "toast-exit"
            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
          >
            <CheckmarkIcon size={20} className="text-green-400" />
            <span className="text-[14px] font-medium">
              {isAdminMode
                ? "User's Design Updated Successfully!"
                : isUpdating
                ? "Design Updated Successfully!"
                : "Design Saved Successfully!"}
            </span>
          </div>
        ),
        { position: "top-right", duration: 3000 }
      );
    } catch (error) {
      console.error("Error saving design to Firebase:", error);
      setIsSavingDesign(false);
      toast.error("Failed to save design. Please try again!");
    }
  };

  const updateFurnitureState = (action) => {
    setFurniture((prev) => {
      const nextState = typeof action === "function" ? action(prev) : action;
      setPast((p) => [...p, { furniture: prev, wallColor: currentWallColor }]);
      setFuture([]);
      return nextState;
    });
  };

  const updateWallColorState = (newColor) => {
    setPast((p) => [
      ...p,
      { furniture: furniture, wallColor: currentWallColor },
    ]);
    setFuture([]);
    setCurrentWallColor(newColor);
  };

  // Undo/Redo Function
  const applyHistoryState = (historyItem) => {
    isUndoRedoRef.current = true;
    setFurniture(historyItem.furniture);
    setCurrentWallColor(historyItem.wallColor);

    const targetCounts = {};
    historyItem.furniture.forEach((f) => {
      targetCounts[f.productId] = (targetCounts[f.productId] || 0) + 1;
    });

    cartItems.forEach((cItem) => {
      const targetQty = targetCounts[cItem.id] || 0;
      if (targetQty === 0) {
        removeFromCart(cItem.id, "Standard Wood", "Default", false);
      } else if (cItem.quantity !== targetQty) {
        updateQuantity(cItem.id, "Standard Wood", "Default", targetQty, false);
      }
      delete targetCounts[cItem.id];
    });

    Object.keys(targetCounts).forEach((pId) => {
      const qty = targetCounts[pId];
      if (qty > 0) {
        const pData = productsList.find((p) => p.id == pId);
        if (pData) {
          addToCart(
            {
              id: pData.id,
              name: pData.name,
              price: pData.price,
              img: pData.image,
            },
            qty,
            "Standard Wood",
            "Default",
            false,
            false
          );
        }
      }
    });

    setTimeout(() => {
      isUndoRedoRef.current = false;
    }, 100);
  };

  const handleUndo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setPast((prev) => prev.slice(0, prev.length - 1));
    setFuture((prev) => [
      { furniture: furniture, wallColor: currentWallColor },
      ...prev,
    ]);
    applyHistoryState(previous);

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <CheckmarkIcon size={20} className="text-green-400" />
          <span className="text-[14px] font-medium">Undo Successful!</span>
        </div>
      ),
      { position: "top-right", duration: 3000 }
    );
  };

  const handleRedo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setFuture((prev) => prev.slice(1));
    setPast((prev) => [
      ...prev,
      { furniture: furniture, wallColor: currentWallColor },
    ]);
    applyHistoryState(next);

    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? "toast-enter" : "toast-exit"
          } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
        >
          <CheckmarkIcon size={20} className="text-green-400" />
          <span className="text-[14px] font-medium">Redo Successful!</span>
        </div>
      ),
      { position: "top-right", duration: 3000 }
    );
  };

  // Auto Sync Logic Cart
  useEffect(() => {
    if (isUndoRedoRef.current) return;

    setFurniture((prev) => {
      let updated = [...prev];
      let changed = false;

      const roomProductIds = [...new Set(prev.map((f) => f.productId))];
      roomProductIds.forEach((pId) => {
        const cItem = cartItems.find((c) => c.id === pId);
        const rItems = updated.filter((f) => f.productId === pId);

        if (!cItem) {
          updated = updated.filter((f) => f.productId !== pId);
          changed = true;
        } else if (cItem.quantity < rItems.length) {
          const diff = rItems.length - cItem.quantity;
          const idsToRemove = rItems.slice(-diff).map((f) => f.id);
          updated = updated.filter((f) => !idsToRemove.includes(f.id));
          changed = true;
        }
      });

      cartItems.forEach((cItem) => {
        const rItems = updated.filter((f) => f.productId === cItem.id);
        if (cItem.quantity > rItems.length) {
          const diff = cItem.quantity - rItems.length;
          const pData = productsList.find((p) => p.id === cItem.id);
          if (pData) {
            for (let i = 0; i < diff; i++) {
              updated.push({
                id: Date.now() + Math.random(),
                productId: pData.id,
                name: pData.name,
                description: pData.description,
                price: pData.price,
                image: pData.image,
                model: pData.model,
                scale: pData.scale || 400,
                marginX: pData.marginX || 50,
                marginZ: pData.marginZ || 50,
                position: [
                  (Math.random() - 0.5) * 80,
                  0,
                  (Math.random() - 0.5) * 80,
                ],
                rotation: pData.defaultRotation || 0,
              });
            }
            changed = true;
          }
        }
      });

      if (changed) {
        setPast((p) => [
          ...p,
          { furniture: prev, wallColor: currentWallColor },
        ]);
        setFuture([]);
        return updated;
      }
      return prev;
    });
  }, [cartItems]);

  const totalPrice = React.useMemo(() => {
    return furniture.reduce((total, item) => {
      const priceNumber = parseFloat(item.price.replace(/[^0-9.-]+/g, ""));
      return total + (isNaN(priceNumber) ? 0 : priceNumber);
    }, 0);
  }, [furniture]);

  if (isLoadingShared) {
    return (
      <div className="h-screen flex items-center justify-center flex-col bg-[#e5e5e5]">
        <div className="w-12 h-12 border-4 border-zinc-400 border-t-black rounded-full animate-spin mb-4"></div>
        <h1 className="text-xl font-bold text-gray-800">
          Loading User Design...
        </h1>
      </div>
    );
  }

  if (!roomData) {
    return (
      <div className="h-screen flex items-center justify-center flex-col bg-[#e5e5e5]">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">
          No Room Data Found!
        </h1>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-2 bg-black hover:bg-zinc-800 transition-colors text-white rounded-md"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#cccccc] overflow-hidden ">
      {/* LEFT SIDEBAR (Shop Products) */}
      <div className="w-[540px] bg-white flex flex-col shadow-md z-10 shrink-0">
        {/* Top Navigation Tabs */}
        <div className="flex border-b-2 mt-1 border-zinc-200 text-[17px] shadow-md font-semibold text-zinc-500">
          <button
            className={`flex-1 py-4 flex justify-center items-center gap-3 border-b-4 transition-colors ${
              activeTab === "add"
                ? "border-black text-black"
                : "border-transparent hover:text-zinc-700"
            }`}
            onClick={() => setActiveTab("add")}
          >
            <MdAdd size={21} />
            Add
          </button>
          <button
            className={`flex-1 py-4 flex justify-center items-center gap-3 border-b-4 transition-colors ${
              activeTab === "list"
                ? "border-black text-black"
                : "border-transparent hover:text-zinc-700"
            }`}
            onClick={() => setActiveTab("list")}
          >
            <HiOutlineClipboardList size={21} />
            List
          </button>
          <button
            className={`flex-1 py-4 flex justify-center items-center gap-3 border-b-4 transition-colors ${
              activeTab === "favorites"
                ? "border-black text-black"
                : "border-transparent hover:text-zinc-700"
            }`}
            onClick={() => setActiveTab("favorites")}
          >
            <RiHeart3Line size={21} />
            Favorites
          </button>
        </div>

        {/* "Add" Tab Content */}
        {activeTab === "add" && (
          <>
            {/* Search Bar */}
            <div className="p-6 flex items-center gap-3 relative z-20 shadow-md">
              <div className="relative">
                <button
                  onClick={() => setIsCategoryMenuOpen(!isCategoryMenuOpen)}
                  className={`p-2 rounded-full transition-colors ${
                    isCategoryMenuOpen
                      ? "bg-zinc-200 text-black"
                      : "text-black hover:bg-zinc-200"
                  }`}
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16"
                    ></path>
                  </svg>
                </button>

                {/* Dropdown Category Menu */}
                {isCategoryMenuOpen && (
                  <div className="absolute top-[50px] left-0 w-48 bg-white border border-zinc-200 rounded-lg shadow-xl py-2 animate-fade-up z-50">
                    {[
                      "All",
                      "Living Room",
                      "Bed Room",
                      "Office",
                      "Accessories",
                      "Decoration",
                    ].map((cat) => (
                      <button
                        key={cat}
                        onClick={() => {
                          setSelectedCategory(cat);
                          setIsCategoryMenuOpen(false);
                        }}
                        className={`w-full text-left px-5 py-2.5 text-[14px] transition-colors ${
                          selectedCategory === cat
                            ? "font-bold text-black bg-gray-100"
                            : "text-gray-600 hover:bg-gray-50 hover:text-black"
                        }`}
                      >
                        {cat === "All" ? "All Categories" : cat}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex-1 bg-[#f5f5f5] hover:bg-[#e8e8e8] border border-transparent focus-within:bg-white focus-within:border-[#000000] focus-within:ring-1 focus-within:ring-[#000000] rounded-full flex items-center px-4 py-3 transition-all duration-200 cursor-text">
                <span className="text-gray-400 mr-4">
                  <FaSearch size={18} />
                </span>
                <input
                  type="text"
                  placeholder="What are you looking for?"
                  className="bg-transparent outline-none w-full text-[15px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Product Grid */}
            <div className="flex-1 overflow-y-auto px-7 pb-4 custom-scrollbar">
              <h3 className="font-semibold text-[20px] mb-4 mt-5 text-zinc-700">
                {searchQuery !== ""
                  ? `Search Results for "${searchQuery}"`
                  : selectedCategory === "All"
                  ? "Featured items"
                  : selectedCategory}
              </h3>

              {(() => {
                const filteredProducts = productsList.filter((product) => {
                  const catString = Array.isArray(product.category)
                    ? product.category.join(" ").toLowerCase()
                    : (product.category || "").toLowerCase();

                  const matchesCategory =
                    selectedCategory === "All" ||
                    catString.includes(selectedCategory.toLowerCase());

                  const matchesSearch = (product.name || "")
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase());

                  return matchesCategory && matchesSearch;
                });

                if (loadingProducts) {
                  return (
                    <div className="flex justify-center items-center mt-20 opacity-70">
                      <div className="w-10 h-10 border-4 border-zinc-400 border-t-black rounded-full animate-spin"></div>
                    </div>
                  );
                }

                // (Empty State)
                if (filteredProducts.length === 0) {
                  return (
                    <div className="flex flex-col items-center justify-center mt-20 opacity-70 animate-pulse">
                      <FaSearch size={40} className="mb-5 text-zinc-400" />
                      <p className="text-zinc-600 font-semibold text-[17px]">
                        No products found
                      </p>
                      <p className="text-zinc-600 text-[14px] mt-1 text-center">
                        Try checking your spelling or <br /> selecting a
                        different category.
                      </p>
                    </div>
                  );
                }

                return (
                  <>
                    {/* Animation (Card Pop-in)  */}
                    <style>
                      {`
                        @keyframes cardPopIn {
                          0% { opacity: 0; transform: translateY(20px) scale(0.96); }
                          100% { opacity: 1; transform: translateY(0) scale(1); }
                        }
                        .animate-card-pop {
                          animation: cardPopIn 0.5s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }

                        /* Notification Slide Animation */
                       @keyframes slideInFromRight {
                          0% { transform: translateX(150%); opacity: 0; }
                          100% { transform: translateX(0); opacity: 1; }
                        }
                        @keyframes slideOutToRight {
                          0% { transform: translateX(0); opacity: 1; }
                          100% { transform: translateX(150%); opacity: 0; }
                        }
                        
                        .toast-enter {
                          animation: slideInFromRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                        .toast-exit {
                          animation: slideOutToRight 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
                        }
                      `}
                    </style>

                    <div
                      key={selectedCategory + searchQuery}
                      className="grid grid-cols-3 gap-4"
                    >
                      {filteredProducts.map((product, index) => (
                        <div
                          key={product.id}
                          className="cursor-pointer group flex flex-col h-full opacity-0 animate-card-pop"
                          style={{ animationDelay: `${index * 0.07}s` }}
                          onClick={() => {
                            console.log("Product selected:", product.name);
                          }}
                        >
                          <div className="bg-[#f5f5f5] aspect-square rounded-md mb-4 flex items-center justify-center overflow-hidden relative">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="object-contain  mix-blend-multiply transition-transform duration-300 rounded-md"
                            />
                            {/* Hover Animation Overlay */}
                            <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                              <div
                                className="w-[45px] h-[45px] bg-[#333333]/95 rounded-full flex items-center justify-center text-white shadow-md scale-95 group-hover:scale-100 transition-all duration-300 cursor-pointer hover:scale-105"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // Add to room Logic eka
                                  const randomX = (Math.random() - 0.5) * 80;
                                  const randomZ = (Math.random() - 0.5) * 80;
                                  updateFurnitureState((prev) => [
                                    ...prev,
                                    {
                                      id: Date.now(),
                                      productId: product.id,
                                      name: product.name,
                                      description: product.description,
                                      price: product.price,
                                      image: product.image,
                                      model: product.model,
                                      scale: product.scale || 400,
                                      marginX: product.marginX || 50,
                                      marginZ: product.marginZ || 50,
                                      position: [randomX, 0, randomZ],
                                      rotation: product.defaultRotation || 0,
                                    },
                                  ]);
                                  addToCart(
                                    {
                                      id: product.id,
                                      name: product.name,
                                      price: product.price,
                                      img: product.image,
                                    },
                                    1,
                                    "Standard Wood",
                                    "Default",
                                    false,
                                    false
                                  );
                                  toast.custom(
                                    (t) => (
                                      <div
                                        className={`${
                                          t.visible
                                            ? "toast-enter"
                                            : "toast-exit"
                                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                                      >
                                        <CheckmarkIcon
                                          size={20}
                                          className="text-green-400"
                                        />
                                        <span className="text-[14px] font-medium">
                                          {product.name} Added to Room!
                                        </span>
                                      </div>
                                    ),
                                    { position: "top-right", duration: 2000 }
                                  );
                                }}
                              >
                                <span className="text-4xl font-light leading-none mb-1">
                                  +
                                </span>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const randomX = (Math.random() - 0.5) * 80;
                                  const randomZ = (Math.random() - 0.5) * 80;
                                  updateFurnitureState((prev) => [
                                    ...prev,
                                    {
                                      id: Date.now(),
                                      productId: product.id,
                                      name: product.name,
                                      description: product.description,
                                      price: product.price,
                                      image: product.image,
                                      model: product.model,
                                      scale: product.scale || 400,
                                      marginX: product.marginX || 50,
                                      marginZ: product.marginZ || 50,
                                      position: [randomX, 0, randomZ],
                                      rotation: product.defaultRotation || 0,
                                    },
                                  ]);
                                  addToCart(
                                    {
                                      id: product.id,
                                      name: product.name,
                                      price: product.price,
                                      img: product.image,
                                    },
                                    1,
                                    "Standard Wood",
                                    "Default",
                                    false,
                                    false
                                  );
                                  toast.custom(
                                    (t) => (
                                      <div
                                        className={`${
                                          t.visible
                                            ? "toast-enter"
                                            : "toast-exit"
                                        } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                                      >
                                        <CheckmarkIcon
                                          size={20}
                                          className="text-green-400"
                                        />
                                        <span className="text-[14px] font-medium">
                                          {product.name} Added to Room!
                                        </span>
                                      </div>
                                    ),
                                    { position: "top-right", duration: 2000 }
                                  );
                                }}
                                className="absolute bottom-3 bg-[#333333] text-white text-[10px] font-bold px-2 py-2 rounded-xl w-[60%] shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300 hover:scale-[1.02]"
                              >
                                Add to room
                              </button>
                            </div>
                          </div>

                          {/* Text Details */}
                          <div className="flex flex-col flex-1">
                            <h4 className="font-semibold text-[15px] text-gray-800 leading-tight truncate">
                              {product.name}
                            </h4>
                            <p className="text-[12px] text-gray-500 leading-tight mb-3 truncate">
                              {product.description}
                            </p>
                            <span className="font-bold text-[16px] mt-auto mb-4">
                              {product.price}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                );
              })()}
            </div>
          </>
        )}

        {/* "List" Tab Content */}
        {activeTab === "list" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white">
            {furniture.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center px-10">
                <div className="w-52 h-52 mb-6 opacity-70">
                  <img
                    src="/pictures/list_empty.avif"
                    alt="Empty List"
                    className="object-contain w-full h-full mix-blend-multiply"
                  />
                </div>
                <button
                  onClick={() => setActiveTab("add")}
                  className="border-2 border-black rounded-full px-6 py-3 font-bold text-[15px] hover:bg-black hover:text-white flex items-center gap-2 mb-3 transition-colors"
                >
                  <span className="text-[20px] leading-none mb-0.5">+</span> Add
                  items to get started
                </button>
                <p className="text-gray-500 text-[15px] leading-snug">
                  Add items then you’ll be able to edit them here
                </p>
              </div>
            ) : (
              // Filled State
              <div className="flex flex-col pt-3">
                {furniture.map((item) => (
                  <div
                    key={item.id}
                    className="flex px-6 py-5 border-b-2 border-zinc-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Left: Product Image */}
                    <div className="w-32 h-32 flex items-center justify-center mr-5 shrink-0 bg-[#f5f5f5] rounded-md overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="object-contain mix-blend-multiply group-hover:scale-105"
                      />
                    </div>

                    {/* Middle: Details */}
                    <div className="flex-1 flex flex-col justify-start mt-5 ml-3">
                      <h4 className="font-extrabold text-[16px] uppercase text-gray-900 tracking-wide">
                        {item.name}
                      </h4>
                      <p className="text-[13px] text-gray-500 font-light mb-3">
                        {item.description}
                      </p>
                      <span className="font-bold text-[20px] text-gray-900 mb-3">
                        {item.price}
                      </span>
                      <div></div>
                    </div>

                    {/* Right: Actions */}
                    <div className="flex flex-col justify-between items-end pb-1 pt-1 ml-2">
                      <button
                        onClick={() => {
                          const cartItem = cartItems.find(
                            (c) => c.id === item.productId
                          );
                          if (cartItem && cartItem.quantity > 1) {
                            updateQuantity(
                              item.productId,
                              "Standard Wood",
                              "Default",
                              cartItem.quantity - 1,
                              false
                            );
                          } else {
                            removeFromCart(
                              item.productId,
                              "Standard Wood",
                              "Default",
                              false
                            );
                          }
                          updateFurnitureState((prev) =>
                            prev.filter((i) => i.id !== item.id)
                          );
                          if (selectedFurnId === item.id)
                            setSelectedFurnId(null);

                          toast.custom(
                            (t) => (
                              <div
                                className={`${
                                  t.visible ? "toast-enter" : "toast-exit"
                                } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                              >
                                <CheckmarkIcon
                                  size={20}
                                  className="text-green-400"
                                />
                                <span className="text-[14px] font-medium">
                                  {item.name} Removed!
                                </span>
                              </div>
                            ),
                            { position: "top-right", duration: 2000 }
                          );
                        }}
                        className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-black"
                      >
                        <svg
                          className="w-[22px] h-[22px]"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.9"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          ></path>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* "Favorites" Tab Content */}
        {activeTab === "favorites" && (
          <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col bg-white shadow-md">
            {wishlistItems.length === 0 ? (
              // Empty State
              <div className="flex flex-col items-center justify-center h-full text-center px-10">
                <div className="w-60 h-60 mb-6">
                  <img
                    src="/pictures/favorite_list_empty.avif"
                    alt="Empty Favorites"
                    className="object-contain w-full h-full mix-blend-multiply"
                  />
                </div>
                <h2 className="font-bold text-[18px] text-gray-800 mb-2">
                  Favorite a product!
                </h2>
                <p className="text-gray-500 text-[15px] leading-snug">
                  Add products you’d like to try or <br /> buy to your favorites
                </p>
              </div>
            ) : (
              // Filled State
              <div className="flex flex-col pt-3">
                {wishlistItems.map((item) => {
                  const product3DData =
                    productsList.find((p) => p.name === item.name) || item;

                  return (
                    <div
                      key={item.id}
                      className="flex px-6 py-5 border-b-2 border-zinc-200 hover:bg-gray-50 transition-colors"
                    >
                      {/* Left: Product Image */}
                      <div className="w-32 h-32 flex items-center justify-center mr-5 shrink-0 bg-[#f5f5f5] rounded-md overflow-hidden">
                        <img
                          src={item.img || product3DData.image}
                          alt={item.name}
                          className="object-contain w-full h-full mix-blend-multiply group-hover:scale-105 transition-transform"
                        />
                      </div>

                      {/* Middle: Details & Button */}
                      <div className="flex-1 flex flex-col justify-start mt-1 ml-2">
                        <h4 className="font-extrabold text-[16px] uppercase text-gray-900 tracking-wide">
                          {item.name}
                        </h4>
                        <p className="text-[13px] text-gray-500 font-light mb-2">
                          {item.description || product3DData.description}
                        </p>
                        <span className="font-bold text-[20px] text-gray-900 mb-4">
                          {item.price || product3DData.price}
                        </span>
                        <div>
                          {/* Add to room button */}
                          <button
                            onClick={() => {
                              const randomX = (Math.random() - 0.5) * 80;
                              const randomZ = (Math.random() - 0.5) * 80;
                              updateFurnitureState((prev) => [
                                ...prev,
                                {
                                  id: Date.now(),
                                  productId: product3DData.id,
                                  name: product3DData.name,
                                  description: product3DData.description,
                                  price: product3DData.price,
                                  image: product3DData.image,
                                  model: product3DData.model,
                                  scale: product3DData.scale || 400,
                                  marginX: product3DData.marginX || 50,
                                  marginZ: product3DData.marginZ || 50,
                                  position: [randomX, 0, randomZ],
                                  rotation: product3DData.defaultRotation || 0,
                                },
                              ]);
                              addToCart(
                                {
                                  id: product3DData.id,
                                  name: product3DData.name,
                                  price: product3DData.price,
                                  img: product3DData.image || product3DData.img,
                                },
                                1,
                                "Standard Wood",
                                "Default",
                                false,
                                false
                              );
                              toast.custom(
                                (t) => (
                                  <div
                                    className={`${
                                      t.visible ? "toast-enter" : "toast-exit"
                                    } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                                  >
                                    <CheckmarkIcon
                                      size={20}
                                      className="text-green-400"
                                    />
                                    <span className="text-[14px] font-medium">
                                      {product3DData.name} Added to Room!
                                    </span>
                                  </div>
                                ),
                                { position: "top-right", duration: 2000 }
                              );
                            }}
                            className="border-2 border-black rounded-full px-4 py-1.5 text-[14px] font-semibold text-black hover:bg-black hover:text-white transition-colors flex items-center gap-2"
                          >
                            <span className="text-[19px] leading-none mb-0.5">
                              +
                            </span>{" "}
                            Add to room
                          </button>
                        </div>
                      </div>

                      {/* Right: Actions (Black Heart & Delete Icon) */}
                      <div className="flex flex-col justify-between items-end pb-1 pt-0 ml-2">
                        <button
                          onClick={() => removeFromWishlist(item.id)}
                          className="p-2 hover:bg-zinc-200 rounded-full transition-colors text-black"
                        >
                          <svg
                            className="w-[22px] h-[22px]"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MAIN 3D AREA */}
      <div className="flex-1 relative flex flex-col">
        {/* Top Header */}
        <div className="h-[68px] bg-white  border-b-2 border-zinc-200 shadow-md flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-full border-2 border-zinc-300 flex items-center justify-center hover:bg-yellow-300"
            >
              <FaLessThan size={15} />
            </button>
            <div className="flex items-center justify-center">
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="font-bold text-[15px] bg-transparent border-b-2 border-transparent hover:border-gray-300 focus:border-[#888] outline-none transition-colors px-1 py-0.5 w-[180px] text-gray-900"
                placeholder="Name your design"
              />
              {isAdminMode && (
                <span className="text-[13px] font-bold text-blue-600 px-1">
                  Editing for: {customerName}
                </span>
              )}
            </div>

            {/* Undo & Redo Buttons */}
            <div className="flex items-center gap-3 ml-6 border-l-2 border-zinc-300 pl-6">
              <button
                onClick={handleUndo}
                disabled={past.length === 0}
                className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center transition-colors text-black"
                title="Undo"
              >
                <IoArrowUndo size={26} />
              </button>
              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                className="w-10 h-10 rounded-full bg-zinc-100 hover:bg-yellow-300 disabled:opacity-40 disabled:hover:bg-transparent flex items-center justify-center transition-colors text-black"
                title="Redo"
              >
                <IoArrowRedo size={26} />
              </button>
            </div>
          </div>
          <div className="flex items-center gap-7">
            <span className="font-bold text-[20px]">
              ${totalPrice.toFixed(2)}
            </span>

            <div className="w-[2px] h-10 bg-zinc-300 "></div>

            {/* Save Button */}
            <button
              onClick={handleSaveDesign}
              disabled={isSavingDesign}
              className="flex items-center justify-center bg-[#333] hover:bg-white hover:text-black text-white px-6 py-2 border-2 rounded-full font-bold text-[15px] transition-colors disabled:opacity-80"
            >
              {isSavingDesign ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="animate-spin h-4 w-4 text-white bg-[#333]"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <IoSaveSharp size={18} /> Save
                </span>
              )}
            </button>

            {!isAdminMode && (
              <button
                onClick={() => setIsCartOpen(true)}
                className="flex items-center justify-center gap-2 hover:bg-[#333] hover:text-white text-gray-500 px-5 py-1.5 rounded-full border-2  font-bold text-[16px] transition-colors"
              >
                Cart <FaShoppingCart size={17} />
              </button>
            )}

            <div className="w-[2px] h-10 bg-zinc-300 "></div>

            <button
              onClick={() => setShowExitModal(true)}
              className="w-10 h-10 rounded-full border-2 border-zinc-300 flex items-center justify-center hover:bg-yellow-300"
            >
              <FaTimes size={16} />
            </button>
          </div>
        </div>

        {/* 3D Canvas Container */}
        <div className="flex-1 relative cursor-grab active:cursor-grabbing">
          <Canvas
            gl={{ preserveDrawingBuffer: true }}
            shadows
            camera={{
              position: [550, 550, 550],
              fov: 45,
              near: 5,
              far: 5000,
            }}
            onPointerMissed={() => setSelectedFurnId(null)}
          >
            <color attach="background" args={["#cccccc"]} />

            <ambientLight intensity={2.5 * roomBrightness} />
            <directionalLight
              position={[400, 1000, 400]}
              castShadow
              intensity={1 * roomBrightness}
              shadow-mapSize={[2048, 2048]}
            />
            <pointLight
              position={[0, 200, 0]}
              intensity={0.8 * roomBrightness}
              distance={2000}
              decay={2}
            />

            {/* React Suspense: 3D Model */}
            <React.Suspense fallback={null}>
              {/* Floor */}
              {centeredVertices.length > 0 && (
                <Floor3D
                  vertices={centeredVertices}
                  floorStyle={roomData.floorStyle}
                />
              )}

              {/* Walls */}
              {centeredVertices.map((v, i) => {
                const nextV =
                  centeredVertices[(i + 1) % centeredVertices.length];
                return (
                  <Wall3D
                    key={`wall-${i}`}
                    index={i}
                    v1={v}
                    v2={nextV}
                    wallColor={
                      currentWallColor === "default"
                        ? roomData.wallColor
                        : currentWallColor
                    }
                    viewMode={viewMode}
                    showRuler={showRuler}
                  />
                );
              })}

              {/* Doors & Windows */}
              {roomData.placedItems?.map((item) => {
                const v1 = centeredVertices[item.wallIndex];
                const v2 =
                  centeredVertices[
                    (item.wallIndex + 1) % centeredVertices.length
                  ];
                const angle = Math.atan2(v2[1] - v1[1], v2[0] - v1[0]);
                const midX = (v1[0] + v2[0]) / 2;
                const midZ = (v1[1] + v2[1]) / 2;

                return (
                  <group
                    key={item.id}
                    position={[midX, 220 / 2, midZ]}
                    rotation={[0, -angle, 0]}
                  >
                    <StaticPlacedItem3D
                      item={item}
                      wallHeight={220}
                      wallMidX={midX}
                      wallMidZ={midZ}
                    />
                  </group>
                );
              })}

              {furniture.map((item) => (
                <React.Suspense key={item.id} fallback={null}>
                  <DraggableFurniture
                    key={item.id}
                    item={item}
                    productsList={productsList}
                    isSelected={selectedFurnId === item.id}
                    setSelectedFurnId={setSelectedFurnId}
                    setDraggedFurnId={setDraggedFurnId}
                    draggedFurnId={draggedFurnId}
                    baseBounds={baseBounds}
                    furniture={furniture}
                    isOrbiting={isOrbiting}
                    updateFurniture={(id, newData) =>
                      updateFurnitureState((prev) =>
                        prev.map((f) =>
                          f.id === id ? { ...f, ...newData } : f
                        )
                      )
                    }
                    removeFurniture={(id) => {
                      const itemToRemove = furniture.find((f) => f.id === id);
                      if (itemToRemove) {
                        const cartItem = cartItems.find(
                          (c) => c.id === itemToRemove.productId
                        );
                        if (cartItem && cartItem.quantity > 1) {
                          updateQuantity(
                            itemToRemove.productId,
                            "Standard Wood",
                            "Default",
                            cartItem.quantity - 1,
                            false
                          );
                        } else {
                          removeFromCart(
                            itemToRemove.productId,
                            "Standard Wood",
                            "Default",
                            false
                          );
                        }
                      }
                      updateFurnitureState((prev) =>
                        prev.filter((f) => f.id !== id)
                      );
                      if (selectedFurnId === id) setSelectedFurnId(null);

                      toast.custom(
                        (t) => (
                          <div
                            className={`${
                              t.visible ? "toast-enter" : "toast-exit"
                            } bg-[#333] text-white px-4 py-3 rounded-lg shadow-xl flex items-center gap-2`}
                          >
                            <CheckmarkIcon
                              size={20}
                              className="text-green-400"
                            />
                            <span className="text-[14px] font-medium">
                              {itemToRemove.name} Removed!
                            </span>
                          </div>
                        ),
                        { position: "top-right", duration: 2000 }
                      );
                    }}
                  />
                </React.Suspense>
              ))}
            </React.Suspense>

            <CameraController
              viewMode={viewMode}
              activeSideView={activeSideView}
              isDragging={draggedFurnId !== null}
              setIsOrbiting={setIsOrbiting}
              controlsRef={controlsRef}
              zoomCommand={zoomCommand}
              setZoomCommand={setZoomCommand}
            />
          </Canvas>

          {/* Zoom In/Out Buttons */}
          <div className="absolute right-6 bottom-80 -translate-y-1/2 flex flex-col bg-[#fdfdfd] rounded-full shadow-[0px_2px_8px_rgba(0,0,0,0.1)] overflow-hidden z-10 w-11 select-none">
            {/* Zoom In (+) */}
            <button
              onClick={() => setZoomCommand(1)}
              className="h-12 flex items-center justify-center text-[24px] font-medium text-gray-700 hover:bg-gray-100 transition-colors active:bg-gray-200"
            >
              +
            </button>

            <div className="w-7 h-[2px] bg-zinc-300 mx-auto"></div>

            {/* Zoom Out (-) */}
            <button
              onClick={() => setZoomCommand(-1)}
              className="h-12 flex items-center justify-center text-[30px] font-medium leading-none text-gray-700 hover:bg-gray-100 transition-colors active:bg-gray-200 pb-1.5"
            >
              -
            </button>
          </div>

          {/* Shading Menu */}
          <div className="absolute bottom-6 right-3 z-[100] bg-white/50 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border border-zinc-200 w-[210px]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[14px] font-bold text-gray-800">
                Room Shading
              </span>
              <span className="text-[13px] font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded-md">
                {Math.round(roomBrightness * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.1"
              max="1.5"
              step="0.05"
              value={roomBrightness}
              onChange={(e) => setRoomBrightness(parseFloat(e.target.value))}
              className="w-full cursor-pointer accent-purple-500"
            />
            <p className="text-[11px] text-gray-500 mt-2 leading-tight">
              Adjust the overall lighting and shading of the entire room.
            </p>
          </div>
        </div>

        {/* Bottom View Controls (Dollhouse / Top View / Side View) */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3">
          {/* Side Views Menu */}
          {isSideMenuOpen && (
            <div className="bg-white rounded-2xl shadow-xl p-2 flex gap-2 animate-fade-up border border-zinc-200">
              {["front", "right", "back", "left"].map((side) => (
                <button
                  key={side}
                  onClick={() => setActiveSideView(side)}
                  className={`px-5 py-2.5 rounded-xl text-[14px] font-bold capitalize transition-all ${
                    activeSideView === side
                      ? "bg-zinc-200 text-black ring-2 ring-black"
                      : "text-gray-500 hover:bg-zinc-100 hover:text-black"
                  }`}
                >
                  {side}
                </button>
              ))}
            </div>
          )}

          <div className="bg-white rounded-full shadow-md flex items-center p-2 gap-2">
            <button
              onClick={() => {
                setViewMode("dollhouse");
                setIsSideMenuOpen(false);
                setIsColorMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold transition-colors ${
                viewMode === "dollhouse"
                  ? "bg-zinc-300 text-black"
                  : "text-gray-500 hover:text-black hover:bg-zinc-200"
              }`}
            >
              <MdOutlineViewInAr size={25} />
              Dollhouse
            </button>
            <button
              onClick={() => {
                setViewMode("top");
                setIsSideMenuOpen(false);
                setIsColorMenuOpen(false);
              }}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-colors ${
                viewMode === "top"
                  ? "bg-zinc-300 text-black"
                  : "text-gray-500 hover:text-black hover:bg-zinc-200"
              }`}
            >
              <TbBoxAlignTopLeft size={25} />
              2D / Top view
            </button>
            <button
              onClick={() => {
                setIsColorMenuOpen(false);
                if (viewMode !== "side") {
                  setViewMode("side");
                  setIsSideMenuOpen(true);
                } else {
                  setIsSideMenuOpen(!isSideMenuOpen);
                }
              }}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-full text-[14px] font-bold whitespace-nowrap transition-colors ${
                viewMode === "side"
                  ? "bg-zinc-300 text-black"
                  : "text-gray-500 hover:text-black hover:bg-zinc-200"
              }`}
            >
              <MdOutlineWarehouse size={25} /> Side view
              <svg
                className="w-4 h-4 ml-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d={isSideMenuOpen ? "M5 15l7-7 7 7" : "M19 9l-7 7-7-7"}
                ></path>
              </svg>
            </button>

            <div className="w-[2px] h-8 bg-zinc-300 mx-1"></div>

            {/* Color Palette Tool */}
            <div className="relative">
              {/* Color Popup Menu */}
              {isColorMenuOpen && (
                <div className="absolute bottom-[60px] left-1/2 -translate-x-1/2 bg-white rounded-3xl shadow-xl p-3 grid grid-cols-6 gap-2 w-[250px] animate-fade-up border border-zinc-200 z-50">
                  {wallColors.map((color) => (
                    <button
                      key={color}
                      onClick={() => updateWallColorState(color)}
                      className={`relative w-7 h-7 rounded-full flex items-center justify-center overflow-hidden transition-all ${
                        currentWallColor === color
                          ? "ring-2 ring-black ring-offset-2 "
                          : " border border-zinc-300 hover:scale-110"
                      }`}
                      style={{
                        backgroundColor:
                          color === "default" ? "#ffffff" : color,
                      }}
                    >
                      {color === "default" && (
                        <div className="absolute w-full h-[1.5px] bg-red-500 rotate-45"></div>
                      )}

                      {currentWallColor === color && (
                        <MdCheck
                          className={
                            color === "default" ||
                            color === "#f9f9f9" ||
                            color === "#ffffff"
                              ? "text-black relative z-10"
                              : "text-white relative z-10"
                          }
                          size={18}
                        />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* Color Icon */}
              <button
                onClick={() => {
                  setIsColorMenuOpen(!isColorMenuOpen);
                  setIsSideMenuOpen(false);
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors mx-1 ${
                  isColorMenuOpen
                    ? "bg-zinc-200 text-black"
                    : "text-gray-500 hover:bg-zinc-100 hover:text-black"
                }`}
                title="Wall Color"
              >
                <MdOutlineColorLens size={25} />
              </button>
            </div>

            <div className="w-[2px] h-8 bg-zinc-300 mx-1"></div>

            {/* Ruler Tool  */}
            <button
              onClick={() => {
                setIsColorMenuOpen(false);
                setShowRuler(!showRuler);
              }}
              className={`w-10 h-10 rounded-full text-gray-500 hover:bg-zinc-100 hover:text-black flex items-center justify-center transition-colors mr-1 ${
                showRuler
                  ? "bg-zinc-200 text-black"
                  : "text-gray-500 hover:bg-zinc-100 hover:text-black"
              }`}
              title="Ruler"
            >
              <MdOutlineStraighten size={24} />
            </button>
          </div>
        </div>
      </div>

      {/* Exit Confirmation Modal */}
      {showExitModal && (
        <div className="fixed inset-0 bg-black/40 z-[999] flex items-center justify-center animate-fade-in backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl p-9 max-w-[500px] w-full mx-4 relative animate-fade-up">
            {/* Close Button inside Modal */}
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-3 right-3 text-gray-800 hover:text-black hover:bg-zinc-200 p-1.5 rounded-full transition-colors"
            >
              <FaTimes size={18} />
            </button>

            <h2 className="text-2xl font-bold mb-3 mt-3 text-gray-900">
              {isAdminMode
                ? "Save changes for this user?"
                : "Save this design before you leave?"}
            </h2>
            <p className="text-gray-600 mb-8 text-[15px] leading-relaxed">
              {isAdminMode
                ? "Saving this design will update the user's original room setup directly in their account."
                : "Saving this design to your account to modify it and access the product list for purchasing later."}
            </p>

            <div className="flex gap-4">
              {/* Save & Exit Button */}
              <button
                disabled={isSaving}
                onClick={() => {
                  handleSaveDesign();
                  setIsSaving(true);
                  setTimeout(() => {
                    if (isAdminMode) {
                      window.location.href =
                        "http://localhost:5174/customers/saved-rooms";
                    } else {
                      navigate("/designideas");
                    }
                  }, 3000);
                }}
                className="flex-1 bg-[#111] text-white py-3 rounded-full font-semibold hover:bg-white hover:text-black border-2  transition-colors"
              >
                {isSaving ? (
                  <div className="flex items-center justify-center w-full gap-2 animate-fade-in">
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Saving...
                  </div>
                ) : (
                  "Save & exit"
                )}
              </button>

              {/* Discard Button */}
              <button
                onClick={() => {
                  if (isAdminMode) {
                    window.location.href =
                      "http://localhost:5174/customers/saved-rooms";
                  } else {
                    navigate(-1);
                  }
                }}
                className="flex-1 bg-white text-black border-[2px] border-black py-3 rounded-full font-semibold hover:bg-black hover:text-white transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}
      {!isAdminMode && <CartDrawer onNavigate={handleCartNavigation} />}
    </div>
  );
};

export default RoomDesigner;
