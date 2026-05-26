export const TERRAIN_OPTIONS = [
  { value: 'easy', label: '简单（铺装路面/平坦土路）', factor: 1.0 },
  { value: 'medium', label: '中等（混合路面/缓坡）', factor: 1.15 },
  { value: 'hard', label: '困难（山地小径/陡坡）', factor: 1.35 },
  { value: 'extreme', label: '极限（高海拔/技术地形）', factor: 1.6 }
]

export const WEATHER_OPTIONS = [
  { value: 'sunny', label: '晴朗（微风）', factor: 1.0 },
  { value: 'cloudy', label: '多云/阴天', factor: 1.03 },
  { value: 'rain', label: '小雨/中雨', factor: 1.1 },
  { value: 'heavy_rain', label: '大雨/雷暴', factor: 1.2 },
  { value: 'snow', label: '积雪/低温', factor: 1.25 },
  { value: 'extreme', label: '极端（高温>35℃/低温<-10℃）', factor: 1.35 }
]

export const RACE_DISTANCES = [
  { value: 10, label: '10公里' },
  { value: 21, label: '半程马拉松（21公里）' },
  { value: 42, label: '全程马拉松（42公里）' },
  { value: 50, label: '50公里越野' },
  { value: 100, label: '100公里越野' },
  { value: 168, label: '168公里超级越野' }
]

export const ATHLETE_LEVELS = [
  { min: 95, label: '国际级精英', desc: '具备国际赛事竞争实力，成绩接近世界纪录水准', color: '#e74c3c' },
  { min: 90, label: '国家级精英', desc: '国家级运动员水平，可在国内顶级赛事中获得名次', color: '#e67e22' },
  { min: 85, label: '专业级', desc: '专业运动员水平，具备系统训练和参赛能力', color: '#f1c40f' },
  { min: 80, label: '高级业余', desc: '资深越野跑者，经验丰富，成绩优秀', color: '#2ecc71' },
  { min: 75, label: '中级业余', desc: '具备一定基础，可完成中等难度赛事', color: '#3498db' },
  { min: 70, label: '初级业余', desc: '入门水平，需加强训练提升基础能力', color: '#9b59b6' },
  { min: 0, label: '入门级', desc: '刚刚接触越野跑，建议从短距离赛事开始', color: '#95a5a6' }
]

export function getOptionByValue(options, value) {
  return options.find(o => o.value === value) || options[0]
}

export function calculateElevationFactor(elevation, distance) {
  const avgGradient = distance > 0 ? (elevation / (distance * 1000)) * 100 : 0
  if (avgGradient <= 1) return 1.0
  if (avgGradient <= 3) return 1.05
  if (avgGradient <= 5) return 1.12
  if (avgGradient <= 8) return 1.22
  if (avgGradient <= 12) return 1.35
  return 1.5
}

export function calculateStandardTime(distance, elevation, terrain, weather) {
  const terrainOpt = getOptionByValue(TERRAIN_OPTIONS, terrain)
  const weatherOpt = getOptionByValue(WEATHER_OPTIONS, weather)
  const elevationFactor = calculateElevationFactor(elevation, distance)
  const basePace = 6
  const baseTime = distance * basePace * 60
  const standardTime = baseTime * elevationFactor * terrainOpt.factor * weatherOpt.factor
  return Math.round(standardTime)
}

export function calculateScore(actualTime, standardTime) {
  if (actualTime <= 0 || standardTime <= 0) return 0
  const ratio = standardTime / actualTime
  const score = Math.min(100, Math.max(0, ratio * 100))
  return Math.round(score * 10) / 10
}

export function getAthleteLevel(score) {
  for (const level of ATHLETE_LEVELS) {
    if (score >= level.min) return level
  }
  return ATHLETE_LEVELS[ATHLETE_LEVELS.length - 1]
}

export function formatTime(seconds) {
  if (!seconds || seconds <= 0) return '00:00:00'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = Math.floor(seconds % 60)
  return [h, m, s].map(v => String(v).padStart(2, '0')).join(':')
}

export function parseTime(timeStr) {
  if (!timeStr) return 0
  const parts = timeStr.split(':')
  if (parts.length === 3) {
    const [h, m, s] = parts.map(Number)
    return h * 3600 + m * 60 + s
  }
  if (parts.length === 2) {
    const [m, s] = parts.map(Number)
    return m * 60 + s
  }
  return Number(timeStr) || 0
}

export function generateAnalysis(result) {
  const { score, level, distance, elevation, terrain, weather, actualTime, standardTime } = result
  const timeDiff = actualTime - standardTime
  const pace = distance > 0 ? (actualTime / distance / 60).toFixed(2) : '0.00'

  const analysis = {
    overall: '',
    strengths: [],
    weaknesses: [],
    suggestions: []
  }

  if (score >= 90) {
    analysis.overall = '您展现了顶级越野跑运动员的竞技水平，在各项条件下都能保持出色的配速控制和体能分配。'
  } else if (score >= 80) {
    analysis.overall = '您的越野跑能力处于较高水平，具备挑战高难度赛事的实力，个别方面仍有提升空间。'
  } else if (score >= 70) {
    analysis.overall = '您的基础能力扎实，能够完成各类越野赛事，但在极端条件下还有较大提升潜力。'
  } else {
    analysis.overall = '您正处于越野跑的成长期，建议从短距离赛事入手，逐步积累经验和提升能力。'
  }

  if (elevation < 500) {
    analysis.strengths.push('低海拔适应能力良好，可考虑挑战更高海拔赛事')
  } else if (elevation < 2000) {
    analysis.strengths.push('中海拔赛事表现稳定，有氧基础扎实')
  } else {
    analysis.strengths.push('高海拔耐受能力出色，具备高原赛事竞争力')
  }

  if (weather === 'sunny' || weather === 'cloudy') {
    analysis.weaknesses.push('缺乏恶劣天气下的比赛经验，建议增加雨战/雪战训练')
  } else {
    analysis.strengths.push('具备恶劣天气下的实战经验，心理素质过硬')
  }

  if (terrain === 'easy' || terrain === 'medium') {
    analysis.weaknesses.push('技术地形经验不足，建议增加山地跑和技术路段训练')
  } else {
    analysis.strengths.push('技术地形处理能力强，擅长复杂路况')
  }

  if (score < 90) {
    analysis.suggestions.push('加强间歇跑和乳酸阈值训练，提高绝对速度')
  }
  if (elevation < 1000) {
    analysis.suggestions.push('增加爬升训练，模拟比赛的海拔变化')
  }
  if (score < 75) {
    analysis.suggestions.push('每周增加1-2次长距离慢跑，提升有氧耐力基础')
    analysis.suggestions.push('注重核心和下肢力量训练，改善跑步经济性')
  }
  if (score >= 80 && score < 90) {
    analysis.suggestions.push('尝试参加更高级别赛事，积累大赛经验')
    analysis.suggestions.push('精细化配速策略，减少比赛中的体能波动')
  }

  return {
    ...analysis,
    pace,
    timeDiff: Math.abs(timeDiff),
    timeDiffLabel: timeDiff < 0 ? '快于' : timeDiff > 0 ? '慢于' : '等于'
  }
}
