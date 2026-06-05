<script setup lang="ts">
import { computed } from 'vue';
import { useProcessStore } from '@/stores/processStore';
import PanelTitle from './PanelTitle.vue';

const store = useProcessStore();

const alarmList = computed(() => {
  return store.activeAlarms.slice(0, 8).map((alarm, index) => ({
    id: index + 1,
    time: formatTime(alarm.timestamp),
    device: getDeviceName(alarm.message),
    event: alarm.message,
    status: alarm.level === 'danger' ? 'pending' : 'processing' as const,
  }));
});

function formatTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return '刚刚';
  if (minutes < 60) return `${minutes}分钟前`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}小时前`;
  return date.toLocaleString('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }).replace(/\//g, '-');
}

function getDeviceName(message: string): string {
  // 从告警消息中提取设备/池名称
  const match = message.match(/^([^\s]+)/);
  return match ? match[1] : '未知设备';
}

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
      <table v-if="alarmList.length > 0" class="alarm-table">
        <thead>
          <tr>
            <th style="width: 40px">序号</th>
            <th style="width: 100px">时间</th>
            <th style="width: 100px">报警设备</th>
            <th>报警事件</th>
            <th style="width: 80px">处理状态</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="alarm in alarmList" :key="alarm.id">
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
      <div v-else class="no-alarm">
        <svg viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="#4a6fa5" stroke-width="1.5">
          <path d="M9 12l2 2 4-4"/>
          <circle cx="12" cy="12" r="10"/>
        </svg>
        <p>系统运行正常，暂无告警</p>
      </div>
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

.no-alarm {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #4a6fa5;
  gap: 8px;
}

.no-alarm p {
  font-size: 12px;
  margin: 0;
}
</style>
