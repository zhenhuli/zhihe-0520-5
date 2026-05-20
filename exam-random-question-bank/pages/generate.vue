<template>
  <div>
    <div class="is-flex is-justify-content-space-between is-align-items-center mb-5">
      <div>
        <h1 class="title is-3">组卷配置</h1>
        <p class="subtitle is-6">设置题型分值、出题数量与难度比例，一键随机生成试卷</p>
      </div>
    </div>

    <div class="columns">
      <div class="column is-8">
        <div class="card">
          <div class="card-content">
            <div class="field mb-5">
              <label class="label">试卷名称</label>
              <div class="control">
                <input class="input is-large" type="text" placeholder="请输入试卷名称" v-model="paperTitle">
              </div>
            </div>

            <div class="notification is-info is-light mb-5">
              <p class="has-text-weight-medium mb-2">
                <span class="icon"><i class="fas fa-info-circle"></i></span>
                当前题库可用题目数量
              </p>
              <div class="columns is-gapless">
                <div class="column">
                  <p>单选题：<span class="has-text-weight-bold">{{ examStore.stats.singleCount }} 道</span></p>
                </div>
                <div class="column">
                  <p>多选题：<span class="has-text-weight-bold">{{ examStore.stats.multipleCount }} 道</span></p>
                </div>
                <div class="column">
                  <p>填空题：<span class="has-text-weight-bold">{{ examStore.stats.fillCount }} 道</span></p>
                </div>
              </div>
            </div>

            <h2 class="subtitle is-4 mb-4">
              <span class="icon"><i class="fas fa-cog"></i></span>
              题型配置
            </h2>

            <div class="box mb-5">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <div>
                  <span class="tag is-info is-medium">单选题</span>
                </div>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="examStore.stats.singleCount" v-model.number="config.singleCount">
                    </div>
                    <p class="help">可用: {{ examStore.stats.singleCount }} 道</p>
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

            <div class="box mb-5">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <div>
                  <span class="tag is-primary is-medium">多选题</span>
                </div>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="examStore.stats.multipleCount" v-model.number="config.multipleCount">
                    </div>
                    <p class="help">可用: {{ examStore.stats.multipleCount }} 道</p>
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

            <div class="box mb-5">
              <div class="is-flex is-justify-content-space-between is-align-items-center mb-3">
                <div>
                  <span class="tag is-warning is-medium">填空题</span>
                </div>
              </div>
              <div class="columns">
                <div class="column is-6">
                  <div class="field">
                    <label class="label">题目数量</label>
                    <div class="control">
                      <input class="input" type="number" min="0" :max="examStore.stats.fillCount" v-model.number="config.fillCount">
                    </div>
                    <p class="help">可用: {{ examStore.stats.fillCount }} 道</p>
                  </div>
                </div>
                <div class="column is-6">
                  <div class="field">
                    <label class="label">每题分值</label>
                    <div class="control">
                      <input class="input" type="number" min="1" v-model.number="config.fillScore">
                    </div>
                    <p class="help">小计: {{ config.fillCount * config.fillScore }} 分</p>
                  </div>
                </div>
              </div>
            </div>

            <h2 class="subtitle is-4 mb-4 mt-6">
              <span class="icon"><i class="fas fa-signal"></i></span>
              难度比例配置
            </h2>

            <div class="box">
              <div class="columns">
                <div class="column is-4">
                  <div class="field">
                    <label class="label">
                      <span class="tag is-success">简单</span> 题比例
                    </label>
                    <div class="control">
                      <input class="input" type="range" min="0" max="100" v-model.number="easyPercent">
                    </div>
                    <p class="help has-text-weight-bold has-text-success">{{ easyPercent }}%</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label">
                      <span class="tag is-warning">中等</span> 题比例
                    </label>
                    <div class="control">
                      <input class="input" type="range" min="0" max="100" v-model.number="mediumPercent">
                    </div>
                    <p class="help has-text-weight-bold has-text-warning">{{ mediumPercent }}%</p>
                  </div>
                </div>
                <div class="column is-4">
                  <div class="field">
                    <label class="label">
                      <span class="tag is-danger">困难</span> 题比例
                    </label>
                    <div class="control">
                      <input class="input" type="range" min="0" max="100" v-model.number="hardPercent">
                    </div>
                    <p class="help has-text-weight-bold has-text-danger">{{ hardPercent }}%</p>
                  </div>
                </div>
              </div>
              <div v-if="totalPercent !== 100" class="notification is-warning">
                <span class="icon"><i class="fas fa-exclamation-triangle"></i></span>
                <span>难度比例总和必须为 100%，当前为 {{ totalPercent }}%
                  <button v-if="totalPercent !== 100" class="button is-small is-warning ml-2" @click="adjustRatio">自动调整</button>
                </span>
              </div>
            </div>

            <div class="notification is-primary is-light mt-5 p-4">
              <div class="is-flex is-justify-content-space-between is-align-items-center">
                <div>
                  <p class="has-text-weight-medium">试卷总分</p>
                  <p class="title is-2 mt-1">{{ totalScore }} 分</p>
                  <p class="has-text-grey">共 {{ totalQuestions }} 道题</p>
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
              <span class="icon"><i class="fas fa-lightbulb"></i></span>
              组卷说明
            </p>
          </div>
          <div class="card-content">
            <div class="content">
              <p class="mb-3"><strong>1. 题型配置</strong></p>
              <p class="mb-3">设置单选题、多选题、填空题的数量和每题分值，系统将根据设置自动计算总分。</p>
              <p class="mb-3"><strong>2. 难度比例</strong></p>
              <p class="mb-3">设置简单、中等、困难题目的比例，系统会按比例从题库中随机抽取。</p>
              <p class="mb-3"><strong>3. 随机组卷</strong></p>
              <p class="mb-3">点击生成按钮后，系统会根据配置随机抽取题目并打乱顺序。</p>
              <p class="mb-3"><strong>4. 注意事项</strong></p>
              <p>请确保题库中有足够数量的题目，否则可能无法按配置生成试卷。</p>
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
            <span class="icon has-text-success"><i class="fas fa-check-circle"></i></span>
            试卷生成成功！
          </p>
          <button class="delete" aria-label="close" @click="showSuccessModal = false"></button>
        </header>
        <section class="modal-card-body">
          <div class="content">
            <div class="notification is-success">
              <p class="title is-4">{{ generatedPaper?.title }}</p>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>题目总数：</span>
              <span class="has-text-weight-bold">{{ generatedPaper?.questions.length }} 道</span>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>试卷总分：</span>
              <span class="has-text-weight-bold">{{ generatedPaper?.totalScore }} 分</span>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>单选题：</span>
              <span class="has-text-weight-bold">{{ generatedPaper?.questions.filter(q => q.type === 'single').length }} 道</span>
            </div>
            <div class="is-flex is-justify-content-space-between mb-2">
              <span>多选题：</span>
              <span class="has-text-weight-bold">{{ generatedPaper?.questions.filter(q => q.type === 'multiple').length }} 道</span>
            </div>
            <div class="is-flex is-justify-content-space-between">
              <span>填空题：</span>
              <span class="has-text-weight-bold">{{ generatedPaper?.questions.filter(q => q.type === 'fill').length }} 道</span>
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
import type { ExamPaper, ExamConfig } from '~/stores/exam'

const examStore = useExamStore()

const paperTitle = ref('')

const config = ref<ExamConfig>({
  singleCount: 5,
  singleScore: 2,
  multipleCount: 3,
  multipleScore: 4,
  fillCount: 2,
  fillScore: 5,
  easyRatio: 0.5,
  mediumRatio: 0.3,
  hardRatio: 0.2
})

const easyPercent = ref(50)
const mediumPercent = ref(30)
const hardPercent = ref(20)

const showSuccessModal = ref(false)
const generatedPaper = ref<ExamPaper | null>(null)

const totalPercent = computed(() => easyPercent.value + mediumPercent.value + hardPercent.value)

const totalScore = computed(() => {
  return config.value.singleCount * config.value.singleScore +
    config.value.multipleCount * config.value.multipleScore +
    config.value.fillCount * config.value.fillScore
})

const totalQuestions = computed(() => {
  return config.value.singleCount + config.value.multipleCount + config.value.fillCount
})

const canGenerate = computed(() => {
  if (!paperTitle.value.trim()) return false
  if (totalQuestions.value === 0) return false
  if (totalPercent.value !== 100) return false
  
  if (config.value.singleCount > examStore.stats.singleCount) return false
  if (config.value.multipleCount > examStore.stats.multipleCount) return false
  if (config.value.fillCount > examStore.stats.fillCount) return false
  
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
