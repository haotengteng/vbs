-- SWIMS 污水净化监控平台 - 测试数据初始化脚本
-- 基于 schema.sql 表结构生成
-- 执行前请确保数据库和表已创建

-- =============================================
-- 0. 清空已有数据
-- =============================================
TRUNCATE TABLE sensor_record CASCADE;
TRUNCATE TABLE device_record CASCADE;
TRUNCATE TABLE alarm CASCADE;
TRUNCATE TABLE device CASCADE;
TRUNCATE TABLE sensor CASCADE;
TRUNCATE TABLE pool CASCADE;
TRUNCATE TABLE user_info CASCADE;


-- =============================================
-- 1. 用户表 (user_info)
-- =============================================
INSERT INTO user_info (username, password, create_time, update_time) VALUES
('admin', '$2a$10$eRikFzGgELGeU4OwRPLGLOgW7/UbFDclPb/7PXFhvFBD1qgSurUDe', NOW(), NOW()),
('operator01', '$2a$10$eRikFzGgELGeU4OwRPLGLOgW7/UbFDclPb/7PXFhvFBD1qgSurUDe', NOW(), NOW()),
('operator02', '$2a$10$eRikFzGgELGeU4OwRPLGLOgW7/UbFDclPb/7PXFhvFBD1qgSurUDe', NOW(), NOW());

-- 说明：password 为 bcrypt 加密后的 '123456'


-- =============================================
-- 2. 水池信息表 (pool)
-- =============================================
INSERT INTO pool (pool_id, pool_name, status, capacity, max_level, create_time, update_time) VALUES
('P-001', '集水池',      'normal',   50.0,  2.5,  NOW(), NOW()),
('P-002', '格栅渠',      'normal',  200.0,  4.0,  NOW(), NOW()),
('P-003', '调节池',      'normal',  150.0,  3.5,  NOW(), NOW()),
('P-004', '厌氧池',      'normal',  150.0,  3.5,  NOW(), NOW()),
('P-005', '缺氧池',      'normal',  300.0,  4.5,  NOW(), NOW()),
('P-006', '好氧池',      'normal',  180.0,  4.0,  NOW(), NOW()),
('P-007', '膜池',        'normal',  120.0,  3.0,  NOW(), NOW()),
('P-008', '消毒池',  'normal',   80.0,  3.0,  NOW(), NOW()),
('P-009', '污泥浓缩池',      'normal',   60.0,  2.5,  NOW(), NOW());


-- =============================================
-- 3. 传感器信息表 (sensor)
-- =============================================
-- 集水池
INSERT INTO sensor (sensor_id, sensor_name, sensor_type, unit, min_value, max_value, pool_id, pool_name, create_time, update_time) VALUES
('level_001', '集水池液位',    'level',  'm',     0.0,   2.5,  'P-001', '集水池',     NOW(), NOW()),
('flow_001',  '集水池进水流量', 'flow',   'm³/h',  0.0, 100.0,  'P-001', '集水池',     NOW(), NOW()),

-- 格栅渠
('level_002', '格栅渠液位',    'level',  'm',     0.0,   4.0,  'P-002', '格栅渠',     NOW(), NOW()),
('ph_001',    '格栅渠PH值',    'ph',     'pH',    0.0,  14.0,  'P-002', '格栅渠',     NOW(), NOW()),
('temp_001',  '格栅渠温度',    'temp',   '°C',    0.0,  50.0,  'P-002', '格栅渠',     NOW(), NOW()),

-- 调节池
('level_003', '调节池液位',    'level',  'm',     0.0,   3.5,  'P-003', '调节池',     NOW(), NOW()),
('cod_001',   '调节池COD',     'cod',    'mg/L',  0.0, 500.0,  'P-003', '调节池',     NOW(), NOW()),

-- 厌氧池
('level_004', '厌氧池液位',    'level',  'm',     0.0,   3.5,  'P-004', '厌氧池',     NOW(), NOW()),
('nh3_001',   '厌氧池氨氮',    'nh3',    'mg/L',  0.0,  50.0,  'P-004', '厌氧池',     NOW(), NOW()),
('do_001',    '厌氧池溶氧',    'do',     'mg/L',  0.0,  20.0,  'P-004', '厌氧池',     NOW(), NOW()),

-- 缺氧池
('level_005', '缺氧池液位',    'level',  'm',     0.0,   4.5,  'P-005', '缺氧池',     NOW(), NOW()),
('do_002',    '缺氧池溶氧',    'do',     'mg/L',  0.0,  20.0,  'P-005', '缺氧池',     NOW(), NOW()),
('turb_001',  '缺氧池浊度',    'turb',   'mg/L',  0.0, 100.0,  'P-005', '缺氧池',     NOW(), NOW()),

-- 好氧池
('level_006', '好氧池液位',    'level',  'm',     0.0,   4.0,  'P-006', '好氧池',     NOW(), NOW()),
('ph_002',    '好氧池PH值',    'ph',     'pH',    0.0,  14.0,  'P-006', '好氧池',     NOW(), NOW()),

-- 膜池
('level_007', '膜池液位',      'level',  'm',     0.0,   3.0,  'P-007', '膜池',       NOW(), NOW()),
('flow_002',  '膜池产水流量',   'flow',   'm³/h',  0.0,  50.0,  'P-007', '膜池',       NOW(), NOW()),
('temp_002',  '膜池温度',      'temp',   '°C',    0.0,  50.0,  'P-007', '膜池',       NOW(), NOW()),

-- 消毒池
('level_008', '消毒池液位', 'level',  'm',    0.0,   3.0,  'P-008', '消毒池', NOW(), NOW()),
('cod_002',   '消毒池COD',  'cod',    'mg/L', 0.0, 500.0,  'P-008', '消毒池', NOW(), NOW()),

-- 污泥浓缩池
('level_009', '污泥浓缩池液位',    'level',  'm',     0.0,   2.5,  'P-009', '污泥浓缩池',     NOW(), NOW()),
('ph_003',    '污泥浓缩池PH值',    'ph',     'pH',    0.0,  14.0,  'P-009', '污泥浓缩池',     NOW(), NOW()),
('temp_003',  '污泥浓缩池温度',    'temp',   '°C',    0.0,  50.0,  'P-009', '污泥浓缩池',     NOW(), NOW());


-- =============================================
-- 4. 设备信息表 (device)
-- =============================================
-- 集水池设备
INSERT INTO device (device_id, device_name, device_type, pool_id, pool_name, status, status_time, create_time, update_time) VALUES
('pump_001', '集水池提升泵1',    'pump',   'P-001', '集水池',     'running',  NOW(), NOW(), NOW()),
('pump_002', '集水池提升泵2',    'pump',   'P-001', '集水池',     'running',  NOW(), NOW(), NOW()),
('fan_001',  '集水池排风机',  'fan',    'P-001', '集水池',     'running',  NOW(), NOW(), NOW()),

-- 格栅渠设备
('pump_003', '调节泵1',    'pump',   'P-002', '格栅渠',     'running',  NOW(), NOW(), NOW()),
('valve_001','进水阀门',    'valve',  'P-002', '格栅渠',     'running',  NOW(), NOW(), NOW()),
('fan_002',  '格栅渠风机',  'fan',    'P-002', '格栅渠',     'stopped',  NOW(), NOW(), NOW()),

-- 调节池设备
('pump_004', '调节池提升泵',  'pump',   'P-003', '调节池',     'running',  NOW(), NOW(), NOW()),
('doser_001','加药装置1',   'doser',  'P-003', '调节池',     'running',  NOW(), NOW(), NOW()),

-- 厌氧池设备
('pump_005', '厌氧池回流泵',  'pump',   'P-004', '厌氧池',     'running',  NOW(), NOW(), NOW()),
('fan_003',  '厌氧池风机',  'fan',    'P-004', '厌氧池',     'running',  NOW(), NOW(), NOW()),
('valve_002','缺氧阀门',    'valve',  'P-004', '厌氧池',     'running',  NOW(), NOW(), NOW()),

-- 缺氧池设备
('pump_006', '缺氧池循环泵',  'pump',   'P-005', '缺氧池',     'running',  NOW(), NOW(), NOW()),
('fan_004',  '曝气风机1',   'fan',    'P-005', '缺氧池',     'running',  NOW(), NOW(), NOW()),
('fan_005',  '曝气风机2',   'fan',    'P-005', '缺氧池',     'fault',    NOW(), NOW(), NOW()),
('doser_002','缺氧池加药装置', 'doser',  'P-005', '缺氧池',     'running',  NOW(), NOW(), NOW()),

-- 好氧池设备
('pump_007', '好氧池污泥泵1',     'pump',   'P-006', '好氧池',     'running',  NOW(), NOW(), NOW()),
('valve_003','好氧池排泥阀门',    'valve',  'P-006', '好氧池',     'running',  NOW(), NOW(), NOW()),

-- 膜池设备
('pump_008', '膜池产水泵',    'pump',   'P-007', '膜池',       'running',  NOW(), NOW(), NOW()),
('fan_006',  '膜池风机',    'fan',    'P-007', '膜池',       'running',  NOW(), NOW(), NOW()),
('valve_004','膜池反洗阀',  'valve',  'P-007', '膜池',       'stopped',  NOW(), NOW(), NOW()),

-- 消毒池设备
('pump_009', '消毒池浓缩污泥泵',  'pump',   'P-008', '消毒池', 'running',  NOW(), NOW(), NOW()),
('doser_003','消毒池加药装置', 'doser',  'P-008', '消毒池', 'offline',  NOW(), NOW(), NOW()),

-- 污泥浓缩池设备
('pump_010', '污泥浓缩池出水泵',  'pump',   'P-009', '污泥浓缩池',     'running',  NOW(), NOW(), NOW()),
('valve_005','污泥浓缩池阀门',    'valve',  'P-009', '污泥浓缩池',     'running',  NOW(), NOW(), NOW()),
('fan_007',  '污泥浓缩池排风机',  'fan',    'P-009', '污泥浓缩池',     'running',  NOW(), NOW(), NOW());


-- =============================================
-- 5. 报警记录表 (alarm)
-- =============================================
INSERT INTO alarm (alarm_type, alarm_level, target_id, target_type, target_name, pool_id, pool_name, message, status, create_time, update_time) VALUES
('fault',      'danger',   'fan_005',   'device', '曝气风机2',   'P-005', '缺氧池',     '曝气风机2发生故障，请立即检查',           'unack', NOW() - INTERVAL '5 minutes',  NOW()),
('lose',       'warning',  'doser_003', 'device', '消毒池加药装置', 'P-008', '消毒池', '消毒池加药装置通信中断，已离线',            'unack', NOW() - INTERVAL '12 minutes', NOW()),
('water_level','warning',  'level_002', 'sensor', '格栅渠液位',   'P-002', '格栅渠',     '格栅渠液位接近上限，当前液位 3.85m',      'unack', NOW() - INTERVAL '8 minutes',  NOW()),
('fault',      'danger',   'fan_002',   'device', '格栅渠风机',   'P-002', '格栅渠',     '格栅渠风机停机，可能出现过热保护',        'ack',   NOW() - INTERVAL '2 hours',    NOW()),
('water_level','warning',  'level_005', 'sensor', '缺氧池液位',   'P-005', '缺氧池',     '缺氧池液位波动异常，请检查进水流量',      'ack',   NOW() - INTERVAL '3 hours',    NOW()),
('fault',      'warning',  'valve_004', 'device', '膜池反洗阀',   'P-007', '膜池',       '膜池反洗阀未正常开启，当前状态为停止',    'ack',   NOW() - INTERVAL '1 day',      NOW()),
('lose',       'danger',   'pump_009',  'device', '消毒池浓缩污泥泵',   'P-008', '消毒池', '消毒池浓缩污泥泵信号丢失，请检查电缆连接',      'unack', NOW() - INTERVAL '20 minutes', NOW()),
('water_level','danger',   'level_007', 'sensor', '膜池液位',     'P-007', '膜池',       '膜池液位过低，当前液位 0.45m，低于安全线', 'unack', NOW() - INTERVAL '15 minutes', NOW());


-- =============================================
-- 6. 设备记录表 (device_record)
-- =============================================
INSERT INTO device_record (device_id, device_name, operation, result, operator, terminal, create_time) VALUES
('fan_005',   '曝气风机2',    'stop',   '执行成功', 'admin', 'web', NOW() - INTERVAL '10 minutes'),
('fan_005',   '曝气风机2',    'start',  '执行失败', 'admin', 'web', NOW() - INTERVAL '8 minutes'),
('doser_003', '消毒池加药装置', 'stop',   '执行成功', 'operator01', 'web', NOW() - INTERVAL '30 minutes'),
('valve_004', '膜池反洗阀',   'start',  '执行成功', 'operator02', 'web', NOW() - INTERVAL '1 hour'),
('pump_008',  '膜池产水泵',     'start',  '执行成功', 'admin', 'web', NOW() - INTERVAL '2 hours'),
('fan_002',   '格栅渠风机',   'stop',   '执行成功', 'admin', 'web', NOW() - INTERVAL '2 hours'),
('pump_001',  '集水池提升泵1',      'start',  '执行成功', 'admin', 'web', NOW() - INTERVAL '3 hours'),
('pump_006',  '缺氧池循环泵',   'start',  '执行成功', 'operator01', 'web', NOW() - INTERVAL '4 hours');


-- =============================================
-- 7. 传感器时序数据 (sensor_record)
-- =============================================
-- 说明：以下生成最近 3 小时内、每 5 分钟一条的采样数据
-- 由于 TimescaleDB 超表支持批量插入，这里为每个传感器生成 36 条记录

DO $$
DECLARE
    rec RECORD;
    base_time TIMESTAMP := NOW() - INTERVAL '3 hours';
    i INT;
    val DOUBLE PRECISION;
    st VARCHAR(10);
BEGIN
    FOR rec IN SELECT sensor_id, sensor_type, min_value, max_value FROM sensor LOOP
        FOR i IN 0..35 LOOP
            -- 根据传感器类型生成合理范围内的随机值
            CASE rec.sensor_type
                WHEN 'level' THEN
                    val := rec.min_value + (random() * (rec.max_value - rec.min_value) * 0.8 + rec.max_value * 0.1);
                WHEN 'ph' THEN
                    val := 6.5 + random() * 1.5;
                WHEN 'temp' THEN
                    val := 18.0 + random() * 12.0;
                WHEN 'do' THEN
                    val := 2.0 + random() * 8.0;
                WHEN 'cod' THEN
                    val := 50.0 + random() * 200.0;
                WHEN 'nh3' THEN
                    val := 5.0 + random() * 30.0;
                WHEN 'turb' THEN
                    val := 10.0 + random() * 60.0;
                WHEN 'flow' THEN
                    val := rec.min_value + random() * (rec.max_value - rec.min_value) * 0.6;
                ELSE
                    val := rec.min_value + random() * (rec.max_value - rec.min_value);
            END CASE;

            -- 模拟少量异常状态
            IF random() < 0.05 THEN
                st := 'fault';
            ELSE
                st := 'running';
            END IF;

            INSERT INTO sensor_record (time, sensor_id, value, status)
            VALUES (base_time + (i * INTERVAL '5 minutes'), rec.sensor_id, ROUND(val::numeric, 2), st);
        END LOOP;
    END LOOP;
END $$;

-- =============================================
-- 数据生成完毕
-- =============================================
