<script setup lang="ts">
import { ref } from 'vue';
import PanelTitle from './PanelTitle.vue';

interface AlarmItem {
  id: number;
  time: string;
  device: string;
  event: string;
  status: 'processing' | 'completed' | 'pending';
}

const alarms = ref<AlarmItem[]>([
  { id: 1, time: '2023-06-17 13:50', device: '#01循环泵', event: '循环泵电流异常，超限值500', status: 'processing' },
  { id: 2, time: '2023-06-17 13:50', device: 'UV光解', event: 'UV光解告警灯持续闪烁', status: 'completed' },
  { id: 3, time: '2023-06-17 13:50', device: '#02循环泵', event: '循环泵电流异常，超限值106', status: 'pending' },
  { id: 4, time: '2023-06-17 13:50', device: '#04循环泵', event: '循环泵电流异常，超限值806', status: 'completed' },
  { id: 5, time: '2023-06-17 13:50', device: '#02收集风机', event: '收集风机电流异常，超限值640', status: 'processing' },
]);

function getStatusText(status: string): string {
  const map: Record<string, string> = {
    processing: '处理中',
    completed: '已完成',
    pending: '待处理',
  };
  return map[status] || status;
}

function getStatusClass(status: string): string {
  return `status-${status}`;
}
</script>

<template>
  <div class="alarm-panel">
    <PanelTitle title="报警信息" subtitle="ALARM" />
    <div class="panel-body">
      <table class="alarm-table">
        <thead>
          <tr>
            <th style="width: 40px">序号</th>
            <th style="width: 140px">时间</th>
            <th style="width: 100px">报警设备</th>
            <th>报警事件</th>
            <th style="width: 80px">处理状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alarm in alarms" :key="alarm.id">
            <td>{{ alarm.id }}</td>
            <td>{{ alarm.time }}</td>
            <td>{{ alarm.device }}</td>
            <td>{{ alarm.event }}</td>
            <td>
              <span class="status-tag" :class="getStatusClass(alarm.status)">
                {{ getStatusText(alarm.status) }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.alarm-panel {
  background: linear-gradient(180deg, rgba(16, 28, 55, 0.75) 0%, rgba(10, 18, 38, 0.85) 100%);
  border: 1px solid rgba(100, 130, 180, 0.2);
  border-radius: 8px;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel-body {
  flex: 1;
  overflow: auto;
  padding: 8px;
}

.alarm-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  font-size: 11px;
}

.alarm-table thead th {
  text-align: left;
  padding: 6px 10px;
  color: #a0beeb;
  font-weight: 500;
  border-bottom: 1px solid rgba(30, 58, 95, 0.5);
  white-space: nowrap;
  font-size: 10px;
  background: transparent;
}

.alarm-table tbody td {
  padding: 5px 10px;
  color: #a0beeb;
  border-bottom: 1px solid rgba(30, 58, 95, 0.15);
  font-size: 11px;
}

.alarm-table tbody tr:nth-child(even) {
  background: rgba(0, 102, 204, 0.03);
}

.alarm-table tbody tr:hover {
  background: rgba(0, 102, 204, 0.08);
}

.status-tag {
  display: inline-block;
  padding: 1px 6px;
  border-radius: 3px;
  font-size: 10px;
  font-weight: 500;
}

.status-processing {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
}

.status-completed {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
}

.status-pending {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}
</style>
