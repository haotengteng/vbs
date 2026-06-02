<script setup lang="ts">
import { ref } from 'vue';
import { CloudRain } from 'lucide-vue-next';

interface EmissionItem {
  label: string;
  value: string;
  unit: string;
  icon: string;
}

const emissionData = ref<EmissionItem[]>([
  { label: '二氧化硅浓度', value: '3.77', unit: 'μg/m³', icon: 'si' },
  { label: '氮氧化物浓度', value: '33.11', unit: 'mg/m³', icon: 'nox' },
  { label: 'PM值', value: '169', unit: 'μg/m³', icon: 'pm' },
  { label: '废气温度', value: '47', unit: '℃', icon: 'temp' },
  { label: '废气流量', value: '5650.7', unit: 'm³/h', icon: 'flow' },
  { label: '废气湿度', value: '56', unit: '%', icon: 'humidity' },
]);
</script>

<template>
  <div class="emission-panel">
    <div class="panel-header">
      <CloudRain :size="16" class="header-icon" />
      <span class="header-title">排放数据</span>
      <span class="header-sub">EMISSION DATA</span>
    </div>
    <div class="panel-body">
      <div
        v-for="(item, index) in emissionData"
        :key="index"
        class="data-item"
      >
        <div class="item-label">{{ item.label }}</div>
        <div class="item-value">
          <span class="value-num">{{ item.value }}</span>
          <span class="value-unit">{{ item.unit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.emission-panel {
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
  grid-template-columns: 1fr 1fr;
  gap: 1px;
  background: rgba(30, 58, 95, 0.2);
}

.data-item {
  background: rgba(16, 30, 60, 0.6);
  padding: 12px 14px;
  transition: background 0.3s;
}

.data-item:hover {
  background: rgba(0, 102, 204, 0.1);
}

.item-label {
  font-size: 11px;
  color: #94a3b8;
  margin-bottom: 6px;
}

.item-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.value-num {
  font-size: 20px;
  font-weight: 700;
  color: #00d4ff;
  font-family: var(--font-mono);
}

.value-unit {
  font-size: 10px;
  color: #64748b;
}
</style>
