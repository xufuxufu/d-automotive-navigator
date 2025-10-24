/**
 * 图层切换器组件
 * 用于切换地图样式（标准/卫星/地形）和控制3D建筑物显示
 */
import { useState } from 'react';
import { Map, Satellite, Mountain, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

/**
 * 组件属性接口
 */
interface LayerSwitcherProps {
  onStyleChange: (style: string) => void;      // 地图样式变化回调
  on3DBuildingsToggle: (show: boolean) => void; // 3D建筑切换回调
}

const LayerSwitcher = ({ onStyleChange, on3DBuildingsToggle }: LayerSwitcherProps) => {
  // 当前激活的地图样式
  const [activeStyle, setActiveStyle] = useState('default');
  // 3D建筑显示状态
  const [show3DBuildings, setShow3DBuildings] = useState(true);

  /**
   * 地图样式配置数组
   * 每个样式包含：唯一ID、显示名称、图标组件
   */
  const mapStyles = [
    { id: 'default', name: '标准地图', icon: Map },      // 标准地图：包含街道、建筑名称等详细信息
    { id: 'satellite', name: '卫星视图', icon: Satellite }, // 卫星视图：真实卫星图像
    { id: 'terrain', name: '地形视图', icon: Mountain },    // 地形视图：地形高度信息
  ];

  /**
   * 处理地图样式切换
   * @param styleId 新样式的ID
   */
  const handleStyleChange = (styleId: string) => {
    console.log('用户选择地图样式:', styleId);
    setActiveStyle(styleId);      // 更新本地状态（用于按钮高亮显示）
    onStyleChange(styleId);        // 通知父组件更新地图样式
  };

  /**
   * 处理3D建筑显示切换
   */
  const handle3DBuildingsToggle = () => {
    const newState = !show3DBuildings;
    console.log('切换3D建筑显示:', newState);
    setShow3DBuildings(newState);     // 更新本地状态
    on3DBuildingsToggle(newState);    // 通知父组件更新3D建筑显示
  };

  /**
   * 组件渲染
   */
  return (
    <div className="absolute bottom-4 left-4 z-[100] pointer-events-auto">
      {/* 
        外层容器：
        - absolute: 绝对定位
        - bottom-4 left-4: 距离左下角16px
        - z-[100]: 确保在地图上方显示
        - pointer-events-auto: 确保可以接收鼠标点击事件
      */}
      <div className="bg-card rounded-lg shadow-strong p-4 space-y-3 pointer-events-auto">
        {/* 
          内层容器：
          - bg-card: 使用设计系统的卡片背景色
          - rounded-lg: 圆角
          - shadow-strong: 强阴影效果（定义在index.css中）
          - p-4: 内边距16px
          - space-y-3: 子元素垂直间距12px
        */}
        
        {/* 地图样式切换区域 */}
        <div className="space-y-2">
          {/* 标题 */}
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Map className="w-4 h-4" />
            地图图层
          </h3>
          
          {/* 地图样式按钮列表 */}
          <div className="flex flex-col gap-2">
            {mapStyles.map((style) => {
              const Icon = style.icon; // 获取当前样式的图标组件
              return (
                <Button
                  key={style.id}
                  onClick={() => handleStyleChange(style.id)}
                  // 如果是当前激活的样式，使用'default'变体，否则使用'secondary'变体
                  variant={activeStyle === style.id ? 'default' : 'secondary'}
                  size="sm"
                  className={cn(
                    'w-full justify-start gap-2 h-10',
                    // 为激活的样式添加发光效果
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

        {/* 3D建筑切换区域 */}
        <div className="pt-3 border-t border-border">
          {/* pt-3: 顶部内边距，border-t: 顶部边框 */}
          <Button
            onClick={handle3DBuildingsToggle}
            // 根据3D建筑显示状态选择按钮样式
            variant={show3DBuildings ? 'default' : 'secondary'}
            size="sm"
            className={cn(
              'w-full justify-start gap-2 h-10',
              // 显示3D建筑时添加发光效果
              show3DBuildings && 'shadow-glow'
            )}
          >
            <Building2 className="w-4 h-4" />
            {/* 根据当前状态显示不同文本 */}
            {show3DBuildings ? '隐藏3D建筑' : '显示3D建筑'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LayerSwitcher;
