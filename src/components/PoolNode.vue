<script setup lang="ts">
import { computed } from 'vue';
import type { PoolData } from '@/types';
import WaterLevel from './WaterLevel.vue';

interface Props {
  pool: PoolData;
  index: number;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  click: [poolId: string];
}>();

const statusColor = computed(() => {
  switch (props.pool.status) {
    case 'warning':
      return '#f59e0b';
    case 'danger':
      return '#ef4444';
    default:
      return '#00d4ff';
  }
});

const statusClass = computed(() => {
  if (props.pool.status === 'danger') return 'alarm-border';
  if (props.pool.status === 'warning') return 'glow-border';
  return '';
});

const levelPercent = computed(() => {
  return ((props.pool.currentLevel / props.pool.maxLevel) * 100).toFixed(1);
});

function handleClick() {
  emit('click', props.pool.id);
}
</script>

<template>
  <div
    class="pool-node"
    :class="[statusClass, 'fade-in-up']"
    :style="{
      left: `${pool.position.x}px`,
      top: `${pool.position.y}px`,
      animationDelay: `${index * 0.15}s`,
      borderColor: statusColor,
    }"
    @click="handleClick"
  >
    <div class="pool-header">
      <span class="pool-code">{{ pool.code }}</span>
      <span class="pool-name">{{ pool.name }}</span>
      <span class="status-dot" :style="{ backgroundColor: statusColor }"></span>
    </div>

    <div class="pool-body">
      <WaterLevel
        :current-level="pool.currentLevel"
        :max-level="pool.maxLevel"
        :warning-level="pool.warningLevel"
        :width="120"
        :height="85"
      />

      <div class="pool-data">
        <div class="data-row">
          <span class="data-label">水位</span>
          <span class="data-value font-mono" :style="{ color: statusColor }">
            {{ pool.currentLevel.toFixed(2) }}m
          </span>
        </div>
        <div class="data-row">
          <span class="data-label">容量</span>
          <span class="data-value font-mono">{{ pool.capacity }}m³</span>
        </div>
        <div class="data-row">
          <span class="data-label">警戒</span>
          <span class="data-value font-mono" style="color: #f59e0b">{{ pool.warningLevel }}m</span>
        </div>
        <div class="data-row">
          <span class="data-label">流量</span>
          <span class="data-value font-mono">{{ pool.flowRate.toFixed(0) }}m³/h</span>
        </div>
      </div>
    </div>

    <div class="pool-footer">
      <span class="level-percent">{{ levelPercent }}%</span>
      <span class="device-count">{{ pool.devices.filter(d => d.status === 'running').length }}/{{ pool.devices.length }} 运行</span>
    </div>
  </div>
</template>

<style scoped>
.pool-node {
  position: absolute;
  width: 180px;
  background: linear-gradient(135deg, #132238 0%, #0f1d32 100%);
  border: 2px solid #1e3a5f;
  border-radius: 12px;
  padding: 10px;
  cursor: pointer;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  opacity: 0;
}

.pool-node:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 32px rgba(0, 212, 255, 0.2);
}

.pool-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 6px;
  border-bottom: 1px solid rgba(30, 58, 95, 0.5);
}

.pool-code {
  font-family: 'Roboto Mono', monospace;
  font-size: 10px;
  color: #64748b;
  background: rgba(30, 58, 95, 0.5);
  padding: 2px 6px;
  border-radius: 4px;
}

.pool-name {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  flex: 1;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  box-shadow: 0 0 6px currentColor;
}

.pool-body {
  display: flex;
  gap: 8px;
  align-items: center;
}

.pool-data {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.data-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.data-label {
  font-size: 10px;
  color: #64748b;
}

.data-value {
  font-size: 11px;
  color: #e2e8f0;
  font-weight: 500;
}

.pool-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
  padding-top: 6px;
  border-top: 1px solid rgba(30, 58, 95, 0.5);
}

.level-percent {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  font-weight: bold;
  color: #00d4ff;
}

.device-count {
  font-size: 10px;
  color: #64748b;
}
</style>
