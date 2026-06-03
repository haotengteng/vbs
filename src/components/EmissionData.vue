<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { Server } from 'lucide-vue-next';
import * as echarts from 'echarts';

interface DeviceCategory {
  name: string;
  value: number;
  color: string;
}

const runningDevices = ref(27);
const faultDevices = ref(2);

const deviceCategories = ref<DeviceCategory[]>([
  { name: '泵站', value: 9, color: '#00d4ff' },
  { name: '搅拌器', value: 12, color: '#00ccff' },
  { name: '曝气池', value: 4, color: '#0099ff' },
  { name: '沉淀池', value: 5, color: '#0066cc' },
]);

const totalDevices = computed(() =>
  deviceCategories.value.reduce((sum, item) => sum + item.value, 0)
);

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

function initChart() {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      show: false,
    },
    series: [
      // 外圈装饰环
      {
        type: 'pie',
        radius: ['82%', '86%'],
        center: ['50%', '50%'],
        silent: true,
        label: { show: false },
        data: [
          {
            value: 1,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 1, y2: 0,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 255, 0.1)' },
                  { offset: 0.5, color: 'rgba(0, 212, 255, 0.4)' },
                  { offset: 1, color: 'rgba(0, 212, 255, 0.1)' },
                ],
              },
            },
          },
        ],
        animationDuration: 2000,
        animationEasing: 'cubicInOut',
      },
      // 刻度环
      {
        type: 'pie',
        radius: ['78%', '80%'],
        center: ['50%', '50%'],
        silent: true,
        label: { show: false },
        data: Array.from({ length: 60 }, (_, i) => ({
          value: i % 5 === 0 ? 1 : 0.3,
          itemStyle: {
            color: i % 5 === 0 ? 'rgba(0, 212, 255, 0.6)' : 'rgba(0, 212, 255, 0.15)',
          },
        })),
        startAngle: 90,
      },
      // 主数据环
      {
        type: 'pie',
        radius: ['62%', '76%'],
        center: ['50%', '50%'],
        avoidLabelOverlap: false,
        label: { show: false },
        emphasis: {
          scale: false,
          itemStyle: {
            shadowBlur: 20,
            shadowColor: 'rgba(0, 212, 255, 0.5)',
          },
        },
        data: deviceCategories.value.map((item) => ({
          name: item.name,
          value: item.value,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
              { offset: 0, color: item.color },
              { offset: 1, color: item.color + '88' },
            ]),
            borderRadius: 4,
            shadowBlur: 10,
            shadowColor: item.color + '44',
          },
        })),
        animationType: 'scale',
        animationEasing: 'elasticOut',
        animationDuration: 1500,
        animationDelay: (idx: number) => idx * 100,
      },
      // 内圈装饰
      {
        type: 'pie',
        radius: ['56%', '58%'],
        center: ['50%', '50%'],
        silent: true,
        label: { show: false },
        data: [
          {
            value: 1,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 212, 255, 0.3)' },
                  { offset: 1, color: 'rgba(0, 102, 204, 0.1)' },
                ],
              },
            },
          },
        ],
      },
      // 中心圆
      {
        type: 'pie',
        radius: ['0%', '52%'],
        center: ['50%', '50%'],
        silent: true,
        label: { show: false },
        data: [
          {
            value: 1,
            itemStyle: {
              color: {
                type: 'radial',
                x: 0.5, y: 0.5, r: 0.5,
                colorStops: [
                  { offset: 0, color: 'rgba(0, 50, 100, 0.8)' },
                  { offset: 0.7, color: 'rgba(0, 30, 60, 0.6)' },
                  { offset: 1, color: 'rgba(0, 20, 40, 0.4)' },
                ],
              },
            },
          },
        ],
      },
    ],
  };

  chartInstance.setOption(option);
}

let updateTimer: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => chartInstance?.resize());

  // 模拟数据动态更新
  updateTimer = setInterval(() => {
    if (chartInstance) {
      const newData = deviceCategories.value.map((item) => ({
        ...item,
        value: Math.max(1, item.value + Math.floor(Math.random() * 3 - 1)),
      }));
      deviceCategories.value = newData;

      chartInstance.setOption({
        series: [
          {},
          {},
          {
            data: newData.map((item) => ({
              name: item.name,
              value: item.value,
              itemStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 1, 1, [
                  { offset: 0, color: item.color },
                  { offset: 1, color: item.color + '88' },
                ]),
                borderRadius: 4,
                shadowBlur: 10,
                shadowColor: item.color + '44',
              },
            })),
          },
          {},
          {},
        ],
      });
    }
  }, 5000);
});

onUnmounted(() => {
  if (updateTimer) clearInterval(updateTimer);
  window.removeEventListener('resize', () => chartInstance?.resize());
  chartInstance?.dispose();
});
</script>

<template>
  <div class="emission-panel">
    <!-- 设备状态 -->
    <div class="section-header">
      <Server :size="14" class="header-icon" />
      <span class="header-title">设备状态</span>
    </div>

    <div class="device-status">
      <div class="status-card">
        <div class="flip-display">
          <span
            v-for="(digit, idx) in String(runningDevices).padStart(3, '0').split('')"
            :key="`run-${idx}`"
            class="flip-digit"
          >
            {{ digit }}
          </span>
        </div>
        <div class="status-label">
          <span class="label-dot running"></span>
          运行设备
        </div>
      </div>

      <div class="status-card">
        <div class="flip-display">
          <span
            v-for="(digit, idx) in String(faultDevices).padStart(3, '0').split('')"
            :key="`fault-${idx}`"
            class="flip-digit fault"
          >
            {{ digit }}
          </span>
        </div>
        <div class="status-label">
          <span class="label-dot fault"></span>
          故障设备
        </div>
      </div>
    </div>

    <!-- 设备统计 -->
    <div class="section-header">
      <span class="header-title">设备统计</span>
    </div>

    <div class="device-stats">
      <!-- 左侧分类 -->
      <div class="stats-left">
        <div
          v-for="item in deviceCategories.slice(0, 2)"
          :key="item.name"
          class="stat-item left"
          :style="{ '--item-color': item.color }"
        >
          <div class="stat-value">
            <span class="num">{{ item.value }}</span>
            <span class="unit">台</span>
          </div>
          <div class="stat-name">
            <span class="name-dot"></span>
            {{ item.name }}
          </div>
        </div>
      </div>

      <!-- 中间环图 -->
      <div class="chart-wrapper">
        <div ref="chartRef" class="chart-container"></div>
        <div class="chart-center">
          <div class="center-value">{{ totalDevices }}</div>
          <div class="center-label">设备总数</div>
        </div>
      </div>

      <!-- 右侧分类 -->
      <div class="stats-right">
        <div
          v-for="item in deviceCategories.slice(2)"
          :key="item.name"
          class="stat-item right"
          :style="{ '--item-color': item.color }"
        >
          <div class="stat-value">
            <span class="unit">台</span>
            <span class="num">{{ item.value }}</span>
          </div>
          <div class="stat-name">
            {{ item.name }}
            <span class="name-dot"></span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emission-panel {
  background: linear-gradient(180deg, rgba(16, 28, 55, 0.75) 0%, rgba(10, 18, 38, 0.85) 100%);
  border: 1px solid rgba(100, 130, 180, 0.2);
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 0;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(0, 102, 204, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(30, 58, 95, 0.4);
}

.header-icon {
  color: #00d4ff;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

/* 设备状态 */
.device-status {
  display: flex;
  gap: 12px;
  padding: 14px;
}

.status-card {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.flip-display {
  display: flex;
  gap: 4px;
}

.flip-digit {
  width: 28px;
  height: 36px;
  background: linear-gradient(180deg, rgba(0, 40, 80, 0.8) 0%, rgba(0, 20, 50, 0.9) 100%);
  border: 1px solid rgba(0, 212, 255, 0.3);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: #00d4ff;
  text-shadow: 0 0 10px rgba(0, 212, 255, 0.5);
  position: relative;
  overflow: hidden;
}

.flip-digit::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(0, 0, 0, 0.3);
}

.flip-digit.fault {
  color: #ff6b6b;
  border-color: rgba(255, 107, 107, 0.3);
  text-shadow: 0 0 10px rgba(255, 107, 107, 0.5);
}

.status-label {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 6px;
}

.label-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.6);
}

.label-dot.fault {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
  animation: blink 1s ease-in-out infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* 设备统计 */
.device-stats {
  display: flex;
  align-items: center;
  padding: 16px 10px;
  gap: 8px;
}

.stats-left,
.stats-right {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-item.left {
  align-items: flex-start;
}

.stat-item.right {
  align-items: flex-end;
}

.stat-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.stat-value .num {
  font-size: 22px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: var(--item-color, #00d4ff);
  text-shadow: 0 0 12px color-mix(in srgb, var(--item-color, #00d4ff) 50%, transparent);
}

.stat-value .unit {
  font-size: 11px;
  color: #64748b;
}

.stat-name {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 4px;
}

.name-dot {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--item-color, #00d4ff);
  box-shadow: 0 0 4px var(--item-color, #00d4ff);
}

/* 环图 */
.chart-wrapper {
  width: 160px;
  height: 160px;
  position: relative;
  flex-shrink: 0;
}

.chart-container {
  width: 100%;
  height: 100%;
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  pointer-events: none;
}

.center-value {
  font-size: 28px;
  font-weight: 700;
  font-family: var(--font-mono);
  color: #e2e8f0;
  text-shadow: 0 0 15px rgba(0, 212, 255, 0.4);
}

.center-label {
  font-size: 11px;
  color: #64748b;
  margin-top: 2px;
}
</style>
