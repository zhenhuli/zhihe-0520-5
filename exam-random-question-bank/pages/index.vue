<template>
  <div>
    <section class="hero is-primary is-bold mb-5">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-2">
            <span class="icon mr-3"><i class="fas fa-graduation-cap"></i></span>
            小学智能题库组卷系统
          </h1>
          <h2 class="subtitle">
            自定义题库 · 随机组卷 · 在线答题 · 自动判分 · 错题收录
          </h2>
        </div>
      </div>
    </section>

    <div class="columns is-multiline mb-5">
      <div class="column is-3">
        <div class="stat-card">
          <p class="stat-number">{{ examStore.stats.totalQuestions }}</p>
          <p class="stat-label">题目总数</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #00b894, #55efc4);">
          <p class="stat-number">{{ examStore.stats.totalPapers }}</p>
          <p class="stat-label">已生成试卷</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #0984e3, #74b9ff);">
          <p class="stat-number">{{ examStore.stats.totalResults }}</p>
          <p class="stat-label">答题记录</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="stat-card" style="background: linear-gradient(135deg, #e17055, #fab1a0);">
          <p class="stat-number">{{ examStore.stats.totalWrong }}</p>
          <p class="stat-label">错题收录</p>
        </div>
      </div>
    </div>

    <div class="columns mb-5">
      <div class="column is-6">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon mr-2"><i class="fas fa-th-list"></i></span>各年级题量
            </p>
          </header>
          <div class="card-content">
            <div v-for="g in grades" :key="g" class="mb-3">
              <div class="is-flex is-justify-content-space-between mb-1">
                <span class="has-text-weight-medium">
                  <span class="grade-badge mr-2">{{ g }}</span>{{ GRADE_LABELS[g] }}
                </span>
                <span class="has-text-grey">{{ examStore.gradeStats(g).total }} 道</span>
              </div>
              <div class="progress-bar">
                <div class="progress-bar-fill" :style="{ width: getGradePercent(g) + '%' }"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon mr-2"><i class="fas fa-chart-pie"></i></span>题型与难度分布
            </p>
          </header>
          <div class="card-content">
            <div class="mb-5">
              <p class="has-text-weight-medium mb-3">题型分布</p>
              <div class="mb-3">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span>单选题</span><span class="has-text-grey">{{ examStore.stats.singleCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.singleCount) + '%', background: '#0984e3' }"></div>
                </div>
              </div>
              <div class="mb-3">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span>多选题</span><span class="has-text-grey">{{ examStore.stats.multipleCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.multipleCount) + '%', background: '#6c5ce7' }"></div>
                </div>
              </div>
              <div>
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span>判断题</span><span class="has-text-grey">{{ examStore.stats.judgeCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.judgeCount) + '%', background: '#00b894' }"></div>
                </div>
              </div>
            </div>
            <div>
              <p class="has-text-weight-medium mb-3">难度分布</p>
              <div class="mb-3">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="difficulty-easy">简单</span><span class="has-text-grey">{{ examStore.stats.easyCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.easyCount) + '%', background: '#00b894' }"></div>
                </div>
              </div>
              <div class="mb-3">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="difficulty-medium">中等</span><span class="has-text-grey">{{ examStore.stats.mediumCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.mediumCount) + '%', background: '#fdcb6e' }"></div>
                </div>
              </div>
              <div>
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="difficulty-hard">困难</span><span class="has-text-grey">{{ examStore.stats.hardCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercent(examStore.stats.hardCount) + '%', background: '#e17055' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-3">
        <NuxtLink to="/questions" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-primary"><i class="fas fa-plus-circle fa-3x"></i></span>
            <p class="title is-5 mt-3">录入题目</p>
            <p class="subtitle is-7">添加单选/多选/判断题</p>
          </div>
        </NuxtLink>
      </div>
      <div class="column is-3">
        <NuxtLink to="/generate" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-success"><i class="fas fa-magic fa-3x"></i></span>
            <p class="title is-5 mt-3">生成试卷</p>
            <p class="subtitle is-7">配置题型难度一键组卷</p>
          </div>
        </NuxtLink>
      </div>
      <div class="column is-3">
        <NuxtLink to="/papers" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-info"><i class="fas fa-pencil-alt fa-3x"></i></span>
            <p class="title is-5 mt-3">开始答题</p>
            <p class="subtitle is-7">在线答题自动判分</p>
          </div>
        </NuxtLink>
      </div>
      <div class="column is-3">
        <NuxtLink to="/wrong" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-danger"><i class="fas fa-redo fa-3x"></i></span>
            <p class="title is-5 mt-3">错题本</p>
            <p class="subtitle is-7">错题收录重新刷题</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { GRADE_LABELS, type Grade } from '~/stores/exam'

const examStore = useExamStore()

const grades: Grade[] = [1, 2, 3, 4, 5, 6]

const getPercent = (count: number) => {
  if (examStore.stats.totalQuestions === 0) return 0
  return Math.round((count / examStore.stats.totalQuestions) * 100)
}

const getGradePercent = (grade: Grade) => {
  if (examStore.stats.totalQuestions === 0) return 0
  return Math.round((examStore.gradeStats(grade).total / examStore.stats.totalQuestions) * 100)
}
</script>
