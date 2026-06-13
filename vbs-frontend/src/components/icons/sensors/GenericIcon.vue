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
    <!-- 传感器探头主体 -->
    <rect x="10" y="2" width="4" height="10" rx="1" />
    <!-- 探头尖端 -->
    <path d="M11 12l1 4 1-4" />
    <!-- 信号波纹 -->
    <path d="M5 6a7 7 0 0 1 3-3" />
    <path d="M19 6a7 7 0 0 0-3-3" />
    <path d="M3 9a10 10 0 0 1 4-4" />
    <path d="M21 9a10 10 0 0 0-4-4" />
    <!-- 底部感应圆环 -->
    <circle cx="12" cy="19" r="3" />
  </svg>
</template>
