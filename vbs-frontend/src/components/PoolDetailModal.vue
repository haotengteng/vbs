<script setup lang="ts">
import { computed, ref } from 'vue';
import type { PoolData, SensorHistory, DeviceStatusHistory } from '@/types';
import { useProcessStore } from '@/stores/processStore';
import SensorHistoryChart from './SensorHistoryChart.vue';
import DeviceStatusTimeline from './DeviceStatusTimeline.vue';
import DeviceIcon from './DeviceIcon.vue';
import { X, Activity, Droplets, Settings, Database, Gauge } from '@lucide/vue';

interface Props {
  pool: PoolData | null;
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

const store = useProcessStore();
const selectedSensor = ref<SensorHistory | null>(null);
const activeSensorId = ref<string | null>(null);
const selectedDeviceHistory = ref<DeviceStatusHistory | null>(null);
const activeDeviceId = ref<string | null>(null);
const selectedSensorTimeRange = ref(3);
const selectedDeviceTimeRange = ref(3);

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

// 静态配置传感器
const staticParams = computed(() => {
  if (!props.pool) return [];
  const levelSensor = props.pool.sensors.find((s) => s.name === '液位');
  const highLevel = levelSensor?.max ?? props.pool.maxLevel * 0.9;
  const lowLevel = levelSensor?.min ?? 0.5;
  return [
    { label: '总容量', value: `${props.pool.capacity}m³`, icon: Database },
    { label: '最大水位', value: `${props.pool.maxLevel}m`, icon: Droplets, color: '#ef4444' },
    { label: '高液位警戒', value: `${highLevel}m`, color: '#f59e0b' },
    { label: '低液位警戒', value: `${lowLevel}m`, color: '#f59e0b' },
  ];
});

// 实时传感器（包含水位和其他动态传感器）
const realtimeSensors = computed(() => {
  if (!props.pool) return [];
  const sensors = [
    {
      id: 'level',
      name: '当前水位',
      value: props.pool.currentLevel,
      unit: 'm',
      color: statusColor.value,
      chartable: true,
    },
    {
      id: 'level-percent',
      name: '水位占比',
      value: parseFloat(((props.pool.currentLevel / props.pool.maxLevel) * 100).toFixed(1)),
      unit: '%',
      color: statusColor.value,
      chartable: false,
    },
  ];

  // 添加其他动态传感器
  props.pool.sensors.forEach((sensor) => {
    if (sensor.name !== '液位') {
      sensors.push({
        id: sensor.id,
        name: sensor.name,
        value: sensor.value,
        unit: sensor.unit,
        color: sensor.value < sensor.min || sensor.value > sensor.max ? '#ef4444' : '#00d4ff',
        chartable: true,
      });
    }
  });
  return sensors;
});

function close() {
  emit('close');
}

function formatStatusTime(timeStr: string): string {
  const d = new Date(timeStr);
  const hh = String(d.getHours()).padStart(2, '0');
  const mm = String(d.getMinutes()).padStart(2, '0');
  const ss = String(d.getSeconds()).padStart(2, '0');
  return `${hh}:${mm}:${ss}`;
}

async function toggleSensorHistory(sensorId: string, sensorName: string, unit: string) {
  if (!props.pool) return;

  // 如果点击的是当前已展开的传感器，则关闭
  if (activeSensorId.value === sensorId) {
    activeSensorId.value = null;
    selectedSensor.value = null;
    return;
  }

  activeSensorId.value = sensorId;
  const history = await store.getSensorHistory(props.pool.id, sensorId, selectedSensorTimeRange.value);
  if (history && history.data.length > 0) {
    selectedSensor.value = history;
  } else {
    selectedSensor.value = {
      sensorId,
      sensorName,
      unit,
      data: [],
    };
  }
}

async function onSensorTimeRangeChange(hours: number) {
  selectedSensorTimeRange.value = hours;
  if (activeSensorId.value && props.pool) {
    const history = await store.getSensorHistory(props.pool.id, activeSensorId.value, hours);
    if (history && history.data.length > 0) {
      selectedSensor.value = history;
    }
  }
}

async function toggleDeviceHistory(deviceId: string, deviceName: string) {
  if (!props.pool) return;

  // 如果点击的是当前已展开的设备，则关闭
  if (activeDeviceId.value === deviceId) {
    activeDeviceId.value = null;
    selectedDeviceHistory.value = null;
    return;
  }

  activeDeviceId.value = deviceId;
  const history = await store.getDeviceStatusHistory(props.pool.id, deviceId, selectedDeviceTimeRange.value);
  if (history) {
    selectedDeviceHistory.value = history;
  } else {
    selectedDeviceHistory.value = {
      deviceId,
      deviceName,
      poolId: props.pool.id,
      poolName: props.pool.name,
      records: [],
    };
  }
}

async function onDeviceTimeRangeChange(hours: number) {
  selectedDeviceTimeRange.value = hours;
  if (activeDeviceId.value && props.pool) {
    const history = await store.getDeviceStatusHistory(props.pool.id, activeDeviceId.value, hours);
    if (history) {
      selectedDeviceHistory.value = history;
    }
  }
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
          <!-- 静态配置 -->
          <div class="section">
            <h3 class="section-title">
              <Database :size="16" />
              静态配置
            </h3>
            <div class="static-grid">
              <div v-for="sensor in staticParams" :key="sensor.label" class="static-card">
                <span class="static-label">{{ sensor.label }}</span>
                <span class="static-value font-mono" :style="{ color: sensor.color || '#e2e8f0' }">
                  {{ sensor.value }}
                </span>
              </div>
            </div>
          </div>

          <!-- 实时传感器 -->
          <div class="section">
            <h3 class="section-title">
              <Gauge :size="16" />
              实时传感器
              <span class="hint">点击传感器查看历史趋势</span>
            </h3>
            <div class="realtime-grid">
              <template v-for="sensor in realtimeSensors" :key="sensor.id">
                <div
                  class="realtime-card"
                  :class="{ active: activeSensorId === sensor.id, 'no-chart': !sensor.chartable }"
                  @click="sensor.chartable && toggleSensorHistory(sensor.id, sensor.name, sensor.unit)"
                >
                  <div class="realtime-header">
                    <span class="realtime-name">{{ sensor.name }}</span>
                    <Activity v-if="sensor.chartable" :size="14" class="chart-icon" />
                  </div>
                  <span class="realtime-value font-mono" :style="{ color: sensor.color || '#00d4ff' }">
                    {{ sensor.value.toFixed(2) }}{{ sensor.unit }}
                  </span>
                </div>
              </template>
            </div>
            <!-- 统一在实时传感器栏目下方展示折线图 -->
            <SensorHistoryChart
              v-if="selectedSensor && activeSensorId"
              :history="selectedSensor"
              @time-range-change="onSensorTimeRangeChange"
            />
          </div>

          <!-- 设备状态 -->
          <div class="section">
            <h3 class="section-title">
              <Settings :size="16" />
              设备状态
              <span class="hint">点击设备查看状态历史</span>
            </h3>
            <div class="devices-list">
              <template v-for="device in pool?.devices" :key="device.id">
                <div
                  class="device-item"
                  :class="{ active: activeDeviceId === device.id }"
                  @click="toggleDeviceHistory(device.id, device.name)"
                >
                  <div class="device-info">
                    <DeviceIcon :type="device.type" :status="device.status" :size="20" />
                    <div class="device-text">
                      <span class="device-name">{{ device.name }}</span>
                      <span class="device-type">{{ device.type }}</span>
                    </div>
                  </div>
                  <div class="device-status">
                    <label class="device-switch" :class="{ disabled: device.status === 'fault' || device.status === 'offline' }" @click.stop>
                      <input
                        type="checkbox"
                        :checked="device.status === 'running'"
                        :disabled="device.status === 'fault' || device.status === 'offline'"
                        @change.stop="store.toggleDeviceStatus(pool!.id, device.id)"
                      />
                      <span class="switch-slider"></span>
                    </label>
                    <span
                      class="status-tag"
                      :class="device.status"
                    >
                      {{ device.status === 'running' ? '运行' : device.status === 'stopped' ? '停止' : device.status === 'offline' ? '离线' : '故障' }}
                    </span>
                    <span class="status-time">{{ formatStatusTime(device.statusTime) }}</span>
                  </div>
                </div>
                <!-- 设备状态历史时间轴 -->
                <Transition name="chart-expand">
                  <div v-if="activeDeviceId === device.id" class="device-history-container">
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

.hint {
  font-size: 11px;
  color: #64748b;
  font-weight: 400;
  margin-left: auto;
}

/* 静态配置 */
.static-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}

.static-card {
  background: rgba(30, 58, 95, 0.2);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.static-label {
  font-size: 11px;
  color: #64748b;
}

.static-value {
  font-size: 14px;
  font-weight: 600;
  color: #e2e8f0;
}

/* 实时传感器 */
.realtime-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  align-items: start;
}

.realtime-card {
  background: rgba(30, 58, 95, 0.3);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 8px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.realtime-card:hover {
  background: rgba(30, 58, 95, 0.5);
  border-color: rgba(0, 212, 255, 0.3);
  transform: translateY(-1px);
}

.realtime-card.active {
  background: rgba(0, 212, 255, 0.1);
  border-color: rgba(0, 212, 255, 0.5);
}

.realtime-card.no-chart {
  cursor: default;
}

.realtime-card.no-chart:hover {
  background: rgba(30, 58, 95, 0.3);
  border-color: rgba(30, 58, 95, 0.5);
  transform: none;
}

.realtime-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.realtime-name {
  font-size: 11px;
  color: #a0beeb;
}

.chart-icon {
  color: #64748b;
  transition: color 0.2s;
}

.realtime-card:hover .chart-icon {
  color: #00d4ff;
}

.realtime-value {
  font-size: 16px;
  font-weight: 600;
}

/* 设备状态 */
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
  align-items: center;
  gap: 10px;
}

.device-text {
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

.status-tag.offline {
  background: rgba(148, 163, 184, 0.2);
  color: #94a3b8;
}

.status-time {
  font-size: 11px;
  color: #a0beeb;
  font-family: 'Roboto Mono', monospace;
}

/* 设备开关 */
.device-switch {
  position: relative;
  display: inline-block;
  width: 36px;
  height: 20px;
  cursor: pointer;
}

.device-switch.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.device-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.switch-slider {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(100, 116, 139, 0.4);
  border-radius: 20px;
  transition: background 0.3s;
}

.switch-slider::before {
  content: '';
  position: absolute;
  height: 16px;
  width: 16px;
  left: 2px;
  bottom: 2px;
  background: #e2e8f0;
  border-radius: 50%;
  transition: transform 0.3s;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.device-switch input:checked + .switch-slider {
  background: rgba(16, 185, 129, 0.5);
}

.device-switch input:checked + .switch-slider::before {
  transform: translateX(16px);
  background: #10b981;
}

.device-switch input:focus + .switch-slider {
  box-shadow: 0 0 0 2px rgba(0, 212, 255, 0.3);
}

.history-btn {
  background: rgba(30, 58, 95, 0.4);
  border: 1px solid rgba(30, 58, 95, 0.6);
  color: #a0beeb;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
}

.history-btn:hover {
  background: rgba(0, 212, 255, 0.15);
  border-color: rgba(0, 212, 255, 0.3);
  color: #00d4ff;
}

.device-item {
  cursor: pointer;
  transition: all 0.2s;
}

.device-item:hover {
  background: rgba(30, 58, 95, 0.4);
}

.device-item.active {
  background: rgba(0, 212, 255, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.3);
}

.device-history-container {
  margin-top: 8px;
  margin-bottom: 8px;
  padding: 12px;
  background: rgba(15, 29, 50, 0.6);
  border: 1px solid rgba(30, 58, 95, 0.5);
  border-radius: 8px;
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
