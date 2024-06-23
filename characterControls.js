import * as THREE from "three"

export class CharacterControls {
  model
  mixer
  animationsMap = new Map()
  orbitControl
  camera

  // state
  toggleRun = true
  currentAction

  // temp data
  walkDirection = new THREE.Vector3()
  rotateAngle = new THREE.Vector3(0, 1, 0)
  rotateQuaternion = new THREE.Quaternion()
  cameraTarget = new THREE.Vector3()

  // constants
  fadeDuration = 0.2
  runVelocity = 5
  walkVelocity = 2

  static DIRECTIONS = ["w", "a", "s", "d"]

  constructor(
    model,
    mixer,
    animationsMap,
    orbitControl,
    camera,
    currentAction
  ) {
    this.model = model
    this.mixer = mixer
    this.animationsMap = animationsMap
    this.orbitControl = orbitControl
    this.camera = camera
    this.currentAction = currentAction
    this.animationsMap.forEach((value, key) => {
      if (key == currentAction) {
        value.play()
      }
    })
    this.updateCameraTarget(0, 0)
  }

  switchRunToggle() {
    this.toggleRun = !this.toggleRun
  }

  update(delta, keysPressed) {
    const directionPressed = CharacterControls.DIRECTIONS.some(
      (key) => keysPressed[key] == true
    )

    let play = ""
    if (directionPressed) {
      play = this.toggleRun ? "yasuo_run_haste.anm" : "yasuo_run2.anm"
    } else {
      play = "yasuo_idle1.anm"
    }

    if (this.currentAction != play) {
      const toPlay = this.animationsMap.get(play)
      const current = this.animationsMap.get(this.currentAction)

      current.fadeOut(this.fadeDuration)
      toPlay.reset().fadeIn(this.fadeDuration).play()

      this.currentAction = play
    }

    this.mixer.update(delta)

    if (
      this.currentAction == "yasuo_run_haste.anm" ||
      this.currentAction == "yasuo_run2.anm"
    ) {
      let angleYCameraDirection = Math.atan2(
        this.camera.position.x - this.model.position.x,
        this.camera.position.z - this.model.position.z
      )

      let directionOffset = this.directionOffset(keysPressed)

      this.rotateQuaternion.setFromAxisAngle(
        this.rotateAngle,
        angleYCameraDirection + directionOffset
      )
      this.model.quaternion.rotateTowards(this.rotateQuaternion, 0.2)

      this.camera.getWorldDirection(this.walkDirection)
      this.walkDirection.y = 0
      this.walkDirection.normalize()
      this.walkDirection.applyAxisAngle(this.rotateAngle, directionOffset)

      const velocity =
        this.currentAction == "yasuo_run_haste.anm"
          ? this.runVelocity
          : this.walkVelocity

      const moveX = - this.walkDirection.x * velocity * delta
      const moveZ = - this.walkDirection.z * velocity * delta
      this.model.position.x += moveX
      this.model.position.z += moveZ
      this.updateCameraTarget(moveX, moveZ)
    }
  }

  updateCameraTarget(moveX, moveZ) {
    this.camera.position.x += moveX
    this.camera.position.z += moveZ

    this.cameraTarget.x = this.model.position.x
    this.cameraTarget.y = this.model.position.y + 1
    this.cameraTarget.z = this.model.position.z
    this.orbitControl.target = this.cameraTarget
  }

  directionOffset(keysPressed) {
    let directionOffset = 0 // w

    if (keysPressed["w"]) {
      if (keysPressed["a"]) {
        directionOffset = Math.PI / 4 // wa
      } else if (keysPressed["d"]) {
        directionOffset = -Math.PI / 4 // wd
      }
    } else if (keysPressed["s"]) {
      if (keysPressed["a"]) {
        directionOffset = Math.PI / 4 + Math.PI / 2 // sa
      } else if (keysPressed["d"]) {
        directionOffset = -Math.PI / 4 - Math.PI / 2 // sd
      } else {
        directionOffset = Math.PI // s
      }
    } else if (keysPressed["a"]) {
      directionOffset = Math.PI / 2 // a
    } else if (keysPressed["d"]) {
      directionOffset = -Math.PI / 2 // d
    }

    return directionOffset + Math.PI
  }
}
