<script setup lang="ts">
import { computed } from 'vue';
import type { PoolData } from '@/types';
import { X, Activity, Droplets, Settings, AlertTriangle } from '@lucide/vue';

interface Props {
  pool: PoolData | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const isOpen = computed(() => props.pool !== null);

const statusText = computed(() => {
  if (!props.pool) return '';
  switch (props.pool.status) {
    case 'warning':
      return '警告';
    case 'danger':
      return '危险';
    default:
      return '正常';
  }
});

const statusColor = computed(() => {
  if (!props.pool) return '#00d4ff';
  switch (props.pool.status) {
    case 'warning':
      return '#f59e0b';
    case 'danger':
      return '#ef4444';
    default:
      return '#00d4ff';
  }
});

function close() {
  emit('close');
}

function formatRuntime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}
</script>

<template>
  <Transition name="modal">
    <div v-if="isOpen" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header" :style="{ borderColor: statusColor }">
          <div class="header-title">
            <span class="pool-code">{{ pool?.code }}</span>
            <h2 class="pool-name">{{ pool?.name }}</h2>
            <span class="status-badge" :style="{ backgroundColor: statusColor }">
              {{ statusText }}
            </span>
          </div>
          <button class="close-btn" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div class="section">
            <h3 class="section-title">
              <Droplets :size="16" />
              实时参数
            </h3>
            <div class="params-grid">
              <div class="param-card">
                <span class="param-label">当前水位</span>
                <span class="param-value font-mono" :style="{ color: statusColor }">
                  {{ pool?.currentLevel.toFixed(2) }}m
                </span>
              </div>
              <div class="param-card">
                <span class="param-label">总容量</span>
                <span class="param-value font-mono">{{ pool?.capacity }}m³</span>
              </div>
              <div class="param-card">
                <span class="param-label">警戒水位</span>
                <span class="param-value font-mono" style="color: #f59e0b">
                  {{ pool?.warningLevel }}m
                </span>
              </div>
              <div class="param-card">
                <span class="param-label">实时流量</span>
                <span class="param-value font-mono">{{ pool?.flowRate.toFixed(0) }}m³/h</span>
              </div>
              <div class="param-card">
                <span class="param-label">最大水位</span>
                <span class="param-value font-mono">{{ pool?.maxLevel }}m</span>
              </div>
              <div class="param-card">
                <span class="param-label">水位占比</span>
                <span class="param-value font-mono" :style="{ color: statusColor }">
                  {{ pool ? ((pool.currentLevel / pool.maxLevel) * 100).toFixed(1) : 0 }}%
                </span>
              </div>
            </div>

            <div v-if="pool?.parameters && pool.parameters.length > 4" class="extra-params">
              <div
                v-for="param in pool.parameters.filter(p => p.name !== '液位')"
                :key="param.id"
                class="param-item"
              >
                <span class="param-item-label">{{ param.name }}</span>
                <span class="param-item-value font-mono">
                  {{ param.value.toFixed(2) }}{{ param.unit }}
                </span>
              </div>
            </div>
          </div>

          <div class="section">
            <h3 class="section-title">
              <Settings :size="16" />
              设备状态
            </h3>
            <div class="devices-list">
              <div
                v-for="device in pool?.devices"
                :key="device.id"
                class="device-item"
              >
                <div class="device-info">
                  <span class="device-name">{{ device.name }}</span>
                  <span class="device-type">{{ device.type }}</span>
                </div>
                <div class="device-status">
                  <span
                    class="status-tag"
                    :class="device.status"
                  >
                    {{ device.status === 'running' ? '运行' : device.status === 'stopped' ? '停止' : device.status === 'fault' ? '故障' : '维护' }}
                  </span>
                  <span class="runtime">{{ formatRuntime(device.runtime) }}</span>
                </div>
              </div>
            </div>
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
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.modal-content {
  background: linear-gradient(135deg, #132238 0%, #0f1d32 100%);
  border: 1px solid #1e3a5f;
  border-radius: 16px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px solid;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 12px;
}

.pool-code {
  font-family: 'Roboto Mono', monospace;
  font-size: 12px;
  color: #a0beeb;
  background: rgba(30, 58, 95, 0.5);
  padding: 4px 8px;
  border-radius: 4px;
}

.pool-name {
  font-size: 18px;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0;
}

.status-badge {
  font-size: 11px;
  padding: 2px 8px;
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

.section {
  margin-bottom: 24px;
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

.params-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
}

.param-card {
  background: rgba(30, 58, 95, 0.3);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.param-label {
  font-size: 11px;
  color: #a0beeb;
}

.param-value {
  font-size: 16px;
  font-weight: 600;
  color: #e2e8f0;
}

.extra-params {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.param-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  background: rgba(30, 58, 95, 0.2);
  border-radius: 6px;
}

.param-item-label {
  font-size: 12px;
  color: #a0beeb;
}

.param-item-value {
  font-size: 13px;
  color: #e2e8f0;
}

.devices-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.device-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(30, 58, 95, 0.2);
  border-radius: 8px;
}

.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.device-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.device-type {
  font-size: 11px;
  color: #a0beeb;
}

.device-status {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  font-weight: 500;
}

.status-tag.running {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-tag.stopped {
  background: rgba(100, 116, 139, 0.2);
  color: #64748b;
}

.status-tag.fault {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-tag.maintenance {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.runtime {
  font-size: 11px;
  color: #a0beeb;
  font-family: 'Roboto Mono', monospace;
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
