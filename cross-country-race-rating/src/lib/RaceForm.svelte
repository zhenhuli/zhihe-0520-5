<script>
  import { RACE_DISTANCES, TERRAIN_OPTIONS, WEATHER_OPTIONS } from './raceCalculator.js'

  export let distance = 21
  export let elevation = 500
  export let terrain = 'medium'
  export let weather = 'sunny'
  export let finishHours = 2
  export let finishMinutes = 30
  export let finishSeconds = 0

  function handleSubmit() {
    const actualTime = finishHours * 3600 + finishMinutes * 60 + finishSeconds
    const event = new CustomEvent('calculate', {
      detail: { distance, elevation, terrain, weather, actualTime }
    })
    document.dispatchEvent(event)
  }
</script>

<div class="form-container">
  <h2 class="form-title">赛事信息录入</h2>

  <div class="form-group">
    <label for="race-distance" class="form-label">赛事距离</label>
    <select id="race-distance" bind:value={distance} class="form-select">
      {#each RACE_DISTANCES as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="race-elevation" class="form-label">赛道累计海拔 (米)</label>
    <input
      id="race-elevation"
      type="number"
      bind:value={elevation}
      min="0"
      max="10000"
      step="10"
      class="form-input"
      placeholder="例如：500"
    />
  </div>

  <div class="form-group">
    <label for="race-terrain" class="form-label">路况难度</label>
    <select id="race-terrain" bind:value={terrain} class="form-select">
      {#each TERRAIN_OPTIONS as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="race-weather" class="form-label">天气条件</label>
    <select id="race-weather" bind:value={weather} class="form-select">
      {#each WEATHER_OPTIONS as opt}
        <option value={opt.value}>{opt.label}</option>
      {/each}
    </select>
  </div>

  <div class="form-group">
    <label for="race-hours" class="form-label">完赛时长</label>
    <div class="time-inputs">
      <div class="time-unit">
        <input id="race-hours" type="number" bind:value={finishHours} min="0" max="48" class="form-input time-input" />
        <span class="time-label">时</span>
      </div>
      <div class="time-unit">
        <input id="race-minutes" type="number" bind:value={finishMinutes} min="0" max="59" class="form-input time-input" />
        <span class="time-label">分</span>
      </div>
      <div class="time-unit">
        <input id="race-seconds" type="number" bind:value={finishSeconds} min="0" max="59" class="form-input time-input" />
        <span class="time-label">秒</span>
      </div>
    </div>
  </div>

  <button class="submit-btn" on:click={handleSubmit}>计算评级</button>
</div>

<style module>
  .form-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-radius: 16px;
    padding: 32px;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  }

  .form-title {
    color: #e8e8e8;
    font-size: 1.5rem;
    font-weight: 700;
    margin-bottom: 28px;
    text-align: center;
    letter-spacing: 0.05em;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .form-label {
    display: block;
    color: #b0b8c4;
    font-size: 0.9rem;
    font-weight: 500;
    margin-bottom: 8px;
    letter-spacing: 0.02em;
  }

  .form-input,
  .form-select {
    width: 100%;
    padding: 12px 16px;
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    color: #e8e8e8;
    font-size: 1rem;
    transition: all 0.25s ease;
    box-sizing: border-box;
  }

  .form-input:focus,
  .form-select:focus {
    outline: none;
    border-color: #4fc3f7;
    background: rgba(79, 195, 247, 0.08);
    box-shadow: 0 0 0 3px rgba(79, 195, 247, 0.15);
  }

  .form-select {
    cursor: pointer;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23b0b8c4' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    padding-right: 40px;
  }

  .form-select option {
    background: #1a1a2e;
    color: #e8e8e8;
  }

  .time-inputs {
    display: flex;
    gap: 12px;
  }

  .time-unit {
    flex: 1;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .time-input {
    width: 100%;
  }

  .time-label {
    color: #b0b8c4;
    font-size: 0.85rem;
    flex-shrink: 0;
  }

  .submit-btn {
    width: 100%;
    padding: 14px 24px;
    background: linear-gradient(135deg, #4fc3f7 0%, #29b6f6 100%);
    border: none;
    border-radius: 10px;
    color: #fff;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    margin-top: 8px;
    letter-spacing: 0.05em;
  }

  .submit-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(79, 195, 247, 0.4);
  }

  .submit-btn:active {
    transform: translateY(0);
  }
</style>
