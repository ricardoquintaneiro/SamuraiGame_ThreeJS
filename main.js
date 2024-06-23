import * as THREE from "three"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/Addons.js"
import { CharacterControls } from "./characterControls.js"

const groundTextureUrl = new URL("ground.jpg", import.meta.url)
const samuraiUrl = new URL("scene.gltf", import.meta.url)

const loader = new GLTFLoader()

// To store the scene graph, and elements useful to rendering the scene
const sceneElements = {
  sceneGraph: null,
  camera: null,
  control: null,
  renderer: null,
}

// HELPER FUNCTIONS

const helper = {
  initEmptyScene: function (sceneElements) {
    // ************************** //
    // Create the 3D scene
    // ************************** //
    sceneElements.sceneGraph = new THREE.Scene()

    // ************************** //
    // Add camera
    // ************************** //
    const width = window.innerWidth
    const height = window.innerHeight
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 500)
    sceneElements.camera = camera
    camera.position.set(0, 10, 10)
    camera.lookAt(0, 0, 0)

    // ************************** //
    // Illumination
    // ************************** //

    // ************************** //
    // Add ambient light
    // ************************** //
    const ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.6)
    sceneElements.sceneGraph.add(ambientLight)

    // ***************************** //
    // Add point light souce (with shadows)
    // ***************************** //
    const light_1 = new THREE.PointLight("rgb(255, 255, 255)", 200)
    light_1.decay = 1
    light_1.position.set(0, 20, 100)
    sceneElements.sceneGraph.add(light_1)

    // Setup shadow properties for the spotlight
    light_1.castShadow = true
    light_1.shadow.mapSize.width = 2048
    light_1.shadow.mapSize.height = 2048

    // Give a name to the spot light
    light_1.name = "sun"

    // *********************************** //
    // Create renderer (with shadow map)
    // *********************************** //
    const renderer = new THREE.WebGLRenderer({ antialias: true })
    sceneElements.renderer = renderer
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.setClearColor("rgb(255, 255, 255)", 1.0)
    renderer.setSize(width, height)

    // Setup shadowMap property
    renderer.shadowMap.enabled = true
    renderer.shadowMap.type = THREE.PCFSoftShadowMap

    // **************************************** //
    // Add the rendered image in the HTML DOM
    // **************************************** //
    const htmlElement = document.querySelector("#Tag3DScene")
    htmlElement.appendChild(renderer.domElement)

    // ************************** //
    // NEW --- Control for the camera
    // ************************** //
    sceneElements.control = new OrbitControls(camera, renderer.domElement)
    sceneElements.control.enableDamping = true
    sceneElements.control.minDistance = 5
    sceneElements.control.maxDistance = 15
    sceneElements.control.screenSpacePanning = true
    sceneElements.control.maxPolarAngle = Math.PI / 2 - 0.05
    sceneElements.control.update()
  },

  render: function (sceneElements) {
    sceneElements.renderer.render(
      sceneElements.sceneGraph,
      sceneElements.camera
    )
  },
}

// FUCNTIONS FOR BUILDING THE SCENE

let characterControls

const scene = {
  // Create and insert in the scene graph the models of the 3D scene

  load3DObjects: function (sceneGraph) {
    loader.load(
      samuraiUrl.href,
      function (gltf) {
        let model = gltf.scene
        model.name = "Yasuo"
        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true
            // o.receiveShadow = true
          }
        })
        sceneGraph.add(model)
        const mixer = new THREE.AnimationMixer(model)
        const animations = gltf.animations
        const animationsMap = new Map()
        animations.forEach((a) => {
          animationsMap.set(a.name, mixer.clipAction(a))
        })

        characterControls = new CharacterControls(model, mixer, animationsMap, sceneElements.control, sceneElements.camera, "yasuo_idle1.anm")
      },
      undefined,
      function (error) {
        console.error(error)
      }
    )

    // Add a plane
    const texture = new THREE.TextureLoader().load(groundTextureUrl.href)
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(25, 25)

    const planeGeometry = new THREE.PlaneGeometry(500, 500)
    const planeMaterial = new THREE.MeshLambertMaterial({
      map: texture,
      side: THREE.DoubleSide,
    })
    const plane = new THREE.Mesh(planeGeometry, planeMaterial)
    plane.receiveShadow = true
    // plane.scale.set(20, 20, 20)
    plane.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    sceneGraph.add(plane)

    const skyboxGeo = new THREE.BoxGeometry(500, 500, 500)
    const materialArray = [
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_ft.jpg"),
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_bk.jpg"),
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_up.jpg"),
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_dn.jpg"),
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_rt.jpg"),
        side: THREE.DoubleSide,
      }),
      new THREE.MeshBasicMaterial({
        map: new THREE.TextureLoader().load("skybox/level1/afterrain_lf.jpg"),
        side: THREE.DoubleSide,
      }),
    ]

    const skybox = new THREE.Mesh(skyboxGeo, materialArray)
    sceneGraph.add(skybox)
  },
}

// ANIMATION

// Displacement values
var delta = 0.05

//To keep track of the keyboard - WASD
var keyD = false,
  keyA = false,
  keyS = false,
  keyW = false,
  keySpace = false,
  keyQ = false,
  keyE = false

let walkDirection = new THREE.Vector3()
let rotateAngle = new THREE.Vector3(0, 1, 0)
let rotateQuaternion = new THREE.Quaternion()
let cameraTarget = new THREE.Vector3(0, 0, 0)

let fadeDuration = 0.2
let runVelocity = 5

const clock = new THREE.Clock()

function computeFrame() {
  // Can extract an object from the scene Graph from its name
  // const light_1 = sceneElements.sceneGraph.getObjectByName("light 1");

  // // Apply a small displacement
  // if (light_1.position.x >= 30) {
  //     delta *= -1;
  // } else if (light_1.position.x <= -30) {
  //     delta *= -1;
  // }
  // light_1.translateX(delta);

  // Rendering
  if (characterControls) {
    characterControls.update(clock.getDelta(), keysPressed)
  }
  sceneElements.control.update()
  helper.render(sceneElements)
  // Animation
  //Call for the next frame
  requestAnimationFrame(computeFrame)
}

// Call functions:
//  1. Initialize the empty scene
//  2. Add elements within the scene
//  3. Animate

function init() {
  helper.initEmptyScene(sceneElements)
  scene.load3DObjects(sceneElements.sceneGraph)
  requestAnimationFrame(computeFrame)
}

// HANDLING EVENTS

// Event Listeners

window.addEventListener("resize", resizeWindow)

document.addEventListener("keydown", onDocumentKeyDown, false)
document.addEventListener("keyup", onDocumentKeyUp, false)

// Update render image size and camera aspect when the window is resized
function resizeWindow(eventParam) {
  const width = window.innerWidth
  const height = window.innerHeight

  sceneElements.camera.aspect = width / height
  sceneElements.camera.updateProjectionMatrix()

  sceneElements.renderer.setSize(width, height)
}

const keysPressed = {}

function onDocumentKeyDown(event) {
  if (event.shiftKey && characterControls) {
    characterControls.switchRunToggle()
  } else {
    keysPressed[event.key.toLowerCase()] = true
  }
  //   case 32: //space attack
  //     keySpace = true
  //     action.stop()
  //     clip = THREE.AnimationClip.findByName(
  //       clips,
  //       "yasuo_attack1.anm"
  //     )
  //     action = mixer.clipAction(clip)
  //     action.play()
  //     break
  //   // // q
  //   // case 81:
  //   //   // rotate camera right
  //   //   sceneElements.camera.rotation.x += 0.1
  //   //   sceneElements.camera.rotation.z += 0.1
  //   //   break
  //   // // e
  //   // case 69:
  //   //   // rotate camera left
  //   //   sceneElements.camera.rotation.y -= 0.1
  //   //   break
  // }
}

function onDocumentKeyUp(event) {
  keysPressed[event.key.toLowerCase()] = false
  //   case 32: //space
  //     keySpace = false
  //     action.stop()
  //     clip = THREE.AnimationClip.findByName(clips, "yasuo_run2.anm")
  //     action = mixer.clipAction(clip)
  //     action.play()
  //     break
  //   // case 81: //q
  //   //   keyQ = false
  //   //   break
  // }
}

// STARTING

init()
