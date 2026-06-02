import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PoolData, FlowPath, Alarm } from '@/types';
import { generateInitialPools, generateFlowPaths, updatePoolData, checkAlarms } from '@/utils/mockData';

export const useProcessStore = defineStore('process', () => {
  const pools = ref<PoolData[]>(generateInitialPools());
  const flowPaths = ref<FlowPath[]>(generateFlowPaths());
  const alarms = ref<Alarm[]>([]);
  const selectedPoolId = ref<string | null>(null);
  const isRunning = ref(true);

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
    pools.value = updatePoolData(pools.value);
    const newAlarms = checkAlarms(pools.value);
    alarms.value = [...alarms.value, ...newAlarms].slice(-50);
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
  };
});
