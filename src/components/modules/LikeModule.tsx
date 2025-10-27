import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

interface LikeModuleProps {
  onBack: () => void;
}

const LikeModule = ({ onBack }: LikeModuleProps) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6 flex items-center gap-4 fade-in">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <Icon name="ArrowLeft" size={20} />
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Массовый лайк</h1>
          <p className="text-muted-foreground">Автоматическое взаимодействие с аудиторией</p>
        </div>
      </div>

      <Card className="fade-in">
        <CardHeader>
          <CardTitle>Модуль в разработке</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Функционал массовых лайков будет доступен в следующей версии</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default LikeModule;
