-- SWIMS 数据库架构
-- 污水净化监控平台数据库初始化脚本
-- 用户表
CREATE TABLE IF NOT EXISTS user_info (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(64),
    password VARCHAR(128),
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL
);

-- 用户表注释
COMMENT ON TABLE user_info IS '用户表：记录平台用户的基本信息与登录凭证';
COMMENT ON COLUMN user_info.id IS '主键ID';
COMMENT ON COLUMN user_info.username IS '用户名，唯一标识用户';
COMMENT ON COLUMN user_info.password IS '密码，存储用户登录凭证';
COMMENT ON COLUMN user_info.create_time IS '创建时间，记录插入时自动生成';
COMMENT ON COLUMN user_info.update_time IS '更新时间，记录更新时自动更新';

-- 设备信息表
CREATE TABLE IF NOT EXISTS device (
    id BIGSERIAL PRIMARY KEY,
    device_id VARCHAR(100) UNIQUE,
    device_name VARCHAR(100),
    device_type VARCHAR(20),
    pool_id VARCHAR(100),
    pool_name VARCHAR(100),
    status VARCHAR(20),
    status_time TIMESTAMP,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL
);

-- 设备表注释
COMMENT ON TABLE device IS '设备信息表：记录水泵、风机、阀门、加药装置等执行设备的基本信息与运行状态';
COMMENT ON COLUMN device.id IS '主键ID';
COMMENT ON COLUMN device.device_id IS '设备唯一标识，如 pump_001, fan_001, valve_001';
COMMENT ON COLUMN device.device_name IS '设备中文名称，如 提升泵1、曝气风机1';
COMMENT ON COLUMN device.device_type IS '设备类型：pump-泵, fan-风机, valve-阀门, doser-加药装置';
COMMENT ON COLUMN device.pool_id IS '所属水池ID，如 P_001, P_002';
COMMENT ON COLUMN device.pool_name IS '所属水池名称，如 调节池、好氧池、格栅';
COMMENT ON COLUMN device.status IS '运行状态：running-运行中, stoped-已停止,fault-故障,offline-离线';
COMMENT ON COLUMN device.status_time IS '状态更新时间，记录设备状态更新时间';
COMMENT ON COLUMN device.create_time IS '创建时间，记录插入时自动生成';
COMMENT ON COLUMN device.update_time IS '更新时间，记录更新时自动更新';

-- 传感器信息表
CREATE TABLE IF NOT EXISTS sensor (
    id BIGSERIAL PRIMARY KEY,
    sensor_id VARCHAR(100) UNIQUE,
    sensor_name VARCHAR(100),
    sensor_type VARCHAR(20),
    unit VARCHAR(20),
    min_value DOUBLE PRECISION,
    max_value DOUBLE PRECISION,
    pool_id VARCHAR(100),
    pool_name VARCHAR(100),
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL
);
-- 传感器表注释
COMMENT ON TABLE sensor IS '传感器信息表：记录水池中的传感器基本信息';
COMMENT ON COLUMN sensor.id IS '主键ID';
COMMENT ON COLUMN sensor.sensor_id IS '传感器唯一标识，如 level_001, cod_001';
COMMENT ON COLUMN sensor.sensor_name IS '传感器中文名称，如 调节池液位、COD';
COMMENT ON COLUMN sensor.sensor_type IS '传感器类型：level-液位, ph-PH值, temp-温度, do-溶氧, cod-COD, nh3-氨氮, turb-浊度, flow-流量';
COMMENT ON COLUMN sensor.unit IS '传感器单位，如 m, pH, °C, mg/L, mg/L, mg/L, mg/L, m³/h';
COMMENT ON COLUMN sensor.min_value IS '传感器最小值';
COMMENT ON COLUMN sensor.max_value IS '传感器最大值';
COMMENT ON COLUMN sensor.pool_id IS '所属水池ID，如 P_001, P_002';
COMMENT ON COLUMN sensor.pool_name IS '所属水池名称，如 调节池、好氧池、格栅';
COMMENT ON COLUMN sensor.create_time IS '创建时间，记录插入时自动生成';
COMMENT ON COLUMN sensor.update_time IS '更新时间，记录更新时自动更新';

--水池信息表
CREATE TABLE IF NOT EXISTS pool (
    id BIGSERIAL PRIMARY KEY,
    pool_id VARCHAR(100) UNIQUE,
    pool_name VARCHAR(100) UNIQUE,
    status VARCHAR(20),
    capacity DOUBLE PRECISION,
    maxLevel DOUBLE PRECISION,
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL
);
-- 水池表注释
COMMENT ON TABLE pool IS '水池信息表：记录水池的基本信息';
COMMENT ON COLUMN pool.id IS '主键ID';
COMMENT ON COLUMN pool.pool_id IS '水池唯一标识，如 P_001, P_002';
COMMENT ON COLUMN pool.pool_name IS '水池名称，如 调节池、好氧池、格栅';
COMMENT ON COLUMN pool.status IS '水池状态：normal-正常, overflow-溢出, low-低水位, high-高水位';
COMMENT ON COLUMN pool.capacity IS '水池容量，单位：立方米';
COMMENT ON COLUMN pool.maxLevel IS '水池最大液位，单位：米';
COMMENT ON COLUMN pool.create_time IS '创建时间，记录插入时自动生成';
COMMENT ON COLUMN pool.update_time IS '更新时间，记录更新时自动更新';



-- 上送数据记录表（TimescaleDB 超表，使用 time 作为主键）
-- 统一存储通过 MQTT 上送的传感器采集数据
CREATE TABLE IF NOT EXISTS sensor_record (
    time TIMESTAMP NOT NULL,
    sensor_id VARCHAR(100) NOT NULL,
    value DOUBLE PRECISION,
    status VARCHAR(10) NOT NULL,
    PRIMARY KEY (time, sensor_id)
);

-- 上送数据记录表注释
COMMENT ON TABLE sensor_record IS '上送数据记录表：统一存储通过MQTT上送的传感器采集数据';
COMMENT ON COLUMN sensor_record.time IS '数据记录时间';
COMMENT ON COLUMN sensor_record.sensor_id IS '传感器ID，如传感器ID';
COMMENT ON COLUMN sensor_record.value IS '数据值';
COMMENT ON COLUMN sensor_record.status IS '运行状态：running-运行中, stoped-已停止,fault-故障,offline-离线'



-- 将 sensor_record 转换为 TimescaleDB 超表（按 time 时间分片）
SELECT create_hypertable('sensor_record', 'time', chunk_time_interval => INTERVAL '1 day',
 partitioning_column => 'sensor_id', number_partitions => 4, if_not_exists => TRUE);

-- 开启上送数据记录表的自动压缩（冷数据压缩）
ALTER TABLE sensor_record SET (timescaledb.compress, timescaledb.compress_segmentby = 'sensor_id');
-- 添加上送数据记录表的压缩策略：7天前的数据自动压缩
SELECT add_compression_policy('sensor_record', INTERVAL '7 days', if_not_exists => TRUE);
-- 添加上送数据记录表的保留策略：只保留3个月的数据
SELECT add_retention_policy('sensor_record', INTERVAL '3 months', if_not_exists => TRUE);




-- 设备记录表（TimescaleDB 超表，使用 create_time 作为主键时间列）
CREATE TABLE IF NOT EXISTS  device_record (
    id BIGSERIAL NOT NULL PRIMARY KEY,
    device_id VARCHAR(100) NOT NULL,
    device_name VARCHAR(100),
    operation VARCHAR(20) NOT NULL,
    result VARCHAR(50),
    operator VARCHAR(50),
    terminal VARCHAR(50),
    create_time TIMESTAMP NOT NULL
);

-- 设备记录表注释
COMMENT ON TABLE device_record IS '设备记录表：记录每次从前端下发的设备控制指令及其执行结果';
COMMENT ON COLUMN device_record.id IS '主键ID';
COMMENT ON COLUMN device_record.device_id IS '设备唯一标识';
COMMENT ON COLUMN device_record.device_name IS '设备中文名称';
COMMENT ON COLUMN device_record.operation IS '控制操作类型：start-启动, stop-停止';
COMMENT ON COLUMN device_record.result IS '指令执行结果：已发送, 执行成功, 执行失败';
COMMENT ON COLUMN device_record.operator IS '操作人员标识';
COMMENT ON COLUMN device_record.terminal IS '终端设备标识';
COMMENT ON COLUMN device_record.create_time IS '创建时间，记录插入时自动生成';



-- 报警记录表
CREATE TABLE IF NOT EXISTS alarm (
    id BIGSERIAL PRIMARY KEY,
    alarm_type VARCHAR(50),
    alarm_level VARCHAR(20),
    target_id VARCHAR(100),
    target_type VARCHAR(20) NOT NULL,
    target_name VARCHAR(100),
    pool_id VARCHAR(100),
    pool_name VARCHAR(100),
    message VARCHAR(500),
    status VARCHAR(20),
    create_time TIMESTAMP NOT NULL,
    update_time TIMESTAMP NOT NULL
);

-- 报警记录表注释
COMMENT ON TABLE alarm IS '报警记录表：存储 故障、掉线、水位异常等报警信息';
COMMENT ON COLUMN alarm.id IS '主键ID';
COMMENT ON COLUMN alarm.alarm_type IS '报警类型：fault-故障, lose-掉线, water_level-水位异常';
COMMENT ON COLUMN alarm.alarm_level IS '报警等级：danger-危险, warning-警告';
COMMENT ON COLUMN alarm.target_id IS '报警目标ID，如设备ID或传感器ID';
COMMENT ON COLUMN alarm.target_type IS '报警目标类型：sensor-传感器数据, device-设备状态';
COMMENT ON COLUMN alarm.target_name IS '报警目标名称，如设备名称或传感器名称';
COMMENT ON COLUMN alarm.pool_id IS '水池唯一标识，如 P_001, P_002';
COMMENT ON COLUMN alarm.pool_name IS '水池名称，如 调节池、好氧池、格栅';
COMMENT ON COLUMN alarm.message IS '报警详细描述信息';
COMMENT ON COLUMN alarm.status IS '报警状态：unack-未确认, ack-已确认';
COMMENT ON COLUMN alarm.create_time IS '创建时间，记录插入时自动生成';  
COMMENT ON COLUMN alarm.update_time IS '更新时间，记录更新时自动更新';


