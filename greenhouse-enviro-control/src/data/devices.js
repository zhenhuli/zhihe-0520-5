export const devices = {
  ventilation: {
    id: 'ventilation',
    name: '通风系统',
    icon: '🌀',
    power: 2.5,
    unit: 'kW',
    effect: {
      temperature: -3,
      humidity: -10
    }
  },
  shading: {
    id: 'shading',
    name: '遮阳系统',
    icon: '⛱️',
    power: 0.8,
    unit: 'kW',
    effect: {
      temperature: -2,
      light: -400
    }
  },
  sprinkler: {
    id: 'sprinkler',
    name: '喷淋系统',
    icon: '💧',
    power: 1.5,
    unit: 'kW',
    effect: {
      temperature: -4,
      humidity: 20
    }
  },
  lighting: {
    id: 'lighting',
    name: '补光系统',
    icon: '💡',
    power: 3.0,
    unit: 'kW',
    effect: {
      light: 600,
      temperature: 1
    }
  },
  heater: {
    id: 'heater',
    name: '加热系统',
    icon: '🔥',
    power: 5.0,
    unit: 'kW',
    effect: {
      temperature: 5,
      humidity: -5
    }
  },
  co2Injector: {
    id: 'co2Injector',
    name: 'CO2发生器',
    icon: '🌫️',
    power: 0.5,
    unit: 'kW',
    effect: {
      co2: 300
    }
  }
}

export const deviceList = Object.values(devices)
