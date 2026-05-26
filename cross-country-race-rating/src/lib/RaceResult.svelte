<script>
  import { formatTime, generateAnalysis, ATHLETE_LEVELS } from './raceCalculator.js'

  export let result = null

  $: analysis = result ? generateAnalysis(result) : null
</script>

{#if result && analysis}
  <div class="result-container">
    <div class="header-section">
      <div class="score-circle" style="--score-color: {result.level.color}">
        <span class="score-value">{result.score}</span>
        <span class="score-label">综合评分</span>
      </div>
      <div class="level-info">
        <div class="level-badge" style="background: {result.level.color}">
          {result.level.label}
        </div>
        <p class="level-desc">{result.level.desc}</p>
      </div>
    </div>

    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon">🏔️</div>
        <div class="stat-content">
          <span class="stat-label">平均配速</span>
          <span class="stat-value">{analysis.pace} 分/公里</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">⏱️</div>
        <div class="stat-content">
          <span class="stat-label">完赛时间</span>
          <span class="stat-value">{formatTime(result.actualTime)}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">🎯</div>
        <div class="stat-content">
          <span class="stat-label">标准用时</span>
          <span class="stat-value">{formatTime(result.standardTime)}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">📊</div>
        <div class="stat-content">
          <span class="stat-label">成绩对比</span>
          <span class="stat-value">
            {analysis.timeDiffLabel}标准 {formatTime(analysis.timeDiff)}
          </span>
        </div>
      </div>
    </div>

    <div class="analysis-section">
      <h3 class="section-title">综合评价</h3>
      <p class="overall-text">{analysis.overall}</p>
    </div>

    <div class="analysis-grid">
      <div class="analysis-card">
        <h3 class="section-title" style="color: #2ecc71">优势领域</h3>
        <ul class="analysis-list">
          {#each analysis.strengths as strength}
            <li class="analysis-item strength">{strength}</li>
          {/each}
          {#if analysis.strengths.length === 0}
            <li class="analysis-item empty">暂无数据</li>
          {/if}
        </ul>
      </div>
      <div class="analysis-card">
        <h3 class="section-title" style="color: #e74c3c">待提升领域</h3>
        <ul class="analysis-list">
          {#each analysis.weaknesses as weakness}
            <li class="analysis-item weakness">{weakness}</li>
          {/each}
          {#if analysis.weaknesses.length === 0}
            <li class="analysis-item empty">暂无数据</li>
          {/if}
        </ul>
      </div>
    </div>

    <div class="suggestions-section">
      <h3 class="section-title" style="color: #3498db">训练建议</h3>
      <ul class="suggestions-list">
        {#each analysis.suggestions as suggestion}
          <li class="suggestion-item">{suggestion}</li>
        {/each}
      </ul>
    </div>

    <div class="level-chart">
      <h3 class="section-title">等级参考</h3>
      <div class="level-bars">
        {#each ATHLETE_LEVELS as lvl}
          <div class="level-bar" class:active={result.level.label === lvl.label}>
            <div class="level-bar-fill" style="width: {(100 - lvl.min)}%; background: {lvl.color}"></div>
            <div class="level-bar-info">
              <span class="level-bar-name" style="color: {lvl.color}">{lvl.label}</span>
              <span class="level-bar-score">{lvl.min}分+</span>
            </div>
          </div>
        {/each}
      </div>
    </div>
  </div>
{/if}

<style module>
  .result-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .header-section {
    display: flex;
    align-items: center;
    gap: 32px;
    margin-bottom: 32px;
    padding-bottom: 28px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .score-circle {
    width: 140px;
    height: 140px;
    border-radius: 50%;
    background: conic-gradient(var(--score-color) calc(var(--score-color, 0) * 1%), rgba(255, 255, 255, 0.05) 0);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: relative;
  }

  .score-circle::before {
    content: '';
    position: absolute;
    width: 116px;
    height: 116px;
    border-radius: 50%;
    background: #1a1a2e;
  }

  .score-value {
    font-size: 2.5rem;
    font-weight: 800;
    color: #fff;
    z-index: 1;
    line-height: 1;
  }

  .score-label {
    font-size: 0.75rem;
    color: #b0b8c4;
    z-index: 1;
    margin-top: 4px;
    letter-spacing: 0.1em;
  }

  .level-info {
    flex: 1;
  }

  .level-badge {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 20px;
    color: #fff;
    font-weight: 700;
    font-size: 1.1rem;
    margin-bottom: 12px;
  }

  .level-desc {
    color: #b0b8c4;
    font-size: 0.95rem;
    line-height: 1.6;
    margin: 0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 16px;
    margin-bottom: 28px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.25s ease;
  }

  .stat-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.15);
  }

  .stat-icon {
    font-size: 1.5rem;
  }

  .stat-content {
    display: flex;
    flex-direction: column;
  }

  .stat-label {
    font-size: 0.8rem;
    color: #7a8291;
    margin-bottom: 4px;
  }

  .stat-value {
    font-size: 1rem;
    color: #e8e8e8;
    font-weight: 600;
  }

  .analysis-section {
    margin-bottom: 28px;
  }

  .section-title {
    font-size: 1.05rem;
    color: #e8e8e8;
    font-weight: 700;
    margin-bottom: 14px;
    letter-spacing: 0.03em;
  }

  .overall-text {
    color: #b0b8c4;
    line-height: 1.7;
    font-size: 0.95rem;
    background: rgba(255, 255, 255, 0.03);
    padding: 16px 20px;
    border-radius: 10px;
    border-left: 3px solid #4fc3f7;
    margin: 0;
  }

  .analysis-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 28px;
  }

  .analysis-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 12px;
    padding: 20px;
  }

  .analysis-list,
  .suggestions-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .analysis-item,
  .suggestion-item {
    color: #b0b8c4;
    font-size: 0.9rem;
    padding: 10px 0;
    padding-left: 20px;
    position: relative;
    line-height: 1.5;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .analysis-item:last-child,
  .suggestion-item:last-child {
    border-bottom: none;
  }

  .analysis-item::before {
    content: '';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 6px;
    height: 6px;
    border-radius: 50%;
  }

  .analysis-item.strength::before {
    background: #2ecc71;
  }

  .analysis-item.weakness::before {
    background: #e74c3c;
  }

  .analysis-item.empty {
    color: #5a6273;
    padding-left: 0;
  }

  .analysis-item.empty::before {
    display: none;
  }

  .suggestions-section {
    margin-bottom: 28px;
  }

  .suggestion-item {
    padding-left: 28px;
  }

  .suggestion-item::before {
    content: '💡';
    position: absolute;
    left: 0;
    top: 50%;
    transform: translateY(-50%);
    font-size: 0.85rem;
  }

  .level-chart {
    margin-top: 8px;
  }

  .level-bars {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .level-bar {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 8px;
    overflow: hidden;
    position: relative;
    transition: all 0.3s ease;
  }

  .level-bar.active {
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 12px rgba(79, 195, 247, 0.2);
  }

  .level-bar-fill {
    height: 100%;
    position: absolute;
    left: 0;
    top: 0;
    opacity: 0.3;
    transition: width 0.5s ease;
  }

  .level-bar.active .level-bar-fill {
    opacity: 0.5;
  }

  .level-bar-info {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 16px;
    position: relative;
    z-index: 1;
  }

  .level-bar-name {
    font-weight: 600;
    font-size: 0.9rem;
  }

  .level-bar-score {
    font-size: 0.85rem;
    color: #7a8291;
    font-weight: 500;
  }
</style>
