<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  currentLevel: number;
  maxLevel: number;
  warningLevel: number;
  width?: number;
  height?: number;
}

const props = withDefaults(defineProps<Props>(), {
  width: 120,
  height: 80,
});

const fillPercentage = computed(() => {
  const pct = (props.currentLevel / props.maxLevel) * 100;
  return Math.min(100, Math.max(5, pct));
});

const warningPercentage = computed(() => {
  return (props.warningLevel / props.maxLevel) * 100;
});

const isWarning = computed(() => {
  return props.currentLevel >= props.warningLevel;
});
</script>

<template>
  <div class="water-level-container" :style="{ width: `${width}px`, height: `${height}px` }">
    <svg :viewBox="`0 0 ${width} ${height}`" class="water-level-svg">
      <defs>
        <linearGradient id="waterGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#00ccff" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#0066cc" stop-opacity="0.95" />
        </linearGradient>
        <linearGradient id="waterWarningGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stop-color="#ffaa00" stop-opacity="0.9" />
          <stop offset="100%" stop-color="#cc6600" stop-opacity="0.95" />
        </linearGradient>
        <clipPath id="tankClip">
          <rect x="2" y="2" :width="width - 4" :height="height - 4" rx="6" />
        </clipPath>
      </defs>

      <rect x="1" y="1" :width="width - 2" :height="height - 2" rx="8" fill="none" stroke="#1e3a5f" stroke-width="2" />

      <g clip-path="url(#tankClip)">
        <rect x="0" y="0" :width="width" :height="height" fill="#0a1628" />

        <line
          :x1="0" :y1="height - (height * warningPercentage / 100)"
          :x2="width" :y2="height - (height * warningPercentage / 100)"
          stroke="#f59e0b" stroke-width="1" stroke-dasharray="4 2" opacity="0.6"
        />

        <rect
          :x="0"
          :y="height - (height * fillPercentage / 100)"
          :width="width"
          :height="height * fillPercentage / 100"
          :fill="isWarning ? 'url(#waterWarningGradient)' : 'url(#waterGradient)'"
          class="water-fill"
        />

        <path
          :d="`M0,${height - (height * fillPercentage / 100)} Q${width/4},${height - (height * fillPercentage / 100) - 4} ${width/2},${height - (height * fillPercentage / 100)} Q${width*3/4},${height - (height * fillPercentage / 100) + 4} ${width},${height - (height * fillPercentage / 100)}`"
          :fill="isWarning ? '#ffaa00' : '#00ccff'"
          opacity="0.7"
          class="wave-animation"
        />
      </g>

      <text :x="width / 2" :y="height / 2" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="12" font-family="Roboto Mono, monospace" font-weight="bold">
        {{ fillPercentage.toFixed(0) }}%
      </text>
    </svg>
  </div>
</template>

<style scoped>
.water-level-container {
  position: relative;
  display: inline-block;
}

.water-level-svg {
  width: 100%;
  height: 100%;
}

.water-fill {
  transition: y 1s ease-out, height 1s ease-out;
}
</style>
