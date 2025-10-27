import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import PublishModule from '@/components/modules/PublishModule';
import RepostModule from '@/components/modules/RepostModule';
import LikeModule from '@/components/modules/LikeModule';
import DatabaseModule from '@/components/modules/DatabaseModule';
import SettingsModule from '@/components/modules/SettingsModule';
import HistoryModule from '@/components/modules/HistoryModule';

type ModuleType = 'dashboard' | 'publish' | 'repost' | 'like' | 'database' | 'settings' | 'history';

const Index = () => {
  const [activeModule, setActiveModule] = useState<ModuleType>('dashboard');

  const modules = [
    {
      id: 'publish' as ModuleType,
      title: 'Публикация постов',
      description: 'Планирование и автоматическая публикация контента',
      icon: 'Send',
      color: 'text-blue-600',
      stats: { scheduled: 12, published: 145 }
    },
    {
      id: 'repost' as ModuleType,
      title: 'Репосты',
      description: 'Автоматическое распространение контента',
      icon: 'Repeat',
      color: 'text-green-600',
      stats: { active: 8, total: 234 }
    },
    {
      id: 'like' as ModuleType,
      title: 'Массовый лайк',
      description: 'Автоматическое взаимодействие с аудиторией',
      icon: 'Heart',
      color: 'text-pink-600',
      stats: { today: 156, total: 3420 }
    },
    {
      id: 'database' as ModuleType,
      title: 'Управление БД',
      description: 'Редактирование групп, постов и токенов',
      icon: 'Database',
      color: 'text-purple-600',
      stats: { groups: 24, posts: 89 }
    },
    {
      id: 'settings' as ModuleType,
      title: 'Настройки',
      description: 'Конфигурация системы и параметров',
      icon: 'Settings',
      color: 'text-gray-600',
      stats: null
    },
    {
      id: 'history' as ModuleType,
      title: 'История действий',
      description: 'Логи и отчеты по всем операциям',
      icon: 'History',
      color: 'text-orange-600',
      stats: { today: 45, week: 312 }
    }
  ];

  const renderModule = () => {
    switch (activeModule) {
      case 'publish':
        return <PublishModule onBack={() => setActiveModule('dashboard')} />;
      case 'repost':
        return <RepostModule onBack={() => setActiveModule('dashboard')} />;
      case 'like':
        return <LikeModule onBack={() => setActiveModule('dashboard')} />;
      case 'database':
        return <DatabaseModule onBack={() => setActiveModule('dashboard')} />;
      case 'settings':
        return <SettingsModule onBack={() => setActiveModule('dashboard')} />;
      case 'history':
        return <HistoryModule onBack={() => setActiveModule('dashboard')} />;
      default:
        return null;
    }
  };

  if (activeModule !== 'dashboard') {
    return <div className="min-h-screen bg-background">{renderModule()}</div>;
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-4xl font-bold text-foreground">VK Manager Pro</h1>
            <Badge variant="secondary" className="text-sm px-3 py-1">
              <Icon name="Activity" size={16} className="mr-2" />
              Активно
            </Badge>
          </div>
          <p className="text-muted-foreground text-lg">
            Профессиональная панель управления ВКонтакте
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <Card
              key={module.id}
              className="hover-scale cursor-pointer transition-shadow hover:shadow-lg fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
              onClick={() => setActiveModule(module.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className={`p-3 rounded-lg bg-muted ${module.color}`}>
                    <Icon name={module.icon} size={24} />
                  </div>
                  {module.stats && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-foreground">
                        {Object.values(module.stats)[0]}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {Object.keys(module.stats)[0]}
                      </div>
                    </div>
                  )}
                </div>
                <CardTitle className="text-xl mt-4">{module.title}</CardTitle>
                <CardDescription className="text-sm">{module.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="ghost" className="w-full justify-between group">
                  Открыть модуль
                  <Icon
                    name="ArrowRight"
                    size={16}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 fade-in" style={{ animationDelay: '0.6s' }}>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Активных задач
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">28</div>
              <p className="text-xs text-muted-foreground mt-1">+12 за последний час</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Групп в базе
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">24</div>
              <p className="text-xs text-muted-foreground mt-1">Во всех категориях</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Постов готово
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">89</div>
              <p className="text-xs text-muted-foreground mt-1">+5 добавлено сегодня</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
