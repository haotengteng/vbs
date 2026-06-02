<script setup lang="ts">
import { ref } from 'vue';
import { Gauge, Activity, Droplets, Settings } from 'lucide-vue-next';

interface MonitorItem {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  icon: string;
}

const monitorData = ref<MonitorItem[]>([
  { label: '烟囱压力', value: '1.08', unit: 'MPa', status: 'normal', icon: 'gauge' },
  { label: '过滤器压力', value: '0.6', unit: 'MPa', status: 'normal', icon: 'activity' },
  { label: '吸附塔压力', value: '0.3', unit: 'MPa', status: 'normal', icon: 'droplets' },
  { label: '风机状态', value: '正常', unit: '', status: 'normal', icon: 'gauge' },
  { label: '清洗系统', value: '正常', unit: '', status: 'normal', icon: 'activity' },
  { label: '控制系统', value: '正常', unit: '', status: 'normal', icon: 'settings' },
]);
</script>

<template>
  <div class="monitor-panel">
    <div class="panel-header">
      <Settings :size="16" class="header-icon" />
      <span class="header-title">设备监控</span>
      <span class="header-sub">EQUIPMENT MONITORING</span>
    </div>
    <div class="panel-body">
      <div
        v-for="(item, index) in monitorData"
        :key="index"
        class="monitor-item"
      >
        <div class="item-icon-wrapper">
          <Gauge v-if="item.icon === 'gauge'" :size="20" class="item-icon" />
          <Activity v-else-if="item.icon === 'activity'" :size="20" class="item-icon" />
          <Droplets v-else-if="item.icon === 'droplets'" :size="20" class="item-icon" />
          <Settings v-else :size="20" class="item-icon" />
        </div>
        <div class="item-info">
          <div class="item-label">{{ item.label }}</div>
          <div class="item-value" :class="`status-${item.status}`">
            <span class="value-num">{{ item.value }}</span>
            <span v-if="item.unit" class="value-unit">{{ item.unit }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.monitor-panel {
  background: linear-gradient(180deg, rgba(16, 30, 60, 0.9) 0%, rgba(10, 22, 40, 0.95) 100%);
  border: 1px solid rgba(30, 58, 95, 0.6);
  border-radius: 8px;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 14px;
  background: linear-gradient(90deg, rgba(0, 102, 204, 0.15) 0%, transparent 100%);
  border-bottom: 1px solid rgba(30, 58, 95, 0.4);
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
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 14px;
}

.monitor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.item-icon-wrapper {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 102, 204, 0.1);
  border: 1px solid rgba(0, 212, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-icon {
  color: #00d4ff;
}

.item-label {
  font-size: 11px;
  color: #94a3b8;
}

.item-value {
  display: flex;
  align-items: baseline;
  gap: 2px;
}

.value-num {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.value-unit {
  font-size: 10px;
  color: #64748b;
}

.status-normal .value-num {
  color: #10b981;
}

.status-warning .value-num {
  color: #f59e0b;
}

.status-danger .value-num {
  color: #ef4444;
}
</style>
