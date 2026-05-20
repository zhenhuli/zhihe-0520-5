import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useSkeletonStore = defineStore('skeleton', () => {
  const joints = ref([])
  const bones = ref([])
  const animations = ref({})
  const currentAnimation = ref(null)
  const currentFrame = ref(0)
  const isPlaying = ref(false)
  const fps = ref(30)
  const selectedJoint = ref(null)
  const selectedBone = ref(null)
  const characterImage = ref(null)
  const mode = ref('select')
  
  let jointIdCounter = 0
  let boneIdCounter = 0
  let animationIdCounter = 0

  function addJoint(x, y, name = null) {
    const joint = {
      id: ++jointIdCounter,
      name: name || `关节${jointIdCounter}`,
      x: x,
      y: y,
      rotation: 0,
      parentId: null,
      length: 0
    }
    joints.value.push(joint)
    return joint
  }

  function addBone(parentId, childId, name = null) {
    const parent = joints.value.find(j => j.id === parentId)
    const child = joints.value.find(j => j.id === childId)
    if (!parent || !child) return null
    
    const dx = child.x - parent.x
    const dy = child.y - parent.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    
    child.parentId = parentId
    child.length = length
    child.rotation = angle
    
    const bone = {
      id: ++boneIdCounter,
      name: name || `骨骼${boneIdCounter}`,
      parentId,
      childId,
      length,
      weight: 1
    }
    bones.value.push(bone)
    return bone
  }

  function removeJoint(id) {
    const index = joints.value.findIndex(j => j.id === id)
    if (index === -1) return
    
    bones.value = bones.value.filter(b => b.parentId !== id && b.childId !== id)
    
    const children = joints.value.filter(j => j.parentId === id)
    children.forEach(child => {
      child.parentId = null
    })
    
    joints.value.splice(index, 1)
    
    if (selectedJoint.value === id) {
      selectedJoint.value = null
    }
  }

  function removeBone(id) {
    const bone = bones.value.find(b => b.id === id)
    if (!bone) return
    
    const child = joints.value.find(j => j.id === bone.childId)
    if (child) {
      child.parentId = null
    }
    
    bones.value = bones.value.filter(b => b.id !== id)
    
    if (selectedBone.value === id) {
      selectedBone.value = null
    }
  }

  function updateJointPosition(id, x, y) {
    const joint = joints.value.find(j => j.id === id)
    if (!joint) return
    
    const oldX = joint.x
    const oldY = joint.y
    joint.x = x
    joint.y = y
    
    if (joint.parentId) {
      const parent = joints.value.find(j => j.id === joint.parentId)
      if (parent) {
        const dx = x - parent.x
        const dy = y - parent.y
        const angle = Math.atan2(dy, dx) * 180 / Math.PI
        joint.rotation = angle
      }
    }
    
    updateChildPositions(id, x - oldX, y - oldY)
  }

  function updateChildPositions(parentId, dx, dy) {
    const children = joints.value.filter(j => j.parentId === parentId)
    children.forEach(child => {
      child.x += dx
      child.y += dy
      updateChildPositions(child.id, dx, dy)
    })
  }

  function rotateJoint(id, angle) {
    const joint = joints.value.find(j => j.id === id)
    if (!joint || !joint.parentId) return
    
    const parent = joints.value.find(j => j.id === joint.parentId)
    if (!parent) return
    
    const rad = (angle - joint.rotation) * Math.PI / 180
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    
    joint.rotation = angle
    
    const children = joints.value.filter(j => j.parentId === id)
    children.forEach(child => {
      const relX = child.x - joint.x
      const relY = child.y - joint.y
      child.x = joint.x + relX * cos - relY * sin
      child.y = joint.y + relX * sin + relY * cos
      child.rotation += angle - joint.rotation
      rotateChildRecursive(child, rad)
    })
  }

  function rotateChildRecursive(joint, rad) {
    const cos = Math.cos(rad)
    const sin = Math.sin(rad)
    
    const children = joints.value.filter(j => j.parentId === joint.id)
    children.forEach(child => {
      const relX = child.x - joint.x
      const relY = child.y - joint.y
      child.x = joint.x + relX * cos - relY * sin
      child.y = joint.y + relX * sin + relY * cos
      child.rotation += rad * 180 / Math.PI
      rotateChildRecursive(child, rad)
    })
  }

  function setCharacterImage(imageData) {
    characterImage.value = imageData
  }

  function saveAnimation(name) {
    const frameData = joints.value.map(j => ({
      id: j.id,
      x: j.x,
      y: j.y,
      rotation: j.rotation
    }))
    
    if (!animations.value[name]) {
      animations.value[name] = {
        id: ++animationIdCounter,
        name: name,
        frames: [],
        frameCount: 0
      }
    }
    
    animations.value[name].frames.push(frameData)
    animations.value[name].frameCount = animations.value[name].frames.length
  }

  function applyFrame(frameIndex) {
    if (!currentAnimation.value || !animations.value[currentAnimation.value]) return
    
    const anim = animations.value[currentAnimation.value]
    if (frameIndex < 0 || frameIndex >= anim.frames.length) return
    
    const frame = anim.frames[frameIndex]
    frame.forEach(data => {
      const joint = joints.value.find(j => j.id === data.id)
      if (joint) {
        joint.x = data.x
        joint.y = data.y
        joint.rotation = data.rotation
      }
    })
    
    currentFrame.value = frameIndex
  }

  function loadAnimation(name) {
    if (animations.value[name]) {
      currentAnimation.value = name
      currentFrame.value = 0
      applyFrame(0)
    }
  }

  function deleteAnimation(name) {
    if (animations.value[name]) {
      delete animations.value[name]
      if (currentAnimation.value === name) {
        currentAnimation.value = null
      }
    }
  }

  function clearAll() {
    joints.value = []
    bones.value = []
    selectedJoint.value = null
    selectedBone.value = null
    jointIdCounter = 0
    boneIdCounter = 0
  }

  function applyPresetAnimation(animationData) {
    clearAll()
    
    animationData.joints.forEach(j => {
      addJoint(j.x, j.y, j.name)
    })
    
    animationData.bones.forEach(b => {
      addBone(b.parentId, b.childId, b.name)
    })
  }

  const rootJoints = computed(() => {
    return joints.value.filter(j => !j.parentId)
  })

  function getChildren(jointId) {
    return joints.value.filter(j => j.parentId === jointId)
  }

  function getJoint(id) {
    return joints.value.find(j => j.id === id)
  }

  function getBone(id) {
    return bones.value.find(b => b.id === id)
  }

  return {
    joints,
    bones,
    animations,
    currentAnimation,
    currentFrame,
    isPlaying,
    fps,
    selectedJoint,
    selectedBone,
    characterImage,
    mode,
    rootJoints,
    addJoint,
    addBone,
    removeJoint,
    removeBone,
    updateJointPosition,
    rotateJoint,
    setCharacterImage,
    saveAnimation,
    applyFrame,
    loadAnimation,
    deleteAnimation,
    clearAll,
    applyPresetAnimation,
    getChildren,
    getJoint,
    getBone
  }
})
