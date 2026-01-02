/**
 * 认证辅助函数（使用 Supabase Auth）
 */

import { supabase } from './supabaseClient';

export interface AuthUser {
  id: string;
  email?: string;
}

/**
 * 注册新用户
 * 返回：{ user, session, error, requiresEmailConfirmation }
 */
export async function signUp(
  email: string, 
  password: string, 
  nickname?: string
): Promise<{ 
  user: AuthUser | null; 
  session: any | null;
  error: any;
  requiresEmailConfirmation: boolean;
}> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nickname: nickname || '未命名用户',
        },
      },
    });

    if (error) {
      return { user: null, session: null, error, requiresEmailConfirmation: false };
    }

    // 如果返回了 session，说明注册成功且已自动登录（未启用邮箱验证）
    // 如果没有 session，说明需要邮箱验证
    const requiresEmailConfirmation = !data.session;
    const user = data.user ? { id: data.user.id, email: data.user.email } : null;

    return { 
      user, 
      session: data.session,
      error: null,
      requiresEmailConfirmation
    };
  } catch (error: any) {
    return { user: null, session: null, error, requiresEmailConfirmation: false };
  }
}

/**
 * 登录
 */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { user: null, error };
    }

    return { user: data.user ? { id: data.user.id, email: data.user.email } : null, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
}

/**
 * 登出
 */
export async function signOut(): Promise<{ error: any }> {
  try {
    const { error } = await supabase.auth.signOut();
    return { error };
  } catch (error: any) {
    return { error };
  }
}

/**
 * 获取当前用户
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return null;
    }
    return { id: user.id, email: user.email };
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
}

/**
 * 获取当前用户的 ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id || null;
}

/**
 * 获取当前会话
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) {
      return null;
    }
    return session;
  } catch (error) {
    console.error('获取会话失败:', error);
    return null;
  }
}

