<template>
    <div class="container">
        <div class="body">
            <img id="resImg" :src="imgSrc" alt="">
            <div class="body-right">
                <!-- <div class="right-item">
                    <div class="item-text">人 像 识 别</div>
                    <div class="item-box">{{ isFacedText }}</div>
                </div>
                <div class="right-item">
                    <div class="item-text">运 动 检 测</div>
                    <div class="item-box">{{ isMovedText }}</div>
                </div> -->
                <div class="right-tip">
                    <p style="font-weight:550">提示：</p>
                    <p>画面中出现<span style="color:rgb(0,255,0)">绿色矩形</span>即检测到运动</p>
                    <p>画面中出现<span style="color:rgb(0,0,255)">蓝色矩形</span>即检测到人像</p>
                </div>
                <button class="right-button" role="button" @click="connectSocket">开 始 检 测</button>
            </div>
        </div>

    </div>

</template>

<script>

export default {

    data: function () {
        return {
            ws: "",
            imgSrc: "",
            timeID: 0,
            // isFacedText: "未识别到人像",
            // isMovedText: "未检测到运动"
        }
    },
    methods: {
        connectSocket: function () {
            this.ws = new WebSocket("ws://127.0.0.1:8188/");
            this.wsConnect()
        },
        keepalive: function () {
            var timeout = 15000;
            if (this.ws.readyState === WebSocket.OPEN) {
                this.ws.send("")
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
            console.log(this.ws)
            this.ws.onopen = function (evt) {
                console.log("connection open .....")
                that.keepalive()
            }
            this.ws.onmessage = function (evt) {
                const resMsg = evt.data
                var reader = new FileReader()
                reader.readAsText(resMsg)
                reader.onload = function (e) {
                    let tempFaceText = "未识别到人像"
                    let tempMoveText = "未检测到运动"
                    // 如何优化？？？？
                    // 视频流和检测帧应该分开？
                    // 
                    if (e.currentTarget.result === "face") {
                        tempFaceText = "已识别到人像"
                    }
                    else if (e.currentTarget.result === "moved") {
                        tempMoveText = "已检测到运动"
                    }
                    else {
                        document.getElementById("resImg").src = e.currentTarget.result
                    }
                    // that.isFacedText = tempFaceText
                    // that.isMovedText = tempMoveText


                }
            }
            this.ws.onerror = function (evt) {
                console.log("连接错误", evt)

            }
            this.ws.onclose = function (evt) {
                console.log("已关闭连接", evt)
                that.cancelKeepAlive()
            }
        }
    },
    mounted: function () {
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
    position: relative;
    .body {
        position: absolute;
        top: 50px;
        display: flex;
        align-items: center;
        height: 420px;
        background-color: whitesmoke;
        box-shadow: rgba(0, 0, 0, 0.19) 0px 10px 20px, rgba(0, 0, 0, 0.23) 0px 6px 6px;
        #resImg {
            margin-left: 5px;
            margin-right: 5px;
            background-color: white;
            width: 500px;
            height: 375px;
            aspect-ratio: 960/720;

        }

        .body-right {
            width: 300px;
            height: 100%;
            position: relative;
            display: flex;
            align-items: center;
            flex-direction: column;
            background-color: #03A9F4;

            // .right-item {
            //     width: 100%;

            //     .item-text {
            //         margin-bottom: 5px;
            //         font-size: 17px;
            //         font-weight: 500;
            //         font-family: "Space Grotesk", -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
            //     }

            //     .item-box {
            //         background-color: #FFFFFF;
            //         width: 80%;
            //         height: 50px;
            //         line-height: 50px;
            //         text-align: center;
            //         margin-left: 25px;
            //         margin-bottom: 5px;
            //     }
            // }
            .right-tip{
                margin-top: 20px;
                p{
                    font-weight: 500;
                    margin-bottom: 10px;
                    color:white;
                    font-family: "Space Grotesk", -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                }
                span{
                    font-weight: 550;
                }
            }
            .right-button {
                position: absolute;
                bottom: 5px;
                background-color: #FFFFFF;
                border-radius: 4px;
                border: 0;
                box-shadow: rgba(1, 60, 136, .5) 0 -1px 3px 0 inset, rgba(0, 44, 97, .1) 0 3px 6px 0;
                box-sizing: border-box;
                color: #9E9E9E;
                cursor: pointer;
                display: inherit;
                font-family: "Space Grotesk", -apple-system, system-ui, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
                font-size: 18px;
                font-weight: 700;
                line-height: 24px;
                margin: 0;
                min-height: 56px;
                min-width: 120px;
                padding: 16px 20px;
                text-align: center;
                user-select: none;
                -webkit-user-select: none;
                touch-action: manipulation;
                vertical-align: baseline;
                transition: all .2s cubic-bezier(.22, .61, .36, 1);
            }

            .right-button:hover {
                background-color: whitesmoke;
                transform: translateY(-2px);
            }
        }

    }

}
</style>
