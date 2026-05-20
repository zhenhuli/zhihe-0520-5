export const standingPose = {
  name: '站立',
  joints: [
    { id: 1, name: '头部', x: 400, y: 120, rotation: 0, parentId: null },
    { id: 2, name: '颈部', x: 400, y: 160, rotation: 0, parentId: 1 },
    { id: 3, name: '胸部', x: 400, y: 220, rotation: 0, parentId: 2 },
    { id: 4, name: '左肩', x: 340, y: 200, rotation: 0, parentId: 3 },
    { id: 5, name: '左肘', x: 300, y: 280, rotation: 0, parentId: 4 },
    { id: 6, name: '左手', x: 290, y: 350, rotation: 0, parentId: 5 },
    { id: 7, name: '右肩', x: 460, y: 200, rotation: 0, parentId: 3 },
    { id: 8, name: '右肘', x: 500, y: 280, rotation: 0, parentId: 7 },
    { id: 9, name: '右手', x: 510, y: 350, rotation: 0, parentId: 8 },
    { id: 10, name: '腰部', x: 400, y: 300, rotation: 0, parentId: 3 },
    { id: 11, name: '左胯', x: 360, y: 320, rotation: 0, parentId: 10 },
    { id: 12, name: '左膝', x: 360, y: 420, rotation: 0, parentId: 11 },
    { id: 13, name: '左脚', x: 350, y: 520, rotation: 0, parentId: 12 },
    { id: 14, name: '右胯', x: 440, y: 320, rotation: 0, parentId: 10 },
    { id: 15, name: '右膝', x: 440, y: 420, rotation: 0, parentId: 14 },
    { id: 16, name: '右脚', x: 450, y: 520, rotation: 0, parentId: 15 }
  ],
  bones: [
    { parentId: 1, childId: 2, name: '颈部骨骼' },
    { parentId: 2, childId: 3, name: '脊柱上' },
    { parentId: 3, childId: 4, name: '左锁骨' },
    { parentId: 4, childId: 5, name: '左上臂' },
    { parentId: 5, childId: 6, name: '左前臂' },
    { parentId: 3, childId: 7, name: '右锁骨' },
    { parentId: 7, childId: 8, name: '右上臂' },
    { parentId: 8, childId: 9, name: '右前臂' },
    { parentId: 3, childId: 10, name: '脊柱下' },
    { parentId: 10, childId: 11, name: '左髋骨' },
    { parentId: 11, childId: 12, name: '左大腿' },
    { parentId: 12, childId: 13, name: '左小腿' },
    { parentId: 10, childId: 14, name: '右髋骨' },
    { parentId: 14, childId: 15, name: '右大腿' },
    { parentId: 15, childId: 16, name: '右小腿' }
  ]
}

export const runningPose = {
  name: '跑动',
  joints: [
    { id: 1, name: '头部', x: 400, y: 100, rotation: -5, parentId: null },
    { id: 2, name: '颈部', x: 400, y: 140, rotation: 0, parentId: 1 },
    { id: 3, name: '胸部', x: 390, y: 200, rotation: -10, parentId: 2 },
    { id: 4, name: '左肩', x: 320, y: 180, rotation: -45, parentId: 3 },
    { id: 5, name: '左肘', x: 260, y: 220, rotation: -90, parentId: 4 },
    { id: 6, name: '左手', x: 240, y: 280, rotation: -120, parentId: 5 },
    { id: 7, name: '右肩', x: 460, y: 190, rotation: 30, parentId: 3 },
    { id: 8, name: '右肘', x: 520, y: 250, rotation: 60, parentId: 7 },
    { id: 9, name: '右手', x: 540, y: 320, rotation: 45, parentId: 8 },
    { id: 10, name: '腰部', x: 400, y: 280, rotation: 5, parentId: 3 },
    { id: 11, name: '左胯', x: 350, y: 300, rotation: 60, parentId: 10 },
    { id: 12, name: '左膝', x: 380, y: 400, rotation: 90, parentId: 11 },
    { id: 13, name: '左脚', x: 400, y: 480, rotation: 80, parentId: 12 },
    { id: 14, name: '右胯', x: 450, y: 300, rotation: -30, parentId: 10 },
    { id: 15, name: '右膝', x: 420, y: 400, rotation: -60, parentId: 14 },
    { id: 16, name: '右脚', x: 380, y: 520, rotation: -85, parentId: 15 }
  ],
  bones: [
    { parentId: 1, childId: 2, name: '颈部骨骼' },
    { parentId: 2, childId: 3, name: '脊柱上' },
    { parentId: 3, childId: 4, name: '左锁骨' },
    { parentId: 4, childId: 5, name: '左上臂' },
    { parentId: 5, childId: 6, name: '左前臂' },
    { parentId: 3, childId: 7, name: '右锁骨' },
    { parentId: 7, childId: 8, name: '右上臂' },
    { parentId: 8, childId: 9, name: '右前臂' },
    { parentId: 3, childId: 10, name: '脊柱下' },
    { parentId: 10, childId: 11, name: '左髋骨' },
    { parentId: 11, childId: 12, name: '左大腿' },
    { parentId: 12, childId: 13, name: '左小腿' },
    { parentId: 10, childId: 14, name: '右髋骨' },
    { parentId: 14, childId: 15, name: '右大腿' },
    { parentId: 15, childId: 16, name: '右小腿' }
  ]
}

export const bendingPose = {
  name: '弯腰',
  joints: [
    { id: 1, name: '头部', x: 300, y: 180, rotation: -45, parentId: null },
    { id: 2, name: '颈部', x: 320, y: 210, rotation: -40, parentId: 1 },
    { id: 3, name: '胸部', x: 350, y: 260, rotation: -50, parentId: 2 },
    { id: 4, name: '左肩', x: 290, y: 280, rotation: -30, parentId: 3 },
    { id: 5, name: '左肘', x: 250, y: 360, rotation: -60, parentId: 4 },
    { id: 6, name: '左手', x: 240, y: 430, rotation: -90, parentId: 5 },
    { id: 7, name: '右肩', x: 400, y: 270, rotation: -20, parentId: 3 },
    { id: 8, name: '右肘', x: 380, y: 350, rotation: -50, parentId: 7 },
    { id: 9, name: '右手', x: 380, y: 420, rotation: -80, parentId: 8 },
    { id: 10, name: '腰部', x: 420, y: 320, rotation: -30, parentId: 3 },
    { id: 11, name: '左胯', x: 390, y: 350, rotation: 30, parentId: 10 },
    { id: 12, name: '左膝', x: 380, y: 440, rotation: 60, parentId: 11 },
    { id: 13, name: '左脚', x: 370, y: 520, rotation: 85, parentId: 12 },
    { id: 14, name: '右胯', x: 460, y: 350, rotation: 30, parentId: 10 },
    { id: 15, name: '右膝', x: 460, y: 440, rotation: 60, parentId: 14 },
    { id: 16, name: '右脚', x: 470, y: 520, rotation: 85, parentId: 15 }
  ],
  bones: [
    { parentId: 1, childId: 2, name: '颈部骨骼' },
    { parentId: 2, childId: 3, name: '脊柱上' },
    { parentId: 3, childId: 4, name: '左锁骨' },
    { parentId: 4, childId: 5, name: '左上臂' },
    { parentId: 5, childId: 6, name: '左前臂' },
    { parentId: 3, childId: 7, name: '右锁骨' },
    { parentId: 7, childId: 8, name: '右上臂' },
    { parentId: 8, childId: 9, name: '右前臂' },
    { parentId: 3, childId: 10, name: '脊柱下' },
    { parentId: 10, childId: 11, name: '左髋骨' },
    { parentId: 11, childId: 12, name: '左大腿' },
    { parentId: 12, childId: 13, name: '左小腿' },
    { parentId: 10, childId: 14, name: '右髋骨' },
    { parentId: 14, childId: 15, name: '右大腿' },
    { parentId: 15, childId: 16, name: '右小腿' }
  ]
}

export const walkCycleFrames = [
  {
    joints: [
      { id: 1, x: 400, y: 100, rotation: 0 },
      { id: 2, x: 400, y: 140, rotation: 0 },
      { id: 3, x: 400, y: 200, rotation: 0 },
      { id: 4, x: 340, y: 180, rotation: 20 },
      { id: 5, x: 320, y: 260, rotation: 40 },
      { id: 6, x: 310, y: 330, rotation: 60 },
      { id: 7, x: 460, y: 180, rotation: -20 },
      { id: 8, x: 480, y: 260, rotation: -40 },
      { id: 9, x: 490, y: 330, rotation: -60 },
      { id: 10, x: 400, y: 280, rotation: 0 },
      { id: 11, x: 360, y: 300, rotation: -30 },
      { id: 12, x: 340, y: 400, rotation: -60 },
      { id: 13, x: 330, y: 500, rotation: -85 },
      { id: 14, x: 440, y: 300, rotation: 30 },
      { id: 15, x: 460, y: 400, rotation: 60 },
      { id: 16, x: 470, y: 480, rotation: 80 }
    ]
  },
  {
    joints: [
      { id: 1, x: 400, y: 98, rotation: 0 },
      { id: 2, x: 400, y: 138, rotation: 0 },
      { id: 3, x: 400, y: 198, rotation: 0 },
      { id: 4, x: 340, y: 178, rotation: 10 },
      { id: 5, x: 330, y: 255, rotation: 25 },
      { id: 6, x: 325, y: 325, rotation: 45 },
      { id: 7, x: 460, y: 178, rotation: -10 },
      { id: 8, x: 470, y: 255, rotation: -25 },
      { id: 9, x: 475, y: 325, rotation: -45 },
      { id: 10, x: 400, y: 278, rotation: 0 },
      { id: 11, x: 360, y: 298, rotation: -15 },
      { id: 12, x: 355, y: 395, rotation: -40 },
      { id: 13, x: 365, y: 490, rotation: -70 },
      { id: 14, x: 440, y: 298, rotation: 15 },
      { id: 15, x: 445, y: 395, rotation: 40 },
      { id: 16, x: 435, y: 490, rotation: 70 }
    ]
  },
  {
    joints: [
      { id: 1, x: 400, y: 100, rotation: 0 },
      { id: 2, x: 400, y: 140, rotation: 0 },
      { id: 3, x: 400, y: 200, rotation: 0 },
      { id: 4, x: 340, y: 180, rotation: 0 },
      { id: 5, x: 340, y: 260, rotation: 10 },
      { id: 6, x: 340, y: 330, rotation: 30 },
      { id: 7, x: 460, y: 180, rotation: 0 },
      { id: 8, x: 460, y: 260, rotation: -10 },
      { id: 9, x: 460, y: 330, rotation: -30 },
      { id: 10, x: 400, y: 280, rotation: 0 },
      { id: 11, x: 360, y: 300, rotation: 0 },
      { id: 12, x: 360, y: 400, rotation: 10 },
      { id: 13, x: 360, y: 495, rotation: 50 },
      { id: 14, x: 440, y: 300, rotation: 0 },
      { id: 15, x: 440, y: 400, rotation: -10 },
      { id: 16, x: 440, y: 495, rotation: -50 }
    ]
  },
  {
    joints: [
      { id: 1, x: 400, y: 98, rotation: 0 },
      { id: 2, x: 400, y: 138, rotation: 0 },
      { id: 3, x: 400, y: 198, rotation: 0 },
      { id: 4, x: 340, y: 178, rotation: -10 },
      { id: 5, x: 350, y: 255, rotation: -5 },
      { id: 6, x: 355, y: 325, rotation: 15 },
      { id: 7, x: 460, y: 178, rotation: 10 },
      { id: 8, x: 450, y: 255, rotation: 5 },
      { id: 9, x: 445, y: 325, rotation: -15 },
      { id: 10, x: 400, y: 278, rotation: 0 },
      { id: 11, x: 360, y: 298, rotation: 15 },
      { id: 12, x: 365, y: 395, rotation: 40 },
      { id: 13, x: 355, y: 490, rotation: 70 },
      { id: 14, x: 440, y: 298, rotation: -15 },
      { id: 15, x: 435, y: 395, rotation: -40 },
      { id: 16, x: 445, y: 490, rotation: -70 }
    ]
  }
]

export function generateWalkAnimation(store, name = '走路循环') {
  store.clearAll()
  
  walkCycleFrames[0].joints.forEach(j => {
    store.addJoint(j.x, j.y, standingPose.joints.find(sj => sj.id === j.id)?.name || `关节${j.id}`)
  })
  
  standingPose.bones.forEach(b => {
    store.addBone(b.parentId, b.childId, b.name)
  })
  
  walkCycleFrames.forEach((frame, index) => {
    frame.joints.forEach(j => {
      const joint = store.getJoint(j.id)
      if (joint) {
        joint.x = j.x
        joint.y = j.y
        joint.rotation = j.rotation
      }
    })
    store.saveAnimation(name)
  })
  
  store.loadAnimation(name)
}
