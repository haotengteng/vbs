import type { PoolData, FlowPath, Alarm, PoolType } from '@/types';

const poolConfigs: {
  id: string;
  code: string;
  name: string;
  type: PoolType;
  capacity: number;
  maxLevel: number;
  warningLevel: number;
  lowWarningLevel: number;
  position: { x: number; y: number };
}[] = [
  // 第一行：预处理
  { id: 'pool-1', code: 'P-001', name: '集水池', type: 'collection', capacity: 800, maxLevel: 5.0, warningLevel: 4.5, lowWarningLevel: 0.5, position: { x: 80, y: 80 } },
  { id: 'pool-2', code: 'P-002', name: '格栅渠', type: 'grating', capacity: 200, maxLevel: 2.5, warningLevel: 2.2, lowWarningLevel: 0.5, position: { x: 340, y: 80 } },
  { id: 'pool-3', code: 'P-003', name: '调节池', type: 'regulation', capacity: 1200, maxLevel: 6.0, warningLevel: 5.5, lowWarningLevel: 0.5, position: { x: 600, y: 80 } },
  // 第二行：生化处理
  { id: 'pool-5', code: 'P-005', name: '缺氧池', type: 'anoxic', capacity: 500, maxLevel: 4.0, warningLevel: 3.6, lowWarningLevel: 0.5, position: { x: 340, y: 300 } },
  { id: 'pool-4', code: 'P-004', name: '厌氧池', type: 'anaerobic', capacity: 600, maxLevel: 4.5, warningLevel: 4.0, lowWarningLevel: 0.5, position: { x: 600, y: 300 } },
  { id: 'pool-9', code: 'P-009', name: '污泥浓缩池', type: 'sludge', capacity: 250, maxLevel: 3.5, warningLevel: 3.0, lowWarningLevel: 0.5, position: { x: 860, y: 300 } },
  // 第三行：后续处理
  { id: 'pool-6', code: 'P-006', name: '好氧池', type: 'aerobic', capacity: 800, maxLevel: 4.5, warningLevel: 4.0, lowWarningLevel: 0.5, position: { x: 340, y: 520 } },
  { id: 'pool-7', code: 'P-007', name: '膜池', type: 'membrane', capacity: 400, maxLevel: 4.0, warningLevel: 3.5, lowWarningLevel: 0.5, position: { x: 600, y: 520 } },
  { id: 'pool-8', code: 'P-008', name: '消毒池', type: 'disinfection', capacity: 300, maxLevel: 3.5, warningLevel: 3.0, lowWarningLevel: 0.5, position: { x: 860, y: 520 } },
];

function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function getDeviceStatus(): 'running' | 'stopped' | 'fault' {
  const rand = Math.random();
  if (rand > 0.95) return 'fault';
  if (rand > 0.15) return 'running';
  return 'stopped';
}

export function generateInitialPools(): PoolData[] {
  return poolConfigs.map((config) => {
    const currentLevel = randomInRange(config.maxLevel * 0.4, config.maxLevel * 0.85);
    let status: 'normal' | 'warning' | 'danger' = 'normal';
    if (currentLevel > config.warningLevel) {
      status = 'warning';
    } else if (currentLevel < config.lowWarningLevel) {
      status = 'danger';
    }

    const devices: PoolData['devices'] = [];
    const parameters: PoolData['parameters'] = [];

    switch (config.type) {
      case 'collection':
        devices.push(
          { id: 'd-1-1', name: '进水泵1#', type: 'pump', status: getDeviceStatus(), runtime: 1200 },
          { id: 'd-1-2', name: '进水泵2#', type: 'pump', status: getDeviceStatus(), runtime: 800 }
        );
        parameters.push(
          { id: 'p-1-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] }
        );
        break;
      case 'grating':
        devices.push(
          { id: 'd-2-1', name: '格栅机', type: 'grating_machine', status: getDeviceStatus(), runtime: 2400 },
          { id: 'd-2-2', name: '输送机', type: 'conveyor', status: getDeviceStatus(), runtime: 1800 }
        );
        parameters.push(
          { id: 'p-2-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] }
        );
        break;
      case 'regulation':
        devices.push(
          { id: 'd-3-1', name: '提升泵1#', type: 'pump', status: getDeviceStatus(), runtime: 1500 },
          { id: 'd-3-2', name: '提升泵2#', type: 'pump', status: getDeviceStatus(), runtime: 900 },
          { id: 'd-3-3', name: '推流搅拌器', type: 'mixer', status: getDeviceStatus(), runtime: 2000 }
        );
        parameters.push(
          { id: 'p-3-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-3-2', name: '流量', value: randomInRange(80, 150), unit: 'm³/h', min: 0, max: 200, normalRange: [80, 150] }
        );
        break;
      case 'anaerobic':
        devices.push(
          { id: 'd-4-1', name: '循环泵1#', type: 'pump', status: getDeviceStatus(), runtime: 3000 },
          { id: 'd-4-2', name: '循环泵2#', type: 'pump', status: getDeviceStatus(), runtime: 2500 },
          { id: 'd-4-3', name: '蒸汽加热器', type: 'heater', status: getDeviceStatus(), runtime: 1800 }
        );
        parameters.push(
          { id: 'p-4-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-4-2', name: '温度', value: randomInRange(30, 38), unit: '°C', min: 0, max: 50, normalRange: [30, 38] },
          { id: 'p-4-3', name: 'PH值', value: randomInRange(6.5, 7.5), unit: '', min: 0, max: 14, normalRange: [6.5, 7.5] },
          { id: 'p-4-4', name: '溶解氧', value: randomInRange(0.05, 0.18), unit: 'mg/L', min: 0, max: 2, normalRange: [0, 0.2] },
          { id: 'p-4-5', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 0, max: 8000, normalRange: [3000, 5000] }
        );
        break;
      case 'anoxic':
        devices.push(
          { id: 'd-5-1', name: '潜水推流器1#', type: 'mixer', status: getDeviceStatus(), runtime: 2200 },
          { id: 'd-5-2', name: '潜水推流器2#', type: 'mixer', status: getDeviceStatus(), runtime: 1900 }
        );
        parameters.push(
          { id: 'p-5-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-5-2', name: '溶解氧', value: randomInRange(0.2, 0.5), unit: 'mg/L', min: 0, max: 2, normalRange: [0.2, 0.5] },
          { id: 'p-5-3', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 0, max: 8000, normalRange: [3000, 5000] },
          { id: 'p-5-4', name: 'PH值', value: randomInRange(6.8, 7.8), unit: '', min: 0, max: 14, normalRange: [6.8, 7.8] }
        );
        break;
      case 'aerobic':
        devices.push(
          { id: 'd-6-1', name: '曝气风机1#', type: 'blower', status: getDeviceStatus(), runtime: 3500 },
          { id: 'd-6-2', name: '曝气风机2#', type: 'blower', status: getDeviceStatus(), runtime: 2800 },
          { id: 'd-6-3', name: '硝化液回流泵', type: 'pump', status: getDeviceStatus(), runtime: 2000 }
        );
        parameters.push(
          { id: 'p-6-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-6-2', name: '污泥浓度', value: randomInRange(3000, 5000), unit: 'mg/L', min: 0, max: 8000, normalRange: [3000, 5000] },
          { id: 'p-6-3', name: 'PH值', value: randomInRange(7.0, 8.0), unit: '', min: 0, max: 14, normalRange: [7.0, 8.0] }
        );
        break;
      case 'membrane':
        devices.push(
          { id: 'd-7-1', name: '污泥回流泵', type: 'pump', status: getDeviceStatus(), runtime: 2600 },
          { id: 'd-7-2', name: '自吸泵1#', type: 'pump', status: getDeviceStatus(), runtime: 2100 },
          { id: 'd-7-3', name: '自吸泵2#', type: 'pump', status: getDeviceStatus(), runtime: 1800 },
          { id: 'd-7-4', name: '反洗泵', type: 'pump', status: getDeviceStatus(), runtime: 500 },
          { id: 'd-7-5', name: '电动阀', type: 'valve', status: getDeviceStatus(), runtime: 3000 }
        );
        parameters.push(
          { id: 'p-7-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-7-2', name: '污泥浓度', value: randomInRange(8000, 12000), unit: 'mg/L', min: 0, max: 15000, normalRange: [8000, 12000] },
          { id: 'p-7-3', name: '跨膜压差', value: randomInRange(10, 28), unit: 'kPa', min: 0, max: 50, normalRange: [0, 30] }
        );
        break;
      case 'disinfection':
        devices.push(
          { id: 'd-8-1', name: '消毒加药器1#', type: 'dosing', status: getDeviceStatus(), runtime: 1500 },
          { id: 'd-8-2', name: '消毒加药器2#', type: 'dosing', status: getDeviceStatus(), runtime: 1200 },
          { id: 'd-8-3', name: '出水泵', type: 'pump', status: getDeviceStatus(), runtime: 2000 }
        );
        parameters.push(
          { id: 'p-8-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-8-2', name: '余氯', value: randomInRange(0.5, 4.0), unit: 'mg/L', min: 0, max: 10, normalRange: [0.5, 4.0] }
        );
        break;
      case 'sludge':
        devices.push(
          { id: 'd-9-1', name: '污泥界面仪', type: 'sensor', status: getDeviceStatus(), runtime: 4000 },
          { id: 'd-9-2', name: '污泥泵', type: 'pump', status: getDeviceStatus(), runtime: 1000 },
          { id: 'd-9-3', name: '脱水机', type: 'dehydrator', status: getDeviceStatus(), runtime: 800 }
        );
        parameters.push(
          { id: 'p-9-1', name: '液位', value: currentLevel, unit: 'm', min: 0, max: config.maxLevel, normalRange: [config.lowWarningLevel, config.warningLevel] },
          { id: 'p-9-2', name: '污泥浓度', value: randomInRange(8000, 12000), unit: 'mg/L', min: 0, max: 15000, normalRange: [8000, 12000] }
        );
        break;
    }

    return {
      ...config,
      currentLevel,
      flowRate: randomInRange(50, 200),
      status,
      devices,
      parameters,
    };
  });
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
    let newStatus: 'normal' | 'warning' | 'danger' = 'normal';
    if (clampedLevel > pool.warningLevel) {
      newStatus = 'warning';
    } else if (clampedLevel < pool.lowWarningLevel) {
      newStatus = 'danger';
    }

    const updatedParameters = pool.parameters.map((param) => {
      if (param.name === '液位') {
        return { ...param, value: clampedLevel };
      }
      const fluctuation = randomInRange(-param.value * 0.05, param.value * 0.05);
      const newValue = Math.max(param.min, Math.min(param.max, param.value + fluctuation));
      return { ...param, value: newValue };
    });

    const updatedDevices = pool.devices.map((device) => {
      if (Math.random() > 0.98) {
        const statuses: Array<'running' | 'stopped' | 'fault'> = ['running', 'stopped', 'fault'];
        return { ...device, status: statuses[Math.floor(Math.random() * statuses.length)] };
      }
      return device;
    });

    return {
      ...pool,
      currentLevel: clampedLevel,
      flowRate: Math.max(0, pool.flowRate + randomInRange(-5, 8)),
      status: newStatus,
      parameters: updatedParameters,
      devices: updatedDevices,
    };
  });
}

export function checkAlarms(pools: PoolData[]): Alarm[] {
  const alarms: Alarm[] = [];
  pools.forEach((pool) => {
    // 高液位告警
    if (pool.currentLevel > pool.warningLevel) {
      alarms.push({
        id: `alarm-${pool.id}-${Date.now()}`,
        poolId: pool.id,
        level: pool.currentLevel > pool.maxLevel ? 'danger' : 'warning',
        message: `${pool.name} 高液位告警: ${pool.currentLevel.toFixed(2)}m`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }
    // 低液位告警
    if (pool.currentLevel < pool.lowWarningLevel) {
      alarms.push({
        id: `alarm-${pool.id}-low-${Date.now()}`,
        poolId: pool.id,
        level: 'danger',
        message: `${pool.name} 低液位告警: ${pool.currentLevel.toFixed(2)}m`,
        timestamp: new Date(),
        acknowledged: false,
      });
    }

    // 参数异常告警
    pool.parameters.forEach((param) => {
      if (param.name === '液位' || param.name === '水位占比') return;
      
      const [minNormal, maxNormal] = param.normalRange;
      if (param.value < minNormal || param.value > maxNormal) {
        const isHigh = param.value > maxNormal;
        alarms.push({
          id: `alarm-${pool.id}-${param.id}-${Date.now()}`,
          poolId: pool.id,
          level: 'warning',
          message: `${pool.name} ${param.name}${isHigh ? '过高' : '过低'}: ${param.value.toFixed(2)}${param.unit}`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }
    });

    // 设备故障告警
    pool.devices.forEach((device) => {
      if (device.status === 'fault') {
        alarms.push({
          id: `alarm-${device.id}-${Date.now()}`,
          poolId: pool.id,
          level: 'danger',
          message: `${pool.name} ${device.name} 故障`,
          timestamp: new Date(),
          acknowledged: false,
        });
      }
    });
  });
  return alarms;
}
