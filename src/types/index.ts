export interface PoolData {
  id: string;
  code: string;
  name: string;
  type: PoolType;
  capacity: number;
  maxLevel: number;
  warningLevel: number;
  lowWarningLevel: number;
  currentLevel: number;
  flowRate: number;
  status: 'normal' | 'warning' | 'danger';
  devices: Device[];
  parameters: Parameter[];
  position: { x: number; y: number };
}

export type PoolType =
  | 'collection'
  | 'grating'
  | 'regulation'
  | 'anaerobic'
  | 'anoxic'
  | 'aerobic'
  | 'membrane'
  | 'disinfection'
  | 'sludge';

export interface Device {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'fault';
  runtime: number;
}

export interface Parameter {
  id: string;
  name: string;
  value: number;
  unit: string;
  min: number;
  max: number;
  normalRange: [number, number];
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
  level: 'warning' | 'danger';
  message: string;
  timestamp: Date;
  acknowledged: boolean;
}

export interface DataPoint {
  timestamp: Date;
  value: number;
}

export interface ParameterHistory {
  paramId: string;
  paramName: string;
  unit: string;
  data: DataPoint[];
}
