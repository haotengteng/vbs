import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PoolData, FlowPath, Alarm, SensorHistory, DeviceStatusHistory } from '@/types';
import { generateInitialPools, generateFlowPaths, updatePoolData, checkAlarms, generateDeviceStatusHistory } from '@/utils/mockData';

export const useProcessStore = defineStore('process', () => {
  const pools = ref<PoolData[]>(generateInitialPools());
  const flowPaths = ref<FlowPath[]>(generateFlowPaths());
  const alarms = ref<Alarm[]>([]);
  const selectedPoolId = ref<string | null>(null);
  const isRunning = ref(true);
  const sensorHistories = ref<Map<string, SensorHistory>>(new Map());
  const deviceStatusHistories = ref<Map<string, DeviceStatusHistory>>(new Map());

  // Initialize device status histories
  pools.value.forEach((pool) => {
    pool.devices.forEach((device) => {
      const key = `${pool.id}-${device.id}`;
      deviceStatusHistories.value.set(
        key,
        generateDeviceStatusHistory(device.id, device.name, pool.id, pool.name, device.status, 24)
      );
    });
  });

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

    // Snapshot current device statuses to detect changes
    const oldStatuses = new Map<string, string>();
    pools.value.forEach((pool) => {
      pool.devices.forEach((device) => {
        oldStatuses.set(`${pool.id}-${device.id}`, device.status);
      });
    });

    // Record sensor history
    pools.value.forEach((pool) => {
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

    // Update device status histories after data update
    pools.value.forEach((pool) => {
      pool.devices.forEach((device) => {
        const key = `${pool.id}-${device.id}`;
        const oldStatus = oldStatuses.get(key);
        const history = deviceStatusHistories.value.get(key);
        const now = new Date();

        if (!history) {
          // Should not happen, but initialize just in case
          deviceStatusHistories.value.set(
            key,
            generateDeviceStatusHistory(device.id, device.name, pool.id, pool.name, device.status, 24)
          );
          return;
        }

        if (oldStatus !== device.status) {
          // Status changed: close previous record and start new one
          if (history.records.length > 0) {
            history.records[history.records.length - 1].endTime = now;
          }
          history.records.push({
            status: device.status,
            startTime: now,
            endTime: now,
          });
        } else {
          // Extend current record
          if (history.records.length > 0) {
            history.records[history.records.length - 1].endTime = now;
          }
        }
      });
    });

    const newAlarms = checkAlarms(pools.value);
    alarms.value = [...alarms.value, ...newAlarms].slice(-50);
  }

  function getSensorHistory(poolId: string, sensorId: string): SensorHistory | undefined {
    return sensorHistories.value.get(`${poolId}-${sensorId}`);
  }

  function getDeviceStatusHistory(poolId: string, deviceId: string): DeviceStatusHistory | undefined {
    const key = `${poolId}-${deviceId}`;
    let history = deviceStatusHistories.value.get(key);
    
    // 如果没有找到历史记录，尝试动态生成
    if (!history) {
      const pool = pools.value.find((p) => p.id === poolId);
      if (pool) {
        const device = pool.devices.find((d) => d.id === deviceId);
        if (device) {
          history = generateDeviceStatusHistory(device.id, device.name, pool.id, pool.name, device.status, 24);
          deviceStatusHistories.value.set(key, history);
        }
      }
    }
    
    return history;
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

    const now = new Date();
    const key = `${poolId}-${deviceId}`;
    const history = deviceStatusHistories.value.get(key);

    if (device.status === 'running') {
      device.status = 'stopped';
    } else if (device.status === 'stopped' || device.status === 'offline' || device.status === 'fault') {
      device.status = 'running';
    }
    device.statusTime = now;

    if (history) {
      if (history.records.length > 0) {
        history.records[history.records.length - 1].endTime = now;
      }
      history.records.push({
        status: device.status,
        startTime: now,
        endTime: now,
      });
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
    getSensorHistory,
    getDeviceStatusHistory,
  };
});
