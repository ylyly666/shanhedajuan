import React, { useState, useEffect } from 'react';

interface User {
  email: string;
  name?: string;
  avatar?: string;
  bio?: string;
  createdAt?: string;
}

interface ProfilePageProps {
  user: User;
  onBack: () => void;
  onUpdate: (updatedUser: User) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ user, onBack, onUpdate }) => {
  const [editMode, setEditMode] = useState(false);
  const [name, setName] = useState(user.name || '');
  const [bio, setBio] = useState(user.bio || '');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setName(user.name || '');
    setBio(user.bio || '');
  }, [user]);

  const handleSave = async () => {
    if (!name.trim()) {
      setSaveMessage('昵称不能为空');
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    setIsSaving(true);
    setSaveMessage(null);

    try {
      // 模拟保存延迟
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const updatedUser: User = {
        ...user,
        name: name.trim(),
        bio: bio.trim(),
      };

      onUpdate(updatedUser);
      setEditMode(false);
      setSaveMessage('保存成功！');
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      setSaveMessage('保存失败，请重试');
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setName(user.name || '');
    setBio(user.bio || '');
    setEditMode(false);
    setSaveMessage(null);
  };

  const getInitials = (name: string, email: string) => {
    if (name) {
      return name.substring(0, 2).toUpperCase();
    }
    return email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-paper">
      <nav className="bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex justify-between items-center">
            <button
              onClick={onBack}
              className="text-2xl font-bold text-primary-red tracking-wider flex items-center gap-2 font-serif hover:opacity-80 transition-opacity"
            >
              <span className="text-3xl">⛰️</span>
              <span>山河答卷</span>
            </button>
            <button
              onClick={onBack}
              className="px-4 py-2 text-sm font-medium text-stone-700 hover:text-primary-red hover:bg-red-50 rounded-lg transition-all"
            >
              返回首页
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        <div className="glass rounded-lg shadow-paper p-8 border border-ink-light">
          {/* 头像和基本信息 */}
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-8 pb-8 border-b border-ink-light">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-full bg-primary-red text-white flex items-center justify-center text-3xl font-bold shadow-lg">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name || user.email} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <span>{getInitials(user.name || '', user.email)}</span>
                )}
              </div>
            </div>
            <div className="flex-1">
              {editMode ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      昵称 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="请输入昵称"
                      className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-stone-700 mb-2">
                      个人简介
                    </label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="介绍一下自己..."
                      rows={3}
                      className="w-full px-4 py-2 border-2 border-stone-300 rounded-lg focus:outline-none focus:border-primary-red resize-none"
                      maxLength={200}
                    />
                    <div className="text-xs text-stone-500 mt-1 text-right">
                      {bio.length}/200
                    </div>
                  </div>
                  {saveMessage && (
                    <div className={`px-4 py-2 rounded-md text-sm ${
                      saveMessage.includes('成功') 
                        ? 'bg-green-50 text-green-700 border border-green-200' 
                        : 'bg-red-50 text-red-700 border border-red-200'
                    }`}>
                      {saveMessage}
                    </div>
                  )}
                  <div className="flex gap-3">
                    <button
                      onClick={handleSave}
                      disabled={isSaving || !name.trim()}
                      className="px-6 py-2 bg-primary-red text-white rounded-lg hover:bg-[#A0353C] transition-all font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? '保存中...' : '保存'}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="px-6 py-2 bg-stone-200 text-stone-700 rounded-lg hover:bg-stone-300 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      取消
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <h1 className="text-3xl font-bold text-ink mb-2 font-serif">
                    {user.name || '未设置昵称'}
                  </h1>
                  <p className="text-stone-600 mb-2">{user.email}</p>
                  {user.bio && (
                    <p className="text-stone-700 leading-relaxed mb-4">{user.bio}</p>
                  )}
                  {user.createdAt && (
                    <p className="text-xs text-stone-500">
                      注册时间：{new Date(user.createdAt).toLocaleDateString('zh-CN')}
                    </p>
                  )}
                  <button
                    onClick={() => setEditMode(true)}
                    className="mt-4 px-4 py-2 bg-primary-red/10 hover:bg-primary-red/20 text-primary-red border border-primary-red/30 rounded-md text-sm font-bold transition"
                  >
                    编辑资料
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 统计信息 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-red mb-1 font-serif">0</div>
              <div className="text-sm text-stone-600">创建的案例</div>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-red mb-1 font-serif">0</div>
              <div className="text-sm text-stone-600">投稿数量</div>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-red mb-1 font-serif">0</div>
              <div className="text-sm text-stone-600">获得点赞</div>
            </div>
            <div className="text-center p-4 bg-stone-50 rounded-lg">
              <div className="text-2xl font-bold text-primary-red mb-1 font-serif">0</div>
              <div className="text-sm text-stone-600">互动次数</div>
            </div>
          </div>

          {/* 账户设置 */}
          <div className="border-t border-ink-light pt-6">
            <h2 className="text-xl font-bold text-ink mb-4 font-serif">账户设置</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                <div>
                  <div className="font-bold text-stone-900">邮箱地址</div>
                  <div className="text-sm text-stone-600">{user.email}</div>
                </div>
                <span className="text-xs text-stone-500">不可修改</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-lg">
                <div>
                  <div className="font-bold text-stone-900">账户状态</div>
                  <div className="text-sm text-stone-600">正常</div>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-bold">已验证</span>
              </div>
            </div>
          </div>
        </div>

        {/* 我的活动 */}
        <div className="mt-8 glass rounded-lg shadow-paper p-8 border border-ink-light">
          <h2 className="text-xl font-bold text-ink mb-4 font-serif">我的活动</h2>
          <div className="text-center py-12 text-stone-500">
            <div className="text-4xl mb-4">📊</div>
            <p>暂无活动记录</p>
            <p className="text-sm mt-2">您的投稿、点赞、评论等活动将显示在这里</p>
          </div>
        </div>
      </main>

      <footer className="bg-ink text-white/60 py-8 mt-16">
        <div className="max-w-7xl mx-auto px-6 text-center text-sm">
          <p>© 2024 山河答卷 - 基层治理沉浸式策略学习平台</p>
        </div>
      </footer>
    </div>
  );
};

export default ProfilePage;

