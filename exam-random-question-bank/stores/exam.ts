import { defineStore } from 'pinia'

export type QuestionType = 'single' | 'multiple' | 'judge'
export type Difficulty = 'easy' | 'medium' | 'hard'
export type Grade = 1 | 2 | 3 | 4 | 5 | 6
export type Subject = '语文' | '数学' | '英语' | '科学'

export interface Question {
  id: string
  type: QuestionType
  content: string
  options?: string[]
  answer: string | string[]
  explanation: string
  difficulty: Difficulty
  grade: Grade
  subject: Subject
  createdAt: number
}

export interface ExamConfig {
  singleCount: number
  singleScore: number
  multipleCount: number
  multipleScore: number
  judgeCount: number
  judgeScore: number
  easyRatio: number
  mediumRatio: number
  hardRatio: number
  grade: Grade
  subject: Subject
}

export interface ExamPaper {
  id: string
  title: string
  questions: Question[]
  config: ExamConfig
  totalScore: number
  grade: Grade
  subject: Subject
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
  grade: Grade
  subject: Subject
  duration: number
  createdAt: number
}

const STORAGE_KEY_QUESTIONS = 'exam_questions_v3'
const STORAGE_KEY_PAPERS = 'exam_papers_v3'
const STORAGE_KEY_RESULTS = 'exam_results_v3'
const STORAGE_KEY_WRONG = 'exam_wrong_v3'
const STORAGE_KEY_PRESET_LOADED = 'exam_preset_loaded_v3'

export const GRADE_LABELS: Record<Grade, string> = {
  1: '一年级',
  2: '二年级',
  3: '三年级',
  4: '四年级',
  5: '五年级',
  6: '六年级'
}

export const SUBJECT_LABELS: Record<Subject, string> = {
  '语文': '语文',
  '数学': '数学',
  '英语': '英语',
  '科学': '科学'
}

export const TYPE_LABELS: Record<QuestionType, string> = {
  single: '单选题',
  multiple: '多选题',
  judge: '判断题'
}

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: '简单',
  medium: '中等',
  hard: '困难'
}

export const useExamStore = defineStore('exam', {
  state: () => ({
    questions: [] as Question[],
    papers: [] as ExamPaper[],
    results: [] as ExamResult[],
    wrongQuestionIds: [] as string[],
    currentPaper: null as ExamPaper | null,
    currentAnswers: [] as AnswerRecord[],
    currentResult: null as ExamResult | null,
    selectedGrade: null as Grade | null,
    examStartTime: 0,
    examDuration: 0
  }),

  getters: {
    questionsByGradeAndSubject: (state) => {
      return (grade: Grade, subject: Subject) => state.questions.filter(q => q.grade === grade && q.subject === subject)
    },

    singleQuestions: (state) => state.questions.filter(q => q.type === 'single'),
    multipleQuestions: (state) => state.questions.filter(q => q.type === 'multiple'),
    judgeQuestions: (state) => state.questions.filter(q => q.type === 'judge'),

    easyQuestions: (state) => state.questions.filter(q => q.difficulty === 'easy'),
    mediumQuestions: (state) => state.questions.filter(q => q.difficulty === 'medium'),
    hardQuestions: (state) => state.questions.filter(q => q.difficulty === 'hard'),

    stats: (state) => ({
      totalQuestions: state.questions.length,
      singleCount: state.questions.filter(q => q.type === 'single').length,
      multipleCount: state.questions.filter(q => q.type === 'multiple').length,
      judgeCount: state.questions.filter(q => q.type === 'judge').length,
      easyCount: state.questions.filter(q => q.difficulty === 'easy').length,
      mediumCount: state.questions.filter(q => q.difficulty === 'medium').length,
      hardCount: state.questions.filter(q => q.difficulty === 'hard').length,
      totalPapers: state.papers.length,
      totalResults: state.results.length,
      averageScore: state.results.length > 0
        ? Math.round(state.results.reduce((sum, r) => sum + (r.userScore / r.totalScore) * 100, 0) / state.results.length)
        : 0,
      totalWrong: state.wrongQuestionIds.length
    }),

    gradeSubjectStats: (state) => {
      return (grade: Grade, subject: Subject) => ({
        total: state.questions.filter(q => q.grade === grade && q.subject === subject).length,
        single: state.questions.filter(q => q.grade === grade && q.subject === subject && q.type === 'single').length,
        multiple: state.questions.filter(q => q.grade === grade && q.subject === subject && q.type === 'multiple').length,
        judge: state.questions.filter(q => q.grade === grade && q.subject === subject && q.type === 'judge').length,
        easy: state.questions.filter(q => q.grade === grade && q.subject === subject && q.difficulty === 'easy').length,
        medium: state.questions.filter(q => q.grade === grade && q.subject === subject && q.difficulty === 'medium').length,
        hard: state.questions.filter(q => q.grade === grade && q.subject === subject && q.difficulty === 'hard').length
      })
    },

    gradeStats: (state) => {
      return (grade: Grade) => ({
        total: state.questions.filter(q => q.grade === grade).length,
        single: state.questions.filter(q => q.grade === grade && q.type === 'single').length,
        multiple: state.questions.filter(q => q.grade === grade && q.type === 'multiple').length,
        judge: state.questions.filter(q => q.grade === grade && q.type === 'judge').length
      })
    },

    subjectStats: (state) => {
      return (subject: Subject) => ({
        total: state.questions.filter(q => q.subject === subject).length,
        single: state.questions.filter(q => q.subject === subject && q.type === 'single').length,
        multiple: state.questions.filter(q => q.subject === subject && q.type === 'multiple').length,
        judge: state.questions.filter(q => q.subject === subject && q.type === 'judge').length
      })
    },

    wrongQuestions(state): Question[] {
      return state.questions.filter(q => state.wrongQuestionIds.includes(q.id))
    }
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
        const wrong = localStorage.getItem(STORAGE_KEY_WRONG)
        const presetLoaded = localStorage.getItem(STORAGE_KEY_PRESET_LOADED)

        if (questions) this.questions = JSON.parse(questions)
        if (papers) this.papers = JSON.parse(papers)
        if (results) this.results = JSON.parse(results)
        if (wrong) this.wrongQuestionIds = JSON.parse(wrong)

        if (!presetLoaded) {
          this.loadPresetQuestions()
          localStorage.setItem(STORAGE_KEY_PRESET_LOADED, 'true')
        }
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

    saveWrongQuestions() {
      if (process.client) {
        localStorage.setItem(STORAGE_KEY_WRONG, JSON.stringify(this.wrongQuestionIds))
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
      this.wrongQuestionIds = this.wrongQuestionIds.filter(wid => wid !== id)
      this.saveQuestions()
      this.saveWrongQuestions()
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
      const { singleCount, multipleCount, judgeCount, easyRatio, mediumRatio, hardRatio, grade, subject } = config

      const filteredQuestions = this.questions.filter(q => q.grade === grade && q.subject === subject)

      const getQuestionsByFilter = (
        type: QuestionType,
        difficulty: Difficulty,
        count: number
      ): Question[] => {
        const filtered = filteredQuestions.filter(
          q => q.type === type && q.difficulty === difficulty
        )
        return this.shuffleArray(filtered).slice(0, count)
      }

      const calculateDifficultyCounts = (total: number) => ({
        easy: Math.round(total * easyRatio),
        medium: Math.round(total * mediumRatio),
        hard: total - Math.round(total * easyRatio) - Math.round(total * mediumRatio)
      })

      const singleDiffs = calculateDifficultyCounts(singleCount)
      const multipleDiffs = calculateDifficultyCounts(multipleCount)
      const judgeDiffs = calculateDifficultyCounts(judgeCount)

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
        ...getQuestionsByFilter('judge', 'easy', judgeDiffs.easy),
        ...getQuestionsByFilter('judge', 'medium', judgeDiffs.medium),
        ...getQuestionsByFilter('judge', 'hard', judgeDiffs.hard)
      ]

      selectedQuestions = this.shuffleArray(selectedQuestions)

      const totalScore =
        singleCount * config.singleScore +
        multipleCount * config.multipleScore +
        judgeCount * config.judgeScore

      const paper: ExamPaper = {
        id: this.generateId(),
        title,
        questions: selectedQuestions,
        config,
        totalScore,
        grade,
        subject,
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
        this.examStartTime = Date.now()
        this.examDuration = 0
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

      const duration = Math.floor((Date.now() - this.examStartTime) / 1000)

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
          : this.currentPaper!.config.judgeScore

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
          if (!this.wrongQuestionIds.includes(question.id)) {
            this.wrongQuestionIds.push(question.id)
          }
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
        grade: this.currentPaper.grade,
        subject: this.currentPaper.subject,
        duration,
        createdAt: Date.now()
      }

      this.results.push(result)
      this.saveResults()
      this.saveWrongQuestions()
      this.currentResult = result

      return result
    },

    addWrongQuestion(questionId: string) {
      if (!this.wrongQuestionIds.includes(questionId)) {
        this.wrongQuestionIds.push(questionId)
        this.saveWrongQuestions()
      }
    },

    clearWrongQuestions() {
      this.wrongQuestionIds = []
      this.saveWrongQuestions()
    },

    removeWrongQuestion(questionId: string) {
      this.wrongQuestionIds = this.wrongQuestionIds.filter(id => id !== questionId)
      this.saveWrongQuestions()
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
      this.examStartTime = 0
      this.examDuration = 0
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

    loadPresetQuestions() {
      const presets: Omit<Question, 'id' | 'createdAt'>[] = [
        {
          type: 'single', grade: 1, difficulty: 'easy', category: '数学',
          content: '3 + 5 等于多少？',
          options: ['6', '7', '8', '9'],
          answer: 'C',
          explanation: '3 + 5 = 8，所以答案是C。'
        },
        {
          type: 'single', grade: 1, difficulty: 'easy', category: '数学',
          content: '10 - 4 等于多少？',
          options: ['5', '6', '7', '8'],
          answer: 'B',
          explanation: '10 - 4 = 6，所以答案是B。'
        },
        {
          type: 'single', grade: 1, difficulty: 'medium', category: '数学',
          content: '15 + 8 等于多少？',
          options: ['21', '22', '23', '24'],
          answer: 'C',
          explanation: '15 + 8 = 23，所以答案是C。'
        },
        {
          type: 'judge', grade: 1, difficulty: 'easy', category: '数学',
          content: '2 + 2 = 5',
          options: ['正确', '错误'],
          answer: 'B',
          explanation: '2 + 2 = 4，不等于5，所以是错误的。'
        },
        {
          type: 'judge', grade: 1, difficulty: 'easy', category: '语文',
          content: '"天"字一共有4画。',
          options: ['正确', '错误'],
          answer: 'A',
          explanation: '"天"字的笔画是：横、横、撇、捺，共4画，所以是正确的。'
        },
        {
          type: 'single', grade: 2, difficulty: 'easy', category: '数学',
          content: '7 × 8 等于多少？',
          options: ['54', '56', '58', '64'],
          answer: 'B',
          explanation: '7 × 8 = 56，这是乘法口诀"七八五十六"。'
        },
        {
          type: 'single', grade: 2, difficulty: 'medium', category: '数学',
          content: '36 ÷ 6 等于多少？',
          options: ['5', '6', '7', '8'],
          answer: 'B',
          explanation: '36 ÷ 6 = 6，因为6 × 6 = 36。'
        },
        {
          type: 'judge', grade: 2, difficulty: 'easy', category: '语文',
          content: '"春眠不觉晓"的下一句是"处处闻啼鸟"。',
          options: ['正确', '错误'],
          answer: 'A',
          explanation: '这是孟浩然《春晓》中的名句，完整为"春眠不觉晓，处处闻啼鸟"。'
        },
        {
          type: 'multiple', grade: 2, difficulty: 'medium', category: '数学',
          content: '下面哪些数是3的倍数？',
          options: ['9', '14', '21', '27'],
          answer: ['A', 'C', 'D'],
          explanation: '9÷3=3，21÷3=7，27÷3=9，都能被3整除；14÷3=4...2，不能整除。'
        },
        {
          type: 'single', grade: 3, difficulty: 'easy', category: '数学',
          content: '125 × 8 等于多少？',
          options: ['800', '900', '1000', '1100'],
          answer: 'C',
          explanation: '125 × 8 = 1000，这是一个常见的计算技巧。'
        },
        {
          type: 'single', grade: 3, difficulty: 'medium', category: '语文',
          content: '"守株待兔"这个成语告诉我们什么道理？',
          options: ['要勤劳努力', '可以靠运气生活', '兔子跑得快', '种树很重要'],
          answer: 'A',
          explanation: '"守株待兔"比喻不主动努力，而存万一的侥幸心理，希望得到意外的收获。告诉我们要勤劳努力。'
        },
        {
          type: 'judge', grade: 3, difficulty: 'easy', category: '数学',
          content: '长方形的对边相等。',
          options: ['正确', '错误'],
          answer: 'A',
          explanation: '长方形的性质是对边平行且相等，四个角都是直角。'
        },
        {
          type: 'multiple', grade: 3, difficulty: 'hard', category: '数学',
          content: '下面哪些图形是轴对称图形？',
          options: ['长方形', '平行四边形', '等腰三角形', '圆形'],
          answer: ['A', 'C', 'D'],
          explanation: '长方形有2条对称轴，等腰三角形有1条对称轴，圆形有无数条对称轴；平行四边形不是轴对称图形。'
        },
        {
          type: 'single', grade: 4, difficulty: 'medium', category: '数学',
          content: '一个三角形的三个内角之和是多少度？',
          options: ['90度', '180度', '270度', '360度'],
          answer: 'B',
          explanation: '三角形的内角和恒等于180度，这是几何学的基本定理。'
        },
        {
          type: 'single', grade: 4, difficulty: 'hard', category: '数学',
          content: '甲数是乙数的3倍，甲乙两数的和是120，乙数是多少？',
          options: ['20', '30', '40', '60'],
          answer: 'B',
          explanation: '设乙数为x，则甲数为3x，x + 3x = 120，4x = 120，x = 30。'
        },
        {
          type: 'judge', grade: 4, difficulty: 'medium', category: '语文',
          content: '"千里送鹅毛"的下一句是"礼轻情意重"。',
          options: ['正确', '错误'],
          answer: 'A',
          explanation: '"千里送鹅毛，礼轻情意重"是一句俗语，比喻礼物虽然微薄，但情谊深厚。'
        },
        {
          type: 'multiple', grade: 4, difficulty: 'medium', category: '语文',
          content: '下面哪些词语是描写春天的？',
          options: ['百花齐放', '烈日炎炎', '鸟语花香', '冰天雪地'],
          answer: ['A', 'C'],
          explanation: '"百花齐放"和"鸟语花香"都是描写春天的词语；"烈日炎炎"描写夏天，"冰天雪地"描写冬天。'
        },
        {
          type: 'single', grade: 5, difficulty: 'medium', category: '数学',
          content: '一个长方体长5cm，宽4cm，高3cm，它的体积是多少立方厘米？',
          options: ['30', '40', '60', '120'],
          answer: 'C',
          explanation: '长方体体积 = 长 × 宽 × 高 = 5 × 4 × 3 = 60立方厘米。'
        },
        {
          type: 'single', grade: 5, difficulty: 'hard', category: '数学',
          content: '一桶油，第一次用去总数的1/3，第二次用去总数的1/4，还剩这桶油的几分之几？',
          options: ['1/2', '5/12', '7/12', '1/6'],
          answer: 'B',
          explanation: '1 - 1/3 - 1/4 = 12/12 - 4/12 - 3/12 = 5/12。'
        },
        {
          type: 'judge', grade: 5, difficulty: 'medium', category: '数学',
          content: '所有的质数都是奇数。',
          options: ['正确', '错误'],
          answer: 'B',
          explanation: '2是最小的质数，但2是偶数，所以"所有的质数都是奇数"是错误的。'
        },
        {
          type: 'multiple', grade: 5, difficulty: 'hard', category: '数学',
          content: '下面哪些数既是2的倍数又是3的倍数？',
          options: ['12', '15', '18', '24'],
          answer: ['A', 'C', 'D'],
          explanation: '既是2的倍数又是3的倍数就是6的倍数。12÷6=2，18÷6=3，24÷6=4；15÷6=2...3，不能整除。'
        },
        {
          type: 'single', grade: 6, difficulty: 'medium', category: '数学',
          content: '圆的周长公式是什么？（d为直径，r为半径）',
          options: ['C = πd', 'C = 2πr', 'C = πd 或 C = 2πr', 'C = πr²'],
          answer: 'C',
          explanation: '圆的周长 = π × 直径 = πd，又因为直径 = 2 × 半径，所以也可以写成 C = 2πr。'
        },
        {
          type: 'single', grade: 6, difficulty: 'hard', category: '数学',
          content: '一件商品先涨价10%，再降价10%，最终价格与原价相比：',
          options: ['不变', '低了1%', '高了1%', '低了2%'],
          answer: 'B',
          explanation: '设原价为100，涨10%后为110，再降10%为110×0.9=99。99比100低1%。'
        },
        {
          type: 'judge', grade: 6, difficulty: 'medium', category: '语文',
          content: '"春风又绿江南岸"中的"绿"字用作动词。',
          options: ['正确', '错误'],
          answer: 'A',
          explanation: '"绿"字在这里是使动用法，意为"使……变绿"，用作动词，这是王安石《泊船瓜洲》中的名句。'
        },
        {
          type: 'multiple', grade: 6, difficulty: 'hard', category: '语文',
          content: '下面哪些作品是鲁迅写的？',
          options: ['《狂人日记》', '《骆驼祥子》', '《朝花夕拾》', '《呐喊》'],
          answer: ['A', 'C', 'D'],
          explanation: '《狂人日记》《朝花夕拾》《呐喊》都是鲁迅的作品；《骆驼祥子》是老舍的作品。'
        },
        {
          type: 'single', grade: 1, difficulty: 'hard', category: '数学',
          content: '小明有12颗糖，给了小红5颗后，两人一样多。小红原来有多少颗糖？',
          options: ['1颗', '2颗', '3颗', '4颗'],
          answer: 'B',
          explanation: '小明给小红5颗后剩12-5=7颗，两人一样多说明小红也有7颗，所以小红原来有7-5=2颗。'
        },
        {
          type: 'judge', grade: 2, difficulty: 'hard', category: '数学',
          content: '在一个乘法算式中，积一定比任何一个因数都大。',
          options: ['正确', '错误'],
          answer: 'B',
          explanation: '当其中一个因数为0或1时，积不一定比因数大。如5×1=5，积等于因数；5×0=0，积小于因数。'
        },
        {
          type: 'single', grade: 3, difficulty: 'hard', category: '语文',
          content: '"欲穷千里目"的下一句是什么？',
          options: ['白日依山尽', '更上一层楼', '黄河入海流', '春风吹又生'],
          answer: 'B',
          explanation: '这是王之涣《登鹳雀楼》中的诗句："白日依山尽，黄河入海流。欲穷千里目，更上一层楼。"'
        },
        {
          type: 'single', grade: 4, difficulty: 'easy', category: '英语',
          content: 'What color is the sky on a sunny day?',
          options: ['Red', 'Blue', 'Green', 'Yellow'],
          answer: 'B',
          explanation: '晴天天空是蓝色的（Blue）。'
        },
        {
          type: 'judge', grade: 5, difficulty: 'easy', category: '英语',
          content: '"apple"的中文意思是"香蕉"。',
          options: ['正确', '错误'],
          answer: 'B',
          explanation: '"apple"的中文意思是"苹果"，"香蕉"的英文是"banana"。'
        },
        {
          type: 'multiple', grade: 6, difficulty: 'medium', category: '数学',
          content: '下面哪些是合数？',
          options: ['7', '9', '11', '15'],
          answer: ['B', 'D'],
          explanation: '合数是指除了1和它本身还有其他因数的数。7和11是质数；9=3×3，15=3×5，都是合数。'
        },
        {
          type: 'single', grade: 2, difficulty: 'easy', category: '语文',
          content: '"床前明月光"的作者是谁？',
          options: ['杜甫', '李白', '白居易', '王维'],
          answer: 'B',
          explanation: '这是李白《静夜思》中的诗句："床前明月光，疑是地上霜。"'
        },
        {
          type: 'judge', grade: 3, difficulty: 'medium', category: '语文',
          content: '"的""地""得"的用法完全相同，可以互换使用。',
          options: ['正确', '错误'],
          answer: 'B',
          explanation: '"的"用在名词前，"地"用在动词前，"得"用在动词后，三者用法不同，不能互换。'
        },
        {
          type: 'single', grade: 4, difficulty: 'easy', category: '数学',
          content: '0.5用分数怎么表示？',
          options: ['1/3', '1/2', '1/4', '1/5'],
          answer: 'B',
          explanation: '0.5 = 5/10 = 1/2，所以0.5用分数表示为1/2。'
        },
        {
          type: 'multiple', grade: 3, difficulty: 'easy', category: '语文',
          content: '下面哪些字是左右结构？',
          options: ['明', '想', '字', '林'],
          answer: ['A', 'B'],
          explanation: '"明"是日+月左右结构，"想"是相+心上下结构……等等，"想"是上下结构。"明"左右，"林"左右。所以答案应该是A和D。',
        }
      ]

      const correctedPresets = presets.map(p => {
        if (p.content === '下面哪些字是左右结构？') {
          return { ...p, answer: ['A', 'D'], explanation: '"明"由日和月组成，是左右结构；"林"由木和木组成，是左右结构。"想"是上下结构，"字"是上下结构。' }
        }
        return p
      })

      correctedPresets.forEach(p => {
        this.addQuestion(p)
      })
    }
  }
})
