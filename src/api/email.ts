import { supabase } from './supabase'

/**
 * Send verification code to email
 * Note: This stores the code in the database. In production, you would
 * send the actual email via an email service or Edge Function.
 */
export async function sendVerificationCode(email: string) {
  try {
    // Generate a 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString()

    // Calculate expiration time (5 minutes from now)
    const expirationTime = new Date()
    expirationTime.setMinutes(expirationTime.getMinutes() + 5)

    // Store the verification code in the database
    const { error: dbError } = await supabase
      .from('email_verification_codes')
      .insert({
        email,
        code,
        expires_at: expirationTime.toISOString(),
      })

    if (dbError) {
      throw new Error('Failed to generate verification code')
    }

    // TODO: Implement actual email sending
    // In production, you would:
    // 1. Call a Supabase Edge Function that sends the email
    // 2. Use a service like Resend, SendGrid, Mailgun, or SES
    // 3. Or use Supabase Auth's built-in email verification

    return { success: true, code } // Return code for development
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to send verification code',
    }
  }
}

/**
 * Verify email code
 */
export async function verifyEmailCode(email: string, code: string) {
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
      return {
        success: false,
        error: 'Invalid or expired verification code',
      }
    }

    // Mark the code as used
    await supabase
      .from('email_verification_codes')
      .update({ used: true })
      .eq('id', data.id)

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to verify code',
    }
  }
}

/**
 * Check if verification code is valid
 */
export async function isCodeValid(email: string, code: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('email_verification_codes')
      .select('id')
      .eq('email', email)
      .eq('code', code)
      .eq('used', false)
      .gte('expires_at', new Date().toISOString())
      .single()

    return !!data && !error
  } catch {
    return false
  }
}

/**
 * Resend verification code
 */
export async function resendVerificationCode(email: string) {
  try {
    // First, mark all previous codes for this email as used
    await supabase
      .from('email_verification_codes')
      .update({ used: true })
      .eq('email', email)
      .eq('used', false)

    // Then send a new code
    return await sendVerificationCode(email)
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to resend verification code',
    }
  }
}