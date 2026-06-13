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
    <!-- 滴管主体 -->
    <path d="M12 2v6" />
    <path d="M10 3h4" />
    <!-- 滴管头部 -->
    <path d="M10 8l-3 5h6l-3-5z" />
    <!-- 液滴 -->
    <path d="M12 15c-1.5 0-3 1.5-3 3s1.5 3 3 3 3-1.5 3-3-1.5-3-3-3z" />
    <circle cx="12" cy="18" r="1" fill="currentColor" stroke="none" />
  </svg>
</template>
