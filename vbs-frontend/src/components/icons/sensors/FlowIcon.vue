<script setup lang="ts">
defineProps<{
  size?: number;
}>();
</script>

<template>
  <svg
    :width="size || 24"
    :height="size || 24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
  >
    <!-- 管道外框 -->
    <rect x="2" y="8" width="20" height="8" rx="2" />
    <!-- 流向箭头 -->
    <path d="M6 12h8" />
    <polyline points="12,9 16,12 12,15" />
    <!-- 流量计刻度 -->
    <line x1="18" y1="10" x2="18" y2="14" />
    <line x1="20" y1="10.5" x2="20" y2="13.5" />
  </svg>
</template>
