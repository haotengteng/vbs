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
    <!-- 中心氮原子 -->
    <circle cx="12" cy="8" r="2.2" />
    <!-- 三个氢原子 -->
    <circle cx="6" cy="17" r="1.8" />
    <circle cx="18" cy="17" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
    <!-- 化学键连接 -->
    <line x1="11" y1="10" x2="7" y2="15.5" />
    <line x1="13" y1="10" x2="17" y2="15.5" />
    <line x1="12" y1="10.2" x2="12" y2="17.2" />
  </svg>
</template>
