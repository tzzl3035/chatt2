import { supabase } from '@/api/supabase'

// Generate a 6-digit verification code
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Calculate expiration time (5 minutes from now)
export function getExpirationTime(): string {
  const expiration = new Date()
  expiration.setMinutes(expiration.getMinutes() + 5)
  return expiration.toISOString()
}

// Check if a verification code is expired
export function isCodeExpired(expiresAt: string): boolean {
  return new Date() > new Date(expiresAt)
}

// Send verification code via email
// Note: This is a placeholder. In production, you would use:
// 1. Supabase Auth email templates
// 2. Resend, SendGrid, or another email service
// 3. Supabase Edge Function to send emails
export async function sendVerificationEmail(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Store the verification code in the database
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .insert({
        email,
        code,
        expires_at: getExpirationTime(),
      })

    if (dbError) {
      return { success: false, error: 'Failed to generate verification code' }
    }

    // TODO: Implement actual email sending logic
    // In production, you would:
    // 1. Call an Edge Function that sends the email
    // 2. Use a service like Resend, SendGrid, or SES
    // 3. Or use Supabase Auth's built-in email verification

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to send verification email' }
  }
}

// Verify the email code
export async function verifyEmailCode(email: string, code: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    if (error || !data) {
      return { success: false, error: 'Invalid or expired verification code' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: 'Failed to verify code' }
  }
}