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
    <!-- 容器/烧杯 -->
    <path d="M5 3h14v18H5z" />
    <!-- 液面线 -->
    <line x1="5" y1="8" x2="19" y2="8" />
    <!-- 浑浊颗粒 -->
    <circle cx="9" cy="12" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="14" r="1.2" fill="currentColor" stroke="none" />
    <circle cx="11" cy="16" r="0.8" fill="currentColor" stroke="none" />
    <circle cx="16" cy="11" r="0.9" fill="currentColor" stroke="none" />
    <circle cx="8" cy="15" r="0.7" fill="currentColor" stroke="none" />
  </svg>
</template>
