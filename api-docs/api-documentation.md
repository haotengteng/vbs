# 污水净化监控平台 API 文档

> 版本: v1.0.0 | 基础路径: `http://localhost:8080/api`

---

## 目录

- [概述](#概述)
- [认证方式](#认证方式)
- [通用响应格式](#通用响应格式)
- [错误码说明](#错误码说明)
- [数据模型](#数据模型)
- [接口列表](#接口列表)
  - [认证管理](#一认证管理)
  - [水池管理](#二水池管理)
  - [设备管理](#三设备管理)
  - [告警管理](#四告警管理)
  - [历史数据](#五历史数据)
  - [仪表盘统计](#六仪表盘统计)
  - [流程路径](#七流程路径)
  - [MQTT消息](#八mqtt消息)

---

## 概述

本文档定义了污水净化监控平台前后端交互的 RESTful API 接口规范。所有接口（登录除外）均使用 JWT Bearer Token 进行身份认证。

### 技术栈

- 协议: HTTP/1.1
- 数据格式: JSON
- 字符编码: UTF-8
- 认证方式: JWT (JSON Web Token)

---

## 认证方式

所有需要认证的接口，请在请求头中携带 JWT Token：

```http
Authorization: Bearer <your-jwt-token>
```

Token 通过登录接口获取，有效期默认 24 小时。

---

## 通用响应格式

所有接口统一返回以下格式：

```json
{
  "code": 200,
  "message": "success",
  "data": { ... }
}
```

| 字段 | 类型 | 说明 |
|------|------|------|
| `code` | integer | 业务状态码，200 表示成功 |
| `message` | string | 响应消息说明 |
| `data` | object / array | 响应数据，失败时可能为 null |

---

## 错误码说明

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | 成功 | 请求处理成功 |
| 400 | 参数错误 | 请求参数校验失败 |
| 401 | 未授权 | Token 缺失、无效或已过期 |
| 403 | 无权限 | 用户无权执行此操作 |
| 404 | 资源不存在 | 请求的资源不存在 |
| 500 | 服务器错误 | 服务器内部异常 |

### 错误响应示例

```json
{
  "code": 401,
  "message": "未授权，请重新登录",
  "data": null
}
```

---

## 数据模型

### Pool（水池）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 前端展示用ID，如 `pool-1` |
| `code` | string | 是 | 水池编码，如 `P-001` |
| `name` | string | 是 | 水池名称，如 "集水池" |
| `capacity` | number | 是 | 总容量(m³) |
| `maxLevel` | number | 是 | 最大水位(m) |
| `currentLevel` | number | 是 | 当前水位(m) |
| `flowRate` | number | 是 | 当前流量(m³/h) |
| `status` | string | 是 | 运行状态：`normal`/`warning`/`danger` |
| `devices` | array | 否 | 设备列表，见 [Device](#device设备) |
| `sensors` | array | 否 | 传感器监测数据列表，见 [Sensor](#sensor传感器) |

> **说明**：高液位和低液位警戒值已迁移至液位传感器的 `max` 和 `min` 字段中维护。

### Device（设备）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 设备唯一标识，如 `d-1-1` |
| `name` | string | 是 | 设备名称，如 "进水泵1#" |
| `type` | string | 是 | 设备类型，见下表 |
| `status` | string | 是 | 运行状态：`running`/`stopped`/`fault`/`offline` |
| `statusTime` | string | 是 | 状态更新时间(ISO 8601) |

**设备类型枚举：**

| 值 | 说明 |
|----|------|
| `pump` | 水泵 |
| `grating_machine` | 格栅机 |
| `conveyor` | 输送机 |
| `mixer` | 搅拌器 |
| `blower` | 曝气风机 |
| `heater` | 蒸汽加热器 |
| `valve` | 电动阀 |
| `dosing` | 加药器 |
| `sensor` | 传感器 |
| `dehydrator` | 脱水机 |

### Sensor（传感器）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 传感器唯一标识，如 `p-1-1` |
| `name` | string | 是 | 传感器名称，如 "液位" |
| `value` | number | 是 | 当前数值 |
| `unit` | string | 是 | 单位，如 `m`、`mg/L` |
| `min` | number | 是 | 正常范围下限 |
| `max` | number | 是 | 正常范围上限 |

### FlowPath（水流路径）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 路径唯一标识 |
| `from` | string | 是 | 起始水池ID |
| `to` | string | 是 | 目标水池ID |
| `type` | string | 是 | 路径类型：`forward`/`recycle`/`internal` |
| `active` | boolean | 是 | 是否激活（有水流） |
| `fromSide` | string | 否 | 起始连接边：`top`/`bottom`/`left`/`right` |
| `toSide` | string | 否 | 目标连接边：`top`/`bottom`/`left`/`right` |

### Alarm（告警）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `id` | string | 是 | 告警唯一标识 |
| `poolId` | string | 是 | 关联水池ID |
| `poolName` | string | 是 | 关联水池名称 |
| `level` | string | 是 | 告警级别：`warning`/`danger` |
| `message` | string | 是 | 告警内容描述 |
| `timestamp` | string | 是 | 告警发生时间（ISO 8601格式） |
| `status` | string | 是 | 告警处理状态：`unack`-未确认, `ack`-已确认 |

### DataPoint（时序数据点）

| 字段 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `timestamp` | string | 是 | 数据时间戳（ISO 8601格式） |
| `value` | number | 是 | 数值 |

---

## 接口列表

---

### 一、认证管理

#### 1. 用户登录

- **接口**: `POST /auth/login`
- **说明**: 用户登录获取 JWT Token
- **认证**: 不需要

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `username` | string | 是 | 用户名 |
| `password` | string | 是 | 密码 |

**请求示例：**

```json
{
  "username": "admin",
  "password": "123456"
}
```

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | JWT 访问令牌 |
| `username` | string | 用户名 |
| `realName` | string | 真实姓名 |
| `role` | string | 角色：`admin`/`operator`/`viewer` |

**响应示例：**

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "username": "admin",
    "realName": "管理员",
    "role": "admin"
  }
}
```

**错误码：**

| 状态码 | 说明 |
|--------|------|
| 400 | 参数校验失败 |
| 401 | 用户名或密码错误 |

---

#### 2. 用户登出

- **接口**: `POST /auth/logout`
- **说明**: 退出登录，清除 Token
- **认证**: 需要

**响应示例：**

```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

---

#### 3. 刷新 Token

- **接口**: `POST /auth/refresh`
- **说明**: 使用 Refresh Token 获取新的 Access Token
- **认证**: 需要

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `token` | string | 新的 JWT 访问令牌 |

---

### 二、水池管理

#### 4. 获取所有水池列表

- **接口**: `GET /pools`
- **说明**: 获取所有水池完整信息，包括设备列表和传感器监测数据。用于 Dashboard 拓扑图展示和右侧数据面板。
- **认证**: 需要

**响应数据：** `Pool[]` 数组

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "id": "pool-1",
      "code": "P-001",
      "name": "集水池",
      "capacity": 800,
      "maxLevel": 5.0,
      "currentLevel": 3.25,
      "flowRate": 120.5,
      "status": "normal",
      "devices": [
        {
          "id": "d-1-1",
          "name": "进水泵1#",
          "type": "pump",
          "status": "running",
          "statusTime": "2026-06-09T14:30:00Z"
        }
      ],
      "sensors": [
        {
          "id": "p-1-1",
          "name": "液位",
          "value": 3.25,
          "unit": "m",
          "min": 0.5,
          "max": 4.5
        }
      ]
    }
  ]
}
```

---

#### 5. 获取单个水池详情

- **接口**: `GET /pools/{poolId}`
- **说明**: 根据水池 ID 获取详细信息
- **认证**: 需要

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `poolId` | string | 是 | 水池ID，如 `pool-1` |

**响应数据：** `Pool` 对象

**错误码：**

| 状态码 | 说明 |
|--------|------|
| 404 | 水池不存在 |

---

### 三、设备管理

#### 6. 获取设备列表

- **接口**: `GET /devices`
- **说明**: 分页查询设备列表，支持按水池ID和状态筛选
- **认证**: 需要

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `poolId` | string | 否 | - | 水池ID筛选 |
| `status` | string | 否 | - | 设备状态：`running`/`stopped`/`fault`/`offline` |
| `page` | integer | 否 | 1 | 页码 |
| `size` | integer | 否 | 20 | 每页大小 |

**响应数据：** 分页结果

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "total": 100,
    "page": 1,
    "size": 20,
    "list": [ ... ]
  }
}
```

---

#### 7. 获取设备详情

- **接口**: `GET /devices/{deviceId}`
- **说明**: 获取单个设备详细信息
- **认证**: 需要

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `deviceId` | string | 是 | 设备ID，如 `d-1-1` |

**响应数据：** `Device` 对象

---

#### 8. 下发设备控制指令

- **接口**: `POST /devices/command`
- **说明**: 向指定设备下发控制指令（启动/停止/复位）。指令通过 MQTT 协议下发到设备，同时记录操作日志。
- **认证**: 需要

**请求参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `deviceId` | string | 是 | 设备ID |
| `operation` | string | 是 | 操作类型：`start`/`stop`/`reset` |

**请求示例：**

```json
{
  "deviceId": "d-1-1",
  "operation": "start"
}
```

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `id` | integer | 控制记录ID |
| `deviceId` | string | 设备ID |
| `deviceName` | string | 设备名称 |
| `operation` | string | 操作类型 |
| `result` | string | 执行结果：`success`/`failed`/`pending` |
| `operator` | string | 操作人 |
| `createTime` | string | 操作时间 |

**响应示例：**

```json
{
  "code": 200,
  "message": "指令下发成功",
  "data": {
    "id": 1,
    "deviceId": "d-1-1",
    "deviceName": "进水泵1#",
    "operation": "start",
    "result": "success",
    "operator": "admin",
    "createTime": "2024-06-08T14:30:00+08:00"
  }
}
```

**错误码：**

| 状态码 | 说明 |
|--------|------|
| 400 | 参数校验失败 |
| 403 | 无权限执行此操作 |

---

### 四、告警管理

#### 9. 获取告警列表

- **接口**: `GET /alarms`
- **说明**: 分页查询告警列表，支持按状态、级别、水池ID筛选。用于 Dashboard 底部告警表格展示。
- **认证**: 需要

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `status` | string | 否 | `all` | 告警状态：`unack`/`ack`/`all` |
| `level` | string | 否 | - | 告警级别：`warning`/`danger` |
| `poolId` | string | 否 | - | 水池ID筛选 |
| `page` | integer | 否 | 1 | 页码 |
| `size` | integer | 否 | 20 | 每页大小 |

**响应数据：** `Alarm[]` 分页结果

---

#### 10. 获取未确认告警

- **接口**: `GET /alarms/unack`
- **说明**: 获取所有未确认的告警列表（快捷接口）
- **认证**: 需要

**响应数据：** `Alarm[]` 数组

---

#### 11. 确认告警

- **接口**: `PUT /alarms/{alarmId}/ack`
- **说明**: 将指定告警标记为已确认状态
- **认证**: 需要

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `alarmId` | string | 是 | 告警ID |

**响应示例：**

```json
{
  "code": 200,
  "message": "告警已确认",
  "data": null
}
```

**错误码：**

| 状态码 | 说明 |
|--------|------|
| 404 | 告警不存在 |

---

#### 12. 获取告警统计

- **接口**: `GET /alarms/stats`
- **说明**: 获取告警数量统计（按级别分组）
- **认证**: 需要

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `warning` | integer | 警告级别告警数 |
| `danger` | integer | 危险级别告警数 |
| `total` | integer | 告警总数 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "warning": 5,
    "danger": 2,
    "total": 7
  }
}
```

---

### 五、历史数据

#### 13. 查询传感器历史数据

- **接口**: `GET /history/sensor/{sensorId}`
- **说明**: 查询指定传感器的历史数据，用于传感器趋势图展示。默认返回最近 24 小时数据。
- **认证**: 需要

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `sensorId` | string | 是 | 传感器ID，如 `p-1-1` |

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `hours` | integer | 否 | 24 | 查询时间范围（小时） |
| `interval` | integer | 否 | 5 | 数据聚合间隔（分钟） |

**响应数据：** `DataPoint[]` 数组

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    { "timestamp": "2024-06-08T14:00:00+08:00", "value": 3.25 },
    { "timestamp": "2024-06-08T14:05:00+08:00", "value": 3.28 }
  ]
}
```

---

#### 14. 查询设备状态历史

- **接口**: `GET /history/device/{deviceId}`
- **说明**: 查询指定设备的状态变化历史
- **认证**: 需要

**路径参数：**

| 参数 | 类型 | 必填 | 说明 |
|------|------|------|------|
| `deviceId` | string | 是 | 设备ID |

**查询参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `hours` | integer | 否 | 24 | 查询时间范围（小时） |

**响应数据：**

```json
[
  {
    "createTime": "2024-06-08T14:00:00+08:00",
    "status": "running",
    "operation":"张三",
    "terminal":"小程序"
  },
  {
    "createTime": "2024-06-08T14:30:00+08:00",
    "status": "stopped",
    "operation":"张三",
    "terminal":"大屏"
  }
]
```

---

### 六、仪表盘统计

#### 15. 获取仪表盘统计数据

- **接口**: `GET /dashboard/stats`
- **说明**: 获取 Dashboard 右侧面板所需的统计数据。包括水池总数、运行/故障设备数、各水池设备分布等。
- **认证**: 需要

**响应数据：**

| 字段 | 类型 | 说明 |
|------|------|------|
| `totalPools` | integer | 水池总数 |
| `runningDevices` | integer | 运行中设备数 |
| `faultDevices` | integer | 故障设备数 |
| `deviceCategories` | array | 各水池设备分布统计 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "totalPools": 9,
    "runningDevices": 27,
    "faultDevices": 2,
    "deviceCategories": [
      { "name": "缺氧池", "value": 9 },
      { "name": "调节池", "value": 12 }
    ]
  }
}
```

---

#### 16. 获取实时监控数据

- **接口**: `GET /dashboard/monitor`
- **说明**: 获取设备监控面板所需的实时数据。用于右侧"设备监控"组件展示。
- **认证**: 需要

**响应数据：** 监控项数组

| 字段 | 类型 | 说明 |
|------|------|------|
| `label` | string | 监控项名称 |
| `value` | string | 当前值 |
| `unit` | string | 单位 |
| `status` | string | 状态：`normal`/`warning`/`danger` |
| `icon` | string | 图标标识 |

**响应示例：**

```json
{
  "code": 200,
  "message": "success",
  "data": [
    {
      "label": "膜池液位",
      "value": "1.08",
      "unit": "m",
      "status": "normal",
      "icon": "gauge"
    }
  ]
}
```

---

### 七、MQTT消息

#### 17. 发布MQTT消息（调试用）

- **接口**: `POST /mqtt/publish`
- **说明**: 手动发布 MQTT 消息到指定主题（仅管理员使用）
- **认证**: 需要（管理员权限）

**请求参数：**

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|------|------|------|--------|------|
| `topic` | string | 是 | - | MQTT主题 |
| `payload` | string | 是 | - | 消息内容（JSON字符串） |
| `qos` | integer | 否 | 1 | QoS等级：0/1/2 |

**请求示例：**

```json
{
  "topic": "swims/control/d-1-1",
  "payload": "{\"operation\":\"start\"}",
  "qos": 1
}
```

**错误码：**

| 状态码 | 说明 |
|--------|------|
| 403 | 无权限（非管理员） |

---

## 附录

### 前端 Mock 数据替换对照表

| 前端原 Mock 函数 | 替换为 API 接口 | 使用位置 |
|------------------|----------------|----------|
| `generateInitialPools()` | `GET /pools` | Dashboard 拓扑图 |
| `generateFlowPaths()` | 前端静态配置 | Dashboard 连线 |
| `updatePoolData()` | `GET /pools` (定时轮询) | Dashboard 数据更新 |
| `checkAlarms()` | `GET /alarms/unack` | 告警表格 |
| `acknowledgeAlarm()` | `PUT /alarms/{id}/ack` | 告警确认 |
| `toggleDeviceStatus()` | `POST /devices/command` | 设备开关 |
| `getSensorHistory()` | `GET /history/sensor/{id}` | 传感器趋势图 |
| 登录模拟 | `POST /auth/login` | LoginView |
| 设备监控静态数据 | `GET /dashboard/monitor` | DeviceMonitor |
| 进出水流量静态数据 | `GET /history/flow` | EfficiencyChart / GasChart |
| 设备分布静态数据 | `GET /dashboard/stats` | EmissionData |

---

*文档生成时间: 2024-06-09*
