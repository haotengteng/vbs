<script setup lang="ts">
import { computed } from 'vue';
import type { FlowPath, PoolData } from '@/types';

interface Props {
  flowPaths: FlowPath[];
  pools: PoolData[];
}

const props = defineProps<Props>();

const poolMap = computed(() => {
  const map = new Map<string, PoolData>();
  props.pools.forEach((p) => map.set(p.id, p));
  return map;
});

interface LineInfo {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  type: string;
  active: boolean;
}

const lines = computed(() => {
  const result: LineInfo[] = [];
  props.flowPaths.forEach((path) => {
    const fromPool = poolMap.value.get(path.from);
    const toPool = poolMap.value.get(path.to);
    if (!fromPool || !toPool) return;

    const x1 = fromPool.position.x + 90;
    const y1 = fromPool.position.y + 140;
    const x2 = toPool.position.x + 90;
    const y2 = toPool.position.y;

    if (path.type === 'internal') {
      result.push({
        id: path.id,
        x1: fromPool.position.x + 180,
        y1: fromPool.position.y + 70,
        x2: fromPool.position.x + 180,
        y2: fromPool.position.y + 70,
        type: path.type,
        active: path.active,
      });
    } else {
      result.push({
        id: path.id,
        x1,
        y1,
        x2,
        y2,
        type: path.type,
        active: path.active,
      });
    }
  });
  return result;
});

function getPathD(line: LineInfo): string {
  if (line.type === 'internal') {
    const cx = line.x1 + 40;
    const cy = line.y1;
    return `M${line.x1},${line.y1} Q${cx},${cy - 30} ${cx},${cy} Q${cx},${cy + 30} ${line.x1},${line.y1}`;
  }

  const midY = (line.y1 + line.y2) / 2;
  return `M${line.x1},${line.y1} C${line.x1},${midY} ${line.x2},${midY} ${line.x2},${line.y2}`;
}

function getStrokeColor(type: string): string {
  switch (type) {
    case 'forward':
      return '#00d4ff';
    case 'recycle':
      return '#10b981';
    case 'internal':
      return '#f59e0b';
    default:
      return '#00d4ff';
  }
}

function getArrowTransform(line: LineInfo): string {
  const angle = Math.atan2(line.y2 - line.y1, line.x2 - line.x1) * (180 / Math.PI);
  return `translate(${line.x2}, ${line.y2}) rotate(${angle + 90})`;
}
</script>

<template>
  <svg class="flow-lines-svg" width="100%" height="100%">
    <defs>
      <marker
        id="arrow-forward"
        markerWidth="8"
        markerHeight="8"
        refX="4"
        refY="4"
        orient="auto"
      >
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#00d4ff" />
      </marker>
      <marker
        id="arrow-recycle"
        markerWidth="8"
        markerHeight="8"
        refX="4"
        refY="4"
        orient="auto"
      >
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#10b981" />
      </marker>
      <marker
        id="arrow-internal"
        markerWidth="8"
        markerHeight="8"
        refX="4"
        refY="4"
        orient="auto"
      >
        <path d="M0,0 L8,4 L0,8 L2,4 Z" fill="#f59e0b" />
      </marker>
    </defs>

    <path
      v-for="line in lines"
      :key="line.id"
      :d="getPathD(line)"
      fill="none"
      :stroke="getStrokeColor(line.type)"
      stroke-width="2"
      :class="line.type === 'recycle' ? 'flow-line-reverse' : 'flow-line'"
      :marker-end="`url(#arrow-${line.type})`"
      opacity="0.7"
    />
  </svg>
</template>

<style scoped>
.flow-lines-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}
</style>
