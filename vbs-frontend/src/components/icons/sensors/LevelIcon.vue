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
    <!-- 容器外框 -->
    <path d="M4 2h16v20H4z" />
    <!-- 水位波浪线 -->
    <path d="M4 14c2.67-1 3.33 1 6 0s3.33-1 6 0" />
    <!-- 右侧刻度 -->
    <line x1="16" y1="6" x2="18" y2="6" />
    <line x1="16" y1="10" x2="18" y2="10" />
    <line x1="16" y1="14" x2="18" y2="14" />
    <line x1="16" y1="18" x2="18" y2="18" />
  </svg>
</template>
