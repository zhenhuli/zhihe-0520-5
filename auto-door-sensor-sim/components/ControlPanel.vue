<script setup lang="ts">
import type { SensorType } from '~/composables/useDoorSimulator'

const props = defineProps<{
  config: {
    infraredDistance: number
    microwaveDistance: number
    openDelay: number
    openDuration: number
    closeDelay: number
    closeBuffer: number
    openSpeed: number
    closeSpeed: number
    reboundDistance: number
    sensorType: SensorType
  }
  isAccessEnabled: boolean
}>()

const emit = defineEmits<{
  'update:config': [value: typeof props.config]
  'trigger-infrared': [detected: boolean]
  'trigger-microwave': [detected: boolean]
  'trigger-obstacle': [detected: boolean]
  'toggle-access': [enabled: boolean]
  'reset': []
}>()

function updateConfig<K extends keyof typeof props.config>(key: K, value: typeof props.config[K]) {
  emit('update:config', { ...props.config, [key]: value })
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6 space-y-6">
    <h2 class="text-xl font-bold text-gray-800 border-b pb-3">参数控制面板</h2>
    
    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700">传感器设置</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">传感器类型</label>
        <div class="flex gap-2">
          <button
            @click="updateConfig('sensorType', 'infrared')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              config.sensorType === 'infrared' 
                ? 'bg-red-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            仅红外
          </button>
          <button
            @click="updateConfig('sensorType', 'microwave')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              config.sensorType === 'microwave' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            仅微波
          </button>
          <button
            @click="updateConfig('sensorType', 'both')"
            :class="[
              'px-4 py-2 rounded-lg text-sm font-medium transition-all',
              config.sensorType === 'both' 
                ? 'bg-purple-500 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            ]"
          >
            双传感器
          </button>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          红外感应距离: {{ config.infraredDistance }}cm
        </label>
        <input
          type="range"
          :value="config.infraredDistance"
          @input="updateConfig('infraredDistance', Number(($event.target as HTMLInputElement).value))"
          min="50"
          max="300"
          step="10"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          微波感应距离: {{ config.microwaveDistance }}cm
        </label>
        <input
          type="range"
          :value="config.microwaveDistance"
          @input="updateConfig('microwaveDistance', Number(($event.target as HTMLInputElement).value))"
          min="100"
          max="500"
          step="10"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700">门动作参数</h3>
      
      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          关门延时: {{ config.closeDelay }}s
        </label>
        <input
          type="range"
          :value="config.closeDelay"
          @input="updateConfig('closeDelay', Number(($event.target as HTMLInputElement).value))"
          min="0.5"
          max="10"
          step="0.5"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          关门缓冲: {{ config.closeBuffer }}s
        </label>
        <input
          type="range"
          :value="config.closeBuffer"
          @input="updateConfig('closeBuffer', Number(($event.target as HTMLInputElement).value))"
          min="0.1"
          max="2"
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          开门速度: {{ config.openSpeed }}x
        </label>
        <input
          type="range"
          :value="config.openSpeed"
          @input="updateConfig('openSpeed', Number(($event.target as HTMLInputElement).value))"
          min="0.5"
          max="3"
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          关门速度: {{ config.closeSpeed }}x
        </label>
        <input
          type="range"
          :value="config.closeSpeed"
          @input="updateConfig('closeSpeed', Number(($event.target as HTMLInputElement).value))"
          min="0.5"
          max="3"
          step="0.1"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
        />
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-600 mb-2">
          防夹回弹距离: {{ config.reboundDistance }}%
        </label>
        <input
          type="range"
          :value="config.reboundDistance"
          @input="updateConfig('reboundDistance', Number(($event.target as HTMLInputElement).value))"
          min="10"
          max="80"
          step="5"
          class="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-500"
        />
      </div>
    </div>

    <div class="space-y-4">
      <h3 class="text-lg font-semibold text-gray-700">手动触发</h3>
      
      <div class="grid grid-cols-2 gap-3">
        <button
          @mousedown="emit('trigger-infrared', true)"
          @mouseup="emit('trigger-infrared', false)"
          @mouseleave="emit('trigger-infrared', false)"
          @touchstart.prevent="emit('trigger-infrared', true)"
          @touchend.prevent="emit('trigger-infrared', false)"
          class="px-4 py-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-all active:scale-95 select-none"
        >
          🔴 红外感应
        </button>
        <button
          @mousedown="emit('trigger-microwave', true)"
          @mouseup="emit('trigger-microwave', false)"
          @mouseleave="emit('trigger-microwave', false)"
          @touchstart.prevent="emit('trigger-microwave', true)"
          @touchend.prevent="emit('trigger-microwave', false)"
          class="px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-all active:scale-95 select-none"
        >
          🔵 微波感应
        </button>
        <button
          @mousedown="emit('trigger-obstacle', true)"
          @mouseup="emit('trigger-obstacle', false)"
          @mouseleave="emit('trigger-obstacle', false)"
          @touchstart.prevent="emit('trigger-obstacle', true)"
          @touchend.prevent="emit('trigger-obstacle', false)"
          class="px-4 py-3 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg font-medium transition-all active:scale-95 select-none"
        >
          ⚠️ 模拟障碍物
        </button>
        <button
          @click="emit('reset')"
          class="px-4 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-all active:scale-95"
        >
          🔄 重置
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-lg font-semibold text-gray-700">门禁控制</h3>
      <div class="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
        <span class="text-gray-700 font-medium">门禁系统</span>
        <button
          @click="emit('toggle-access', !isAccessEnabled)"
          :class="[
            'relative w-14 h-7 rounded-full transition-all',
            isAccessEnabled ? 'bg-green-500' : 'bg-gray-300'
          ]"
        >
          <span
            :class="[
              'absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow',
              isAccessEnabled ? 'left-8' : 'left-1'
            ]"
          />
        </button>
      </div>
    </div>
  </div>
</template>
