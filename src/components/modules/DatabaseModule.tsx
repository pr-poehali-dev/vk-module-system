import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';
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

interface Group {
  id: string;
  name: string;
  groupId: string;
  category: string;
  members: number;
}

interface Post {
  id: string;
  category: string;
  text: string;
  media: string | null;
}

interface Category {
  id: string;
  name: string;
}

const DatabaseModule = ({ onBack }: DatabaseModuleProps) => {
  const [activeTab, setActiveTab] = useState('groups');
  const [isGroupDialogOpen, setIsGroupDialogOpen] = useState(false);
  const [isPostDialogOpen, setIsPostDialogOpen] = useState(false);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const { toast } = useToast();

  const [groups, setGroups] = useState<Group[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Образование' },
    { id: '2', name: 'Технологии' },
    { id: '3', name: 'Бизнес' },
    { id: '4', name: 'Развлечения' },
  ]);

  const [newGroup, setNewGroup] = useState({ groupId: '', name: '', category: '', members: 0 });
  const [newPost, setNewPost] = useState({ category: '', text: '', media: '' });
  const [newCategory, setNewCategory] = useState('');

  useEffect(() => {
    const savedGroups = localStorage.getItem('vk_groups');
    const savedPosts = localStorage.getItem('vk_posts');
    const savedCategories = localStorage.getItem('vk_categories');

    if (savedGroups) setGroups(JSON.parse(savedGroups));
    if (savedPosts) setPosts(JSON.parse(savedPosts));
    if (savedCategories) setCategories(JSON.parse(savedCategories));
  }, []);

  const saveGroups = (newGroups: Group[]) => {
    setGroups(newGroups);
    localStorage.setItem('vk_groups', JSON.stringify(newGroups));
  };

  const savePosts = (newPosts: Post[]) => {
    setPosts(newPosts);
    localStorage.setItem('vk_posts', JSON.stringify(newPosts));
  };

  const saveCategories = (newCategories: Category[]) => {
    setCategories(newCategories);
    localStorage.setItem('vk_categories', JSON.stringify(newCategories));
  };

  const handleAddGroup = () => {
    if (!newGroup.groupId || !newGroup.name || !newGroup.category) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const group: Group = {
      id: Date.now().toString(),
      ...newGroup,
    };

    saveGroups([...groups, group]);
    setNewGroup({ groupId: '', name: '', category: '', members: 0 });
    setIsGroupDialogOpen(false);
    toast({
      title: 'Успешно',
      description: 'Группа добавлена',
    });
  };

  const handleDeleteGroup = (id: string) => {
    saveGroups(groups.filter(g => g.id !== id));
    toast({
      title: 'Успешно',
      description: 'Группа удалена',
    });
  };

  const handleAddPost = () => {
    if (!newPost.category || !newPost.text) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive',
      });
      return;
    }

    const post: Post = {
      id: Date.now().toString(),
      category: newPost.category,
      text: newPost.text,
      media: newPost.media || null,
    };

    savePosts([...posts, post]);
    setNewPost({ category: '', text: '', media: '' });
    setIsPostDialogOpen(false);
    toast({
      title: 'Успешно',
      description: 'Пост добавлен',
    });
  };

  const handleDeletePost = (id: string) => {
    savePosts(posts.filter(p => p.id !== id));
    toast({
      title: 'Успешно',
      description: 'Пост удален',
    });
  };

  const handleAddCategory = () => {
    if (!newCategory.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите название категории',
        variant: 'destructive',
      });
      return;
    }

    const category: Category = {
      id: Date.now().toString(),
      name: newCategory.trim(),
    };

    saveCategories([...categories, category]);
    setNewCategory('');
    setIsCategoryDialogOpen(false);
    toast({
      title: 'Успешно',
      description: 'Категория добавлена',
    });
  };

  const handleDeleteCategory = (id: string) => {
    saveCategories(categories.filter(c => c.id !== id));
    toast({
      title: 'Успешно',
      description: 'Категория удалена',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center justify-between fade-in">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <Icon name="ArrowLeft" size={20} />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Управление базой данных</h1>
            <p className="text-muted-foreground">Редактирование групп, постов и категорий</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="fade-in">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="groups">
            <Icon name="Users" size={16} className="mr-2" />
            Группы ({groups.length})
          </TabsTrigger>
          <TabsTrigger value="posts">
            <Icon name="FileText" size={16} className="mr-2" />
            Посты ({posts.length})
          </TabsTrigger>
          <TabsTrigger value="categories">
            <Icon name="Folders" size={16} className="mr-2" />
            Категории ({categories.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="groups">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Группы ВКонтакте</CardTitle>
                <Dialog open={isGroupDialogOpen} onOpenChange={setIsGroupDialogOpen}>
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
                        <Label>ID группы *</Label>
                        <Input
                          placeholder="123456789"
                          value={newGroup.groupId}
                          onChange={(e) => setNewGroup({ ...newGroup, groupId: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Название *</Label>
                        <Input
                          placeholder="Название группы"
                          value={newGroup.name}
                          onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Категория *</Label>
                        <Select value={newGroup.category} onValueChange={(v) => setNewGroup({ ...newGroup, category: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Количество участников</Label>
                        <Input
                          type="number"
                          placeholder="0"
                          value={newGroup.members || ''}
                          onChange={(e) => setNewGroup({ ...newGroup, members: parseInt(e.target.value) || 0 })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsGroupDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleAddGroup}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {groups.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="Users" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет добавленных групп</p>
                  <p className="text-sm">Нажмите "Добавить группу" для начала</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>№</TableHead>
                      <TableHead>ID группы</TableHead>
                      <TableHead>Название</TableHead>
                      <TableHead>Категория</TableHead>
                      <TableHead>Участников</TableHead>
                      <TableHead className="text-right">Действия</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groups.map((group, index) => (
                      <TableRow key={group.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="font-mono text-sm">{group.groupId}</TableCell>
                        <TableCell className="font-medium">{group.name}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{group.category}</Badge>
                        </TableCell>
                        <TableCell>{group.members.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeleteGroup(group.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Посты для публикации</CardTitle>
                <Dialog open={isPostDialogOpen} onOpenChange={setIsPostDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить пост
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Добавить новый пост</DialogTitle>
                      <DialogDescription>
                        Создайте пост для последующей публикации
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Категория *</Label>
                        <Select value={newPost.category} onValueChange={(v) => setNewPost({ ...newPost, category: v })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Выберите категорию" />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Текст поста *</Label>
                        <Textarea
                          placeholder="Введите текст поста..."
                          rows={6}
                          value={newPost.text}
                          onChange={(e) => setNewPost({ ...newPost, text: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Ссылка на медиа (опционально)</Label>
                        <Input
                          placeholder="https://example.com/image.jpg"
                          value={newPost.media}
                          onChange={(e) => setNewPost({ ...newPost, media: e.target.value })}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsPostDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleAddPost}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              {posts.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Icon name="FileText" size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Нет созданных постов</p>
                  <p className="text-sm">Нажмите "Добавить пост" для начала</p>
                </div>
              ) : (
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
                    {posts.map((post, index) => (
                      <TableRow key={post.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{post.category}</Badge>
                        </TableCell>
                        <TableCell className="max-w-md">
                          <div className="truncate">{post.text}</div>
                        </TableCell>
                        <TableCell>
                          {post.media ? (
                            <Badge variant="outline">
                              <Icon name="Paperclip" size={12} className="mr-1" />
                              Есть
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground text-sm">Нет</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => handleDeletePost(post.id)}>
                            <Icon name="Trash2" size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Категории</CardTitle>
                <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Icon name="Plus" size={16} className="mr-2" />
                      Добавить категорию
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Добавить новую категорию</DialogTitle>
                      <DialogDescription>
                        Создайте категорию для организации групп и постов
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Название категории *</Label>
                        <Input
                          placeholder="Например: Образование"
                          value={newCategory}
                          onChange={(e) => setNewCategory(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCategoryDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleAddCategory}>Сохранить</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {categories.map((category) => (
                  <Card key={category.id} className="hover-scale">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Icon name="Folder" size={20} className="text-primary" />
                        </div>
                        <span className="font-medium">{category.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCategory(category.id)}
                      >
                        <Icon name="Trash2" size={16} />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DatabaseModule;
