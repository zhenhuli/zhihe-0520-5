<script>
  import { onMount } from 'svelte'
  import RaceForm from './lib/RaceForm.svelte'
  import RaceResult from './lib/RaceResult.svelte'
  import {
    calculateStandardTime,
    calculateScore,
    getAthleteLevel,
    formatTime
  } from './lib/raceCalculator.js'

  let result = null

  function handleCalculate(e) {
    const { distance, elevation, terrain, weather, actualTime } = e.detail
    const standardTime = calculateStandardTime(distance, elevation, terrain, weather)
    const score = calculateScore(actualTime, standardTime)
    const level = getAthleteLevel(score)
    result = {
      distance,
      elevation,
      terrain,
      weather,
      actualTime,
      standardTime,
      score,
      level
    }
  }

  onMount(() => {
    document.addEventListener('calculate', handleCalculate)
    return () => {
      document.removeEventListener('calculate', handleCalculate)
    }
  })
</script>

<div class="app-wrapper">
  <header class="app-header">
    <div class="header-content">
      <h1 class="app-title">🏃 越野跑成绩评级测算工具</h1>
      <p class="app-subtitle">综合海拔 · 路况 · 天气 · 时长，精准评估你的运动等级</p>
    </div>
  </header>

  <main class="app-main">
    <div class="content-grid">
      <div class="form-section">
        <RaceForm />
      </div>
      <div class="result-section" class:has-result={result !== null}>
        {#if result}
          <RaceResult {result} />
        {:else}
          <div class="empty-state">
            <div class="empty-icon">📊</div>
            <h3 class="empty-title">等待评级</h3>
            <p class="empty-desc">请在左侧填写赛事信息并点击"计算评级"</p>
          </div>
        {/if}
      </div>
    </div>
  </main>

  <footer class="app-footer">
    <p>© 2026 越野跑成绩评级测算工具 · 基于 Svelte + Vite 构建</p>
  </footer>
</div>

<style module>
  .app-wrapper {
    min-height: 100vh;
    background: linear-gradient(180deg, #0f0f1a 0%, #1a1a2e 100%);
    display: flex;
    flex-direction: column;
  }

  .app-header {
    background: rgba(15, 15, 26, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 28px 0;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 24px;
    text-align: center;
  }

  .app-title {
    font-size: 1.8rem;
    font-weight: 800;
    color: #fff;
    margin: 0 0 8px 0;
    letter-spacing: 0.02em;
  }

  .app-subtitle {
    color: #7a8291;
    font-size: 0.95rem;
    margin: 0;
  }

  .app-main {
    flex: 1;
    padding: 36px 24px;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    box-sizing: border-box;
  }

  .content-grid {
    display: grid;
    grid-template-columns: 380px 1fr;
    gap: 32px;
    align-items: start;
  }

  .form-section {
    position: sticky;
    top: 36px;
  }

  .result-section {
    min-height: 600px;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 500px;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 40px;
    text-align: center;
  }

  .empty-icon {
    font-size: 3rem;
    margin-bottom: 20px;
    opacity: 0.5;
  }

  .empty-title {
    color: #e8e8e8;
    font-size: 1.2rem;
    font-weight: 600;
    margin: 0 0 10px 0;
  }

  .empty-desc {
    color: #7a8291;
    font-size: 0.9rem;
    margin: 0;
  }

  .app-footer {
    background: rgba(15, 15, 26, 0.8);
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    padding: 20px 0;
    text-align: center;
  }

  .app-footer p {
    color: #5a6273;
    font-size: 0.85rem;
    margin: 0;
  }

  @media (max-width: 900px) {
    .content-grid {
      grid-template-columns: 1fr;
    }

    .form-section {
      position: static;
    }

    .app-title {
      font-size: 1.4rem;
    }
  }
</style>
