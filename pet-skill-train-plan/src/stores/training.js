import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import dayjs from 'dayjs';

export const useTrainingStore = defineStore('training', () => {
  const skillCategories = [
    {
      id: 'toilet',
      name: '定点如厕',
      icon: '🚽',
      description: '训练宠物在指定地点排泄',
      difficulty: 'easy'
    },
    {
      id: 'heel',
      name: '随行',
      icon: '🦮',
      description: '训练宠物跟随主人行走',
      difficulty: 'medium'
    },
    {
      id: 'refuse_food',
      name: '拒食',
      icon: '🚫',
      description: '训练宠物拒绝陌生人的食物',
      difficulty: 'hard'
    },
    {
      id: 'sit',
      name: '坐下',
      icon: '🧘',
      description: '训练宠物听到指令后坐下',
      difficulty: 'easy'
    },
    {
      id: 'come',
      name: '召回',
      icon: '📢',
      description: '训练宠物听到呼唤后回到主人身边',
      difficulty: 'medium'
    },
    {
      id: 'shake_hand',
      name: '握手',
      icon: '🤝',
      description: '训练宠物与主人握手',
      difficulty: 'easy'
    },
    {
      id: 'quiet',
      name: '安静',
      icon: '🤫',
      description: '训练宠物在指令下保持安静',
      difficulty: 'medium'
    },
    {
      id: 'wait',
      name: '等待',
      icon: '⏳',
      description: '训练宠物在原地等待',
      difficulty: 'medium'
    }
  ];

  const trainingPhases = [
    { phase: 1, name: '基础认知', duration: 7, description: '建立指令与动作的关联' },
    { phase: 2, name: '动作巩固', duration: 7, description: '反复练习，形成条件反射' },
    { phase: 3, name: '环境适应', duration: 7, description: '在不同环境下保持动作稳定性' },
    { phase: 4, name: '抗干扰训练', duration: 7, description: '在有干扰的情况下完成动作' },
    { phase: 5, name: '技能精通', duration: 7, description: '动作标准、响应迅速' }
  ];

  const rewardTypes = [
    { id: 'food', name: '食物奖励', icon: '🍖' },
    { id: 'praise', name: '口头表扬', icon: '🗣️' },
    { id: 'play', name: '玩耍奖励', icon: '🎾' },
    { id: 'petting', name: '抚摸奖励', icon: '🤗' },
    { id: 'toys', name: '玩具奖励', icon: '🧸' }
  ];

  const trainingPlans = ref([
    {
      id: 1,
      petId: 1,
      skillId: 'toilet',
      name: '定点如厕训练计划',
      difficulty: 'easy',
      frequency: 5,
      frequencyUnit: 'times_per_day',
      duration: 10,
      durationUnit: 'minutes',
      startDate: '2024-05-01',
      endDate: '2024-06-04',
      currentPhase: 3,
      status: 'in_progress',
      rewardType: 'food',
      rewardAmount: '适量',
      description: '训练豆豆在阳台尿垫上排泄',
      dailyTasks: [
        { time: '07:00', completed: true, date: '2024-05-20' },
        { time: '12:00', completed: true, date: '2024-05-20' },
        { time: '18:00', completed: false, date: '2024-05-20' },
        { time: '22:00', completed: false, date: '2024-05-20' }
      ]
    },
    {
      id: 2,
      petId: 1,
      skillId: 'sit',
      name: '坐下训练计划',
      difficulty: 'easy',
      frequency: 3,
      frequencyUnit: 'times_per_day',
      duration: 5,
      durationUnit: 'minutes',
      startDate: '2024-05-10',
      endDate: '2024-06-13',
      currentPhase: 2,
      status: 'in_progress',
      rewardType: 'praise',
      rewardAmount: '热情表扬',
      description: '训练豆豆听到"坐下"指令后坐下',
      dailyTasks: [
        { time: '08:00', completed: true, date: '2024-05-20' },
        { time: '15:00', completed: false, date: '2024-05-20' },
        { time: '20:00', completed: false, date: '2024-05-20' }
      ]
    },
    {
      id: 3,
      petId: 1,
      skillId: 'heel',
      name: '随行训练计划',
      difficulty: 'medium',
      frequency: 2,
      frequencyUnit: 'times_per_day',
      duration: 15,
      durationUnit: 'minutes',
      startDate: '2024-05-15',
      endDate: '2024-07-17',
      currentPhase: 1,
      status: 'in_progress',
      rewardType: 'food',
      rewardAmount: '少量零食',
      description: '训练豆豆散步时跟随在主人身边',
      dailyTasks: [
        { time: '07:30', completed: true, date: '2024-05-20' },
        { time: '19:00', completed: false, date: '2024-05-20' }
      ]
    },
    {
      id: 4,
      petId: 2,
      skillId: 'sit',
      name: '坐下训练计划',
      difficulty: 'easy',
      frequency: 2,
      frequencyUnit: 'times_per_day',
      duration: 5,
      durationUnit: 'minutes',
      startDate: '2024-05-01',
      endDate: '2024-06-04',
      currentPhase: 4,
      status: 'in_progress',
      rewardType: 'food',
      rewardAmount: '猫粮少量',
      description: '训练咪咪听到指令后坐下',
      dailyTasks: [
        { time: '09:00', completed: true, date: '2024-05-20' },
        { time: '21:00', completed: false, date: '2024-05-20' }
      ]
    }
  ]);

  const trainingRecords = ref([
    {
      id: 1,
      planId: 1,
      petId: 1,
      skillId: 'toilet',
      date: '2024-05-20',
      time: '07:00',
      duration: 8,
      performance: 90,
      completed: true,
      responseTime: 3,
      accuracy: 'good',
      notes: '今天反应很快，一次就成功了',
      rewardGiven: true,
      rewardType: 'food'
    },
    {
      id: 2,
      planId: 1,
      petId: 1,
      skillId: 'toilet',
      date: '2024-05-20',
      time: '12:00',
      duration: 12,
      performance: 75,
      completed: true,
      responseTime: 8,
      accuracy: 'normal',
      notes: '有点分心，引导了几次才完成',
      rewardGiven: true,
      rewardType: 'praise'
    },
    {
      id: 3,
      planId: 2,
      petId: 1,
      skillId: 'sit',
      date: '2024-05-20',
      time: '08:00',
      duration: 5,
      performance: 95,
      completed: true,
      responseTime: 2,
      accuracy: 'excellent',
      notes: '非常棒，听到指令立刻坐下',
      rewardGiven: true,
      rewardType: 'praise'
    },
    {
      id: 4,
      planId: 3,
      petId: 1,
      skillId: 'heel',
      date: '2024-05-20',
      time: '07:30',
      duration: 15,
      performance: 65,
      completed: true,
      responseTime: 10,
      accuracy: 'normal',
      notes: '刚开始随行训练，容易被周围事物吸引',
      rewardGiven: true,
      rewardType: 'food'
    },
    {
      id: 5,
      planId: 4,
      petId: 2,
      skillId: 'sit',
      date: '2024-05-20',
      time: '09:00',
      duration: 6,
      performance: 80,
      completed: true,
      responseTime: 5,
      accuracy: 'good',
      notes: '心情好的时候很配合',
      rewardGiven: true,
      rewardType: 'food'
    }
  ]);

  const getPetPlans = (petId) => {
    return trainingPlans.value.filter(p => p.petId === petId);
  };

  const getPetRecords = (petId, date = null) => {
    let records = trainingRecords.value.filter(r => r.petId === petId);
    if (date) {
      records = records.filter(r => r.date === date);
    }
    return records;
  };

  const getSkillInfo = (skillId) => {
    return skillCategories.find(s => s.id === skillId);
  };

  const calculateProgress = (plan) => {
    const startDate = dayjs(plan.startDate);
    const endDate = dayjs(plan.endDate);
    const today = dayjs();
    const totalDays = endDate.diff(startDate, 'day');
    const passedDays = today.diff(startDate, 'day');
    return Math.min(Math.max(Math.round((passedDays / totalDays) * 100), 0), 100);
  };

  const getTodayCompletedCount = (petId) => {
    const today = dayjs().format('YYYY-MM-DD');
    return trainingRecords.value.filter(
      r => r.petId === petId && r.date === today && r.completed
    ).length;
  };

  const getTodayTotalCount = (petId) => {
    const today = dayjs().format('YYYY-MM-DD');
    const plans = getPetPlans(petId);
    let total = 0;
    plans.forEach(plan => {
      total += plan.dailyTasks.filter(t => t.date === today).length;
    });
    return total;
  };

  const addTrainingRecord = (record) => {
    const newId = Math.max(...trainingRecords.value.map(r => r.id), 0) + 1;
    trainingRecords.value.push({ ...record, id: newId });
  };

  const updateTrainingPlan = (planId, data) => {
    const index = trainingPlans.value.findIndex(p => p.id === planId);
    if (index !== -1) {
      trainingPlans.value[index] = { ...trainingPlans.value[index], ...data };
    }
  };

  const addTrainingPlan = (plan) => {
    const newId = Math.max(...trainingPlans.value.map(p => p.id), 0) + 1;
    trainingPlans.value.push({ ...plan, id: newId });
  };

  const getAveragePerformance = (petId, skillId, days = 7) => {
    const records = trainingRecords.value.filter(r => {
      const recordDate = dayjs(r.date);
      return r.petId === petId && 
             r.skillId === skillId &&
             dayjs().diff(recordDate, 'day') <= days;
    });
    if (records.length === 0) return 0;
    const sum = records.reduce((acc, r) => acc + r.performance, 0);
    return Math.round(sum / records.length);
  };

  const adjustTrainingFrequency = (petId, skillId) => {
    const avgPerformance = getAveragePerformance(petId, skillId);
    if (avgPerformance >= 90) {
      return { suggestion: '可增加训练难度或减少频次', frequency: '减少', level: 'excellent' };
    } else if (avgPerformance >= 70) {
      return { suggestion: '保持当前训练强度', frequency: '保持', level: 'good' };
    } else if (avgPerformance >= 50) {
      return { suggestion: '建议增加训练频次', frequency: '增加', level: 'normal' };
    } else {
      return { suggestion: '降低训练难度，增加基础训练', frequency: '调整', level: 'needs_improvement' };
    }
  };

  const suggestRewardType = (petId, skillId) => {
    const records = trainingRecords.value.filter(r => r.petId === petId && r.skillId === skillId);
    if (records.length === 0) return 'food';
    
    const rewardPerformance = {};
    records.forEach(r => {
      if (!rewardPerformance[r.rewardType]) {
        rewardPerformance[r.rewardType] = [];
      }
      rewardPerformance[r.rewardType].push(r.performance);
    });

    let bestReward = 'food';
    let bestAvg = 0;
    Object.entries(rewardPerformance).forEach(([type, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
      if (avg > bestAvg) {
        bestAvg = avg;
        bestReward = type;
      }
    });

    return bestReward;
  };

  return {
    skillCategories,
    trainingPhases,
    rewardTypes,
    trainingPlans,
    trainingRecords,
    getPetPlans,
    getPetRecords,
    getSkillInfo,
    calculateProgress,
    getTodayCompletedCount,
    getTodayTotalCount,
    addTrainingRecord,
    updateTrainingPlan,
    addTrainingPlan,
    getAveragePerformance,
    adjustTrainingFrequency,
    suggestRewardType
  };
});
