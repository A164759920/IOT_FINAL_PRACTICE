/**
 * - 与HI3861交互
 * - 与Python交互
 * - 与Vue交互
 */
const PORT = 3000;

const http = require("http");
const WebSocket = require("ws");
const tencentcloud = require("tencentcloud-sdk-nodejs-ocr");

const { clientConfig } = require("./OCR.js");
const OcrClient = tencentcloud.ocr.v20181119.Client;
// 在前端为传感器上锁，防止接口频繁调用
let OCR_MUTEX = "OFF"; // 取值为ON 或者 OFF

// 创建 HTTP 服务器
const httpServer = http.createServer((req, res) => {
  // 处理 HTTP 请求

  const clientAddress = req.socket.remoteAddress;
  const clientPort = req.socket.remotePort;
  console.log(
    `【http】Client connected from ${clientAddress.split(":")[3]}:${clientPort}`
  );
  if (req.url == "/getDisc") {
    console.log("收到控制帧");
    // 传感器上报控制指令
    const payload = {
      hostname: "HI3861",
      func: "command",
      data: 0,
    };
    for (const client of connectedClients) {
      client.send(JSON.stringify(payload));
    }
    // 设置 HTTP 响应头部
    res.setHeader("Content-Type", "text/plain");
    // 设置 HTTP 响应主体内容
    res.write("Success: getDisc request received and processed.");
    res.end();
  }
});

// 创建 WebSocket 服务器
const webSocketServer = new WebSocket.Server({ server: httpServer });
const connectedClients = new Set();

// 处理 WebSocket 连接

webSocketServer.on("connection", (ws, req) => {
  // 每一个连接的客户端是一个ws，ws的内容可在req中获取

  connectedClients.add(ws);

  ws.on("message", (message) => {
    const clientAddress = req.socket.remoteAddress.split(":")[3]; // 获取ipv4地址
    const clientPort = req.socket.remotePort;
    console.log(`receive message from ${clientAddress}:${clientPort}`);
    const { hostname, func, data } = JSON.parse(message.toString());
    console.log(hostname, func);
    if (func == "connect") {
      const _obj = {
        hostname: "server",
        func: "connect",
        data: "hello client!!!",
      };
      ws.send(JSON.stringify(_obj));
    }
    /**
     * @description : API识别解决方案
     */
    if (hostname == "python" && func == "result") {
      // 接收到了python的回传数据
      console.log("来了");
      if (OCR_MUTEX == "OFF") {
        OCR_MUTEX = "ON";
        const client = new OcrClient(clientConfig);
        let ImageBase64 = data.pic;
        const params = {
          ImageBase64,
        };
        client.GeneralHandwritingOCR(params).then(
          (data) => {
            // @deprecated 弃用，新增学号匹配
            // const scores = [];
            // const over100Scores = [];
            // let scoreSum = 0;
            // data.TextDetections.forEach((item) => {
            //   if (/^\d+$/.test(item.DetectedText)) {
            //     const score = parseInt(item.DetectedText);
            //     if (score <= 100) {
            //       scores.push(score);
            //       scoreSum = scoreSum + score;
            //     } else {
            //       over100Scores.push(score);
            //     }
            //   }
            // });
            // console.log(scores); // 输出小于等于100的纯数字数组
            // console.log(over100Scores); // 输出大于100的纯数字数组

            const stuID = new Set();
            const scores = [];
            let scoreSum = 0;

            data.TextDetections.forEach((text) => {
              const detectedText = text.DetectedText.trim();
              const advancedInfo = JSON.parse(text.AdvancedInfo);
              if (
                /^学号：?/.test(detectedText) ||
                /^学号：?/.test(advancedInfo.Parag)
              ) {
                let number;
                if (/学号：/.test(detectedText)) {
                  number = parseInt(detectedText.split("：")[1]);
                } else {
                  number = parseInt(detectedText.replace(/^学号：?/, ""));
                }
                if (number > 1000) {
                  stuID.add(number);
                } else if (number < 100) {
                  scoreSum = scoreSum + parseInt(detectedText);
                  scores.push(detectedText);
                }
              } else if (/^\d+$/.test(detectedText)) {
                const number = parseInt(detectedText);
                if (number > 1000) {
                  stuID.add(number);
                } else if (number < 100) {
                  scoreSum = scoreSum + parseInt(detectedText);
                  scores.push(parseInt(detectedText));
                }
              }
            });

            console.log("学号匹配结果", [...stuID][0]);
            console.log("成绩", scores);

            const _obj = {
              hostname,
              func,
              data: {
                pic: ImageBase64,
                scores,
                stuID: [...stuID][0] ? [...stuID][0] : 1000,
                scoresLen: scores.length,
                scoreSum,
              },
            };
            for (const client of connectedClients) {
              client.send(JSON.stringify(_obj));
            }
          },
          (err) => {
            console.error("error", err);
          }
        );
      } else {
        console.log("请先确认上一次识别结果...");
      }
    }
    if (hostname == "vue") {
      if (func == "save") {
        // 用户已确认信息准确，保存数据
        const { stuID, scores, scoreLen, scoreSum } = data;
        console.log("已收到确认数据", stuID, scores, scoreLen, scoreSum);
        // 若save成功，返回给前端确认
        OCR_MUTEX = "OFF";
      }
      if (func == "delete") {
        // 用户丢弃数据，释放锁
        console.log("用户已丢弃此次识别数据");
      }
      // 发送回显结果
      OCR_MUTEX = "OFF";
      const _obj = {
        hostname,
        func: `${func}OK`,
        data: 0,
      };
      ws.send(JSON.stringify(_obj));
    }
  });

  ws.on("close", () => {
    console.log("有客户端断开连接，释放锁");
    OCR_MUTEX = "OFF";
    connectedClients.delete(ws);
  });
});

// 发送消息

// 启动服务器
httpServer.listen(PORT, () => {
  console.log(`server started on port：${PORT}`);
});
