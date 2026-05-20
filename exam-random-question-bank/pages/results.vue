<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">成绩统计</h1>
        <p class="subtitle is-6">查看所有答题记录和成绩分析</p>
      </div>
    </div>

    <div class="columns mb-5">
      <div class="column is-3">
        <div class="stat-card">
          <p class="stat-number">{{ examStore.stats.totalResults }}</p>
          <p class="stat-label">答题次数</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);">
          <p class="stat-number">{{ examStore.stats.averageScore }}</p>
          <p class="stat-label">平均得分</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
          <p class="stat-number">{{ highestScore }}</p>
          <p class="stat-label">最高分</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <p class="stat-number">{{ passRate }}%</p>
          <p class="stat-label">及格率</p>
        </div>
      </div>
    </div>

    <div v-if="examStore.results.length === 0" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-grey">
          <i class="fas fa-chart-bar fa-3x"></i>
        </span>
        <p class="has-text-grey mt-3">暂无答题记录</p>
        <NuxtLink to="/papers" class="button is-primary mt-4">
          <span class="icon"><i class="fas fa-pencil-alt"></i></span>
          <span>去答题</span>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="card">
      <div class="card-content">
        <div class="table-container">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>序号</th>
                <th>试卷名称</th>
                <th>得分</th>
                <th>总分</th>
                <th>正确率</th>
                <th>答对</th>
                <th>答错</th>
                <th>评级</th>
                <th>答题时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(result, index) in sortedResults" :key="result.id">
                <td>{{ index + 1 }}</td>
                <td>{{ result.paperTitle }}</td>
                <td class="has-text-weight-bold">{{ result.userScore }}</td>
                <td>{{ result.totalScore }}</td>
                <td>
                  <div class="is-flex is-align-items-center">
                    <span class="mr-2">{{ getAccuracy(result) }}%</span>
                    <div class="progress-bar" style="width: 100px; height: 6px;">
                      <div class="progress-bar-fill" :style="{ width: getAccuracy(result) + '%' }"></div>
                    </div>
                  </div>
                </td>
                <td><span class="tag is-success">{{ result.correctCount }}</span></td>
                <td><span class="tag is-danger">{{ result.wrongCount }}</span></td>
                <td>
                  <span class="tag" :class="getGradeTagClass(result)">
                    {{ getGrade(result) }}
                  </span>
                </td>
                <td>{{ formatDate(result.createdAt) }}</td>
                <td>
                  <button class="button is-small is-danger" @click="deleteResult(result.id)">
                    <span class="icon"><i class="fas fa-trash"></i></span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamResult } from '~/stores/exam'

const examStore = useExamStore()

const sortedResults = computed(() => {
  return [...examStore.results].sort((a, b) => b.createdAt - a.createdAt)
})

const highestScore = computed(() => {
  if (examStore.results.length === 0) return 0
  return Math.max(...examStore.results.map(r => r.userScore))
})

const passRate = computed(() => {
  if (examStore.results.length === 0) return 0
  const passed = examStore.results.filter(r => {
    const percent = (r.userScore / r.totalScore) * 100
    return percent >= 60
  }).length
  return Math.round((passed / examStore.results.length) * 100)
})

const getAccuracy = (result: ExamResult) => {
  return Math.round((result.correctCount / result.answers.length) * 100)
}

const getGrade = (result: ExamResult) => {
  const percent = (result.userScore / result.totalScore) * 100
  if (percent >= 90) return '优秀'
  if (percent >= 80) return '良好'
  if (percent >= 70) return '中等'
  if (percent >= 60) return '及格'
  return '不及格'
}

const getGradeTagClass = (result: ExamResult) => {
  const percent = (result.userScore / result.totalScore) * 100
  if (percent >= 90) return 'is-success'
  if (percent >= 80) return 'is-primary'
  if (percent >= 70) return 'is-info'
  if (percent >= 60) return 'is-warning'
  return 'is-danger'
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

const deleteResult = (id: string) => {
  if (confirm('确定要删除这条记录吗？')) {
    examStore.deleteResult(id)
  }
}
</script>
