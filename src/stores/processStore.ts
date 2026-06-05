import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PoolData, FlowPath, Alarm, ParameterHistory } from '@/types';
import { generateInitialPools, generateFlowPaths, updatePoolData, checkAlarms } from '@/utils/mockData';

export const useProcessStore = defineStore('process', () => {
  const pools = ref<PoolData[]>(generateInitialPools());
  const flowPaths = ref<FlowPath[]>(generateFlowPaths());
  const alarms = ref<Alarm[]>([]);
  const selectedPoolId = ref<string | null>(null);
  const isRunning = ref(true);
  const paramHistories = ref<Map<string, ParameterHistory>>(new Map());

  const selectedPool = computed(() => {
    return pools.value.find((p) => p.id === selectedPoolId.value) || null;
  });

  const activeAlarms = computed(() => {
    return alarms.value.filter((a) => !a.acknowledged);
  });

  const warningCount = computed(() => {
    return activeAlarms.value.filter((a) => a.level === 'warning').length;
  });

  const dangerCount = computed(() => {
    return activeAlarms.value.filter((a) => a.level === 'danger').length;
  });

  function updateData() {
    if (!isRunning.value) return;
    
    // 记录参数历史
    pools.value.forEach((pool) => {
      // 记录水池参数的历史
      pool.parameters.forEach((param) => {
        const key = `${pool.id}-${param.id}`;
        const existing = paramHistories.value.get(key);
        const now = new Date();
        if (existing) {
          existing.data.push({ timestamp: now, value: param.value });
          if (existing.data.length > 50) {
            existing.data.shift();
          }
        } else {
          paramHistories.value.set(key, {
            paramId: param.id,
            paramName: param.name,
            unit: param.unit,
            data: [{ timestamp: now, value: param.value }],
          });
        }
      });
      
      // 记录当前水位的历史（用于折线图展示）
      const levelKey = `${pool.id}-level`;
      const levelExisting = paramHistories.value.get(levelKey);
      const now = new Date();
      if (levelExisting) {
        levelExisting.data.push({ timestamp: now, value: pool.currentLevel });
        if (levelExisting.data.length > 50) {
          levelExisting.data.shift();
        }
      } else {
        paramHistories.value.set(levelKey, {
          paramId: 'level',
          paramName: '当前水位',
          unit: 'm',
          data: [{ timestamp: now, value: pool.currentLevel }],
        });
      }
    });
    
    pools.value = updatePoolData(pools.value);
    const newAlarms = checkAlarms(pools.value);
    alarms.value = [...alarms.value, ...newAlarms].slice(-50);
  }

  function getParamHistory(poolId: string, paramId: string): ParameterHistory | undefined {
    return paramHistories.value.get(`${poolId}-${paramId}`);
  }

  function selectPool(id: string | null) {
    selectedPoolId.value = id;
  }

  function acknowledgeAlarm(alarmId: string) {
    const alarm = alarms.value.find((a) => a.id === alarmId);
    if (alarm) {
      alarm.acknowledged = true;
    }
  }

  function toggleRunning() {
    isRunning.value = !isRunning.value;
  }

  function toggleDeviceStatus(poolId: string, deviceId: string) {
    const pool = pools.value.find((p) => p.id === poolId);
    if (!pool) return;
    const device = pool.devices.find((d) => d.id === deviceId);
    if (!device) return;
    if (device.status === 'running') {
      device.status = 'stopped';
    } else if (device.status === 'stopped') {
      device.status = 'running';
    }
  }

  return {
    pools,
    flowPaths,
    alarms,
    selectedPoolId,
    selectedPool,
    activeAlarms,
    warningCount,
    dangerCount,
    isRunning,
    updateData,
    selectPool,
    acknowledgeAlarm,
    toggleRunning,
    toggleDeviceStatus,
    getParamHistory,
  };
});
