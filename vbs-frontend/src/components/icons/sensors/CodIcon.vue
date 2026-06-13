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
    <!-- 锥形烧瓶颈部 -->
    <path d="M9 2v6L5 18h14l-4-10V2" />
    <!-- 烧瓶底边 -->
    <line x1="5" y1="18" x2="19" y2="18" />
    <!-- 内部液面波纹 -->
    <path d="M7 14c2-0.5 3 0.5 5 0s3-0.5 5 0" />
    <!-- 化学反应气泡 -->
    <circle cx="10" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="12" r="0.8" fill="currentColor" stroke="none" />
  </svg>
</template>
