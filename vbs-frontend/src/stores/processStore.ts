import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { PoolData, FlowPath, Alarm, SensorHistory, DeviceStatusHistory, DashboardStats, MonitorItem } from '@/types';
import { generateFlowPaths } from '@/utils/mockData';
import * as api from '@/api';

export const useProcessStore = defineStore('process', () => {
  const pools = ref<PoolData[]>([]);
  const flowPaths = ref<FlowPath[]>(generateFlowPaths());
  const alarms = ref<Alarm[]>([]);
  const selectedPoolId = ref<string | null>(null);
  const isRunning = ref(true);
  const sensorHistories = ref<Map<string, SensorHistory>>(new Map());
  const deviceStatusHistories = ref<Map<string, DeviceStatusHistory>>(new Map());
  const dashboardStats = ref<DashboardStats | null>(null);
  const monitorItems = ref<MonitorItem[]>([]);

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

  async function fetchPools() {
    try {
      pools.value = await api.getPools();
    } catch (e) {
      console.error('Failed to fetch pools:', e);
    }
  }

  async function fetchAlarms() {
    try {
      alarms.value = await api.getUnackAlarms();
    } catch (e) {
      console.error('Failed to fetch alarms:', e);
    }
  }

  async function fetchDashboardStats() {
    try {
      dashboardStats.value = await api.getDashboardStats();
    } catch (e) {
      console.error('Failed to fetch dashboard stats:', e);
    }
  }

  async function fetchMonitorItems() {
    try {
      monitorItems.value = await api.getMonitorItems();
    } catch (e) {
      console.error('Failed to fetch monitor items:', e);
    }
  }

  async function updateData() {
    if (!isRunning.value) return;
    await Promise.all([fetchPools(), fetchAlarms(), fetchDashboardStats(), fetchMonitorItems()]);
  }

  async function getSensorHistory(poolId: string, sensorId: string, hours: number = 3): Promise<SensorHistory | undefined> {
    const key = `${poolId}-${sensorId}`;
    try {
      const data = await api.getSensorHistory(sensorId, hours, 5);
      const pool = pools.value.find((p) => p.id === poolId);
      let sensorName = sensorId;
      let unit = '';
      if (pool) {
        if (sensorId === 'level') {
          sensorName = '当前水位';
          unit = 'm';
        } else {
          const sensor = pool.sensors.find((s) => s.id === sensorId);
          if (sensor) {
            sensorName = sensor.name;
            unit = sensor.unit;
          }
        }
      }
      const history: SensorHistory = {
        sensorId,
        sensorName,
        unit,
        data,
      };
      sensorHistories.value.set(key, history);
      return history;
    } catch (e) {
      console.error('Failed to fetch sensor history:', e);
      return undefined;
    }
  }

  async function getDeviceStatusHistory(poolId: string, deviceId: string, hours: number = 3): Promise<DeviceStatusHistory | undefined> {
    const key = `${poolId}-${deviceId}`;
    try {
      const records = await api.getDeviceHistory(deviceId, hours);
      const pool = pools.value.find((p) => p.id === poolId);
      let deviceName = deviceId;
      if (pool) {
        const device = pool.devices.find((d) => d.id === deviceId);
        if (device) deviceName = device.name;
      }
      const history: DeviceStatusHistory = {
        deviceId,
        deviceName,
        poolId,
        poolName: pool?.name || '',
        records,
      };
      deviceStatusHistories.value.set(key, history);
      return history;
    } catch (e) {
      console.error('Failed to fetch device history:', e);
      return undefined;
    }
  }

  function selectPool(id: string | null) {
    selectedPoolId.value = id;
  }

  async function acknowledgeAlarm(alarmId: string) {
    try {
      await api.acknowledgeAlarm(alarmId);
      const alarm = alarms.value.find((a) => a.id === alarmId);
      if (alarm) {
        alarm.status = 'ack';
      }
    } catch (e) {
      console.error('Failed to acknowledge alarm:', e);
    }
  }

  function toggleRunning() {
    isRunning.value = !isRunning.value;
  }

  async function toggleDeviceStatus(poolId: string, deviceId: string) {
    const pool = pools.value.find((p) => p.id === poolId);
    if (!pool) return;
    const device = pool.devices.find((d) => d.id === deviceId);
    if (!device) return;

    const operation = device.status === 'running' ? 'stop' : 'start';
    try {
      await api.sendDeviceCommand({ deviceId, operation });
      await fetchPools();
    } catch (e) {
      console.error('Failed to send device command:', e);
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
    sensorHistories,
    deviceStatusHistories,
    dashboardStats,
    monitorItems,
    updateData,
    selectPool,
    acknowledgeAlarm,
    toggleRunning,
    toggleDeviceStatus,
    getSensorHistory,
    getDeviceStatusHistory,
    fetchPools,
    fetchAlarms,
    fetchDashboardStats,
    fetchMonitorItems,
  };
});
