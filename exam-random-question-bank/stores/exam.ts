import { defineStore } from 'pinia'

export interface Question {
  id: string
  type: 'single' | 'multiple' | 'fill'
  content: string
  options?: string[]
  answer: string | string[]
  difficulty: 'easy' | 'medium' | 'hard'
  category: string
  createdAt: number
}

export interface ExamConfig {
  singleCount: number
  singleScore: number
  multipleCount: number
  multipleScore: number
  fillCount: number
  fillScore: number
  easyRatio: number
  mediumRatio: number
  hardRatio: number
}

export interface ExamPaper {
  id: string
  title: string
  questions: Question[]
  config: ExamConfig
  totalScore: number
  createdAt: number
}

export interface AnswerRecord {
  questionId: string
  userAnswer: string | string[]
  isCorrect: boolean
  score: number
}

export interface ExamResult {
  id: string
  paperId: string
  paperTitle: string
  answers: AnswerRecord[]
  totalScore: number
  userScore: number
  correctCount: number
  wrongCount: number
  createdAt: number
}

const STORAGE_KEY_QUESTIONS = 'exam_questions'
const STORAGE_KEY_PAPERS = 'exam_papers'
const STORAGE_KEY_RESULTS = 'exam_results'

export const useExamStore = defineStore('exam', {
  state: () => ({
    questions: [] as Question[],
    papers: [] as ExamPaper[],
    results: [] as ExamResult[],
    currentPaper: null as ExamPaper | null,
    currentAnswers: [] as AnswerRecord[],
    currentResult: null as ExamResult | null
  }),

  getters: {
    singleQuestions: (state) => state.questions.filter(q => q.type === 'single'),
    multipleQuestions: (state) => state.questions.filter(q => q.type === 'multiple'),
    fillQuestions: (state) => state.questions.filter(q => q.type === 'fill'),

    easyQuestions: (state) => state.questions.filter(q => q.difficulty === 'easy'),
    mediumQuestions: (state) => state.questions.filter(q => q.difficulty === 'medium'),
    hardQuestions: (state) => state.questions.filter(q => q.difficulty === 'hard'),

    stats: (state) => ({
      totalQuestions: state.questions.length,
      singleCount: state.questions.filter(q => q.type === 'single').length,
      multipleCount: state.questions.filter(q => q.type === 'multiple').length,
      fillCount: state.questions.filter(q => q.type === 'fill').length,
      easyCount: state.questions.filter(q => q.difficulty === 'easy').length,
      mediumCount: state.questions.filter(q => q.difficulty === 'medium').length,
      hardCount: state.questions.filter(q => q.difficulty === 'hard').length,
      totalPapers: state.papers.length,
      totalResults: state.results.length,
      averageScore: state.results.length > 0
        ? Math.round(state.results.reduce((sum, r) => sum + r.userScore, 0) / state.results.length)
        : 0
    })
  },

  actions: {
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2)
    },

    loadFromStorage() {
      if (process.client) {
        const questions = localStorage.getItem(STORAGE_KEY_QUESTIONS)
        const papers = localStorage.getItem(STORAGE_KEY_PAPERS)
        const results = localStorage.getItem(STORAGE_KEY_RESULTS)

        if (questions) this.questions = JSON.parse(questions)
        if (papers) this.papers = JSON.parse(papers)
        if (results) this.results = JSON.parse(results)
      }
    },

    saveQuestions() {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY_QUESTIONS, JSON.stringify(this.questions))
      }
    },

    savePapers() {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY_PAPERS, JSON.stringify(this.papers))
      }
    },

    saveResults() {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(this.results))
      }
    },

    addQuestion(question: Omit<Question, 'id' | 'createdAt'>) {
      const newQuestion: Question = {
        ...question,
        id: this.generateId(),
        createdAt: Date.now()
      }
      this.questions.push(newQuestion)
      this.saveQuestions()
      return newQuestion
    },

    updateQuestion(id: string, updates: Partial<Question>) {
      const index = this.questions.findIndex(q => q.id === id)
      if (index !== -1) {
        this.questions[index] = { ...this.questions[index], ...updates }
        this.saveQuestions()
      }
    },

    deleteQuestion(id: string) {
      this.questions = this.questions.filter(q => q.id !== id)
      this.saveQuestions()
    },

    shuffleArray<T>(array: T[]): T[] {
      const shuffled = [...array]
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
      }
      return shuffled
    },

    generatePaper(config: ExamConfig, title: string): ExamPaper {
      const { singleCount, multipleCount, fillCount, easyRatio, mediumRatio, hardRatio } = config

      const getQuestionsByFilter = (
        type: Question['type'],
        difficulty: Question['difficulty'],
        count: number
      ): Question[] => {
        const filtered = this.questions.filter(
          q => q.type === type && q.difficulty === difficulty
        )
        return this.shuffleArray(filtered).slice(0, count)
      }

      const calculateDifficultyCounts = (total: number) => ({
        easy: Math.round(total * easyRatio),
        medium: Math.round(total * mediumRatio),
        hard: Math.round(total * hardRatio)
      })

      const singleDiffs = calculateDifficultyCounts(singleCount)
      const multipleDiffs = calculateDifficultyCounts(multipleCount)
      const fillDiffs = calculateDifficultyCounts(fillCount)

      let selectedQuestions: Question[] = []

      selectedQuestions = [
        ...selectedQuestions,
        ...getQuestionsByFilter('single', 'easy', singleDiffs.easy),
        ...getQuestionsByFilter('single', 'medium', singleDiffs.medium),
        ...getQuestionsByFilter('single', 'hard', singleDiffs.hard)
      ]

      selectedQuestions = [
        ...selectedQuestions,
        ...getQuestionsByFilter('multiple', 'easy', multipleDiffs.easy),
        ...getQuestionsByFilter('multiple', 'medium', multipleDiffs.medium),
        ...getQuestionsByFilter('multiple', 'hard', multipleDiffs.hard)
      ]

      selectedQuestions = [
        ...selectedQuestions,
        ...getQuestionsByFilter('fill', 'easy', fillDiffs.easy),
        ...getQuestionsByFilter('fill', 'medium', fillDiffs.medium),
        ...getQuestionsByFilter('fill', 'hard', fillDiffs.hard)
      ]

      selectedQuestions = this.shuffleArray(selectedQuestions)

      const totalScore =
        singleCount * config.singleScore +
        multipleCount * config.multipleScore +
        fillCount * config.fillScore

      const paper: ExamPaper = {
        id: this.generateId(),
        title,
        questions: selectedQuestions,
        config,
        totalScore,
        createdAt: Date.now()
      }

      this.papers.push(paper)
      this.savePapers()

      return paper
    },

    startExam(paperId: string) {
      const paper = this.papers.find(p => p.id === paperId)
      if (paper) {
        this.currentPaper = paper
        this.currentAnswers = paper.questions.map(q => ({
          questionId: q.id,
          userAnswer: q.type === 'multiple' ? [] : '',
          isCorrect: false,
          score: 0
        }))
      }
    },

    setAnswer(questionId: string, answer: string | string[]) {
      const record = this.currentAnswers.find(a => a.questionId === questionId)
      if (record) {
        record.userAnswer = answer
      }
    },

    submitExam(): ExamResult {
      if (!this.currentPaper) {
        throw new Error('No current exam')
      }

      let userScore = 0
      let correctCount = 0
      let wrongCount = 0

      const evaluatedAnswers = this.currentAnswers.map(record => {
        const question = this.currentPaper!.questions.find(q => q.id === record.questionId)
        if (!question) return record

        let isCorrect = false
        let score = 0

        const questionScore = question.type === 'single'
          ? this.currentPaper!.config.singleScore
          : question.type === 'multiple'
          ? this.currentPaper!.config.multipleScore
          : this.currentPaper!.config.fillScore

        if (question.type === 'multiple') {
          const userAns = (record.userAnswer as string[]).sort().join(',')
          const correctAns = (question.answer as string[]).sort().join(',')
          isCorrect = userAns === correctAns
        } else {
          isCorrect = record.userAnswer === question.answer
        }

        if (isCorrect) {
          score = questionScore
          correctCount++
        } else {
          wrongCount++
        }

        return {
          ...record,
          isCorrect,
          score
        }
      })

      userScore = evaluatedAnswers.reduce((sum, a) => sum + a.score, 0)

      const result: ExamResult = {
        id: this.generateId(),
        paperId: this.currentPaper.id,
        paperTitle: this.currentPaper.title,
        answers: evaluatedAnswers,
        totalScore: this.currentPaper.totalScore,
        userScore,
        correctCount,
        wrongCount,
        createdAt: Date.now()
      }

      this.results.push(result)
      this.saveResults()
      this.currentResult = result

      return result
    },

    getWrongQuestions(): Question[] {
      const wrongQuestionIds = new Set<string>()

      this.results.forEach(result => {
        result.answers.forEach(answer => {
          if (!answer.isCorrect) {
            wrongQuestionIds.add(answer.questionId)
          }
        })
      })

      return this.questions.filter(q => wrongQuestionIds.has(q.id))
    },

    getQuestionWrongCount(questionId: string): number {
      let count = 0
      this.results.forEach(result => {
        const answer = result.answers.find(a => a.questionId === questionId)
        if (answer && !answer.isCorrect) {
          count++
        }
      })
      return count
    },

    deletePaper(id: string) {
      this.papers = this.papers.filter(p => p.id !== id)
      this.savePapers()
    },

    deleteResult(id: string) {
      this.results = this.results.filter(r => r.id !== id)
      this.saveResults()
    },

    clearCurrentExam() {
      this.currentPaper = null
      this.currentAnswers = []
      this.currentResult = null
    }
  }
})
