<script setup lang="ts">
import { computed, ref } from 'vue';
import { useProcessStore } from '@/stores/processStore';
import DeviceStatusTimeline from './DeviceStatusTimeline.vue';
import DeviceIcon from './DeviceIcon.vue';
import type { DeviceStatusHistory } from '@/types';
import { X, Settings, Database } from '@lucide/vue';

interface Props {
  visible: boolean;
  filterStatus?: 'running' | 'fault' | 'stopped' | 'offline' | 'all';
  filterCategory?: string;
}

const props = withDefaults(defineProps<Props>(), {
  visible: false,
  filterStatus: 'all',
  filterCategory: '',
});

const emit = defineEmits<{
  close: [];
}>();

const store = useProcessStore();

const activeDeviceId = ref<string | null>(null);
const selectedDeviceHistory = ref<DeviceStatusHistory | null>(null);
const selectedDeviceTimeRange = ref(3);

const allDevices = computed(() => {
  const devices: Array<{
    id: string;
    name: string;
    type: string;
    status: 'running' | 'stopped' | 'fault' | 'offline';
    statusTime: Date;
    poolId: string;
    poolName: string;
    poolCode: string;
  }> = [];

  store.pools.forEach((pool) => {
    pool.devices.forEach((device) => {
      devices.push({
        ...device,
        poolId: pool.id,
        poolName: pool.name,
        poolCode: pool.code,
      });
    });
  });

  return devices;
});

const filteredDevices = computed(() => {
  let result = allDevices.value;

  if (props.filterStatus !== 'all') {
    result = result.filter((d) => d.status === props.filterStatus);
  }

  if (props.filterCategory) {
    const codeMap: Record<string, string> = {
      '缺氧池': 'P-005',
      '调节池': 'P-003',
      '厌氧池': 'P-004',
      '膜池': 'P-007',
    };
    const targetCode = codeMap[props.filterCategory];
    if (targetCode) {
      result = result.filter((d) => d.poolCode === targetCode);
    }
  }

  return result;
});

const modalTitle = computed(() => {
  if (props.filterCategory) {
    return `${props.filterCategory} - 设备列表`;
  }
  switch (props.filterStatus) {
    case 'running':
      return '运行设备列表';
    case 'fault':
      return '故障设备列表';
    case 'stopped':
      return '停止设备列表';
    case 'offline':
      return '离线设备列表';
    default:
      return '全部设备列表';
  }
});

function close() {
  emit('close');
}

function formatStatusTime(date: Date): string {
  const d = new Date(date);
  const MM = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${MM}-${dd} ${hh}:${mm}:${ss}`;
}

function getStatusText(status: string): string {
  switch (status) {
    case 'running':
      return '运行中';
    case 'stopped':
      return '已停止';
    case 'fault':
      return '故障';
    case 'offline':
      return '离线';
    default:
      return status;
  }
}

function getStatusClass(status: string): string {
  switch (status) {
    case 'running':
      return 'status-running';
    case 'stopped':
      return 'status-stopped';
    case 'fault':
      return 'status-fault';
    case 'offline':
      return 'status-offline';
    default:
      return '';
  }
}

function toggleDeviceHistory(deviceId: string, deviceName: string, poolId: string, poolName: string) {
  // 如果点击的是当前已展开的设备，则关闭
  if (activeDeviceId.value === deviceId) {
    activeDeviceId.value = null;
    selectedDeviceHistory.value = null;
    return;
  }

  activeDeviceId.value = deviceId;
  const history = store.getDeviceStatusHistory(poolId, deviceId, selectedDeviceTimeRange.value);
  if (history) {
    selectedDeviceHistory.value = history;
  } else {
    selectedDeviceHistory.value = {
      deviceId,
      deviceName,
      poolId,
      poolName,
      records: [],
    };
  }
}

function onDeviceTimeRangeChange(hours: number) {
  selectedDeviceTimeRange.value = hours;
  if (activeDeviceId.value) {
    const device = allDevices.value.find((d) => d.id === activeDeviceId.value);
    if (device) {
      const history = store.getDeviceStatusHistory(device.poolId, activeDeviceId.value, hours);
      if (history) {
        selectedDeviceHistory.value = history;
      }
    }
  }
}
</script>

<template>
  <Transition name="modal">
    <div v-if="visible" class="modal-overlay" @click="close">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <div class="header-title">
            <Database :size="18" class="header-icon" />
            <h2 class="modal-name">{{ modalTitle }}</h2>
            <span class="device-count-badge">{{ filteredDevices.length }} 台</span>
          </div>
          <button class="close-btn" @click="close">
            <X :size="20" />
          </button>
        </div>

        <div class="modal-body">
          <div v-if="filteredDevices.length === 0" class="empty-state">
            <Settings :size="48" class="empty-icon" />
            <p>暂无符合条件的设备</p>
          </div>

          <div v-else class="device-table">
            <div class="table-header">
              <span class="col-id">设备 ID</span>
              <span class="col-name">设备名称</span>
              <span class="col-pool">所属水池</span>
              <span class="col-status">当前状态</span>
              <span class="col-time">状态更新时间</span>
            </div>
            <div class="table-body">
              <template v-for="device in filteredDevices" :key="device.id">
                <div
                  class="table-row"
                  :class="{ active: activeDeviceId === device.id }"
                  @click="toggleDeviceHistory(device.id, device.name, device.poolId, device.poolName)"
                >
                  <span class="col-id">
                    <DeviceIcon :type="device.type" :status="device.status" :size="16" />
                    {{ device.id }}
                  </span>
                  <span class="col-name">{{ device.name }}</span>
                  <span class="col-pool">
                    <span class="pool-tag">{{ device.poolName }}</span>
                  </span>
                  <span class="col-status">
                    <span class="status-tag" :class="getStatusClass(device.status)">
                      {{ getStatusText(device.status) }}
                    </span>
                  </span>
                  <span class="col-time">{{ formatStatusTime(device.statusTime) }}</span>
                </div>
                <!-- 设备状态历史时间轴 -->
                <Transition name="chart-expand">
                  <div v-if="activeDeviceId === device.id" class="device-history-container">
                    <div class="history-header">
                      <span class="history-title">状态时间轴</span>
                      <span class="history-device">{{ device.name }}</span>
                    </div>
                    <DeviceStatusTimeline
                      :history="selectedDeviceHistory"
                      @time-range-change="onDeviceTimeRangeChange"
                    />
                  </div>
                </Transition>
              </template>
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
  max-width: 800px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 2px solid #1e3a5f;
  flex-shrink: 0;
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

.device-count-badge {
  font-size: 12px;
  padding: 2px 10px;
  border-radius: 12px;
  background: rgba(0, 212, 255, 0.15);
  color: #00d4ff;
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
  padding: 16px 20px 20px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 60px 20px;
  color: #64748b;
}

.empty-icon {
  color: rgba(100, 116, 139, 0.3);
}

/* 设备表格 */
.device-table {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.table-header {
  display: grid;
  grid-template-columns: 100px 1fr 120px 90px 140px;
  gap: 12px;
  padding: 10px 14px;
  background: rgba(30, 58, 95, 0.3);
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  color: #a0beeb;
  position: sticky;
  top: 0;
  z-index: 1;
}

.table-body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.table-row {
  display: grid;
  grid-template-columns: 100px 1fr 120px 90px 140px;
  gap: 12px;
  padding: 12px 14px;
  background: rgba(30, 58, 95, 0.15);
  border-radius: 8px;
  align-items: center;
  transition: all 0.2s;
  cursor: pointer;
}

.table-row:hover {
  background: rgba(30, 58, 95, 0.35);
  transform: translateX(2px);
}

.table-row.active {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.col-id {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0beeb;
  font-family: 'Roboto Mono', monospace;
}

.row-icon {
  flex-shrink: 0;
}

.col-name {
  font-size: 13px;
  font-weight: 500;
  color: #e2e8f0;
}

.col-pool {
  display: flex;
  align-items: center;
}

.pool-tag {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  background: rgba(30, 58, 95, 0.5);
  color: #a0beeb;
}

.col-status {
  display: flex;
  align-items: center;
}

.status-tag {
  font-size: 11px;
  padding: 3px 10px;
  border-radius: 4px;
  font-weight: 500;
  display: inline-block;
}

.status-tag.status-running {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
}

.status-tag.status-stopped {
  background: rgba(100, 116, 139, 0.2);
  color: #94a3b8;
}

.status-tag.status-fault {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.status-tag.status-offline {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.col-time {
  font-size: 12px;
  color: #a0beeb;
  font-family: 'Roboto Mono', monospace;
}

/* 设备历史容器 */
.device-history-container {
  margin-top: -2px;
  margin-bottom: 6px;
  padding: 16px;
  background: rgba(15, 29, 50, 0.6);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 0 0 8px 8px;
  border-top: none;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(30, 58, 95, 0.5);
}

.history-title {
  font-size: 13px;
  font-weight: 600;
  color: #a0beeb;
}

.history-device {
  font-size: 12px;
  color: #64748b;
}

/* 展开动画 */
.chart-expand-enter-active,
.chart-expand-leave-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
  overflow: hidden;
}

.chart-expand-enter-from,
.chart-expand-leave-to {
  opacity: 0;
  max-height: 0;
  padding-top: 0;
  padding-bottom: 0;
  margin-top: 0;
  transform: translateY(-10px);
}

.chart-expand-enter-to,
.chart-expand-leave-from {
  opacity: 1;
  max-height: 400px;
  transform: translateY(0);
}

/* 弹窗过渡动画 */
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

/* 响应式 */
@media (max-width: 768px) {
  .table-header,
  .table-row {
    grid-template-columns: 80px 1fr 100px 80px 120px;
    gap: 8px;
    padding: 10px;
  }
}
</style>
