<template>
  <n-config-provider>
    <div class="app-container">
      <header class="header">
        <div class="header-content">
          <h1>🌱 温室大棚环境模拟调控系统</h1>
          <div class="header-info">
            <n-tag :type="isRunning ? 'success' : 'info'" size="large">
              {{ isRunning ? '运行中' : '已停止' }}
            </n-tag>
            <n-tag type="warning" size="large">
              运行时长: {{ formatRuntime(runTime) }}
            </n-tag>
          </div>
        </div>
      </header>

      <main class="main-content">
        <div class="left-panel">
          <n-card title="🌾 作物选择" class="card">
            <n-radio-group v-model:value="selectedCropId">
              <n-space vertical>
                <n-radio-button v-for="crop in crops" :key="crop.id" :value="crop.id">
                  {{ crop.icon }} {{ crop.name }}
                </n-radio-button>
              </n-space>
            </n-radio-group>
            <div class="crop-info" v-if="selectedCrop">
              <n-divider />
              <p class="info-title">最适环境参数：</p>
              <n-descriptions :column="1" bordered size="small">
                <n-descriptions-item label="温度">
                  {{ selectedCrop.optimal.temperature.min }}-{{ selectedCrop.optimal.temperature.max }}°C
                </n-descriptions-item>
                <n-descriptions-item label="湿度">
                  {{ selectedCrop.optimal.humidity.min }}-{{ selectedCrop.optimal.humidity.max }}%
                </n-descriptions-item>
                <n-descriptions-item label="光照">
                  {{ selectedCrop.optimal.light.min }}-{{ selectedCrop.optimal.light.max }} lux
                </n-descriptions-item>
                <n-descriptions-item label="CO₂">
                  {{ selectedCrop.optimal.co2.min }}-{{ selectedCrop.optimal.co2.max }} ppm
                </n-descriptions-item>
              </n-descriptions>
            </div>
          </n-card>

          <n-card title="⚙️ 阈值设定" class="card">
            <n-space vertical style="width: 100%">
              <div class="threshold-item">
                <div class="threshold-label">
                  <span>🌡️ 温度 (°C)</span>
                  <n-tag :type="getStatusType(environmentStatus.temperature)" size="small">
                    {{ getStatusText(environmentStatus.temperature) }}
                  </n-tag>
                </div>
                <n-slider
                  v-model:value="temperatureRange"
                  range
                  :min="0" :max="50" :step="1"
                  :markers="{ 0: '0', 25: '25', 50: '50' }"
                />
                <div class="threshold-range">
                  适宜范围: {{ thresholds.temperature.min }}°C - {{ thresholds.temperature.max }}°C
                </div>
              </div>

              <div class="threshold-item">
                <div class="threshold-label">
                  <span>💧 湿度 (%)</span>
                  <n-tag :type="getStatusType(environmentStatus.humidity)" size="small">
                    {{ getStatusText(environmentStatus.humidity) }}
                  </n-tag>
                </div>
                <n-slider
                  v-model:value="humidityRange"
                  range
                  :min="0" :max="100" :step="1"
                  :markers="{ 0: '0%', 50: '50%', 100: '100%' }"
                />
                <div class="threshold-range">
                  适宜范围: {{ thresholds.humidity.min }}% - {{ thresholds.humidity.max }}%
                </div>
              </div>

              <div class="threshold-item">
                <div class="threshold-label">
                  <span>☀️ 光照 (lux)</span>
                  <n-tag :type="getStatusType(environmentStatus.light)" size="small">
                    {{ getStatusText(environmentStatus.light) }}
                  </n-tag>
                </div>
                <n-slider
                  v-model:value="lightRange"
                  range
                  :min="0" :max="2000" :step="50"
                  :markers="{ 0: '0', 1000: '1000', 2000: '2000' }"
                />
                <div class="threshold-range">
                  适宜范围: {{ thresholds.light.min }} - {{ thresholds.light.max }} lux
                </div>
              </div>

              <div class="threshold-item">
                <div class="threshold-label">
                  <span>🌫️ CO₂ (ppm)</span>
                  <n-tag :type="getStatusType(environmentStatus.co2)" size="small">
                    {{ getStatusText(environmentStatus.co2) }}
                  </n-tag>
                </div>
                <n-slider
                  v-model:value="co2Range"
                  range
                  :min="100" :max="2000" :step="50"
                  :markers="{ 100: '100', 1000: '1000', 2000: '2000' }"
                />
                <div class="threshold-range">
                  适宜范围: {{ thresholds.co2.min }} - {{ thresholds.co2.max }} ppm
                </div>
              </div>
            </n-space>
          </n-card>
        </div>

        <div class="center-panel">
          <n-card title="🌍 实时环境监控" class="card">
            <div class="environment-display">
              <div class="env-card" :class="{ warning: environmentStatus.temperature !== 'normal' }">
                <div class="env-icon">🌡️</div>
                <div class="env-value">{{ environment.temperature.toFixed(1) }}°C</div>
                <div class="env-label">温度</div>
              </div>
              <div class="env-card" :class="{ warning: environmentStatus.humidity !== 'normal' }">
                <div class="env-icon">💧</div>
                <div class="env-value">{{ environment.humidity.toFixed(1) }}%</div>
                <div class="env-label">湿度</div>
              </div>
              <div class="env-card" :class="{ warning: environmentStatus.light !== 'normal' }">
                <div class="env-icon">☀️</div>
                <div class="env-value">{{ environment.light.toFixed(0) }} lux</div>
                <div class="env-label">光照</div>
              </div>
              <div class="env-card" :class="{ warning: environmentStatus.co2 !== 'normal' }">
                <div class="env-icon">🌫️</div>
                <div class="env-value">{{ environment.co2.toFixed(0) }} ppm</div>
                <div class="env-label">CO₂</div>
              </div>
            </div>
          </n-card>

          <n-card title="🔧 设备状态" class="card">
            <div class="devices-grid">
              <div 
                v-for="device in deviceList" 
                :key="device.id"
                class="device-card"
                :class="{ active: deviceStates[device.id] }"
              >
                <div class="device-icon">{{ device.icon }}</div>
                <div class="device-name">{{ device.name }}</div>
                <div class="device-status">
                  <n-badge :dot :type="deviceStates[device.id] ? 'success' : 'default'" />
                  <span>{{ deviceStates[device.id] ? '运行中' : '已关闭' }}</span>
                </div>
                <div class="device-power">{{ device.power }} {{ device.unit }}</div>
              </div>
            </div>
          </n-card>

          <n-card title="🎮 控制面板" class="card">
            <n-space justify="center">
              <n-button 
                v-if="!isRunning" 
                type="primary" 
                size="large"
                @click="startSimulation"
              >
                <template #icon>
                  <n-icon>▶️</n-icon>
                </template>
                开始模拟
              </n-button>
              <n-button 
                v-else 
                type="warning" 
                size="large"
                @click="stopSimulation"
              >
                <template #icon>
                  <n-icon>⏸️</n-icon>
                </template>
                暂停模拟
              </n-button>
              <n-button 
                type="default" 
                size="large"
                @click="resetSimulation"
              >
                <template #icon>
                  <n-icon>🔄</n-icon>
                </template>
                重置
              </n-button>
            </n-space>
            <n-divider />
            <div class="speed-control">
              <span>模拟速度：</span>
              <n-radio-group v-model:value="simulationSpeed">
                <n-space>
                  <n-radio-button :value="1">1x</n-radio-button>
                  <n-radio-button :value="5">5x</n-radio-button>
                  <n-radio-button :value="10">10x</n-radio-button>
                  <n-radio-button :value="30">30x</n-radio-button>
                </n-space>
              </n-radio-group>
            </div>
          </n-card>
        </div>

        <div class="right-panel">
          <n-card title="📊 能耗统计" class="card">
            <n-descriptions :column="1" bordered size="small">
              <n-descriptions-item label="总能耗">
                <n-text type="warning" strong>{{ totalEnergy.toFixed(3) }} kWh</n-text>
              </n-descriptions-item>
              <n-descriptions-item label="设备总运行时长">
                {{ formatRuntime(totalRuntime) }}
              </n-descriptions-item>
            </n-descriptions>
            <n-divider />
            <div class="energy-list">
              <div v-for="device in deviceList" :key="device.id" class="energy-item">
                <div class="energy-header">
                  <span>{{ device.icon }} {{ device.name }}</span>
                  <n-tag size="small">{{ device.power }} kW</n-tag>
                </div>
                <n-progress 
                  :percentage="getEnergyPercentage(device.id)" 
                  :show-indicator="false"
                  :color="deviceStates[device.id] ? '#18a058' : '#d03050'"
                />
                <div class="energy-stats">
                  <span>运行: {{ formatRuntime(deviceRuntime[device.id]) }}</span>
                  <span>耗电: {{ energyConsumption[device.id].toFixed(3) }} kWh</span>
                </div>
              </div>
            </div>
          </n-card>

          <n-card title="📋 工作记录" class="card">
            <div class="activity-list">
              <div v-if="activeDevices.length === 0" class="no-activity">
                暂无设备运行
              </div>
              <div v-for="device in activeDevices" :key="device.id" class="activity-item">
                <n-tag type="success" size="small">运行中</n-tag>
                <span>{{ device.icon }} {{ device.name }} 正在工作</span>
              </div>
            </div>
          </n-card>
        </div>
      </main>
    </div>
  </n-config-provider>
</template>

<script setup>
import { useGreenhouse } from './composables/useGreenhouse'
import { crops } from './data/crops'
import { deviceList } from './data/devices'

const {
  selectedCropId,
  selectedCrop,
  isRunning,
  simulationSpeed,
  runTime,
  environment,
  thresholds,
  deviceStates,
  deviceRuntime,
  energyConsumption,
  totalEnergy,
  totalRuntime,
  environmentStatus,
  activeDevices,
  startSimulation,
  stopSimulation,
  resetSimulation,
  formatRuntime
} = useGreenhouse()

function getStatusType(status) {
  if (status === 'normal') return 'success'
  if (status === 'low' || status === 'high') return 'warning'
  return 'default'
}

function getStatusText(status) {
  if (status === 'normal') return '正常'
  if (status === 'low') return '偏低'
  if (status === 'high') return '偏高'
  return ''
}

function getEnergyPercentage(deviceId) {
  if (totalEnergy.value === 0) return 0
  return (energyConsumption[deviceId] / totalEnergy.value) * 100
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  padding: 20px;
}

.header {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  padding: 20px 30px;
  margin-bottom: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
}

.header h1 {
  font-size: 28px;
  color: #333;
  margin: 0;
}

.header-info {
  display: flex;
  gap: 12px;
}

.main-content {
  display: grid;
  grid-template-columns: 380px 1fr 380px;
  gap: 20px;
  max-width: 1800px;
  margin: 0 auto;
}

.card {
  margin-bottom: 20px;
}

.card:last-child {
  margin-bottom: 0;
}

.crop-info {
  margin-top: 16px;
}

.info-title {
  font-size: 14px;
  color: #666;
  margin-bottom: 12px;
}

.threshold-item {
  margin-bottom: 24px;
}

.threshold-item:last-child {
  margin-bottom: 0;
}

.threshold-label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 500;
}

.threshold-range {
  text-align: center;
  color: #666;
  font-size: 12px;
  margin: 8px 0;
}

.environment-display {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
}

.env-card {
  text-align: center;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
  border-radius: 12px;
  transition: all 0.3s ease;
}

.env-card.warning {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.02); }
}

.env-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.env-value {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.env-label {
  font-size: 12px;
  color: #666;
}

.devices-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.device-card {
  text-align: center;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 12px;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

.device-card.active {
  background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%);
  border-color: #4caf50;
}

.device-icon {
  font-size: 32px;
  margin-bottom: 8px;
}

.device-name {
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.device-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.device-power {
  font-size: 11px;
  color: #999;
}

.speed-control {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
}

.energy-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.energy-item {
  padding: 12px;
  background: #fafafa;
  border-radius: 8px;
}

.energy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.energy-stats {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  margin-top: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 300px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px;
  background: #f5f5f5;
  border-radius: 8px;
  font-size: 13px;
}

.no-activity {
  text-align: center;
  color: #999;
  padding: 40px 20px;
  font-size: 14px;
}

@media (max-width: 1400px) {
  .main-content {
    grid-template-columns: 1fr;
  }
  
  .environment-display {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header h1 {
    font-size: 20px;
  }
  
  .environment-display {
    grid-template-columns: 1fr;
  }
  
  .devices-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
