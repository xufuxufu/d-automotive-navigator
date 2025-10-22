import { useState } from 'react';
import Map3D from '@/components/Map3D';
import SearchPanel from '@/components/SearchPanel';
import LayerSwitcher from '@/components/LayerSwitcher';

const Index = () => {
  const [searchLocation, setSearchLocation] = useState<{ lng: number; lat: number; name: string } | null>(null);
  const [startNavigation, setStartNavigation] = useState(false);
  const [mapStyle, setMapStyle] = useState('default');
  const [show3DBuildings, setShow3DBuildings] = useState(true);

  const handleSearch = (location: { lng: number; lat: number; name: string }) => {
    setSearchLocation(location);
    setStartNavigation(false); // 重置导航状态
  };

  const handleNavigate = () => {
    if (searchLocation) {
      setStartNavigation(true);
    }
  };

  const handleStyleChange = (style: string) => {
    setMapStyle(style);
  };

  const handle3DBuildingsToggle = (show: boolean) => {
    setShow3DBuildings(show);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-background">
      {/* 主标题 */}
      <div className="absolute top-4 right-4 z-10 bg-card/90 backdrop-blur-sm rounded-lg shadow-strong px-6 py-3">
        <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
          🚗 3D导航系统
        </h1>
        <p className="text-xs text-muted-foreground mt-1">
          Android Automotive OS
        </p>
      </div>

      {/* 地图组件 */}
      <Map3D
        searchLocation={searchLocation}
        startNavigation={startNavigation}
        show3DBuildings={show3DBuildings}
        mapStyle={mapStyle}
      />

      {/* 搜索面板 */}
      <SearchPanel onSearch={handleSearch} onNavigate={handleNavigate} />

      {/* 图层切换器 */}
      <LayerSwitcher 
        onStyleChange={handleStyleChange}
        on3DBuildingsToggle={handle3DBuildingsToggle}
      />
    </div>
  );
};

export default Index;
