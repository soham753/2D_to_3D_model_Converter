import React, { useEffect, useRef, useState, useCallback } from "react";
import * as THREE from "three";
import { PLYLoader } from "three/examples/jsm/loaders/PLYLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { useUserContext } from "../context/UserContext.jsx";
import { ChromePicker } from "react-color";
import {
  FaDownload,
  FaExpand,
  FaCompress,
  FaLightbulb,
  FaRegLightbulb,
  FaCamera,
  FaRedo,
  FaCube,
} from "react-icons/fa";
import { IoMdColorPalette } from "react-icons/io";
import { MdOpacity, MdTexture, MdGridOn } from "react-icons/md";

const PLYModelViewer = () => {
  const mountRef = useRef(null);
  const { modelUrl } = useUserContext();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [modelData, setModelData] = useState(null);
  const [modelColor, setModelColor] = useState("#10171A");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [wireframe, setWireframe] = useState(false);
  const [lightsEnabled, setLightsEnabled] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [showBgColorPicker, setShowBgColorPicker] = useState(false);
  const [opacity, setOpacity] = useState(0.7);
  const [modelStats, setModelStats] = useState(null);
  const [showStats, setShowStats] = useState(false);
  const [gridVisible, setGridVisible] = useState(false);
  const [axesVisible, setAxesVisible] = useState(true);

  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const rendererRef = useRef(null);
  const controlsRef = useRef(null);
  const modelRef = useRef(null);
  const directionalLight1Ref = useRef(null);
  const directionalLight2Ref = useRef(null);
  const gridHelperRef = useRef(null);
  const axesHelperRef = useRef(null);

  const resetView = useCallback(() => {
    if (cameraRef.current && controlsRef.current && modelRef.current) {
      modelRef.current.rotation.set(0, 0, 0);
      modelRef.current.position.set(0, 0, 0);
      cameraRef.current.position.z = 2;
      controlsRef.current.reset();
    }
  }, []);

  const setView = useCallback(
    (view) => {
      if (!cameraRef.current || !modelRef.current) return;

      switch (view) {
        case "top":
          cameraRef.current.position.set(0, 5, 0);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        case "front":
          cameraRef.current.position.set(0, 0, 5);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        case "side":
          cameraRef.current.position.set(5, 0, 0);
          cameraRef.current.lookAt(0, 0, 0);
          break;
        default:
          resetView();
      }
      controlsRef.current.update();
    },
    [resetView]
  );

  const captureScreenshot = useCallback(() => {
    const renderer = rendererRef.current;
    if (!renderer || !renderer.domElement) {
      console.warn("Renderer or canvas not available.");
      return;
    }

    try {
      const canvas = renderer.domElement;
      const dataURL = canvas.toDataURL("image/png");

      const link = document.createElement("a");
      link.href = dataURL;
      link.download = "model-screenshot.png";
      document.body.appendChild(link); 
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to capture screenshot:", error);
    }
  }, []);

  const handleDownload = useCallback(() => {
    if (!modelData) return;

    const blob = new Blob([modelData], { type: "application/octet-stream" });
    const url = URL.createObjectURL(blob);
    const filename = modelUrl.split("/").pop() || "model.ply";

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [modelData, modelUrl]);

  const handleColorChange = (color) => {
    const newColor = color.hex;
    setModelColor(newColor);
    if (modelRef.current) {
      modelRef.current.material.color.set(newColor);
    }
  };

  const handleBgColorChange = (color) => {
    const newColor = color.hex;
    setBackgroundColor(newColor);
    if (sceneRef.current) {
      sceneRef.current.background = new THREE.Color(newColor);
    }
  };

  const handleOpacityChange = (e) => {
    const newOpacity = parseFloat(e.target.value);
    setOpacity(newOpacity);
    if (modelRef.current) {
      modelRef.current.material.transparent = newOpacity < 1;
      modelRef.current.material.opacity = newOpacity;
      modelRef.current.material.needsUpdate = true;
    }
  };

  const toggleWireframe = () => {
    setWireframe(!wireframe);
    if (modelRef.current) {
      modelRef.current.material.wireframe = !wireframe;
    }
  };

  const toggleLights = () => {
    setLightsEnabled(!lightsEnabled);
    if (directionalLight1Ref.current) {
      directionalLight1Ref.current.visible = !lightsEnabled;
    }
    if (directionalLight2Ref.current) {
      directionalLight2Ref.current.visible = !lightsEnabled;
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      mountRef.current?.requestFullscreen().catch((err) => {
        console.error(`Fullscreen error: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  useEffect(() => {
    if (!modelUrl) return;

    // Initialize Three.js components
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(backgroundColor);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 2;
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;
    mountRef.current?.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    const directionalLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    directionalLight1.position.set(1, 1, 1);
    directionalLight1.castShadow = true;
    scene.add(directionalLight1);
    directionalLight1Ref.current = directionalLight1;

    const directionalLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight2.position.set(-1, -1, -1);
    scene.add(directionalLight2);
    directionalLight2Ref.current = directionalLight2;

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = true;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 0.1;
    controls.maxDistance = 500;
    controlsRef.current = controls;

    // Helpers
    const gridHelper = new THREE.GridHelper(10, 10, 0x555555, 0x333333);
    gridHelper.visible = gridVisible;
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(2);
    axesHelper.visible = axesVisible;
    scene.add(axesHelper);
    axesHelperRef.current = axesHelper;

    setLoading(true);
    setError(null);

    // Load model
    fetch(modelUrl)
      .then((response) => {
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        return response.arrayBuffer();
      })
      .then((data) => {
        setModelData(data);

        const loader = new PLYLoader();
        loader.load(
          modelUrl,
          (geometry) => {
            const stats = {
              vertices: geometry.attributes.position.count,
              triangles: geometry.index
                ? geometry.index.count / 3
                : geometry.attributes.position.count / 3,
              boundingBox: new THREE.Box3().setFromBufferAttribute(
                geometry.attributes.position
              ),
            };
            setModelStats(stats);

            if (!geometry.attributes.normal) {
              geometry.computeVertexNormals();
            }

            const hasColors = geometry.hasAttribute("color");

            const material = new THREE.MeshStandardMaterial({
              color: new THREE.Color(modelColor),
              flatShading: true,
              vertexColors: hasColors,
              wireframe: wireframe,
              side: THREE.DoubleSide,
              metalness: 0.2,
              roughness: 0.7,
              transparent: opacity < 1,
              opacity: opacity,
            });

            const model = new THREE.Mesh(geometry, material);
            modelRef.current = model;

            model.rotation.set(0, 0, 0);
            model.position.set(0, 0, 0);
            scene.add(model);

            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3()).length();
            const center = box.getCenter(new THREE.Vector3());

            model.position.x += model.position.x - center.x;
            model.position.y += model.position.y - center.y;
            model.position.z += model.position.z - center.z;

            camera.position.z = size * 1.5;
            controls.update();

            setLoading(false);
          },
          (xhr) => {
            console.log(
              `${((xhr.loaded / xhr.total) * 100).toFixed(2)}% loaded`
            );
          },
          (error) => {
            console.error("Error loading model:", error);
            setError(`Loading error: ${error.message}`);
            setLoading(false);
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching model:", error);
        setError(`Fetch error: ${error.message}`);
        setLoading(false);
      });

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener("resize", handleResize);
    document.addEventListener("fullscreenchange", () => {
      setIsFullscreen(document.fullscreenElement !== null);
    });

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("fullscreenchange", () => {
        setIsFullscreen(document.fullscreenElement !== null);
      });
      mountRef.current?.removeChild(renderer.domElement);
      controls.dispose();
      renderer.dispose();

      if (modelRef.current) {
        scene.remove(modelRef.current);
        modelRef.current.geometry?.dispose();
        modelRef.current.material?.dispose();
      }
    };
  }, [
    modelUrl,
    modelColor,
    wireframe,
    backgroundColor,
    opacity,
    gridVisible,
    axesVisible,
  ]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <div ref={mountRef} style={{ width: "100%", height: "100%" }} />

      {/* Control Panel */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          zIndex: 100,
          transition: "all 0.3s ease",
          transform: showControls ? "translateX(0)" : "translateX(-120px)",
        }}
      >
        {/* Controls Toggle */}
        <button
          onClick={toggleControls}
          style={{
            position: "absolute",
            left: showControls ? "calc(100% + 10px)" : "calc(100% - 40px)",
            top: "0",
            width: "40px",
            height: "40px",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            border: "none",
            borderRadius: "50%",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "16px",
            zIndex: 101,
          }}
        >
          {showControls ? "◀" : "▶"}
        </button>

        {/* Main Controls */}
        <div
          style={{
            background: "rgba(0,0,0,0.7)",
            borderRadius: "8px",
            padding: "15px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            backdropFilter: "blur(5px)",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {loading && (
            <div
              style={{ color: "white", padding: "10px", textAlign: "center" }}
            >
              Loading model...
            </div>
          )}

          {error && (
            <div
              style={{
                color: "white",
                background: "rgba(255,50,50,0.7)",
                padding: "10px",
                borderRadius: "5px",
              }}
            >
              Error: {error}
            </div>
          )}

          {modelData && (
            <>
              {/* Action Buttons */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={handleDownload}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #4CAF50, #45a049)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                  title="Download model"
                >
                  <FaDownload /> Download
                </button>

                <button
                  onClick={captureScreenshot}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #9C27B0, #673AB7)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Take screenshot"
                >
                  <FaCamera />
                </button>

                <button
                  onClick={resetView}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #FF9800, #F44336)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  title="Reset view"
                >
                  <FaRedo />
                </button>
              </div>

              {/* Color and Display Controls */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #6a11cb, #2575fc)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Model color"
                >
                  <IoMdColorPalette />
                </button>

                <button
                  onClick={() => setShowBgColorPicker(!showBgColorPicker)}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #00b09b, #96c93d)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Background color"
                >
                  <MdTexture />
                </button>

                <button
                  onClick={toggleWireframe}
                  style={{
                    padding: "10px",
                    background: wireframe
                      ? "linear-gradient(145deg, #ff416c, #ff4b2b)"
                      : "linear-gradient(145deg, #4b6cb7, #182848)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Wireframe mode"
                >
                  {wireframe ? "Solid" : "Wire"}
                </button>
              </div>

              {/* View Controls */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={toggleLights}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #f5af19, #f12711)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Toggle lights"
                >
                  {lightsEnabled ? <FaLightbulb /> : <FaRegLightbulb />}
                </button>

                <button
                  onClick={() => setGridVisible(!gridVisible)}
                  style={{
                    padding: "10px",
                    background: gridVisible
                      ? "linear-gradient(145deg, #8E2DE2, #4A00E0)"
                      : "linear-gradient(145deg, #3a7bd5, #00d2ff)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Toggle grid"
                >
                  <MdGridOn />
                </button>

                <button
                  onClick={() => setAxesVisible(!axesVisible)}
                  style={{
                    padding: "10px",
                    background: axesVisible
                      ? "linear-gradient(145deg, #FF512F, #DD2476)"
                      : "linear-gradient(145deg, #1A2980, #26D0CE)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Toggle axes"
                >
                  <FaCube />
                </button>
              </div>

              {/* Preset Views */}
              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  onClick={() => setView("top")}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #1D976C, #93F9B9)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Top view"
                >
                  Top
                </button>

                <button
                  onClick={() => setView("front")}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #FF5F6D, #FFC371)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Front view"
                >
                  Front
                </button>

                <button
                  onClick={() => setView("side")}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #4776E6, #8E54E9)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                  title="Side view"
                >
                  Side
                </button>
              </div>

              {/* Opacity Slider */}
              <div style={{ color: "white", marginTop: "10px" }}>
                <label
                  style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                  <MdOpacity />
                  Opacity:
                  <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.1"
                    value={opacity}
                    onChange={handleOpacityChange}
                    style={{ flex: 1 }}
                  />
                  <span>{opacity.toFixed(1)}</span>
                </label>
              </div>

              {/* Stats and Fullscreen */}
              <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                <button
                  onClick={() => setShowStats(!showStats)}
                  style={{
                    padding: "10px",
                    background:
                      "linear-gradient(145deg, #0F2027, #203A43, #2C5364)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                  }}
                >
                  {showStats ? "Hide Stats" : "Show Stats"}
                </button>

                <button
                  onClick={toggleFullscreen}
                  style={{
                    padding: "10px",
                    background: "linear-gradient(145deg, #11998e, #38ef7d)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer",
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                  }}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                  {isFullscreen ? "Exit" : "Fullscreen"}
                </button>
              </div>

              {/* Model Statistics */}
              {showStats && modelStats && (
                <div
                  style={{
                    background: "rgba(30,30,30,0.7)",
                    padding: "10px",
                    borderRadius: "5px",
                    color: "white",
                    marginTop: "10px",
                    fontSize: "14px",
                  }}
                >
                  <div>
                    <strong>Vertices:</strong>{" "}
                    {modelStats.vertices.toLocaleString()}
                  </div>
                  <div>
                    <strong>Triangles:</strong>{" "}
                    {modelStats.triangles.toLocaleString()}
                  </div>
                  <div>
                    <strong>Bounding Box:</strong>
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    X: {modelStats.boundingBox.max.x.toFixed(2)} to{" "}
                    {modelStats.boundingBox.min.x.toFixed(2)}
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    Y: {modelStats.boundingBox.max.y.toFixed(2)} to{" "}
                    {modelStats.boundingBox.min.y.toFixed(2)}
                  </div>
                  <div style={{ marginLeft: "10px" }}>
                    Z: {modelStats.boundingBox.max.z.toFixed(2)} to{" "}
                    {modelStats.boundingBox.min.z.toFixed(2)}
                  </div>
                </div>
              )}

              {/* Color Pickers */}
              {showColorPicker && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    marginLeft: "10px",
                    zIndex: 200,
                  }}
                >
                  <ChromePicker
                    color={modelColor}
                    onChange={handleColorChange}
                    disableAlpha={true}
                  />
                </div>
              )}

              {showBgColorPicker && (
                <div
                  style={{
                    position: "absolute",
                    left: "100%",
                    marginLeft: "10px",
                    zIndex: 200,
                  }}
                >
                  <ChromePicker
                    color={backgroundColor}
                    onChange={handleBgColorChange}
                    disableAlpha={true}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PLYModelViewer;
