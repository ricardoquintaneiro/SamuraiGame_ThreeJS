import * as THREE from "three"

const scene = new THREE.Scene()

const aspect = window.innerWidth / window.innerHeight

const camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000)
camera.position.z = 5

const geometry = new THREE.BoxGeometry(1, 1, 1)

const material = new THREE.MeshPhongMaterial({
  color: "#00abb1",
  emissive: "#006063",
  //ambient: '#006063',
  specular: "#a9fcff",
  shininess: 1.5,
})

const cube1 = new THREE.Mesh(geometry, material)
const cube2 = new THREE.Mesh(geometry, material)
cube1.position.x = -2.5
scene.add(cube1)
cube2.position.x = 2.5
scene.add(cube2)

const light = new THREE.DirectionalLight(0xffffff, 1.5)
light.position.set(0, 5, 0)
scene.add(light)

const renderer = new THREE.WebGLRenderer()
renderer.setSize(window.innerWidth, window.innerHeight)
document.body.appendChild(renderer.domElement)

// user interaction

let drag = false
let phi = 0,
  theta = 0
let old_x, old_y
let radius = 5

const mouseDown = function (e) {
  drag = true
  ;(old_x = e.pageX), (old_y = e.pageY)
  e.preventDefault()
  return false
}

const mouseUp = function (e) {
  drag = false
}

const mouseMove = function (e) {
  if (!drag) return false
  const dX = e.pageX - old_x,
    dY = e.pageY - old_y
  theta += (dX * 2 * Math.PI) / window.innerWidth
  phi += (dY * 2 * Math.PI) / window.innerHeight
  ;(old_x = e.pageX), (old_y = e.pageY)

  e.preventDefault()
}

function onDocumentKeyDown(event) {
  // Get the key code of the pressed key
  const keyCode = event.which
  console.log("tecla " + keyCode)

  // + get closer
  if (keyCode == 187) {
    radius -= 0.1
  }

  // - move away
  if (keyCode == 189) {
    radius += 0.1
  }
}

renderer.domElement.addEventListener("mousedown", mouseDown)
renderer.domElement.addEventListener("mouseup", mouseUp)
renderer.domElement.addEventListener("mousemove", mouseMove)

document.addEventListener("keydown", onDocumentKeyDown, false)

window.addEventListener("resize", function () {
  renderer.setSize(window.innerWidth, window.innerHeight)
  const aspect = window.innerWidth / window.innerHeight
  camera.aspect = aspect
  camera.updateProjectionMatrix()
})

// rendering

const render = function () {
  requestAnimationFrame(render)

  // updating camera position and orientation
  camera.position.x = radius * Math.sin(theta) * Math.cos(phi)
  camera.position.y = radius * Math.sin(phi)
  camera.position.z = radius * Math.cos(theta) * Math.cos(phi)
  camera.lookAt(new THREE.Vector3(0, 0, 0))
  camera.updateMatrix()

  renderer.render(scene, camera)
}

render()
