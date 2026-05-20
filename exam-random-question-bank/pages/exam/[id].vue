<template>
  <div>
    <div v-if="!examStore.currentPaper" class="card">
      <div class="card-content has-text-centered py-6">
        <span class="icon is-large has-text-grey">
          <i class="fas fa-spinner fa-spin fa-3x"></i>
        </span>
        <p class="has-text-grey mt-3">加载试卷中...</p>
      </div>
    </div>

    <div v-else-if="!showResult">
      <div class="card mb-5">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between is-align-items-center">
            <div>
              <h1 class="title is-3">{{ examStore.currentPaper.title }}</h1>
              <p class="subtitle is-6">
                共 {{ examStore.currentPaper.questions.length }} 道题，总分 {{ examStore.currentPaper.totalScore }} 分
              </p>
            </div>
            <div class="has-text-right">
              <p class="has-text-grey">已完成</p>
              <p class="title is-4">{{ answeredCount }} / {{ examStore.currentPaper.questions.length }}</p>
            </div>
          </div>
          <div class="progress-bar mt-4">
            <div class="progress-bar-fill" :style="{ width: progressPercent + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="columns">
        <div class="column is-9">
          <div v-for="(question, index) in examStore.currentPaper.questions" :key="question.id" class="card mb-5" :id="`question-${index}`">
            <div class="card-content">
              <div class="is-flex is-justify-content-space-between mb-3">
                <div class="is-flex is-align-items-center">
                  <span class="tag is-primary is-medium mr-2">第 {{ index + 1 }} 题</span>
                  <span class="tag mr-2" :class="getTypeTagClass(question.type)">{{ getTypeName(question.type) }}</span>
                  <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ getDifficultyName(question.difficulty) }}</span>
                </div>
                <span class="has-text-weight-medium has-text-primary">{{ getQuestionScore(question.type) }} 分</span>
              </div>
              <p class="is-size-5 has-text-weight-medium mb-4">{{ question.content }}</p>

              <div v-if="question.type === 'single'">
                <div v-for="(option, optIdx) in question.options" :key="optIdx"
                     class="question-option"
                     :class="{ 'selected': getCurrentAnswer(question.id) === String.fromCharCode(65 + optIdx) }"
                     @click="selectSingleAnswer(question.id, optIdx)">
                  <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span>{{ option }}</span>
                </div>
              </div>

              <div v-else-if="question.type === 'multiple'">
                <div v-for="(option, optIdx) in question.options" :key="optIdx"
                     class="question-option"
                     :class="{ 'selected': (getCurrentAnswer(question.id) as string[]).includes(String.fromCharCode(65 + optIdx)) }"
                     @click="toggleMultipleAnswer(question.id, optIdx)">
                  <span class="has-text-weight-medium mr-2">{{ String.fromCharCode(65 + optIdx) }}.</span>
                  <span>{{ option }}</span>
                </div>
                <p class="help mt-2">此题为多选题，请选择所有正确答案</p>
              </div>

              <div v-else-if="question.type === 'fill'">
                <div class="field">
                  <div class="control">
                    <input class="input is-large"
                           type="text"
                           placeholder="请输入答案"
                           :value="getCurrentAnswer(question.id) as string"
                           @input="(e: Event) => setFillAnswer(question.id, (e.target as HTMLInputElement).value)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="is-flex is-justify-content-center mt-6">
            <button class="button is-primary is-large" @click="submitExam" :disabled="answeredCount === 0">
              <span class="icon"><i class="fas fa-paper-plane"></i></span>
              <span>提交试卷</span>
            </button>
          </div>
        </div>

        <div class="column is-3">
          <div class="card is-sticky" style="position: sticky; top: 20px;">
            <div class="card-header">
              <p class="card-header-title">答题卡</p>
            </div>
            <div class="card-content">
              <div class="is-flex is-flex-wrap-wrap">
                <button v-for="(question, index) in examStore.currentPaper.questions" :key="question.id"
                        class="button is-small mb-2 mr-2"
                        :class="[
                          isAnswered(question.id) ? 'is-primary' : 'is-light',
                          currentQuestionIndex === index ? 'is-outlined' : ''
                        ]"
                        @click="scrollToQuestion(index)">
                  {{ index + 1 }}
                </button>
              </div>
              <div class="mt-4 pt-4 has-border-top">
                <div class="is-flex is-justify-content-space-between mb-2">
                  <span class="has-text-grey">已答题数</span>
                  <span class="has-text-weight-bold has-text-primary">{{ answeredCount }}</span>
                </div>
                <div class="is-flex is-justify-content-space-between">
                  <span class="has-text-grey">未答题数</span>
                  <span class="has-text-weight-bold has-text-grey">{{ examStore.currentPaper.questions.length - answeredCount }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="examStore.currentResult">
      <div class="notification" :class="resultNotificationClass" style="margin-bottom: 2rem;">
        <div class="is-flex is-justify-content-space-between is-align-items-center">
          <div>
            <p class="title is-2 mb-0">{{ examStore.currentResult.paperTitle }}</p>
            <p class="subtitle is-5 mt-2">答题完成，以下是您的成绩</p>
          </div>
          <div class="has-text-right">
            <p class="is-size-7 has-text-grey mb-1">您的得分</p>
            <p class="title is-1 mb-0">{{ examStore.currentResult.userScore }} <span class="is-size-4">/ {{ examStore.currentResult.totalScore }}</span></p>
          </div>
        </div>
      </div>

      <div class="columns mb-6">
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

      <h2 class="title is-4 mb-4">
        <span class="icon"><i class="fas fa-list"></i></span>
        答题详情
      </h2>

      <div v-for="(question, index) in examStore.currentPaper.questions" :key="question.id" class="card mb-5">
        <div class="card-content">
          <div class="is-flex is-justify-content-space-between mb-3">
            <div class="is-flex is-align-items-center">
              <span class="tag is-primary is-medium mr-2">第 {{ index + 1 }} 题</span>
              <span class="tag mr-2" :class="getTypeTagClass(question.type)">{{ getTypeName(question.type) }}</span>
              <span class="tag" :class="getDifficultyTagClass(question.difficulty)">{{ getDifficultyName(question.difficulty) }}</span>
            </div>
            <span class="tag" :class="getAnswerResult(question.id).isCorrect ? 'is-success' : 'is-danger'">
              {{ getAnswerResult(question.id).isCorrect ? '答对' : '答错' }}
              <span class="ml-1">{{ getAnswerResult(question.id).score }} / {{ getQuestionScore(question.type) }} 分</span>
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
              <span v-else-if="isUserWrongOption(question, optIdx)" class="ml-2 has-text-danger">
                <i class="fas fa-times-circle"></i> 您的选择
              </span>
            </div>
          </div>

          <div v-else>
            <div class="box">
              <p><span class="has-text-weight-medium">您的答案：</span>
                <span :class="{ 'has-text-success': getAnswerResult(question.id).isCorrect, 'has-text-danger': !getAnswerResult(question.id).isCorrect }">
                  {{ getCurrentAnswer(question.id) || '(未作答)' }}
                </span>
              </p>
              <p class="mt-2"><span class="has-text-weight-medium">正确答案：</span>
                <span class="has-text-success">{{ question.answer }}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div class="is-flex is-justify-content-center mt-6">
        <NuxtLink to="/papers" class="button is-primary is-large mr-3">
          <span class="icon"><i class="fas fa-list"></i></span>
          <span>返回试卷列表</span>
        </NuxtLink>
        <NuxtLink to="/wrong" class="button is-warning is-large">
          <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
          <span>查看错题汇总</span>
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Question } from '~/stores/exam'

const route = useRoute()
const examStore = useExamStore()
const router = useRouter()

const showResult = ref(false)
const currentQuestionIndex = ref(0)

onMounted(() => {
  const paperId = route.params.id as string
  examStore.startExam(paperId)
  if (!examStore.currentPaper) {
    router.push('/papers')
  }
})

const answeredCount = computed(() => {
  if (!examStore.currentPaper) return 0
  return examStore.currentAnswers.filter(a => {
    if (Array.isArray(a.userAnswer)) {
      return a.userAnswer.length > 0
    }
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

const getCurrentAnswer = (questionId: string) => {
  const record = examStore.currentAnswers.find(a => a.questionId === questionId)
  return record ? record.userAnswer : ''
}

const isAnswered = (questionId: string) => {
  const answer = getCurrentAnswer(questionId)
  if (Array.isArray(answer)) {
    return answer.length > 0
  }
  return answer !== ''
}

const selectSingleAnswer = (questionId: string, optIdx: number) => {
  const answer = String.fromCharCode(65 + optIdx)
  examStore.setAnswer(questionId, answer)
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

const setFillAnswer = (questionId: string, value: string) => {
  examStore.setAnswer(questionId, value)
}

const getQuestionScore = (type: string) => {
  if (!examStore.currentPaper) return 0
  if (type === 'single') return examStore.currentPaper.config.singleScore
  if (type === 'multiple') return examStore.currentPaper.config.multipleScore
  return examStore.currentPaper.config.fillScore
}

const scrollToQuestion = (index: number) => {
  currentQuestionIndex.value = index
  const el = document.getElementById(`question-${index}`)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

const submitExam = () => {
  if (confirm('确定要提交试卷吗？提交后无法修改答案。')) {
    examStore.submitExam()
    showResult.value = true
  }
}

const getAnswerResult = (questionId: string) => {
  if (!examStore.currentResult) return { isCorrect: false, score: 0 }
  const answer = examStore.currentResult.answers.find(a => a.questionId === questionId)
  return answer ? { isCorrect: answer.isCorrect, score: answer.score } : { isCorrect: false, score: 0 }
}

const getOptionClass = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const userAnswer = getCurrentAnswer(question.id)
  const correctAnswer = question.answer

  const isCorrect = Array.isArray(correctAnswer)
    ? correctAnswer.includes(letter)
    : correctAnswer === letter
  const isSelected = Array.isArray(userAnswer)
    ? userAnswer.includes(letter)
    : userAnswer === letter

  if (isCorrect && isSelected) return 'correct'
  if (isCorrect && !isSelected) return 'correct'
  if (!isCorrect && isSelected) return 'wrong'
  return ''
}

const isCorrectOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const correctAnswer = question.answer
  return Array.isArray(correctAnswer)
    ? correctAnswer.includes(letter)
    : correctAnswer === letter
}

const isUserWrongOption = (question: Question, optIdx: number) => {
  const letter = String.fromCharCode(65 + optIdx)
  const userAnswer = getCurrentAnswer(question.id)
  const isSelected = Array.isArray(userAnswer)
    ? userAnswer.includes(letter)
    : userAnswer === letter
  return isSelected && !isCorrectOption(question, optIdx)
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
