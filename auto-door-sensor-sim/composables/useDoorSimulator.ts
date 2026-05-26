import { ref, computed } from 'vue'

export type DoorState = 'closed' | 'opening' | 'open' | 'closing' | 'rebounding'
export type SensorType = 'infrared' | 'microwave' | 'both'

export function useDoorSimulator() {
  const doorState = ref<DoorState>('closed')
  const doorOpenPercentage = ref(0)
  const isInfraredDetected = ref(false)
  const isMicrowaveDetected = ref(false)
  const isObstacleDetected = ref(false)
  const isAccessEnabled = ref(true)
  const accessLog = ref<Array<{ time: string; event: string; type: string }>>([])

  const config = ref({
    infraredDistance: 150,
    microwaveDistance: 300,
    openDelay: 0.5,
    openDuration: 3,
    closeDelay: 2,
    closeBuffer: 0.3,
    openSpeed: 1,
    closeSpeed: 0.8,
    reboundDistance: 30,
    sensorType: 'both' as SensorType
  })

  let animationFrame: number | null = null
  let stateTimer: ReturnType<typeof setTimeout> | null = null

  const isSensorDetected = computed(() => {
    switch (config.value.sensorType) {
      case 'infrared':
        return isInfraredDetected.value
      case 'microwave':
        return isMicrowaveDetected.value
      case 'both':
        return isInfraredDetected.value || isMicrowaveDetected.value
    }
  })

  const canOpen = computed(() => isAccessEnabled.value && isSensorDetected.value)

  function addLog(event: string, type: string) {
    const time = new Date().toLocaleTimeString()
    accessLog.value.unshift({ time, event, type })
    if (accessLog.value.length > 50) {
      accessLog.value.pop()
    }
  }

  function clearTimers() {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
      animationFrame = null
    }
    if (stateTimer) {
      clearTimeout(stateTimer)
      stateTimer = null
    }
  }

  function openDoor() {
    if (doorState.value === 'opening' || doorState.value === 'open') return
    
    clearTimers()
    doorState.value = 'opening'
    addLog('开始开门', 'action')

    const animate = () => {
      if (doorOpenPercentage.value < 100) {
        doorOpenPercentage.value = Math.min(100, doorOpenPercentage.value + config.value.openSpeed * 2)
        animationFrame = requestAnimationFrame(animate)
      } else {
        doorState.value = 'open'
        addLog('门已完全打开', 'state')
        scheduleClose()
      }
    }
    animate()
  }

  function scheduleClose() {
    if (stateTimer) clearTimeout(stateTimer)
    stateTimer = setTimeout(() => {
      if (!isSensorDetected.value && !isObstacleDetected.value) {
        closeDoor()
      } else {
        scheduleClose()
      }
    }, config.value.closeDelay * 1000)
  }

  function closeDoor() {
    if (doorState.value === 'closing' || doorState.value === 'closed') return
    
    clearTimers()
    doorState.value = 'closing'
    addLog('开始关门', 'action')

    const animate = () => {
      if (isObstacleDetected.value) {
        reboundDoor()
        return
      }
      
      if (isSensorDetected.value) {
        openDoor()
        return
      }

      if (doorOpenPercentage.value > 0) {
        doorOpenPercentage.value = Math.max(0, doorOpenPercentage.value - config.value.closeSpeed * 2)
        animationFrame = requestAnimationFrame(animate)
      } else {
        doorState.value = 'closed'
        addLog('门已完全关闭', 'state')
      }
    }
    animate()
  }

  function reboundDoor() {
    clearTimers()
    doorState.value = 'rebounding'
    addLog('检测到障碍物，门回弹', 'safety')

    const animate = () => {
      if (doorOpenPercentage.value < config.value.reboundDistance) {
        doorOpenPercentage.value = Math.min(config.value.reboundDistance, doorOpenPercentage.value + 3)
        animationFrame = requestAnimationFrame(animate)
      } else {
        setTimeout(() => {
          isObstacleDetected.value = false
          closeDoor()
        }, config.value.closeBuffer * 1000)
      }
    }
    animate()
  }

  function triggerInfrared(detected: boolean) {
    isInfraredDetected.value = detected
    if (detected) {
      addLog('红外传感器检测到物体', 'sensor')
      if (canOpen.value) {
        openDoor()
      }
    }
  }

  function triggerMicrowave(detected: boolean) {
    isMicrowaveDetected.value = detected
    if (detected) {
      addLog('微波传感器检测到运动', 'sensor')
      if (canOpen.value) {
        openDoor()
      }
    }
  }

  function triggerObstacle(detected: boolean) {
    isObstacleDetected.value = detected
    if (detected && doorState.value === 'closing') {
      reboundDoor()
    }
  }

  function toggleAccess(enabled: boolean) {
    isAccessEnabled.value = enabled
    addLog(enabled ? '门禁已启用' : '门禁已禁用', 'access')
    if (!enabled && (doorState.value === 'open' || doorState.value === 'opening')) {
      closeDoor()
    }
  }

  function reset() {
    clearTimers()
    doorState.value = 'closed'
    doorOpenPercentage.value = 0
    isInfraredDetected.value = false
    isMicrowaveDetected.value = false
    isObstacleDetected.value = false
    isAccessEnabled.value = true
    accessLog.value = []
  }

  return {
    doorState,
    doorOpenPercentage,
    isInfraredDetected,
    isMicrowaveDetected,
    isObstacleDetected,
    isAccessEnabled,
    accessLog,
    config,
    isSensorDetected,
    canOpen,
    triggerInfrared,
    triggerMicrowave,
    triggerObstacle,
    toggleAccess,
    reset
  }
}
