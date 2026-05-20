<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">错题汇总</h1>
        <p class="subtitle is-6">查看历史错题，分析薄弱环节</p>
      </div>
    </div>

    <div class="columns mb-5">
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="title is-3 has-text-danger">{{ wrongQuestions.length }}</p>
            <p class="subtitle is-6">错题总数</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="title is-3 has-text-info">{{ singleWrongCount }}</p>
            <p class="subtitle is-6">单选题错题</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="title is-3 has-text-primary">{{ multipleWrongCount }}</p>
            <p class="subtitle is-6">多选题错题</p>
          </div>
        </div>
      </div>
      <div class="column is-3">
        <div class="card has-text-centered">
          <div class="card-content">
            <p class="title is-3 has-text-warning">{{ fillWrongCount }}</p>
            <p class="subtitle is-6">填空题错题</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="wrongQuestions.length === 0" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-grey">
          <i class="fas fa-check-circle fa-3x"></i>
        </span>
        <p class="has-text-grey mt-3">暂无错题记录，继续加油！</p>
      </div>
    </div>

    <div v-else>
      <div class="card mb-5">
        <div class="card-content">
          <div class="field is-grouped is-grouped-multiline">
            <div class="control">
              <div class="tags has-addons">
                <span class="tag is-dark">题型筛选</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'all' }" @click="filterType = 'all'">全部</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'single' }" @click="filterType = 'single'">单选</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'multiple' }" @click="filterType = 'multiple'">多选</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'fill' }" @click="filterType = 'fill'">填空</span>
              </div>
            </div>
            <div class="control is-expanded">
              <input class="input" type="text" placeholder="搜索题目内容..." v-model="searchText">
            </div>
          </div>
        </div>
      </div>

      <div v-for="(question, index) in filteredWrongQuestions" :key="question.id" class="card mb-5">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <span class="tag is-danger is-medium mr-2">错题 #{{ index + 1 }}</span>
              <span class="tag mr-2" :class="getTypeTagClass(question.type)">{{ getTypeName(question.type) }}</span>
              <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ getDifficultyName(question.difficulty) }}</span>
            </div>
            <span class="tag is-warning">
              <span class="icon mr-1"><i class="fas fa-times-circle"></i></span>
              错误 {{ examStore.getQuestionWrongCount(question.id) }} 次
            </span>
          </div>
          <p class="is-size-5 has-text-weight-medium mb-4">{{ question.content }}</p>

          <div v-if="question.type !== 'fill'">
            <div v-for="(option, optIdx) in question.options" :key="optIdx"
                 class="question-option"
                 :class="getOptionClass(question, optIdx)">
              <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
              <span>{{ option }}</span>
              <span v-if="isCorrectOption(question, optIdx)" class="ml-2 has-text-success">
                <i class="fas fa-check-circle"></i> 正确答案
              </span>
            </div>
          </div>

          <div v-else>
            <div class="box">
              <p><span class="has-text-weight-medium">正确答案：</span>
                <span class="has-text-success">{{ question.answer }}</span>
              </p>
            </div>
          </div>

          <div class="mt-4 pt-4 has-border-top">
            <p class="has-text-grey is-size-7">
              <span class="icon mr-1"><i class="fas fa-folder"></i></span>
              分类：{{ question.category }}
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '~/stores/exam'

const examStore = useExamStore()

const filterType = ref<'all' | 'single' | 'multiple' | 'fill'>('all')
const searchText = ref('')

const wrongQuestions = computed(() => examStore.getWrongQuestions())

const singleWrongCount = computed(() => wrongQuestions.value.filter(q => q.type === 'single').length)
const multipleWrongCount = computed(() => wrongQuestions.value.filter(q => q.type === 'multiple').length)
const fillWrongCount = computed(() => wrongQuestions.value.filter(q => q.type === 'fill').length)

const filteredWrongQuestions = computed(() => {
  return wrongQuestions.value.filter(q => {
    if (filterType.value !== 'all' && q.type !== filterType.value) return false
    if (searchText.value && !q.content.includes(searchText.value)) return false
    return true
  })
})

const isCorrectOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const correctAnswer = question.answer
  return Array.isArray(correctAnswer)
    ? correctAnswer.includes(letter)
    : correctAnswer === letter
}

const getOptionClass = (question: Question, optIdx: number) => {
  if (isCorrectOption(question, optIdx)) return 'correct'
  return ''
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
