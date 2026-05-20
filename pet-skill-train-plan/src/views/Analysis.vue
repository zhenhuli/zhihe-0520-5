<template>
  <div class="analysis-page">
    <div class="page-header">
      <h2 class="page-title">效果分析</h2>
      <el-select v-model="selectedPetId" style="width: 200px" @change="handlePetChange">
        <el-option
          v-for="pet in petStore.pets"
          :key="pet.id"
          :label="pet.avatar + ' ' + pet.name"
          :value="pet.id"
        />
      </el-select>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px">
      <el-col :span="8">
        <div class="page-container" style="height: 100%">
          <div class="section-header">
            <h3>训练概览</h3>
          </div>
          <div class="overview-stats">
            <div class="overview-item">
              <div class="overview-label">累计训练天数</div>
              <div class="overview-value primary">{{ totalTrainingDays }}</div>
            </div>
            <div class="overview-item">
              <div class="overview-label">总训练次数</div>
              <div class="overview-value success">{{ totalTrainingTimes }}</div>
            </div>
            <div class="overview-item">
              <div class="overview-label">总训练时长</div>
              <div class="overview-value warning">{{ totalDuration }}分钟</div>
            </div>
            <div class="overview-item">
              <div class="overview-label">平均表现分</div>
              <div class="overview-value purple">{{ overallAvgPerformance }}%</div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="page-container" style="height: 100%">
          <div class="section-header">
            <h3>各技能训练效果</h3>
          </div>
          <el-table :data="skillAnalysis" style="width: 100%">
            <el-table-column label="技能" width="140">
              <template #default="{ row }">
                <span>{{ row.icon }} {{ row.name }}</span>
              </template>
            </el-table-column>
            <el-table-column label="训练次数" width="100" prop="count" />
            <el-table-column label="平均表现">
              <template #default="{ row }">
                <el-progress
                  :percentage="row.avgPerformance"
                  :color="getPerformanceColor(row.avgPerformance)"
                  :stroke-width="10"
                />
              </template>
            </el-table-column>
            <el-table-column label="训练建议" min-width="200">
              <template #default="{ row }">
                <el-tag :type="getAdjustmentType(row.adjustment.level)" size="small">
                  {{ row.adjustment.suggestion }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="推荐奖励" width="120">
              <template #default="{ row }">
                {{ row.suggestedRewardIcon }} {{ row.suggestedRewardName }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="12">
        <div class="page-container">
          <div class="section-header">
            <h3>近7天表现趋势</h3>
            <el-radio-group v-model="trendSkill" size="small">
              <el-radio-button value="all">全部</el-radio-button>
              <el-radio-button
                v-for="skill in trainingStore.skillCategories"
                :key="skill.id"
                :value="skill.id"
              >
                {{ skill.icon }}
              </el-radio-button>
            </el-radio-group>
          </div>
          <div class="trend-chart">
            <div class="chart-bars">
              <div
                v-for="(day, index) in weekTrend"
                :key="index"
                class="chart-bar-item"
              >
                <div class="bar-container">
                  <div
                    class="bar-fill"
                    :style="{ height: day.performance + '%', background: getPerformanceColor(day.performance) }"
                  >
                    <span class="bar-value" v-if="day.performance > 0">{{ day.performance }}%</span>
                  </div>
                </div>
                <div class="bar-label">{{ day.label }}</div>
                <div class="bar-count" v-if="day.count > 0">{{ day.count }}次</div>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="12">
        <div class="page-container">
          <div class="section-header">
            <h3>智能调整建议</h3>
            <el-tag type="primary" size="small">AI推荐</el-tag>
          </div>
          <div class="suggestions-list">
            <div
              v-for="(suggestion, index) in smartSuggestions"
              :key="index"
              class="suggestion-card"
              :class="suggestion.priority"
            >
              <div class="suggestion-header">
                <el-icon :size="20">
                  <component :is="suggestion.icon" />
                </el-icon>
                <span class="suggestion-title">{{ suggestion.title }}</span>
                <el-tag :type="suggestion.tagType" size="small">{{ suggestion.tag }}</el-tag>
              </div>
              <div class="suggestion-content">{{ suggestion.content }}</div>
              <div class="suggestion-action">
                <el-button type="primary" size="small" plain @click="applySuggestion(suggestion)">
                  应用建议
                </el-button>
              </div>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-top: 20px">
      <el-col :span="24">
        <div class="page-container">
          <div class="section-header">
            <h3>奖励效果分析</h3>
          </div>
          <el-row :gutter="20">
            <el-col :span="8" v-for="reward in rewardAnalysis" :key="reward.id">
              <el-card class="reward-card" :class="{ best: reward.isBest }">
                <div class="reward-header">
                  <span class="reward-icon">{{ reward.icon }}</span>
                  <div>
                    <div class="reward-name">{{ reward.name }}</div>
                    <el-tag v-if="reward.isBest" type="success" size="small">效果最佳</el-tag>
                  </div>
                </div>
                <div class="reward-stats">
                  <div class="reward-stat">
                    <span class="stat-label">使用次数</span>
                    <span class="stat-value">{{ reward.count }}</span>
                  </div>
                  <div class="reward-stat">
                    <span class="stat-label">平均表现</span>
                    <span class="stat-value highlight">{{ reward.avgPerformance }}%</span>
                  </div>
                </div>
                <el-progress
                  :percentage="reward.avgPerformance"
                  :color="reward.isBest ? '#67c23a' : '#909399'"
                  :stroke-width="6"
                  style="margin-top: 8px"
                />
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { ElMessage } from 'element-plus';
import { usePetStore } from '../stores/pet';
import { useTrainingStore } from '../stores/training';
import {
  TrendCharts,
  Warning,
  Check,
  Guide,
  Present
} from '@element-plus/icons-vue';
import dayjs from 'dayjs';

const petStore = usePetStore();
const trainingStore = useTrainingStore();

const selectedPetId = ref(petStore.currentPetId);
const trendSkill = ref('all');

const handlePetChange = (val) => {
  petStore.setCurrentPet(val);
};

const allRecords = computed(() => {
  return trainingStore.getPetRecords(selectedPetId.value);
});

const totalTrainingDays = computed(() => {
  const dates = new Set(allRecords.value.map(r => r.date));
  return dates.size;
});

const totalTrainingTimes = computed(() => {
  return allRecords.value.length;
});

const totalDuration = computed(() => {
  return allRecords.value.reduce((sum, r) => sum + r.duration, 0);
});

const overallAvgPerformance = computed(() => {
  if (allRecords.value.length === 0) return 0;
  const sum = allRecords.value.reduce((sum, r) => sum + r.performance, 0);
  return Math.round(sum / allRecords.value.length);
});

const skillAnalysis = computed(() => {
  const skills = trainingStore.skillCategories;
  return skills.map(skill => {
    const records = allRecords.value.filter(r => r.skillId === skill.id);
    const count = records.length;
    const avgPerformance = count > 0
      ? Math.round(records.reduce((sum, r) => sum + r.performance, 0) / count)
      : 0;
    const adjustment = trainingStore.adjustTrainingFrequency(selectedPetId.value, skill.id);
    const suggestedReward = trainingStore.suggestRewardType(selectedPetId.value, skill.id);
    const rewardInfo = trainingStore.rewardTypes.find(r => r.id === suggestedReward);
    
    return {
      ...skill,
      count,
      avgPerformance,
      adjustment,
      suggestedReward,
      suggestedRewardIcon: rewardInfo?.icon || '🎁',
      suggestedRewardName: rewardInfo?.name || '未知'
    };
  }).filter(s => s.count > 0);
});

const weekTrend = computed(() => {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const date = dayjs().subtract(i, 'day');
    const dateStr = date.format('YYYY-MM-DD');
    const label = date.format('MM/DD');
    const dayRecords = allRecords.value.filter(r => {
      if (trendSkill.value !== 'all') {
        return r.date === dateStr && r.skillId === trendSkill.value;
      }
      return r.date === dateStr;
    });
    const count = dayRecords.length;
    const performance = count > 0
      ? Math.round(dayRecords.reduce((sum, r) => sum + r.performance, 0) / count)
      : 0;
    days.push({ label, date: dateStr, count, performance });
  }
  return days;
});

const rewardAnalysis = computed(() => {
  const rewards = trainingStore.rewardTypes;
  return rewards.map(reward => {
    const records = allRecords.value.filter(r => r.rewardType === reward.id && r.rewardGiven);
    const count = records.length;
    const avgPerformance = count > 0
      ? Math.round(records.reduce((sum, r) => sum + r.performance, 0) / count)
      : 0;
    return {
      ...reward,
      count,
      avgPerformance,
      isBest: false
    };
  }).filter(r => r.count > 0).sort((a, b) => b.avgPerformance - a.avgPerformance).map((r, i) => ({
    ...r,
    isBest: i === 0 && r.avgPerformance > 0
  }));
});

const smartSuggestions = computed(() => {
  const suggestions = [];
  
  const lowPerformanceSkills = skillAnalysis.value.filter(s => s.avgPerformance < 60);
  if (lowPerformanceSkills.length > 0) {
    suggestions.push({
      id: 'low_performance',
      icon: Warning,
      title: '训练效果待提升',
      tag: '调整建议',
      tagType: 'warning',
      priority: 'high',
      content: `${lowPerformanceSkills.map(s => s.name).join('、')} 的训练效果低于预期，建议增加基础训练，降低训练难度，每次训练时间缩短为5-8分钟，使用${rewardAnalysis.value[0]?.name || '食物'}作为主要奖励。`,
      action: 'increase_frequency',
      skills: lowPerformanceSkills.map(s => s.id)
    });
  }

  const highPerformanceSkills = skillAnalysis.value.filter(s => s.avgPerformance >= 90);
  if (highPerformanceSkills.length > 0) {
    suggestions.push({
      id: 'high_performance',
      icon: Check,
      title: '训练效果优秀',
      tag: '进阶建议',
      tagType: 'success',
      priority: 'normal',
      content: `${highPerformanceSkills.map(s => s.name).join('、')} 的训练效果非常好！可以考虑增加训练难度，引入干扰训练，或减少训练频次以保持兴趣。`,
      action: 'increase_difficulty',
      skills: highPerformanceSkills.map(s => s.id)
    });
  }

  if (rewardAnalysis.value.length > 0) {
    const bestReward = rewardAnalysis.value[0];
    suggestions.push({
      id: 'reward_suggestion',
      icon: Present,
      title: '奖励方式优化',
      tag: '奖励建议',
      tagType: 'info',
      priority: 'normal',
      content: `分析显示 ${bestReward.icon}${bestReward.name} 的训练效果最佳（平均${bestReward.avgPerformance}%），建议在训练中优先使用该奖励方式。`,
      action: 'change_reward',
      rewardType: bestReward.id
    });
  }

  const currentPet = petStore.currentPet;
  if (currentPet) {
    const ageGroup = petStore.getAgeGroup(currentPet);
    suggestions.push({
      id: 'age_suggestion',
      icon: Guide,
      title: '年龄段训练建议',
      tag: '个性化',
      tagType: 'primary',
      priority: 'normal',
      content: `${currentPet.name} 处于${ageGroup.label}，建议每次训练不超过${ageGroup.attentionSpan}分钟，每天${Math.max(2, Math.round(ageGroup.attentionSpan / 3))}次训练，保持训练环境安静无干扰。`,
      action: 'adjust_schedule'
    });
  }

  if (suggestions.length === 0) {
    suggestions.push({
      id: 'default',
      icon: TrendCharts,
      title: '训练进展顺利',
      tag: '保持',
      tagType: 'success',
      priority: 'normal',
      content: '继续保持当前的训练节奏，定期记录训练效果，系统会持续分析并提供优化建议。'
    });
  }

  return suggestions;
});

const getPerformanceColor = (percentage) => {
  if (percentage >= 80) return '#67c23a';
  if (percentage >= 60) return '#e6a23c';
  return '#f56c6c';
};

const getAdjustmentType = (level) => {
  const map = {
    excellent: 'success',
    good: 'primary',
    normal: 'warning',
    needs_improvement: 'danger'
  };
  return map[level] || 'info';
};

const applySuggestion = (suggestion) => {
  ElMessage.success(`已应用建议：${suggestion.title}`);
};
</script>

<style scoped>
.analysis-page {
  padding: 0;
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

.overview-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}

.overview-item {
  text-align: center;
  padding: 16px;
  background: #f5f7fa;
  border-radius: 8px;
}

.overview-label {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.overview-value {
  font-size: 28px;
  font-weight: 700;
}

.overview-value.primary { color: #1890ff; }
.overview-value.success { color: #52c41a; }
.overview-value.warning { color: #faad14; }
.overview-value.purple { color: #722ed1; }

.trend-chart {
  height: 250px;
  display: flex;
  align-items: flex-end;
}

.chart-bars {
  display: flex;
  justify-content: space-around;
  align-items: flex-end;
  width: 100%;
  height: 100%;
  padding-bottom: 40px;
  position: relative;
}

.chart-bar-item {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100%;
}

.bar-container {
  flex: 1;
  width: 40px;
  background: #f0f2f5;
  border-radius: 4px 4px 0 0;
  position: relative;
  display: flex;
  align-items: flex-end;
  margin-bottom: 8px;
}

.bar-fill {
  width: 100%;
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
  position: relative;
  min-height: 4px;
}

.bar-value {
  position: absolute;
  top: -20px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 11px;
  color: #666;
  white-space: nowrap;
}

.bar-label {
  font-size: 12px;
  color: #666;
  position: absolute;
  bottom: 20px;
}

.bar-count {
  font-size: 11px;
  color: #999;
  position: absolute;
  bottom: 4px;
}

.suggestions-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.suggestion-card {
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  padding: 16px;
  transition: all 0.3s;
}

.suggestion-card:hover {
  border-color: #1890ff;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.1);
}

.suggestion-card.high {
  border-left: 4px solid #f56c6c;
}

.suggestion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.suggestion-title {
  flex: 1;
  font-weight: 600;
  font-size: 14px;
}

.suggestion-content {
  color: #666;
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 12px;
}

.suggestion-action {
  text-align: right;
}

.reward-card {
  transition: all 0.3s;
}

.reward-card.best {
  border: 2px solid #67c23a;
}

.reward-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.reward-icon {
  font-size: 40px;
  line-height: 1;
}

.reward-name {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 4px;
}

.reward-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: 8px;
}

.reward-stat {
  text-align: center;
}

.reward-stat .stat-label {
  display: block;
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.reward-stat .stat-value {
  font-size: 18px;
  font-weight: 600;
}

.reward-stat .stat-value.highlight {
  color: #67c23a;
}
</style>
