<script setup lang="ts">
import { useDoorSimulator } from '~/composables/useDoorSimulator'

const sim = useDoorSimulator()

useHead({
  title: '自动感应门工作逻辑仿真工具'
})
</script>

<template>
  <div class="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200">
    <header class="bg-white shadow-md">
      <div class="max-w-7xl mx-auto px-4 py-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span class="text-white text-xl">🚪</span>
            </div>
            <div>
              <h1 class="text-xl font-bold text-gray-800">自动感应门工作逻辑仿真工具</h1>
              <p class="text-sm text-gray-500">Auto Door Sensor Simulator</p>
            </div>
          </div>
          <div class="flex items-center gap-4">
            <div 
              :class="[
                'px-3 py-1 rounded-full text-sm font-medium',
                sim.isAccessEnabled.value ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              ]"
            >
              {{ sim.isAccessEnabled.value ? '门禁系统: 启用' : '门禁系统: 禁用' }}
            </div>
          </div>
        </div>
      </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div class="lg:col-span-1">
          <ControlPanel
            :config="sim.config.value"
            :is-access-enabled="sim.isAccessEnabled.value"
            @update:config="(val) => Object.assign(sim.config.value, val)"
            @trigger-infrared="sim.triggerInfrared"
            @trigger-microwave="sim.triggerMicrowave"
            @trigger-obstacle="sim.triggerObstacle"
            @toggle-access="sim.toggleAccess"
            @reset="sim.reset"
          />
        </div>

        <div class="lg:col-span-2 space-y-6">
          <DoorVisualization
            :door-state="sim.doorState.value"
            :door-open-percentage="sim.doorOpenPercentage.value"
            :is-infrared-detected="sim.isInfraredDetected.value"
            :is-microwave-detected="sim.isMicrowaveDetected.value"
            :is-obstacle-detected="sim.isObstacleDetected.value"
            :is-access-enabled="sim.isAccessEnabled.value"
            :infrared-distance="sim.config.value.infraredDistance"
            :microwave-distance="sim.config.value.microwaveDistance"
          />

          <LogPanel :logs="sim.accessLog.value" />
        </div>
      </div>

      <div class="mt-6 bg-white rounded-xl shadow-lg p-6">
        <h3 class="text-lg font-bold text-gray-800 mb-4">使用说明</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div class="p-4 bg-red-50 rounded-lg">
            <div class="text-2xl mb-2">🔴</div>
            <h4 class="font-semibold text-red-700">红外感应</h4>
            <p class="text-sm text-red-600 mt-1">检测近距离物体，适合检测静止或慢速移动的人体</p>
          </div>
          <div class="p-4 bg-blue-50 rounded-lg">
            <div class="text-2xl mb-2">🔵</div>
            <h4 class="font-semibold text-blue-700">微波感应</h4>
            <p class="text-sm text-blue-600 mt-1">检测远距离运动物体，适合检测快速移动的目标</p>
          </div>
          <div class="p-4 bg-yellow-50 rounded-lg">
            <div class="text-2xl mb-2">⚠️</div>
            <h4 class="font-semibold text-yellow-700">防夹回弹</h4>
            <p class="text-sm text-yellow-600 mt-1">关门时检测到障碍物会自动回弹，确保安全</p>
          </div>
          <div class="p-4 bg-green-50 rounded-lg">
            <div class="text-2xl mb-2">🔧</div>
            <h4 class="font-semibold text-green-700">参数调节</h4>
            <p class="text-sm text-green-600 mt-1">可自定义感应距离、开关门速度、延时等参数</p>
          </div>
        </div>
      </div>
    </main>

    <footer class="mt-8 py-6 bg-white border-t">
      <div class="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
        自动感应门工作逻辑仿真工具 | 基于 Nuxt3 + UnoCSS 构建
      </div>
    </footer>
  </div>
</template>
