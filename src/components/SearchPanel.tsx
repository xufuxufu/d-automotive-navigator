/**
 * 搜索面板组件
 * 用于搜索目的地并开始导航
 */
import { useState } from 'react';
import { Search, Navigation, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

/**
 * 组件属性接口
 */
interface SearchPanelProps {
  onSearch: (location: { lng: number; lat: number; name: string }) => void; // 搜索成功回调
  onNavigate: () => void; // 开始导航回调
}

/**
 * 本地地点数据库
 * 包含日本常用城市和热门景点的坐标信息
 * 支持中文、日文、英文三种语言的地名
 */
const JAPAN_LOCATIONS: Record<string, { lng: number; lat: number }> = {
  // === 主要城市 ===
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
  
  // === 东京区域 ===
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
  
  // === 自然景观 ===
  '富士山': { lng: 138.7274, lat: 35.3606 },
  'fujisan': { lng: 138.7274, lat: 35.3606 },
  'mt fuji': { lng: 138.7274, lat: 35.3606 },
  
  // === 交通枢纽 ===
  '成田空港': { lng: 140.3929, lat: 35.7719 },
  '成田机场': { lng: 140.3929, lat: 35.7719 },
  'narita': { lng: 140.3929, lat: 35.7719 },
  '羽田空港': { lng: 139.7798, lat: 35.5494 },
  '羽田机场': { lng: 139.7798, lat: 35.5494 },
  'haneda': { lng: 139.7798, lat: 35.5494 },
  
  // === 东京地标 ===
  '東京タワー': { lng: 139.7454, lat: 35.6586 },
  '东京塔': { lng: 139.7454, lat: 35.6586 },
  'tokyo tower': { lng: 139.7454, lat: 35.6586 },
  'スカイツリー': { lng: 139.8107, lat: 35.7101 },
  '天空树': { lng: 139.8107, lat: 35.7101 },
  'skytree': { lng: 139.8107, lat: 35.7101 },
  
  // === 大阪景点 ===
  'usj': { lng: 135.4326, lat: 34.6654 },
  '环球影城': { lng: 135.4326, lat: 34.6654 },
  '大阪usj': { lng: 135.4326, lat: 34.6654 },
  'universal studios japan': { lng: 135.4326, lat: 34.6654 },
  '道顿堀': { lng: 135.5020, lat: 34.6686 },
  'dotonbori': { lng: 135.5020, lat: 34.6686 },
  '大阪城': { lng: 135.5258, lat: 34.6873 },
  'osaka castle': { lng: 135.5258, lat: 34.6873 },
  '心斋桥': { lng: 135.4998, lat: 34.6718 },
  'shinsaibashi': { lng: 135.4998, lat: 34.6718 },
  
  // === 京都景点 ===
  '清水寺': { lng: 135.7850, lat: 34.9949 },
  'kiyomizu': { lng: 135.7850, lat: 34.9949 },
  '金閣寺': { lng: 135.7292, lat: 35.0394 },
  '金阁寺': { lng: 135.7292, lat: 35.0394 },
  'kinkakuji': { lng: 135.7292, lat: 35.0394 },
  '伏見稲荷': { lng: 135.7727, lat: 34.9671 },
  'fushimi inari': { lng: 135.7727, lat: 34.9671 },
  
  // === 其他热门景点 ===
  '迪士尼': { lng: 139.8811, lat: 35.6329 },
  'disneyland': { lng: 139.8811, lat: 35.6329 },
  'disney': { lng: 139.8811, lat: 35.6329 },
  '镰仓': { lng: 139.5503, lat: 35.3192 },
  'kamakura': { lng: 139.5503, lat: 35.3192 },
  '箱根': { lng: 139.0286, lat: 35.2322 },
  'hakone': { lng: 139.0286, lat: 35.2322 },
};


const SearchPanel = ({ onSearch, onNavigate }: SearchPanelProps) => {
  // 搜索关键词状态
  const [searchTerm, setSearchTerm] = useState('');
  // 导航进行中状态（用于按钮禁用）
  const [isNavigating, setIsNavigating] = useState(false);

  /**
   * 处理地点搜索
   * 流程：
   * 1. 首先在本地数据库中查找
   * 2. 如果本地没有，调用Nominatim API进行全球搜索
   * 3. 如果都没找到，提供搜索建议
   */
  const handleSearch = async () => {
    // 验证输入
    if (!searchTerm.trim()) {
      toast.error('请输入地点名称');
      return;
    }

    // 第一步：尝试本地数据库搜索（快速、离线）
    const searchKey = searchTerm.toLowerCase().trim();
    const location = JAPAN_LOCATIONS[searchKey];

    if (location) {
      // 本地找到了，直接返回
      onSearch({
        ...location,
        name: searchTerm,
      });
      toast.success(`找到地点: ${searchTerm}`);
      return;
    }

    // 第二步：使用Nominatim API进行全球地理编码搜索
    toast.loading('正在搜索地点...');
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchTerm)}&limit=1&accept-language=zh-CN,en`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        // API找到了结果
        const result = data[0];
        onSearch({
          lng: parseFloat(result.lon),
          lat: parseFloat(result.lat),
          name: result.display_name,
        });
        toast.success(`找到地点: ${result.display_name}`);
      } else {
        // 第三步：都没找到，提供搜索建议
        const suggestions = Object.keys(JAPAN_LOCATIONS)
          .filter(key => key.includes(searchKey))
          .slice(0, 3)
          .join(', ');
        
        if (suggestions) {
          toast.error(`未找到"${searchTerm}"，您是否要搜索: ${suggestions}？`);
        } else {
          toast.error(`未找到"${searchTerm}"，请尝试输入更具体的地点名称`);
        }
      }
    } catch (error) {
      console.error('地点搜索失败:', error);
      toast.error('搜索失败，请检查网络连接或尝试其他地点名称');
    }
  };

  /**
   * 处理开始导航
   * 设置短暂的loading状态
   */
  const handleNavigate = () => {
    setIsNavigating(true);
    onNavigate();
    setTimeout(() => setIsNavigating(false), 1000);
  };

  /**
   * 处理键盘按键
   * 按下回车键时触发搜索
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };


  /**
   * 组件渲染
   */
  return (
    <div className="absolute top-4 left-4 z-10 w-full max-w-md">
      {/* 
        外层容器：
        - absolute: 绝对定位
        - top-4 left-4: 距离左上角16px
        - z-10: 确保在地图上方
        - max-w-md: 最大宽度28rem（448px）
      */}
      <div className="bg-card rounded-lg shadow-strong p-6 space-y-4">
        {/* 内层容器：卡片样式 */}
        
        {/* 搜索区域 */}
        <div className="space-y-3">
          {/* 标题 */}
          <div className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">搜索目的地</h2>
          </div>
          
          {/* 搜索输入框和按钮 */}
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="输入地点名称（例如：東京、大阪usj、环球影城）"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 h-12 text-base border-2 border-primary/30 focus:border-primary placeholder:text-muted-foreground"
              style={{ 
                backgroundColor: '#ffffff', // 白色背景
                color: '#000000'            // 黑色文字
              }}
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
