<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Activity, AlertTriangle, AlertCircle, Clock } from '@lucide/vue';
import { useProcessStore } from '@/stores/processStore';

const store = useProcessStore();
const currentTime = ref(new Date());
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  timer = setInterval(() => {
    currentTime.value = new Date();
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

function formatTime(date: Date): string {
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}
</script>

<template>
  <header class="header-bar">
    <div class="header-left">
      <div class="logo">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="logo-icon">
              <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
            </svg>
        <h1 class="title font-display">工业污水监控大屏系统</h1>
      </div>
    </div>

    <div class="header-center">
      <div class="system-status">
        <Activity :size="16" class="status-icon" :class="{ active: store.isRunning }" />
        <span class="status-text">{{ store.isRunning ? '系统运行中' : '系统已暂停' }}</span>
      </div>
    </div>

    <div class="header-right">
      <div class="alarm-summary">
        <div v-if="store.warningCount > 0" class="alarm-badge warning">
          <AlertTriangle :size="14" />
          <span>{{ store.warningCount }}</span>
        </div>
        <div v-if="store.dangerCount > 0" class="alarm-badge danger">
          <AlertCircle :size="14" />
          <span>{{ store.dangerCount }}</span>
        </div>
      </div>

      <div class="time-display">
        <Clock :size="16" />
        <span class="font-mono">{{ formatTime(currentTime) }}</span>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 24px;
  background: linear-gradient(90deg, #0a1628 0%, #0f1d32 50%, #0a1628 100%);
  border-bottom: 1px solid #1e3a5f;
  position: relative;
  z-index: 10;
}

.header-bar::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%);
}

.header-left {
  flex: 1;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo-icon {
  width: 28px;
  height: 28px;
  color: #00d4ff;
}

.title {
  font-size: 20px;
  font-weight: 700;
  color: #e2e8f0;
  letter-spacing: 2px;
  margin: 0;
  background: linear-gradient(90deg, #00d4ff, #00ccff);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.header-center {
  flex: 1;
  display: flex;
  justify-content: center;
}

.system-status {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  background: rgba(30, 58, 95, 0.3);
  border-radius: 20px;
  border: 1px solid rgba(30, 58, 95, 0.5);
}

.status-icon {
  color: #64748b;
  transition: color 0.3s;
}

.status-icon.active {
  color: #10b981;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.status-text {
  font-size: 13px;
  color: #94a3b8;
}

.header-right {
  flex: 1;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 20px;
}

.alarm-summary {
  display: flex;
  gap: 8px;
}

.alarm-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.alarm-badge.warning {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.alarm-badge.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
  animation: alarm-blink 1s ease-in-out infinite;
}

.time-display {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  font-size: 13px;
}

.time-display svg {
  color: #00d4ff;
}
</style>
