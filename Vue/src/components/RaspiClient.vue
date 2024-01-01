<template>
    <div class="container">
        <div class="connect-status" :class="setConnectStatus"></div>
        <div class="distance-text">距离: {{ distance }} CM</div>
        <div class="distance-text">控制状态: {{ controlText }}</div>
        <button class="button-84" role="button" @click="foreverOpenRelayClick"> 常开 </button>
        <button class="button-84" role="button" @click="foreverCloseRelayClick"> 常闭 </button>
    </div>
</template>

<script>
export default {
    data: function () {
        return {
            ws: "",
            timeID: 0,
            distance: 0,
            relayState: false,
            controlText: "自动控制",
            foreverOpen: false,
            foreverClose: false,
            wsDomain: "ws://192.168.43.72:8188/"
        }
    },
    methods: {
        MsgHandler: function (resMsg) {
            const that = this
            var reader = new FileReader()
            reader.readAsText(resMsg)
            // 将Blob转换为Text
            reader.onload = function (e) {
                const msgArray = e.currentTarget.result.split(",");
                const clientName = msgArray[0];
                const clientFunc = msgArray[1];
                const clientPayload = msgArray[2];
                // 处理树莓派上报数据
                if (clientName === "rasp") {
                    switch (clientFunc) {
                        case "data_dis":
                            that.distance = Number(clientPayload).toFixed(2)
                            break;
                        case "state_dis":
                            if (clientPayload === "relay_on") {
                                that.relayState = true
                            }
                            if (clientPayload === "relay_off") {
                                that.relayState = false
                            }
                    }
                } 
                // 处理回显数据
                if (clientName === "H5" && clientFunc === "command") {
                    switch (clientPayload) {
                        case "relay_lock_on":
                            that.controlText = "常开"
                            break;
                        case "relay_lock_off":
                            that.controlText = "常闭"
                            break;
                        case "relay_lock_normal":
                            that.controlText = "自动控制"
                            break;
                        default:
                            break;
                    }
                }
            }

        },
        createCommandFrame: function (payload) {
            return `H5,command,${payload}`
        },
        foreverOpenRelayClick: function () {
            let command
            if (this.foreverOpen) {
                command = this.createCommandFrame("relay_lock_on")
            } else {
                command = this.createCommandFrame("relay_lock_normal")
            }
            if (this.ws) {
                this.ws.send(command)
            }
            this.foreverOpen = !this.foreverOpen
        },
        foreverCloseRelayClick: function () {
            let command
            if (this.foreverOpen) {
                command = this.createCommandFrame("relay_lock_off")
            } else {
                command = this.createCommandFrame("relay_lock_normal")
            }
            if (this.ws) {
                this.ws.send(command)
            }
            this.foreverOpen = !this.foreverOpen
        },
        connectSocket: function () {
            this.ws = new WebSocket(this.wsDomain);
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
                that.MsgHandler(resMsg)

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
    computed: {
        setConnectStatus: function () {
            return this.relayState ? `connected` : ``
        },
    },
    mounted: function () {
        this.connectSocket()
    }

}
</script>


<style lang="scss" scoped>
.container {
    width: 100%;
    height: 100%;
    background-color: whitesmoke;
    font-family: Cambria, Cochin, Georgia, Times, 'Times New Roman', serif;
    font-weight: bolder;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    .connect-status {
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

    .distance-text{
        margin: 5px;
    }

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
        margin: 5px;
        width: 100px;
    }

    .button-84:hover {
        box-shadow: rgba(0, 1, 0, .2) 0 2px 8px;
        opacity: .85;
    }

    .button-84:active {
        outline: 0;
    }

    .button-84:focus {
        box-shadow: rgba(0, 0, 0, .5) 0 0 0 3px;
    }

    @media (max-width: 420px) {
        .button-84 {
            height: 48px;
        }
    }
}
</style>