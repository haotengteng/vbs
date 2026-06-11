import type { PoolData, FlowPath, Alarm, DeviceStatusHistory } from '@/types';

const poolConfigs: {
  id: string;
  code: string;
  name: string;
  capacity: number;
  maxLevel: number;
}[] = [
  // 第一行：预处理
  { id: 'pool-1', code: 'P-001', name: '集水池', capacity: 800, maxLevel: 5.0 },
  { id: 'pool-2', code: 'P-002', name: '格栅渠', capacity: 200, maxLevel: 2.5 },
  { id: 'pool-3', code: 'P-003', name: '调节池', capacity: 1200, maxLevel: 6.0 },
  // 第二行：生化处理
  { id: 'pool-5', code: 'P-005', name: '缺氧池', capacity: 500, maxLevel: 4.0 },
  { id: 'pool-4', code: 'P-004', name: '厌氧池', capacity: 600, maxLevel: 4.5 },
  { id: 'pool-9', code: 'P-009', name: '污泥浓缩池', capacity: 250, maxLevel: 3.5 },
  // 第三行：后续处理
  { id: 'pool-6', code: 'P-006', name: '好氧池', capacity: 800, maxLevel: 4.5 },
  { id: 'pool-7', code: 'P-007', name: '膜池', capacity: 400, maxLevel: 4.0 },
  { id: 'pool-8', code: 'P-008', name: '消毒池', capacity: 300, maxLevel: 3.5 },
];

/** 前端维护的水池拓扑图位置坐标 */
export const poolPositions: Record<string, { x: number; y: number }> = {
  'pool-1': { x: 80, y: 80 },
  'pool-2': { x: 340, y: 80 },
  'pool-3': { x: 600, y: 80 },
  'pool-4': { x: 600, y: 300 },
  'pool-5': { x: 340, y: 300 },
  'pool-6': { x: 340, y: 520 },
  'pool-7': { x: 600, y: 520 },
  'pool-8': { x: 860, y: 520 },
  'pool-9': { x: 860, y: 300 },
};

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getDeviceStatus(): 'running' | 'stopped' | 'fault' | 'offline' {
  const rand = Math.random();
  if (rand > 0.97) return 'fault';
  if (rand > 0.92) return 'offline';
  if (rand > 0.15) return 'running';
  return 'stopped';
}

export function generateInitialPools(): PoolData[] {
  return poolConfigs.map((config) => {
    const currentLevel = randomInRange(config.maxLevel * 0.4, config.maxLevel * 1.1);
    const levelMin = 0.5;
    const levelMax = config.maxLevel * 0.9;
    
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    if (currentLevel > config.maxLevel) {
      status = 'danger';
    } else if (currentLevel > levelMax) {
      status = 'warning';
    } else if (currentLevel < levelMin) {
      status = 'danger';
    }

    const devices: PoolData['devices'] = [];
    const sensors: PoolData['sensors'] = [];

    switch (config.id) {
      case 'pool-1':
        devices.push(
          { id: 'd-1-1', name: '进水泵1#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-1-2', name: '进水泵2#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-1-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax }
        );
        break;
      case 'pool-2':
        devices.push(
          { id: 'd-2-1', name: '格栅机', type: 'grating_machine', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-2-2', name: '输送机', type: 'conveyor', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-2-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax }
        );
        break;
      case 'pool-3':
        devices.push(
          { id: 'd-3-1', name: '提升泵1#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-3-2', name: '提升泵2#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-3-3', name: '推流搅拌器', type: 'mixer', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-3-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-3-2', name: '流量', value: randomInRange(80, 150), unit: 'm³/h', min: 80, max: 150 }
        );
        break;
      case 'pool-4':
        devices.push(
          { id: 'd-4-1', name: '循环泵1#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-4-2', name: '循环泵2#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-4-3', name: '蒸汽加热器', type: 'heater', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-4-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-4-2', name: '温度', value: randomInRange(30, 38), unit: '°C', min: 30, max: 38 },
          { id: 'p-4-3', name: 'PH值', value: randomInRange(6.5, 7.5), unit: '', min: 6.5, max: 7.5 },
          { id: 'p-4-4', name: '溶解氧', value: randomInRange(0.05, 0.18), unit: 'mg/L', min: 0, max: 0.2 },
          { id: 'p-4-5', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 3000, max: 5000 }
        );
        break;
      case 'pool-5':
        devices.push(
          { id: 'd-5-1', name: '潜水推流器1#', type: 'mixer', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-5-2', name: '潜水推流器2#', type: 'mixer', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-5-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-5-2', name: '溶解氧', value: randomInRange(0.2, 0.5), unit: 'mg/L', min: 0.2, max: 0.5 },
          { id: 'p-5-3', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 3000, max: 5000 },
          { id: 'p-5-4', name: 'PH值', value: randomInRange(6.8, 7.8), unit: '', min: 6.8, max: 7.8 }
        );
        break;
      case 'pool-6':
        devices.push(
          { id: 'd-6-1', name: '曝气风机1#', type: 'blower', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-6-2', name: '曝气风机2#', type: 'blower', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-6-3', name: '硝化液回流泵', type: 'pump', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-6-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-6-2', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 3000, max: 5000 },
          { id: 'p-6-3', name: 'PH值', value: randomInRange(7.0, 8.0), unit: '', min: 7.0, max: 8.0 }
        );
        break;
      case 'pool-7':
        devices.push(
          { id: 'd-7-1', name: '污泥回流泵', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-7-2', name: '自吸泵1#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-7-3', name: '自吸泵2#', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-7-4', name: '反洗泵', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-7-5', name: '电动阀', type: 'valve', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-7-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-7-2', name: '污泥浓度', value: randomInRange(8000, 12000), unit: 'mg/L', min: 8000, max: 12000 },
          { id: 'p-7-3', name: '跨膜压差', value: randomInRange(10, 28), unit: 'kPa', min: 0, max: 30 }
        );
        break;
      case 'pool-8':
        devices.push(
          { id: 'd-8-1', name: '消毒加药器1#', type: 'dosing', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-8-2', name: '消毒加药器2#', type: 'dosing', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-8-3', name: '出水泵', type: 'pump', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-8-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-8-2', name: '余氯', value: randomInRange(0.5, 4.0), unit: 'mg/L', min: 0.5, max: 4.0 }
        );
        break;
      case 'pool-9':
        devices.push(
          { id: 'd-9-1', name: '污泥界面仪', type: 'sensor', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-9-2', name: '污泥泵', type: 'pump', status: getDeviceStatus(), statusTime: new Date() },
          { id: 'd-9-3', name: '脱水机', type: 'dehydrator', status: getDeviceStatus(), statusTime: new Date() }
        );
        sensors.push(
          { id: 'p-9-1', name: '液位', value: currentLevel, unit: 'm', min: levelMin, max: levelMax },
          { id: 'p-9-2', name: '污泥浓度', value: randomInRange(8000, 12000), unit: 'mg/L', min: 8000, max: 12000 }
        );
        break;
    }

    return {
      ...config,
      currentLevel,
      flowRate: randomInRange(50, 200),
      status,
      devices,
      sensors,
    };
  });
}

export function generateDeviceStatusHistory(
  deviceId: string,
  deviceName: string,
  poolId: string,
  poolName: string,
  currentStatus: 'running' | 'stopped' | 'fault' | 'offline',
  hours: number = 24
): DeviceStatusHistory {
  const records: DeviceStatusHistory['records'] = [];
  const now = new Date();
  let currentTime = new Date(now.getTime() - hours * 60 * 60 * 1000);
  const statuses: Array<'running' | 'stopped' | 'fault' | 'offline'> = ['running', 'stopped', 'fault', 'offline'];

  while (currentTime < now) {
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const duration = Math.floor(randomInRange(30, 150)) * 60 * 1000; // 30-150 minutes
    const endTime = new Date(Math.min(currentTime.getTime() + duration, now.getTime()));
    records.push({
      status,
      startTime: new Date(currentTime),
      endTime: new Date(endTime),
    });
    currentTime = endTime;
  }

  // Ensure last record matches current status and ends at now
  if (records.length > 0) {
    records[records.length - 1].status = currentStatus;
    records[records.length - 1].endTime = now;
  } else {
    records.push({
      status: currentStatus,
      startTime: new Date(now.getTime() - hours * 60 * 60 * 1000),
      endTime: now,
    });
  }

  return {
    deviceId,
    deviceName,
    poolId,
    poolName,
    records,
  };
}

export function generateFlowPaths(): FlowPath[] {
  return [
    // 第一行：预处理流程（智能自动：右→左）
    { id: 'f-1', from: 'pool-1', to: 'pool-2', type: 'forward', active: true },
    { id: 'f-2', from: 'pool-2', to: 'pool-3', type: 'forward', active: true },
    // 第二行：生化处理（智能自动：右→左）
    { id: 'f-3', from: 'pool-5', to: 'pool-4', type: 'forward', active: true },
    // 第三行：后续处理（智能自动：右→左）
    { id: 'f-4', from: 'pool-6', to: 'pool-7', type: 'forward', active: true },
    { id: 'f-5', from: 'pool-7', to: 'pool-9', type: 'forward', active: true },
    // 纵向连接（智能自动：调节池在厌氧池上方 → 底→顶）
    { id: 'f-6', from: 'pool-3', to: 'pool-4', type: 'forward', active: true },
    { id: 'f-7', from: 'pool-4', to: 'pool-7', type: 'forward', active: true },
    { id: 'f-8', from: 'pool-7', to: 'pool-8', type: 'forward', active: true },
    // 内部循环
    { id: 'f-9', from: 'pool-4', to: 'pool-4', type: 'internal', active: true },
    // 回流管线（智能自动选择最优方向）
    { id: 'f-10', from: 'pool-6', to: 'pool-5', type: 'recycle', active: true },
    { id: 'f-11', from: 'pool-7', to: 'pool-4', type: 'recycle', active: true },
    { id: 'f-12', from: 'pool-9', to: 'pool-3', type: 'recycle', active: true, fromSide: 'top', toSide: 'right' },
  ];
}

export function updatePoolData(pools: PoolData[]): PoolData[] {
  return pools.map((pool) => {
    const newLevel = pool.currentLevel + randomInRange(-0.1, 0.15);
    const clampedLevel = Math.max(0.1, Math.min(pool.maxLevel, newLevel));
    
    const levelSensor = pool.sensors.find((s) => s.name === '液位');
    const levelMin = levelSensor?.min ?? 0.5;
    const levelMax = levelSensor?.max ?? pool.maxLevel * 0.9;
    
    let newStatus: 'normal' | 'warning' | 'danger' = 'normal';
    if (clampedLevel > pool.maxLevel) {
      newStatus = 'danger';
    } else if (clampedLevel > levelMax) {
      newStatus = 'warning';
    } else if (clampedLevel < levelMin) {
      newStatus = 'danger';
    }

    const updatedSensors = pool.sensors.map((sensor) => {
      if (sensor.name === '液位') {
        return { ...sensor, value: clampedLevel };
      }
      const fluctuation = randomInRange(-sensor.value * 0.05, sensor.value * 0.05);
      const range = sensor.max - sensor.min;
      const lowerBound = Math.max(0, sensor.min - range);
      const upperBound = sensor.max + range;
      const newValue = Math.max(lowerBound, Math.min(upperBound, sensor.value + fluctuation));
      return { ...sensor, value: newValue };
    });

    const updatedDevices = pool.devices.map((device) => {
      if (Math.random() > 0.98) {
        const statuses: Array<'running' | 'stopped' | 'fault' | 'offline'> = ['running', 'stopped', 'fault', 'offline'];
        return { ...device, status: statuses[Math.floor(Math.random() * statuses.length)], statusTime: new Date() };
      }
      return device;
    });

    return {
      ...pool,
      currentLevel: clampedLevel,
      flowRate: Math.max(0, pool.flowRate + randomInRange(-5, 8)),
      status: newStatus,
      sensors: updatedSensors,
      devices: updatedDevices,
    };
  });
}

export function checkAlarms(pools: PoolData[]): Alarm[] {
  const alarms: Alarm[] = [];
  pools.forEach((pool) => {
    const levelSensor = pool.sensors.find((s) => s.name === '液位');
    const levelMin = levelSensor?.min ?? 0.5;
    const levelMax = levelSensor?.max ?? pool.maxLevel * 0.9;

    // 高液位告警（基于液位传感器的 max）
    if (pool.currentLevel > levelMax) {
      alarms.push({
        id: `alarm-${pool.id}-${Date.now()}`,
        poolId: pool.id,
poolName: pool.name,
level: pool.currentLevel > pool.maxLevel ? 'danger' : 'warning',
        message: `${pool.name} 高液位告警: ${pool.currentLevel.toFixed(2)}m`,
        timestamp: new Date(),
        status: 'unack',
      });
    }
    // 低液位告警（基于液位传感器的 min）
    if (pool.currentLevel < levelMin) {
      alarms.push({
        id: `alarm-${pool.id}-low-${Date.now()}`,
        poolId: pool.id,
poolName: pool.name,
level: 'danger',
        message: `${pool.name} 低液位告警: ${pool.currentLevel.toFixed(2)}m`,
        timestamp: new Date(),
        status: 'unack',
      });
    }

    // 传感器异常告警
    pool.sensors.forEach((sensor) => {
      if (sensor.name === '液位' || sensor.name === '水位占比') return;
      
      const minNormal = sensor.min;
      const maxNormal = sensor.max;
      if (sensor.value < minNormal || sensor.value > maxNormal) {
        const isHigh = sensor.value > maxNormal;
        alarms.push({
          id: `alarm-${pool.id}-${sensor.id}-${Date.now()}`,
          poolId: pool.id,
poolName: pool.name,
level: 'warning',
          message: `${pool.name} ${sensor.name}${isHigh ? '过高' : '过低'}: ${sensor.value.toFixed(2)}${sensor.unit}`,
          timestamp: new Date(),
          status: 'unack',
        });
      }
    });

    // 设备故障告警
    pool.devices.forEach((device) => {
      if (device.status === 'fault') {
        alarms.push({
          id: `alarm-${device.id}-${Date.now()}`,
          poolId: pool.id,
poolName: pool.name,
level: 'danger',
          message: `${pool.name} ${device.name} 故障`,
          timestamp: new Date(),
          status: 'unack',
        });
      }
    });
  });
  return alarms;
}
