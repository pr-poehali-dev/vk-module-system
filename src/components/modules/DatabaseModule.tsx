import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DatabaseModuleProps {
  onBack: () => void;
}

const DatabaseModule = ({ onBack }: DatabaseModuleProps) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const mockGroups = [
    { id: '1', name: 'Образовательный портал', category: 'Образование', members: 15420 },
    { id: '2', name: 'Технологии будущего', category: 'Технологии', members: 8930 },
    { id: '3', name: 'Бизнес-советы', category: 'Бизнес', members: 12100 },
  ];

  const mockPosts = [
    { id: '1', category: 'Образование', text: 'Новый курс по Python программированию', media: 'image.jpg' },
    { id: '2', category: 'Технологии', text: 'Обзор последних тенденций в AI', media: 'video.mp4' },
  ];

  const mockTokens = [
    { id: '1', name: 'Основной токен', value: 'vk1.a.***************', status: 'active' },
    { id: '2', name: 'Резервный токен', value: 'vk1.a.***************', status: 'active' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Управление базой данных</h1>
            <p className="text-muted-foreground">Редактирование групп, постов и токенов</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="fade-in">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="groups">
            <Icon name="Users" size={16} className="mr-2" />
            Группы
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Icon name="FileText" size={16} className="mr-2" />
            Посты
          </TabsTrigger>
          <TabsTrigger value="tokens">
            <Icon name="Key" size={16} className="mr-2" />
            Токены
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Группы ВКонтакте</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить группу
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить новую группу</DialogTitle>
                      <DialogDescription>
                        Заполните информацию о группе ВКонтакте
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>ID группы</Label>
                        <Input placeholder="123456789" />
                      </div>
                      <div className="space-y-2">
                        <Label>Название</Label>
                        <Input placeholder="Название группы" />
                      </div>
                      <div className="space-y-2">
                        <Label>Категория</Label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="education">Образование</SelectItem>
                            <SelectItem value="tech">Технологии</SelectItem>
                            <SelectItem value="business">Бизнес</SelectItem>
                            <SelectItem value="entertainment">Развлечения</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={() => setIsDialogOpen(false)}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Участников</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockGroups.map((group, index) => (
                    <TableRow key={group.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{group.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{group.category}</Badge>
                      </TableCell>
                      <TableCell>{group.members.toLocaleString()}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Посты для публикации</CardTitle>
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить пост
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Категория</TableHead>
                    <TableHead>Текст</TableHead>
                    <TableHead>Медиа</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockPosts.map((post, index) => (
                    <TableRow key={post.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{post.category}</Badge>
                      </TableCell>
                      <TableCell className="max-w-md truncate">{post.text}</TableCell>
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
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tokens">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Токены доступа VK API</CardTitle>
                <Button>
                  <Icon name="Plus" size={16} className="mr-2" />
                  Добавить токен
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>№</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead>Токен</TableHead>
                    <TableHead>Статус</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockTokens.map((token, index) => (
                    <TableRow key={token.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell className="font-medium">{token.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">{token.value}</code>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-green-600 border-green-600">
                          <Icon name="CheckCircle2" size={12} className="mr-1" />
                          {token.status === 'active' ? 'Активен' : 'Неактивен'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon">
                          <Icon name="Pencil" size={16} />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <Icon name="Trash2" size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseModule;
