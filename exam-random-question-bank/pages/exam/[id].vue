<template>
  <div>
    <div v-if="!examStore.currentPaper" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-grey"><i class="fas fa-spinner fa-spin fa-3x"></i></span>
        <p class="has-text-grey mt-3">加载试卷中...</p>
      </div>
    </div>

    <div v-else-if="!showResult">
      <div class="card mb-5">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <h1 class="title is-4">{{ examStore.currentPaper.title }}</h1>
              <p class="subtitle is-6 mb-0">
                <span class="grade-badge mr-1">{{ examStore.currentPaper.grade }}</span>
                {{ examStore.currentPaper.grade }}年级 · 共 {{ examStore.currentPaper.questions.length }} 题 · {{ examStore.currentPaper.totalScore }} 分
              </p>
            </div>
            <div class="has-text-right">
              <p class="has-text-grey is-size-7">用时</p>
              <p class="timer-display">{{ formattedTime }}</p>
            </div>
          </div>
          <div class="progress-bar mt-4">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
          <div class="is-flex is-justify-content-space-between mt-2">
            <span class="is-size-7 has-text-grey">已完成 {{ answeredCount }} / {{ examStore.currentPaper.questions.length }}</span>
            <span class="is-size-7 has-text-grey">{{ progressPercent }}%</span>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column is-9">
          <div class="card mb-4" :id="`question-${currentQuestionIndex}`">
            <div class="card-content">
              <div class="is-flex is-justify-content-space-between mb-4">
                <div class="is-flex is-align-items-center">
                  <span class="tag is-primary is-medium mr-2">第 {{ currentQuestionIndex + 1 }} 题</span>
                  <span class="tag mr-2" :class="getTypeTagClass(currentQuestion.type)">{{ TYPE_LABELS[currentQuestion.type] }}</span>
                  <span class="tag" :class="getDifficultyTagClass(currentQuestion.difficulty)">{{ DIFFICULTY_LABELS[currentQuestion.difficulty] }}</span>
                </div>
                <span class="has-text-weight-medium has-text-primary">{{ getQuestionScore(currentQuestion.type) }} 分</span>
              </div>
              <p class="is-size-5 has-text-weight-medium mb-5">{{ currentQuestion.content }}</p>

              <div v-if="currentQuestion.type === 'single'">
                <div v-for="(option, optIdx) in currentQuestion.options" :key="optIdx"
                     class="question-option"
                     :class="{ 'selected': getCurrentAnswer(currentQuestion.id) === String.fromCharCode(65 + optIdx) }"
                     @click="selectSingleAnswer(currentQuestion.id, optIdx)">
                  <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span>{{ option }}</span>
                </div>
              </div>

              <div v-else-if="currentQuestion.type === 'multiple'">
                <div v-for="(option, optIdx) in currentQuestion.options" :key="optIdx"
                     class="question-option"
                     :class="{ 'selected': (getCurrentAnswer(currentQuestion.id) as string[]).includes(String.fromCharCode(65 + optIdx)) }"
                     @click="toggleMultipleAnswer(currentQuestion.id, optIdx)">
                  <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span>{{ option }}</span>
                </div>
                <p class="help mt-2">此题为多选题，请选择所有正确答案</p>
              </div>

              <div v-else-if="currentQuestion.type === 'judge'">
                <div class="question-option"
                     :class="{ 'selected': getCurrentAnswer(currentQuestion.id) === 'A' }"
                     @click="examStore.setAnswer(currentQuestion.id, 'A')">
                  <span class="icon mr-2 has-text-success"><i class="fas fa-check-circle"></i></span>
                  <span class="has-text-weight-medium">正确</span>
                </div>
                <div class="question-option"
                     :class="{ 'selected': getCurrentAnswer(currentQuestion.id) === 'B' }"
                     @click="examStore.setAnswer(currentQuestion.id, 'B')">
                  <span class="icon mr-2 has-text-danger"><i class="fas fa-times-circle"></i></span>
                  <span class="has-text-weight-medium">错误</span>
                </div>
              </div>
            </div>
          </div>

          <div class="is-flex is-justify-content-space-between is-align-items-center mb-6">
            <button class="button is-medium" @click="prevQuestion" :disabled="currentQuestionIndex === 0">
              <span class="icon"><i class="fas fa-arrow-left"></i></span>
              <span>上一题</span>
            </button>
            <div class="tags">
              <span class="tag is-light">{{ currentQuestionIndex + 1 }} / {{ examStore.currentPaper.questions.length }}</span>
            </div>
            <button v-if="currentQuestionIndex < examStore.currentPaper.questions.length - 1" class="button is-primary is-medium" @click="nextQuestion">
              <span>下一题</span>
              <span class="icon"><i class="fas fa-arrow-right"></i></span>
            </button>
            <button v-else class="button is-success is-medium" @click="submitExam" :disabled="answeredCount === 0">
              <span class="icon"><i class="fas fa-paper-plane"></i></span>
              <span>交卷</span>
            </button>
          </div>
        </div>

        <div class="column is-3">
          <div class="card" style="position: sticky; top: 20px;">
            <div class="card-header">
              <p class="card-header-title">答题卡</p>
            </div>
            <div class="card-content">
              <div class="is-flex is-flex-wrap-wrap">
                <button v-for="(question, index) in examStore.currentPaper.questions" :key="question.id"
                        class="button is-small mb-2 mr-1"
                        :class="[
                          isAnswered(question.id) ? 'is-primary' : 'is-light',
                          currentQuestionIndex === index ? 'is-outlined has-text-weight-bold' : ''
                        ]"
                        @click="currentQuestionIndex = index">
                  {{ index + 1 }}
                </button>
              </div>
              <div class="mt-4 pt-4 has-border-top">
                <div class="is-flex is-justify-content-space-between mb-2">
                  <span class="has-text-grey is-size-7">已答题数</span>
                  <span class="has-text-weight-bold has-text-primary is-size-7">{{ answeredCount }}</span>
                </div>
                <div class="is-flex is-justify-content-space-between">
                  <span class="has-text-grey is-size-7">未答题数</span>
                  <span class="has-text-weight-bold has-text-grey is-size-7">{{ examStore.currentPaper.questions.length - answeredCount }}</span>
                </div>
              </div>
              <button class="button is-success is-fullwidth mt-4" @click="submitExam" :disabled="answeredCount === 0">
                <span class="icon"><i class="fas fa-paper-plane"></i></span>
                <span>交卷</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="examStore.currentResult">
      <div class="notification" :class="resultNotificationClass" style="margin-bottom: 1.5rem;">
        <div class="is-flex is-justify-content-space-between is-align-items-center">
          <div>
            <p class="title is-2 mb-0">{{ examStore.currentResult.paperTitle }}</p>
            <p class="subtitle is-5 mt-2">
              <span class="grade-badge mr-1">{{ examStore.currentResult.grade }}</span>
              {{ examStore.currentResult.grade }}年级 · 答题完成
            </p>
          </div>
          <div class="has-text-right">
            <p class="is-size-7 has-text-grey mb-1">您的得分</p>
            <p class="title is-1 mb-0">{{ examStore.currentResult.userScore }} <span class="is-size-4">/ {{ examStore.currentResult.totalScore }}</span></p>
            <p class="is-size-7 has-text-grey">用时 {{ formatDuration(examStore.currentResult.duration) }}</p>
          </div>
        </div>
      </div>

      <div class="columns mb-5">
        <div class="column is-3">
          <div class="card has-text-centered">
            <div class="card-content">
              <p class="title is-3 has-text-success">{{ examStore.currentResult.correctCount }}</p>
              <p class="subtitle is-6">答对题数</p>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="card has-text-centered">
            <div class="card-content">
              <p class="title is-3 has-text-danger">{{ examStore.currentResult.wrongCount }}</p>
              <p class="subtitle is-6">答错题数</p>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="card has-text-centered">
            <div class="card-content">
              <p class="title is-3 has-text-info">{{ accuracyPercent }}%</p>
              <p class="subtitle is-6">正确率</p>
            </div>
          </div>
        </div>
        <div class="column is-3">
          <div class="card has-text-centered">
            <div class="card-content">
              <p class="title is-3 has-text-warning">{{ getGrade }}</p>
              <p class="subtitle is-6">评级</p>
            </div>
          </div>
        </div>
      </div>

      <h2 class="title is-5 mb-4">
        <span class="icon"><i class="fas fa-list"></i></span> 答题详情
      </h2>

      <div v-for="(question, index) in examStore.currentPaper.questions" :key="question.id" class="card mb-4">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <span class="tag is-primary is-medium mr-2">第 {{ index + 1 }} 题</span>
              <span class="tag mr-2" :class="getTypeTagClass(question.type)">{{ TYPE_LABELS[question.type] }}</span>
              <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ DIFFICULTY_LABELS[question.difficulty] }}</span>
            </div>
            <span class="tag" :class="getAnswerResult(question.id).isCorrect ? 'is-success' : 'is-danger'">
              {{ getAnswerResult(question.id).isCorrect ? '✓ 答对' : '✗ 答错' }}
              <span class="ml-1">{{ getAnswerResult(question.id).score }} / {{ getQuestionScore(question.type) }} 分</span>
            </span>
          </div>
          <p class="is-size-5 has-text-weight-medium mb-4">{{ question.content }}</p>

          <div v-if="question.type !== 'judge'">
            <div v-for="(option, optIdx) in question.options" :key="optIdx"
                 class="question-option"
                 :class="getOptionClass(question, optIdx)">
              <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
              <span>{{ option }}</span>
              <span v-if="isCorrectOption(question, optIdx)" class="ml-2 has-text-success">
                <i class="fas fa-check-circle"></i> 正确答案
              </span>
              <span v-else-if="isUserWrongOption(question, optIdx)" class="ml-2 has-text-danger">
                <i class="fas fa-times-circle"></i> 您的选择
              </span>
            </div>
          </div>

          <div v-else>
            <div class="question-option" :class="getJudgeOptionClass(question, 'A')">
              <span class="icon mr-2"><i class="fas fa-check-circle"></i></span> 正确
              <span v-if="question.answer === 'A'" class="ml-2 has-text-success"><i class="fas fa-check"></i> 正确答案</span>
              <span v-if="getCurrentAnswer(question.id) === 'A' && question.answer !== 'A'" class="ml-2 has-text-danger"><i class="fas fa-times"></i> 您的选择</span>
            </div>
            <div class="question-option" :class="getJudgeOptionClass(question, 'B')">
              <span class="icon mr-2"><i class="fas fa-times-circle"></i></span> 错误
              <span v-if="question.answer === 'B'" class="ml-2 has-text-success"><i class="fas fa-check"></i> 正确答案</span>
              <span v-if="getCurrentAnswer(question.id) === 'B' && question.answer !== 'B'" class="ml-2 has-text-danger"><i class="fas fa-times"></i> 您的选择</span>
            </div>
          </div>

          <div v-if="question.explanation" class="explanation-box">
            <p class="is-size-7 has-text-weight-medium mb-1"><i class="fas fa-lightbulb mr-1"></i> 解析</p>
            <p class="is-size-7">{{ question.explanation }}</p>
          </div>
        </div>
      </div>

      <div class="is-flex is-justify-content-center mt-6 mb-4">
        <NuxtLink to="/papers" class="button is-primary is-large mr-3">
          <span class="icon"><i class="fas fa-list"></i></span>
          <span>返回试卷列表</span>
        </NuxtLink>
        <NuxtLink to="/wrong" class="button is-warning is-large">
          <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
          <span>查看错题本</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { TYPE_LABELS, DIFFICULTY_LABELS, type Question, type Grade } from '~/stores/exam'

const route = useRoute()
const examStore = useExamStore()
const router = useRouter()

const showResult = ref(false)
const currentQuestionIndex = ref(0)
const elapsedSeconds = ref(0)
let timerInterval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  const paperId = route.params.id as string
  examStore.startExam(paperId)
  if (!examStore.currentPaper) {
    router.push('/papers')
    return
  }
  startTimer()
})

onBeforeUnmount(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
  }
})

const startTimer = () => {
  timerInterval = setInterval(() => {
    elapsedSeconds.value = Math.floor((Date.now() - examStore.examStartTime) / 1000)
  }, 1000)
}

const formattedTime = computed(() => {
  const mins = Math.floor(elapsedSeconds.value / 60)
  const secs = elapsedSeconds.value % 60
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
})

const currentQuestion = computed(() => {
  if (!examStore.currentPaper) return {} as Question
  return examStore.currentPaper.questions[currentQuestionIndex.value]
})

const answeredCount = computed(() => {
  if (!examStore.currentPaper) return 0
  return examStore.currentAnswers.filter(a => {
    if (Array.isArray(a.userAnswer)) return a.userAnswer.length > 0
    return a.userAnswer !== ''
  }).length
})

const progressPercent = computed(() => {
  if (!examStore.currentPaper) return 0
  return Math.round((answeredCount.value / examStore.currentPaper.questions.length) * 100)
})

const accuracyPercent = computed(() => {
  if (!examStore.currentResult) return 0
  return Math.round((examStore.currentResult.correctCount / examStore.currentResult.answers.length) * 100)
})

const getGrade = computed(() => {
  if (!examStore.currentResult) return '-'
  const percent = (examStore.currentResult.userScore / examStore.currentResult.totalScore) * 100
  if (percent >= 90) return '优秀'
  if (percent >= 80) return '良好'
  if (percent >= 70) return '中等'
  if (percent >= 60) return '及格'
  return '不及格'
})

const resultNotificationClass = computed(() => {
  if (!examStore.currentResult) return 'is-info'
  const percent = (examStore.currentResult.userScore / examStore.currentResult.totalScore) * 100
  if (percent >= 90) return 'is-success'
  if (percent >= 60) return 'is-primary'
  return 'is-warning'
})

const prevQuestion = () => {
  if (currentQuestionIndex.value > 0) {
    currentQuestionIndex.value--
  }
}

const nextQuestion = () => {
  if (examStore.currentPaper && currentQuestionIndex.value < examStore.currentPaper.questions.length - 1) {
    currentQuestionIndex.value++
  }
}

const getCurrentAnswer = (questionId: string) => {
  const record = examStore.currentAnswers.find(a => a.questionId === questionId)
  return record ? record.userAnswer : ''
}

const isAnswered = (questionId: string) => {
  const answer = getCurrentAnswer(questionId)
  if (Array.isArray(answer)) return answer.length > 0
  return answer !== ''
}

const selectSingleAnswer = (questionId: string, optIdx: number) => {
  examStore.setAnswer(questionId, String.fromCharCode(65 + optIdx))
}

const toggleMultipleAnswer = (questionId: string, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const current = getCurrentAnswer(questionId) as string[]
  if (current.includes(letter)) {
    examStore.setAnswer(questionId, current.filter(l => l !== letter))
  } else {
    examStore.setAnswer(questionId, [...current, letter])
  }
}

const getQuestionScore = (type: string) => {
  if (!examStore.currentPaper) return 0
  if (type === 'single') return examStore.currentPaper.config.singleScore
  if (type === 'multiple') return examStore.currentPaper.config.multipleScore
  return examStore.currentPaper.config.judgeScore
}

const submitExam = () => {
  const unanswered = examStore.currentPaper!.questions.length - answeredCount.value
  const msg = unanswered > 0
    ? `您还有 ${unanswered} 题未作答，确定要提交试卷吗？`
    : '确定要提交试卷吗？提交后无法修改答案。'
  if (confirm(msg)) {
    if (timerInterval) clearInterval(timerInterval)
    examStore.submitExam()
    showResult.value = true
  }
}

const getAnswerResult = (questionId: string) => {
  if (!examStore.currentResult) return { isCorrect: false, score: 0 }
  const answer = examStore.currentResult.answers.find(a => a.questionId === questionId)
  return answer ? { isCorrect: answer.isCorrect, score: answer.score } : { isCorrect: false, score: 0 }
}

const isCorrectOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const correctAnswer = question.answer
  return Array.isArray(correctAnswer) ? correctAnswer.includes(letter) : correctAnswer === letter
}

const isUserWrongOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const userAnswer = getCurrentAnswer(question.id)
  const isSelected = Array.isArray(userAnswer) ? userAnswer.includes(letter) : userAnswer === letter
  return isSelected && !isCorrectOption(question, optIdx)
}

const getOptionClass = (question: Question, optIdx: number) => {
  const isCorrect = isCorrectOption(question, optIdx)
  const isWrong = isUserWrongOption(question, optIdx)
  if (isCorrect) return 'correct'
  if (isWrong) return 'wrong'
  return ''
}

const getJudgeOptionClass = (question: Question, option: string) => {
  const isCorrect = question.answer === option
  const isSelected = getCurrentAnswer(question.id) === option
  if (isCorrect) return 'correct'
  if (isSelected && !isCorrect) return 'wrong'
  return ''
}

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
  const secs = seconds % 60
  if (mins === 0) return `${secs} 秒`
  return `${mins} 分 ${secs} 秒`
}

const getTypeTagClass = (type: string) => {
  const map: Record<string, string> = { single: 'is-info', multiple: 'is-primary', judge: 'is-success' }
  return map[type] || ''
}

const getDifficultyTagClass = (diff: string) => {
  const map: Record<string, string> = { easy: 'is-success', medium: 'is-warning', hard: 'is-danger' }
  return map[diff] || ''
}
</script>
