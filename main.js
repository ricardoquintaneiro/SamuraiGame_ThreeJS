import * as THREE from "three"

import { OrbitControls } from "three/addons/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/Addons.js"

const groundTextureUrl = new URL("public/ground.jpg", import.meta.url)
const samuraiUrl = new URL("public/samurai.glb", import.meta.url)

const loader = new GLTFLoader()

// To store the scene graph, and elements usefull to rendering the scene
const sceneElements = {
  sceneGraph: null,
  camera: null,
  control: null, // NEW
  renderer: null,
}

let mixer

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
    camera.position.set(0, 20, 15)
    camera.lookAt(0, 0, 0)

    // ************************** //
    // Illumination
    // ************************** //

    // ************************** //
    // Add ambient light
    // ************************** //
    const ambientLight = new THREE.AmbientLight("rgb(255, 255, 255)", 0.3)
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
    light_1.name = "light 1"

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
    sceneElements.control.screenSpacePanning = true
  },

  render: function (sceneElements) {
    sceneElements.renderer.render(
      sceneElements.sceneGraph,
      sceneElements.camera
    )
  },
}

// FUCNTIONS FOR BUILDING THE SCENE

let model
let clips

const scene = {
  // Create and insert in the scene graph the models of the 3D scene

  load3DObjects: function (sceneGraph) {
    loader.load(
      samuraiUrl.href,
      function (gltf) {
        model = gltf.scene
        model.name = "Samurai"
        model.traverse((o) => {
          if (o.isMesh) {
            o.castShadow = true
            o.receiveShadow = true
          }
        })
        sceneGraph.add(model)
        mixer = new THREE.AnimationMixer(model)
        clips = gltf.animations
        const clip = THREE.AnimationClip.findByName(clips, "Run")
        const action = mixer.clipAction(clip)
        action.play()
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
    // plane.scale.set(20, 20, 20)
    plane.rotateOnWorldAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2)
    sceneGraph.add(plane)
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

function computeFrame(time) {
  // Can extract an object from the scene Graph from its name
  // const light_1 = sceneElements.sceneGraph.getObjectByName("light 1");

  // // Apply a small displacement
  // if (light_1.position.x >= 30) {
  //     delta *= -1;
  // } else if (light_1.position.x <= -30) {
  //     delta *= -1;
  // }
  // light_1.translateX(delta);

  // Rotating the first cube

  // const samurai_v1 = sceneElements.sceneGraph.getObjectByName("Samurai_v1");

  // samurai_v1.rotateX(0.01);
  // samurai_v1.rotateY(0.01);
  // samurai_v1.rotateZ(0.01);

  // Rendering
  if (mixer) {
    mixer.update(clock.getDelta())
  }
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

  // Comment when doing animation
  // computeFrame(sceneElements);
}

let clip
let action

function directionOffset(keysPressed) {
  let directionOffset = 0

  if (keysPressed[0]) {
    if (keysPressed[1]) {
      directionOffset = Math.PI / 4
    } else if (keysPressed[3]) {
      directionOffset = -Math.PI / 4
    }
  } else if (keysPressed[2]) {
    if (keysPressed[1]) {
      directionOffset = Math.PI / 4 + Math.PI / 2
    } else if (keysPressed[3]) {
      directionOffset = -Math.PI / 4 - Math.PI / 2
    } else {
      directionOffset = Math.PI
    }
  } else if (keysPressed[1]) {
    directionOffset = Math.PI / 2
  } else if (keysPressed[3]) {
    directionOffset = -Math.PI / 2
  }

  return directionOffset
}

function onDocumentKeyDown(event) {
  var angleYCameraDirection = Math.atan2(
    sceneElements.camera.position.x - model.position.x,
    sceneElements.camera.position.z - model.position.z
  )
  switch (event.keyCode) {
    case 68: //d
      keyD = true
      var offset = directionOffset([keyW, keyA, keyS, keyD])
      rotateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + offset
      )
      model.quaternion.rotateTowards(rotateQuaternion, 0.2)
      clip = THREE.AnimationClip.findByName(clips, "Run")
      action = mixer.clipAction(clip)
      action.play()
      sceneElements.camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, offset)
      var moveX = walkDirection.x * runVelocity * delta
      var moveZ = walkDirection.z * runVelocity * delta
      model.position.x += moveX
      model.position.z += moveZ
      sceneElements.camera.position.x += moveX
      sceneElements.camera.position.z += moveZ
      cameraTarget.x = model.position.x
      cameraTarget.y = model.position.y + 1 
      cameraTarget.z = model.position.z
      sceneElements.control.target = cameraTarget
      break
    case 83: //s
      keyS = true
      var offset = directionOffset([keyW, keyA, keyS, keyD])
      rotateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + offset
      )
      model.quaternion.rotateTowards(rotateQuaternion, 0.2)
      clip = THREE.AnimationClip.findByName(clips, "Run")
      action = mixer.clipAction(clip)
      action.play()
      sceneElements.camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, offset)
      var moveX = walkDirection.x * runVelocity * delta
      var moveZ = walkDirection.z * runVelocity * delta
      model.position.x += moveX
      model.position.z += moveZ
      sceneElements.camera.position.x += moveX
      sceneElements.camera.position.z += moveZ
      cameraTarget.x = model.position.x
      cameraTarget.y = model.position.y + 1 
      cameraTarget.z = model.position.z
      sceneElements.control.target = cameraTarget
      break
    case 65: //a
      keyA = true
      var offset = directionOffset([keyW, keyA, keyS, keyD])
      rotateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + offset
      )
      model.quaternion.rotateTowards(rotateQuaternion, 0.2)
      clip = THREE.AnimationClip.findByName(clips, "Run")
      action = mixer.clipAction(clip)
      action.play()
      sceneElements.camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, offset)
      var moveX = walkDirection.x * runVelocity * delta
      var moveZ = walkDirection.z * runVelocity * delta
      model.position.x += moveX
      model.position.z += moveZ
      sceneElements.camera.position.x += moveX
      sceneElements.camera.position.z += moveZ
      cameraTarget.x = model.position.x
      cameraTarget.y = model.position.y + 1 
      cameraTarget.z = model.position.z
      sceneElements.control.target = cameraTarget
      break
    case 87: //w
      keyW = true
      var offset = directionOffset([keyW, keyA, keyS, keyD])
      rotateQuaternion.setFromAxisAngle(
        rotateAngle,
        angleYCameraDirection + offset
      )
      model.quaternion.rotateTowards(rotateQuaternion, 0.2)
      clip = THREE.AnimationClip.findByName(clips, "Run")
      action = mixer.clipAction(clip)
      action.play()
      sceneElements.camera.getWorldDirection(walkDirection)
      walkDirection.y = 0
      walkDirection.normalize()
      walkDirection.applyAxisAngle(rotateAngle, offset)
      var moveX = walkDirection.x * runVelocity * delta
      var moveZ = walkDirection.z * runVelocity * delta
      model.position.x += moveX
      model.position.z += moveZ
      sceneElements.camera.position.x += moveX
      sceneElements.camera.position.z += moveZ
      cameraTarget.x = model.position.x
      cameraTarget.y = model.position.y + 1 
      cameraTarget.z = model.position.z
      sceneElements.control.target = cameraTarget
      break
    // case 32: //space attack
    //   break
    // // q
    // case 81:
    //   // rotate camera around the samurai model to the right
    //   sceneElements.camera.position.x = 15 * Math.cos(sceneElements.camera.rotation.y)
    //   break
    // // e
    // case 69:
    //   // rotate camera left
    //   sceneElements.camera.rotation.y -= 0.1
    //   break
  }
}

function onDocumentKeyUp(event) {
  switch (event.keyCode) {
    case 68: //d
      keyD = false
      break
    case 83: //s
      keyS = false
      break
    case 65: //a
      keyA = false
      break
    case 87: //w
      keyW = false
      break
  }
}

// STARTING

init()
