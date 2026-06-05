<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { User, Lock, Eye, EyeOff } from 'lucide-vue-next';

const router = useRouter();

const username = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');

const usernameError = computed(() => {
  if (!username.value) return '';
  if (username.value.length < 2) return '用户名至少2个字符';
  return '';
});

const passwordError = computed(() => {
  if (!password.value) return '';
  if (password.value.length < 6) return '密码至少6个字符';
  return '';
});

function handleLogin() {
  if (!username.value.trim()) {
    errorMsg.value = '请输入用户名';
    return;
  }
  if (password.value.length < 6) {
    errorMsg.value = '密码至少6个字符';
    return;
  }
  errorMsg.value = '';
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    router.push('/');
  }, 1200);
}
</script>

<template>
  <div class="login-page">
    <!-- 背景网格 -->
    <div class="bg-grid"></div>

    <!-- 背景光晕 -->
    <div class="bg-glow bg-glow-1"></div>
    <div class="bg-glow bg-glow-2"></div>

    <!-- 顶部 Logo -->
    <div class="login-header">
      <div class="header-logo">
        <img src="/logo.png" alt="logo" class="header-logo-img" />
        <span class="header-logo-text">嘉然环保</span>
      </div>
    </div>

    <!-- 主体内容 -->
    <div class="login-body">
      <!-- 右侧登录表单 -->
      <div class="login-form-wrapper">
        <div class="login-form">
          <h2 class="form-title">污水净化监控平台</h2>

          <div class="form-body">
            <!-- 用户名 -->
            <div class="form-item">
              <label class="form-label">用户名/邮箱/手机号</label>
              <div class="input-wrapper" :class="{ error: usernameError }">
                <User :size="16" class="input-icon" />
                <input
                  v-model="username"
                  type="text"
                  placeholder="Admin"
                  class="form-input"
                  @keyup.enter="handleLogin"
                />
              </div>
              <span class="error-text" v-if="usernameError">{{ usernameError }}</span>
            </div>

            <!-- 密码 -->
            <div class="form-item">
              <label class="form-label">密码</label>
              <div class="input-wrapper" :class="{ error: passwordError }">
                <Lock :size="16" class="input-icon" />
                <input
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="请输入密码"
                  class="form-input"
                  @keyup.enter="handleLogin"
                />
                <button class="eye-btn" @click="showPassword = !showPassword" type="button">
                  <Eye v-if="showPassword" :size="16" />
                  <EyeOff v-else :size="16" />
                </button>
              </div>
              <span class="error-text" v-if="passwordError">{{ passwordError }}</span>
            </div>

            <!-- 错误提示 -->
            <div class="error-alert" v-if="errorMsg">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="alert-icon">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span>{{ errorMsg }}</span>
            </div>

            <!-- 登录按钮 -->
            <button
              class="login-btn"
              :class="{ loading: isLoading }"
              :disabled="isLoading"
              @click="handleLogin"
            >
              <span v-if="!isLoading">登录</span>
              <span v-else class="loading-spinner"></span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部版权 -->
    <div class="login-footer">
      <p>Copyright © 2015-2021 Tencent BlueKing. All Rights Reserved.</p>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  width: 100vw;
  height: 100vh;
  background: linear-gradient(135deg, #0a1a3a 0%, #0d1f45 30%, #0a1630 70%, #081225 100%);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 背景网格 */
.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 1px 1px, rgba(0, 150, 255, 0.06) 1px, transparent 0);
  background-size: 30px 30px;
  pointer-events: none;
  z-index: 0;
}

/* 背景光晕 */
.bg-glow {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  pointer-events: none;
  z-index: 0;
}

.bg-glow-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(0, 100, 255, 0.15) 0%, transparent 70%);
  left: -100px;
  top: -100px;
}

.bg-glow-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(0, 180, 255, 0.1) 0%, transparent 70%);
  right: -50px;
  bottom: -100px;
}

/* 顶部 Header */
.login-header {
  padding: 24px 40px;
  position: relative;
  z-index: 10;
}

.header-logo {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-logo-img {
  width: 36px;
  height: 36px;
  object-fit: contain;
  filter: brightness(1.2);
}

.header-logo-text {
  font-family: 'DOUYU Font', 'Noto Sans SC', sans-serif;
  font-size: 16px;
  font-weight: 700;
  color: #ffffff;
  letter-spacing: 2px;
}

/* 主体 */
.login-body {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 60px;
  position: relative;
  z-index: 5;
}

/* 右侧表单 */
.login-form-wrapper {
  width: 340px;
  flex-shrink: 0;
}

.login-form {
  background: rgba(8, 16, 35, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.12);
  border-radius: 8px;
  padding: 36px 28px;
  backdrop-filter: blur(8px);
}

.form-title {
  font-family: 'DOUYU Font', 'Noto Sans SC', sans-serif;
  font-size: 20px;
  font-weight: 900;
  color: #ffffff;
  text-align: center;
  letter-spacing: 3px;
  margin-bottom: 28px;
  text-shadow: 0 0 12px rgba(0, 212, 255, 0.3);
}

.form-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.form-label {
  font-size: 11px;
  color: rgba(180, 200, 235, 0.85);
  letter-spacing: 0.5px;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  background: rgba(0, 25, 55, 0.5);
  border: 1px solid rgba(0, 150, 255, 0.15);
  border-radius: 4px;
  transition: all 0.3s ease;
}

.input-wrapper:focus-within {
  border-color: rgba(0, 150, 255, 0.4);
  background: rgba(0, 35, 70, 0.5);
  box-shadow: 0 0 10px rgba(0, 120, 255, 0.1);
}

.input-wrapper.error {
  border-color: rgba(255, 80, 80, 0.5);
  background: rgba(50, 15, 15, 0.3);
}

.input-icon {
  position: absolute;
  left: 12px;
  color: rgba(0, 180, 255, 0.4);
  z-index: 2;
}

.form-input {
  width: 100%;
  height: 38px;
  padding: 0 38px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 13px;
  outline: none;
}

.form-input::placeholder {
  color: rgba(160, 180, 220, 0.5);
}

.eye-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: rgba(0, 180, 255, 0.4);
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  transition: color 0.3s ease;
}

.eye-btn:hover {
  color: rgba(0, 200, 255, 0.7);
}

.error-text {
  font-size: 11px;
  color: rgba(255, 100, 100, 0.8);
  padding-left: 2px;
}

/* 选项 */
.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
}

.remember-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
}

.checkbox {
  display: none;
}

.check-custom {
  width: 13px;
  height: 13px;
  border: 1px solid rgba(0, 150, 255, 0.35);
  border-radius: 2px;
  background: rgba(0, 25, 55, 0.4);
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .check-custom {
  background: rgba(0, 150, 255, 0.3);
  border-color: rgba(0, 180, 255, 0.6);
}

.checkbox:checked + .check-custom::after {
  content: '';
  position: absolute;
  left: 3px;
  top: 0;
  width: 4px;
  height: 7px;
  border: solid #00d4ff;
  border-width: 0 1.5px 1.5px 0;
  transform: rotate(45deg);
}

.remember-text {
  color: rgba(140, 170, 220, 0.5);
}

.forgot-link {
  color: rgba(0, 180, 255, 0.5);
  text-decoration: none;
  transition: color 0.3s ease;
}

.forgot-link:hover {
  color: #00d4ff;
}

/* 错误提示 */
.error-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: rgba(255, 60, 60, 0.1);
  border: 1px solid rgba(255, 80, 80, 0.2);
  border-radius: 4px;
  color: rgba(255, 120, 120, 0.9);
  font-size: 12px;
}

.alert-icon {
  width: 16px;
  height: 16px;
  flex-shrink: 0;
}

/* 登录按钮 */
.login-btn {
  width: 100%;
  height: 40px;
  background: linear-gradient(90deg, #0055dd, #0077ff);
  border: none;
  border-radius: 4px;
  color: #ffffff;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 2px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.login-btn:hover:not(:disabled) {
  background: linear-gradient(90deg, #0066ee, #0088ff);
  box-shadow: 0 4px 15px rgba(0, 100, 255, 0.35);
}

.login-btn:active:not(:disabled) {
  transform: scale(0.98);
}

.login-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-spinner {
  display: inline-block;
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.25);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* 注册链接 */
.register-link {
  text-align: center;
  font-size: 11px;
  color: rgba(140, 170, 220, 0.4);
}

.register-link a {
  color: rgba(0, 180, 255, 0.6);
  text-decoration: none;
  transition: color 0.3s ease;
}

.register-link a:hover {
  color: #00d4ff;
}

/* 底部版权 */
.login-footer {
  padding: 16px;
  text-align: center;
  font-size: 10px;
  color: rgba(140, 170, 220, 0.25);
  position: relative;
  z-index: 10;
}

/* 响应式 */
@media (max-width: 900px) {
  .login-illustration {
    display: none;
  }

  .login-body {
    gap: 0;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .login-form-wrapper {
    width: 100%;
    padding: 0 16px;
  }

  .login-form {
    padding: 28px 20px;
  }
}
</style>
