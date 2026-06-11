<script setup lang="ts">
import { computed, ref } from 'vue';
import type { DeviceStatusHistory, DeviceStatusRecord } from '@/types';

interface Props {
  history: DeviceStatusHistory | null;
  loading?: boolean;
  error?: string | null;
}

const props = defineProps<Props>();

const hoverRecord = ref<DeviceStatusRecord | null>(null);
const tooltipPos = ref({ x: 0, y: 0 });
const tooltipVisible = ref(false);

const statusColors: Record<string, string> = {
  running: '#10b981',
  stopped: '#64748b',
  fault: '#ef4444',
  offline: '#94a3b8',
};

const statusNames: Record<string, string> = {
  running: '运行中',
  stopped: '已停止',
  fault: '故障',
  offline: '离线',
};

const totalDuration = computed(() => {
  if (!props.history || props.history.records.length === 0) return 0;
  const first = props.history.records[0].startTime;
  const last = props.history.records[props.history.records.length - 1].endTime;
  return last.getTime() - first.getTime();
});

const startTime = computed(() => {
  if (!props.history || props.history.records.length === 0) return null;
  return props.history.records[0].startTime;
});

const endTime = computed(() => {
  if (!props.history || props.history.records.length === 0) return null;
  return props.history.records[props.history.records.length - 1].endTime;
});

function getSegmentStyle(record: DeviceStatusRecord) {
  const duration = record.endTime.getTime() - record.startTime.getTime();
  const widthPercent = totalDuration.value > 0 ? (duration / totalDuration.value) * 100 : 0;
  return {
    width: `${Math.max(widthPercent, 0.5)}%`,
    backgroundColor: statusColors[record.status] || '#64748b',
  };
}

function formatTime(date: Date): string {
  const d = new Date(date);
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  return `${MM}-${dd} ${hh}:${mm}`;
}

function formatDuration(ms: number): string {
  const totalMinutes = Math.floor(ms / 60000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours > 0) {
    return `${hours}小时${minutes}分钟`;
  }
  return `${minutes}分钟`;
}

function onMouseEnter(record: DeviceStatusRecord, event: MouseEvent) {
  hoverRecord.value = record;
  tooltipVisible.value = true;
  updateTooltipPos(event);
}

function onMouseMove(event: MouseEvent) {
  updateTooltipPos(event);
}

function onMouseLeave() {
  hoverRecord.value = null;
  tooltipVisible.value = false;
}

function updateTooltipPos(event: MouseEvent) {
  tooltipPos.value = { x: event.clientX, y: event.clientY };
}
</script>

<template>
  <div class="timeline-container">
    <div v-if="loading" class="timeline-state">
      <div class="spinner"></div>
      <span>加载中...</span>
    </div>

    <div v-else-if="error" class="timeline-state error">
      <span>{{ error }}</span>
    </div>

    <div v-else-if="!history || history.records.length === 0" class="timeline-state empty">
      <span>暂无历史状态数据</span>
    </div>

    <template v-else>
      <div class="timeline-header">
        <span class="time-label">{{ formatTime(startTime!) }}</span>
        <span class="time-label">{{ formatTime(endTime!) }}</span>
      </div>

      <div class="timeline-track">
        <div
          v-for="(record, index) in history.records"
          :key="index"
          class="timeline-segment"
          :style="getSegmentStyle(record)"
          @mouseenter="onMouseEnter(record, $event as MouseEvent)"
          @mousemove="onMouseMove($event as MouseEvent)"
          @mouseleave="onMouseLeave"
        >
          <div v-if="index > 0" class="transition-marker"></div>
        </div>
      </div>

      <div class="timeline-legend">
        <div v-for="(name, key) in statusNames" :key="key" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: statusColors[key] }"></span>
          <span class="legend-name">{{ name }}</span>
        </div>
      </div>
    </template>

    <!-- Tooltip -->
    <Teleport to="body">
      <Transition name="tooltip">
        <div
          v-if="tooltipVisible && hoverRecord"
          class="timeline-tooltip"
          :style="{ left: `${tooltipPos.x + 12}px`, top: `${tooltipPos.y + 12}px` }"
        >
          <div class="tooltip-row">
            <span class="tooltip-label">状态:</span>
            <span class="tooltip-value" :style="{ color: statusColors[hoverRecord.status] }">
              {{ statusNames[hoverRecord.status] }}
            </span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">开始时间:</span>
            <span class="tooltip-value">{{ formatTime(hoverRecord.startTime) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">结束时间:</span>
            <span class="tooltip-value">{{ formatTime(hoverRecord.endTime) }}</span>
          </div>
          <div class="tooltip-row">
            <span class="tooltip-label">持续时间:</span>
            <span class="tooltip-value">{{ formatDuration(hoverRecord.endTime.getTime() - hoverRecord.startTime.getTime()) }}</span>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.timeline-container {
  width: 100%;
}

.timeline-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
}

.time-label {
  font-size: 11px;
  color: #64748b;
  font-family: 'Roboto Mono', monospace;
}

.timeline-track {
  display: flex;
  width: 100%;
  height: 36px;
  border-radius: 6px;
  overflow: hidden;
  background: rgba(30, 58, 95, 0.2);
  position: relative;
}

.timeline-segment {
  height: 100%;
  position: relative;
  cursor: pointer;
  transition: filter 0.2s, transform 0.2s;
  min-width: 2px;
}

.timeline-segment:hover {
  filter: brightness(1.2);
  transform: scaleY(1.1);
  z-index: 1;
}

.transition-marker {
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 1px;
  background: rgba(255, 255, 255, 0.3);
}

.timeline-legend {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  flex-wrap: wrap;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #a0beeb;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.timeline-state {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 24px;
  color: #64748b;
  font-size: 13px;
}

.timeline-state.error {
  color: #ef4444;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(100, 116, 139, 0.3);
  border-top-color: #00d4ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.timeline-tooltip {
  position: fixed;
  z-index: 9999;
  background: linear-gradient(135deg, #132238 0%, #0f1d32 100%);
  border: 1px solid #1e3a5f;
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  min-width: 180px;
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 12px;
}

.tooltip-row:last-child {
  margin-bottom: 0;
}

.tooltip-label {
  color: #64748b;
}

.tooltip-value {
  color: #e2e8f0;
  font-weight: 500;
  font-family: 'Roboto Mono', monospace;
}

.tooltip-enter-active,
.tooltip-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tooltip-enter-from,
.tooltip-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
