import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Icon from '@/components/ui/icon';
import { useToast } from '@/hooks/use-toast';

interface AuthPageProps {
  onAuth: (token: string) => void;
}

const AuthPage = ({ onAuth }: AuthPageProps) => {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleAuth = async () => {
    if (!token.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введите токен VK API',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`https://api.vk.com/method/users.get?access_token=${token}&v=5.131`);
      const data = await response.json();

      if (data.error) {
        throw new Error(data.error.error_msg);
      }

      localStorage.setItem('vk_token', token);
      toast({
        title: 'Успешно',
        description: 'Авторизация выполнена',
      });
      onAuth(token);
    } catch (error) {
      toast({
        title: 'Ошибка авторизации',
        description: error instanceof Error ? error.message : 'Проверьте токен и попробуйте снова',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-md fade-in">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Icon name="Lock" size={32} className="text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl">VK Manager Pro</CardTitle>
          <CardDescription className="text-base">
            Введите токен VK API для доступа к панели управления
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="token">Токен доступа VK API</Label>
            <Input
              id="token"
              type="password"
              placeholder="vk1.a.***************"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              disabled={isLoading}
            />
            <p className="text-xs text-muted-foreground">
              Получить токен можно в настройках приложения ВКонтакте
            </p>
          </div>

          <Button
            className="w-full"
            onClick={handleAuth}
            disabled={isLoading || !token.trim()}
          >
            {isLoading ? (
              <>
                <Icon name="Loader2" size={16} className="mr-2 animate-spin" />
                Проверка токена...
              </>
            ) : (
              <>
                <Icon name="LogIn" size={16} className="mr-2" />
                Войти
              </>
            )}
          </Button>

          <div className="border-t pt-4">
            <p className="text-xs text-muted-foreground text-center">
              Токен сохраняется локально в вашем браузере и не передается на сторонние серверы
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuthPage;
