<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';
import { useProcessStore } from '@/stores/processStore';
import HeaderBar from '@/components/HeaderBar.vue';
import FooterBar from '@/components/FooterBar.vue';
import PoolNode from '@/components/PoolNode.vue';
import FlowLines from '@/components/FlowLines.vue';
import PoolDetailModal from '@/components/PoolDetailModal.vue';

const store = useProcessStore();
let updateTimer: ReturnType<typeof setInterval>;

onMounted(() => {
  updateTimer = setInterval(() => {
    store.updateData();
  }, 2000);
});

onUnmounted(() => {
  clearInterval(updateTimer);
});

function handlePoolClick(poolId: string) {
  store.selectPool(poolId);
}

function handleCloseModal() {
  store.selectPool(null);
}
</script>

<template>
  <div class="dashboard">
    <HeaderBar />

    <main class="main-content">
      <div class="topology-container">
        <FlowLines :flow-paths="store.flowPaths" :pools="store.pools" />

        <PoolNode
          v-for="(pool, index) in store.pools"
          :key="pool.id"
          :pool="pool"
          :index="index"
          @click="handlePoolClick"
        />
      </div>
    </main>

    <FooterBar />

    <PoolDetailModal :pool="store.selectedPool" @close="handleCloseModal" />
  </div>
</template>

<style scoped>
.dashboard {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  overflow: hidden;
}

.main-content {
  flex: 1;
  overflow: auto;
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
}

.topology-container {
  position: relative;
  width: 1200px;
  height: 700px;
  background: radial-gradient(ellipse at center, rgba(30, 58, 95, 0.1) 0%, transparent 70%);
  border-radius: 16px;
}

@media (max-width: 1280px) {
  .topology-container {
    transform: scale(0.85);
    transform-origin: top center;
  }
}

@media (max-width: 1024px) {
  .topology-container {
    transform: scale(0.7);
    transform-origin: top center;
  }
}
</style>
