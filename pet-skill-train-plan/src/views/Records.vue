<template>
  <div class="records-page">
    <div class="page-header">
      <h2 class="page-title">训练记录</h2>
      <div class="header-actions">
        <el-date-picker
          v-model="selectedDate"
          type="date"
          format="YYYY-MM-DD"
          value-format="YYYY-MM-DD"
          style="width: 180px; margin-right: 12px"
        />
        <el-select v-model="selectedPetId" style="width: 180px; margin-right: 12px" @change="handlePetChange">
          <el-option
            v-for="pet in petStore.pets"
            :key="pet.id"
            :label="pet.avatar + ' ' + pet.name"
            :value="pet.id"
          />
        </el-select>
        <el-button type="primary" @click="openAddRecord">
          <el-icon><Plus /></el-icon>
          新增记录
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" class="stats-row">
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">当日训练次数</span>
            <el-icon :size="24" color="#1890ff"><Timer /></el-icon>
          </div>
          <div class="stat-card-value">{{ dayRecords.length }}</div>
          <div class="stat-card-desc">次训练</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">总训练时长</span>
            <el-icon :size="24" color="#52c41a"><Clock /></el-icon>
          </div>
          <div class="stat-card-value">{{ totalDuration }}</div>
          <div class="stat-card-desc">分钟</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">平均表现分</span>
            <el-icon :size="24" color="#faad14"><Star /></el-icon>
          </div>
          <div class="stat-card-value">{{ avgPerformance }}%</div>
          <div class="stat-card-desc">{{ performanceLevel }}</div>
        </div>
      </el-col>
      <el-col :span="6">
        <div class="stat-card">
          <div class="stat-card-header">
            <span class="stat-card-title">完成率</span>
            <el-icon :size="24" color="#722ed1"><CircleCheck /></el-icon>
          </div>
          <div class="stat-card-value">{{ completionRate }}%</div>
          <div class="stat-card-desc">今日计划完成情况</div>
        </div>
      </el-col>
    </el-row>

    <div class="page-container">
      <div class="section-header">
        <h3>训练记录列表</h3>
      </div>
      
      <el-table :data="dayRecords" style="width: 100%">
        <el-table-column prop="time" label="时间" width="100" />
        <el-table-column label="训练项目" width="150">
          <template #default="{ row }">
            <span>{{ getSkillIcon(row.skillId) }} {{ getSkillName(row.skillId) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="时长(分钟)" width="120" />
        <el-table-column label="表现">
          <template #default="{ row }">
            <el-progress
              :percentage="row.performance"
              :color="getPerformanceColor(row.performance)"
              :stroke-width="12"
            />
          </template>
        </el-table-column>
        <el-table-column label="反应速度" width="120">
          <template #default="{ row }">
            <el-tag :type="getResponseType(row.responseTime)" size="small">
              {{ row.responseTime }}秒
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="奖励方式" width="140">
          <template #default="{ row }">
            <span v-if="row.rewardGiven">
              {{ getRewardIcon(row.rewardType) }} {{ getRewardName(row.rewardType) }}
            </span>
            <span v-else class="text-gray">无</span>
          </template>
        </el-table-column>
        <el-table-column prop="notes" label="备注" min-width="200" show-overflow-tooltip />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="text" @click="editRecord(row)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-empty v-if="dayRecords.length === 0" description="当日暂无训练记录" />
    </div>

    <el-dialog v-model="recordDialogVisible" :title="isEdit ? '编辑记录' : '新增记录'" width="500px">
      <el-form :model="recordForm" :rules="recordRules" ref="recordFormRef" label-width="100px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="训练项目" prop="skillId">
              <el-select v-model="recordForm.skillId" style="width: 100%">
                <el-option
                  v-for="skill in trainingStore.skillCategories"
                  :key="skill.id"
                  :label="skill.icon + ' ' + skill.name"
                  :value="skill.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="训练时间" prop="time">
              <el-time-select
                v-model="recordForm.time"
                style="width: 100%"
                start="06:00"
                end="22:00"
                step="00:30"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="训练时长" prop="duration">
              <el-input-number v-model="recordForm.duration" :min="1" :max="120" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="表现评分" prop="performance">
              <el-rate v-model="recordForm.performanceRate" :max="5" show-score />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="反应速度" prop="responseTime">
          <el-slider v-model="recordForm.responseTime" :min="1" :max="30" :marks="{ 3: '快', 10: '中', 20: '慢' }" />
          <span style="font-size: 12px; color: #999">{{ recordForm.responseTime }}秒</span>
        </el-form-item>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="是否给予奖励">
              <el-switch v-model="recordForm.rewardGiven" />
            </el-form-item>
          </el-col>
          <el-col :span="12" v-if="recordForm.rewardGiven">
            <el-form-item label="奖励方式" prop="rewardType">
              <el-select v-model="recordForm.rewardType" style="width: 100%">
                <el-option
                  v-for="reward in trainingStore.rewardTypes"
                  :key="reward.id"
                  :label="reward.icon + ' ' + reward.name"
                  :value="reward.id"
                />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="训练备注">
          <el-input type="textarea" v-model="recordForm.notes" :rows="3" placeholder="记录训练中的表现、问题和改进建议..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="recordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitRecord">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive } from 'vue';
import { ElMessage } from 'element-plus';
import { usePetStore } from '../stores/pet';
import { useTrainingStore } from '../stores/training';
import { Timer, Clock, Star, CircleCheck } from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const petStore = usePetStore();
const trainingStore = useTrainingStore();

const selectedPetId = ref(petStore.currentPetId);
const selectedDate = ref(dayjs().format('YYYY-MM-DD'));
const recordDialogVisible = ref(false);
const isEdit = ref(false);
const editRecordId = ref(null);
const recordFormRef = ref(null);

const recordForm = reactive({
  skillId: '',
  time: '',
  duration: 10,
  performanceRate: 3,
  responseTime: 5,
  rewardGiven: true,
  rewardType: 'food',
  notes: ''
});

const recordRules = {
  skillId: [{ required: true, message: '请选择训练项目', trigger: 'change' }],
  time: [{ required: true, message: '请选择训练时间', trigger: 'change' }],
  duration: [{ required: true, message: '请输入训练时长', trigger: 'blur' }],
  performanceRate: [{ required: true, message: '请评分', trigger: 'change' }],
  responseTime: [{ required: true, message: '请设置反应速度', trigger: 'change' }]
};

const dayRecords = computed(() => {
  return trainingStore.getPetRecords(selectedPetId.value, selectedDate.value).sort((a, b) => a.time.localeCompare(b.time));
});

const totalDuration = computed(() => {
  return dayRecords.value.reduce((sum, r) => sum + r.duration, 0);
});

const avgPerformance = computed(() => {
  if (dayRecords.value.length === 0) return 0;
  const sum = dayRecords.value.reduce((sum, r) => sum + r.performance, 0);
  return Math.round(sum / dayRecords.value.length);
});

const performanceLevel = computed(() => {
  const avg = avgPerformance.value;
  if (avg >= 90) return '优秀';
  if (avg >= 70) return '良好';
  if (avg >= 50) return '一般';
  return '待提升';
});

const completionRate = computed(() => {
  const plans = trainingStore.getPetPlans(selectedPetId.value);
  let totalTasks = 0;
  plans.forEach(plan => {
    totalTasks += plan.dailyTasks.filter(t => t.date === selectedDate.value).length;
  });
  if (totalTasks === 0) return 100;
  const completedTasks = dayRecords.value.filter(r => r.completed).length;
  return Math.round((completedTasks / totalTasks) * 100);
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

const getPerformanceColor = (percentage) => {
  if (percentage >= 80) return '#67c23a';
  if (percentage >= 60) return '#e6a23c';
  return '#f56c6c';
};

const getResponseType = (time) => {
  if (time <= 3) return 'success';
  if (time <= 10) return 'warning';
  return 'danger';
};

const getRewardIcon = (rewardId) => {
  const reward = trainingStore.rewardTypes.find(r => r.id === rewardId);
  return reward?.icon || '🎁';
};

const getRewardName = (rewardId) => {
  const reward = trainingStore.rewardTypes.find(r => r.id === rewardId);
  return reward?.name || '未知奖励';
};

const openAddRecord = () => {
  isEdit.value = false;
  editRecordId.value = null;
  Object.assign(recordForm, {
    skillId: '',
    time: '',
    duration: 10,
    performanceRate: 3,
    responseTime: 5,
    rewardGiven: true,
    rewardType: 'food',
    notes: ''
  });
  recordDialogVisible.value = true;
};

const editRecord = (record) => {
  isEdit.value = true;
  editRecordId.value = record.id;
  const rateMap = { 20: 1, 40: 2, 60: 3, 80: 4, 100: 5 };
  Object.assign(recordForm, {
    skillId: record.skillId,
    time: record.time,
    duration: record.duration,
    performanceRate: rateMap[record.performance] || 3,
    responseTime: record.responseTime,
    rewardGiven: record.rewardGiven,
    rewardType: record.rewardType,
    notes: record.notes
  });
  recordDialogVisible.value = true;
};

const submitRecord = () => {
  recordFormRef.value?.validate((valid) => {
    if (valid) {
      const performanceMap = { 1: 20, 2: 40, 3: 60, 4: 80, 5: 100 };
      const accuracyMap = { 3: 'excellent', 10: 'good', 20: 'normal' };
      const accuracyKey = recordForm.responseTime <= 3 ? 3 : recordForm.responseTime <= 10 ? 10 : 20;
      
      const newRecord = {
        planId: 0,
        petId: selectedPetId.value,
        skillId: recordForm.skillId,
        date: selectedDate.value,
        time: recordForm.time,
        duration: recordForm.duration,
        performance: performanceMap[recordForm.performanceRate],
        completed: true,
        responseTime: recordForm.responseTime,
        accuracy: accuracyMap[accuracyKey],
        notes: recordForm.notes,
        rewardGiven: recordForm.rewardGiven,
        rewardType: recordForm.rewardType
      };

      if (isEdit.value) {
        const index = trainingStore.trainingRecords.findIndex(r => r.id === editRecordId.value);
        if (index !== -1) {
          trainingStore.trainingRecords[index] = { ...trainingStore.trainingRecords[index], ...newRecord };
        }
        ElMessage.success('记录已更新');
      } else {
        trainingStore.addTrainingRecord(newRecord);
        ElMessage.success('记录已添加');
      }
      
      recordDialogVisible.value = false;
    }
  });
};
</script>

<style scoped>
.records-page {
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

.text-gray {
  color: #999;
}
</style>
