# 📱 将Web应用转换为Android APK详细步骤

本文档提供完整的步骤，将这个3D导航Web应用打包成Android APK。

## 📋 前提条件

在开始之前，请确保您的计算机已安装：

1. **Node.js** (v16或更高版本)
   - 下载: https://nodejs.org/
   - 验证安装: `node --version`

2. **Git**
   - 下载: https://git-scm.com/
   - 验证安装: `git --version`

3. **Android Studio** (最新版本)
   - 下载: https://developer.android.com/studio
   - 安装时选择包含 Android SDK 和 Android Virtual Device

4. **Java Development Kit (JDK)** 11或更高
   - Android Studio 通常会自动安装
   - 验证: `java --version`

---

## 🚀 第一步：导出项目到GitHub

1. 在 Lovable 界面右上角，点击 **"Export to GitHub"** 按钮
2. 按照提示连接您的GitHub账户
3. 项目会自动推送到您的GitHub仓库

---

## 💻 第二步：克隆项目到本地

```bash
# 克隆您的项目（替换为您的GitHub仓库URL）
git clone https://github.com/你的用户名/你的项目名.git

# 进入项目目录
cd 你的项目名

# 安装依赖
npm install
```

---

## 📦 第三步：安装Capacitor

```bash
# 安装Capacitor核心包
npm install @capacitor/core

# 安装Capacitor CLI（开发依赖）
npm install --save-dev @capacitor/cli

# 安装Android平台
npm install @capacitor/android

# 初始化Capacitor（会创建capacitor.config.ts文件）
npx cap init
```

**初始化时会提示输入：**
- **App name**: 3D Navigator（或您喜欢的名字）
- **App ID**: `app.lovable.navigator3d`（建议使用反向域名格式）
- **Web directory**: `dist`（默认值，直接按回车）

---

## ⚙️ 第四步：配置Capacitor

创建或编辑 `capacitor.config.ts` 文件：

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.navigator3d',
  appName: '3D Navigator',
  webDir: 'dist',
  server: {
    // 开发时可以使用Lovable的预览URL进行热重载
    // url: 'https://你的项目ID.lovableproject.com?forceHideBadge=true',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
    // 允许应用访问网络
    buildOptions: {
      keystorePath: undefined,
      keystorePassword: undefined,
      keystoreAlias: undefined,
      keystoreAliasPassword: undefined,
      releaseType: 'APK'
    }
  }
};

export default config;
```

---

## 🏗️ 第五步：构建Web应用

```bash
# 构建生产版本
npm run build
```

这会在 `dist` 目录生成优化后的静态文件。

---

## 📱 第六步：添加Android平台

```bash
# 添加Android平台
npx cap add android
```

这会创建 `android` 目录，包含完整的Android项目。

---

## 🔄 第七步：同步文件到Android项目

```bash
# 将web文件同步到Android项目
npx cap sync android
```

**重要提示**: 每次修改web代码后，都需要：
1. 运行 `npm run build`
2. 运行 `npx cap sync android`

---

## 🛠️ 第八步：在Android Studio中打开项目

```bash
# 在Android Studio中打开项目
npx cap open android
```

Android Studio会自动启动并打开Android项目。

---

## 📝 第九步：配置Android项目

在Android Studio中：

### 1. 配置应用权限

编辑 `android/app/src/main/AndroidManifest.xml`：

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="app.lovable.navigator3d">

    <!-- 网络权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- 位置权限（导航必需） -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 前台服务权限（Android 9+） -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    
    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true">
        
        <!-- 其他配置... -->
    </application>
</manifest>
```

### 2. 配置Gradle构建

编辑 `android/app/build.gradle`，确保：

```gradle
android {
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "app.lovable.navigator3d"
        minSdkVersion 28  // Android 9.0 (Automotive最低要求)
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

---

## 🏃 第十步：运行和测试

### 方式A：使用Android模拟器

1. 在Android Studio中，点击 **Tools → Device Manager**
2. 点击 **Create Device**
3. 选择 **Automotive** 类别（如果要测试车载系统）
   - 或选择 **Phone** 类别用于手机测试
4. 选择系统镜像（建议 Android 11或更高）
5. 点击 **Finish** 创建模拟器
6. 启动模拟器
7. 在Android Studio工具栏，点击 **运行按钮 ▶️**

### 方式B：使用真实Android设备

1. 在设备上启用 **开发者选项**：
   - 设置 → 关于手机 → 连续点击"版本号"7次
2. 启用 **USB调试**：
   - 设置 → 开发者选项 → USB调试
3. 用USB线连接设备到电脑
4. 在Android Studio中选择您的设备
5. 点击 **运行按钮 ▶️**

---

## 📦 第十一步：生成APK文件

### 调试版APK（用于测试）

```bash
# 在项目根目录
cd android
./gradlew assembleDebug
```

生成的APK位置：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 发布版APK（用于分发）

1. **生成签名密钥**：

```bash
# 在项目根目录
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

2. **配置签名**：

编辑 `android/app/build.gradle`：

```gradle
android {
    ...
    signingConfigs {
        release {
            storeFile file("../../my-release-key.keystore")
            storePassword "你的密钥库密码"
            keyAlias "my-key-alias"
            keyPassword "你的密钥密码"
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
}
```

3. **构建发布版APK**：

```bash
cd android
./gradlew assembleRelease
```

生成的APK位置：
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📲 第十二步：安装APK到设备

### 方法1：通过ADB安装

```bash
# 安装调试版
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 或安装发布版
adb install android/app/build/outputs/apk/release/app-release.apk
```

### 方法2：直接传输安装

1. 将APK文件传输到Android设备
2. 在设备上打开文件管理器
3. 点击APK文件
4. 按照提示安装（需要允许"未知来源"）

---

## 🔧 常见问题解决

### 问题1：地图无法显示

**原因**: MapLibre需要网络访问OpenStreetMap地图数据

**解决**:
- 确保 `AndroidManifest.xml` 包含网络权限
- 确保 `android:usesCleartextTraffic="true"` 已设置

### 问题2：定位功能不工作

**原因**: 缺少位置权限或设备GPS未开启

**解决**:
- 确保添加了位置权限到 `AndroidManifest.xml`
- 在应用运行时授予位置权限
- 检查设备GPS是否开启

### 问题3：构建失败

**可能原因和解决方法**:

```bash
# 清除缓存并重新构建
cd android
./gradlew clean
./gradlew build

# 如果还是失败，尝试更新Gradle
./gradlew wrapper --gradle-version 8.0
```

### 问题4：应用崩溃

**调试方法**:

```bash
# 查看实时日志
adb logcat | grep -i "navigator"

# 或在Android Studio中查看Logcat窗口
```

---

## 🎯 开发工作流程

推荐的开发流程：

```bash
# 1. 修改代码
# 编辑 src/ 目录下的文件

# 2. 构建web应用
npm run build

# 3. 同步到Android
npx cap sync android

# 4. 打开Android Studio
npx cap open android

# 5. 运行应用（在Android Studio中点击运行）
```

---

## 🚗 Automotive专用配置（可选）

如果您想专门为Android Automotive OS优化：

1. **添加Automotive特性**到 `AndroidManifest.xml`：

```xml
<manifest ...>
    <!-- 声明为车载应用 -->
    <uses-feature
        android:name="android.hardware.type.automotive"
        android:required="true" />
    
    <application ...>
        <meta-data
            android:name="com.google.android.gms.car.application"
            android:resource="@xml/automotive_app_desc" />
    </application>
</manifest>
```

2. **创建** `android/app/src/main/res/xml/automotive_app_desc.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<automotiveApp>
    <uses name="navigation" />
</automotiveApp>
```

---

## 📚 进一步学习

- **Capacitor官方文档**: https://capacitorjs.com/docs
- **Android开发文档**: https://developer.android.com/docs
- **Android Automotive文档**: https://source.android.com/devices/automotive
- **MapLibre文档**: https://maplibre.org/maplibre-gl-js-docs/api/

---

## 💡 提示和最佳实践

1. **开发时使用热重载**:
   - 在 `capacitor.config.ts` 中设置 `server.url` 为您的开发服务器
   - 这样可以实时看到代码修改效果

2. **定期同步**:
   - 每次修改web代码后记得运行 `npx cap sync`

3. **版本管理**:
   - 每次发布新版本时，更新 `versionCode` 和 `versionName`

4. **测试在多种设备上**:
   - 不同屏幕尺寸
   - 不同Android版本
   - 不同GPS精度

5. **优化性能**:
   - 使用生产构建 (`npm run build`)
   - 启用代码压缩
   - 优化图片资源

---

## 🎉 完成！

现在您应该有了一个完整的Android APK文件，可以在Android设备或Automotive系统上运行！

如果遇到问题，请检查：
- Android Studio的错误信息
- Logcat日志
- Capacitor文档

祝您开发顺利！🚀
