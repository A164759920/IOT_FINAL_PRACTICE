FROM python:3.9

# 将工作目录切换到 /app
WORKDIR /app

# 安装所需的依赖
RUN apt-get update && \
    apt-get install -y libglib2.0-0 libsm6 libxext6 libxrender-dev

# 安装 Python 库
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用程序代码到容器中
COPY . .

# 设置环境变量
ENV FLASK_APP=app.py

# 暴露应用程序的默认端口
EXPOSE 3001

# 启动应用程序
CMD ["python", "capture.py"]
