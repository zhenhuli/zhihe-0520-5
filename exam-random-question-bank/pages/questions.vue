<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">题库管理</h1>
        <p class="subtitle is-6">管理单选题、多选题、填空题，支持按题型和难度筛选</p>
      </div>
      <button class="button is-primary" @click="showAddModal = true">
        <span class="icon"><i class="fas fa-plus"></i></span>
        <span>添加题目</span>
      </button>
    </div>

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
          <div class="control">
            <div class="tags has-addons">
              <span class="tag is-dark">难度筛选</span>
              <span class="tag" :class="{ 'is-primary': filterDifficulty === 'all' }" @click="filterDifficulty = 'all'">全部</span>
              <span class="tag is-success" :class="{ 'is-primary': filterDifficulty === 'easy' }" @click="filterDifficulty = 'easy'">简单</span>
              <span class="tag is-warning" :class="{ 'is-primary': filterDifficulty === 'medium' }" @click="filterDifficulty = 'medium'">中等</span>
              <span class="tag is-danger" :class="{ 'is-primary': filterDifficulty === 'hard' }" @click="filterDifficulty = 'hard'">困难</span>
            </div>
          </div>
          <div class="control is-expanded">
            <input class="input" type="text" placeholder="搜索题目内容..." v-model="searchText">
          </div>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="card-content">
        <div v-if="filteredQuestions.length === 0" class="has-text-centered py-6">
          <span class="icon is-large has-text-grey">
            <i class="fas fa-inbox fa-3x"></i>
          </span>
          <p class="has-text-grey mt-3">暂无题目，点击右上角"添加题目"开始录入</p>
        </div>
        <div v-else class="table-container">
          <table class="table is-fullwidth is-hoverable">
            <thead>
              <tr>
                <th>序号</th>
                <th>题型</th>
                <th>难度</th>
                <th>题目内容</th>
                <th>分类</th>
                <th>创建时间</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(question, index) in filteredQuestions" :key="question.id">
                <td>{{ index + 1 }}</td>
                <td>
                  <span class="tag" :class="getTypeTagClass(question.type)">
                    {{ getTypeName(question.type) }}
                  </span>
                </td>
                <td>
                  <span class="tag" :class="getDifficultyTagClass(question.difficulty)">
                    {{ getDifficultyName(question.difficulty) }}
                  </span>
                </td>
                <td class="is-clamped-2" :style="{ maxWidth: '400px' }">{{ question.content }}</td>
                <td>{{ question.category }}</td>
                <td>{{ formatDate(question.createdAt) }}</td>
                <td>
                  <div class="buttons are-small">
                    <button class="button is-info" @click="editQuestion(question)">
                      <span class="icon"><i class="fas fa-edit"></i></span>
                    </button>
                    <button class="button is-danger" @click="confirmDelete(question)">
                      <span class="icon"><i class="fas fa-trash"></i></span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': showAddModal || editingQuestion }">
      <div class="modal-background" @click="closeModal"></div>
      <div class="modal-card" style="max-width: 700px;">
        <header class="modal-card-head">
          <p class="modal-card-title">{{ editingQuestion ? '编辑题目' : '添加题目' }}</p>
          <button class="delete" aria-label="close" @click="closeModal"></button>
        </header>
        <section class="modal-card-body">
          <div class="field">
            <label class="label">题目类型</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="form.type">
                  <option value="single">单选题</option>
                  <option value="multiple">多选题</option>
                  <option value="fill">填空题</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">难度等级</label>
            <div class="control">
              <div class="select is-fullwidth">
                <select v-model="form.difficulty">
                  <option value="easy">简单</option>
                  <option value="medium">中等</option>
                  <option value="hard">困难</option>
                </select>
              </div>
            </div>
          </div>

          <div class="field">
            <label class="label">题目分类</label>
            <div class="control">
              <input class="input" type="text" placeholder="如：数学、语文、英语、计算机等" v-model="form.category">
            </div>
          </div>

          <div class="field">
            <label class="label">题目内容</label>
            <div class="control">
              <textarea class="textarea" rows="3" placeholder="请输入题目内容" v-model="form.content"></textarea>
            </div>
          </div>

          <div v-if="form.type !== 'fill'" class="field">
            <label class="label">选项设置</label>
            <div v-for="(option, idx) in form.options" :key="idx" class="field is-grouped mb-2">
              <div class="control is-expanded">
                <input class="input" type="text" :placeholder="`选项 ${String.fromCharCode(65 + idx)}`" v-model="form.options[idx]">
              </div>
              <div class="control">
                <button v-if="form.type === 'single'" class="button" :class="{ 'is-success': form.answer === String.fromCharCode(65 + idx) }" @click="form.answer = String.fromCharCode(65 + idx)">
                  设为答案
                </button>
                <button v-else class="button" :class="{ 'is-success': (form.answer as string[]).includes(String.fromCharCode(65 + idx)) }" @click="toggleMultipleAnswer(idx)">
                  {{ (form.answer as string[]).includes(String.fromCharCode(65 + idx)) ? '已选' : '选择' }}
                </button>
              </div>
              <div class="control">
                <button v-if="form.options.length > 2" class="button is-danger" @click="removeOption(idx)">
                  <span class="icon"><i class="fas fa-minus"></i></span>
                </button>
              </div>
            </div>
            <button v-if="form.options.length < 8" class="button is-text" @click="addOption">
              <span class="icon"><i class="fas fa-plus"></i></span>
              <span>添加选项</span>
            </button>
          </div>

          <div v-if="form.type === 'fill'" class="field">
            <label class="label">正确答案</label>
            <div class="control">
              <input class="input" type="text" placeholder="请输入填空题的正确答案" v-model="form.answer as string">
            </div>
            <p class="help">填空题答案需要完全匹配才算正确</p>
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-success" @click="saveQuestion">
            <span class="icon"><i class="fas fa-save"></i></span>
            <span>保存</span>
          </button>
          <button class="button" @click="closeModal">取消</button>
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
          <p>确定要删除这道题目吗？此操作不可撤销。</p>
          <div class="mt-3 p-3 has-background-light">
            {{ questionToDelete?.content }}
          </div>
        </section>
        <footer class="modal-card-foot">
          <button class="button is-danger" @click="deleteQuestion">
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
import type { Question } from '~/stores/exam'

const examStore = useExamStore()

const showAddModal = ref(false)
const editingQuestion = ref<Question | null>(null)
const questionToDelete = ref<Question | null>(null)
const showDeleteConfirm = ref(false)

const filterType = ref<'all' | 'single' | 'multiple' | 'fill'>('all')
const filterDifficulty = ref<'all' | 'easy' | 'medium' | 'hard'>('all')
const searchText = ref('')

const form = ref({
  type: 'single' as Question['type'],
  difficulty: 'easy' as Question['difficulty'],
  category: '',
  content: '',
  options: ['', '', '', ''],
  answer: '' as string | string[]
})

const filteredQuestions = computed(() => {
  return examStore.questions.filter(q => {
    if (filterType.value !== 'all' && q.type !== filterType.value) return false
    if (filterDifficulty.value !== 'all' && q.difficulty !== filterDifficulty.value) return false
    if (searchText.value && !q.content.includes(searchText.value)) return false
    return true
  })
})

const resetForm = () => {
  form.value = {
    type: 'single',
    difficulty: 'easy',
    category: '',
    content: '',
    options: ['', '', '', ''],
    answer: 'A'
  }
}

const addOption = () => {
  if (form.value.options.length < 8) {
    form.value.options.push('')
  }
}

const removeOption = (idx: number) => {
  if (form.value.options.length > 2) {
    const removedLetter = String.fromCharCode(65 + idx)
    form.value.options.splice(idx, 1)
    
    if (form.value.type === 'multiple') {
      const answers = form.value.answer as string[]
      form.value.answer = answers
        .filter(a => a !== removedLetter)
        .map(a => {
          const idx = a.charCodeAt(0) - 65
          return String.fromCharCode(65 + (idx > idx ? idx - 1 : idx))
        })
    } else if (form.value.answer === removedLetter) {
      form.value.answer = 'A'
    }
  }
}

const toggleMultipleAnswer = (idx: number) => {
  const letter = String.fromCharCode(65 + idx)
  const answers = form.value.answer as string[]
  if (answers.includes(letter)) {
    form.value.answer = answers.filter(a => a !== letter)
  } else {
    form.value.answer = [...answers, letter]
  }
}

const editQuestion = (question: Question) => {
  editingQuestion.value = question
  form.value = {
    type: question.type,
    difficulty: question.difficulty,
    category: question.category,
    content: question.content,
    options: question.options ? [...question.options] : ['', '', '', ''],
    answer: question.type === 'multiple' ? [...(question.answer as string[])] : question.answer as string
  }
}

const saveQuestion = () => {
  if (!form.value.content.trim()) {
    alert('请输入题目内容')
    return
  }
  if (form.value.type !== 'fill') {
    const validOptions = form.value.options.filter(o => o.trim())
    if (validOptions.length < 2) {
      alert('至少需要两个有效选项')
      return
    }
    if (form.value.type === 'single' && !form.value.answer) {
      alert('请设置正确答案')
      return
    }
    if (form.value.type === 'multiple' && (form.value.answer as string[]).length === 0) {
      alert('请至少选择一个正确答案')
      return
    }
  } else if (!form.value.answer) {
    alert('请输入正确答案')
    return
  }

  const questionData = {
    type: form.value.type,
    difficulty: form.value.difficulty,
    category: form.value.category || '未分类',
    content: form.value.content,
    options: form.value.type !== 'fill' ? form.value.options.filter(o => o.trim()) : undefined,
    answer: form.value.answer
  }

  if (editingQuestion.value) {
    examStore.updateQuestion(editingQuestion.value.id, questionData)
  } else {
    examStore.addQuestion(questionData)
  }

  closeModal()
}

const confirmDelete = (question: Question) => {
  questionToDelete.value = question
  showDeleteConfirm.value = true
}

const deleteQuestion = () => {
  if (questionToDelete.value) {
    examStore.deleteQuestion(questionToDelete.value.id)
    showDeleteConfirm.value = false
    questionToDelete.value = null
  }
}

const closeModal = () => {
  showAddModal.value = false
  editingQuestion.value = null
  resetForm()
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

const formatDate = (timestamp: number) => {
  return new Date(timestamp).toLocaleString('zh-CN')
}

watch(() => form.value.type, (newType) => {
  if (newType === 'single') {
    form.value.answer = 'A'
  } else if (newType === 'multiple') {
    form.value.answer = []
  } else {
    form.value.answer = ''
  }
})
</script>

<style scoped>
.is-clamped-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
