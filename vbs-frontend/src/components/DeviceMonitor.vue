<script setup lang="ts">
import { computed } from 'vue';
import SensorTypeIcon from '@/components/icons/sensors/SensorTypeIcon.vue';
import PanelTitle from './PanelTitle.vue';
import { useProcessStore } from '@/stores/processStore';

const store = useProcessStore();

const monitorData = computed(() => {
  if (store.monitorItems.length > 0) {
    return store.monitorItems;
  }
  return [
    { label: '膜池液位', value: '1.08', unit: 'm', status: 'normal' as const, type: 'level' },
    { label: '膜池流量', value: '0.6', unit: 'm³/h', status: 'normal' as const, type: 'flow' },
    { label: '酸碱度', value: '7.2', unit: 'pH', status: 'normal' as const, type: 'ph' },
    { label: '风机状态', value: '正常', unit: '', status: 'normal' as const, type: 'gauge' },
    { label: '循环泵', value: '正常', unit: '', status: 'normal' as const, type: 'activity' },
    { label: '回流泵', value: '正常', unit: '', status: 'normal' as const, type: 'settings' },
  ];
});
</script>

<template>
  <div class="monitor-panel">
    <PanelTitle title="设备监控" subtitle="MONITOR" />
    <div class="panel-body">
      <div
        v-for="(item, index) in monitorData"
        :key="index"
        class="monitor-item"
      >
        <div class="item-icon-wrapper">
          <SensorTypeIcon :type="item.type" :size="20" class="item-icon" />
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
  background: linear-gradient(180deg, rgba(16, 28, 55, 0.75) 0%, rgba(10, 18, 38, 0.85) 100%);
  border: 1px solid rgba(100, 130, 180, 0.2);
  border-radius: 8px;
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
}

.panel-body {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 12px;
  padding: 14px;
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
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
  color: #a0beeb;
}

.item-value {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  width: 100%;
}

.value-num {
  font-size: 14px;
  font-weight: 700;
  font-family: var(--font-mono);
}

.value-unit {
  font-size: 10px;
  color: #a0beeb;
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
