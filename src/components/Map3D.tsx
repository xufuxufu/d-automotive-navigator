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

  // 地图样式URL（使用免费的MapLibre演示样式，完全兼容且支持3D）
  const getMapStyleUrl = () => {
    const styles: Record<string, string> = {
      default: 'https://demotiles.maplibre.org/style.json',
      satellite: 'https://demotiles.maplibre.org/style.json',
      terrain: 'https://demotiles.maplibre.org/style.json',
    };
    return styles[mapStyle] || styles.default;
  };

  useEffect(() => {
    if (!mapContainer.current) return;

    // 初始化地图（日本东京为中心）
    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: getMapStyleUrl(),
      center: [139.7671, 35.6812], // 东京中心
      zoom: 13,
      pitch: 60, // 3D倾斜角度
      bearing: 0,
    });

    // 添加导航控制器
    map.current.addControl(
      new maplibregl.NavigationControl({
        visualizePitch: true,
        showCompass: true,
      }),
      'top-right'
    );

    // 添加全屏控制器
    map.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

    // 地图加载完成后的处理
    map.current.on('load', () => {
      if (!map.current) return;

      // 延迟添加3D建筑物图层，确保样式完全加载
      setTimeout(() => {
        if (show3DBuildings && map.current) {
          add3DBuildings();
        }
      }, 500);

      // 获取用户位置
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { longitude, latitude } = position.coords;
            setUserLocation({ lng: longitude, lat: latitude });
            
            // 添加用户位置标记
            if (map.current) {
              userMarker.current = new maplibregl.Marker({ color: '#00ff00' })
                .setLngLat([longitude, latitude])
                .addTo(map.current);
              
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

      if (onMapLoad && map.current) {
        onMapLoad(map.current);
      }

      toast.success('地图加载完成');
    });

    return () => {
      map.current?.remove();
    };
  }, []);

  // 添加3D建筑物
  const add3DBuildings = () => {
    if (!map.current) return;

    try {
      // 安全检查：确保样式已加载
      const style = map.current.getStyle();
      if (!style || !style.layers) {
        console.warn('地图样式尚未完全加载');
        return;
      }

      // 检查是否已存在3D建筑图层
      if (map.current.getLayer('3d-buildings')) {
        return;
      }

      // 查找标签图层
      const layers = style.layers;
      const labelLayerId = layers.find(
        (layer) => layer.type === 'symbol' && layer.layout && layer.layout['text-field']
      )?.id;

      // 添加3D建筑物图层
      map.current.addLayer(
        {
          id: '3d-buildings',
          source: 'openmaptiles',
          'source-layer': 'building',
          filter: ['==', 'extrude', 'true'],
          type: 'fill-extrusion',
          minzoom: 15,
          paint: {
            'fill-extrusion-color': '#aaa',
            'fill-extrusion-height': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'height'],
            ],
            'fill-extrusion-base': [
              'interpolate',
              ['linear'],
              ['zoom'],
              15,
              0,
              15.05,
              ['get', 'min_height'],
            ],
            'fill-extrusion-opacity': 0.6,
          },
        },
        labelLayerId
      );
    } catch (error) {
      console.error('添加3D建筑物失败:', error);
      toast.error('3D建筑功能暂时不可用');
    }
  };

  // 切换3D建筑物显示
  useEffect(() => {
    if (!map.current || !map.current.isStyleLoaded()) return;

    try {
      if (map.current.getLayer('3d-buildings')) {
        map.current.setLayoutProperty(
          '3d-buildings',
          'visibility',
          show3DBuildings ? 'visible' : 'none'
        );
      } else if (show3DBuildings) {
        add3DBuildings();
      }
    } catch (error) {
      console.error('切换3D建筑显示失败:', error);
    }
  }, [show3DBuildings]);

  // 切换地图样式
  useEffect(() => {
    if (!map.current) return;
    
    try {
      map.current.setStyle(getMapStyleUrl());
      
      // 样式切换后需要重新添加3D建筑
      map.current.once('styledata', () => {
        if (show3DBuildings && map.current) {
          setTimeout(() => {
            add3DBuildings();
          }, 500);
        }
      });
    } catch (error) {
      console.error('切换地图样式失败:', error);
    }
  }, [mapStyle]);

  // 搜索位置标记
  useEffect(() => {
    if (!map.current || !searchLocation) return;

    // 移除旧标记
    if (routeMarker.current) {
      routeMarker.current.remove();
    }

    // 添加新标记
    routeMarker.current = new maplibregl.Marker({ color: '#ff0000' })
      .setLngLat([searchLocation.lng, searchLocation.lat])
      .setPopup(
        new maplibregl.Popup().setHTML(`<h3 style="color: #000;">${searchLocation.name}</h3>`)
      )
      .addTo(map.current);

    // 飞到目标位置
    map.current.flyTo({
      center: [searchLocation.lng, searchLocation.lat],
      zoom: 17,
      pitch: 60,
      bearing: 0,
      essential: true,
    });

    toast.success(`已定位到: ${searchLocation.name}`);
  }, [searchLocation]);

  // 开始导航
  useEffect(() => {
    if (!map.current || !startNavigation || !searchLocation) return;

    const start = userLocation || { lng: 139.7671, lat: 35.6812 };
    const end = { lng: searchLocation.lng, lat: searchLocation.lat };

    // 绘制简单的直线路径（实际应用中应该调用路线规划API）
    const routeGeoJSON: GeoJSON.Feature<GeoJSON.LineString> = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: 'LineString',
        coordinates: [
          [start.lng, start.lat],
          [end.lng, end.lat],
        ],
      },
    };

    // 添加路线图层
    if (map.current.getSource('route')) {
      (map.current.getSource('route') as maplibregl.GeoJSONSource).setData(routeGeoJSON);
    } else {
      map.current.addSource('route', {
        type: 'geojson',
        data: routeGeoJSON,
      });

      map.current.addLayer({
        id: 'route',
        type: 'line',
        source: 'route',
        layout: {
          'line-join': 'round',
          'line-cap': 'round',
        },
        paint: {
          'line-color': '#00ffff',
          'line-width': 6,
          'line-opacity': 0.8,
        },
      });
    }

    // 调整视图以显示完整路径
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([start.lng, start.lat]);
    bounds.extend([end.lng, end.lat]);

    map.current.fitBounds(bounds, {
      padding: 100,
      pitch: 45,
    });

    toast.success('导航路线已规划');
  }, [startNavigation, searchLocation, userLocation]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainer} className="absolute inset-0 rounded-lg" />
    </div>
  );
};

export default Map3D;
