export const crops = [
  {
    id: 'tomato',
    name: '番茄',
    icon: '🍅',
    optimal: {
      temperature: { min: 18, max: 28, ideal: 24 },
      humidity: { min: 50, max: 75, ideal: 65 },
      light: { min: 800, max: 1200, ideal: 1000 },
      co2: { min: 400, max: 800, ideal: 600 }
    }
  },
  {
    id: 'cucumber',
    name: '黄瓜',
    icon: '🥒',
    optimal: {
      temperature: { min: 20, max: 30, ideal: 25 },
      humidity: { min: 60, max: 85, ideal: 75 },
      light: { min: 1000, max: 1500, ideal: 1200 },
      co2: { min: 500, max: 900, ideal: 700 }
    }
  },
  {
    id: 'strawberry',
    name: '草莓',
    icon: '🍓',
    optimal: {
      temperature: { min: 15, max: 25, ideal: 20 },
      humidity: { min: 60, max: 80, ideal: 70 },
      light: { min: 600, max: 1000, ideal: 800 },
      co2: { min: 400, max: 700, ideal: 550 }
    }
  },
  {
    id: 'lettuce',
    name: '生菜',
    icon: '🥬',
    optimal: {
      temperature: { min: 12, max: 22, ideal: 18 },
      humidity: { min: 55, max: 75, ideal: 65 },
      light: { min: 400, max: 800, ideal: 600 },
      co2: { min: 350, max: 600, ideal: 450 }
    }
  },
  {
    id: 'pepper',
    name: '辣椒',
    icon: '🌶️',
    optimal: {
      temperature: { min: 20, max: 30, ideal: 25 },
      humidity: { min: 50, max: 70, ideal: 60 },
      light: { min: 1000, max: 1400, ideal: 1200 },
      co2: { min: 450, max: 800, ideal: 650 }
    }
  }
]
