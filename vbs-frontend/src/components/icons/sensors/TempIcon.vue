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
    <!-- 温度计外壳 -->
    <path d="M14 14.76V3.5a2.5 2.5 0 0 0-5 0v11.26a4.5 4.5 0 1 0 5 0z" />
    <!-- 内部液柱 -->
    <line x1="11.5" y1="6" x2="11.5" y2="15" />
    <!-- 底部水银球 -->
    <circle cx="11.5" cy="18.5" r="1.5" fill="currentColor" stroke="none" />
    <!-- 刻度 -->
    <line x1="8" y1="7" x2="9" y2="7" />
    <line x1="8" y1="10" x2="9" y2="10" />
    <line x1="8" y1="13" x2="9" y2="13" />
  </svg>
</template>
