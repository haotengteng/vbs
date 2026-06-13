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
    <!-- 水滴轮廓 -->
    <path d="M12 22c4.97 0 9-4.03 9-9 0-4.97-9-13-9-13S3 8.03 3 13c0 4.97 4.03 9 9 9z" />
    <!-- 溶解氧气泡 -->
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="10" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="15" r="1.5" fill="currentColor" stroke="none" />
    <!-- 氧气分子暗示 -->
    <circle cx="12" cy="7" r="1.2" fill="currentColor" stroke="none" />
  </svg>
</template>
