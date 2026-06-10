<script setup lang="ts">
import { computed } from 'vue';
import type { FlowPath, PoolData, ConnectionSide } from '@/types';
import { poolPositions } from '@/utils/mockData';

interface Props {
  flowPaths: FlowPath[];
  pools: PoolData[];
}

const props = defineProps<Props>();

const POOL_WIDTH = 200;
const POOL_HEIGHT = 140;

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
  fromSide: ConnectionSide;
  toSide: ConnectionSide;
}

function getPos(poolId: string): { x: number; y: number } {
  return poolPositions[poolId];
}

/**
 * 智能路径算法：根据两个水池的相对位置，自动选择最优连接方向
 * 优先级：最短直线路径 > 最少转弯 > 默认规则
 */
function autoSelectSides(fromPool: PoolData, toPool: PoolData): { fromSide: ConnectionSide; toSide: ConnectionSide } {
  const fromPos = getPos(fromPool.id);
  const toPos = getPos(toPool.id);
  const dx = toPos.x - fromPos.x;
  const dy = toPos.y - fromPos.y;
  const absDx = Math.abs(dx);
  const absDy = Math.abs(dy);

  // 同一节点（内部循环）
  if (fromPool.id === toPool.id) {
    return { fromSide: 'right', toSide: 'right' };
  }

  // 计算四个方向的距离成本
  // 水平方向：从左到右 = dx + POOL_WIDTH, 从右到左 = -dx + POOL_WIDTH
  // 垂直方向：从上到下 = dy + POOL_HEIGHT, 从下到上 = -dy + POOL_HEIGHT

  const costs: Array<{ fromSide: ConnectionSide; toSide: ConnectionSide; cost: number }> = [];

  // 左→右（from右侧 到 to左侧）
  costs.push({
    fromSide: 'right',
    toSide: 'left',
    cost: Math.abs(dx - POOL_WIDTH) + absDy * 0.5,
  });

  // 右→左（from左侧 到 to右侧）
  costs.push({
    fromSide: 'left',
    toSide: 'right',
    cost: Math.abs(dx + POOL_WIDTH) + absDy * 0.5,
  });

  // 上→下（from底部 到 to顶部）
  costs.push({
    fromSide: 'bottom',
    toSide: 'top',
    cost: absDx * 0.5 + Math.abs(dy - POOL_HEIGHT),
  });

  // 下→上（from顶部 到 to底部）
  costs.push({
    fromSide: 'top',
    toSide: 'bottom',
    cost: absDx * 0.5 + Math.abs(dy + POOL_HEIGHT),
  });

  // 左→左
  costs.push({
    fromSide: 'left',
    toSide: 'left',
    cost: absDx + absDy,
  });

  // 右→右
  costs.push({
    fromSide: 'right',
    toSide: 'right',
    cost: absDx + absDy,
  });

  // 上→上
  costs.push({
    fromSide: 'top',
    toSide: 'top',
    cost: absDx + absDy,
  });

  // 下→下
  costs.push({
    fromSide: 'bottom',
    toSide: 'bottom',
    cost: absDx + absDy,
  });

  // 左→上
  costs.push({
    fromSide: 'left',
    toSide: 'top',
    cost: absDx + absDy,
  });

  // 左→下
  costs.push({
    fromSide: 'left',
    toSide: 'bottom',
    cost: absDx + absDy,
  });

  // 右→上
  costs.push({
    fromSide: 'right',
    toSide: 'top',
    cost: absDx + absDy,
  });

  // 右→下
  costs.push({
    fromSide: 'right',
    toSide: 'bottom',
    cost: absDx + absDy,
  });

  // 上→左
  costs.push({
    fromSide: 'top',
    toSide: 'left',
    cost: absDx + absDy,
  });

  // 上→右
  costs.push({
    fromSide: 'top',
    toSide: 'right',
    cost: absDx + absDy,
  });

  // 下→左
  costs.push({
    fromSide: 'bottom',
    toSide: 'left',
    cost: absDx + absDy,
  });

  // 下→右
  costs.push({
    fromSide: 'bottom',
    toSide: 'right',
    cost: absDx + absDy,
  });

  // 选择成本最低的方案
  const best = costs.reduce((min, current) => (current.cost < min.cost ? current : min));
  return { fromSide: best.fromSide, toSide: best.toSide };
}

function getConnectionPoint(pool: PoolData, side: ConnectionSide): { x: number; y: number } {
  const pos = getPos(pool.id);
  switch (side) {
    case 'top':
      return {
        x: pos.x + POOL_WIDTH / 2,
        y: pos.y,
      };
    case 'bottom':
      return {
        x: pos.x + POOL_WIDTH / 2,
        y: pos.y + POOL_HEIGHT,
      };
    case 'left':
      return {
        x: pos.x,
        y: pos.y + POOL_HEIGHT / 2,
      };
    case 'right':
      return {
        x: pos.x + POOL_WIDTH,
        y: pos.y + POOL_HEIGHT / 2,
      };
    default:
      return {
        x: pos.x + POOL_WIDTH,
        y: pos.y + POOL_HEIGHT / 2,
      };
  }
}

const lines = computed(() => {
  const result: LineInfo[] = [];
  props.flowPaths.forEach((path) => {
    const fromPool = poolMap.value.get(path.from);
    const toPool = poolMap.value.get(path.to);
    if (!fromPool || !toPool) return;

    if (path.type === 'internal') {
      const pos = getPos(fromPool.id);
      result.push({
        id: path.id,
        x1: pos.x + POOL_WIDTH,
        y1: pos.y + POOL_HEIGHT / 2,
        x2: pos.x + POOL_WIDTH,
        y2: pos.y + POOL_HEIGHT / 2,
        type: path.type,
        active: path.active,
        fromSide: 'right',
        toSide: 'right',
      });
    } else {
      // 如果配置了连接侧，使用配置；否则使用智能算法自动选择
      let fromSide: ConnectionSide;
      let toSide: ConnectionSide;

      if (path.fromSide && path.toSide) {
        fromSide = path.fromSide;
        toSide = path.toSide;
      } else {
        const auto = autoSelectSides(fromPool, toPool);
        fromSide = auto.fromSide;
        toSide = auto.toSide;
      }

      const fromPoint = getConnectionPoint(fromPool, fromSide);
      const toPoint = getConnectionPoint(toPool, toSide);

      result.push({
        id: path.id,
        x1: fromPoint.x,
        y1: fromPoint.y,
        x2: toPoint.x,
        y2: toPoint.y,
        type: path.type,
        active: path.active,
        fromSide,
        toSide,
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

  const dx = line.x2 - line.x1;
  const dy = line.y2 - line.y1;

  // 根据连接方向选择路径绘制策略
  const isHorizontalFrom = line.fromSide === 'left' || line.fromSide === 'right';
  const isHorizontalTo = line.toSide === 'left' || line.toSide === 'right';
  const isVerticalFrom = line.fromSide === 'top' || line.fromSide === 'bottom';
  const isVerticalTo = line.toSide === 'top' || line.toSide === 'bottom';

  // 水平→水平（左右连接）
  if (isHorizontalFrom && isHorizontalTo) {
    const midX = (line.x1 + line.x2) / 2;
    return `M${line.x1},${line.y1} C${midX},${line.y1} ${midX},${line.y2} ${line.x2},${line.y2}`;
  }

  // 垂直→垂直（上下连接）
  if (isVerticalFrom && isVerticalTo) {
    const midY = (line.y1 + line.y2) / 2;
    return `M${line.x1},${line.y1} C${line.x1},${midY} ${line.x2},${midY} ${line.x2},${line.y2}`;
  }

  // 水平→垂直 或 垂直→水平（拐角连接）
  const controlOffset = 40;
  let cp1x = line.x1;
  let cp1y = line.y1;
  let cp2x = line.x2;
  let cp2y = line.y2;

  if (isHorizontalFrom && isVerticalTo) {
    // 从水平方向出发，到垂直方向
    cp1x = line.x1 + dx * 0.5;
    cp1y = line.y1;
    cp2x = line.x2;
    cp2y = line.y2 - dy * 0.5;
  } else if (isVerticalFrom && isHorizontalTo) {
    // 从垂直方向出发，到水平方向
    cp1x = line.x1;
    cp1y = line.y1 + dy * 0.5;
    cp2x = line.x2 - dx * 0.5;
    cp2y = line.y2;
  }

  return `M${line.x1},${line.y1} C${cp1x},${cp1y} ${cp2x},${cp2y} ${line.x2},${line.y2}`;
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
</script>

<template>
  <svg class="flow-lines-svg" width="100%" height="100%">
    <defs>
      <!-- 正向流动渐变 -->
      <linearGradient id="flow-gradient-forward" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#00d4ff" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#00d4ff" stop-opacity="1" />
        <stop offset="100%" stop-color="#00d4ff" stop-opacity="0.2" />
      </linearGradient>
      <!-- 回流渐变 -->
      <linearGradient id="flow-gradient-recycle" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#10b981" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#10b981" stop-opacity="1" />
        <stop offset="100%" stop-color="#10b981" stop-opacity="0.2" />
      </linearGradient>
      <!-- 内部循环渐变 -->
      <linearGradient id="flow-gradient-internal" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="#f59e0b" stop-opacity="0.2" />
        <stop offset="50%" stop-color="#f59e0b" stop-opacity="1" />
        <stop offset="100%" stop-color="#f59e0b" stop-opacity="0.2" />
      </linearGradient>
    </defs>

    <!-- 连接线主体 -->
    <path
      v-for="line in lines"
      :key="`${line.id}-bg`"
      :d="getPathD(line)"
      fill="none"
      :stroke="getStrokeColor(line.type)"
      stroke-width="2"
      opacity="0.3"
    />

    <!-- 带动效的流动线 -->
    <path
      v-for="line in lines"
      :key="line.id"
      :d="getPathD(line)"
      fill="none"
      :stroke="getStrokeColor(line.type)"
      stroke-width="2"
      :class="line.type === 'recycle' ? 'flow-line-reverse' : 'flow-line'"
      opacity="0.9"
    />

    <!-- 流动粒子效果 -->
    <circle
      v-for="line in lines"
      :key="`${line.id}-particle`"
      r="3"
      :class="[
        'flow-particle',
        line.type === 'recycle' ? 'flow-particle-reverse' : 'flow-particle-forward'
      ]"
      opacity="0.9"
    >
      <animateMotion
        :dur="line.type === 'recycle' ? '3s' : '2s'"
        :path="getPathD(line)"
        repeatCount="indefinite"
        rotate="auto"
        :keyTimes="line.type === 'recycle' ? '1;0' : '0;1'"
      />
    </circle>
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

/* 正向流动虚线动画 */
.flow-line {
  stroke-dasharray: 12 8;
  animation: flowDashForward 1.5s linear infinite;
}

/* 回流虚线动画（反向） */
.flow-line-reverse {
  stroke-dasharray: 12 8;
  animation: flowDashReverse 2s linear infinite;
}

@keyframes flowDashForward {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: -20;
  }
}

@keyframes flowDashReverse {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 20;
  }
}

/* 流动粒子 */
.flow-particle {
  fill: #ffffff;
  filter: drop-shadow(0 0 4px currentColor);
}

.flow-particle-forward {
  fill: #00d4ff;
}

.flow-particle-reverse {
  fill: #10b981;
}
</style>
