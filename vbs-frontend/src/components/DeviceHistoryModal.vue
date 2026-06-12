<script setup lang="ts">
import { computed } from 'vue';
import type { DeviceStatusHistory } from '@/types';
import DeviceStatusTimeline from './DeviceStatusTimeline.vue';
import { X, Activity, Clock } from '@lucide/vue';

interface Props {
  visible: boolean;
  history: DeviceStatusHistory | null;
  loading?: boolean;
  error?: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null,
});

const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed(() => props.visible);

function close() {
  emit('close');
}

const deviceStatusText = computed(() => {
  if (!props.history) return '';
  const lastRecord = props.history.records[props.history.records.length - 1];
  if (!lastRecord) return '';
  switch (lastRecord.status) {
    case 'running':
      return '运行中';
    case 'stopped':
      return '已停止';
    case 'fault':
      return '故障';
    case 'offline':
      return '离线';
    default:
      return '';
  }
});

const deviceStatusColor = computed(() => {
  if (!props.history) return '#64748b';
  const lastRecord = props.history.records[props.history.records.length - 1];
  if (!lastRecord) return '#64748b';
  switch (lastRecord.status) {
    case 'running':
      return '#10b981';
    case 'stopped':
      return '#64748b';
    case 'fault':
      return '#ef4444';
    case 'offline':
      return '#94a3b8';
    default:
      return '#64748b';
  }
});
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="header-title">
            <Activity :size="18" class="header-icon" />
            <h2 class="modal-name">设备状态历史</h2>
            <span v-if="history" class="device-badge" :style="{ backgroundColor: deviceStatusColor }">
              {{ history.deviceName }} - {{ deviceStatusText }}
            </span>
          </div>
          <button class="close-btn" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="history" class="device-meta">
            <div class="meta-item">
              <span class="meta-label">设备ID</span>
              <span class="meta-value">{{ history.deviceId }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">所属水池</span>
              <span class="meta-value">{{ history.poolName }}</span>
            </div>
            <div class="meta-item">
              <span class="meta-label">记录时段</span>
              <span class="meta-value">
                <Clock :size="12" />
                最近24小时
              </span>
            </div>
          </div>

          <div class="timeline-section">
            <h3 class="section-title">
              <Activity :size="14" />
              状态时间轴
            </h3>
            <DeviceStatusTimeline
              :history="history"
              :loading="loading"
              :error="error"
            />
          </div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1100;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(135deg, #132238 0%, #0f1d32 100%);
  border: 1px solid #1e3a5f;
  border-radius: 16px;
  width: 90%;
  max-width: 720px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(30, 58, 95, 0.5);
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-icon {
  color: #00d4ff;
}

.modal-name {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.device-badge {
  font-size: 11px;
  padding: 2px 10px;
  border-radius: 4px;
  color: white;
  font-weight: 500;
}

.close-btn {
  background: none;
  border: none;
  color: #a0beeb;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s;
}

.close-btn:hover {
  color: #e2e8f0;
  background: rgba(30, 58, 95, 0.5);
}

.modal-body {
  padding: 20px;
  overflow-y: auto;
  max-height: calc(80vh - 70px);
}

.device-meta {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  background: rgba(30, 58, 95, 0.2);
  border-radius: 8px;
  padding: 10px 14px;
  min-width: 120px;
}

.meta-label {
  font-size: 11px;
  color: #64748b;
}

.meta-value {
  font-size: 13px;
  font-weight: 600;
  color: #e2e8f0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.timeline-section {
  margin-top: 8px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #a0beeb;
  margin-bottom: 12px;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.95);
}
</style>
