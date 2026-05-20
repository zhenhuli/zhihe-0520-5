<template>
  <div class="dashboard">
    <div class="page-header">
      <h2 class="page-title">训练概览</h2>
      <el-select v-model="selectedPetId" style="width: 200px" @change="handlePetChange">
        <el-option
          v-for="pet in petStore.pets"
          :key="pet.id"
          :label="pet.name"
          :value="pet.id"
        >
          <span style="float: left">{{ pet.avatar }} {{ pet.name }}</span>
          <span style="float: right; color: #8492a6; font-size: 13px">{{ pet.type === 'dog' ? '狗狗' : '猫咪' }}</span>
        </el-option>
      </el-select>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">今日训练任务</span>
            <el-icon :size="24" color="#1890ff"><List /></el-icon>
          </div>
          <div class="stat-card-value">{{ todayCompleted }}/{{ todayTotal }}</div>
          <div class="stat-card-desc">
            <el-progress :percentage="todayProgress" :status="todayProgress === 100 ? 'success' : ''" :stroke-width="8" />
          </div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">进行中的训练</span>
            <el-icon :size="24" color="#52c41a"><Medal /></el-icon>
          </div>
          <div class="stat-card-value">{{ activePlans.length }}</div>
          <div class="stat-card-desc">项训练计划进行中</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">本周平均表现</span>
            <el-icon :size="24" color="#faad14"><Star /></el-icon>
          </div>
          <div class="stat-card-value">{{ avgPerformance }}%</div>
          <div class="stat-card-desc">近7天训练表现评分</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">累计训练天数</span>
            <el-icon :size="24" color="#722ed1"><Calendar /></el-icon>
          </div>
          <div class="stat-card-value">{{ totalTrainingDays }}</div>
          <div class="stat-card-desc">天坚持训练</div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="16">
        <div class="page-container">
          <div class="section-header">
            <h3>今日训练计划</h3>
          </div>
          <el-timeline>
            <el-timeline-item
              v-for="(task, index) in todayTasks"
              :key="index"
              :timestamp="task.time"
              :color="task.completed ? '#67c23a' : '#f56c6c'"
              :icon="task.completed ? 'CircleCheck' : 'CircleClose'"
            >
              <el-card class="task-card" :class="{ completed: task.completed }">
                <div class="task-header">
                  <span class="task-skill">{{ task.skillIcon }} {{ task.skillName }}</span>
                  <el-tag :type="task.completed ? 'success' : 'warning'" size="small">
                    {{ task.completed ? '已完成' : '待完成' }}
                  </el-tag>
                </div>
                <div class="task-desc">{{ task.planName }}</div>
                <div class="task-duration">预计时长：{{ task.duration }}分钟</div>
                <div class="task-actions" v-if="!task.completed">
                  <el-button type="primary" size="small" @click="startTraining(task)">
                    开始训练
                  </el-button>
                </div>
              </el-card>
            </el-timeline-item>
          </el-timeline>
        </div>
      </el-col>

      <el-col :span="8">
        <div class="page-container" style="margin-bottom: 20px">
          <div class="section-header">
            <h3>宠物信息</h3>
          </div>
          <div class="pet-info" v-if="currentPet">
            <div class="pet-avatar">{{ currentPet.avatar }}</div>
            <div class="pet-details">
              <div class="pet-name">{{ currentPet.name }}</div>
              <div class="pet-breed">{{ getBreedLabel(currentPet) }}</div>
              <el-descriptions :column="1" size="small" class="pet-desc">
                <el-descriptions-item label="年龄">{{ currentPet.age }}{{ currentPet.ageUnit === 'years' ? '岁' : '个月' }}</el-descriptions-item>
                <el-descriptions-item label="体重">{{ currentPet.weight }}kg</el-descriptions-item>
                <el-descriptions-item label="年龄段">{{ ageGroup.label }}</el-descriptions-item>
                <el-descriptions-item label="可训练时长">{{ ageGroup.attentionSpan }}分钟/次</el-descriptions-item>
              </el-descriptions>
            </div>
          </div>
        </div>

        <div class="page-container">
          <div class="section-header">
            <h3>智能建议</h3>
          </div>
          <div class="suggestions">
            <el-alert
              v-for="(suggestion, index) in smartSuggestions"
              :key="index"
              :title="suggestion.title"
              :type="suggestion.type"
              :closable="false"
              show-icon
              class="suggestion-item"
            >
              <template #default>
                {{ suggestion.content }}
              </template>
            </el-alert>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="trainingDialogVisible" title="记录训练结果" width="500px">
      <el-form :model="trainingForm" label-width="100px">
        <el-form-item label="训练项目">
          <span>{{ currentTrainingTask?.skillName }}</span>
        </el-form-item>
        <el-form-item label="实际时长">
          <el-input-number v-model="trainingForm.duration" :min="1" :max="60" /> 分钟
        </el-form-item>
        <el-form-item label="表现评分">
          <el-rate v-model="trainingForm.performance" :max="5" show-score />
        </el-form-item>
        <el-form-item label="反应速度">
          <el-select v-model="trainingForm.responseSpeed">
            <el-option label="很快 (<3秒)" value="fast" />
            <el-option label="一般 (3-8秒)" value="normal" />
            <el-option label="较慢 (>8秒)" value="slow" />
          </el-select>
        </el-form-item>
        <el-form-item label="奖励方式">
          <el-select v-model="trainingForm.rewardType">
            <el-option
              v-for="reward in trainingStore.rewardTypes"
              :key="reward.id"
              :label="reward.icon + ' ' + reward.name"
              :value="reward.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="训练备注">
          <el-input type="textarea" v-model="trainingForm.notes" :rows="3" placeholder="记录训练中的表现和问题..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="trainingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitTrainingRecord">保存记录</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { usePetStore } from '../stores/pet';
import { useTrainingStore } from '../stores/training';
import dayjs from 'dayjs';

const router = useRouter();
const petStore = usePetStore();
const trainingStore = useTrainingStore();

const selectedPetId = ref(petStore.currentPetId);
const trainingDialogVisible = ref(false);
const currentTrainingTask = ref(null);
const trainingForm = ref({
  duration: 10,
  performance: 3,
  responseSpeed: 'normal',
  rewardType: 'food',
  notes: ''
});

const currentPet = computed(() => petStore.currentPet);

const handlePetChange = (val) => {
  petStore.setCurrentPet(val);
};

const ageGroup = computed(() => {
  if (!currentPet.value) return petStore.ageGroups[2];
  return petStore.getAgeGroup(currentPet.value);
});

const activePlans = computed(() => {
  return trainingStore.getPetPlans(selectedPetId.value).filter(p => p.status === 'in_progress');
});

const todayCompleted = computed(() => {
  return trainingStore.getTodayCompletedCount(selectedPetId.value);
});

const todayTotal = computed(() => {
  const plans = trainingStore.getPetPlans(selectedPetId.value);
  let total = 0;
  plans.forEach(plan => {
    total += plan.frequency;
  });
  return total;
});

const todayProgress = computed(() => {
  if (todayTotal.value === 0) return 0;
  return Math.round((todayCompleted.value / todayTotal.value) * 100);
});

const avgPerformance = computed(() => {
  if (activePlans.value.length === 0) return 0;
  let total = 0;
  let count = 0;
  activePlans.value.forEach(plan => {
    const avg = trainingStore.getAveragePerformance(selectedPetId.value, plan.skillId);
    if (avg > 0) {
      total += avg;
      count++;
    }
  });
  return count > 0 ? Math.round(total / count) : 0;
});

const totalTrainingDays = computed(() => {
  const records = trainingStore.getPetRecords(selectedPetId.value);
  const dates = new Set(records.map(r => r.date));
  return dates.size || 15;
});

const todayTasks = computed(() => {
  const tasks = [];
  const today = dayjs().format('YYYY-MM-DD');
  activePlans.value.forEach(plan => {
    const skill = trainingStore.getSkillInfo(plan.skillId);
    plan.dailyTasks.forEach(task => {
      if (task.date === today) {
        tasks.push({
          ...task,
          planId: plan.id,
          planName: plan.name,
          skillId: plan.skillId,
          skillName: skill.name,
          skillIcon: skill.icon,
          duration: plan.duration,
          rewardType: plan.rewardType
        });
      }
    });
  });
  return tasks.sort((a, b) => a.time.localeCompare(b.time));
});

const smartSuggestions = computed(() => {
  const suggestions = [];
  if (activePlans.value.length > 0) {
    activePlans.value.forEach(plan => {
      const adjustment = trainingStore.adjustTrainingFrequency(selectedPetId.value, plan.skillId);
      const skill = trainingStore.getSkillInfo(plan.skillId);
      const suggestedReward = trainingStore.suggestRewardType(selectedPetId.value, plan.skillId);
      const rewardInfo = trainingStore.rewardTypes.find(r => r.id === suggestedReward);
      
      if (adjustment.level === 'excellent') {
        suggestions.push({
          title: `${skill.icon} ${skill.name}训练表现优秀`,
          type: 'success',
          content: adjustment.suggestion + `。建议尝试使用${rewardInfo?.icon}${rewardInfo?.name}作为新的奖励方式。`
        });
      } else if (adjustment.level === 'needs_improvement') {
        suggestions.push({
          title: `${skill.icon} ${skill.name}训练需要调整`,
          type: 'warning',
          content: adjustment.suggestion + `。当前${rewardInfo?.icon}${rewardInfo?.name}效果最佳。`
        });
      }
    });
  }
  
  if (suggestions.length === 0) {
    suggestions.push({
      title: '训练进展顺利',
      type: 'info',
      content: '继续保持当前的训练节奏，定期记录训练效果，系统会根据表现智能调整训练计划。'
    });
  }
  
  return suggestions.slice(0, 3);
});

const getBreedLabel = (pet) => {
  const breedInfo = petStore.getBreedInfo(pet);
  return breedInfo.label || '未知品种';
};

const startTraining = (task) => {
  currentTrainingTask.value = task;
  trainingForm.value = {
    duration: task.duration,
    performance: 3,
    responseSpeed: 'normal',
    rewardType: task.rewardType,
    notes: ''
  };
  trainingDialogVisible.value = true;
};

const submitTrainingRecord = () => {
  if (!currentTrainingTask.value) return;
  
  const performanceMap = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
  const accuracyMap = { fast: 'excellent', normal: 'good', slow: 'normal' };
  
  const record = {
    planId: currentTrainingTask.value.planId,
    petId: selectedPetId.value,
    skillId: currentTrainingTask.value.skillId,
    date: dayjs().format('YYYY-MM-DD'),
    time: currentTrainingTask.value.time,
    duration: trainingForm.value.duration,
    performance: performanceMap[trainingForm.value.performance],
    completed: true,
    responseTime: trainingForm.value.responseSpeed === 'fast' ? 2 : trainingForm.value.responseSpeed === 'normal' ? 5 : 10,
    accuracy: accuracyMap[trainingForm.value.responseSpeed],
    notes: trainingForm.value.notes,
    rewardGiven: true,
    rewardType: trainingForm.value.rewardType
  };
  
  trainingStore.addTrainingRecord(record);
  
  const plans = trainingStore.trainingPlans;
  const planIndex = plans.findIndex(p => p.id === currentTrainingTask.value.planId);
  if (planIndex !== -1) {
    const taskIndex = plans[planIndex].dailyTasks.findIndex(
      t => t.date === currentTrainingTask.value.date && t.time === currentTrainingTask.value.time
    );
    if (taskIndex !== -1) {
      plans[planIndex].dailyTasks[taskIndex].completed = true;
    }
  }
  
  trainingDialogVisible.value = false;
  ElMessage.success('训练记录已保存！');
};
</script>

<style scoped>
.dashboard {
  padding: 0;
}

.stats-row {
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0;
}

.task-card {
  margin-bottom: 8px;
}

.task-card.completed {
  opacity: 0.7;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.task-skill {
  font-size: 15px;
  font-weight: 600;
}

.task-desc {
  color: #666;
  font-size: 13px;
  margin-bottom: 4px;
}

.task-duration {
  color: #999;
  font-size: 12px;
  margin-bottom: 8px;
}

.task-actions {
  text-align: right;
}

.pet-info {
  display: flex;
  gap: 16px;
}

.pet-avatar {
  font-size: 64px;
  line-height: 1;
}

.pet-details {
  flex: 1;
}

.pet-name {
  font-size: 20px;
  font-weight: 600;
  margin-bottom: 4px;
}

.pet-breed {
  color: #666;
  margin-bottom: 12px;
}

.pet-desc {
  margin-top: 8px;
}

.suggestion-item {
  margin-bottom: 12px;
}
</style>
