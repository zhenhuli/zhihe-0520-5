<template>
  <div>
    <section class="hero is-primary is-bold mb-6">
      <div class="hero-body">
        <div class="container">
          <h1 class="title is-2">
            <span class="icon mr-3"><i class="fas fa-graduation-cap"></i></span>
            智能题库随机组卷系统
          </h1>
          <h2 class="subtitle">
            支持单选题、多选题、填空题录入，一键随机生成试卷，在线答题批改，错题智能汇总
          </h2>
        </div>
      </div>
    </section>

    <div class="columns is-multiline">
      <div class="column is-3">
        <div class="card">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-info">
              <i class="fas fa-question-circle fa-3x"></i>
            </span>
            <p class="title is-3 mt-3">{{ examStore.stats.totalQuestions }}</p>
            <p class="subtitle is-6">题目总数</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-success">
              <i class="fas fa-file-alt fa-3x"></i>
            </span>
            <p class="title is-3 mt-3">{{ examStore.stats.totalPapers }}</p>
            <p class="subtitle is-6">已生成试卷</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-warning">
              <i class="fas fa-chart-line fa-3x"></i>
            </span>
            <p class="title is-3 mt-3">{{ examStore.stats.totalResults }}</p>
            <p class="subtitle is-6">答题记录</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-danger">
              <i class="fas fa-star fa-3x"></i>
            </span>
            <p class="title is-3 mt-3">{{ examStore.stats.averageScore }}</p>
            <p class="subtitle is-6">平均得分</p>
          </div>
        </div>
      </div>
    </div>

    <div class="columns">
      <div class="column is-6">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon mr-2"><i class="fas fa-list"></i></span>
              题型分布
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              <div class="mb-4">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium">单选题</span>
                  <span class="has-text-grey">{{ examStore.stats.singleCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.singleCount) + '%', backgroundColor: '#3273dc' }"></div>
                </div>
              </div>
              <div class="mb-4">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium">多选题</span>
                  <span class="has-text-grey">{{ examStore.stats.multipleCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.multipleCount) + '%', backgroundColor: '#48c78e' }"></div>
                </div>
              </div>
              <div>
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium">填空题</span>
                  <span class="has-text-grey">{{ examStore.stats.fillCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.fillCount) + '%', backgroundColor: '#ffdd57' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-6">
        <div class="card">
          <header class="card-header">
            <p class="card-header-title">
              <span class="icon mr-2"><i class="fas fa-signal"></i></span>
              难度分布
            </p>
          </header>
          <div class="card-content">
            <div class="content">
              <div class="mb-4">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium difficulty-easy">简单</span>
                  <span class="has-text-grey">{{ examStore.stats.easyCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.easyCount) + '%', backgroundColor: '#48c78e' }"></div>
                </div>
              </div>
              <div class="mb-4">
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium difficulty-medium">中等</span>
                  <span class="has-text-grey">{{ examStore.stats.mediumCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.mediumCount) + '%', backgroundColor: '#ffdd57' }"></div>
                </div>
              </div>
              <div>
                <div class="is-flex is-justify-content-space-between mb-1">
                  <span class="has-text-weight-medium difficulty-hard">困难</span>
                  <span class="has-text-grey">{{ examStore.stats.hardCount }} 道</span>
                </div>
                <div class="progress-bar">
                  <div class="progress-bar-fill" :style="{ width: getPercentage(examStore.stats.hardCount) + '%', backgroundColor: '#f14668' }"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="columns mt-4">
      <div class="column is-4">
        <NuxtLink to="/questions" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-primary">
              <i class="fas fa-plus-circle fa-3x"></i>
            </span>
            <p class="title is-4 mt-3">录入题目</p>
            <p class="subtitle is-6">添加单选题、多选题、填空题到题库</p>
          </div>
        </NuxtLink>
      </div>
      <div class="column is-4">
        <NuxtLink to="/generate" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-success">
              <i class="fas fa-magic fa-3x"></i>
            </span>
            <p class="title is-4 mt-3">生成试卷</p>
            <p class="subtitle is-6">配置题型、分值、难度比例，一键组卷</p>
          </div>
        </NuxtLink>
      </div>
      <div class="column is-4">
        <NuxtLink to="/papers" class="card is-clickable">
          <div class="card-content has-text-centered">
            <span class="icon is-large has-text-info">
              <i class="fas fa-pencil-alt fa-3x"></i>
            </span>
            <p class="title is-4 mt-3">开始答题</p>
            <p class="subtitle is-6">选择试卷开始在线答题和自动批改</p>
          </div>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()

const getPercentage = (count: number) => {
  if (examStore.stats.totalQuestions === 0) return 0
  return Math.round((count / examStore.stats.totalQuestions) * 100)
}
</script>
