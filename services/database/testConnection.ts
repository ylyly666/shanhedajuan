// Supabase连接测试工具
import { getCasesFromSupabase } from './supabase';

export const testSupabaseConnection = async (): Promise<{
  success: boolean;
  message: string;
  caseCount?: number;
}> => {
  try {
    const cases = await getCasesFromSupabase({ limit: 1 });
    return {
      success: true,
      message: 'Supabase连接成功',
      caseCount: cases.length,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `连接失败: ${error.message}`,
    };
  }
};

