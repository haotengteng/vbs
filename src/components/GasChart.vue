<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Wind } from 'lucide-vue-next';
import * as echarts from 'echarts';

const chartRef = ref<HTMLDivElement | null>(null);
let chartInstance: echarts.ECharts | null = null;

const data = [
  { x: 0, y: 15 },
  { x: 3, y: 25 },
  { x: 6, y: 45 },
  { x: 9, y: 70 },
  { x: 12, y: 90 },
  { x: 15, y: 65 },
  { x: 18, y: 40 },
  { x: 21, y: 20 },
  { x: 24, y: 10 },
];

function initChart() {
  if (!chartRef.value) return;

  chartInstance = echarts.init(chartRef.value);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(10, 18, 38, 0.9)',
      borderColor: 'rgba(16, 185, 129, 0.3)',
      textStyle: { color: '#e2e8f0', fontSize: 12 },
      axisPointer: {
        type: 'cross',
        crossStyle: { color: 'rgba(16, 185, 129, 0.5)' },
        lineStyle: { color: 'rgba(16, 185, 129, 0.5)' },
      },
      formatter: (params: any) => {
        const item = params[0];
        return `${item.name}h<br/>浓度: ${item.value} mg/m³`;
      },
    },
    grid: {
      top: 20,
      right: 10,
      bottom: 30,
      left: 40,
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => `${d.x}`),
      axisLine: { lineStyle: { color: 'rgba(30, 58, 95, 0.4)' } },
      axisTick: { show: false },
      axisLabel: {
        color: '#4a5568',
        fontSize: 9,
        interval: (idx: number) => [0, 6, 12, 18, 24].includes(data[idx].x),
      },
      splitLine: { show: false },
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      interval: 25,
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: {
        color: '#4a5568',
        fontSize: 9,
      },
      splitLine: {
        lineStyle: { color: 'rgba(30, 58, 95, 0.25)', type: 'solid' },
      },
    },
    series: [
      {
        type: 'line',
        data: data.map((d) => d.y),
        smooth: true,
        symbol: 'circle',
        symbolSize: 4,
        lineStyle: {
          color: 'rgba(16, 185, 129, 0.6)',
          width: 1.5,
        },
        itemStyle: {
          color: 'rgba(16, 185, 129, 0.6)',
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(16, 185, 129, 0.15)' },
            { offset: 0.5, color: 'rgba(16, 185, 129, 0.05)' },
            { offset: 1, color: 'rgba(16, 185, 129, 0.01)' },
          ]),
        },
        emphasis: {
          focus: 'series',
          itemStyle: {
            shadowBlur: 10,
            shadowColor: 'rgba(16, 185, 129, 0.5)',
          },
        },
      },
    ],
  };

  chartInstance.setOption(option);
}

onMounted(() => {
  initChart();
  window.addEventListener('resize', () => chartInstance?.resize());
});

onUnmounted(() => {
  window.removeEventListener('resize', () => chartInstance?.resize());
  chartInstance?.dispose();
});
</script>

<template>
  <div class="chart-panel">
    <div class="panel-header">
      <Wind :size="16" class="header-icon" />
      <span class="header-title">废气浓度</span>
    </div>
    <div class="panel-body">
      <div class="y-axis-label">mg/m³</div>
      <div ref="chartRef" class="chart-container"></div>
    </div>
  </div>
</template>

<style scoped>
.chart-panel {
  background: linear-gradient(180deg, rgba(16, 28, 55, 0.75) 0%, rgba(10, 18, 38, 0.85) 100%);
  border: 1px solid rgba(100, 130, 180, 0.2);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(0, 102, 204, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(30, 58, 95, 0.4);
  flex-shrink: 0;
}

.header-icon {
  color: #00d4ff;
}

.header-title {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

.panel-body {
  flex: 1;
  position: relative;
  padding: 8px;
  min-height: 0;
}

.y-axis-label {
  position: absolute;
  top: 8px;
  left: 8px;
  font-size: 10px;
  color: #64748b;
  z-index: 1;
  pointer-events: none;
}

.chart-container {
  width: 100%;
  height: 100%;
}
</style>
