import { useState } from 'react';
import { Search, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface SearchPanelProps {
  onSearch: (location: { lng: number; lat: number; name: string }) => void;
  onNavigate: () => void;
}

// 日本主要城市坐标数据库
const JAPAN_LOCATIONS: Record<string, { lng: number; lat: number }> = {
  '東京': { lng: 139.7671, lat: 35.6812 },
  '东京': { lng: 139.7671, lat: 35.6812 },
  'tokyo': { lng: 139.7671, lat: 35.6812 },
  '大阪': { lng: 135.5023, lat: 34.6937 },
  'osaka': { lng: 135.5023, lat: 34.6937 },
  '京都': { lng: 135.7681, lat: 35.0116 },
  'kyoto': { lng: 135.7681, lat: 35.0116 },
  '横浜': { lng: 139.6380, lat: 35.4437 },
  '横滨': { lng: 139.6380, lat: 35.4437 },
  'yokohama': { lng: 139.6380, lat: 35.4437 },
  '名古屋': { lng: 136.9066, lat: 35.1815 },
  'nagoya': { lng: 136.9066, lat: 35.1815 },
  '札幌': { lng: 141.3545, lat: 43.0642 },
  'sapporo': { lng: 141.3545, lat: 43.0642 },
  '福岡': { lng: 130.4017, lat: 33.5904 },
  '福冈': { lng: 130.4017, lat: 33.5904 },
  'fukuoka': { lng: 130.4017, lat: 33.5904 },
  '神戸': { lng: 135.1955, lat: 34.6901 },
  '神户': { lng: 135.1955, lat: 34.6901 },
  'kobe': { lng: 135.1955, lat: 34.6901 },
  '広島': { lng: 132.4596, lat: 34.3853 },
  '广岛': { lng: 132.4596, lat: 34.3853 },
  'hiroshima': { lng: 132.4596, lat: 34.3853 },
  '仙台': { lng: 140.8719, lat: 38.2682 },
  'sendai': { lng: 140.8719, lat: 38.2682 },
  '新宿': { lng: 139.7005, lat: 35.6938 },
  'shinjuku': { lng: 139.7005, lat: 35.6938 },
  '渋谷': { lng: 139.7016, lat: 35.6580 },
  '涩谷': { lng: 139.7016, lat: 35.6580 },
  'shibuya': { lng: 139.7016, lat: 35.6580 },
  '秋葉原': { lng: 139.7743, lat: 35.6982 },
  '秋叶原': { lng: 139.7743, lat: 35.6982 },
  'akihabara': { lng: 139.7743, lat: 35.6982 },
  '浅草': { lng: 139.7967, lat: 35.7148 },
  'asakusa': { lng: 139.7967, lat: 35.7148 },
  '銀座': { lng: 139.7671, lat: 35.6719 },
  '银座': { lng: 139.7671, lat: 35.6719 },
  'ginza': { lng: 139.7671, lat: 35.6719 },
  '富士山': { lng: 138.7274, lat: 35.3606 },
  'fujisan': { lng: 138.7274, lat: 35.3606 },
  'mt fuji': { lng: 138.7274, lat: 35.3606 },
  '成田空港': { lng: 140.3929, lat: 35.7719 },
  '成田机场': { lng: 140.3929, lat: 35.7719 },
  'narita': { lng: 140.3929, lat: 35.7719 },
  '羽田空港': { lng: 139.7798, lat: 35.5494 },
  '羽田机场': { lng: 139.7798, lat: 35.5494 },
  'haneda': { lng: 139.7798, lat: 35.5494 },
  '東京タワー': { lng: 139.7454, lat: 35.6586 },
  '东京塔': { lng: 139.7454, lat: 35.6586 },
  'tokyo tower': { lng: 139.7454, lat: 35.6586 },
  'スカイツリー': { lng: 139.8107, lat: 35.7101 },
  '天空树': { lng: 139.8107, lat: 35.7101 },
  'skytree': { lng: 139.8107, lat: 35.7101 },
};

const SearchPanel = ({ onSearch, onNavigate }: SearchPanelProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);

  const handleSearch = () => {
    if (!searchTerm.trim()) {
      toast.error('请输入地点名称');
      return;
    }

    // 搜索匹配的地点（不区分大小写）
    const searchKey = searchTerm.toLowerCase().trim();
    const location = JAPAN_LOCATIONS[searchKey];

    if (location) {
      onSearch({
        ...location,
        name: searchTerm,
      });
      toast.success(`找到地点: ${searchTerm}`);
    } else {
      // 提供搜索建议
      const suggestions = Object.keys(JAPAN_LOCATIONS)
        .filter(key => key.includes(searchKey))
        .slice(0, 3)
        .join(', ');
      
      if (suggestions) {
        toast.error(`未找到"${searchTerm}"，您是否要搜索: ${suggestions}？`);
      } else {
        toast.error(`未找到"${searchTerm}"，请尝试输入日本的主要城市或景点名称`);
      }
    }
  };

  const handleNavigate = () => {
    setIsNavigating(true);
    onNavigate();
    setTimeout(() => setIsNavigating(false), 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="absolute top-4 left-4 z-10 w-full max-w-md">
      <div className="bg-card rounded-lg shadow-strong p-6 space-y-4">
        {/* 搜索区域 */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">搜索目的地</h2>
          </div>
          
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入地点名称（如：東京、大阪、渋谷）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-12 text-base bg-input border-border text-foreground placeholder:text-muted-foreground"
              style={{ color: '#000000' }}
            />
            <Button
              onClick={handleSearch}
              size="lg"
              className="h-12 px-6 bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
            >
              <Search className="w-5 h-5 mr-2" />
              查询
            </Button>
          </div>
        </div>

        {/* 导航按钮 */}
        <Button
          onClick={handleNavigate}
          disabled={isNavigating}
          size="lg"
          className="w-full h-14 bg-nav-accent hover:bg-nav-accent/90 text-background font-bold text-lg shadow-glow"
        >
          <Navigation className="w-6 h-6 mr-2" />
          {isNavigating ? '正在规划路线...' : '开始导航'}
        </Button>

        {/* 使用提示 */}
        <div className="pt-3 border-t border-border">
          <p className="text-xs text-muted-foreground">
            💡 提示：支持中文、日文和英文地名搜索
          </p>
        </div>
      </div>
    </div>
  );
};

export default SearchPanel;
