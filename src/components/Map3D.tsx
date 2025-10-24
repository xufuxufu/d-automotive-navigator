import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { toast } from 'sonner';

interface Map3DProps {
  onMapLoad?: (map: maplibregl.Map) => void;
  searchLocation?: { lng: number; lat: number; name: string } | null;
  startNavigation?: boolean;
  show3DBuildings?: boolean;
  mapStyle?: string;
}

const Map3D = ({ 
  onMapLoad, 
  searchLocation, 
  startNavigation, 
  show3DBuildings = true,
  mapStyle = 'default'
}: Map3DProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const [userLocation, setUserLocation] = useState<{ lng: number; lat: number } | null>(null);
  const routeMarker = useRef<maplibregl.Marker | null>(null);
  const userMarker = useRef<maplibregl.Marker | null>(null);

  /**
   * 获取地图样式URL
   * @returns 根据当前样式类型返回对应的地图样式URL
   */
  const getMapStyleUrl = (styleType: string) => {
    // 定义不同地图样式的URL映射
    const styles: Record<string, string> = {
      default: 'https://tiles.openfreemap.org/styles/liberty', // 标准地图（包含街道、建筑名称）
      satellite: 'https://tiles.openfreemap.org/styles/satellite', // 卫星视图
      terrain: 'https://tiles.openfreemap.org/styles/liberty', // 地形视图（目前使用标准地图）
    };
    return styles[styleType] || styles.default;
  };

  /**
   * 地图初始化 Effect
   * 只在组件挂载时执行一次，创建地图实例并配置基本设置
   */
  useEffect(() => {
    // 确保容器DOM元素已存在
    if (!mapContainer.current) return;

    // 创建地图实例（世界地图视角）
    map.current = new maplibregl.Map({
      container: mapContainer.current, // 地图容器DOM元素
      style: getMapStyleUrl(mapStyle), // 初始地图样式
      center: [0, 20], // 世界地图中心坐标 [经度, 纬度]
      zoom: 2, // 初始缩放级别（世界视图）
      pitch: 0, // 初始俯仰角度（0度为俯视）
      bearing: 0, // 初始旋转角度（0度为正北方向）
    });

    // 添加导航控制器（缩放、旋转、倾斜按钮）
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true, // 显示俯仰角度可视化
        showCompass: true, // 显示指南针
      }),
      'top-right' // 控件位置：右上角
    );

    // 添加全屏控制器
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    /**
     * 地图加载完成事件处理
     * 在地图完全加载后执行初始化操作
     */
    map.current.on('load', () => {
      if (!map.current) return;

      // 延迟添加3D建筑物图层，确保地图样式完全加载
      setTimeout(() => {
        if (show3DBuildings && map.current) {
          add3DBuildings();
        }
      }, 500);

      // 尝试获取用户当前位置
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation({ lng: longitude, lat: latitude });
            
            // 在用户位置添加绿色标记
            if (map.current) {
              userMarker.current = new maplibregl.Marker({ color: '#00ff00' })
                .setLngLat([longitude, latitude])
                .addTo(map.current);
              
              // 飞行到用户位置并放大
              map.current.flyTo({
                center: [longitude, latitude],
                zoom: 15,
              });
              
              toast.success('已定位到您的位置');
            }
          },
          (error) => {
            console.error('定位失败:', error);
            toast.error('无法获取您的位置，将使用默认位置（东京）');
          }
        );
      }

      // 调用外部传入的地图加载回调
      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }

      toast.success('地图加载完成');
    });

    // 清理函数：组件卸载时销毁地图实例
    return () => {
      map.current?.remove();
    };
  }, []); // 空依赖数组，只在组件挂载时执行一次

  /**
   * 添加3D建筑物图层
   * 从地图样式中查找建筑数据源，并添加立体建筑效果
   */
  const add3DBuildings = () => {
    if (!map.current) return;

    try {
      // 安全检查：确保地图样式已完全加载
      const style = map.current.getStyle();
      if (!style || !style.layers || !style.sources) {
        console.warn('地图样式尚未完全加载');
        return;
      }

      // 检查是否已存在3D建筑图层，避免重复添加
      if (map.current.getLayer('3d-buildings')) {
        console.log('3D建筑图层已存在');
        return;
      }

      // 查找建筑数据源
      const sources = style.sources;
      let buildingSourceId = '';
      let buildingSourceLayer = '';

      // 尝试查找常见的建筑数据源
      if (sources['openmaptiles']) {
        buildingSourceId = 'openmaptiles';
        buildingSourceLayer = 'building';
      } else if (sources['protomaps']) {
        buildingSourceId = 'protomaps';
        buildingSourceLayer = 'buildings';
      }

      // 如果没有找到建筑数据源，无法添加3D建筑
      if (!buildingSourceId) {
        console.warn('当前地图样式不包含建筑数据源');
        return;
      }

      // 查找标签图层ID（3D建筑应该渲染在标签层下方，避免遮挡文字）
      const layers = style.layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout
      )?.id;

      // 添加3D建筑物填充拉伸图层
      map.current.addLayer(
        {
          id: '3d-buildings', // 图层ID
          source: buildingSourceId, // 数据源
          'source-layer': buildingSourceLayer, // 数据源图层名称
          filter: ['has', 'height'], // 只显示有高度属性的建筑
          type: 'fill-extrusion', // 填充拉伸类型（用于3D效果）
          minzoom: 14, // 最小显示缩放级别（避免在远距离显示造成性能问题）
          paint: {
            // 建筑颜色：根据高度插值，越高颜色越深
            'fill-extrusion-color': [
              'interpolate',
              ['linear'],
              ['get', 'height'],
              0, '#e0e0e0',    // 0米：浅灰色
              50, '#d0d0d0',   // 50米：中浅灰
              100, '#c0c0c0',  // 100米：中灰
              200, '#a0a0a0',  // 200米：深灰
            ],
            'fill-extrusion-height': ['get', 'height'], // 建筑高度
            'fill-extrusion-base': ['coalesce', ['get', 'min_height'], 0], // 建筑底部高度
            'fill-extrusion-opacity': 0.8, // 透明度
          },
        },
        labelLayerId // 插入位置：在标签图层下方
      );
      
      console.log('3D建筑物图层已添加');
      toast.success('3D建筑已启用');
    } catch (error) {
      console.error('添加3D建筑物失败:', error);
      toast.error('3D建筑启用失败');
    }
  };

  /**
   * 监听3D建筑显示状态变化
   * 当用户切换"显示/隐藏3D建筑"时触发
   */
  useEffect(() => {
    // 确保地图已初始化且样式已加载
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      // 如果3D建筑图层已存在，切换其可见性
      if (map.current.getLayer('3d-buildings')) {
        map.current.setLayoutProperty(
          '3d-buildings',
          'visibility',
          show3DBuildings ? 'visible' : 'none'
        );
        console.log('3D建筑显示状态已切换:', show3DBuildings);
        toast.success(show3DBuildings ? '3D建筑已显示' : '3D建筑已隐藏');
      } else if (show3DBuildings) {
        // 如果图层不存在且需要显示，则添加图层
        add3DBuildings();
      }
    } catch (error) {
      console.error('切换3D建筑显示失败:', error);
      toast.error('切换3D建筑失败');
    }
  }, [show3DBuildings]); // 依赖项：当show3DBuildings变化时触发

  /**
   * 监听地图样式变化（标准地图/卫星视图/地形视图）
   * 当用户切换地图类型时触发
   */
  useEffect(() => {
    // 确保地图已初始化
    if (!map.current) return;
    
    console.log('切换地图样式:', mapStyle);
    
    try {
      // 设置新的地图样式
      map.current.setStyle(getMapStyleUrl(mapStyle));
      
      /**
       * 样式切换后的处理
       * 注意：setStyle会清空所有自定义图层，需要重新添加
       */
      map.current.once('styledata', () => {
        console.log('新样式已加载');
        
        // 如果启用了3D建筑，需要重新添加（因为setStyle会清空图层）
        if (show3DBuildings && map.current) {
          setTimeout(() => {
            add3DBuildings();
          }, 500); // 延迟确保样式完全加载
        }
        
        toast.success('地图样式已切换');
      });
    } catch (error) {
      console.error('切换地图样式失败:', error);
      toast.error('地图样式切换失败');
    }
  }, [mapStyle, show3DBuildings]); // 依赖项：mapStyle或show3DBuildings变化时触发

  /**
   * 监听搜索位置变化
   * 当用户搜索新地点时触发，在地图上标记并飞行到该位置
   */
  useEffect(() => {
    if (!map.current || !searchLocation) return;

    // 移除之前的目标位置标记（如果存在）
    if (routeMarker.current) {
      routeMarker.current.remove();
    }

    // 在目标位置添加红色标记
    routeMarker.current = new maplibregl.Marker({ color: '#ff0000' })
      .setLngLat([searchLocation.lng, searchLocation.lat])
      .setPopup(
        new maplibregl.Popup().setHTML(`<h3 style="color: #000;">${searchLocation.name}</h3>`)
      )
      .addTo(map.current);

    // 飞行到目标位置并调整视角
    map.current.flyTo({
      center: [searchLocation.lng, searchLocation.lat], // 目标中心点
      zoom: 17, // 放大级别（建筑物可见）
      pitch: 60, // 俯仰角（3D视角）
      bearing: 0, // 旋转角度
      essential: true, // 即使用户启用了"减少动画"也执行此动画
    });

    toast.success(`已定位到: ${searchLocation.name}`);
  }, [searchLocation]); // 依赖项：searchLocation变化时触发

  /**
   * 监听导航开始事件
   * 当用户点击"开始导航"时，调用OSRM API规划真实道路路线
   */
  useEffect(() => {
    if (!map.current || !startNavigation || !searchLocation) return;

    // 起点：用户当前位置或默认位置（东京）
    const start = userLocation || { lng: 139.7671, lat: 35.6812 };
    // 终点：搜索的目标位置
    const end = { lng: searchLocation.lng, lat: searchLocation.lat };

    /**
     * 调用OSRM路线规划API获取真实道路路线
     * OSRM是开源路由机器，提供免费的路线规划服务
     */
    const fetchRoute = async () => {
      try {
        // 构建OSRM API请求URL
        const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        // 检查API响应是否成功
        if (data.code === 'Ok' && data.routes && data.routes.length > 0) {
          const route = data.routes[0];
          
          // 构建GeoJSON格式的路线数据
          const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
            type: 'Feature',
            properties: {
              distance: route.distance, // 距离（米）
              duration: route.duration, // 时长（秒）
            },
            geometry: route.geometry, // 路线坐标数组
          };

          // 添加或更新路线图层
          if (map.current!.getSource('route')) {
            // 如果路线数据源已存在，更新数据
            (map.current!.getSource('route') as maplibregl.GeoJSONSource).setData(routeGeoJSON);
          } else {
            // 如果数据源不存在，创建新的数据源和图层
            map.current!.addSource('route', {
              type: 'geojson',
              data: routeGeoJSON,
            });

            // 添加线条图层显示路线
            map.current!.addLayer({
              id: 'route',
              type: 'line',
              source: 'route',
              layout: {
                'line-join': 'round', // 线条连接方式：圆角
                'line-cap': 'round',  // 线条端点样式：圆角
              },
              paint: {
                'line-color': '#0088ff', // 线条颜色：蓝色
                'line-width': 8,         // 线条宽度
                'line-opacity': 0.8,     // 线条透明度
              },
            });
          }

          // 调整地图视图以完整显示路线
          const coordinates = route.geometry.coordinates;
          const bounds = new maplibregl.LngLatBounds();
          
          // 遍历所有坐标点，扩展边界框
          coordinates.forEach((coord: [number, number]) => {
            bounds.extend(coord);
          });

          // 缩放地图以适应路线边界
          map.current!.fitBounds(bounds, {
            padding: 100, // 边界内边距（像素）
            pitch: 45,    // 倾斜角度
          });

          // 显示导航信息
          const distanceKm = (route.distance / 1000).toFixed(1); // 转换为公里
          const durationMin = Math.round(route.duration / 60);    // 转换为分钟
          toast.success(`导航路线已规划：${distanceKm}公里，约${durationMin}分钟`);
        } else {
          throw new Error('无法获取路线');
        }
      } catch (error) {
        console.error('路线规划失败:', error);
        toast.error('路线规划失败，将显示直线路径');
        
        /**
         * 降级方案：当OSRM API失败时，显示直线路径
         * 虽然不是真实道路路线，但至少能显示方向
         */
        const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: [
              [start.lng, start.lat], // 起点
              [end.lng, end.lat],     // 终点
            ],
          },
        };

        // 添加或更新直线路径
        if (map.current!.getSource('route')) {
          (map.current!.getSource('route') as maplibregl.GeoJSONSource).setData(routeGeoJSON);
        } else {
          map.current!.addSource('route', {
            type: 'geojson',
            data: routeGeoJSON,
          });

          map.current!.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round',
            },
            paint: {
              'line-color': '#0088ff',
              'line-width': 8,
              'line-opacity': 0.8,
            },
          });
        }
      }
    };

    fetchRoute();
  }, [startNavigation, searchLocation, userLocation]); // 依赖项：这三个变量任一变化时触发

  /**
   * 组件渲染
   * 返回地图容器DOM元素
   */
  return (
    <div className="relative w-full h-full">
      {/* 地图容器：maplibregl会在这个div中渲染地图 */}
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map3D;
