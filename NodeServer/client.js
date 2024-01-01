const WebSocket = require("ws");

// 创建 WebSocket 客户端
const ws = new WebSocket("ws://localhost:5000");

// 连接成功时的回调函数
ws.on("open", () => {
  console.log("Connected to WebSocket server");

  // 发送消息
  const payload = {
    hostname: "python",
    func: "result",
  };
  ws.send(JSON.stringify(payload));
});

// 接收消息时的回调函数
ws.on("message", (message) => {
  console.log("Received:", message.toString());
});

// 连接关闭时的回调函数
ws.on("close", () => {
  console.log("Disconnected from WebSocket server");
});
