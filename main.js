import * as THREE from "three";

import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/Addons.js";

const loader = new GLTFLoader();

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
  sceneGraph: null,
  camera: null,
  control: null, // NEW
  renderer: null,
};

// HELPER FUNCTIONS

const helper = {
  initEmptyScene: function (sceneElements) {
    // ************************** //
    // Create the 3D scene
    // ************************** //
    sceneElements.sceneGraph = new THREE.Scene();

    // ************************** //
    // Add camera
    // ************************** //
    const width = window.innerWidth;
    const height = window.innerHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500);
    sceneElements.camera = camera;
    camera.position.set(0, 7.5, 15);
    camera.lookAt(0, 0, 0);

    // ************************** //
    // Illumination
    // ************************** //

    // ************************** //
    // Add ambient light
    // ************************** //
    const ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.3);
    sceneElements.sceneGraph.add(ambientLight);

    // ***************************** //
    // Add point light souce (with shadows)
    // ***************************** //
    const light_1 = new THREE.PointLight("rgb(255, 255, 255)", 500);
    light_1.decay = 1;
    light_1.position.set(0, 5, 10);
    sceneElements.sceneGraph.add(light_1);

    // Setup shadow properties for the spotlight
    light_1.castShadow = true;
    light_1.shadow.mapSize.width = 2048;
    light_1.shadow.mapSize.height = 2048;

    // Give a name to the spot light
    light_1.name = "light 1";

    // *********************************** //
    // Create renderer (with shadow map)
    // *********************************** //
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    sceneElements.renderer = renderer;
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor("rgb(255, 255, 150)", 1.0);
    renderer.setSize(width, height);

    // Setup shadowMap property
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // **************************************** //
    // Add the rendered image in the HTML DOM
    // **************************************** //
    const htmlElement = document.querySelector("#Tag3DScene");
    htmlElement.appendChild(renderer.domElement);

    // ************************** //
    // NEW --- Control for the camera
    // ************************** //
    sceneElements.control = new OrbitControls(camera, renderer.domElement);
    sceneElements.control.screenSpacePanning = true;
  },

  render: function (sceneElements) {
    sceneElements.renderer.render(
      sceneElements.sceneGraph,
      sceneElements.camera
    );
  },
};

// FUCNTIONS FOR BUILDING THE SCENE

const scene = {
  
  // Create and insert in the scene graph the models of the 3D scene

  createSamurai_V1: function () {
    loader.load( 'public/samurai/scene.gltf', function ( gltf ) {

            scene.add( gltf.scene );

        }, undefined, function ( error ) {

            console.error( error );

        }
    );
  },


  load3DObjects: function (sceneGraph) {
    // NEW
    // Create simple mesh models

    // const cube_1 = scene.createCubeMesh_V1();
    // cube_1.name = "Cube_1";
    // sceneGraph.add(cube_1);
    // cube_1.translateX(-6).translateY(3);

  },
};

// ANIMATION

// Displacement values
var delta = 0.5;

//To keep track of the keyboard - WASD
var keyD = false,
  keyA = false,
  keyS = false,
  keyW = false;

function computeFrame(time) {
  // Can extract an object from the scene Graph from its name
  const light_1 = sceneElements.sceneGraph.getObjectByName("light 1");

  // Apply a small displacement
  if (light_1.position.x >= 30) {
    delta *= -1;
  } else if (light_1.position.x <= -30) {
    delta *= -1;
  }
  light_1.translateX(delta);

  // Rotating the first cube

  const cube_1 = sceneElements.sceneGraph.getObjectByName("Cube_1");

  cube_1.rotateX(0.01);
  cube_1.rotateY(0.01);
  cube_1.rotateZ(0.01);

  // Rotating the second cube

  const cube_2 = sceneElements.sceneGraph.getObjectByName("Cube_2");

  cube_2.rotateX(0.01);
  cube_2.rotateY(0.01);
  cube_2.rotateZ(0.01);

  // Rotating the third cube

  const cube_3 = sceneElements.sceneGraph.getObjectByName("Cube_3");

  cube_3.rotateX(0.01);
  cube_3.rotateY(0.01);
  cube_3.rotateZ(0.01);

  const cube_4 = sceneElements.sceneGraph.getObjectByName("Cube_4");

  cube_4.rotateX(0.01);
  cube_4.rotateY(0.01);
  cube_4.rotateZ(0.01);

  const cube_5 = sceneElements.sceneGraph.getObjectByName("Cube_5");

  cube_5.rotateX(0.01);
  cube_5.rotateY(0.01);
  cube_5.rotateZ(0.01);

  const cube_6 = sceneElements.sceneGraph.getObjectByName("Cube_6");

  cube_6.rotateX(0.01);
  cube_6.rotateY(0.01);
  cube_6.rotateZ(0.01);

  // Rendering
  helper.render(sceneElements);
  // Animation
  //Call for the next frame
  requestAnimationFrame(computeFrame);
}

// Call functions:
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate

function init() {
  helper.initEmptyScene(sceneElements);
  scene.load3DObjects(sceneElements.sceneGraph);
  requestAnimationFrame(computeFrame);
}

// HANDLING EVENTS

// Event Listeners

window.addEventListener("resize", resizeWindow);

document.addEventListener("keydown", onDocumentKeyDown, false);
document.addEventListener("keyup", onDocumentKeyUp, false);

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
  const width = window.innerWidth;
  const height = window.innerHeight;

  sceneElements.camera.aspect = width / height;
  sceneElements.camera.updateProjectionMatrix();

  sceneElements.renderer.setSize(width, height);

  // Comment when doing animation
  // computeFrame(sceneElements);
}

function onDocumentKeyDown(event) {
  switch (event.keyCode) {
    case 68: //d
      keyD = true;
      break;
    case 83: //s
      keyS = true;
      break;
    case 65: //a
      keyA = true;
      break;
    case 87: //w
      keyW = true;
      break;
  }
}

function onDocumentKeyUp(event) {
  switch (event.keyCode) {
    case 68: //d
      keyD = false;
      break;
    case 83: //s
      keyS = false;
      break;
    case 65: //a
      keyA = false;
      break;
    case 87: //w
      keyW = false;
      break;
  }
}

// STARTING

init();
