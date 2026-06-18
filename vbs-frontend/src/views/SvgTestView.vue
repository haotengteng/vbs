<script setup lang="ts">
import { ref } from 'vue';
import HeaderBar from '@/components/HeaderBar.vue';

const speed = ref(1); // 动画时长（秒），值越小越快
const reverse = ref(false); // 是否反向（逆时针）
</script>

<template>
  <div class="svg-test-page">
    <HeaderBar />

    <div class="page-content">
      <div class="page-header">
        <h1 class="title">SVG 自定义动画测试</h1>
        <p class="subtitle">展示自定义设计的 SVG 动态矢量图效果</p>
      </div>

      <div class="test-area">
        <svg
          class="test-svg"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="none"
        >
          <path
            class="loader-path"
            :style="{
              animationDuration: speed + 's',
              animationDirection: reverse ? 'reverse' : 'normal',
            }"
            fill="#FF6B00"
            d="M17.179 13.605a.431.431 0 00.279.514l.775.245a.393.393 0 00.499-.268 7.318 7.318 0 00-4.5-8.658.39.39 0 00-.507.255l-.245.775a.43.43 0 00.261.523 5.69 5.69 0 013.438 6.614z"
          />
        </svg>
      </div>

      <!-- 控制面板 -->
      <div class="control-panel">
        <div class="control-grid">
          <div class="control-item">
            <label class="control-label">动画速度</label>
            <div class="speed-slider-row">
              <span class="speed-label">快</span>
              <input
                v-model.number="speed"
                type="range"
                min="0.1"
                max="5"
                step="0.1"
                class="speed-slider"
              />
              <span class="speed-label">慢</span>
            </div>
            <div class="speed-value">当前: {{ speed.toFixed(1) }}s / 圈</div>
          </div>
          <div class="control-item direction-control">
            <label class="control-label">转动方向</label>
            <div class="direction-buttons">
              <button
                :class="['dir-btn', { active: !reverse }]"
                @click="reverse = false"
              >顺时针</button>
              <button
                :class="['dir-btn', { active: reverse }]"
                @click="reverse = true"
              >逆时针</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.svg-test-page {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  background: linear-gradient(135deg, #0a1929 0%, #0f172a 100%);
  color: #e2e8f0;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.page-header {
  text-align: center;
  margin-bottom: 8px;
}

.title {
  font-size: 24px;
  font-weight: 700;
  color: #f1f5f9;
  margin: 0 0 4px;
  background: linear-gradient(90deg, #60a5fa, #a78bfa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.subtitle {
  font-size: 13px;
  color: #94a3b8;
  margin: 0;
}

.test-area {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.test-svg {
  width: 200px;
  height: 200px;
}

.loader-path {
  animation: loader2 1s cubic-bezier(.63, -.71, .32, 1.28) infinite both;
  transform-origin: center center;
}

@keyframes loader2 {
  0% {
    transform: rotate(0);
  }
  to {
    transform: rotate(360deg);
  }
}

/* 速度控制面板 */
.control-panel {
  background: rgba(15, 23, 42, 0.6);
  border: 1px solid #1e293b;
  border-radius: 12px;
  padding: 16px 20px;
}

.speed-control {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  flex: 1;
  min-width: 200px;
}

.direction-control {
  justify-content: center;
}

.direction-buttons {
  display: flex;
  gap: 8px;
}

.dir-btn {
  flex: 1;
  padding: 8px 16px;
  border: 1px solid #334155;
  border-radius: 6px;
  background: #1e293b;
  color: #94a3b8;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.dir-btn:hover {
  border-color: #3b82f6;
  color: #cbd5e1;
}

.dir-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: #fff;
  font-weight: 600;
}

.control-label {
  font-size: 14px;
  font-weight: 600;
  color: #cbd5e1;
}

.speed-slider-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.speed-label {
  font-size: 13px;
  color: #94a3b8;
  white-space: nowrap;
}

.speed-slider {
  flex: 1;
  height: 6px;
  -webkit-appearance: none;
  appearance: none;
  background: #1e293b;
  border-radius: 3px;
  outline: none;
  cursor: pointer;
}

.speed-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: #3b82f6;
  cursor: pointer;
  transition: background 0.2s;
}

.speed-slider::-webkit-slider-thumb:hover {
  background: #60a5fa;
}

.speed-value {
  font-size: 13px;
  color: #60a5fa;
  text-align: center;
  font-weight: 500;
}
</style>
