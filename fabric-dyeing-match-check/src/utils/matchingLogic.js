import { fabrics, dyeFabricConflicts } from '../data/fabrics'
import { dyes, mordants } from '../data/dyes'

export function getFabricById(id) {
  return fabrics.find(f => f.id === id)
}

export function getDyeById(id) {
  return dyes.find(d => d.id === id)
}

export function getSuitableDyesForFabric(fabricId) {
  const fabric = getFabricById(fabricId)
  if (!fabric) return []
  
  const conflicts = dyeFabricConflicts[fabricId] || []
  
  return dyes.filter(dye => {
    const isSuitable = fabric.suitableDyes.includes(dye.id)
    const hasConflict = conflicts.includes(dye.id)
    return isSuitable && !hasConflict
  })
}

export function getSuitableFabricsForDye(dyeId) {
  const dye = getDyeById(dyeId)
  if (!dye) return []
  
  return fabrics.filter(fabric => {
    const conflicts = dyeFabricConflicts[fabric.id] || []
    const isSuitable = dye.suitableFabrics.includes(fabric.id)
    const hasConflict = conflicts.includes(dyeId)
    return isSuitable && !hasConflict
  })
}

export function checkCompatibility(fabricId, dyeId) {
  const fabric = getFabricById(fabricId)
  const dye = getDyeById(dyeId)
  
  if (!fabric || !dye) {
    return { compatible: false, reason: '未找到面料或染料信息' }
  }
  
  const conflicts = dyeFabricConflicts[fabricId] || []
  if (conflicts.includes(dyeId)) {
    return { 
      compatible: false, 
      reason: `${fabric.name}与${dye.name}存在已知冲突，不建议配伍使用` 
    }
  }
  
  const fabricSuitable = fabric.suitableDyes.includes(dyeId)
  const dyeSuitable = dye.suitableFabrics.includes(fabricId)
  
  if (!fabricSuitable || !dyeSuitable) {
    return { 
      compatible: false, 
      reason: `${fabric.name}与${dye.name}不在彼此的推荐配伍列表中，染色效果可能不理想` 
    }
  }
  
  return { compatible: true, reason: '配伍相容，可以进行染色' }
}

export function getDyeingParameters(fabricId, dyeId) {
  const fabric = getFabricById(fabricId)
  const dye = getDyeById(dyeId)
  
  if (!fabric || !dye) return null
  
  const suitableMordants = mordants.filter(m => m.suitableFor.includes(dyeId))
  
  const maxTemp = Math.min(dye.temperature[1], fabric.maxTemperature)
  const minTemp = Math.min(dye.temperature[0], maxTemp)
  
  return {
    temperature: {
      min: minTemp,
      max: maxTemp,
      optimal: Math.round((minTemp + maxTemp) / 2),
      unit: '°C',
    },
    duration: {
      min: dye.duration[0],
      max: dye.duration[1],
      optimal: Math.round((dye.duration[0] + dye.duration[1]) / 2),
      unit: '分钟',
    },
    ph: dye.ph,
    fixative: dye.fixative,
    suitableMordants,
    pretreatment: fabric.pretreatment,
    note: dye.note || fabric.note,
    lightFastness: dye.lightFastness,
    washFastness: dye.washFastness,
  }
}

export function getDyeingProcess(fabricId, dyeId) {
  const fabric = getFabricById(fabricId)
  const dye = getDyeById(dyeId)
  const params = getDyeingParameters(fabricId, dyeId)
  
  if (!fabric || !dye || !params) return []
  
  const process = [
    {
      step: 1,
      name: '前处理',
      description: fabric.pretreatment,
      details: '去除面料上的浆料、油脂和杂质，确保染色均匀',
      time: '30-60分钟',
    },
    {
      step: 2,
      name: '染液制备',
      description: `使用${dye.extractionMethod}提取${dye.name}染料`,
      details: `染料来源：${dye.source}。根据所需颜色深浅调整染料浓度`,
      time: '30-60分钟',
    },
    {
      step: 3,
      name: '媒染处理（如需）',
      description: params.suitableMordants.length > 0 
        ? `可选用：${params.suitableMordants.map(m => m.name).join('、')}`
        : '此染料无需媒染剂',
      details: params.suitableMordants.length > 0 
        ? params.suitableMordants.map(m => `${m.name}：${m.effect}`).join('；')
        : '该染料可直接染色，无需媒染预处理',
      time: '20-40分钟',
    },
    {
      step: 4,
      name: '染色',
      description: `将面料放入染液中，温度控制在${params.temperature.min}-${params.temperature.max}°C`,
      details: `染色时间：${params.duration.min}-${params.duration.max}分钟。保持染液pH值在${params.ph}范围内。染色过程中需经常翻动面料，确保染色均匀`,
      time: `${params.duration.min}-${params.duration.max}分钟`,
    },
    {
      step: 5,
      name: '氧化显色',
      description: dye.id === 'indigo' ? '将染好的面料取出，在空气中氧化15-30分钟' : '如需氧化显色，将面料暴露在空气中',
      details: dye.id === 'indigo' ? '靛蓝染色需多次浸染氧化，每次浸染后氧化，重复3-5次以加深颜色' : '大部分天然染料染色后无需特殊氧化',
      time: dye.id === 'indigo' ? '15-30分钟/次' : '5-10分钟',
    },
    {
      step: 6,
      name: '水洗',
      description: '用清水反复冲洗，直至冲洗水清澈无染料颜色',
      details: '先用温水冲洗，再用冷水冲洗。避免使用碱性洗涤剂',
      time: '10-20分钟',
    },
    {
      step: 7,
      name: '固色处理',
      description: params.fixative !== '无需媒染剂' ? `使用${params.fixative}进行固色` : '可选择使用单宁类物质进行后固色处理',
      details: '固色可以提高染色牢度，减少后续洗涤时的褪色',
      time: '20-30分钟',
    },
    {
      step: 8,
      name: '干燥',
      description: '在阴凉通风处悬挂晾干，避免阳光直射',
      details: '阳光直射可能导致颜色褪色。建议阴干后再进行熨烫定型',
      time: '2-4小时',
    },
  ]
  
  return process
}

export function getConflictInfo(fabricId, dyeId) {
  const conflicts = dyeFabricConflicts[fabricId] || []
  if (conflicts.includes(dyeId)) {
    const dye = getDyeById(dyeId)
    const fabric = getFabricById(fabricId)
    return {
      hasConflict: true,
      message: `警告：${fabric?.name || fabricId}与${dye?.name || dyeId}存在配伍冲突，不建议一起使用`,
    }
  }
  return { hasConflict: false, message: '' }
}
