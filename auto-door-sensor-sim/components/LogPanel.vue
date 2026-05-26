<script setup lang="ts">
defineProps<{
  logs: Array<{ time: string; event: string; type: string }>
}>()

const typeColors: Record<string, string> = {
  action: 'bg-blue-100 text-blue-700',
  state: 'bg-green-100 text-green-700',
  sensor: 'bg-purple-100 text-purple-700',
  safety: 'bg-red-100 text-red-700',
  access: 'bg-yellow-100 text-yellow-700'
}

const typeLabels: Record<string, string> = {
  action: '动作',
  state: '状态',
  sensor: '传感',
  safety: '安全',
  access: '门禁'
}
</script>

<template>
  <div class="bg-white rounded-xl shadow-lg p-6">
    <h2 class="text-xl font-bold text-gray-800 border-b pb-3 mb-4">事件日志</h2>
    
    <div class="h-[400px] overflow-y-auto space-y-2 pr-2">
      <div
        v-for="(log, index) in logs"
        :key="index"
        class="flex items-start gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <span class="text-xs text-gray-400 font-mono whitespace-nowrap">
          {{ log.time }}
        </span>
        <span 
          :class="[
            'px-2 py-0.5 text-xs font-medium rounded-full whitespace-nowrap',
            typeColors[log.type] || 'bg-gray-100 text-gray-600'
          ]"
        >
          {{ typeLabels[log.type] || log.type }}
        </span>
        <span class="text-sm text-gray-700">
          {{ log.event }}
        </span>
      </div>
      
      <div v-if="logs.length === 0" class="text-center text-gray-400 py-8">
        暂无日志记录
      </div>
    </div>
  </div>
</template>
