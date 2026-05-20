<template>
  <div class="plans-page">
    <div class="page-header">
      <h2 class="page-title">训练计划</h2>
      <div class="header-actions">
        <el-select v-model="selectedPetId" style="width: 180px; margin-right: 12px" @change="handlePetChange">
          <el-option
            v-for="pet in petStore.pets"
            :key="pet.id"
            :label="pet.avatar + ' ' + pet.name"
            :value="pet.id"
          />
        </el-select>
        <el-button type="primary" @click="openCreateDialog">
          <el-icon><Plus /></el-icon>
          创建训练计划
        </el-button>
      </div>
    </div>

    <el-row :gutter="20">
      <el-col :span="12" v-for="plan in petPlans" :key="plan.id">
        <el-card class="plan-card">
          <div class="plan-header">
            <div class="plan-skill">
              <span class="skill-icon">{{ getSkillIcon(plan.skillId) }}</span>
              <div>
                <h3 class="plan-name">{{ plan.name }}</h3>
                <el-tag :type="getDifficultyType(plan.difficulty)" size="small">
                  {{ getDifficultyLabel(plan.difficulty) }}
                </el-tag>
              </div>
            </div>
            <el-dropdown trigger="click" @command="(cmd) => handlePlanAction(cmd, plan)">
              <el-button type="text" :icon="MoreFilled" />
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="view">查看详情</el-dropdown-item>
                  <el-dropdown-item command="edit">编辑</el-dropdown-item>
                  <el-dropdown-item command="complete" v-if="plan.status === 'in_progress'">标记完成</el-dropdown-item>
                  <el-dropdown-item command="delete" divided>删除</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
          </div>

          <div class="plan-stats">
            <div class="stat-item">
              <span class="stat-label">训练频次</span>
              <span class="stat-value">{{ plan.frequency }}次/天</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">单次时长</span>
              <span class="stat-value">{{ plan.duration }}分钟</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">当前阶段</span>
              <span class="stat-value">第{{ plan.currentPhase }}阶段</span>
            </div>
          </div>

          <div class="plan-progress">
            <div class="progress-header">
              <span>训练进度</span>
              <span>{{ trainingStore.calculateProgress(plan) }}%</span>
            </div>
            <el-progress
              :percentage="trainingStore.calculateProgress(plan)"
              :stroke-width="8"
            />
          </div>

          <div class="plan-phases">
            <div
              v-for="phase in trainingStore.trainingPhases"
              :key="phase.phase"
              class="phase-item"
              :class="{ active: phase.phase === plan.currentPhase, completed: phase.phase < plan.currentPhase }"
            >
              <div class="phase-number">{{ phase.phase }}</div>
              <div class="phase-name">{{ phase.name }}</div>
            </div>
          </div>

          <el-divider />

          <div class="plan-footer">
            <div class="reward-info">
              <el-icon><Present /></el-icon>
              <span>{{ getRewardName(plan.rewardType) }} · {{ plan.rewardAmount }}</span>
            </div>
            <div class="date-info">
              {{ plan.startDate }} ~ {{ plan.endDate }}
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-empty v-if="petPlans.length === 0" description="暂无训练计划，点击上方按钮创建" />

    <el-dialog v-model="createDialogVisible" title="创建训练计划" width="700px" :close-on-click-modal="false">
      <el-form :model="planForm" :rules="planRules" ref="planFormRef" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="选择宠物">
              <el-select v-model="planForm.petId" style="width: 100%" disabled>
                <el-option
                  v-for="pet in petStore.pets"
                  :key="pet.id"
                  :label="pet.avatar + ' ' + pet.name"
                  :value="pet.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="训练项目" prop="skillId">
              <el-select v-model="planForm.skillId" style="width: 100%" @change="handleSkillChange">
                <el-option
                  v-for="skill in trainingStore.skillCategories"
                  :key="skill.id"
                  :label="skill.icon + ' ' + skill.name"
                  :value="skill.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="计划名称" prop="name">
          <el-input v-model="planForm.name" placeholder="请输入训练计划名称" />
        </el-form-item>

        <el-form-item label="训练描述">
          <el-input type="textarea" v-model="planForm.description" :rows="2" placeholder="描述训练目标和注意事项" />
        </el-form-item>

        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="训练难度" prop="difficulty">
              <el-select v-model="planForm.difficulty" style="width: 100%">
                <el-option label="简单" value="easy" />
                <el-option label="中等" value="medium" />
                <el-option label="困难" value="hard" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="每日频次" prop="frequency">
              <el-input-number v-model="planForm.frequency" :min="1" :max="10" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="单次时长(分钟)" prop="duration">
              <el-input-number v-model="planForm.duration" :min="1" :max="60" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="开始日期" prop="startDate">
              <el-date-picker
                v-model="planForm.startDate"
                type="date"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束日期" prop="endDate">
              <el-date-picker
                v-model="planForm.endDate"
                type="date"
                style="width: 100%"
                format="YYYY-MM-DD"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="奖励方式" prop="rewardType">
              <el-select v-model="planForm.rewardType" style="width: 100%">
                <el-option
                  v-for="reward in trainingStore.rewardTypes"
                  :key="reward.id"
                  :label="reward.icon + ' ' + reward.name"
                  :value="reward.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="奖励数量">
              <el-input v-model="planForm.rewardAmount" placeholder="如：适量、少量零食等" />
            </el-form-item>
          </el-col>
        </el-row>

        <el-form-item label="训练时间点">
          <div class="time-slots">
            <el-tag
              v-for="(slot, index) in planForm.timeSlots"
              :key="index"
              closable
              @close="removeTimeSlot(index)"
              class="time-tag"
            >
              {{ slot }}
            </el-tag>
            <el-time-select
              v-model="newTimeSlot"
              :interval="30"
              start="06:00"
              end="22:00"
              placeholder="添加时间"
              size="small"
              style="width: 120px"
              @change="addTimeSlot"
            />
          </div>
        </el-form-item>

        <el-alert
          title="智能推荐"
          type="info"
          :closable="false"
          show-icon
          v-if="recommendation"
        >
          <template #default>
            {{ recommendation }}
          </template>
        </el-alert>
      </el-form>
      <template #footer>
        <el-button @click="createDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitPlan">创建计划</el-button>
      </template>
    </el-dialog>

    <el-dialog v-model="detailDialogVisible" title="训练计划详情" width="600px">
      <div v-if="currentPlan">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="训练项目">
            {{ getSkillIcon(currentPlan.skillId) }} {{ getSkillName(currentPlan.skillId) }}
          </el-descriptions-item>
          <el-descriptions-item label="难度等级">
            <el-tag :type="getDifficultyType(currentPlan.difficulty)">
              {{ getDifficultyLabel(currentPlan.difficulty) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="训练频次">
            {{ currentPlan.frequency }}次/天
          </el-descriptions-item>
          <el-descriptions-item label="单次时长">
            {{ currentPlan.duration }}分钟
          </el-descriptions-item>
          <el-descriptions-item label="奖励方式">
            {{ getRewardName(currentPlan.rewardType) }}
          </el-descriptions-item>
          <el-descriptions-item label="奖励数量">
            {{ currentPlan.rewardAmount }}
          </el-descriptions-item>
          <el-descriptions-item label="计划周期" :span="2">
            {{ currentPlan.startDate }} ~ {{ currentPlan.endDate }}
          </el-descriptions-item>
          <el-descriptions-item label="训练描述" :span="2">
            {{ currentPlan.description }}
          </el-descriptions-item>
        </el-descriptions>

        <h4 style="margin: 20px 0 12px">训练阶段</h4>
        <el-steps :active="currentPlan.currentPhase" finish-status="success">
          <el-step
            v-for="phase in trainingStore.trainingPhases"
            :key="phase.phase"
            :title="phase.name"
            :description="phase.description"
          />
        </el-steps>
      </div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, watch } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { usePetStore } from '../stores/pet';
import { useTrainingStore } from '../stores/training';
import { MoreFilled, Present } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const petStore = usePetStore();
const trainingStore = useTrainingStore();

const selectedPetId = ref(petStore.currentPetId);
const createDialogVisible = ref(false);
const detailDialogVisible = ref(false);
const currentPlan = ref(null);
const planFormRef = ref(null);
const newTimeSlot = ref('');

const planForm = reactive({
  petId: selectedPetId.value,
  skillId: '',
  name: '',
  description: '',
  difficulty: 'medium',
  frequency: 3,
  duration: 10,
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
  rewardType: 'food',
  rewardAmount: '适量',
  timeSlots: ['07:00', '12:00', '18:00']
});

const planRules = {
  skillId: [{ required: true, message: '请选择训练项目', trigger: 'change' }],
  name: [{ required: true, message: '请输入计划名称', trigger: 'blur' }],
  difficulty: [{ required: true, message: '请选择训练难度', trigger: 'change' }],
  frequency: [{ required: true, message: '请输入训练频次', trigger: 'blur' }],
  duration: [{ required: true, message: '请输入单次时长', trigger: 'blur' }],
  startDate: [{ required: true, message: '请选择开始日期', trigger: 'change' }],
  endDate: [{ required: true, message: '请选择结束日期', trigger: 'change' }],
  rewardType: [{ required: true, message: '请选择奖励方式', trigger: 'change' }]
};

const petPlans = computed(() => {
  return trainingStore.getPetPlans(selectedPetId.value);
});

const recommendation = computed(() => {
  if (!planForm.skillId || !selectedPetId.value) return '';
  
  const pet = petStore.pets.find(p => p.id === selectedPetId.value);
  if (!pet) return '';
  
  const ageGroup = petStore.getAgeGroup(pet);
  const breedInfo = petStore.getBreedInfo(pet);
  
  const suggestions = [];
  
  if (ageGroup.difficultyMultiplier < 0.8) {
    suggestions.push(`当前处于${ageGroup.label}，建议降低训练难度`);
  }
  
  if (breedInfo.trainability === 'low') {
    suggestions.push('该品种可训练性一般，建议增加训练频次');
  }
  
  if (planForm.duration > ageGroup.attentionSpan) {
    suggestions.push(`单次训练时长建议不超过${ageGroup.attentionSpan}分钟`);
  }
  
  return suggestions.join('；');
});

const handlePetChange = (val) => {
  petStore.setCurrentPet(val);
};

const getSkillIcon = (skillId) => {
  const skill = trainingStore.getSkillInfo(skillId);
  return skill?.icon || '📋';
};

const getSkillName = (skillId) => {
  const skill = trainingStore.getSkillInfo(skillId);
  return skill?.name || '未知项目';
};

const getDifficultyType = (difficulty) => {
  const map = { easy: 'success', medium: 'warning', hard: 'danger' };
  return map[difficulty] || 'info';
};

const getDifficultyLabel = (difficulty) => {
  const map = { easy: '简单', medium: '中等', hard: '困难' };
  return map[difficulty] || '未知';
};

const getRewardName = (rewardId) => {
  const reward = trainingStore.rewardTypes.find(r => r.id === rewardId);
  return reward?.name || '未知奖励';
};

const openCreateDialog = () => {
  Object.assign(planForm, {
    petId: selectedPetId.value,
    skillId: '',
    name: '',
    description: '',
    difficulty: 'medium',
    frequency: 3,
    duration: 10,
    startDate: dayjs().format('YYYY-MM-DD'),
    endDate: dayjs().add(30, 'day').format('YYYY-MM-DD'),
    rewardType: 'food',
    rewardAmount: '适量',
    timeSlots: ['07:00', '12:00', '18:00']
  });
  createDialogVisible.value = true;
};

const handleSkillChange = (skillId) => {
  const skill = trainingStore.getSkillInfo(skillId);
  if (skill && !planForm.name) {
    planForm.name = `${skill.name}训练计划`;
  }
};

const addTimeSlot = () => {
  if (newTimeSlot.value && !planForm.timeSlots.includes(newTimeSlot.value)) {
    planForm.timeSlots.push(newTimeSlot.value);
    planForm.timeSlots.sort();
  }
  newTimeSlot.value = '';
};

const removeTimeSlot = (index) => {
  planForm.timeSlots.splice(index, 1);
};

const handlePlanAction = (command, plan) => {
  switch (command) {
    case 'view':
      currentPlan.value = plan;
      detailDialogVisible.value = true;
      break;
    case 'edit':
      break;
    case 'complete':
      ElMessageBox.confirm(
        `确定要将"${plan.name}"标记为完成吗？`,
        '确认',
        { type: 'warning' }
      ).then(() => {
        trainingStore.updateTrainingPlan(plan.id, { status: 'completed' });
        ElMessage.success('已标记为完成');
      }).catch(() => {});
      break;
    case 'delete':
      ElMessageBox.confirm(
        `确定要删除"${plan.name}"吗？`,
        '删除确认',
        { type: 'warning' }
      ).then(() => {
        const index = trainingStore.trainingPlans.findIndex(p => p.id === plan.id);
        if (index !== -1) {
          trainingStore.trainingPlans.splice(index, 1);
        }
        ElMessage.success('删除成功');
      }).catch(() => {});
      break;
  }
};

const submitPlan = () => {
  planFormRef.value?.validate((valid) => {
    if (valid) {
      const today = dayjs().format('YYYY-MM-DD');
      const dailyTasks = planForm.timeSlots.map(time => ({
        time,
        completed: false,
        date: today
      }));
      
      const newPlan = {
        petId: planForm.petId,
        skillId: planForm.skillId,
        name: planForm.name,
        difficulty: planForm.difficulty,
        frequency: planForm.frequency,
        frequencyUnit: 'times_per_day',
        duration: planForm.duration,
        durationUnit: 'minutes',
        startDate: planForm.startDate,
        endDate: planForm.endDate,
        currentPhase: 1,
        status: 'in_progress',
        rewardType: planForm.rewardType,
        rewardAmount: planForm.rewardAmount,
        description: planForm.description,
        dailyTasks
      };
      
      trainingStore.addTrainingPlan(newPlan);
      createDialogVisible.value = false;
      ElMessage.success('训练计划创建成功！');
    }
  });
};
</script>

<style scoped>
.plans-page {
  padding: 0;
}

.plan-card {
  margin-bottom: 20px;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.plan-skill {
  display: flex;
  align-items: center;
  gap: 12px;
}

.skill-icon {
  font-size: 40px;
  line-height: 1;
}

.plan-name {
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 4px 0;
}

.plan-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  padding: 12px 0;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-item {
  text-align: center;
}

.stat-label {
  display: block;
  color: #999;
  font-size: 12px;
  margin-bottom: 4px;
}

.stat-value {
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.plan-progress {
  margin-bottom: 16px;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 13px;
  color: #666;
}

.plan-phases {
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
}

.phase-item {
  text-align: center;
  flex: 1;
  position: relative;
}

.phase-item:not(:last-child)::after {
  content: '';
  position: absolute;
  top: 12px;
  right: -50%;
  width: 100%;
  height: 2px;
  background: #e4e7ed;
  z-index: 0;
}

.phase-item.completed::after {
  background: #67c23a;
}

.phase-number {
  width: 24px;
  height: 24px;
  line-height: 24px;
  border-radius: 50%;
  background: #e4e7ed;
  color: #999;
  font-size: 12px;
  margin: 0 auto 4px;
  position: relative;
  z-index: 1;
}

.phase-item.completed .phase-number,
.phase-item.active .phase-number {
  background: #67c23a;
  color: #fff;
}

.phase-name {
  font-size: 11px;
  color: #999;
}

.phase-item.active .phase-name {
  color: #1890ff;
  font-weight: 600;
}

.plan-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
  color: #666;
}

.reward-info {
  display: flex;
  align-items: center;
  gap: 4px;
}

.date-info {
  color: #999;
}

.time-slots {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: center;
}

.time-tag {
  margin: 0;
}
</style>
