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
  statusTime: Date;
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
  timestamp: Date;
  status: 'unack' | 'ack';
}

export interface DataPoint {
  timestamp: Date;
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
  startTime: Date;
  endTime: Date;
}

export interface DeviceStatusHistory {
  deviceId: string;
  deviceName: string;
  poolId: string;
  poolName: string;
  records: DeviceStatusRecord[];
}
