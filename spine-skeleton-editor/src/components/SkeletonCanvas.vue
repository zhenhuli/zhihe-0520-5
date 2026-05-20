<template>
  <div class="skeleton-canvas-container" ref="containerRef">
    <canvas
      ref="canvasRef"
      :width="canvasWidth"
      :height="canvasHeight"
      @mousedown="handleMouseDown"
      @mousemove="handleMouseMove"
      @mouseup="handleMouseUp"
      @mouseleave="handleMouseUp"
    ></canvas>
    <input
      type="file"
      ref="fileInputRef"
      accept="image/*"
      style="display: none"
      @change="handleImageUpload"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onUnmounted } from 'vue'
import { useSkeletonStore } from '../stores/skeleton'

const store = useSkeletonStore()

const containerRef = ref(null)
const canvasRef = ref(null)
const fileInputRef = ref(null)
const canvasWidth = ref(800)
const canvasHeight = ref(600)
const ctx = ref(null)

const isDragging = ref(false)
const draggedJointId = ref(null)
const isConnecting = ref(false)
const connectStartId = ref(null)
const mousePos = ref({ x: 0, y: 0 })

let animationFrameId = null
let characterImg = null
let lastFrameTime = 0

function triggerImageUpload() {
  fileInputRef.value?.click()
}

function handleImageUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  
  const reader = new FileReader()
  reader.onload = (event) => {
    const img = new Image()
    img.onload = () => {
      characterImg = img
      store.setCharacterImage(event.target.result)
      render()
    }
    img.src = event.target.result
  }
  reader.readAsDataURL(file)
}

function render() {
  if (!ctx.value) return
  
  ctx.value.fillStyle = '#1a1a2e'
  ctx.value.fillRect(0, 0, canvasWidth.value, canvasHeight.value)
  
  drawGrid()
  
  if (characterImg) {
    const scale = Math.min(
      canvasWidth.value / characterImg.width,
      canvasHeight.value / characterImg.height,
      1
    ) * 0.8
    const w = characterImg.width * scale
    const h = characterImg.height * scale
    const x = (canvasWidth.value - w) / 2
    const y = (canvasHeight.value - h) / 2
    ctx.value.globalAlpha = 0.4
    ctx.value.drawImage(characterImg, x, y, w, h)
    ctx.value.globalAlpha = 1
  }
  
  drawBones()
  drawJoints()
  
  if (isConnecting.value && connectStartId.value) {
    const startJoint = store.getJoint(connectStartId.value)
    if (startJoint) {
      ctx.value.strokeStyle = '#ff6b6b'
      ctx.value.lineWidth = 2
      ctx.value.setLineDash([5, 5])
      ctx.value.beginPath()
      ctx.value.moveTo(startJoint.x, startJoint.y)
      ctx.value.lineTo(mousePos.value.x, mousePos.value.y)
      ctx.value.stroke()
      ctx.value.setLineDash([])
    }
  }
}

function drawGrid() {
  ctx.value.strokeStyle = 'rgba(255, 255, 255, 0.05)'
  ctx.value.lineWidth = 1
  
  const gridSize = 40
  for (let x = 0; x < canvasWidth.value; x += gridSize) {
    ctx.value.beginPath()
    ctx.value.moveTo(x, 0)
    ctx.value.lineTo(x, canvasHeight.value)
    ctx.value.stroke()
  }
  for (let y = 0; y < canvasHeight.value; y += gridSize) {
    ctx.value.beginPath()
    ctx.value.moveTo(0, y)
    ctx.value.lineTo(canvasWidth.value, y)
    ctx.value.stroke()
  }
}

function drawBones() {
  store.bones.forEach(bone => {
    const parent = store.getJoint(bone.parentId)
    const child = store.getJoint(bone.childId)
    if (!parent || !child) return
    
    const isSelected = store.selectedBone === bone.id
    
    ctx.value.strokeStyle = isSelected ? '#ffd700' : '#4ecdc4'
    ctx.value.lineWidth = isSelected ? 6 : 4
    ctx.value.lineCap = 'round'
    
    ctx.value.beginPath()
    ctx.value.moveTo(parent.x, parent.y)
    ctx.value.lineTo(child.x, child.y)
    ctx.value.stroke()
    
    const midX = (parent.x + child.x) / 2
    const midY = (parent.y + child.y) / 2
    
    ctx.value.fillStyle = isSelected ? '#ffd700' : '#4ecdc4'
    ctx.value.font = '12px sans-serif'
    ctx.value.textAlign = 'center'
    ctx.value.fillText(bone.name, midX, midY - 8)
  })
}

function drawJoints() {
  store.joints.forEach(joint => {
    const isSelected = store.selectedJoint === joint.id
    const isRoot = !joint.parentId
    
    const radius = isSelected ? 14 : (isRoot ? 12 : 10)
    
    ctx.value.beginPath()
    ctx.value.arc(joint.x, joint.y, radius + 4, 0, Math.PI * 2)
    ctx.value.fillStyle = isSelected ? 'rgba(255, 215, 0, 0.3)' : 'rgba(78, 205, 196, 0.2)'
    ctx.value.fill()
    
    ctx.value.beginPath()
    ctx.value.arc(joint.x, joint.y, radius, 0, Math.PI * 2)
    ctx.value.fillStyle = isRoot ? '#ff6b6b' : (isSelected ? '#ffd700' : '#4ecdc4')
    ctx.value.fill()
    ctx.value.strokeStyle = '#fff'
    ctx.value.lineWidth = 2
    ctx.value.stroke()
    
    ctx.value.fillStyle = '#fff'
    ctx.value.font = 'bold 11px sans-serif'
    ctx.value.textAlign = 'center'
    ctx.value.textBaseline = 'middle'
    ctx.value.fillText(joint.id.toString(), joint.x, joint.y)
    
    ctx.value.font = '10px sans-serif'
    ctx.value.fillStyle = '#bdbdbd'
    ctx.value.fillText(joint.name, joint.x, joint.y + radius + 14)
    
    if (isSelected && joint.parentId) {
      drawRotationHandle(joint)
    }
  })
}

function drawRotationHandle(joint) {
  const parent = store.getJoint(joint.parentId)
  if (!parent) return
  
  const handleRadius = 40
  const angle = joint.rotation * Math.PI / 180
  const handleX = joint.x + Math.cos(angle) * handleRadius
  const handleY = joint.y + Math.sin(angle) * handleRadius
  
  ctx.value.strokeStyle = 'rgba(255, 215, 0, 0.5)'
  ctx.value.lineWidth = 1
  ctx.value.setLineDash([3, 3])
  ctx.value.beginPath()
  ctx.value.arc(joint.x, joint.y, handleRadius, 0, Math.PI * 2)
  ctx.value.stroke()
  ctx.value.setLineDash([])
  
  ctx.value.beginPath()
  ctx.value.arc(handleX, handleY, 8, 0, Math.PI * 2)
  ctx.value.fillStyle = '#ffd700'
  ctx.value.fill()
  ctx.value.strokeStyle = '#fff'
  ctx.value.lineWidth = 2
  ctx.value.stroke()
}

function getMousePos(e) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  
  const rect = canvas.getBoundingClientRect()
  const scaleX = canvas.width / rect.width
  const scaleY = canvas.height / rect.height
  
  return {
    x: (e.clientX - rect.left) * scaleX,
    y: (e.clientY - rect.top) * scaleY
  }
}

function getJointAtPosition(x, y) {
  for (let i = store.joints.length - 1; i >= 0; i--) {
    const joint = store.joints[i]
    const dist = Math.sqrt((x - joint.x) ** 2 + (y - joint.y) ** 2)
    if (dist <= 18) {
      return joint
    }
  }
  return null
}

function handleMouseDown(e) {
  const pos = getMousePos(e)
  mousePos.value = pos
  
  if (store.mode === 'add') {
    store.addJoint(pos.x, pos.y)
    render()
    return
  }
  
  if (store.mode === 'connect') {
    const joint = getJointAtPosition(pos.x, pos.y)
    if (joint) {
      if (!isConnecting.value) {
        isConnecting.value = true
        connectStartId.value = joint.id
      } else {
        if (connectStartId.value !== joint.id) {
          store.addBone(connectStartId.value, joint.id)
        }
        isConnecting.value = false
        connectStartId.value = null
      }
      render()
    }
    return
  }
  
  const joint = getJointAtPosition(pos.x, pos.y)
  if (joint) {
    store.selectedJoint = joint.id
    store.selectedBone = null
    isDragging.value = true
    draggedJointId.value = joint.id
    render()
  } else {
    store.selectedJoint = null
    store.selectedBone = null
    render()
  }
}

function handleMouseMove(e) {
  const pos = getMousePos(e)
  mousePos.value = pos
  
  if (isDragging.value && draggedJointId.value) {
    store.updateJointPosition(draggedJointId.value, pos.x, pos.y)
    render()
    return
  }
  
  if (isConnecting.value) {
    render()
  }
}

function handleMouseUp() {
  isDragging.value = false
  draggedJointId.value = null
}

function animate(timestamp) {
  if (store.isPlaying && store.currentAnimation) {
    const anim = store.animations[store.currentAnimation]
    if (anim && anim.frames.length > 0) {
      const frameInterval = 1000 / store.fps
      if (timestamp - lastFrameTime >= frameInterval) {
        const nextFrame = (store.currentFrame + 1) % anim.frames.length
        store.applyFrame(nextFrame)
        lastFrameTime = timestamp
      }
    }
  } else {
    lastFrameTime = timestamp
  }
  render()
  animationFrameId = requestAnimationFrame(animate)
}

defineExpose({
  triggerImageUpload
})

onMounted(() => {
  if (canvasRef.value) {
    ctx.value = canvasRef.value.getContext('2d')
    
    if (store.characterImage) {
      const img = new Image()
      img.onload = () => {
        characterImg = img
        render()
      }
      img.src = store.characterImage
    }
    
    animate()
  }
})

onUnmounted(() => {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId)
  }
})

watch(
  () => [store.joints, store.bones, store.selectedJoint, store.selectedBone],
  () => {
    render()
  },
  { deep: true }
)
</script>

<style lang="scss" scoped>
.skeleton-canvas-container {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #0f0f1a;
  border-radius: 8px;
  overflow: hidden;
  
  canvas {
    cursor: crosshair;
    max-width: 100%;
    max-height: 100%;
  }
}
</style>
