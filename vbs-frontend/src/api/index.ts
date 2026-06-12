import client from './client';
import type {
  PoolData,
  Alarm,
  SensorHistory,
  DeviceStatusHistory,
  DashboardStats,
  MonitorItem,
  DataPoint,
  DeviceStatusRecord,
} from '@/types';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  realName: string;
  role: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface PageResult<T> {
  total: number;
  page: number;
  size: number;
  list: T[];
}

export interface DeviceCommandRequest {
  deviceId: string;
  operation: string;
}

export interface DeviceCommandResponse {
  id: number;
  deviceId: string;
  deviceName: string;
  operation: string;
  result: string;
  operator: string;
  createTime: string;
}

export interface DeviceDto {
  id: string;
  name: string;
  type: string;
  status: 'running' | 'stopped' | 'fault' | 'offline';
  statusTime: string;
}

export interface AlarmStats {
  warning: number;
  danger: number;
  total: number;
}

// Auth
export async function login(request: LoginRequest): Promise<LoginResponse> {
  const res = await client.post<ApiResponse<LoginResponse>>('/auth/login', request);
  return res.data.data;
}

export async function logout(): Promise<void> {
  await client.post<ApiResponse<void>>('/auth/logout');
}

export async function refreshToken(token: string): Promise<{ token: string }> {
  const res = await client.post<ApiResponse<{ token: string }>>('/auth/refresh', null, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data.data;
}

// Pools
export async function getPools(): Promise<PoolData[]> {
  const res = await client.get<ApiResponse<PoolData[]>>('/pools');
  return res.data.data;
}

export async function getPoolById(poolId: string): Promise<PoolData> {
  const res = await client.get<ApiResponse<PoolData>>(`/pools/${poolId}`);
  return res.data.data;
}

// Devices
export async function getDevices(params?: {
  poolId?: string;
  status?: string;
  page?: number;
  size?: number;
}): Promise<PageResult<DeviceDto>> {
  const res = await client.get<ApiResponse<PageResult<DeviceDto>>>('/devices', { params });
  return res.data.data;
}

export async function getDeviceById(deviceId: string): Promise<DeviceDto> {
  const res = await client.get<ApiResponse<DeviceDto>>(`/devices/${deviceId}`);
  return res.data.data;
}

export async function sendDeviceCommand(request: DeviceCommandRequest): Promise<DeviceCommandResponse> {
  const res = await client.post<ApiResponse<DeviceCommandResponse>>('/devices/command', request);
  return res.data.data;
}

// Alarms
export async function getAlarms(params?: {
  status?: string;
  level?: string;
  poolId?: string;
  page?: number;
  size?: number;
}): Promise<PageResult<Alarm>> {
  const res = await client.get<ApiResponse<PageResult<Alarm>>>('/alarms', { params });
  return res.data.data;
}

export async function getUnackAlarms(): Promise<Alarm[]> {
  const res = await client.get<ApiResponse<Alarm[]>>('/alarms/unack');
  return res.data.data;
}

export async function acknowledgeAlarm(alarmId: string): Promise<void> {
  await client.put<ApiResponse<void>>(`/alarms/${alarmId}/ack`);
}

export async function getAlarmStats(): Promise<AlarmStats> {
  const res = await client.get<ApiResponse<AlarmStats>>('/alarms/stats');
  return res.data.data;
}

// History
export async function getSensorHistory(
  sensorId: string,
  hours: number = 24,
  interval: number = 5
): Promise<DataPoint[]> {
  const res = await client.get<ApiResponse<DataPoint[]>>(`/history/sensor/${sensorId}`, {
    params: { hours, interval },
  });
  return res.data.data;
}

export async function getDeviceHistory(
  deviceId: string,
  hours: number = 24
): Promise<DeviceStatusRecord[]> {
  const res = await client.get<ApiResponse<DeviceStatusRecord[]>>(`/history/device/${deviceId}`, {
    params: { hours },
  });
  return res.data.data;
}

// Dashboard
export async function getDashboardStats(): Promise<DashboardStats> {
  const res = await client.get<ApiResponse<DashboardStats>>('/dashboard/stats');
  return res.data.data;
}

export async function getMonitorItems(): Promise<MonitorItem[]> {
  const res = await client.get<ApiResponse<MonitorItem[]>>('/dashboard/monitor');
  return res.data.data;
}
