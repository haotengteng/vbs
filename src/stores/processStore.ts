import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PoolData, FlowPath, Alarm, SensorHistory } from '@/types';
import { generateInitialPools, generateFlowPaths, updatePoolData, checkAlarms } from '@/utils/mockData';

export const useProcessStore = defineStore('process', () => {
  const pools = ref<PoolData[]>(generateInitialPools());
  const flowPaths = ref<FlowPath[]>(generateFlowPaths());
  const alarms = ref<Alarm[]>([]);
  const selectedPoolId = ref<string | null>(null);
  const isRunning = ref(true);
  const sensorHistories = ref<Map<string, SensorHistory>>(new Map());

  const selectedPool = computed(() => {
    return pools.value.find((p) => p.id === selectedPoolId.value) || null;
  });

  const activeAlarms = computed(() => {
    return alarms.value.filter((a) => a.status === 'unack');
  });

  const warningCount = computed(() => {
    return activeAlarms.value.filter((a) => a.level === 'warning').length;
  });

  const dangerCount = computed(() => {
    return activeAlarms.value.filter((a) => a.level === 'danger').length;
  });

  function updateData() {
    if (!isRunning.value) return;
    
    // 记录传感器历史
    pools.value.forEach((pool) => {
      // 记录水池传感器的历史
      pool.sensors.forEach((sensor) => {
        const key = `${pool.id}-${sensor.id}`;
        const existing = sensorHistories.value.get(key);
        const now = new Date();
        if (existing) {
          existing.data.push({ timestamp: now, value: sensor.value });
          if (existing.data.length > 50) {
            existing.data.shift();
          }
        } else {
          sensorHistories.value.set(key, {
            sensorId: sensor.id,
            sensorName: sensor.name,
            unit: sensor.unit,
            data: [{ timestamp: now, value: sensor.value }],
          });
        }
      });
      
      // 记录当前水位的历史（用于折线图展示）
      const levelKey = `${pool.id}-level`;
      const levelExisting = sensorHistories.value.get(levelKey);
      const now = new Date();
      if (levelExisting) {
        levelExisting.data.push({ timestamp: now, value: pool.currentLevel });
        if (levelExisting.data.length > 50) {
          levelExisting.data.shift();
        }
      } else {
        sensorHistories.value.set(levelKey, {
          sensorId: 'level',
          sensorName: '当前水位',
          unit: 'm',
          data: [{ timestamp: now, value: pool.currentLevel }],
        });
      }
    });
    
    pools.value = updatePoolData(pools.value);
    const newAlarms = checkAlarms(pools.value);
    alarms.value = [...alarms.value, ...newAlarms].slice(-50);
  }

  function getSensorHistory(poolId: string, sensorId: string): SensorHistory | undefined {
    return sensorHistories.value.get(`${poolId}-${sensorId}`);
  }

  function selectPool(id: string | null) {
    selectedPoolId.value = id;
  }

  function acknowledgeAlarm(alarmId: string) {
    const alarm = alarms.value.find((a) => a.id === alarmId);
    if (alarm) {
      alarm.status = 'ack';
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
    } else if (device.status === 'stopped' || device.status === 'offline' || device.status === 'fault') {
      device.status = 'running';
    }
    device.statusTime = new Date();
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
    getSensorHistory,
  };
});
