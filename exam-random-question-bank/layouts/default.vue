<template>
  <div>
    <nav class="navbar is-primary" role="navigation" aria-label="main navigation">
      <div class="navbar-brand">
        <NuxtLink to="/" class="navbar-item has-text-weight-bold is-size-5">
          <span class="icon mr-2"><i class="fas fa-book-open"></i></span>
          智能题库组卷系统
        </NuxtLink>
      </div>
      <div class="navbar-menu">
        <div class="navbar-start">
          <NuxtLink to="/" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-home"></i></span>
            首页
          </NuxtLink>
          <NuxtLink to="/questions" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-question-circle"></i></span>
            题库管理
          </NuxtLink>
          <NuxtLink to="/generate" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-magic"></i></span>
            组卷配置
          </NuxtLink>
          <NuxtLink to="/papers" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-file-alt"></i></span>
            试卷列表
          </NuxtLink>
          <NuxtLink to="/results" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-chart-bar"></i></span>
            成绩统计
          </NuxtLink>
          <NuxtLink to="/wrong" class="navbar-item">
            <span class="icon mr-2"><i class="fas fa-exclamation-triangle"></i></span>
            错题汇总
          </NuxtLink>
        </div>
      </div>
    </nav>
    <main class="main-container">
      <div class="container">
        <slot />
      </div>
    </main>
    <footer class="footer has-background-light">
      <div class="content has-text-centered">
        <p class="has-text-grey">
          <strong>智能题库组卷系统</strong> - 支持单选、多选、填空题随机组卷
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
const examStore = useExamStore()

onMounted(() => {
  examStore.loadFromStorage()
})
</script>
