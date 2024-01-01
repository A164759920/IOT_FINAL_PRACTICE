# 说明

若使用**docker**构建，请将虚拟机设置为**桥接模式**，以便多端网络通常

# ⚡⚡⚡ 使用方法

- 按要求配置好**Node + HI3891 + Python + Vue**四端环境（确保处于同一局域网下）
- 打开手机**IP 摄像头**APP，调整好摄像头和传感器的位置
- 打开**_Vue_**前端</br>

```
       浏览器打开:http://192.168.XX.XX:8080
```

- 点击**开始核分**,连接**Node 服务器**，指示灯变为**_绿 ✅_**代表连接成功

- 在传感器上方放置**试卷**

- 等待图像回传到前端

- 确认识别结果，无误点击**确认**，识别失败点击**取消**
  - 为防止接口频繁调用，每次识别后必须点击**_确认/取消_**后才可进行下一次

# ⭐ 一.HI3861

- 工程文件源码详见**HI3861\wifi-iot\app\distance**文件夹
- 免编译烧录：**HI3861\out\Hi3861_wifiiot_app_allinone.bin**，配合**HIBurn**使用
- 测距传感器使用**HC-SRO4**
  - **ECHO**接**A11**引脚
  - **TRIG**接**A12**引脚
  - **GPIO_9**用于控制感知指示灯
- 试卷距传感器最小距离**必须大于 3cm**,否则无法识别

# ⭐ 二.Node HTTP + Websocket 服务器

## 环境安装(本地)

- **npm intall** 安装所需依赖
- **npm index.js** 启动服务器

## 环境安装(docker)

- 构建镜像：**docker build .**
- 重命名镜像：**docker tag 容器 id mynode:1.0**
- 构建容器：**docker run -d -p 0.0.0.0:3000:3000 --name nodeContainer mynode:1.0**
- 查看容器运行情况：**docker ps -a**

## 接口说明

- ❗ 使用前须现在**env**文件中配置**SECRET_ID、SECRET_KEY**

- ws 服务器 和 http 服务器 均运行在**3000 端口**

  - ws: **_ws:\\本机 ip:3000_**
  - http: **_http:\\本机 ip:3000_**

    - 提供 **getDisc** 接口，用于和**HI3861**交互

      ```
        eg:http://127.0.0.1:3000/getDisc
        返回:Success: getDisc request received and processed.表示成功
      ```

# ⭐ 三.Python 图像处理 client

## 环境安装(docker)

- 构建镜像：**docker build .**
- 重命名镜像：**docker tag 容器 id mypy:1.0**
- 构建容器：**docker run -d -p 0.0.0.0:3001:3001 --name pyContainer mypy:1.0**
- 查看容器运行情况：**docker ps -a**

## 接口说明

- 已做线程监听，可随时**IP 摄像头**互联
- 提供 **py**接口，测试 client 是否部署成功

      ```
        eg:http://127.0.0.1:3001/py
        返回:python client is alive!!!!表示成功
      ```

# ⭐ 四.Vue 交互前端

## 环境安装(docker)

- 构建镜像：**docker build .**
- 重命名镜像：**docker tag 容器 id myvue:1.0**
- 构建容器：**docker run -d -p 0.0.0.0:8080:8080 --name vueContainer myvue:1.0**
- 查看容器运行情况：**docker ps -a**
