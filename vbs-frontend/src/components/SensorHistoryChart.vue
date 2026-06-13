<script setup lang="ts">
import { computed, ref, watch, nextTick } from 'vue';
import type { SensorHistory } from '@/types';
import { VueDatePicker } from '@vuepic/vue-datepicker';
import '@vuepic/vue-datepicker/dist/main.css';
import { zhCN } from 'date-fns/locale';

interface Props {
  history: SensorHistory | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  timeRangeChange: [hours: number];
  customTimeRangeChange: [startTime: string, endTime: string];
}>();

const zhLocale = zhCN;

const canvasRef = ref<HTMLCanvasElement | null>(null);
const chartContainerRef = ref<HTMLDivElement | null>(null);

const hasData = computed(() => props.history !== null && props.history.data.length > 0);

const timeRange = ref(30);
const isCustom = ref(false);
const showCustomPicker = ref(false);
const customStart = ref<Date>(new Date());
const customEnd = ref<Date>(new Date());

const timeOptions = [
  { label: '30分钟', value: 30 },
  { label: '1小时', value: 60 },
  { label: '3小时', value: 180 },
  { label: '1天', value: 1440 },
  { label: '自定义', value: -1 },
];

function onTimeChange(minutes: number) {
  if (minutes === -1) {
    isCustom.value = true;
    showCustomPicker.value = true;
    return;
  }
  isCustom.value = false;
  showCustomPicker.value = false;
  timeRange.value = minutes;
  emit('timeRangeChange', minutes);
}

function formatLocalDateTime(date: Date) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function applyCustomRange() {
  if (!customStart.value || !customEnd.value) return;
  const start = customStart.value.getTime();
  const end = customEnd.value.getTime();
  if (start >= end) return;
  timeRange.value = (end - start) / (1000 * 60);
  emit('customTimeRangeChange', formatLocalDateTime(customStart.value), formatLocalDateTime(customEnd.value));
}

// 默认自定义时间为最近1小时
const now = new Date();
customEnd.value = new Date(now);
customStart.value = new Date(now.getTime() - 60 * 60 * 1000);

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

  // 按选择的时间范围计算 X 轴刻度
  const endTime = isCustom.value && customEnd.value
    ? customEnd.value.getTime()
    : Date.now();
  const startTime = isCustom.value && customStart.value
    ? customStart.value.getTime()
    : endTime - timeRange.value * 60 * 1000;
  const spanMs = endTime - startTime;
  const showDate = spanMs > 24 * 60 * 60 * 1000;

  // 将数据点映射到时间轴上的辅助函数
  function getX(timestamp: string) {
    const t = new Date(timestamp).getTime();
    const ratio = (t - startTime) / spanMs;
    return padding.left + Math.max(0, Math.min(1, ratio)) * chartWidth;
  }

  // 绘制折线
  if (data.length > 1) {
    ctx.strokeStyle = '#00d4ff';
    ctx.lineWidth = 2;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();

    data.forEach((point, index) => {
      const x = getX(point.timestamp);
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
    const firstX = getX(data[0].timestamp);
    const firstY = padding.top + chartHeight - ((data[0].value - yMin) / yRange) * chartHeight;
    ctx.moveTo(firstX, firstY);

    data.forEach((point) => {
      const x = getX(point.timestamp);
      const y = padding.top + chartHeight - ((point.value - yMin) / yRange) * chartHeight;
      ctx.lineTo(x, y);
    });

    ctx.lineTo(getX(data[data.length - 1].timestamp), padding.top + chartHeight);
    ctx.lineTo(firstX, padding.top + chartHeight);
    ctx.closePath();

    const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
    gradient.addColorStop(0, 'rgba(0, 212, 255, 0.25)');
    gradient.addColorStop(1, 'rgba(0, 212, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fill();

    // 绘制数据点
    data.forEach((point) => {
      const x = getX(point.timestamp);
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

  // X轴时间标签 - 固定6个均匀分布的刻度，基于选择的时间范围
  if (data.length > 0) {
    for (let i = 0; i < 6; i++) {
      const ratio = i / 5;
      const x = padding.left + ratio * chartWidth;
      const labelTime = new Date(startTime + ratio * spanMs);
      const timeStr = showDate
        ? `${labelTime.getMonth() + 1}/${labelTime.getDate()} ${labelTime.getHours().toString().padStart(2, '0')}:${labelTime.getMinutes().toString().padStart(2, '0')}`
        : `${labelTime.getHours().toString().padStart(2, '0')}:${labelTime.getMinutes().toString().padStart(2, '0')}`;

      ctx.fillStyle = '#64748b';
      ctx.font = '9px Roboto Mono, monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(timeStr, x, padding.top + chartHeight + 6);
    }
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
          <span class="sensor-name">{{ history?.sensorName }}</span>
          <span class="sensor-unit">{{ history?.unit }}</span>
          <span v-if="history && (history.min || history.max)" class="range-info">
            量程: {{ history.min.toFixed(2) }} ~ {{ history.max.toFixed(2) }}{{ history.unit }}
          </span>
          <span class="current-value-mini">
            当前: {{ history?.data[history.data.length - 1]?.value.toFixed(2) }}{{ history?.unit }}
          </span>
        </div>
        <div class="time-selector">
          <button
            v-for="opt in timeOptions"
            :key="opt.value"
            class="time-btn"
            :class="{ active: isCustom ? opt.value === -1 : timeRange === opt.value }"
            @click="onTimeChange(opt.value)"
          >
            {{ opt.label }}
          </button>
        </div>
        <Transition name="picker-slide">
          <div v-if="showCustomPicker" class="custom-time-picker">
            <div class="picker-row">
              <label class="picker-label">开始</label>
              <VueDatePicker
                v-model="customStart"
                :dark="true"
                :locale="zhLocale"
                :enable-time-picker="true"
                :format="'yyyy-MM-dd HH:mm'"
                :minutes-increment="1"
                :auto-apply="true"
                :clearable="false"
                class="picker-datepicker"
              />
            </div>
            <div class="picker-row">
              <label class="picker-label">结束</label>
              <VueDatePicker
                v-model="customEnd"
                :dark="true"
                :locale="zhLocale"
                :enable-time-picker="true"
                :format="'yyyy-MM-dd HH:mm'"
                :minutes-increment="1"
                :auto-apply="true"
                :clearable="false"
                class="picker-datepicker"
              />
            </div>
            <button class="picker-confirm" @click="applyCustomRange">确认</button>
          </div>
        </Transition>
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

.sensor-name {
  font-size: 12px;
  font-weight: 600;
  color: #e2e8f0;
}

.sensor-unit {
  font-size: 10px;
  color: #64748b;
  background: rgba(30, 58, 95, 0.4);
  padding: 1px 6px;
  border-radius: 3px;
}

.range-info {
  font-size: 11px;
  color: #94a3b8;
  font-family: 'Roboto Mono', monospace;
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

.time-selector {
  display: flex;
  gap: 6px;
  margin-bottom: 10px;
  flex-wrap: wrap;
}

.time-btn {
  background: rgba(30, 58, 95, 0.4);
  border: 1px solid rgba(30, 58, 95, 0.6);
  color: #94a3b8;
  padding: 3px 10px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.time-btn:hover {
  background: rgba(30, 58, 95, 0.6);
  color: #e2e8f0;
}

.time-btn.active {
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.4);
  color: #00d4ff;
}

.custom-time-picker {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
  padding: 8px 10px;
  background: rgba(15, 29, 50, 0.8);
  border: 1px solid rgba(30, 58, 95, 0.6);
  border-radius: 6px;
  flex-wrap: wrap;
}

.picker-row {
  display: flex;
  align-items: center;
  gap: 6px;
}

.picker-label {
  font-size: 11px;
  color: #94a3b8;
  white-space: nowrap;
}

.picker-datepicker {
  width: 192px;
  font-size: 10px;
}

.picker-datepicker :deep(.dp__input) {
  background: rgba(30, 58, 95, 0.4);
  border: 1px solid rgba(30, 58, 95, 0.6);
  border-radius: 4px;
  color: #e2e8f0;
  padding: 3px 8px;
  padding-left: 28px;
  font-size: 10px;
  font-family: 'Roboto Mono', monospace;
  height: auto;
  min-height: 24px;
}

.picker-datepicker :deep(.dp__input:hover) {
  border-color: rgba(0, 212, 255, 0.4);
}

.picker-datepicker :deep(.dp__input_icon) {
  color: #94a3b8;
  left: 6px;
  width: 14px;
  height: 14px;
}

.picker-datepicker :deep(.dp__clear_icon) {
  display: none;
}

.picker-datepicker :deep(.dp__menu) {
  font-size: 11px;
  border-radius: 6px;
  border: 1px solid rgba(30, 58, 95, 0.8);
}

.picker-datepicker :deep(.dp__calendar_header) {
  font-size: 10px;
}

.picker-datepicker :deep(.dp__cell_inner) {
  font-size: 10px;
  width: 28px;
  height: 28px;
}

.picker-datepicker :deep(.dp__month_year) {
  font-size: 11px;
}

.picker-datepicker :deep(.dp__button) {
  font-size: 10px;
}

.picker-confirm {
  background: rgba(0, 212, 255, 0.15);
  border: 1px solid rgba(0, 212, 255, 0.4);
  color: #00d4ff;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  transition: all 0.2s;
}

.picker-confirm:hover {
  background: rgba(0, 212, 255, 0.25);
}

/* 时间选择器展开动画 */
.picker-slide-enter-active,
.picker-slide-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.picker-slide-enter-from,
.picker-slide-leave-to {
  opacity: 0;
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}

.picker-slide-enter-to,
.picker-slide-leave-from {
  opacity: 1;
  max-height: 60px;
}

.chart-expand-enter-to,
.chart-expand-leave-from {
  opacity: 1;
  max-height: 260px;
}
</style>
