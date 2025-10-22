import { useState } from 'react';
import { Map, Satellite, Mountain, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface LayerSwitcherProps {
  onStyleChange: (style: string) => void;
  on3DBuildingsToggle: (show: boolean) => void;
}

const LayerSwitcher = ({ onStyleChange, on3DBuildingsToggle }: LayerSwitcherProps) => {
  const [activeStyle, setActiveStyle] = useState('default');
  const [show3DBuildings, setShow3DBuildings] = useState(true);

  const mapStyles = [
    { id: 'default', name: '标准地图', icon: Map },
    { id: 'satellite', name: '卫星视图', icon: Satellite },
    { id: 'terrain', name: '地形视图', icon: Mountain },
  ];

  const handleStyleChange = (styleId: string) => {
    setActiveStyle(styleId);
    onStyleChange(styleId);
  };

  const handle3DBuildingsToggle = () => {
    const newState = !show3DBuildings;
    setShow3DBuildings(newState);
    on3DBuildingsToggle(newState);
  };

  return (
    <div className="absolute bottom-4 left-4 z-10">
      <div className="bg-card rounded-lg shadow-strong p-4 space-y-3">
        {/* 地图样式切换 */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Map className="w-4 h-4" />
            地图图层
          </h3>
          <div className="flex flex-col gap-2">
            {mapStyles.map((style) => {
              const Icon = style.icon;
              return (
                <Button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  variant={activeStyle === style.id ? 'default' : 'secondary'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 h-10',
                    activeStyle === style.id && 'shadow-glow'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {style.name}
                </Button>
              );
            })}
          </div>
        </div>

        {/* 3D建筑切换 */}
        <div className="pt-3 border-t border-border">
          <Button
            onClick={handle3DBuildingsToggle}
            variant={show3DBuildings ? 'default' : 'secondary'}
            size="sm"
            className={cn(
              'w-full justify-start gap-2 h-10',
              show3DBuildings && 'shadow-glow'
            )}
          >
            <Building2 className="w-4 h-4" />
            {show3DBuildings ? '隐藏3D建筑' : '显示3D建筑'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayerSwitcher;
