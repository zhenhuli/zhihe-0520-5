<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">组卷配置</h1>
        <p class="subtitle is-6">设置年级、题型分值、出题数量与难度比例，一键随机生成试卷</p>
      </div>
    </div>

    <div class="columns">
      <div class="column is-8">
        <div class="card">
          <div class="card-content">
            <div class="columns mb-4">
              <div class="column is-6">
                <div class="field">
                  <label class="label">试卷名称</label>
                  <div class="control">
                    <input class="input is-large" type="text" placeholder="请输入试卷名称" v-model="paperTitle">
                  </div>
                </div>
              </div>
              <div class="column is-6">
                <div class="field">
                  <label class="label">选择年级</label>
                  <div class="control">
                    <div class="select is-fullwidth is-large">
                      <select v-model.number="config.grade">
                        <option v-for="g in grades" :key="g" :value="g">{{ g }}年级</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="notification is-info is-light mb-5">
              <p class="has-text-weight-medium mb-2">
                <span class="icon"><i class="fas fa-info-circle"></i></span>
                {{ config.grade }}年级题库可用题目
              </p>
              <div class="columns is-gapless">
                <div class="column"><p>单选题：<strong>{{ currentGradeStats.single }} 道</strong></p></div>
                <div class="column"><p>多选题：<strong>{{ currentGradeStats.multiple }} 道</strong></p></div>
                <div class="column"><p>判断题：<strong>{{ currentGradeStats.judge }} 道</strong></p></div>
              </div>
            </div>

            <h2 class="subtitle is-4 mb-4">
              <span class="icon"><i class="fas fa-cog"></i></span> 题型配置
            </h2>

            <div class="box mb-4">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <span class="tag is-info is-medium">单选题</span>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="currentGradeStats.single" v-model.number="config.singleCount">
                    </div>
                    <p class="help">可用: {{ currentGradeStats.single }} 道</p>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">每题分值</label>
                    <div class="control">
                      <input class="input" type="number" min="1" v-model.number="config.singleScore">
                    </div>
                    <p class="help">小计: {{ config.singleCount * config.singleScore }} 分</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="box mb-4">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <span class="tag is-primary is-medium">多选题</span>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="currentGradeStats.multiple" v-model.number="config.multipleCount">
                    </div>
                    <p class="help">可用: {{ currentGradeStats.multiple }} 道</p>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">每题分值</label>
                    <div class="control">
                      <input class="input" type="number" min="1" v-model.number="config.multipleScore">
                    </div>
                    <p class="help">小计: {{ config.multipleCount * config.multipleScore }} 分</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="box mb-4">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <span class="tag is-success is-medium">判断题</span>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="currentGradeStats.judge" v-model.number="config.judgeCount">
                    </div>
                    <p class="help">可用: {{ currentGradeStats.judge }} 道</p>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">每题分值</label>
                    <div class="control">
                      <input class="input" type="number" min="1" v-model.number="config.judgeScore">
                    </div>
                    <p class="help">小计: {{ config.judgeCount * config.judgeScore }} 分</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 class="subtitle is-4 mb-4 mt-5">
              <span class="icon"><i class="fas fa-signal"></i></span> 难度比例配置
            </h2>

            <div class="box">
              <div class="columns">
                <div class="column is-4">
                  <div class="field">
                    <label class="label"><span class="tag is-success">简单</span> 题比例</label>
                    <div class="control">
                      <input type="range" min="0" max="100" v-model.number="easyPercent" style="width:100%;">
                    </div>
                    <p class="help has-text-weight-bold has-text-success">{{ easyPercent }}%</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label"><span class="tag is-warning">中等</span> 题比例</label>
                    <div class="control">
                      <input type="range" min="0" max="100" v-model.number="mediumPercent" style="width:100%;">
                    </div>
                    <p class="help has-text-weight-bold has-text-warning">{{ mediumPercent }}%</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label"><span class="tag is-danger">困难</span> 题比例</label>
                    <div class="control">
                      <input type="range" min="0" max="100" v-model.number="hardPercent" style="width:100%;">
                    </div>
                    <p class="help has-text-weight-bold has-text-danger">{{ hardPercent }}%</p>
                  </div>
                </div>
              </div>
              <div v-if="totalPercent !== 100" class="notification is-warning is-light">
                <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
                难度比例总和必须为 100%，当前为 {{ totalPercent }}%
                <button class="button is-small is-warning ml-2" @click="adjustRatio">自动调整</button>
              </div>
            </div>

            <div class="notification is-primary is-light mt-5 p-4">
              <div class="is-flex is-justify-content-space-between is-align-items-center">
                <div>
                  <p class="has-text-weight-medium">试卷总分</p>
                  <p class="title is-2 mt-1">{{ totalScore }} 分</p>
                  <p class="has-text-grey">共 {{ totalQuestions }} 道题 · {{ config.grade }}年级</p>
                </div>
                <button class="button is-primary is-large" @click="generatePaper" :disabled="!canGenerate">
                  <span class="icon"><i class="fas fa-magic"></i></span>
                  <span>一键生成试卷</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="column is-4">
        <div class="card">
          <div class="card-header">
            <p class="card-header-title">
              <span class="icon"><i class="fas fa-lightbulb"></i></span> 组卷说明
            </p>
          </div>
          <div class="card-content">
            <div class="content">
              <p class="mb-3"><strong>1. 选择年级</strong></p>
              <p class="mb-3">系统会根据所选年级从对应题库中抽取题目。</p>
              <p class="mb-3"><strong>2. 题型配置</strong></p>
              <p class="mb-3">设置单选题、多选题、判断题的数量和每题分值。</p>
              <p class="mb-3"><strong>3. 难度比例</strong></p>
              <p class="mb-3">设置简单、中等、困难题目的比例，总和必须为100%。</p>
              <p class="mb-3"><strong>4. 随机组卷</strong></p>
              <p>点击生成后，系统按配置随机抽取题目并打乱顺序。</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="modal" :class="{ 'is-active': showSuccessModal }">
      <div class="modal-background"></div>
      <div class="modal-card" style="max-width: 500px;">
        <header class="modal-card-head">
          <p class="modal-card-title">
            <span class="icon has-text-success"><i class="fas fa-check-circle"></i></span> 试卷生成成功！
          </p>
          <button class="delete" aria-label="close" @click="showSuccessModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="content" v-if="generatedPaper">
            <div class="notification is-success">
              <p class="title is-4">{{ generatedPaper.title }}</p>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>年级：</span><strong>{{ generatedPaper.grade }}年级</strong>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>题目总数：</span><strong>{{ generatedPaper.questions.length }} 道</strong>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>试卷总分：</span><strong>{{ generatedPaper.totalScore }} 分</strong>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>单选题：</span><strong>{{ generatedPaper.questions.filter(q => q.type === 'single').length }} 道</strong>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>多选题：</span><strong>{{ generatedPaper.questions.filter(q => q.type === 'multiple').length }} 道</strong>
            </div>
            <div class="is-flex is-justify-content-space-between">
              <span>判断题：</span><strong>{{ generatedPaper.questions.filter(q => q.type === 'judge').length }} 道</strong>
            </div>
          </div>
        </section>
        <footer class="modal-card-foot">
          <NuxtLink to="/papers" class="button is-primary">
            <span class="icon"><i class="fas fa-list"></i></span>
            <span>查看试卷列表</span>
          </NuxtLink>
          <button class="button" @click="showSuccessModal = false">关闭</button>
        </footer>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { type ExamPaper, type ExamConfig, type Grade } from '~/stores/exam'

const examStore = useExamStore()

const grades: Grade[] = [1, 2, 3, 4, 5, 6]

const paperTitle = ref('')

const config = ref<ExamConfig>({
  singleCount: 5,
  singleScore: 2,
  multipleCount: 3,
  multipleScore: 4,
  judgeCount: 2,
  judgeScore: 2,
  easyRatio: 0.5,
  mediumRatio: 0.3,
  hardRatio: 0.2,
  grade: 3
})

const easyPercent = ref(50)
const mediumPercent = ref(30)
const hardPercent = ref(20)

const showSuccessModal = ref(false)
const generatedPaper = ref<ExamPaper | null>(null)

const currentGradeStats = computed(() => examStore.gradeStats(config.value.grade))

const totalPercent = computed(() => easyPercent.value + mediumPercent.value + hardPercent.value)

const totalScore = computed(() => {
  return config.value.singleCount * config.value.singleScore +
    config.value.multipleCount * config.value.multipleScore +
    config.value.judgeCount * config.value.judgeScore
})

const totalQuestions = computed(() => {
  return config.value.singleCount + config.value.multipleCount + config.value.judgeCount
})

const canGenerate = computed(() => {
  if (!paperTitle.value.trim()) return false
  if (totalQuestions.value === 0) return false
  if (totalPercent.value !== 100) return false
  if (config.value.singleCount > currentGradeStats.value.single) return false
  if (config.value.multipleCount > currentGradeStats.value.multiple) return false
  if (config.value.judgeCount > currentGradeStats.value.judge) return false
  return true
})

watch([easyPercent, mediumPercent, hardPercent], () => {
  config.value.easyRatio = easyPercent.value / 100
  config.value.mediumRatio = mediumPercent.value / 100
  config.value.hardRatio = hardPercent.value / 100
})

const adjustRatio = () => {
  const diff = 100 - totalPercent.value
  if (diff > 0) {
    easyPercent.value += diff
  } else {
    if (easyPercent.value >= Math.abs(diff)) {
      easyPercent.value += diff
    } else {
      mediumPercent.value += diff
    }
  }
}

const generatePaper = () => {
  if (!canGenerate.value) return
  const paper = examStore.generatePaper(config.value, paperTitle.value)
  generatedPaper.value = paper
  showSuccessModal.value = true
  paperTitle.value = ''
}
</script>
