# 📱 将Web应用转换为Android APK - 完整指南

本文档提供详细步骤，将3D导航Web应用打包成Android APK，并包含常见错误的解决方案。

---

## 📋 前提条件

### 1. Node.js (v18或更高版本)
```bash
# 下载: https://nodejs.org/
# 验证安装
node --version  # 应该显示 v18.0.0 或更高
npm --version
```

### 2. Git
```bash
# 下载: https://git-scm.com/
# 验证安装
git --version
```

### 3. Android Studio (最新稳定版)
- 下载: https://developer.android.com/studio
- **重要**: 安装时选择以下组件：
  - Android SDK
  - Android SDK Platform
  - Android Virtual Device (AVD)
  - Android SDK Build-Tools
  - Android SDK Command-line Tools

### 4. Java Development Kit (JDK) 17
```bash
# Android Studio 通常会自动安装
# 验证安装
java --version  # 应该显示 17.x.x

# 如果未安装，下载 JDK 17:
# https://www.oracle.com/java/technologies/downloads/#java17
```

### 5. 配置环境变量
添加以下环境变量到系统路径：

**Windows:**
```
ANDROID_HOME = C:\Users\你的用户名\AppData\Local\Android\Sdk
JAVA_HOME = C:\Program Files\Android\Android Studio\jbr

Path 添加:
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
%JAVA_HOME%\bin
```

**Mac/Linux:**
```bash
# 添加到 ~/.bashrc 或 ~/.zshrc
export ANDROID_HOME=$HOME/Library/Android/sdk
export JAVA_HOME=/Applications/Android\ Studio.app/Contents/jbr/Contents/Home
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$JAVA_HOME/bin
```

验证:
```bash
adb --version
```

---

## 🚀 完整转换步骤

### 第一步：导出项目到GitHub

1. 在 Lovable 界面右上角，点击 **"Export to GitHub"** 按钮
2. 连接您的GitHub账户
3. 项目会自动推送到您的GitHub仓库

---

### 第二步：克隆项目到本地

```bash
# 克隆项目（替换为您的仓库URL）
git clone https://github.com/你的用户名/你的项目名.git

# 进入项目目录
cd 你的项目名

# 安装依赖
npm install
```

---

### 第三步：安装 Capacitor（使用固定版本）

**重要提示**: 使用指定版本以避免兼容性问题

```bash
# 安装 Capacitor 核心包（版本 6.x）
npm install @capacitor/core@6

# 安装 Capacitor CLI
npm install @capacitor/cli@6 --save-dev

# 安装 Android 平台
npm install @capacitor/android@6
```

---

### 第四步：初始化 Capacitor

```bash
# 初始化 Capacitor 配置
npx cap init
```

**初始化时输入的信息：**
- **App name**: `3D Navigator`（应用显示名称）
- **App ID**: `app.lovable.navigator3d`（唯一标识符，使用反向域名格式）
- **Web directory**: `dist`（保持默认，直接按回车）

---

### 第五步：配置 Capacitor

编辑或创建 `capacitor.config.ts` 文件：

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.navigator3d',
  appName: '3D Navigator',
  webDir: 'dist',
  server: {
    // 生产环境应注释掉以下配置
    // 开发时可以使用以下配置进行热重载
    // url: 'https://your-preview-url.lovableproject.com',
    // cleartext: true
  },
  android: {
    allowMixedContent: true,
  }
};

export default config;
```

---

### 第六步：构建 Web 应用

```bash
# 构建生产版本
npm run build
```

**验证**: 确保 `dist` 目录已创建并包含以下文件：
- `index.html`
- `assets/` 目录
- 其他静态资源

---

### 第七步：添加 Android 平台

```bash
# 添加 Android 平台
npx cap add android
```

这会创建 `android` 目录，包含完整的 Android 项目结构。

---

### 第八步：同步文件

```bash
# 将 web 文件同步到 Android 项目
npx cap sync android
```

**注意**: 每次修改 web 代码后，都需要重新执行：
```bash
npm run build
npx cap sync android
```

---

### 第九步：配置 Android 项目

#### 1. 配置应用权限

编辑 `android/app/src/main/AndroidManifest.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <!-- 必需权限 -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
    
    <!-- 定位权限（导航功能必需） -->
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    
    <!-- 前台服务权限 -->
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme"
        android:usesCleartextTraffic="true"
        android:hardwareAccelerated="true">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">

            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>

        </activity>

        <provider
            android:name="androidx.core.content.FileProvider"
            android:authorities="${applicationId}.fileprovider"
            android:exported="false"
            android:grantUriPermissions="true">
            <meta-data
                android:name="android.support.FILE_PROVIDER_PATHS"
                android:resource="@xml/file_paths"></meta-data>
        </provider>
    </application>

</manifest>
```

#### 2. 配置 Gradle 构建

编辑 `android/app/build.gradle`：

```gradle
apply plugin: 'com.android.application'

android {
    namespace "app.lovable.navigator3d"
    compileSdkVersion 34
    
    defaultConfig {
        applicationId "app.lovable.navigator3d"
        minSdkVersion 24
        targetSdkVersion 34
        versionCode 1
        versionName "1.0"
        testInstrumentationRunner "androidx.test.runner.AndroidJUnitRunner"
    }
    
    buildTypes {
        release {
            minifyEnabled false
            proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
        }
    }
    
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation fileTree(dir: 'libs', include: ['*.jar'])
    implementation "androidx.appcompat:appcompat:$androidxAppCompatVersion"
    implementation "androidx.coordinatorlayout:coordinatorlayout:$androidxCoordinatorLayoutVersion"
    implementation "androidx.core:core-splashscreen:$coreSplashScreenVersion"
    testImplementation "junit:junit:$junitVersion"
    androidTestImplementation "androidx.test.ext:junit:$androidxJunitVersion"
    androidTestImplementation "androidx.test.espresso:espresso-core:$androidxEspressoCoreVersion"
    implementation project(':capacitor-android')
}

apply from: 'capacitor.build.gradle'

try {
    def servicesJSON = file('google-services.json')
    if (servicesJSON.text) {
        apply plugin: 'com.google.gms.google-services'
    }
} catch(Exception e) {
    logger.info("google-services.json not found, skipping")
}
```

#### 3. 配置项目级 Gradle

编辑 `android/build.gradle`：

```gradle
buildscript {
    ext.kotlin_version = '1.9.10'
    
    repositories {
        google()
        mavenCentral()
    }
    
    dependencies {
        classpath 'com.android.tools.build:gradle:8.2.1'
        classpath "org.jetbrains.kotlin:kotlin-gradle-plugin:$kotlin_version"
        classpath 'com.google.gms:google-services:4.4.0'
    }
}

apply from: "variables.gradle"

allprojects {
    repositories {
        google()
        mavenCentral()
    }
}

task clean(type: Delete) {
    delete rootProject.buildDir
}
```

#### 4. 配置 Gradle Wrapper

编辑 `android/gradle/wrapper/gradle-wrapper.properties`：

```properties
distributionBase=GRADLE_USER_HOME
distributionPath=wrapper/dists
distributionUrl=https\://services.gradle.org/distributions/gradle-8.2-all.zip
zipStoreBase=GRADLE_USER_HOME
zipStorePath=wrapper/dists
```

---

### 第十步：打开 Android Studio

```bash
# 在 Android Studio 中打开项目
npx cap open android
```

**首次打开时 Android Studio 会自动：**
1. 下载必要的依赖
2. 同步 Gradle 文件
3. 索引项目文件

**这可能需要 5-15 分钟，请耐心等待。**

---

## 🔧 解决 "com.getcapacitor.android.R" 错误

### 问题原因

`import com.getcapacitor.android.R;` 错误通常由以下原因引起：
1. Gradle 同步未完成
2. Capacitor 版本不兼容
3. Android 项目缓存问题
4. 依赖配置错误

### 解决方案

#### 方法 1：清理并重新构建（推荐首先尝试）

```bash
# 在项目根目录
cd android

# Windows
gradlew clean
gradlew build

# Mac/Linux
./gradlew clean
./gradlew build
```

#### 方法 2：删除并重新添加 Android 平台

```bash
# 返回项目根目录
cd ..

# 删除 android 目录
rm -rf android  # Mac/Linux
# 或 Windows 使用文件管理器手动删除

# 重新构建
npm run build

# 重新添加 Android 平台
npx cap add android

# 同步文件
npx cap sync android
```

#### 方法 3：在 Android Studio 中修复

1. 打开 Android Studio
2. 点击 **File → Invalidate Caches / Restart**
3. 选择 **Invalidate and Restart**
4. 等待 Android Studio 重启
5. 点击 **File → Sync Project with Gradle Files**
6. 等待同步完成（查看底部进度条）

#### 方法 4：检查 Capacitor 版本一致性

```bash
# 查看已安装的 Capacitor 版本
npm list @capacitor/core
npm list @capacitor/cli
npm list @capacitor/android

# 确保所有 Capacitor 包版本一致
# 如果不一致，重新安装
npm uninstall @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/core@6 @capacitor/cli@6 @capacitor/android@6 --save
```

#### 方法 5：检查 variables.gradle

确保 `android/variables.gradle` 文件存在且配置正确：

```gradle
ext {
    minSdkVersion = 24
    compileSdkVersion = 34
    targetSdkVersion = 34
    androidxActivityVersion = '1.8.0'
    androidxAppCompatVersion = '1.6.1'
    androidxCoordinatorLayoutVersion = '1.2.0'
    androidxCoreVersion = '1.12.0'
    androidxFragmentVersion = '1.6.2'
    coreSplashScreenVersion = '1.0.1'
    androidxWebkitVersion = '1.9.0'
    junitVersion = '4.13.2'
    androidxJunitVersion = '1.1.5'
    androidxEspressoCoreVersion = '3.5.1'
    cordovaAndroidVersion = '10.1.1'
}
```

#### 方法 6：修复依赖问题

编辑 `android/capacitor.build.gradle`，确保内容正确：

```gradle
android {
    compileOptions {
        sourceCompatibility JavaVersion.VERSION_17
        targetCompatibility JavaVersion.VERSION_17
    }
}

dependencies {
    implementation project(':capacitor-android')
}
```

---

## 🏃 运行和测试应用

### 在模拟器上运行

1. 在 Android Studio 中，点击 **Tools → Device Manager**
2. 点击 **Create Device**
3. 选择设备型号（推荐 Pixel 5 或更新）
4. 选择系统镜像（推荐 Android 13 或 14）
5. 点击 **Finish** 创建模拟器
6. 启动模拟器（点击播放图标）
7. 等待模拟器完全启动
8. 在 Android Studio 工具栏，选择模拟器，点击运行按钮 ▶️

### 在真实设备上运行

1. 在设备上启用开发者选项：
   - 进入 **设置 → 关于手机**
   - 连续点击 **版本号** 7次
   - 返回设置，找到 **开发者选项**

2. 启用 USB 调试：
   - 开发者选项 → USB调试 → 开启

3. 连接设备到电脑（USB线）

4. 在设备上授权 USB 调试

5. 在 Android Studio 中：
   - 等待设备出现在设备下拉列表
   - 选择您的设备
   - 点击运行按钮 ▶️

---

## 📦 生成 APK 文件

### 方式 1：生成调试版 APK（快速测试）

```bash
# 进入 android 目录
cd android

# 生成调试版 APK
./gradlew assembleDebug  # Mac/Linux
gradlew assembleDebug    # Windows
```

**生成位置**：
```
android/app/build/outputs/apk/debug/app-debug.apk
```

### 方式 2：生成发布版 APK（正式分发）

#### 步骤 1：生成签名密钥

```bash
# 在项目根目录执行
keytool -genkey -v -keystore my-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

**输入以下信息**：
- 密钥库密码：（输入并记住）
- 再次输入密码：（确认）
- 您的名字与姓氏：（您的姓名）
- 您的组织单位名称：（您的组织或留空）
- 您的组织名称：（您的组织或留空）
- 您的城市或区域名称：（您的城市）
- 您的省/市/自治区名称：（您的省份）
- 该单位的双字母国家/地区代码：（CN 或其他）
- 密钥密码：（输入或按回车使用相同密码）

**重要**：将生成的 `my-release-key.keystore` 文件保存在安全位置！

#### 步骤 2：配置签名

创建 `android/keystore.properties` 文件：

```properties
storePassword=你的密钥库密码
keyPassword=你的密钥密码
keyAlias=my-key-alias
storeFile=../my-release-key.keystore
```

**重要**：将 `keystore.properties` 添加到 `.gitignore`：

```bash
echo "android/keystore.properties" >> .gitignore
```

#### 步骤 3：修改 build.gradle

编辑 `android/app/build.gradle`，在 `android {}` 块内添加：

```gradle
android {
    ...
    
    def keystorePropertiesFile = rootProject.file("keystore.properties")
    def keystoreProperties = new Properties()
    if (keystorePropertiesFile.exists()) {
        keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
    }
    
    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
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

#### 步骤 4：构建发布版 APK

```bash
cd android

# 生成发布版 APK
./gradlew assembleRelease  # Mac/Linux
gradlew assembleRelease    # Windows
```

**生成位置**：
```
android/app/build/outputs/apk/release/app-release.apk
```

---

## 📲 安装 APK 到设备

### 方法 1：通过 ADB

```bash
# 安装调试版
adb install android/app/build/outputs/apk/debug/app-debug.apk

# 安装发布版
adb install android/app/build/outputs/apk/release/app-release.apk

# 如果提示已安装，先卸载
adb uninstall app.lovable.navigator3d
```

### 方法 2：直接传输（推荐用于非开发者）

1. 将 APK 文件复制到手机（通过 USB、微信、邮件等）
2. 在手机上找到 APK 文件
3. 点击 APK 文件
4. 允许安装未知来源应用
5. 点击安装

---

## 🐛 常见问题完整解决方案

### 问题 1：Gradle 同步失败

**错误信息**：
```
Could not resolve com.android.tools.build:gradle:X.X.X
```

**解决方案**：

```bash
# 1. 检查网络连接
ping google.com

# 2. 配置 Gradle 使用镜像（中国用户）
# 编辑 android/build.gradle
repositories {
    maven { url 'https://maven.aliyun.com/repository/public/' }
    maven { url 'https://maven.aliyun.com/repository/google/' }
    google()
    mavenCentral()
}

# 3. 清理并重新同步
cd android
./gradlew clean
./gradlew --refresh-dependencies
```

### 问题 2：地图不显示

**原因**：
- 网络权限未配置
- Cleartext traffic 被阻止

**解决方案**：

确保 `AndroidManifest.xml` 中有：
```xml
<uses-permission android:name="android.permission.INTERNET" />
<application
    android:usesCleartextTraffic="true"
    ...>
```

### 问题 3：定位功能不工作

**解决方案**：

1. 确保权限已添加到 `AndroidManifest.xml`
2. 在运行时请求权限（应用会自动提示）
3. 在设备设置中授予位置权限
4. 确保设备 GPS 已开启

### 问题 4：应用崩溃

**调试步骤**：

```bash
# 查看实时日志
adb logcat | grep -i "navigator"

# 或查看所有崩溃日志
adb logcat | grep -i "AndroidRuntime"

# 在 Android Studio 中
# 打开 Logcat 窗口查看详细日志
```

### 问题 5：白屏或黑屏

**原因**：
- Web 文件未正确同步
- JavaScript 错误

**解决方案**：

```bash
# 1. 确保 web 构建成功
npm run build

# 2. 检查 dist 目录是否存在
ls dist  # Mac/Linux
dir dist # Windows

# 3. 重新同步
npx cap sync android

# 4. 清理 Android 缓存
cd android
./gradlew clean
```

### 问题 6：构建速度慢

**优化方法**：

1. 启用 Gradle 并行构建：

编辑 `android/gradle.properties`：
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxMetaspaceSize=512m
org.gradle.parallel=true
org.gradle.daemon=true
org.gradle.configureondemand=true
android.useAndroidX=true
android.enableJetifier=true
```

2. 使用本地 Maven 缓存

---

## 🔄 推荐开发流程

```bash
# 1. 修改 web 代码
# 编辑 src/ 目录下的文件

# 2. 构建 web 应用
npm run build

# 3. 同步到 Android
npx cap sync android

# 4. 在 Android Studio 中运行
# 点击运行按钮

# 5. 调试（如果需要）
adb logcat | grep -i "navigator"
```

### 使用热重载（开发时推荐）

在 `capacitor.config.ts` 中配置：

```typescript
server: {
  url: 'http://YOUR_COMPUTER_IP:5173',  // Vite 开发服务器地址
  cleartext: true
}
```

然后：

```bash
# 1. 启动 Vite 开发服务器
npm run dev

# 2. 同步
npx cap sync android

# 3. 在 Android Studio 中运行
# 现在修改代码会自动刷新！
```

**注意**：发布前记得注释掉 `server` 配置。

---

## 🚗 Android Automotive OS 专用配置

如果要针对车载系统优化：

### 1. 修改 AndroidManifest.xml

```xml
<manifest ...>
    <!-- 声明为车载应用 -->
    <uses-feature
        android:name="android.hardware.type.automotive"
        android:required="false" />
    
    <application ...>
        <!-- 车载应用元数据 -->
        <meta-data
            android:name="com.google.android.gms.car.application"
            android:resource="@xml/automotive_app_desc" />
    </application>
</manifest>
```

### 2. 创建车载应用描述

创建 `android/app/src/main/res/xml/automotive_app_desc.xml`：

```xml
<?xml version="1.0" encoding="utf-8"?>
<automotiveApp>
    <uses name="navigation" />
    <uses name="media" />
</automotiveApp>
```

### 3. 测试车载模拟器

在 Android Studio Device Manager 中：
1. 创建 **Automotive** 设备
2. 选择 Android 11 或更高版本
3. 启动并测试

---

## 📊 APK 大小优化（可选）

### 启用代码混淆和压缩

编辑 `android/app/build.gradle`：

```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
        proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
    }
}
```

### 添加混淆规则

编辑 `android/app/proguard-rules.pro`：

```proguard
# Keep Capacitor classes
-keep class com.getcapacitor.** { *; }
-keep class io.ionic.** { *; }

# Keep WebView JavaScript interface
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep WebView
-keepclassmembers class fqcn.of.javascript.interface.for.webview {
   public *;
}
```

---

## 📚 有用的资源

- **Capacitor 官方文档**: https://capacitorjs.com/docs
- **Android 开发文档**: https://developer.android.com/docs
- **Capacitor Android 配置**: https://capacitorjs.com/docs/android/configuration
- **Android Automotive 文档**: https://source.android.com/devices/automotive
- **Gradle 文档**: https://docs.gradle.org/
- **MapLibre GL JS**: https://maplibre.org/maplibre-gl-js-docs/api/

---

## 🆘 获取帮助

如果遇到问题：

1. **查看日志**：
   ```bash
   adb logcat | grep -E "capacitor|navigator|AndroidRuntime"
   ```

2. **检查 Capacitor 状态**：
   ```bash
   npx cap doctor
   ```

3. **访问 Capacitor 社区**：
   - GitHub Issues: https://github.com/ionic-team/capacitor/issues
   - Discord: https://ionic.link/discord

4. **Stack Overflow**：
   - 搜索标签：`capacitor`, `android`, `maplibre-gl`

---

## ✅ 快速检查清单

发布前确认：

- [ ] 所有功能在模拟器上正常工作
- [ ] 所有功能在真实设备上正常工作
- [ ] 地图可以正常显示和操作
- [ ] 定位功能正常
- [ ] 导航路线规划正常
- [ ] 应用不会崩溃
- [ ] 所有权限已正确配置
- [ ] APK 已使用发布密钥签名
- [ ] 版本号已更新
- [ ] 测试了不同网络条件（Wi-Fi、移动数据、离线）
- [ ] 检查了电池消耗
- [ ] UI 在不同屏幕尺寸上正常显示

---

## 🎉 完成！

现在您已经拥有一个完整的 Android APK，可以：
- 安装到任何 Android 设备
- 分发给测试用户
- 准备发布到 Google Play Store

### 发布到 Google Play Store

如果要发布到应用商店：

1. 创建 Google Play Console 账户（需要 $25 一次性注册费）
2. 准备应用资料：
   - 应用图标（512x512）
   - 屏幕截图（至少 2 张）
   - 应用描述
   - 隐私政策链接
3. 上传签名的发布版 APK
4. 填写应用详情
5. 提交审核

祝您开发顺利！🚀