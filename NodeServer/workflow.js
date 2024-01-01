const { Event } = require("./Event/pub-sub");

const {
  SERVER_IP,
  SERVER_USERNAME,
  SERVER_PWD,
} = require("./config.default.js");
const config = {
  host: SERVER_IP,
  port: 22,
  username: SERVER_USERNAME,
  password: SERVER_PWD,
};

const { Client } = require("ssh2");
const client = new Client(); // 创建 SSH2 客户端

const path = require("path");
let mysftp = "";

const fs = require("fs");
const excludeList = ["/node_modules"];
const remotePath = "/home/dragon/test";
const remote_existed_folders = [];
const dirTasks = [];
const fileTasks = [];
let dirFinishNum = 0;

client.connect(config);

client.on("ready", () => {
  console.log("Client :: ready");

  client.sftp((err, sftp) => {
    if (err) console(err);
    console.log("SFTP :: ready");
    mysftp = sftp;
    // 读文件用以判断是否需要新建文件
    sftp.readdir(remotePath, (err, list) => {
      if (err) console.log(err);
      else {
        list.forEach((item) => {
          const { filename } = item;
          if (filename.split(".").length <= 1 && filename !== "node_modules") {
            //  console.log(filename);
            remote_existed_folders.push(filename);
          }
        });
        // TODO:这里还需要改
        const need_createDir =
          remote_existed_folders.length >= 1 ? false : true;
        const files = fs.readdirSync(__dirname);
        // 递归扫描当前文件夹生成dirTasks和fileTasks
        files.forEach((file) => {
          walk(".", file);
        });
        // 若为首次，则先创建文件夹再推送文件
        if (need_createDir) {
          Event.$on("mk_dir", () => {
            dirFinishNum++;
            if (dirFinishNum === dirTasks.length) {
              console.log("⚡所有文件夹创建完成");
              fileTasks.forEach((fileObj) => {
                const { rel_localFilePath, remoteRawPath } = fileObj;
                create_upload_task(rel_localFilePath, remoteRawPath);
              });
            }
          });
          dirTasks.forEach((dirPath) => {
            create_mkdir_task(dirPath);
          });
        } else {
          // 若远端文件夹已存在，则直接推送文件
          fileTasks.forEach((fileObj) => {
            const { rel_localFilePath, remoteRawPath } = fileObj;
            create_upload_task(rel_localFilePath, remoteRawPath);
          });
        }
      }
    });
  });
});

/**
 * @description 创建远端文件夹
 * @param {String} dirPath 创建文件夹的路径
 */
function create_mkdir_task(dirPath) {
  return new Promise((resolve, reject) => {
    mysftp.mkdir(dirPath, (err) => {
      if (err) {
        console.log("❌创建文件夹失败", err, dirPath);
        reject(err);
      } else {
        console.log("✅创建文件夹成功", dirPath);
        resolve(dirPath);
      }
      Event.$emit("mk_dir");
    });
  });
}
/**
 * @description 文件推送
 * @param {String} rel_localFilePath 本地文件的相对路径
 * @param {String} remoteRawPath 推送至远端的路径
 */
function create_upload_task(rel_localFilePath, remoteRawPath) {
  return new Promise((resolve, reject) => {
    const localFilePath = path.resolve(__dirname, rel_localFilePath);
    const localFileName = path.basename(localFilePath);

    const remoteFilePath = `${remoteRawPath}\/${localFileName}`;
    //console.log("标识符", localFileName, remoteFilePath);
    mysftp.fastPut(localFilePath, remoteFilePath, (err) => {
      if (err) {
        console.log("❌上传失败..", err, localFilePath, remoteFilePath);
        reject(err);
      } else {
        console.log("✅上传成功..", remoteFilePath);
        resolve(remoteFilePath);
      }
    });
  });
}

/**
 * @description 递归遍历文件夹创建dirTasks 和
 * @param {String} basePath 文件夹地址
 * @param {String} fileName 文件名
 * @returns
 */
function walk(basePath, fileName) {
  const rel_localFilePath = `${basePath.split(".")[1]}\/${fileName}`;
  const isDir = fs.statSync(path.resolve(basePath, fileName)).isDirectory();
  if (!excludeList.includes(rel_localFilePath)) {
    if (isDir) {
      // 创建文件夹
      const dirPath = remotePath + basePath.split(".")[1] + `\/${fileName}`;
      try {
        dirTasks.push(dirPath);
      } catch (error) {
        console.log(error);
      }
      const files = fs.readdirSync(path.resolve(basePath, fileName));
      files.forEach((newfileName) => {
        walk(`${basePath}\/${fileName}`, newfileName);
      });
    } else {
      const dirPath = remotePath + basePath.split(".")[1];
      fileTasks.push({
        rel_localFilePath: `${basePath}\/${fileName}`,
        remoteRawPath: dirPath,
      });
      return;
    }
  }
}

client.on("error", (err) => {
  console.error(err);
});
