<script setup lang="ts">
import { RouterLink } from 'vue-router'

</script>

<template>
  <div class="home-view">
    
    <div class="hero-section">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="gradient-text">chatt2</span>
        </h1>
        <p class="hero-subtitle">实时聊天室，连接你我</p>
        <p class="hero-description">
          一个简单、快速、安全的实时聊天平台。创建或加入聊天室，与朋友即时交流。
        </p>

        <div class="hero-actions">
          <RouterLink to="/login" class="btn btn-primary">
            立即登录
          </RouterLink>
        </div>

        <div class="hero-features">
          <div class="feature-item">
            <div class="feature-icon">⚡</div>
            <div class="feature-text">实时消息</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">🔒</div>
            <div class="feature-text">安全可靠</div>
          </div>
          <div class="feature-item">
            <div class="feature-icon">💬</div>
            <div class="feature-text">多聊天室</div>
          </div>
        </div>
      </div>
    </div>

    <div class="info-section">
      <div class="info-content">
        <h2 class="section-title">为什么选择 chatt2？</h2>

        <div class="feature-cards">
          <div class="feature-card">
            <div class="feature-card-icon">🚀</div>
            <h3 class="feature-card-title">快速响应</h3>
            <p class="feature-card-description">
              基于现代技术栈构建，确保消息实时同步，无延迟交流体验。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-card-icon">🎨</div>
            <h3 class="feature-card-title">简洁美观</h3>
            <p class="feature-card-description">
              清新简洁的界面设计，专注于提供流畅的用户体验。
            </p>
          </div>

          <div class="feature-card">
            <div class="feature-card-icon">🌐</div>
            <h3 class="feature-card-title">随时访问</h3>
            <p class="feature-card-description">
              基于浏览器，无需下载安装，随时随地开始聊天。
            </p>
          </div>
        </div>
      </div>
    </div>

    <div class="cta-section">
      <div class="cta-content">
        <h2 class="cta-title">准备好开始聊天了吗？</h2>
        <p class="cta-description">立即登录，加入我们的聊天社区</p>
        <RouterLink to="/login" class="btn btn-large">
          立即登录
        </RouterLink>
      </div>
    </div>

    <footer class="home-footer">
      <p>&copy; 2024 chatt2. All rights reserved.</p>
    </footer>
  </div>
</template>

<style scoped>
.home-view {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.theme-toggle-wrapper {
  position: fixed;
  top: 1.5rem;
  right: 1.5rem;
  z-index: 1000;
}

.hero-section {
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--text-primary);
  padding: 2rem 1rem;
}

.hero-content {
  max-width: 800px;
  text-align: center;
  color: var(--background-primary);
}

.hero-title {
  margin: 0 0 1rem 0;
  font-size: 4rem;
  font-weight: 800;
  line-height: 1.1;
}

.gradient-text {
  background: linear-gradient(135deg, var(--background-primary) 0%, var(--background-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0 0 1.5rem 0;
  font-size: 1.5rem;
  font-weight: 500;
  opacity: 0.95;
}

.hero-description {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 3rem;
}

.btn {
  padding: 0.875rem 2rem;
  border-radius: var(--radius-md);
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-primary {
  background: var(--background-primary);
  color: var(--text-primary);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.btn-secondary {
  background: transparent;
  color: var(--background-primary);
  border: 2px solid rgba(255, 255, 255, 0.3);
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.btn-large {
  padding: 1rem 3rem;
  font-size: 1.125rem;
}

.hero-features {
  display: flex;
  gap: 3rem;
  justify-content: center;
  flex-wrap: wrap;
}

.feature-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.feature-icon {
  font-size: 2rem;
}

.feature-text {
  font-size: 0.9375rem;
  font-weight: 500;
  opacity: 0.9;
}

.info-section {
  padding: 5rem 1rem;
  background: var(--background-primary);
}

.info-content {
  max-width: 1200px;
  margin: 0 auto;
}

.section-title {
  margin: 0 0 3rem 0;
  font-size: 2.25rem;
  font-weight: 700;
  text-align: center;
  color: var(--text-primary);
}

.feature-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  padding: 2rem;
  background: var(--background-secondary);
  border-radius: var(--radius-lg);
  text-align: center;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-lg);
}

.feature-card-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card-title {
  margin: 0 0 0.75rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feature-card-description {
  margin: 0;
  font-size: 0.9375rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.cta-section {
  padding: 5rem 1rem;
  background: var(--background-secondary);
  text-align: center;
}

.cta-content {
  max-width: 600px;
  margin: 0 auto;
}

.cta-title {
  margin: 0 0 1rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.cta-description {
  margin: 0 0 2rem 0;
  font-size: 1.125rem;
  color: var(--text-secondary);
}

.cta-section .btn {
  background: var(--text-primary);
  color: var(--background-primary);
}

.cta-section .btn:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.home-footer {
  padding: 2rem 1rem;
  background: var(--text-primary);
  color: var(--text-tertiary);
  text-align: center;
  font-size: 0.875rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2.5rem;
  }

  .hero-subtitle {
    font-size: 1.25rem;
  }

  .hero-description {
    font-size: 1rem;
  }

  .hero-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
  }

  .hero-features {
    gap: 2rem;
  }

  .feature-cards {
    grid-template-columns: 1fr;
  }
}
</style>