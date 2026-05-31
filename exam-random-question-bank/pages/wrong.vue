<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">错题本</h1>
        <p class="subtitle is-6">自动收录所有错题，支持重新刷题与查看解析</p>
      </div>
      <div class="field is-grouped">
        <div class="control">
          <button class="button is-primary" @click="startRepractice" :disabled="examStore.wrongQuestions.length === 0">
            <span class="icon"><i class="fas fa-redo"></i></span>
            <span>重新刷题</span>
          </button>
        </div>
        <div class="control">
          <button class="button is-danger" @click="confirmClearAll" :disabled="examStore.wrongQuestions.length === 0">
            <span class="icon"><i class="fas fa-trash-alt"></i></span>
            <span>清空错题</span>
          </button>
        </div>
      </div>
    </div>

    <div class="columns mb-5">
      <div class="column is-3">
        <div class="wrong-stat-card" style="background: linear-gradient(135deg, #e17055, #fab1a0); color: white;">
          <p class="stat-number">{{ examStore.wrongQuestions.length }}</p>
          <p class="stat-label">错题总数</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="wrong-stat-card" style="background: linear-gradient(135deg, #0984e3, #74b9ff); color: white;">
          <p class="stat-number">{{ singleWrongCount }}</p>
          <p class="stat-label">单选题错题</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="wrong-stat-card" style="background: linear-gradient(135deg, #6c5ce7, #a29bfe); color: white;">
          <p class="stat-number">{{ multipleWrongCount }}</p>
          <p class="stat-label">多选题错题</p>
        </div>
      </div>
      <div class="column is-3">
        <div class="wrong-stat-card" style="background: linear-gradient(135deg, #00b894, #55efc4); color: white;">
          <p class="stat-number">{{ judgeWrongCount }}</p>
          <p class="stat-label">判断题错题</p>
        </div>
      </div>
    </div>

    <div v-if="examStore.wrongQuestions.length === 0" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-success"><i class="fas fa-check-circle fa-3x"></i></span>
        <p class="has-text-grey mt-3">暂无错题记录，继续加油！</p>
      </div>
    </div>

    <div v-else-if="!isRepracticing">
      <div class="card mb-5">
        <div class="card-content">
          <div class="field is-grouped is-grouped-multiline">
            <div class="control">
              <div class="tags has-addons">
                <span class="tag is-dark">题型</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'all' }" @click="filterType = 'all'">全部</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'single' }" @click="filterType = 'single'">单选</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'multiple' }" @click="filterType = 'multiple'">多选</span>
                <span class="tag" :class="{ 'is-primary': filterType === 'judge' }" @click="filterType = 'judge'">判断</span>
              </div>
            </div>
            <div class="control is-expanded">
              <input class="input" type="text" placeholder="搜索题目内容..." v-model="searchText">
            </div>
          </div>
        </div>
      </div>

      <div v-for="(question, index) in filteredWrongQuestions" :key="question.id" class="card mb-4">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <span class="tag is-danger is-medium mr-2">错题 #{{ index + 1 }}</span>
              <span class="tag mr-2" :class="getTypeTagClass(question.type)">{{ TYPE_LABELS[question.type] }}</span>
              <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ DIFFICULTY_LABELS[question.difficulty] }}</span>
              <span class="grade-badge ml-2">{{ question.grade }}</span>
            </div>
            <div class="is-flex is-align-items-center">
              <span class="tag is-warning is-light is-small mr-2">
                <span class="icon mr-1"><i class="fas fa-times-circle"></i></span>
                错误 {{ examStore.getQuestionWrongCount(question.id) }} 次
              </span>
              <button class="button is-small is-danger is-light" @click="removeFromWrong(question.id)">
                <span class="icon"><i class="fas fa-times"></i></span>
                <span>移除</span>
              </button>
            </div>
          </div>
          <p class="is-size-5 has-text-weight-medium mb-4">{{ question.content }}</p>

          <div v-if="question.type === 'judge'">
            <div class="question-option" :class="{ 'correct': question.answer === 'A' }">
              <span class="icon mr-2"><i class="fas fa-check-circle"></i></span> 正确
              <span v-if="question.answer === 'A'" class="ml-2 has-text-success"><i class="fas fa-check"></i> 正确答案</span>
            </div>
            <div class="question-option" :class="{ 'correct': question.answer === 'B' }">
              <span class="icon mr-2"><i class="fas fa-times-circle"></i></span> 错误
              <span v-if="question.answer === 'B'" class="ml-2 has-text-success"><i class="fas fa-check"></i> 正确答案</span>
            </div>
          </div>

          <div v-else>
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

          <div v-if="question.explanation" class="explanation-box">
            <p class="is-size-7 has-text-weight-medium mb-1"><i class="fas fa-lightbulb mr-1"></i> 解析</p>
            <p class="is-size-7">{{ question.explanation }}</p>
          </div>

          <div class="mt-3 pt-3 has-border-top">
            <p class="is-size-7 has-text-grey">
              <span class="icon mr-1"><i class="fas fa-folder"></i></span>
              分类：{{ question.category }} · {{ question.grade }}年级
            </p>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="card mb-5">
      <div class="card-content">
        <div class="is-flex is-justify-content-space-between is-align-items-center mb-4">
          <h2 class="title is-4">错题重练</h2>
          <button class="button is-light" @click="isRepracticing = false">
            <span class="icon"><i class="fas fa-arrow-left"></i></span>
            <span>返回错题本</span>
          </button>
        </div>

        <div class="progress-bar mb-4">
          <div class="progress-bar-fill" :style="{ width: repracticeProgress + '%' }"></div>
        </div>

        <div :key="repracticeIndex" class="mb-5">
          <div class="is-flex is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <span class="tag is-primary is-medium mr-2">第 {{ repracticeIndex + 1 }} 题</span>
              <span class="tag mr-2" :class="getTypeTagClass(currentRepracticeQuestion.type)">{{ TYPE_LABELS[currentRepracticeQuestion.type] }}</span>
            </div>
            <span class="tag is-light">{{ repracticeIndex + 1 }} / {{ repracticeQuestions.length }}</span>
          </div>
          <p class="is-size-5 has-text-weight-medium mb-4">{{ currentRepracticeQuestion.content }}</p>

          <div v-if="currentRepracticeQuestion.type === 'single'">
            <div v-for="(option, optIdx) in currentRepracticeQuestion.options" :key="optIdx"
                 class="question-option"
                 :class="getRepracticeOptionClass(String.fromCharCode(65 + optIdx))"
                 @click="selectRepracticeAnswer(String.fromCharCode(65 + optIdx))">
              <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
              <span>{{ option }}</span>
            </div>
          </div>

          <div v-else-if="currentRepracticeQuestion.type === 'multiple'">
            <div v-for="(option, optIdx) in currentRepracticeQuestion.options" :key="optIdx"
                 class="question-option"
                 :class="getRepracticeMultipleClass(String.fromCharCode(65 + optIdx))"
                 @click="toggleRepracticeMultiple(String.fromCharCode(65 + optIdx))">
              <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
              <span>{{ option }}</span>
            </div>
            <p class="help mt-2">此题为多选题，请选择所有正确答案</p>
          </div>

          <div v-else-if="currentRepracticeQuestion.type === 'judge'">
            <div class="question-option"
                 :class="getRepracticeOptionClass('A')"
                 @click="selectRepracticeAnswer('A')">
              <span class="icon mr-2 has-text-success"><i class="fas fa-check-circle"></i></span>
              <span class="has-text-weight-medium">正确</span>
            </div>
            <div class="question-option"
                 :class="getRepracticeOptionClass('B')"
                 @click="selectRepracticeAnswer('B')">
              <span class="icon mr-2 has-text-danger"><i class="fas fa-times-circle"></i></span>
              <span class="has-text-weight-medium">错误</span>
            </div>
          </div>

          <div v-if="repracticeAnswered" class="mt-4">
            <div v-if="repracticeIsCorrect" class="notification is-success is-light">
              <span class="icon"><i class="fas fa-check-circle"></i></span> 回答正确！
            </div>
            <div v-else class="notification is-danger is-light">
              <span class="icon"><i class="fas fa-times-circle"></i></span> 回答错误。
              <strong>正确答案：</strong>
              <span v-if="currentRepracticeQuestion.type === 'multiple'">{{ (currentRepracticeQuestion.answer as string[]).join('、') }}</span>
              <span v-else-if="currentRepracticeQuestion.type === 'judge'">{{ currentRepracticeQuestion.answer === 'A' ? '正确' : '错误' }}</span>
              <span v-else>{{ currentRepracticeQuestion.answer }}</span>
            </div>

            <div v-if="currentRepracticeQuestion.explanation" class="explanation-box">
              <p class="is-size-7 has-text-weight-medium mb-1"><i class="fas fa-lightbulb mr-1"></i> 解析</p>
              <p class="is-size-7">{{ currentRepracticeQuestion.explanation }}</p>
            </div>

            <div class="is-flex is-justify-content-center mt-4">
              <button v-if="repracticeIndex < repracticeQuestions.length - 1" class="button is-primary" @click="nextRepractice">
                <span>下一题</span>
                <span class="icon"><i class="fas fa-arrow-right"></i></span>
              </button>
              <button v-else class="button is-success" @click="finishRepractice">
                <span class="icon"><i class="fas fa-check"></i></span>
                <span>完成重练</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': showClearConfirm }">
      <div class="modal-background" @click="showClearConfirm = false"></div>
      <div class="modal-card" style="max-width: 400px;">
        <header class="modal-card-head">
          <p class="modal-card-title">确认清空</p>
          <button class="delete" aria-label="close" @click="showClearConfirm = false"></button>
        </header>
        <section class="modal-card-body">
          <p>确定要清空所有错题记录吗？此操作不可撤销。</p>
          <p class="mt-2 has-text-grey">当前共有 {{ examStore.wrongQuestions.length }} 道错题</p>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="clearAll">
            <span class="icon"><i class="fas fa-trash"></i></span>
            <span>确认清空</span>
          </button>
          <button class="button" @click="showClearConfirm = false">取消</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TYPE_LABELS, DIFFICULTY_LABELS, type Question, type QuestionType } from '~/stores/exam'

const examStore = useExamStore()

const filterType = ref<'all' | QuestionType>('all')
const searchText = ref('')
const showClearConfirm = ref(false)

const isRepracticing = ref(false)
const repracticeIndex = ref(0)
const repracticeQuestions = ref<Question[]>([])
const repracticeAnswer = ref<string | string[]>('')
const repracticeAnswered = ref(false)

const singleWrongCount = computed(() => examStore.wrongQuestions.filter(q => q.type === 'single').length)
const multipleWrongCount = computed(() => examStore.wrongQuestions.filter(q => q.type === 'multiple').length)
const judgeWrongCount = computed(() => examStore.wrongQuestions.filter(q => q.type === 'judge').length)

const filteredWrongQuestions = computed(() => {
  return examStore.wrongQuestions.filter(q => {
    if (filterType.value !== 'all' && q.type !== filterType.value) return false
    if (searchText.value && !q.content.includes(searchText.value)) return false
    return true
  })
})

const currentRepracticeQuestion = computed(() => {
  return repracticeQuestions.value[repracticeIndex.value] || {} as Question
})

const repracticeProgress = computed(() => {
  if (repracticeQuestions.value.length === 0) return 0
  return Math.round(((repracticeIndex.value + 1) / repracticeQuestions.value.length) * 100)
})

const repracticeIsCorrect = computed(() => {
  if (!repracticeAnswered.value || !currentRepracticeQuestion.value?.id) return false
  const q = currentRepracticeQuestion.value
  if (q.type === 'multiple') {
    const userAns = (repracticeAnswer.value as string[]).sort().join(',')
    const correctAns = (q.answer as string[]).sort().join(',')
    return userAns === correctAns
  }
  return repracticeAnswer.value === q.answer
})

const isCorrectOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const correctAnswer = question.answer
  return Array.isArray(correctAnswer) ? correctAnswer.includes(letter) : correctAnswer === letter
}

const getOptionClass = (question: Question, optIdx: number) => {
  if (isCorrectOption(question, optIdx)) return 'correct'
  return ''
}

const getTypeTagClass = (type: string) => {
  const map: Record<string, string> = { single: 'is-info', multiple: 'is-primary', judge: 'is-success' }
  return map[type] || ''
}

const getDifficultyTagClass = (diff: string) => {
  const map: Record<string, string> = { easy: 'is-success', medium: 'is-warning', hard: 'is-danger' }
  return map[diff] || ''
}

const confirmClearAll = () => {
  showClearConfirm.value = true
}

const clearAll = () => {
  examStore.clearWrongQuestions()
  showClearConfirm.value = false
}

const removeFromWrong = (questionId: string) => {
  examStore.removeWrongQuestion(questionId)
}

const startRepractice = () => {
  repracticeQuestions.value = examStore.shuffleArray([...examStore.wrongQuestions])
  repracticeIndex.value = 0
  repracticeAnswer.value = repracticeQuestions.value[0]?.type === 'multiple' ? [] : ''
  repracticeAnswered.value = false
  isRepracticing.value = true
}

const selectRepracticeAnswer = (answer: string) => {
  if (repracticeAnswered.value) return
  repracticeAnswer.value = answer
  repracticeAnswered.value = true
  if (repracticeIsCorrect.value) {
    examStore.removeWrongQuestion(currentRepracticeQuestion.value.id)
  }
}

const toggleRepracticeMultiple = (letter: string) => {
  if (repracticeAnswered.value) return
  const current = repracticeAnswer.value as string[]
  if (current.includes(letter)) {
    repracticeAnswer.value = current.filter(l => l !== letter)
  } else {
    repracticeAnswer.value = [...current, letter]
  }
}

const getRepracticeOptionClass = (option: string) => {
  if (!repracticeAnswered.value) {
    const current = repracticeAnswer.value
    if (Array.isArray(current)) return current.includes(option) ? 'selected' : ''
    return current === option ? 'selected' : ''
  }
  const q = currentRepracticeQuestion.value
  const isCorrect = q.answer === option || (Array.isArray(q.answer) && q.answer.includes(option))
  const isSelected = option === repracticeAnswer.value || (Array.isArray(repracticeAnswer.value) && repracticeAnswer.value.includes(option))
  if (isCorrect) return 'correct'
  if (isSelected && !isCorrect) return 'wrong'
  return ''
}

const getRepracticeMultipleClass = (letter: string) => {
  const current = repracticeAnswer.value as string[]
  if (!repracticeAnswered.value) {
    return current.includes(letter) ? 'selected' : ''
  }
  const q = currentRepracticeQuestion.value
  const correctAnswers = q.answer as string[]
  if (correctAnswers.includes(letter)) return 'correct'
  if (current.includes(letter) && !correctAnswers.includes(letter)) return 'wrong'
  return ''
}

const nextRepractice = () => {
  repracticeIndex.value++
  const nextQ = repracticeQuestions.value[repracticeIndex.value]
  if (nextQ) {
    repracticeAnswer.value = nextQ.type === 'multiple' ? [] : ''
    repracticeAnswered.value = false
  }
}

const finishRepractice = () => {
  isRepracticing.value = false
}
</script>
