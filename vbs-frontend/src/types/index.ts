export interface PoolData {
  id: string;
  code: string;
  name: string;
  capacity: number;
  maxLevel: number;
  currentLevel: number;
  flowRate: number;
  status: 'normal' | 'warning' | 'danger';
  devices: Device[];
  sensors: Sensor[];
}

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'fault' | 'offline';
  statusTime: string;
}

export interface Sensor {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
}

export type ConnectionSide = 'top' | 'bottom' | 'left' | 'right';

export interface FlowPath {
  id: string;
  from: string;
  to: string;
  type: 'forward' | 'recycle' | 'internal';
  active: boolean;
  fromSide?: ConnectionSide;
  toSide?: ConnectionSide;
}

export interface Alarm {
  id: string;
  poolId: string;
  poolName: string;
  level: 'warning' | 'danger';
  message: string;
  timestamp: string;
  status: 'unack' | 'ack';
}

export interface DataPoint {
  timestamp: string;
  value: number;
}

export interface SensorHistory {
  sensorId: string;
  sensorName: string;
  unit: string;
  data: DataPoint[];
}

export interface DeviceStatusRecord {
  status: 'running' | 'stopped' | 'fault' | 'offline';
  startTime: string;
  endTime: string;
}

export interface DeviceStatusHistory {
  deviceId: string;
  deviceName: string;
  poolId: string;
  poolName: string;
  records: DeviceStatusRecord[];
}

export interface DashboardStats {
  totalPools: number;
  runningDevices: number;
  faultDevices: number;
  deviceCategories: { name: string; value: number }[];
}

export interface MonitorItem {
  label: string;
  value: string;
  unit: string;
  status: 'normal' | 'warning' | 'danger';
  icon: string;
}
