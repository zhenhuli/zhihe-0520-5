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
        <span class="icon is-large has-text-grey">
          <i class="fas fa-file-alt fa-3x"></i>
        </span>
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
                <p class="has-text-grey is-size-7">{{ formatDate(paper.createdAt) }}</p>
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
              <div class="is-flex is-justify-content-space-between">
                <span class="has-text-grey">填空题</span>
                <span>{{ paper.questions.filter(q => q.type === 'fill').length }} 道 × {{ paper.config.fillScore }}分</span>
              </div>
            </div>
            <div class="mt-4 is-flex is-justify-content-space-between">
              <div class="tags">
                <span class="tag is-success is-light">简单: {{ Math.round(paper.config.easyRatio * 100) }}%</span>
                <span class="tag is-warning is-light">中等: {{ Math.round(paper.config.mediumRatio * 100) }}%</span>
                <span class="tag is-danger is-light">困难: {{ Math.round(paper.config.hardRatio * 100) }}%</span>
              </div>
            </div>
          </div>
          <footer class="card-footer">
            <NuxtLink :to="`/exam/${paper.id}`" class="card-footer-item has-text-primary">
              <span class="icon"><i class="fas fa-pencil-alt"></i></span>
              <span>开始答题</span>
            </NuxtLink>
            <button class="card-footer-item has-text-info" @click="viewPaper(paper)">
              <span class="icon"><i class="fas fa-eye"></i></span>
              <span>查看详情</span>
            </button>
            <button class="card-footer-item has-text-danger" @click="confirmDelete(paper)">
              <span class="icon"><i class="fas fa-trash"></i></span>
              <span>删除</span>
            </button>
          </footer>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': showDetailModal }">
      <div class="modal-background" @click="showDetailModal = false"></div>
      <div class="modal-card" style="max-width: 800px; max-height: 80vh;">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ selectedPaper?.title }} - 试卷详情</p>
          <button class="delete" aria-label="close" @click="showDetailModal = false"></button>
        </header>
        <section class="modal-card-body" style="overflow-y: auto;">
          <div v-if="selectedPaper" class="content">
            <div v-for="(question, index) in selectedPaper.questions" :key="question.id" class="box">
              <div class="is-flex is-justify-content-space-between mb-2">
                <span class="tag" :class="getTypeTagClass(question.type)">{{ getTypeName(question.type) }}</span>
                <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ getDifficultyName(question.difficulty) }}</span>
              </div>
              <p class="has-text-weight-medium">{{ index + 1 }}. {{ question.content }}</p>
              <div v-if="question.type !== 'fill'" class="mt-3">
                <div v-for="(option, optIdx) in question.options" :key="optIdx" class="mb-1">
                  <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span>{{ option }}</span>
                </div>
              </div>
              <div class="mt-3">
                <p class="has-text-success">
                  <span class="has-text-weight-medium">正确答案：</span>
                  <span v-if="question.type === 'multiple'">{{ (question.answer as string[]).join('、') }}</span>
                  <span v-else>{{ question.answer }}</span>
                </p>
              </div>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button" @click="showDetailModal = false">关闭</button>
        </footer>
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
          <div class="mt-3 p-3 has-background-light">
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

const showDetailModal = ref(false)
const showDeleteConfirm = ref(false)
const selectedPaper = ref<ExamPaper | null>(null)
const paperToDelete = ref<ExamPaper | null>(null)

const viewPaper = (paper: ExamPaper) => {
  selectedPaper.value = paper
  showDetailModal.value = true
}

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

const getTypeName = (type: string) => {
  const map: Record<string, string> = {
    single: '单选',
    multiple: '多选',
    fill: '填空'
  }
  return map[type] || type
}

const getTypeTagClass = (type: string) => {
  const map: Record<string, string> = {
    single: 'is-info',
    multiple: 'is-primary',
    fill: 'is-warning'
  }
  return map[type] || ''
}

const getDifficultyName = (diff: string) => {
  const map: Record<string, string> = {
    easy: '简单',
    medium: '中等',
    hard: '困难'
  }
  return map[diff] || diff
}

const getDifficultyTagClass = (diff: string) => {
  const map: Record<string, string> = {
    easy: 'is-success',
    medium: 'is-warning',
    hard: 'is-danger'
  }
  return map[diff] || ''
}
</script>
