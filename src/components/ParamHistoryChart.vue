<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { ParameterHistory } from '@/types';

interface Props {
  history: ParameterHistory | null;
}

const props = defineProps<Props>();

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartContainerRef = ref<HTMLDivElement | null>(null);

const hasData = computed(() => props.history !== null && props.history.data.length > 0);

function drawChart() {
  const canvas = canvasRef.value;
  if (!canvas || !props.history || props.history.data.length === 0) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 15, bottom: 30, left: 45 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  const data = props.history.data;
  const values = data.map((d) => d.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue || 1;
  const yMin = minValue - range * 0.1;
  const yMax = maxValue + range * 0.1;
  const yRange = yMax - yMin;

  // 清空画布
  ctx.clearRect(0, 0, width, height);

  // 绘制网格线
  ctx.strokeStyle = 'rgba(30, 58, 95, 0.4)';
  ctx.lineWidth = 1;

  // 横向网格线
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y轴标签
    const value = yMax - (yRange / 4) * i;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px Roboto Mono, monospace';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(value.toFixed(1), padding.left - 6, y);
  }

  // 绘制折线
  if (data.length > 1) {
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.value - yMin) / yRange) * chartHeight;

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // 绘制渐变填充
    ctx.beginPath();
    const firstX = padding.left;
    const firstY = padding.top + chartHeight - ((data[0].value - yMin) / yRange) * chartHeight;
    ctx.moveTo(firstX, firstY);

    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.value - yMin) / yRange) * chartHeight;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
    ctx.lineTo(padding.left, padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制数据点
    data.forEach((point, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const y = padding.top + chartHeight - ((point.value - yMin) / yRange) * chartHeight;

      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fillStyle = '#00d4ff';
      ctx.fill();
      ctx.strokeStyle = 'rgba(15, 29, 50, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    });
  }

  // X轴时间标签
  if (data.length > 0) {
    const timeLabels = data.length > 5 
      ? [0, Math.floor(data.length / 2), data.length - 1]
      : data.map((_, i) => i);
    
    timeLabels.forEach((index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index;
      const time = data[index].timestamp;
      const timeStr = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;

      ctx.fillStyle = '#64748b';
      ctx.font = '9px Roboto Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timeStr, x, padding.top + chartHeight + 6);
    });
  }
}

watch(() => props.history, () => {
  nextTick(() => {
    setTimeout(drawChart, 100);
  });
}, { immediate: true, deep: true });
</script>

<template>
  <div ref="chartContainerRef" class="inline-chart-container">
    <Transition name="chart-expand">
      <div v-if="hasData" class="chart-wrapper">
        <div class="chart-header-mini">
          <span class="param-name">{{ history?.paramName }}</span>
          <span class="param-unit">{{ history?.unit }}</span>
          <span class="current-value-mini">
            当前: {{ history?.data[history.data.length - 1]?.value.toFixed(2) }}{{ history?.unit }}
          </span>
        </div>
        <canvas ref="canvasRef" class="chart-canvas"></canvas>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.inline-chart-container {
  margin-top: 10px;
}

.chart-wrapper {
  background: rgba(15, 29, 50, 0.6);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 8px;
  padding: 12px;
  margin-top: 4px;
}

.chart-header-mini {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.param-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.param-unit {
  font-size: 10px;
  color: #64748b;
  background: rgba(30, 58, 95, 0.4);
  padding: 1px 6px;
  border-radius: 3px;
}

.current-value-mini {
  font-size: 11px;
  color: #00d4ff;
  font-family: 'Roboto Mono', monospace;
  margin-left: auto;
}

.chart-canvas {
  width: 100%;
  height: 160px;
  border-radius: 4px;
}

/* 展开动画 */
.chart-expand-enter-active,
.chart-expand-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}

.chart-expand-enter-from,
.chart-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
}

.chart-expand-enter-to,
.chart-expand-leave-from {
  opacity: 1;
  max-height: 220px;
}
</style>
