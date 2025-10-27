import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PublishModuleProps {
  onBack: () => void;
}

type Step = 'groups' | 'posts' | 'settings' | 'execution';

const PublishModule = ({ onBack }: PublishModuleProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('groups');
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const mockGroups = [
    { id: '1', name: 'Образовательный портал', category: 'Образование', members: 15420 },
    { id: '2', name: 'Технологии будущего', category: 'Технологии', members: 8930 },
    { id: '3', name: 'Бизнес-советы', category: 'Бизнес', members: 12100 },
    { id: '4', name: 'Развлекательный контент', category: 'Развлечения', members: 25600 },
  ];

  const mockPosts = [
    { id: '1', category: 'Образование', text: 'Новый курс по Python программированию', media: 'image.jpg' },
    { id: '2', category: 'Технологии', text: 'Обзор последних тенденций в AI', media: 'video.mp4' },
    { id: '3', category: 'Бизнес', text: '5 советов для стартапов', media: null },
  ];

  const categories = ['all', 'Образование', 'Технологии', 'Бизнес', 'Развлечения'];

  const handleGroupToggle = (id: string) => {
    setSelectedGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handlePostToggle = (id: string) => {
    setSelectedPosts(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    );
  };

  const handleExecute = () => {
    setIsExecuting(true);
    setCurrentStep('execution');
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 10;
      setProgress(currentProgress);
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsExecuting(false);
      }
    }, 500);
  };

  const filteredGroups = filterCategory === 'all' 
    ? mockGroups 
    : mockGroups.filter(g => g.category === filterCategory);

  const filteredPosts = filterCategory === 'all'
    ? mockPosts
    : mockPosts.filter(p => p.category === filterCategory);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Публикация постов</h1>
            <p className="text-muted-foreground">Планирование и автоматическая публикация контента</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Шаг {currentStep === 'groups' ? 1 : currentStep === 'posts' ? 2 : currentStep === 'settings' ? 3 : 4} / 4
        </Badge>
      </div>

      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as Step)} className="fade-in">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="groups" disabled={isExecuting}>
            <Icon name="Users" size={16} className="mr-2" />
            Группы
          </TabsTrigger>
          <TabsTrigger value="posts" disabled={selectedGroups.length === 0 || isExecuting}>
            <Icon name="FileText" size={16} className="mr-2" />
            Посты
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={selectedPosts.length === 0 || isExecuting}>
            <Icon name="Settings" size={16} className="mr-2" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="execution" disabled={!isExecuting && currentStep !== 'execution'}>
            <Icon name="Play" size={16} className="mr-2" />
            Запуск
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Выберите группы для публикации</CardTitle>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'Все категории' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>№</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Участников</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredGroups.map((group, index) => (
                    <TableRow key={group.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedGroups.includes(group.id)}
                          onCheckedChange={() => handleGroupToggle(group.id)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{group.category}</Badge>
                      </TableCell>
                      <TableCell>{group.members.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Выбрано групп: <span className="font-semibold">{selectedGroups.length}</span>
                </p>
                <Button onClick={() => setCurrentStep('posts')} disabled={selectedGroups.length === 0}>
                  Далее
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Выберите посты для публикации</CardTitle>
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>
                        {cat === 'all' ? 'Все категории' : cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12"></TableHead>
                    <TableHead>№</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Текст поста</TableHead>
                    <TableHead>Медиа</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post, index) => (
                    <TableRow key={post.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell>
                        <Checkbox
                          checked={selectedPosts.includes(post.id)}
                          onCheckedChange={() => handlePostToggle(post.id)}
                        />
                      </TableCell>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium max-w-md truncate">{post.text}</TableCell>
                      <TableCell>
                        {post.media ? (
                          <Badge variant="outline">
                            <Icon name="Paperclip" size={12} className="mr-1" />
                            {post.media}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-sm">Нет</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 flex justify-between items-center">
                <p className="text-sm text-muted-foreground">
                  Выбрано постов: <span className="font-semibold">{selectedPosts.length}</span>
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setCurrentStep('groups')}>
                    <Icon name="ArrowLeft" size={16} className="mr-2" />
                    Назад
                  </Button>
                  <Button onClick={() => setCurrentStep('settings')} disabled={selectedPosts.length === 0}>
                    Далее
                    <Icon name="ArrowRight" size={16} className="ml-2" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки публикации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Минимальная пауза (сек)</Label>
                  <Input type="number" placeholder="30" defaultValue="30" />
                </div>
                <div className="space-y-2">
                  <Label>Максимальная пауза (сек)</Label>
                  <Input type="number" placeholder="120" defaultValue="120" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Время запуска</Label>
                <Select defaultValue="now">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Начать сразу</SelectItem>
                    <SelectItem value="scheduled">Запланировать</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <Button variant="outline" onClick={() => setCurrentStep('posts')}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <Button onClick={handleExecute}>
                  <Icon name="Play" size={16} className="mr-2" />
                  Запустить публикацию
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle>Выполнение публикации</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Прогресс</span>
                  <span className="font-semibold">{progress}%</span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>

              <div className="bg-muted/50 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span>Группа "Образовательный портал" - Пост опубликован</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Icon name="CheckCircle2" size={16} className="text-green-600" />
                  <span>Группа "Технологии будущего" - Пост опубликован</span>
                </div>
                {progress < 100 && (
                  <div className="flex items-center gap-2 text-sm">
                    <Icon name="Loader2" size={16} className="animate-spin text-blue-600" />
                    <span>Публикация в процессе...</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button onClick={onBack} disabled={progress < 100}>
                  {progress < 100 ? 'Выполняется...' : 'Завершить'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PublishModule;
