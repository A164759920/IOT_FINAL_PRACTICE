import asyncio
import logging
import json
import time
import threading

logging.basicConfig(format='%(asctime)s - %(filename)s[line:%(lineno)d] - %(levelname)s: %(message)s',
                    level=logging.DEBUG,
                    filename='test.log',
                    filemode='a')
import websockets
import socket
import base64
import numpy as np
import cv2

from numpy import *

import time

import pytesseract
from flask import Flask

# 全局逻辑总控变量
GLOBAL_CAPTURE_FLAG = False  # 视频捕捉控制
GLOBAL_SEND_FLAG = False  # 图像截取控制
GLOBAL_WEBSOCKET = None  # ws客户端控制
EVENT_LOOP = asyncio.new_event_loop() #总事件循环

def createResultJSON(frame):
    # frame_cut = cv2.imread('capture_frame.jpg')   # 读取裁切后的图片作为输出图像
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), 95]
    result, imgencode = cv2.imencode('.jpg', frame, encode_param)
    data = np.array(imgencode)
    img = data.tobytes()
    img = base64.b64encode(img).decode()
    obj = {
        "hostname": "python",
        "func": "result",
        "data":
            {
                # "scores": scores,
                # "scoreSum": scoreSum,
                # "scoresLen": scoresLen,
                # "stuID": stuID,
                "pic": "data:image/jpeg;base64," + img

            }
    }
    return json.dumps(obj)





def receiveHandler(message):
    global GLOBAL_SEND_FLAG
    try:
        data = json.loads(message)
        hostname = data.get('hostname')
        func = data.get('func')

        # 打印解析结果
        print(f'Hostname: {hostname}')
        if hostname == 'HI3861':
            print("receiveHandler 判断成功")
            GLOBAL_SEND_FLAG = True

        print(f'Func: {func}')

    except json.JSONDecodeError as e:
        print(f'Failed to decode JSON: {e}')


async def websocket_receive():
    global GLOBAL_WEBSOCKET
    if GLOBAL_WEBSOCKET is not None:
        while True:
            try:
                message = await GLOBAL_WEBSOCKET.recv()
                # print("Received message:" + message)
                receiveHandler(message)
            except websockets.exceptions.ConnectionClosed:
                # 连接被关闭，退出循环
                break
        await connect()



def video_watcher(video):
    cap = cv2.VideoCapture(video)
    success, _ = cap.read()
    cap.release()
    return success


def websocket_send(message):
    global GLOBAL_WEBSOCKET, EVENT_LOOP
    if GLOBAL_WEBSOCKET is not None:
        asyncio.run_coroutine_threadsafe(GLOBAL_WEBSOCKET.send(message), EVENT_LOOP)
        print("发送消息执行")

async def connect():
    global GLOBAL_WEBSOCKET,GLOBAL_WEBSOCKET_LOOP
    # ip_address = socket.gethostbyname(socket.gethostname())
    # url = "ws://192.168.44.144:3000"
    # url = "ws://192.168.43.72:3000"
    url = "ws://192.168.1.22:3000"
    print("ws地址", url)
    async with websockets.connect(url) as websocket:
        print("连接函数执行了")
        GLOBAL_WEBSOCKET_LOOP = asyncio.get_event_loop()
        GLOBAL_WEBSOCKET = websocket
        obj = {
            "hostname": "python",
            "func": "connect",
            "data": 0
        }
        await websocket.send(json.dumps(obj))
        receive_task = asyncio.create_task(websocket_receive())
        await asyncio.gather(receive_task)


def video_capture(video):
    global GLOBAL_CAPTURE_FLAG, GLOBAL_SEND_FLAG
    cap = cv2.VideoCapture(video)
    while GLOBAL_CAPTURE_FLAG:
        success, _ = cap.read()
        if not success:
            print('[video_capture]视频连接断开，重新连接...')
            cap.release()
            cap = cv2.VideoCapture(video)
            continue
        # 执行逻辑
        print('正在处理图像...')
        fourcc = cv2.VideoWriter_fourcc('F', 'L', 'V', '1')
        # 帧率
        fps = cap.get(cv2.CAP_PROP_FPS)
        print("帧率", fps)
        while True:
            ret, frame = cap.read()
            if not ret:
                print("读取完成")
                break  # 读取完整个视频后退出循环

            if GLOBAL_SEND_FLAG is True:
                message = createResultJSON(frame)
                if GLOBAL_WEBSOCKET is not None:
                    websocket_send(message)
                    GLOBAL_SEND_FLAG = False
    print('图像处理线程结束..')


def video_watcher(video):
    global GLOBAL_CAPTURE_FLAG
    capture_thread2 = None
    cap = cv2.VideoCapture(video)
    while True:
        ret, _ = cap.read()
        # print("监控视频连接状态...", ret)
        if ret is False:
            print('[video_watcher]视频连接失败,重新连接...')
            cap.release()
            cap = cv2.VideoCapture(video)
            continue
        else:  # ret 不是false表示摄像头在线
            if capture_thread2 is None or not capture_thread2.is_alive():
                # 启动子线程进行图像捕捉和处理
                GLOBAL_CAPTURE_FLAG = True
                print("创建图像处理线程")
                capture_thread2 = threading.Thread(target=video_capture, args=(video,))
                capture_thread2.start()
        time.sleep(1)


app = Flask(__name__)


@app.route("/py")
def hello():
    return "python client is alive!!!!"


def run_flask_app():
    app.run(host="127.0.0.1", port=3001)


if __name__ == "__main__":
    asyncio.set_event_loop(EVENT_LOOP)
    flask_thread = threading.Thread(target=run_flask_app)
    flask_thread.start()

    # 监控视频连接状态起线程
    video = "http://admin:admin@192.168.1.106:8081/video"  # 此处@后的ipv4 地址需要改为app提供的地址
    video_watcher_thread = threading.Thread(target=video_watcher, args=(video,))
    video_watcher_thread.start()

    GLOBAL_CAPTURE_FLAG = True
    EVENT_LOOP.run_until_complete(connect())
    # video_watcher_thread.join()