<template>
  <div class="control-panel">
    <div class="panel-section">
      <h3>编辑模式</h3>
      <div class="mode-buttons">
        <button
          class="btn"
          :class="store.mode === 'select' ? 'btn-primary' : 'btn-default'"
          @click="store.mode = 'select'"
        >
          选择
        </button>
        <button
          class="btn"
          :class="store.mode === 'add' ? 'btn-success' : 'btn-default'"
          @click="store.mode = 'add'"
        >
          添加关节
        </button>
        <button
          class="btn"
          :class="store.mode === 'connect' ? 'btn-warning' : 'btn-default'"
          @click="store.mode = 'connect'"
        >
          连接骨骼
        </button>
      </div>
    </div>

    <div class="panel-section">
      <h3>预设动作</h3>
      <div class="preset-buttons">
        <button class="btn btn-default" @click="applyStanding">站立</button>
        <button class="btn btn-default" @click="applyRunning">跑动</button>
        <button class="btn btn-default" @click="applyBending">弯腰</button>
        <button class="btn btn-primary" @click="generateWalk">走路循环</button>
      </div>
    </div>

    <div class="panel-section">
      <h3>图片</h3>
      <button class="btn btn-default w-full" @click="uploadImage">
        导入人物贴图
      </button>
    </div>

    <div class="panel-section" v-if="selectedJoint">
      <h3>关节属性</h3>
      <div class="property-row">
        <label>名称</label>
        <input
          type="text"
          class="input"
          v-model="selectedJoint.name"
          @input="updateJoint"
        />
      </div>
      <div class="property-row">
        <label>X: {{ Math.round(selectedJoint.x) }}</label>
        <input
          type="range"
          class="slider"
          :value="selectedJoint.x"
          min="0"
          max="800"
          @input="(e) => { selectedJoint.x = Number(e.target.value); updateJoint(); }"
        />
      </div>
      <div class="property-row">
        <label>Y: {{ Math.round(selectedJoint.y) }}</label>
        <input
          type="range"
          class="slider"
          :value="selectedJoint.y"
          min="0"
          max="600"
          @input="(e) => { selectedJoint.y = Number(e.target.value); updateJoint(); }"
        />
      </div>
      <div class="property-row" v-if="selectedJoint.parentId">
        <label>角度: {{ Math.round(selectedJoint.rotation) }}°</label>
        <input
          type="range"
          class="slider"
          :value="selectedJoint.rotation"
          min="-180"
          max="180"
          @input="(e) => store.rotateJoint(selectedJoint.id, Number(e.target.value))"
        />
      </div>
      <button class="btn btn-danger w-full" @click="deleteJoint">
        删除关节
      </button>
    </div>

    <div class="panel-section">
      <h3>骨骼列表</h3>
      <div class="bone-list">
        <div
          v-for="bone in store.bones"
          :key="bone.id"
          class="bone-item"
          :class="{ selected: store.selectedBone === bone.id }"
          @click="selectBone(bone.id)"
        >
          <span>{{ bone.name }}</span>
          <button class="btn btn-danger btn-sm" @click.stop="deleteBone(bone.id)">×</button>
        </div>
        <div v-if="store.bones.length === 0" class="empty-text">
          暂无骨骼
        </div>
      </div>
    </div>

    <div class="panel-section">
      <h3>动画控制</h3>
      <div class="animation-controls">
        <div class="control-row">
          <button
            class="btn"
            :class="store.isPlaying ? 'btn-warning' : 'btn-success'"
            @click="togglePlay"
          >
            {{ store.isPlaying ? '暂停' : '播放' }}
          </button>
          <button class="btn btn-default" @click="resetAnimation">重置</button>
        </div>
        <div class="control-row">
          <label>FPS: {{ store.fps }}</label>
          <input
            type="range"
            class="slider"
            v-model.number="store.fps"
            min="1"
            max="60"
          />
        </div>
        <div class="control-row" v-if="currentAnim">
          <label>帧: {{ store.currentFrame + 1 }} / {{ currentAnim.frameCount }}</label>
          <input
            type="range"
            class="slider"
            :value="store.currentFrame"
            min="0"
            :max="currentAnim.frameCount - 1"
            @input="(e) => store.applyFrame(Number(e.target.value))"
          />
        </div>
      </div>
    </div>

    <div class="panel-section">
      <h3>保存帧</h3>
      <div class="save-controls">
        <input
          type="text"
          class="input"
          v-model="newAnimName"
          placeholder="动画名称"
        />
        <button class="btn btn-primary w-full" @click="saveFrame">
          添加关键帧
        </button>
      </div>
      <div class="anim-list">
        <div
          v-for="(anim, name) in store.animations"
          :key="name"
          class="anim-item"
          :class="{ active: store.currentAnimation === name }"
          @click="store.loadAnimation(name)"
        >
          <span>{{ name }} ({{ anim.frameCount }}帧)</span>
          <button class="btn btn-danger btn-sm" @click.stop="store.deleteAnimation(name)">×</button>
        </div>
      </div>
    </div>

    <div class="panel-section">
      <button class="btn btn-danger w-full" @click="clearAll">
        清空所有
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSkeletonStore } from '../stores/skeleton'
import { standingPose, runningPose, bendingPose, generateWalkAnimation } from '../utils/presets'

const emit = defineEmits(['uploadImage'])

const store = useSkeletonStore()
const newAnimName = ref('新动画')

const selectedJoint = computed(() => {
  if (store.selectedJoint) {
    return store.getJoint(store.selectedJoint)
  }
  return null
})

const currentAnim = computed(() => {
  if (store.currentAnimation && store.animations[store.currentAnimation]) {
    return store.animations[store.currentAnimation]
  }
  return null
})

function uploadImage() {
  emit('uploadImage')
}

function applyStanding() {
  store.applyPresetAnimation(standingPose)
}

function applyRunning() {
  store.applyPresetAnimation(runningPose)
}

function applyBending() {
  store.applyPresetAnimation(bendingPose)
}

function generateWalk() {
  generateWalkAnimation(store)
}

function updateJoint() {
  if (selectedJoint.value) {
    store.updateJointPosition(selectedJoint.value.id, selectedJoint.value.x, selectedJoint.value.y)
  }
}

function deleteJoint() {
  if (store.selectedJoint) {
    store.removeJoint(store.selectedJoint)
  }
}

function selectBone(id) {
  store.selectedBone = id
  store.selectedJoint = null
}

function deleteBone(id) {
  store.removeBone(id)
}

function togglePlay() {
  store.isPlaying = !store.isPlaying
}

function resetAnimation() {
  store.isPlaying = false
  store.applyFrame(0)
}

function saveFrame() {
  if (newAnimName.value.trim()) {
    store.saveAnimation(newAnimName.value.trim())
    if (!store.currentAnimation) {
      store.loadAnimation(newAnimName.value.trim())
    }
  }
}

function clearAll() {
  if (confirm('确定要清空所有关节和骨骼吗？')) {
    store.clearAll()
  }
}
</script>

<style lang="scss" scoped>
.control-panel {
  width: 300px;
  height: 100%;
  background: #282a36;
  border-left: 1px solid #44475a;
  padding: 16px;
  overflow-y: auto;
}

.panel-section {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #44475a;
  
  &:last-child {
    border-bottom: none;
  }
  
  h3 {
    font-size: 14px;
    margin-bottom: 12px;
    color: #f8f8f2;
    font-weight: 600;
  }
}

.mode-buttons,
.preset-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  
  button {
    font-size: 12px;
    padding: 6px 10px;
  }
}

.w-full {
  width: 100%;
}

.property-row {
  margin-bottom: 12px;
  
  label {
    display: block;
    font-size: 12px;
    margin-bottom: 6px;
    color: #bdbdbd;
  }
}

.bone-list,
.anim-list {
  max-height: 150px;
  overflow-y: auto;
}

.bone-item,
.anim-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 10px;
  background: #1e1e2e;
  border-radius: 4px;
  margin-bottom: 6px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 12px;
  
  &:hover {
    background: #333648;
  }
  
  &.selected,
  &.active {
    background: #409eff;
  }
}

.btn-sm {
  padding: 2px 8px;
  font-size: 12px;
  min-width: 24px;
}

.empty-text {
  text-align: center;
  color: #6272a4;
  font-size: 12px;
  padding: 12px;
}

.control-row {
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 10px;
  
  label {
    font-size: 12px;
    color: #bdbdbd;
    min-width: 80px;
  }
}

.save-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}
</style>
