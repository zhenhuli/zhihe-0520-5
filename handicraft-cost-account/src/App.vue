<template>
  <div id="app">
    <header class="header">
      <h1>🧵 手作工艺品成本核算工具</h1>
      <p>精准核算成本，科学制定售价，让手作更有价值</p>
    </header>

    <div class="main-content">
      <div class="card">
        <h2>
          <span class="icon">📦</span>
          原材料信息
        </h2>

        <div class="materials-list">
          <div
            v-for="(material, index) in materials"
            :key="index"
            class="material-item"
          >
            <div class="form-group material-name">
              <label>材料名称</label>
              <input
                v-model="material.name"
                type="text"
                placeholder="如：棉布、毛线"
              />
            </div>
            <div class="form-group">
              <label>单价 (元)</label>
              <div class="input-wrapper">
                <input
                  v-model.number="material.price"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <span class="unit">/单位</span>
              </div>
            </div>
            <div class="form-group">
              <label>用量</label>
              <div class="input-wrapper">
                <input
                  v-model.number="material.quantity"
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                <span class="unit">单位</span>
              </div>
            </div>
            <button
              v-if="materials.length > 1"
              @click="removeMaterial(index)"
              class="btn-remove"
              title="删除"
            >
              ×
            </button>
          </div>
        </div>

        <button @click="addMaterial" class="btn-add">
          <span>+</span> 添加原材料
        </button>

        <div class="form-group" style="margin-top: 24px;">
          <label>耗材损耗率 (%)</label>
          <div class="input-wrapper">
            <input
              v-model.number="wastageRate"
              type="number"
              min="0"
              max="100"
              step="0.1"
              placeholder="5"
            />
            <span class="unit">%</span>
          </div>
          <div class="hint">预计浪费的材料比例</div>
        </div>
      </div>

      <div class="card">
        <h2>
          <span class="icon">⚙️</span>
          人工与杂费
        </h2>

        <div class="row">
          <div class="form-group">
            <label>人工耗时 (小时/件)</label>
            <div class="input-wrapper">
              <input
                v-model.number="laborHours"
                type="number"
                min="0"
                step="0.1"
                placeholder="2.5"
              />
              <span class="unit">小时</span>
            </div>
          </div>

          <div class="form-group">
            <label>小时工资 (元/小时)</label>
            <div class="input-wrapper">
              <input
                v-model.number="hourlyWage"
                type="number"
                min="0"
                step="0.01"
                placeholder="30"
              />
              <span class="unit">元</span>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="form-group">
            <label>水电杂费 (元/件)</label>
            <div class="input-wrapper">
              <input
                v-model.number="utilitiesCost"
                type="number"
                min="0"
                step="0.01"
                placeholder="5.00"
              />
              <span class="unit">元</span>
            </div>
            <div class="hint">包括水电、工具损耗、包装材料等</div>
          </div>

          <div class="form-group">
            <label>期望利润率 (%)</label>
            <div class="input-wrapper">
              <input
                v-model.number="profitMargin"
                type="number"
                min="0"
                max="500"
                step="1"
                placeholder="50"
              />
              <span class="unit">%</span>
            </div>
            <div class="hint">建议：手作产品通常 30% - 100%</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>
          <span class="icon">📊</span>
          成本明细
        </h2>

        <div class="cost-breakdown">
          <div class="cost-item">
            <span class="label">原材料成本</span>
            <span class="value">¥ {{ materialCost.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">耗材损耗 ({{ wastageRate }}%)</span>
            <span class="value">¥ {{ wastageCost.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">人工成本 ({{ laborHours }}小时)</span>
            <span class="value">¥ {{ laborCost.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">水电杂费</span>
            <span class="value">¥ {{ utilitiesCost.toFixed(2) }}</span>
          </div>
        </div>

        <div class="total-cost">
          <div class="label">单件成品总成本</div>
          <div class="value">¥ {{ totalCost.toFixed(2) }}</div>
        </div>

        <div class="profit-section">
          <div class="cost-item">
            <span class="label">期望利润 ({{ profitMargin }}%)</span>
            <span class="value" style="color: #10b981;">¥ {{ profitAmount.toFixed(2) }}</span>
          </div>
        </div>

        <div class="price-calculation">
          <div class="label">建议售价</div>
          <div class="value">¥ {{ suggestedPrice.toFixed(2) }}</div>
          <div class="note">
            售价 = 成本 × (1 + 利润率) = {{ totalCost.toFixed(2) }} × (1 + {{ profitMargin / 100 }})
          </div>
        </div>
      </div>

      <div class="card">
        <h2>
          <span class="icon">💰</span>
          价格参考
        </h2>

        <div class="cost-breakdown">
          <div class="cost-item">
            <span class="label">保本价格 (0利润)</span>
            <span class="value">¥ {{ totalCost.toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">微利 (20%)</span>
            <span class="value">¥ {{ calculatePrice(20).toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">合理 (50%)</span>
            <span class="value">¥ {{ calculatePrice(50).toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">优质 (80%)</span>
            <span class="value">¥ {{ calculatePrice(80).toFixed(2) }}</span>
          </div>
          <div class="cost-item">
            <span class="label">精品 (100%)</span>
            <span class="value">¥ {{ calculatePrice(100).toFixed(2) }}</span>
          </div>
        </div>

        <button @click="printReport" class="btn-print no-print">
          🖨️ 生成并打印成本报表
        </button>
      </div>

      <div class="card report-section no-print">
        <h2>
          <span class="icon">📋</span>
          成本明细表
        </h2>

        <table class="report-table">
          <thead>
            <tr>
              <th>类别</th>
              <th>项目</th>
              <th>参数</th>
              <th>金额 (元)</th>
              <th>占比</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(mat, idx) in materials" :key="'mat-' + idx">
              <td>原材料</td>
              <td>{{ mat.name || '未命名' }}</td>
              <td>{{ mat.quantity || 0 }} × ¥{{ mat.price || 0 }}/单位</td>
              <td>¥{{ (mat.price * mat.quantity).toFixed(2) }}</td>
              <td>{{ getPercentage(mat.price * mat.quantity) }}%</td>
            </tr>
            <tr>
              <td>损耗</td>
              <td>耗材损耗</td>
              <td>{{ wastageRate }}%</td>
              <td>¥{{ wastageCost.toFixed(2) }}</td>
              <td>{{ getPercentage(wastageCost) }}%</td>
            </tr>
            <tr>
              <td>人工</td>
              <td>人工成本</td>
              <td>{{ laborHours }}小时 × ¥{{ hourlyWage }}/小时</td>
              <td>¥{{ laborCost.toFixed(2) }}</td>
              <td>{{ getPercentage(laborCost) }}%</td>
            </tr>
            <tr>
              <td>杂费</td>
              <td>水电杂费</td>
              <td>-</td>
              <td>¥{{ utilitiesCost.toFixed(2) }}</td>
              <td>{{ getPercentage(utilitiesCost) }}%</td>
            </tr>
            <tr style="background: rgba(139, 92, 246, 0.1); font-weight: 600;">
              <td colspan="3">合计</td>
              <td>¥{{ totalCost.toFixed(2) }}</td>
              <td>100%</td>
            </tr>
          </tbody>
        </table>

        <div class="report-summary">
          <div class="summary-item">
            <div class="label">原材料占比</div>
            <div class="value">{{ getPercentage(materialCost) }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">人工占比</div>
            <div class="value">{{ getPercentage(laborCost) }}%</div>
          </div>
          <div class="summary-item">
            <div class="label">总成本</div>
            <div class="value">¥{{ totalCost.toFixed(2) }}</div>
          </div>
          <div class="summary-item">
            <div class="label">建议售价</div>
            <div class="value">¥{{ suggestedPrice.toFixed(2) }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const materials = ref([
  { name: '棉布', price: 25, quantity: 0.5 },
  { name: '填充棉', price: 30, quantity: 0.3 }
])

const wastageRate = ref(5)
const laborHours = ref(2)
const hourlyWage = ref(30)
const utilitiesCost = ref(5)
const profitMargin = ref(50)

const addMaterial = () => {
  materials.value.push({ name: '', price: 0, quantity: 0 })
}

const removeMaterial = (index) => {
  materials.value.splice(index, 1)
}

const materialCost = computed(() => {
  return materials.value.reduce((sum, m) => sum + (m.price * m.quantity || 0), 0)
})

const wastageCost = computed(() => {
  return materialCost.value * (wastageRate.value / 100)
})

const laborCost = computed(() => {
  return laborHours.value * hourlyWage.value
})

const totalCost = computed(() => {
  return materialCost.value + wastageCost.value + laborCost.value + utilitiesCost.value
})

const profitAmount = computed(() => {
  return totalCost.value * (profitMargin.value / 100)
})

const suggestedPrice = computed(() => {
  return totalCost.value * (1 + profitMargin.value / 100)
})

const calculatePrice = (margin) => {
  return totalCost.value * (1 + margin / 100)
}

const getPercentage = (value) => {
  if (totalCost.value === 0) return 0
  return ((value / totalCost.value) * 100).toFixed(1)
}

const printReport = () => {
  window.print()
}
</script>
