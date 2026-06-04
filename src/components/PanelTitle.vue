<script setup lang="ts">
interface Props {
  title: string;
  subtitle?: string;
}

defineProps<Props>();
</script>

<template>
  <div class="panel-title-bar">
    <div class="title-capsule">
      <div class="title-icon">
        <!-- 外圈旋转环 -->
        <svg class="icon-rotate-ring" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="14" fill="none" stroke="rgba(0,212,255,0.3)" stroke-width="1" />
          <path d="M 16 2 A 14 14 0 0 1 30 16" fill="none" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round" />
          <path d="M 16 30 A 14 14 0 0 1 2 16" fill="none" stroke="#00d4ff" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <!-- 内圈旋转环 -->
        <svg class="icon-inner-ring" viewBox="0 0 32 32">
          <circle cx="16" cy="16" r="10" fill="none" stroke="rgba(0,212,255,0.2)" stroke-width="0.5" />
          <path d="M 16 6 A 10 10 0 0 1 26 16" fill="none" stroke="rgba(0,212,255,0.6)" stroke-width="1" stroke-linecap="round" />
        </svg>
        <!-- 中心亮点 -->
        <div class="icon-dot"></div>
      </div>
      <span class="title-text">{{ title }}</span>
      <span v-if="subtitle" class="title-subtitle">{{ subtitle }}</span>
    </div>
  </div>
</template>

<style scoped>
.panel-title-bar {
  display: flex;
  align-items: center;
  padding: 8px 16px 8px 0;
  position: relative;
  flex-shrink: 0;
}

/* 胶囊形状容器 */
.title-capsule {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 20px 8px 12px;
  background: linear-gradient(90deg, rgba(0, 80, 160, 0.6) 0%, rgba(0, 60, 130, 0.4) 50%, rgba(0, 40, 100, 0.15) 100%);
  border-radius: 24px 8px 8px 24px;
  position: relative;
  overflow: hidden;
}

/* 胶囊底部高光 */
.title-capsule::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, rgba(0, 212, 255, 0.5) 0%, rgba(0, 212, 255, 0.2) 40%, transparent 100%);
}

/* 图标容器 */
.title-icon {
  position: relative;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* 外圈旋转环 */
.icon-rotate-ring {
  position: absolute;
  width: 32px;
  height: 32px;
  animation: rotateRing 3s linear infinite;
}

/* 内圈反向旋转环 */
.icon-inner-ring {
  position: absolute;
  width: 32px;
  height: 32px;
  animation: rotateRingReverse 2s linear infinite;
}

/* 中心亮点 */
.icon-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: radial-gradient(circle, #00e8ff 0%, #00d4ff 50%, rgba(0, 212, 255, 0.6) 100%);
  box-shadow: 0 0 8px rgba(0, 212, 255, 0.8), 0 0 16px rgba(0, 212, 255, 0.4);
  z-index: 1;
}

@keyframes rotateRing {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes rotateRingReverse {
  0% {
    transform: rotate(360deg);
  }
  100% {
    transform: rotate(0deg);
  }
}

/* 标题文字 */
.title-text {
  font-family: 'DOUYU Font', 'Noto Sans SC', sans-serif;
  font-size: 18px;
  font-weight: 900;
  color: #ffffff;
  letter-spacing: 4px;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.4), 0 1px 2px rgba(0, 0, 0, 0.3);
  z-index: 1;
  white-space: nowrap;
}

/* 副标题 */
.title-subtitle {
  font-size: 11px;
  font-weight: 400;
  color: rgba(148, 163, 184, 0.6);
  letter-spacing: 1px;
  text-transform: uppercase;
  z-index: 1;
  white-space: nowrap;
}
</style>
