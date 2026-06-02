<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Wind } from 'lucide-vue-next';

const canvasRef = ref<HTMLCanvasElement | null>(null);

function drawChart() {
  const canvas = canvasRef.value;
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = rect.width * dpr;
  canvas.height = rect.height * dpr;
  ctx.scale(dpr, dpr);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 10, bottom: 30, left: 40 };
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Clear
  ctx.clearRect(0, 0, width, height);

  // Data points (simulated gas concentration curve) - matching reference shape
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

  // Grid lines - lighter and more subtle
  ctx.strokeStyle = 'rgba(30, 58, 95, 0.25)';
  ctx.lineWidth = 1;

  // Horizontal grid lines
  for (let i = 0; i <= 4; i++) {
    const y = padding.top + (chartHeight / 4) * i;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();

    // Y axis labels - smaller and muted
    ctx.fillStyle = '#4a5568';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`${100 - i * 25}`, padding.left - 8, y + 3);
  }

  // X axis labels
  const xLabels = [0, 6, 12, 18, 24];
  xLabels.forEach((label) => {
    const x = padding.left + (label / 24) * chartWidth;
    ctx.fillStyle = '#4a5568';
    ctx.font = '9px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${label}`, x, height - 12);
  });

  // Draw smooth area with gradient
  ctx.beginPath();
  ctx.moveTo(padding.left, padding.top + chartHeight);
  
  // Use quadratic curves for smoother line
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const x = padding.left + (point.x / 24) * chartWidth;
    const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
    
    if (i === 0) {
      ctx.lineTo(x, y);
    } else {
      const prevPoint = data[i - 1];
      const prevX = padding.left + (prevPoint.x / 24) * chartWidth;
      const prevY = padding.top + chartHeight - (prevPoint.y / 100) * chartHeight;
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(cpX, prevY, cpX, (prevY + y) / 2);
      ctx.quadraticCurveTo(cpX, y, x, y);
    }
  }
  
  ctx.lineTo(padding.left + chartWidth, padding.top + chartHeight);
  ctx.closePath();

  const gradient = ctx.createLinearGradient(0, padding.top, 0, padding.top + chartHeight);
  gradient.addColorStop(0, 'rgba(16, 185, 129, 0.15)');
  gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.05)');
  gradient.addColorStop(1, 'rgba(16, 185, 129, 0.01)');
  ctx.fillStyle = gradient;
  ctx.fill();

  // Draw smooth line
  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const point = data[i];
    const x = padding.left + (point.x / 24) * chartWidth;
    const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
    
    if (i === 0) {
      ctx.moveTo(x, y);
    } else {
      const prevPoint = data[i - 1];
      const prevX = padding.left + (prevPoint.x / 24) * chartWidth;
      const prevY = padding.top + chartHeight - (prevPoint.y / 100) * chartHeight;
      const cpX = (prevX + x) / 2;
      ctx.quadraticCurveTo(cpX, prevY, cpX, (prevY + y) / 2);
      ctx.quadraticCurveTo(cpX, y, x, y);
    }
  }
  ctx.strokeStyle = '#10b981';
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Draw subtle points
  data.forEach((point) => {
    const x = padding.left + (point.x / 24) * chartWidth;
    const y = padding.top + chartHeight - (point.y / 100) * chartHeight;
    ctx.beginPath();
    ctx.arc(x, y, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();
  });
}

onMounted(() => {
  drawChart();
  window.addEventListener('resize', drawChart);
});
</script>

<template>
  <div class="chart-panel">
    <div class="panel-header">
      <Wind :size="16" class="header-icon" />
      <span class="header-title">废气浓度</span>
      <span class="header-sub">GAS CONCENTRATION</span>
    </div>
    <div class="panel-body">
      <div class="y-axis-label">mg/m³</div>
      <canvas ref="canvasRef" class="chart-canvas"></canvas>
    </div>
  </div>
</template>

<style scoped>
.chart-panel {
  background: linear-gradient(180deg, rgba(16, 30, 60, 0.9) 0%, rgba(10, 22, 40, 0.95) 100%);
  border: 1px solid rgba(30, 58, 95, 0.6);
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

.header-sub {
  font-size: 10px;
  color: #64748b;
  letter-spacing: 1px;
  margin-left: auto;
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
}

.chart-canvas {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
