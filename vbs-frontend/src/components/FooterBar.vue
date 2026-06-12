<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Wifi, WifiOff, Server, Clock } from '@lucide/vue';
import { useProcessStore } from '@/stores/processStore';

const store = useProcessStore();
const uptime = ref(0);
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  timer = setInterval(() => {
    if (store.isRunning) {
      uptime.value++;
    }
  }, 1000);
});

onUnmounted(() => {
  clearInterval(timer);
});

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
</script>

<template>
  <footer class="footer-bar">
    <div class="footer-left">
      <div class="network-status">
        <Wifi v-if="store.isRunning" :size="14" class="network-icon online" />
        <WifiOff v-else :size="14" class="network-icon offline" />
        <span class="network-text">{{ store.isRunning ? '网络连接正常' : '数据更新已暂停' }}</span>
      </div>
    </div>

    <div class="footer-center">
      <div class="server-status">
        <Server :size="14" />
        <span>数据采集服务: {{ store.isRunning ? '运行中' : '已停止' }}</span>
      </div>
    </div>

    <div class="footer-right">
      <div class="uptime">
        <Clock :size="14" />
        <span class="font-mono">运行时长: {{ formatUptime(uptime) }}</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.footer-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 24px;
  background: linear-gradient(90deg, rgba(8, 13, 26, 0.95) 0%, rgba(12, 20, 40, 0.9) 50%, rgba(8, 13, 26, 0.95) 100%);
  border-top: 1px solid rgba(100, 130, 180, 0.2);
  position: relative;
  z-index: 10;
}

.footer-bar::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, #00d4ff 50%, transparent 100%);
}

.footer-left,
.footer-center,
.footer-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.network-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0beeb;
}

.network-icon {
  transition: color 0.3s;
}

.network-icon.online {
  color: #10b981;
}

.network-icon.offline {
  color: #ef4444;
}

.server-status {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0beeb;
}

.server-status svg {
  color: #00d4ff;
}

.uptime {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #a0beeb;
}

.uptime svg {
  color: #00d4ff;
}
</style>
