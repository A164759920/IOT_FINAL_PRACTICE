<template>
    <div class="container">
        <div class="connect-status" :class="setConnectStatus"></div>
        <img id="resImg" :src="imgSrc" alt="" v-if="srcVisible">
        <img id="resImg" src="../assets/default.gif" alt="picture" v-else>

        <button class="button-84" role="button" @click="connectSocket">开 始 核 分</button>
        <div class="stuID" v-if="srcVisible">学号：<input v-model="stuID"></div>

        <div class="scoreList">

            <div class="scoreItem" v-for="(item, index) in scores" :key="index">
                <div class="itemChild">NO.{{ index + 1 }}</div>
                <div class="itemChild">
                    <input type="number" v-model="scores[index]" @keydown.space="handleSpaceKey">
                </div>
            </div>
        </div>

        <input id="saveInput2" ref="saveInput" type="text" @keydown.space="handleSpaceKey">
        <div class="confirm-area">
            <button class="button-17" role="button" @click="saveData">确 认</button>
            <button class="button-17" role="button" @click="deleteData">取 消</button>
        </div>
    </div>
</template>


<script>
const os = require('os');
export default {
    data: function () {
        return {
            ws: null,
            timeID: 0,
            // scores: [11, 12, 13, 14, 15, 16],
            scores: [],
            scoresLen: 0,
            scoreSum: 0,
            stuID: "1001",
            imgSrc: "../assets/SCORE.jpg",
            srcVisible: false
        }
    },
    mounted: function () {
        this.$refs.saveInput.focus();
    },
    computed: {
        setConnectStatus: function () {
            return this.ws == null ? `` : `connected`
        }
    },
    methods: {
        // 重置数据
        resetData: function () {
            this.scores = [];
            this.scoresLen = 0;
            this.scoreSum = 0;
            this.stuID = "";
        },
        connectSocket: function () {
            this.ws = new WebSocket(`ws://${window.location.host.split(":")[0]}:3000/`);
            this.wsConnect()
        },
        keepalive: function () {
            var timeout = 150000;
            if (this.ws.readyState === WebSocket.OPEN) {
                const _obj = {
                    hostname: "vue",
                    func: "keepalive",
                    data: 0
                }
                this.ws.send(JSON.stringify(_obj))
            }
            this.timeID = setTimeout(this.keepalive, timeout)
        },
        cancelKeepAlive: function () {
            if (this.timeID) {
                clearTimeout(this.timeID)
            }
        },
        wsConnect: function () {
            const that = this
            this.ws.onopen = function (evt) {
                console.log("connection open .....")
                const _obj = {
                    hostname: "vue",
                    func: "connect",
                    data: 0
                }
                that.ws.send(JSON.stringify(_obj))
                that.keepalive()

            }
            this.ws.onmessage = function (evt) {
                const resMsg = evt.data
                let { hostname, func, data } = JSON.parse(resMsg.toString());
                if (hostname == "python" && func == "result") {
                    // that.imgSrc = `data:${data.pic}`
                    that.imgSrc = `${data.pic}`
                    that.srcVisible = true
                    that.scores = data.scores.slice(0, data.scoresLen + 1)
                    that.scoresLen = data.scoresLen + 1
                    that.scoreSum = data.scoreSum
                    that.stuID = data.stuID
                    that.$refs.saveInput.focus();
                }
                if (hostname == "vue" && func == "saveOK") {
                    alert("保存成功");
                    that.srcVisible = false
                    that.resetData()
                }
                if (hostname == "vue" && func == "deleteOK") {
                    alert("取消成功");
                    that.srcVisible = false
                    that.resetData()
                }
            }
            this.ws.onerror = function (evt) {
                console.log("连接错误", evt)

            }
            this.ws.onclose = function (evt) {
                console.log("已关闭连接", evt)
                that.cancelKeepAlive()
                that.ws = null
            }
        },

        saveData: function () {
            if (this.ws != null) {
                const _obj = {
                    hostname: "vue",
                    func: "save",
                    data: {
                        stuID: this.stuID,
                        scores: this.scores,
                        scoreLen: this.scoresLen,
                        scoreSum: this.scoreSum
                    }
                }
                this.ws.send(JSON.stringify(_obj))
            }
        },
        // 识别失败丢弃数据，并通知后端释放锁
        deleteData: function () {
            if (this.ws != null) {
                const _obj = {
                    hostname: "vue",
                    func: "delete",
                    data: 0
                }
                this.ws.send(JSON.stringify(_obj))
            }
        },

        handleSpaceKey() {
            // 处理空格键事件的逻辑
            console.log('空格键被按下');
            this.saveData()
        }
    }
}


</script>


<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    background-color: whitesmoke;

    .connect-status {
        margin-bottom: 20px;
        width: 25px;
        height: 25px;
        border-radius: 50%;
        background-color: red;
        box-shadow: -1px -1px 4px rgba(255, 255, 255, 0.05),
            4px 4px 6px rgba(0, 0, 0, 0.2),
            inset -1px -1px 4px rgba(255, 255, 255, 0.05),
            inset 1px 1px 1px rgba(0, 0, 0, 0.1);
    }

    .connected {
        background-color: green;
    }

    #resImg {
        margin-left: 5px;
        margin-right: 5px;
        margin-bottom: 10px;
        background-color: white;
        width: 60%;
        height: 400px;
        aspect-ratio: 960/720;

    }

    .stuID {
        font-family: expo-brand-demi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        font-weight: 550;
        font-size: 18px;
    }

    .stuID input {
        // border: none;
        width: 80px;
        background-color: inherit;
        font-weight: 600;
        font-size: 18px;
        text-align: center;
    }

    /* CSS */
    .button-84 {
        align-items: center;
        background-color: initial;
        background-image: linear-gradient(#464d55, #25292e);
        border-radius: 8px;
        border-width: 0;
        box-shadow: 0 10px 20px rgba(0, 0, 0, .1), 0 3px 6px rgba(0, 0, 0, .05);
        box-sizing: border-box;
        color: #fff;
        cursor: pointer;
        display: inline-flex;
        flex-direction: column;
        font-family: expo-brand-demi, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
        font-size: 18px;
        height: 52px;
        justify-content: center;
        line-height: 1;
        margin: 0;
        outline: none;
        overflow: hidden;
        padding: 0 32px;
        text-align: center;
        text-decoration: none;
        transform: translate3d(0, 0, 0);
        transition: all 150ms;
        vertical-align: baseline;
        white-space: nowrap;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
    }

    .button-84:hover {
        box-shadow: rgba(0, 1, 0, .2) 0 2px 8px;
        opacity: .85;
    }

    .button-84:active {
        outline: 0;
    }


    @media (max-width: 420px) {
        .button-84 {
            height: 48px;
        }
    }

    /* CSS */
    .button-17 {
        align-items: center;
        appearance: none;
        background-color: #fff;
        border-radius: 10px;
        border-style: none;
        box-shadow: rgba(0, 0, 0, .2) 0 3px 5px -1px, rgba(0, 0, 0, .14) 0 6px 10px 0, rgba(0, 0, 0, .12) 0 1px 18px 0;
        box-sizing: border-box;
        color: #3c4043;
        cursor: pointer;
        display: inline-flex;
        fill: currentcolor;
        font-family: "Google Sans", Roboto, Arial, sans-serif;
        font-size: 14px;
        font-weight: 550;
        height: 48px;
        justify-content: center;
        letter-spacing: .25px;
        line-height: normal;
        max-width: 100%;
        overflow: visible;
        padding: 2px 24px;
        position: relative;
        text-align: center;
        text-transform: none;
        transition: box-shadow 280ms cubic-bezier(.4, 0, .2, 1), opacity 15ms linear 30ms, transform 270ms cubic-bezier(0, 0, .2, 1) 0ms;
        user-select: none;
        -webkit-user-select: none;
        touch-action: manipulation;
        width: auto;
        will-change: transform, opacity;
        z-index: 0;
    }

    .button-17:hover {
        background: #F6F9FE;
        color: #174ea6;
    }

    .button-17:active {
        box-shadow: 0 4px 4px 0 rgb(60 64 67 / 30%), 0 8px 12px 6px rgb(60 64 67 / 15%);
        outline: none;
    }


    .button-17:not(:disabled) {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .button-17:not(:disabled):hover {
        box-shadow: rgba(60, 64, 67, .3) 0 2px 3px 0, rgba(60, 64, 67, .15) 0 6px 10px 4px;
    }

    .button-17:not(:disabled):active {
        box-shadow: rgba(60, 64, 67, .3) 0 4px 4px 0, rgba(60, 64, 67, .15) 0 8px 12px 6px;
    }

    .button-17:disabled {
        box-shadow: rgba(60, 64, 67, .3) 0 1px 3px 0, rgba(60, 64, 67, .15) 0 4px 8px 3px;
    }

    .scoreList {
        display: flex;
        margin: 10px;

        .scoreItem {
            .itemChild {
                text-align: center;
                line-height: 75px;
                font-weight: 500;
                font-size: 20px;
                background-color: cornflowerblue;
                height: 75px;
                width: 150px;
                border: 2px solid black;
            }

            .itemChild input[type="number"] {
                border: none;
                background-color: inherit;
                font-weight: 600;
                width: 100%;
                height: 80%;
                font-size: 20px;
                /* 设置字体大小为 20 像素 */
                text-align: center;
                /* 设置文本居中对齐 */
            }

            .itemChild:nth-child(1) {
                background-image: linear-gradient(#464d55, #25292e);
                color: whitesmoke;
            }

            .itemChild:nth-child(2) {
                background-color: white;
            }
        }
    }

    #saveInput2 {
        // display: none;
        width: 0;
        height: 0;
        opacity: 0;
    }

    .confirm-area {

        width: 35%;
        display: flex;
        justify-content: space-around;
    }
}
</style>