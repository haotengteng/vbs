import type { FlowPath } from '@/types';

/** 前端维护的水池拓扑图位置坐标 */
export const poolPositions: Record<string, { x: number; y: number }> = {
  'pool-1': { x: 80, y: 80 },
  'pool-2': { x: 400, y: 80 },
  'pool-3': { x: 720, y: 80 },
  'pool-4': { x: 720, y: 300 },
  'pool-5': { x: 400, y: 300 },
  'pool-6': { x: 400, y: 520 },
  'pool-7': { x: 720, y: 520 },
  'pool-8': { x: 1040, y: 520 },
  'pool-9': { x: 1040, y: 300 },
};

export function generateFlowPaths(): FlowPath[] {
  return [
    { id: 'f-1', from: 'pool-1', to: 'pool-2', type: 'forward', active: true },
    { id: 'f-2', from: 'pool-2', to: 'pool-3', type: 'forward', active: true },
    { id: 'f-3', from: 'pool-5', to: 'pool-4', type: 'forward', active: true },
    { id: 'f-4', from: 'pool-6', to: 'pool-7', type: 'forward', active: true },
    { id: 'f-5', from: 'pool-7', to: 'pool-9', type: 'forward', active: true },
    { id: 'f-6', from: 'pool-3', to: 'pool-4', type: 'forward', active: true },
    { id: 'f-7', from: 'pool-4', to: 'pool-7', type: 'forward', active: true },
    { id: 'f-8', from: 'pool-7', to: 'pool-8', type: 'forward', active: true },
    { id: 'f-9', from: 'pool-4', to: 'pool-4', type: 'internal', active: true },
    { id: 'f-10', from: 'pool-6', to: 'pool-5', type: 'recycle', active: true },
    { id: 'f-11', from: 'pool-7', to: 'pool-4', type: 'recycle', active: true },
    { id: 'f-12', from: 'pool-9', to: 'pool-3', type: 'recycle', active: true, fromSide: 'top', toSide: 'right' },
  ];
}
