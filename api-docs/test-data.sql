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


-- ============================================
-- 设备信息表 (device) 测试数据
-- 数据来源: pool_devices_sensors.json
-- ============================================

INSERT INTO device (device_id, device_name, device_type, pool_id, pool_name, status, status_time, create_time, update_time) VALUES
-- 集水池 (P-001)
('p1-pump-1', '进水泵1#', 'pump', 'P-001', '集水池', 'running', NOW(), NOW(), NOW()),
('p1-pump-2', '进水泵2#', 'pump', 'P-001', '集水池', 'running', NOW(), NOW(), NOW()),

-- 格栅渠 (P-002)
('p2-grating-1', '格栅机', 'grating_machine', 'P-002', '格栅渠', 'running', NOW(), NOW(), NOW()),

-- 调节池 (P-003)
('p3-pump-1', '提升泵1#', 'pump', 'P-003', '调节池', 'running', NOW(), NOW(), NOW()),
('p3-pump-2', '提升泵2#', 'pump', 'P-003', '调节池', 'stopped', NOW(), NOW(), NOW()),
('p3-mixer-1', '推流搅拌器', 'mixer', 'P-003', '调节池', 'running', NOW(), NOW(), NOW()),

-- 厌氧池 (P-004)
('p4-pump-1', '循环泵1#', 'pump', 'P-004', '厌氧池', 'running', NOW(), NOW(), NOW()),
('p4-pump-2', '循环泵2#', 'pump', 'P-004', '厌氧池', 'running', NOW(), NOW(), NOW()),
('p4-heater-1', '蒸汽加热器', 'heater', 'P-004', '厌氧池', 'running', NOW(), NOW(), NOW()),

-- 缺氧池 (P-005)
('p5-mixer-1', '潜水推流器1#', 'mixer', 'P-005', '缺氧池', 'running', NOW(), NOW(), NOW()),
('p5-mixer-2', '潜水推流器2#', 'mixer', 'P-005', '缺氧池', 'stopped', NOW(), NOW(), NOW()),

-- 好氧池 (P-006)
('p6-fan-1', '曝气风机1#', 'fan', 'P-006', '好氧池', 'running', NOW(), NOW(), NOW()),
('p6-fan-2', '曝气风机2#', 'fan', 'P-006', '好氧池', 'running', NOW(), NOW(), NOW()),
('p6-pump-1', '硝化液回流泵', 'pump', 'P-006', '好氧池', 'running', NOW(), NOW(), NOW()),

-- 膜池 (P-007)
('p7-pump-1', '污泥回流泵', 'pump', 'P-007', '膜池', 'running', NOW(), NOW(), NOW()),
('p7-pump-2', '自吸泵1#', 'pump', 'P-007', '膜池', 'running', NOW(), NOW(), NOW()),
('p7-pump-3', '自吸泵2#', 'pump', 'P-007', '膜池', 'stopped', NOW(), NOW(), NOW()),
('p7-pump-4', '反洗泵', 'pump', 'P-007', '膜池', 'running', NOW(), NOW(), NOW()),
('p7-valve-1', '电动阀', 'valve', 'P-007', '膜池', 'running', NOW(), NOW(), NOW()),

-- 消毒池 (P-008)
('p8-doser-1', '消毒加药器1#', 'doser', 'P-008', '消毒池', 'running', NOW(), NOW(), NOW()),
('p8-doser-2', '消毒加药器2#', 'doser', 'P-008', '消毒池', 'running', NOW(), NOW(), NOW()),
('p8-pump-1', '出水泵', 'pump', 'P-008', '消毒池', 'running', NOW(), NOW(), NOW()),

-- 污泥浓缩池 (P-009)
('p9-pump-1', '污泥泵', 'pump', 'P-009', '污泥浓缩池', 'running', NOW(), NOW(), NOW()),
('p9-dehydrator-1', '脱水机', 'dehydrator', 'P-009', '污泥浓缩池', 'running', NOW(), NOW(), NOW());


-- ============================================
-- 传感器信息表 (sensor) 测试数据
-- 数据来源: pool_devices_sensors.json
-- ============================================

INSERT INTO sensor (sensor_id, sensor_name, sensor_type, unit, min_value, max_value, pool_id, pool_name, create_time, update_time) VALUES
-- 集水池 (P-001)
('p1-sensor-1', '液位', 'level', 'm', 1, 10, 'P-001', '集水池', NOW(), NOW()),

-- 格栅渠 (P-002)
('p2-sensor-1', '液位', 'level', 'm', 1, 5, 'P-002', '格栅渠', NOW(), NOW()),

-- 调节池 (P-003)
('p3-sensor-1', '液位', 'level', 'm', 1, 8, 'P-003', '调节池', NOW(), NOW()),
('p3-sensor-2', '流量', 'flow', 'm³/h', 0, 200, 'P-003', '调节池', NOW(), NOW()),

-- 厌氧池 (P-004)
('p4-sensor-1', '液位', 'level', 'm', 1, 6, 'P-004', '厌氧池', NOW(), NOW()),
('p4-sensor-2', '温度', 'temp', '°C', 5, 40, 'P-004', '厌氧池', NOW(), NOW()),
('p4-sensor-3', 'PH值', 'ph', 'pH', 4, 9, 'P-004', '厌氧池', NOW(), NOW()),
('p4-sensor-4', '溶解氧', 'do', 'mg/L', 10, 20, 'P-004', '厌氧池', NOW(), NOW()),
('p4-sensor-5', '污泥浓度', 'cod', 'mg/L', 0, 5000, 'P-004', '厌氧池', NOW(), NOW()),

-- 缺氧池 (P-005)
('p5-sensor-1', '液位', 'level', 'm', 1, 6, 'P-005', '缺氧池', NOW(), NOW()),
('p5-sensor-2', '溶解氧', 'do', 'mg/L', 10, 20, 'P-005', '缺氧池', NOW(), NOW()),
('p5-sensor-3', '污泥浓度', 'cod', 'mg/L', 0, 5000, 'P-005', '缺氧池', NOW(), NOW()),
('p5-sensor-4', 'PH值', 'ph', 'pH', 4, 9, 'P-005', '缺氧池', NOW(), NOW()),

-- 好氧池 (P-006)
('p6-sensor-1', '液位', 'level', 'm', 1, 6, 'P-006', '好氧池', NOW(), NOW()),
('p6-sensor-2', '污泥浓度', 'cod', 'mg/L', 0, 5000, 'P-006', '好氧池', NOW(), NOW()),
('p6-sensor-3', 'PH值', 'ph', 'pH', 4, 9, 'P-006', '好氧池', NOW(), NOW()),

-- 膜池 (P-007)
('p7-sensor-1', '液位', 'level', 'm', 1, 5, 'P-007', '膜池', NOW(), NOW()),
('p7-sensor-2', '污泥浓度', 'cod', 'mg/L', 0, 5000, 'P-007', '膜池', NOW(), NOW()),
('p7-sensor-3', '跨膜压差', 'pressure', 'kPa', -100, 100, 'P-007', '膜池', NOW(), NOW()),

-- 消毒池 (P-008)
('p8-sensor-1', '液位', 'level', 'm', 1, 5, 'P-008', '消毒池', NOW(), NOW()),
('p8-sensor-2', '余氯', 'clorine', 'mg/L', 0, 10, 'P-008', '消毒池', NOW(), NOW()),

-- 污泥浓缩池 (P-009)
('p9-sensor-2', '液位', 'level', 'm', 1, 5, 'P-009', '污泥浓缩池', NOW(), NOW()),
('p9-sensor-3', '污泥浓度', 'cod', 'mg/L', 0, 5000, 'P-009', '污泥浓缩池', NOW(), NOW());


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
-- 数据生成完毕
-- =============================================
