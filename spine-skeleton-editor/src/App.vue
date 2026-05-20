<template>
  <div class="app-container">
    <header class="app-header">
      <div class="header-left">
        <h1>🦴 2D骨骼绑定编辑器</h1>
      </div>
      <div class="header-center">
        <span class="mode-badge" :class="store.mode">
          {{ modeText }}
        </span>
      </div>
      <div class="header-right">
        <span class="info-text">
          关节: {{ store.joints.length }} | 骨骼: {{ store.bones.length }}
        </span>
      </div>
    </header>
    
    <main class="app-main">
      <div class="canvas-area">
        <SkeletonCanvas ref="canvasRef" />
      </div>
      <ControlPanel @uploadImage="handleUploadImage" />
    </main>
    
    <footer class="app-footer">
      <div class="tips">
        💡 提示: 选择「添加关节」点击画布添加 | 选择「连接骨骼」依次点击两个关节创建骨骼 | 选中关节后可拖拽移动或调整角度
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useSkeletonStore } from './stores/skeleton'
import SkeletonCanvas from './components/SkeletonCanvas.vue'
import ControlPanel from './components/ControlPanel.vue'

const store = useSkeletonStore()
const canvasRef = ref(null)

const modeText = computed(() => {
  const modeMap = {
    select: '选择模式',
    add: '添加关节',
    connect: '连接骨骼'
  }
  return modeMap[store.mode] || '选择模式'
})

function handleUploadImage() {
  canvasRef.value?.triggerImageUpload()
}
</script>

<style lang="scss" scoped>
.app-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: #1e1e2e;
}

.app-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  background: #282a36;
  border-bottom: 1px solid #44475a;
  flex-shrink: 0;
  
  h1 {
    font-size: 18px;
    color: #f8f8f2;
    margin: 0;
  }
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.mode-badge {
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 500;
  
  &.select {
    background: rgba(64, 158, 255, 0.2);
    color: #409eff;
  }
  
  &.add {
    background: rgba(103, 194, 58, 0.2);
    color: #67c23a;
  }
  
  &.connect {
    background: rgba(230, 162, 60, 0.2);
    color: #e6a23c;
  }
}

.header-right {
  .info-text {
    font-size: 13px;
    color: #bdbdbd;
  }
}

.app-main {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.canvas-area {
  flex: 1;
  padding: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.app-footer {
  padding: 10px 20px;
  background: #282a36;
  border-top: 1px solid #44475a;
  flex-shrink: 0;
  
  .tips {
    font-size: 12px;
    color: #6272a4;
    text-align: center;
  }
}
</style>
