<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">试卷列表</h1>
        <p class="subtitle is-6">查看已生成的试卷，开始在线答题</p>
      </div>
      <NuxtLink to="/generate" class="button is-primary">
        <span class="icon"><i class="fas fa-plus"></i></span>
        <span>生成新试卷</span>
      </NuxtLink>
    </div>

    <div v-if="examStore.papers.length === 0" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-grey"><i class="fas fa-file-alt fa-3x"></i></span>
        <p class="has-text-grey mt-3">暂无试卷，请先前往组卷配置页面生成试卷</p>
        <NuxtLink to="/generate" class="button is-primary mt-4">
          <span class="icon"><i class="fas fa-magic"></i></span>
          <span>去生成试卷</span>
        </NuxtLink>
      </div>
    </div>

    <div v-else class="columns is-multiline">
      <div class="column is-4" v-for="paper in examStore.papers" :key="paper.id">
        <div class="card">
          <div class="card-content">
            <div class="is-flex is-justify-content-space-between is-align-items-start mb-3">
              <div>
                <p class="title is-5">{{ paper.title }}</p>
                <p class="has-text-grey is-size-7">
                  <span class="grade-badge mr-1">{{ paper.grade }}</span>{{ paper.grade }}年级
                  · {{ formatDate(paper.createdAt) }}
                </p>
              </div>
              <span class="tag is-primary">{{ paper.totalScore }}分</span>
            </div>
            <div class="content">
              <div class="is-flex is-justify-content-space-between mb-1">
                <span class="has-text-grey">单选题</span>
                <span>{{ paper.questions.filter(q => q.type === 'single').length }} 道 × {{ paper.config.singleScore }}分</span>
              </div>
              <div class="is-flex is-justify-content-space-between mb-1">
                <span class="has-text-grey">多选题</span>
                <span>{{ paper.questions.filter(q => q.type === 'multiple').length }} 道 × {{ paper.config.multipleScore }}分</span>
              </div>
              <div class="is-flex is-justify-content-space-between mb-1">
                <span class="has-text-grey">判断题</span>
                <span>{{ paper.questions.filter(q => q.type === 'judge').length }} 道 × {{ paper.config.judgeScore }}分</span>
              </div>
            </div>
            <div class="mt-3">
              <div class="tags">
                <span class="tag is-success is-light is-small">简单 {{ Math.round(paper.config.easyRatio * 100) }}%</span>
                <span class="tag is-warning is-light is-small">中等 {{ Math.round(paper.config.mediumRatio * 100) }}%</span>
                <span class="tag is-danger is-light is-small">困难 {{ Math.round(paper.config.hardRatio * 100) }}%</span>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <NuxtLink :to="`/exam/${paper.id}`" class="card-footer-item has-text-primary">
              <span class="icon"><i class="fas fa-pencil-alt"></i></span>
              <span>开始答题</span>
            </NuxtLink>
            <button class="card-footer-item has-text-danger" @click="confirmDelete(paper)">
              <span class="icon"><i class="fas fa-trash"></i></span>
              <span>删除</span>
            </button>
          </footer>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': showDeleteConfirm }">
      <div class="modal-background"></div>
      <div class="modal-card" style="max-width: 400px;">
        <header class="modal-card-head">
          <p class="modal-card-title">确认删除</p>
          <button class="delete" aria-label="close" @click="showDeleteConfirm = false"></button>
        </header>
        <section class="modal-card-body">
          <p>确定要删除这份试卷吗？此操作不可撤销。</p>
          <div class="mt-3 p-3 has-background-light" style="border-radius: 8px;">
            <p class="has-text-weight-medium">{{ paperToDelete?.title }}</p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="deletePaper">
            <span class="icon"><i class="fas fa-trash"></i></span>
            <span>确认删除</span>
          </button>
          <button class="button" @click="showDeleteConfirm = false">取消</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ExamPaper } from '~/stores/exam'

const examStore = useExamStore()

const showDeleteConfirm = ref(false)
const paperToDelete = ref<ExamPaper | null>(null)

const confirmDelete = (paper: ExamPaper) => {
  paperToDelete.value = paper
  showDeleteConfirm.value = true
}

const deletePaper = () => {
  if (paperToDelete.value) {
    examStore.deletePaper(paperToDelete.value.id)
    showDeleteConfirm.value = false
    paperToDelete.value = null
  }
}

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}
</script>
