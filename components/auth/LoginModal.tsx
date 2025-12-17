import React, { useState } from 'react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (email: string, password: string) => Promise<void>;
  onSignUp?: (email: string, password: string) => Promise<void>;
}

const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLogin, onSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (isSignUp && onSignUp) {
        await onSignUp(email, password);
      } else {
        await onLogin(email, password);
      }
      // 登录成功后重置表单并关闭
      setEmail('');
      setPassword('');
      setError('');
      onClose();
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
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

          <div>
            <label className="block text-sm font-bold text-stone-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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
              }}
              className="text-sm text-primary-red hover:underline font-bold"
            >
              {isSignUp ? '已有账号？立即登录' : '还没有账号？立即注册'}
            </button>
          </div>

          {/* 演示模式提示 */}
          <div className="pt-4 border-t border-stone-200">
            <p className="text-xs text-stone-500 text-center">
              提示：当前为演示模式，您可以使用任意邮箱和密码登录
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginModal;
