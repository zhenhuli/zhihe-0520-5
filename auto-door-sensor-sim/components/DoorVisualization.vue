<script setup lang="ts">
import type { DoorState } from '~/composables/useDoorSimulator'

const props = defineProps<{
  doorState: DoorState
  doorOpenPercentage: number
  isInfraredDetected: boolean
  isMicrowaveDetected: boolean
  isObstacleDetected: boolean
  isAccessEnabled: boolean
  infraredDistance: number
  microwaveDistance: number
}>()

const stateColors: Record<DoorState, string> = {
  closed: 'text-gray-600',
  opening: 'text-green-500',
  open: 'text-green-600',
  closing: 'text-orange-500',
  rebounding: 'text-red-500'
}

const stateLabels: Record<DoorState, string> = {
  closed: '已关闭',
  opening: '开门中...',
  open: '已打开',
  closing: '关门中...',
  rebounding: '防夹回弹!'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6 space-y-6">
    <div class="flex items-center justify-between border-b pb-3">
      <h2 class="text-xl font-bold text-gray-800">感应门仿真演示</h2>
      <div class="flex items-center gap-2">
        <span class="text-sm text-gray-500">状态:</span>
        <span :class="['font-bold', stateColors[doorState]]">
          {{ stateLabels[doorState] }}
        </span>
      </div>
    </div>

    <div class="relative bg-gradient-to-b from-sky-100 to-sky-50 rounded-xl p-8 min-h-[400px] overflow-hidden">
      <div class="absolute top-4 left-4 flex flex-col gap-2">
        <div 
          v-if="isInfraredDetected"
          class="px-3 py-1 bg-red-500 text-white text-xs rounded-full animate-pulse"
        >
          🔴 红外检测中
        </div>
        <div 
          v-if="isMicrowaveDetected"
          class="px-3 py-1 bg-blue-500 text-white text-xs rounded-full animate-pulse"
        >
          🔵 微波检测中
        </div>
        <div 
          v-if="isObstacleDetected"
          class="px-3 py-1 bg-yellow-500 text-white text-xs rounded-full animate-pulse"
        >
          ⚠️ 障碍物检测
        </div>
      </div>

      <div class="absolute top-4 right-4">
        <div 
          :class="[
            'px-3 py-1 text-xs rounded-full',
            isAccessEnabled ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
          ]"
        >
          {{ isAccessEnabled ? '✅ 门禁正常' : '🚫 门禁禁用' }}
        </div>
      </div>

      <div class="absolute left-1/2 top-20 transform -translate-x-1/2">
        <div 
          v-if="isMicrowaveDetected"
          class="absolute -top-2 left-1/2 transform -translate-x-1/2"
          :style="{ width: microwaveDistance / 3 + 'px', height: microwaveDistance / 4 + 'px' }"
        >
          <div class="w-full h-full bg-blue-400 rounded-full opacity-20 animate-ping" />
        </div>

        <div 
          v-if="isInfraredDetected"
          class="absolute -top-2 left-1/2 transform -translate-x-1/2"
          :style="{ width: infraredDistance / 3 + 'px', height: infraredDistance / 4 + 'px' }"
        >
          <div class="w-full h-full bg-red-400 rounded-full opacity-30 animate-pulse" />
        </div>
      </div>

      <div class="relative mx-auto mt-20" style="width: 300px; height: 250px;">
        <div class="absolute -top-4 left-1/2 transform -translate-x-1/2 w-[340px] h-8 bg-gray-700 rounded-t-lg shadow-lg">
          <div class="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                isInfraredDetected ? 'bg-red-500 animate-pulse' : 'bg-red-900'
              ]"
            />
            <div 
              :class="[
                'w-3 h-3 rounded-full',
                isMicrowaveDetected ? 'bg-blue-500 animate-pulse' : 'bg-blue-900'
              ]"
            />
          </div>
        </div>

        <div class="absolute left-0 top-0 w-4 h-full bg-gray-600 rounded-l-lg" />
        <div class="absolute right-0 top-0 w-4 h-full bg-gray-600 rounded-r-lg" />

        <div class="absolute top-0 left-4 right-4 bottom-0 overflow-hidden bg-gray-800">
          <div 
            class="absolute top-0 left-0 h-full bg-gradient-to-r from-amber-700 to-amber-600 transition-all duration-75 shadow-inner"
            :style="{ width: (100 - doorOpenPercentage) / 2 + '%' }"
          >
            <div class="absolute right-2 top-1/2 transform -translate-y-1/2 w-2 h-16 bg-gray-500 rounded-full" />
            <div class="absolute inset-2 border-2 border-amber-800 rounded opacity-30" />
          </div>

          <div 
            class="absolute top-0 right-0 h-full bg-gradient-to-l from-amber-700 to-amber-600 transition-all duration-75 shadow-inner"
            :style="{ width: (100 - doorOpenPercentage) / 2 + '%' }"
          >
            <div class="absolute left-2 top-1/2 transform -translate-y-1/2 w-2 h-16 bg-gray-500 rounded-full" />
            <div class="absolute inset-2 border-2 border-amber-800 rounded opacity-30" />
          </div>

          <div 
            v-if="isObstacleDetected"
            class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10"
          >
            <div class="w-16 h-20 bg-yellow-400 rounded-lg animate-bounce shadow-lg border-4 border-yellow-500">
              <div class="text-3xl text-center mt-2">📦</div>
            </div>
          </div>
        </div>

        <div class="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
          <div 
            v-for="i in 5" 
            :key="i"
            class="w-12 h-2 bg-gray-400 rounded"
            :class="{ 'bg-green-500': doorOpenPercentage >= i * 20 }"
          />
        </div>
      </div>

      <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2">
        <div class="bg-white/80 backdrop-blur rounded-lg px-6 py-3 shadow-lg">
          <div class="text-center">
            <div class="text-sm text-gray-500">开度</div>
            <div class="text-3xl font-bold text-gray-800">
              {{ Math.round(doorOpenPercentage) }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="grid grid-cols-4 gap-4">
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-2xl mb-1">🚪</div>
        <div class="text-xs text-gray-500">门状态</div>
        <div :class="['font-semibold text-sm', stateColors[doorState]]">
          {{ stateLabels[doorState] }}
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-2xl mb-1">🔴</div>
        <div class="text-xs text-gray-500">红外传感</div>
        <div :class="['font-semibold text-sm', isInfraredDetected ? 'text-red-500' : 'text-gray-400']">
          {{ isInfraredDetected ? '检测中' : '待机' }}
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-2xl mb-1">🔵</div>
        <div class="text-xs text-gray-500">微波传感</div>
        <div :class="['font-semibold text-sm', isMicrowaveDetected ? 'text-blue-500' : 'text-gray-400']">
          {{ isMicrowaveDetected ? '检测中' : '待机' }}
        </div>
      </div>
      <div class="bg-gray-50 rounded-lg p-4 text-center">
        <div class="text-2xl mb-1">🛡️</div>
        <div class="text-xs text-gray-500">防夹系统</div>
        <div :class="['font-semibold text-sm', isObstacleDetected ? 'text-yellow-500' : 'text-green-500']">
          {{ isObstacleDetected ? '触发!' : '正常' }}
        </div>
      </div>
    </div>
  </div>
</template>
