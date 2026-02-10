import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    console.log('=== Register Function Called ===')
    console.log('Method:', req.method)
    console.log('Headers:', Object.fromEntries(req.headers.entries()))
    
    // 只允许 POST 请求
    if (req.method !== 'POST') {
      return new Response(
        JSON.stringify({ error: 'Method not allowed' }),
        { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const { username, password } = await req.json()
    
    console.log('Received:', { username, passwordLength: password?.length })

    if (!username || !password) {
      console.error('Missing username or password')
      return new Response(
        JSON.stringify({ error: '用户名和密码不能为空' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 创建 Supabase 客户端
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceKey = Deno.env.get('SERVICE_ROLE_KEY')

    console.log('Environment check:', { 
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey 
    })

    if (!supabaseUrl) {
      console.error('SUPABASE_URL is not set')
      return new Response(
        JSON.stringify({ error: 'SUPABASE_URL 未配置' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

if (!supabaseServiceKey) {
      console.error('SERVICE_ROLE_KEY is not set')
      return new Response(
        JSON.stringify({ error: 'Service Role Key 未配置' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // 检查用户名是否已存在
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle()

    if (checkError) {
      console.error('Check username error:', checkError)
      return new Response(
        JSON.stringify({ error: '注册失败，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (existingUser) {
      return new Response(
        JSON.stringify({ error: '该用户名已被占用，请选择其他用户名' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 生成随机邮箱
    const randomStr = Math.random().toString(36).substring(2, 15)
    const randomEmail = `${username}_${randomStr}@noemail.invalid`

    // 创建用户（使用 service role key 绕过频率限制）
    const { data: authData, error: signUpError } = await supabase.auth.admin.createUser({
      email: randomEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        username: username,
      },
    })

    if (signUpError) {
      console.error('Create user error:', signUpError)
      return new Response(
        JSON.stringify({ error: `注册失败: ${signUpError.message}` }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (!authData.user) {
      return new Response(
        JSON.stringify({ error: '注册失败: 未创建用户' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // 创建 profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        username: username,
        email: randomEmail,
      })

    if (profileError) {
      console.error('Create profile error:', profileError)
      // 删除已创建的用户
      await supabase.auth.admin.deleteUser(authData.user.id)
      return new Response(
        JSON.stringify({ error: '创建用户资料失败，请稍后重试' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ success: true, userId: authData.user.id }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Register error:', error)
    return new Response(
      JSON.stringify({ error: '注册失败，请稍后重试' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})