import React, { useState } from 'react';
import { signUp, signIn } from '@/utils/authHelper';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp?: (email: string, password: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp) {
        // 注册
        if (!email.trim() || !password.trim()) {
          setError('请输入邮箱和密码');
          setIsLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('密码至少需要6个字符');
          setIsLoading(false);
          return;
        }

        const { user, session, error: signUpError, requiresEmailConfirmation } = await signUp(
          email.trim(), 
          password, 
          nickname.trim() || undefined
        );
        
        if (signUpError) {
          setError(signUpError.message || '注册失败，请重试');
          setIsLoading(false);
          return;
        }

        if (user) {
          if (session) {
            // 有 session，说明注册成功且已自动登录（未启用邮箱验证）
            if (onSignUp) {
              await onSignUp(email, password);
            }
            // 登录成功后重置表单并关闭
            setEmail('');
            setPassword('');
            setNickname('');
            setError('');
            onClose();
          } else if (requiresEmailConfirmation) {
            // 需要邮箱验证
            alert('注册成功！\n\n请检查您的邮箱并点击验证链接完成注册，然后使用注册的账号密码登录。');
            // 切换到登录模式，方便用户验证后登录
            setIsSignUp(false);
            setError('');
            setPassword(''); // 清空密码，让用户重新输入
            setIsLoading(false);
          } else {
            // 其他情况，提示用户登录
            alert('注册成功！\n\n请使用注册的账号密码登录。');
            setIsSignUp(false);
            setError('');
            setPassword('');
            setIsLoading(false);
          }
        }
      } else {
        // 登录
        if (!email.trim() || !password.trim()) {
          setError('请输入邮箱和密码');
          setIsLoading(false);
          return;
        }

        const { user, error: signInError } = await signIn(email.trim(), password);
        
        if (signInError) {
          setError(signInError.message || '登录失败，请检查邮箱和密码');
          setIsLoading(false);
          return;
        }

        if (user) {
          // 登录成功，调用父组件的onLogin
          await onLogin(email, password);
          // 登录成功后重置表单并关闭
          setEmail('');
          setPassword('');
          setError('');
          onClose();
        }
      }
    } catch (err: any) {
      setError(err.message || '操作失败，请重试');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-md mx-4 border border-stone-200">
        <div className="p-6 border-b border-stone-200 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-stone-900 font-serif">
            {isSignUp ? '注册账号' : '用户登录'}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 text-2xl transition-colors"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm">
              {error}
            </div>
          )}

          {isSignUp && (
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-2">
                昵称（可选）
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                maxLength={20}
                disabled={isLoading}
                className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red"
                placeholder="请输入昵称（可选）"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red"
              placeholder="请输入邮箱"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              密码
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              disabled={isLoading}
              className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red"
              placeholder="请输入密码（至少6位）"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-primary-red text-white rounded-lg hover:bg-[#A0353C] transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '处理中...' : isSignUp ? '注册' : '登录'}
          </button>

          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setNickname('');
              }}
              disabled={isLoading}
              className="text-sm text-primary-red hover:underline font-bold disabled:opacity-50"
            >
              {isSignUp ? '已有账号？立即登录' : '还没有账号？立即注册'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
