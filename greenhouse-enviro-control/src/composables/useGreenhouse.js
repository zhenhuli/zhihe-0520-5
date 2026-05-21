import { ref, reactive, computed, watch } from 'vue'
import { crops } from '../data/crops'
import { devices } from '../data/devices'

export function useGreenhouse() {
  const selectedCropId = ref('tomato')
  const isRunning = ref(false)
  const simulationSpeed = ref(1)
  const runTime = ref(0)

  const environment = reactive({
    temperature: 22,
    humidity: 60,
    light: 800,
    co2: 500
  })

  const thresholds = reactive({
    temperature: { min: 18, max: 28 },
    humidity: { min: 50, max: 75 },
    light: { min: 800, max: 1200 },
    co2: { min: 400, max: 800 }
  })

  const deviceStates = reactive({
    ventilation: false,
    shading: false,
    sprinkler: false,
    lighting: false,
    heater: false,
    co2Injector: false
  })

  const deviceRuntime = reactive({
    ventilation: 0,
    shading: 0,
    sprinkler: 0,
    lighting: 0,
    heater: 0,
    co2Injector: 0
  })

  const energyConsumption = reactive({
    ventilation: 0,
    shading: 0,
    sprinkler: 0,
    lighting: 0,
    heater: 0,
    co2Injector: 0
  })

  const selectedCrop = computed(() => {
    return crops.find(c => c.id === selectedCropId.value) || crops[0]
  })

  const totalEnergy = computed(() => {
    return Object.values(energyConsumption).reduce((sum, val) => sum + val, 0)
  })

  const totalRuntime = computed(() => {
    return Object.values(deviceRuntime).reduce((sum, val) => sum + val, 0)
  })

  const environmentStatus = computed(() => {
    const status = {}
    const params = ['temperature', 'humidity', 'light', 'co2']
    
    params.forEach(param => {
      const value = environment[param]
      const threshold = thresholds[param]
      if (value < threshold.min) {
        status[param] = 'low'
      } else if (value > threshold.max) {
        status[param] = 'high'
      } else {
        status[param] = 'normal'
      }
    })
    
    return status
  })

  const activeDevices = computed(() => {
    return Object.entries(deviceStates)
      .filter(([_, active]) => active)
      .map(([id]) => devices[id])
  })

  function applyCropThresholds() {
    const crop = selectedCrop.value
    if (crop) {
      thresholds.temperature.min = crop.optimal.temperature.min
      thresholds.temperature.max = crop.optimal.temperature.max
      thresholds.humidity.min = crop.optimal.humidity.min
      thresholds.humidity.max = crop.optimal.humidity.max
      thresholds.light.min = crop.optimal.light.min
      thresholds.light.max = crop.optimal.light.max
      thresholds.co2.min = crop.optimal.co2.min
      thresholds.co2.max = crop.optimal.co2.max
    }
  }

  function controlDevices() {
    const { temperature, humidity, light, co2 } = environment
    const { temperature: tempTh, humidity: humTh, light: lightTh, co2: co2Th } = thresholds

    if (temperature > tempTh.max + 1) {
      deviceStates.ventilation = true
      if (temperature > tempTh.max + 3) {
        deviceStates.shading = true
        deviceStates.sprinkler = true
      }
    } else if (temperature < tempTh.min - 1) {
      deviceStates.heater = true
      deviceStates.ventilation = false
    } else {
      if (temperature <= tempTh.max) deviceStates.ventilation = false
      if (temperature <= tempTh.max - 1) deviceStates.shading = false
      if (temperature >= tempTh.min) deviceStates.heater = false
      if (temperature >= tempTh.min + 1) deviceStates.sprinkler = false
    }

    if (humidity > humTh.max + 5) {
      deviceStates.ventilation = true
    } else if (humidity < humTh.min - 5) {
      deviceStates.sprinkler = true
      deviceStates.ventilation = false
    } else {
      if (humidity <= humTh.max && !deviceStates.heater) deviceStates.sprinkler = false
    }

    if (light < lightTh.min - 100) {
      deviceStates.lighting = true
      deviceStates.shading = false
    } else if (light > lightTh.max + 100) {
      deviceStates.shading = true
      deviceStates.lighting = false
    } else {
      if (light >= lightTh.min) deviceStates.lighting = false
      if (light <= lightTh.max) deviceStates.shading = false
    }

    if (co2 < co2Th.min - 50) {
      deviceStates.co2Injector = true
    } else if (co2 > co2Th.max + 50) {
      deviceStates.co2Injector = false
      deviceStates.ventilation = true
    } else {
      if (co2 >= co2Th.min) deviceStates.co2Injector = false
    }
  }

  function updateEnvironment() {
    Object.keys(deviceStates).forEach(deviceId => {
      if (deviceStates[deviceId]) {
        const device = devices[deviceId]
        Object.keys(device.effect).forEach(param => {
          environment[param] += device.effect[param] * 0.1 * simulationSpeed.value
        })
      }
    })

    environment.temperature += (Math.random() - 0.5) * 0.2 * simulationSpeed.value
    environment.humidity += (Math.random() - 0.5) * 0.5 * simulationSpeed.value
    environment.light += (Math.random() - 0.5) * 10 * simulationSpeed.value
    environment.co2 += (Math.random() - 0.5) * 5 * simulationSpeed.value

    environment.temperature = Math.max(-10, Math.min(50, environment.temperature))
    environment.humidity = Math.max(0, Math.min(100, environment.humidity))
    environment.light = Math.max(0, Math.min(2000, environment.light))
    environment.co2 = Math.max(100, Math.min(2000, environment.co2))
  }

  function updateStats() {
    runTime.value += simulationSpeed.value
    Object.keys(deviceStates).forEach(deviceId => {
      if (deviceStates[deviceId]) {
        deviceRuntime[deviceId] += simulationSpeed.value
        energyConsumption[deviceId] += devices[deviceId].power * simulationSpeed.value / 3600
      }
    })
  }

  let simulationInterval = null

  function startSimulation() {
    if (simulationInterval) return
    isRunning.value = true
    simulationInterval = setInterval(() => {
      controlDevices()
      updateEnvironment()
      updateStats()
    }, 1000)
  }

  function stopSimulation() {
    isRunning.value = false
    if (simulationInterval) {
      clearInterval(simulationInterval)
      simulationInterval = null
    }
  }

  function resetSimulation() {
    stopSimulation()
    runTime.value = 0
    environment.temperature = 22
    environment.humidity = 60
    environment.light = 800
    environment.co2 = 500
    Object.keys(deviceStates).forEach(key => {
      deviceStates[key] = false
      deviceRuntime[key] = 0
      energyConsumption[key] = 0
    })
  }

  function formatRuntime(seconds) {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = Math.floor(seconds % 60)
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  watch(selectedCropId, () => {
    applyCropThresholds()
  })

  applyCropThresholds()

  return {
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
  }
}
