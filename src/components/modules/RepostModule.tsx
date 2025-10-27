import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
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

interface RepostModuleProps {
  onBack: () => void;
}

type Step = 'sources' | 'settings' | 'targets' | 'execution';
type SourceType = 'groups' | 'users' | 'both';

const RepostModule = ({ onBack }: RepostModuleProps) => {
  const [currentStep, setCurrentStep] = useState<Step>('sources');
  const [sourceType, setSourceType] = useState<SourceType>('groups');
  const [sourceGroups, setSourceGroups] = useState<string>('');
  const [sourceUsers, setSourceUsers] = useState<string>('');
  const [postCount, setPostCount] = useState<number>(10);
  const [selectedTargetGroups, setSelectedTargetGroups] = useState<string[]>([]);
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isExecuting, setIsExecuting] = useState(false);
  const [progress, setProgress] = useState(0);

  const [groups, setGroups] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>(['all']);
  const [repostLogs, setRepostLogs] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const savedGroups = localStorage.getItem('vk_groups');
    const savedCategories = localStorage.getItem('vk_categories');

    if (savedGroups) {
      setGroups(JSON.parse(savedGroups));
    }
    if (savedCategories) {
      const cats = JSON.parse(savedCategories);
      setCategories(['all', ...cats.map((c: any) => c.name)]);
    }
  }, []);

  const handleTargetGroupToggle = (id: string) => {
    setSelectedTargetGroups(prev =>
      prev.includes(id) ? prev.filter(g => g !== id) : [...prev, id]
    );
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setCurrentStep('execution');
    setProgress(0);
    setRepostLogs([]);

    const token = localStorage.getItem('vk_token');
    if (!token) {
      toast({
        title: 'Ошибка',
        description: 'Токен VK API не найден',
        variant: 'destructive',
      });
      setIsExecuting(false);
      return;
    }

    const selectedTargetsData = groups.filter(g => selectedTargetGroups.includes(g.id));
    
    const sourceGroupsList = sourceType === 'users' ? [] : sourceGroups.split(',').map(s => s.trim()).filter(Boolean);
    const sourceUsersList = sourceType === 'groups' ? [] : sourceUsers.split(',').map(s => s.trim()).filter(Boolean);

    try {
      const response = await fetch('https://functions.poehali.dev/c2a523fe-0f83-4a05-bf25-b2a2eb38adb9', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token,
          sourceGroups: sourceGroupsList,
          sourceUsers: sourceUsersList,
          postCount,
          targetGroups: selectedTargetsData,
        }),
      });

      const result = await response.json();

      if (result.results) {
        setRepostLogs(result.results);
        setProgress(100);
        
        const successCount = result.successful || 0;
        const totalCount = result.total || 0;
        
        toast({
          title: 'Репосты завершены',
          description: `Успешно: ${successCount} из ${totalCount}`,
        });
      } else {
        throw new Error(result.error || 'Unknown error');
      }
    } catch (error) {
      toast({
        title: 'Ошибка репостов',
        description: error instanceof Error ? error.message : 'Проверьте данные и попробуйте снова',
        variant: 'destructive',
      });
      setProgress(0);
    } finally {
      setIsExecuting(false);
    }
  };

  const filteredTargetGroups = filterCategory === 'all' 
    ? groups 
    : groups.filter(g => g.category === filterCategory);

  const canProceedToTargets = 
    (sourceType === 'groups' && sourceGroups.trim()) ||
    (sourceType === 'users' && sourceUsers.trim()) ||
    (sourceType === 'both' && sourceGroups.trim() && sourceUsers.trim());

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Репосты</h1>
            <p className="text-muted-foreground">Автоматическое распространение контента</p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Шаг {currentStep === 'sources' ? 1 : currentStep === 'settings' ? 2 : currentStep === 'targets' ? 3 : 4} / 4
        </Badge>
      </div>

      <Tabs value={currentStep} onValueChange={(v) => setCurrentStep(v as Step)} className="fade-in">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="sources" disabled={isExecuting}>
            <Icon name="Download" size={16} className="mr-2" />
            Источники
          </TabsTrigger>
          <TabsTrigger value="settings" disabled={!canProceedToTargets || isExecuting}>
            <Icon name="Settings" size={16} className="mr-2" />
            Настройки
          </TabsTrigger>
          <TabsTrigger value="targets" disabled={!canProceedToTargets || isExecuting}>
            <Icon name="Upload" size={16} className="mr-2" />
            Получатели
          </TabsTrigger>
          <TabsTrigger value="execution" disabled={!isExecuting && currentStep !== 'execution'}>
            <Icon name="Play" size={16} className="mr-2" />
            Запуск
          </TabsTrigger>
        </TabsList>

        <TabsContent value="sources">
          <Card>
            <CardHeader>
              <CardTitle>Откуда брать посты для репоста</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <Label>Тип источника</Label>
                <RadioGroup value={sourceType} onValueChange={(v) => setSourceType(v as SourceType)}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="groups" id="groups" />
                    <Label htmlFor="groups" className="cursor-pointer">Только группы</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="users" id="users" />
                    <Label htmlFor="users" className="cursor-pointer">Только пользователи</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="both" id="both" />
                    <Label htmlFor="both" className="cursor-pointer">Группы и пользователи</Label>
                  </div>
                </RadioGroup>
              </div>

              {(sourceType === 'groups' || sourceType === 'both') && (
                <div className="space-y-2">
                  <Label>ID групп (через запятую)</Label>
                  <Input
                    placeholder="8979575, 197015974, 12345678"
                    value={sourceGroups}
                    onChange={(e) => setSourceGroups(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Укажите ID групп ВКонтакте без минуса
                  </p>
                </div>
              )}

              {(sourceType === 'users' || sourceType === 'both') && (
                <div className="space-y-2">
                  <Label>ID пользователей (через запятую)</Label>
                  <Input
                    placeholder="1, 2, 123456789"
                    value={sourceUsers}
                    onChange={(e) => setSourceUsers(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Укажите ID пользователей ВКонтакте
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-4">
                <Button
                  onClick={() => setCurrentStep('settings')}
                  disabled={!canProceedToTargets}
                >
                  Далее
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Настройки репостов</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Количество постов для репоста</Label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={postCount}
                  onChange={(e) => setPostCount(parseInt(e.target.value) || 1)}
                />
                <p className="text-xs text-muted-foreground">
                  Сколько последних постов взять из каждого источника
                </p>
              </div>

              <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={() => setCurrentStep('sources')}>
                  <Icon name="ArrowLeft" size={16} className="mr-2" />
                  Назад
                </Button>
                <Button onClick={() => setCurrentStep('targets')}>
                  Далее
                  <Icon name="ArrowRight" size={16} className="ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Выберите группы-получатели</CardTitle>
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
              {filteredTargetGroups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет добавленных групп</p>
                  <p className="text-sm">Добавьте группы в разделе "Управление БД"</p>
                </div>
              ) : (
                <>
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
                      {filteredTargetGroups.map((group, index) => (
                        <TableRow key={group.id} className="cursor-pointer hover:bg-muted/50">
                          <TableCell>
                            <Checkbox
                              checked={selectedTargetGroups.includes(group.id)}
                              onCheckedChange={() => handleTargetGroupToggle(group.id)}
                            />
                          </TableCell>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell className="font-medium">{group.name}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{group.category}</Badge>
                          </TableCell>
                          <TableCell>{group.members?.toLocaleString() || '—'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  <div className="flex justify-between items-center mt-6">
                    <Button variant="outline" onClick={() => setCurrentStep('settings')}>
                      <Icon name="ArrowLeft" size={16} className="mr-2" />
                      Назад
                    </Button>
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        Выбрано групп: {selectedTargetGroups.length}
                      </span>
                      <Button
                        onClick={handleExecute}
                        disabled={selectedTargetGroups.length === 0}
                      >
                        <Icon name="Play" size={16} className="mr-2" />
                        Запустить репосты
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle>Выполнение репостов</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Прогресс</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>

                {repostLogs.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-medium">Результаты:</h3>
                    <div className="max-h-96 overflow-y-auto space-y-2">
                      {repostLogs.map((log, index) => (
                        <div
                          key={index}
                          className={`p-3 rounded-lg border ${
                            log.success
                              ? 'bg-green-50 border-green-200'
                              : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            <Icon
                              name={log.success ? 'CheckCircle' : 'XCircle'}
                              size={16}
                              className={log.success ? 'text-green-600' : 'text-red-600'}
                            />
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {log.targetGroup} ← {log.sourceOwner}
                              </div>
                              {log.error && (
                                <div className="text-xs text-red-600 mt-1">{log.error}</div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {!isExecuting && repostLogs.length > 0 && (
                  <div className="flex justify-center">
                    <Button onClick={() => setCurrentStep('sources')}>
                      <Icon name="RefreshCw" size={16} className="mr-2" />
                      Создать новые репосты
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RepostModule;