// // Depends on tencentcloud-sdk-nodejs version 4.0.3 or higher
// const tencentcloud = require("tencentcloud-sdk-nodejs-ocr");

// const OcrClient = tencentcloud.ocr.v20181119.Client;

// // 实例化一个认证对象，入参需要传入腾讯云账户 SecretId 和 SecretKey，此处还需注意密钥对的保密
// // 代码泄露可能会导致 SecretId 和 SecretKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考，建议采用更安全的方式来使用密钥，请参见：https://cloud.tencent.com/document/product/1278/85305
// // 密钥可前往官网控制台 https://console.cloud.tencent.com/cam/capi 进行获取

const { SECRET_ID, SECRET_KEY } = require("./config.default.js");

const clientConfig = {
  credential: {
    secretId: SECRET_ID,
    secretKey: SECRET_KEY,
  },
  region: "ap-shanghai",
  profile: {
    httpProfile: {
      endpoint: "ocr.tencentcloudapi.com",
    },
  },
};

module.exports = { clientConfig };

// 实例化要请求产品的client对象,clientProfile是可选的

// // console.log("文件内容：", ImageBase64);
// const client = new OcrClient(clientConfig);
// const params = {
//   ImageBase64,
// };
// client.GeneralHandwritingOCR(params).then(
//   (data) => {
//     console.log(data);
//   },
//   (err) => {
//     console.error("error", err);
//   }
// );

// const scores = [];
// const over100Scores = [];

// testRes.TextDetections.forEach((item) => {
//   if (/^\d+$/.test(item.DetectedText)) {
//     const score = parseInt(item.DetectedText);
//     if (score <= 100) {
//       scores.push(score);
//     } else {
//       over100Scores.push(score);
//     }
//   }
// });

// console.log(scores); // 输出小于等于100的纯数字数组
// console.log(over100Scores); // 输出大于100的纯数字数组
