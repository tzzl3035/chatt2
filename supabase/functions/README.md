# Edge Function 部署说明

## 功能说明

`register` Edge Function 用于处理用户注册，绕过 Supabase Auth 的频率限制。

## 部署步骤

### 1. 安装 Supabase CLI

```bash
# 使用 npm
npm install -g supabase

# 或使用 pnpm
pnpm add -g supabase
```

### 2. 登录 Supabase

```bash
supabase login
```

### 3. 链接到你的项目

```bash
supabase link --project-ref neztnlgkvuulmgegujce
```

### 4. 部署 Edge Function

```bash
supabase functions deploy register
```

### 5. 设置环境变量（如果需要）

Edge Function 会自动使用项目的环境变量，无需额外配置。

## 环境变量

Edge Function 使用以下环境变量（自动从项目配置获取）：

- `SUPABASE_URL`: Supabase 项目 URL
- `SERVICE_ROLE_KEY`: Supabase Service Role Key（需要手动配置）

## 配置 Service Role Key

### 在 Supabase 控制台获取 Service Role Key

1. 访问 https://supabase.com/dashboard
2. 选择项目：neztnlgkvuulmgegujce
3. 进入 **Settings** > **API**
4. 复制 **service_role** secret（注意：这是敏感信息，不要泄露）

### 设置环境变量

```bash
supabase secrets set SERVICE_ROLE_KEY=your_service_role_key
```

或者在 Supabase 控制台中设置：

1. 进入 **Settings** > **Edge Functions**
2. 添加环境变量：
   - Name: `SERVICE_ROLE_KEY`
   - Value: 你的 Service Role Key

## 验证部署

部署后，可以通过以下命令查看已部署的函数：

```bash
supabase functions list
```

## 本地开发（可选）

如果需要在本地测试 Edge Function：

```bash
# 启动本地开发服务器
supabase functions serve

# 测试函数
curl -i --location --request POST 'http://localhost:54321/functions/v1/register' \
  --header 'Authorization: Bearer your_anon_key' \
  --header 'Content-Type: application/json' \
  --data-raw '{"username":"testuser","password":"password123"}'
```

## 故障排除

### 问题：部署失败

- 检查是否已正确安装 Supabase CLI
- 确认已正确登录 Supabase
- 检查项目引用是否正确

### 问题：函数调用失败

- 检查 Service Role Key 是否正确设置
- 查看函数日志：`supabase functions logs register`
- 确认数据库中 `profiles` 表存在

### 问题：401 Unauthorized

- 检查匿名密钥是否正确
- 确认 Edge Function 已正确部署