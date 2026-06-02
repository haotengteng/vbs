<script setup lang="ts">
import { onMounted, onUnmounted, ref, computed } from 'vue';
import { useProcessStore } from '@/stores/processStore';
import HeaderBar from '@/components/HeaderBar.vue';
import FooterBar from '@/components/FooterBar.vue';
import PoolNode from '@/components/PoolNode.vue';
import FlowLines from '@/components/FlowLines.vue';
import PoolDetailModal from '@/components/PoolDetailModal.vue';
import EmissionData from '@/components/EmissionData.vue';
import DeviceMonitor from '@/components/DeviceMonitor.vue';
import AlarmTable from '@/components/AlarmTable.vue';
import EfficiencyChart from '@/components/EfficiencyChart.vue';
import GasChart from '@/components/GasChart.vue';

const store = useProcessStore();
let updateTimer: ReturnType<typeof setInterval>;

const containerRef = ref<HTMLDivElement | null>(null);
const containerSize = ref({ width: 0, height: 0 });

// 拓扑图设计尺寸
const DESIGN_WIDTH = 1200;
const DESIGN_HEIGHT = 700;

// 计算缩放比例，保持居中
const transformStyle = computed(() => {
  const { width, height } = containerSize.value;
  if (width === 0 || height === 0) return {};

  // 计算缩放比例，保持宽高比，留边距
  const paddingX = 40;
  const paddingY = 40;
  const scaleX = (width - paddingX * 2) / DESIGN_WIDTH;
  const scaleY = (height - paddingY * 2) / DESIGN_HEIGHT;
  const scale = Math.min(scaleX, scaleY, 1); // 最大不放大超过100%

  // 计算居中偏移
  const scaledWidth = DESIGN_WIDTH * scale;
  const scaledHeight = DESIGN_HEIGHT * scale;
  const offsetX = (width - scaledWidth) / 2;
  const offsetY = (height - scaledHeight) / 2;

  return {
    transform: `translate(${offsetX}px, ${offsetY}px) scale(${scale})`,
    width: `${DESIGN_WIDTH}px`,
    height: `${DESIGN_HEIGHT}px`,
  };
});

function updateContainerSize() {
  if (containerRef.value) {
    const rect = containerRef.value.getBoundingClientRect();
    containerSize.value = {
      width: rect.width,
      height: rect.height,
    };
  }
}

onMounted(() => {
  updateTimer = setInterval(() => {
    store.updateData();
  }, 2000);

  updateContainerSize();
  window.addEventListener('resize', updateContainerSize);
});

onUnmounted(() => {
  clearInterval(updateTimer);
  window.removeEventListener('resize', updateContainerSize);
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
      <!-- 左侧拓扑图区域 -->
      <div class="left-section">
        <div ref="containerRef" class="topology-wrapper">
          <div class="topology-container" :style="transformStyle">
            <FlowLines :flow-paths="store.flowPaths" :pools="store.pools" />

            <PoolNode
              v-for="(pool, index) in store.pools"
              :key="pool.id"
              :pool="pool"
              :index="index"
              @click="handlePoolClick"
            />
          </div>
        </div>

        <!-- 底部信息栏 -->
        <div class="bottom-bar">
          <div class="bottom-item alarm-section">
            <AlarmTable />
          </div>
          <div class="bottom-item chart-section">
            <EfficiencyChart />
          </div>
          <div class="bottom-item chart-section">
            <GasChart />
          </div>
        </div>
      </div>

      <!-- 右侧数据面板 -->
      <aside class="right-sidebar">
        <EmissionData />
        <DeviceMonitor />
      </aside>
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
  display: flex;
  overflow: hidden;
  gap: 16px;
  padding: 16px;
  padding-bottom: 0;
  --main-padding: 16px;
}

/* 左侧区域 */
.left-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  gap: 12px;
}

/* 拓扑图容器 */
.topology-wrapper {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-height: 0;
}

.topology-container {
  position: absolute;
  top: 0;
  left: 0;
  transform-origin: 0 0;
  background: radial-gradient(ellipse at center, rgba(30, 58, 95, 0.1) 0%, transparent 70%);
  border-radius: 16px;
}

/* 底部信息栏 */
.bottom-bar {
  display: flex;
  gap: 12px;
  height: 220px;
  flex-shrink: 0;
  width: 100vw;
  margin-left: calc(-1 * var(--main-padding, 16px));
  margin-right: calc(-1 * var(--main-padding, 16px));
  padding-left: var(--main-padding, 16px);
  padding-right: var(--main-padding, 16px);
  box-sizing: border-box;
}

.bottom-item {
  min-width: 0;
}

.alarm-section {
  flex: 6;
}

.chart-section {
  flex: 2;
}

/* 右侧边栏 */
.right-sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow-y: auto;
  align-self: flex-start;
}

/* 响应式适配 */
@media (max-width: 1280px) {
  .right-sidebar {
    width: 240px;
  }

  .bottom-bar {
    height: 180px;
  }
}

@media (max-width: 1024px) {
  .main-content {
    flex-direction: column;
    overflow-y: auto;
  }

  .right-sidebar {
    width: 100%;
    flex-direction: row;
    flex-wrap: wrap;
  }

  .right-sidebar > * {
    flex: 1;
    min-width: 200px;
  }

  .bottom-bar {
    flex-direction: column;
    height: auto;
  }

  .bottom-item {
    min-height: 180px;
  }
}
</style>
