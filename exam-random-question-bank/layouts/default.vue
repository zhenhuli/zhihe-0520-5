<template>
  <div>
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item has-text-weight-bold is-size-5">
          <span class="icon mr-2"><i class="fas fa-book-open"></i></span>
          小学智能题库
        </NuxtLink>
        <a role="button" class="navbar-burger" :class="{ 'is-active': showNav }" @click="showNav = !showNav">
          <span></span><span></span><span></span>
        </a>
      </div>
      <div class="navbar-menu" :class="{ 'is-active': showNav }">
        <div class="navbar-start">
          <NuxtLink to="/" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-home"></i></span>首页
          </NuxtLink>
          <NuxtLink to="/questions" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-question-circle"></i></span>题库管理
          </NuxtLink>
          <NuxtLink to="/generate" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-magic"></i></span>组卷配置
          </NuxtLink>
          <NuxtLink to="/papers" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-file-alt"></i></span>试卷列表
          </NuxtLink>
          <NuxtLink to="/results" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-chart-bar"></i></span>成绩统计
          </NuxtLink>
          <NuxtLink to="/wrong" class="navbar-item" @click="showNav = false">
            <span class="icon mr-2"><i class="fas fa-exclamation-triangle"></i></span>错题本
          </NuxtLink>
        </div>
        <div class="navbar-end">
          <div class="navbar-item">
            <div class="tags has-addons mb-0">
              <span class="tag is-dark is-small">题库</span>
              <span class="tag is-white is-small has-text-weight-bold">{{ examStore.stats.totalQuestions }}题</span>
            </div>
          </div>
        </div>
      </div>
    </nav>
    <main class="main-container">
      <div class="container">
        <slot />
      </div>
    </main>
    <footer class="footer has-background-white">
      <div class="content has-text-centered">
        <p class="has-text-grey is-size-7">
          <strong>小学智能题库组卷系统</strong> - 支持单选、多选、判断题随机组卷与在线自测
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()
const showNav = ref(false)

onMounted(() => {
  examStore.loadFromStorage()
})
</script>
