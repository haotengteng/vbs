<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  type: string;
  status?: 'running' | 'stopped' | 'fault' | 'offline';
  size?: number;
}

const props = withDefaults(defineProps<Props>(), {
  status: 'stopped',
  size: 20,
});

const statusColor = computed(() => {
  switch (props.status) {
    case 'running':
      return '#10b981';
    case 'stopped':
      return '#94a3b8';
    case 'fault':
      return '#ef4444';
    case 'offline':
      return '#475569';
    default:
      return '#94a3b8';
  }
});

const isSpinning = computed(() => ['blower', 'fan', 'dehydrator'].includes(props.type) && props.status === 'running');
const isDripping = computed(() => ['dosing', 'doser'].includes(props.type) && props.status === 'running');
const isPulsing = computed(() => props.type === 'pump' && props.status === 'running');
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 24 24"
    fill="currentColor"
    class="device-icon"
    :class="{ spinning: isSpinning, pulsing: isPulsing, dripping: isDripping }"
    :style="{ color: statusColor }"
  >
    <!-- pump: 泵 -->
    <template v-if="type === 'pump'">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <rect x="2" y="10" width="5" height="4" rx="1" />
      <rect x="10" y="2" width="4" height="5" rx="1" />
      <circle cx="12" cy="12" r="2.5" fill="none" stroke="currentColor" stroke-width="1.5" />
    </template>

    <!-- blower / fan: 风扇/曝气风机 -->
    <template v-else-if="type === 'blower' || type === 'fan'">
      <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" stroke-width="1.5" />
      <circle cx="12" cy="12" r="2" />
      <g class="fan-blades">
        <path d="M12 4c-1.5 0-2.5 1.5-2 3l2 5 2-5c0.5-1.5-0.5-3-2-3z" />
        <path d="M20.5 14c-0.8 1.3-2.6 1.5-3.6 0.5l-3.5-3.5 3.5-1.5c1.5-0.5 3 0.5 3.6 1.5z" />
        <path d="M3.5 14c0.8 1.3 2.6 1.5 3.6 0.5l3.5-3.5-3.5-1.5c-1.5-0.5-3 0.5-3.6 1.5z" />
      </g>
    </template>

    <!-- grating_machine: 格栅机 -->
    <template v-else-if="type === 'grating_machine'">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="7" y="7" width="2" height="10" rx="0.5" fill="none" stroke="currentColor" stroke-width="1" />
      <rect x="11" y="7" width="2" height="10" rx="0.5" fill="none" stroke="currentColor" stroke-width="1" />
      <rect x="15" y="7" width="2" height="10" rx="0.5" fill="none" stroke="currentColor" stroke-width="1" />
    </template>

    <!-- mixer: 搅拌器 -->
    <template v-else-if="type === 'mixer'">
      <rect x="10" y="2" width="4" height="6" rx="1" />
      <rect x="7" y="8" width="10" height="6" rx="1" />
      <rect x="10" y="14" width="4" height="8" rx="1" />
      <circle cx="12" cy="11" r="2" fill="none" stroke="currentColor" stroke-width="1.5" />
    </template>

    <!-- heater: 加热器 -->
    <template v-else-if="type === 'heater'">
      <rect x="8" y="4" width="8" height="16" rx="2" />
      <rect x="5" y="8" width="3" height="8" rx="1" />
      <rect x="16" y="8" width="3" height="8" rx="1" />
      <circle cx="12" cy="10" r="1.5" fill="none" stroke="currentColor" stroke-width="1" />
      <circle cx="12" cy="14" r="1.5" fill="none" stroke="currentColor" stroke-width="1" />
    </template>

    <!-- valve: 电动阀 -->
    <template v-else-if="type === 'valve'">
      <rect x="2" y="10" width="6" height="4" rx="1" />
      <rect x="16" y="10" width="6" height="4" rx="1" />
      <polygon points="8,8 16,8 14,16 10,16" />
      <rect x="10" y="3" width="4" height="5" rx="1" />
      <circle cx="12" cy="4" r="2.5" fill="none" stroke="currentColor" stroke-width="1.2" />
    </template>

    <!-- dosing / doser: 消毒加药器 -->
    <template v-else-if="type === 'dosing' || type === 'doser'">
      <rect x="8" y="2" width="8" height="12" rx="2" />
      <rect x="11" y="14" width="2" height="4" rx="0.5" />
      <path d="M11 20c0 1.5 0.5 2 1 2s1-0.5 1-2" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" />
      <circle cx="10" cy="7" r="1.2" fill="none" stroke="currentColor" stroke-width="0.8" />
      <circle cx="14" cy="10" r="1.2" fill="none" stroke="currentColor" stroke-width="0.8" />
      <circle cx="12" cy="15.5" r="0.9" class="drip-drop" />
    </template>

    <!-- dehydrator: 脱水机 -->
    <template v-else-if="type === 'dehydrator'">
      <!-- 底座 -->
      <rect x="5" y="17" width="14" height="4" rx="1" />
      <!-- 滚筒外框 -->
      <circle cx="12" cy="11" r="7" fill="none" stroke="currentColor" stroke-width="1.5" />
      <!-- 旋转滚筒内部 -->
      <g class="fan-blades">
        <line x1="7" y1="11" x2="17" y2="11" />
        <line x1="12" y1="6" x2="12" y2="16" />
      </g>
      <!-- 中心轴 -->
      <circle cx="12" cy="11" r="1.5" />
      <!-- 顶部进料口 -->
      <rect x="10" y="2" width="4" height="3" rx="0.5" />
    </template>

    <!-- default: 通用齿轮 -->
    <template v-else>
      <circle cx="12" cy="12" r="5" />
      <path
        d="M12 4v2M12 18v2M4 12h2M18 12h2M6.34 6.34l1.42 1.42M16.24 16.24l1.42 1.42M6.34 17.66l1.42-1.42M16.24 7.76l1.42-1.42"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
      />
    </template>
  </svg>
</template>

<style scoped>
.device-icon {
  flex-shrink: 0;
  transition: color 0.3s ease;
  transform-box: fill-box;
  transform-origin: center;
}

.spinning .fan-blades {
  animation: spin 1s linear infinite;
  transform-origin: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.pulsing {
  animation: pump-pulse 0.7s ease-in-out infinite;
}

@keyframes pump-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.15);
  }
}

.drip-drop {
  opacity: 0;
  transform-box: fill-box;
  transform-origin: center;
}

.dripping .drip-drop {
  animation: drip 1.2s ease-in infinite;
}

@keyframes drip {
  0% {
    transform: translateY(0);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  80% {
    transform: translateY(5px);
    opacity: 1;
  }
  100% {
    transform: translateY(5px);
    opacity: 0;
  }
}
</style>
