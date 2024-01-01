#include <stdio.h>
#include <stdlib.h>
#include "time.h"
#include "net_demo.h"
#include "net_common.h"
#include "net_params.h"
#include "distance.h"

#include "ohos_init.h" // 用于初始化服务(services)和功能(features)
#include "cmsis_os2.h" // CMSIS-RTOS API V2

#include "iot_gpio.h" // OpenHarmony HAL API：IoT硬件设备操作接口-GPIO
#include "hi_io.h"    // 海思Pegasus SDK API：IoT硬件设备操作接口-IO
#include "hi_time.h"

// An highlighted block

#define Echo 11 // A11
#define Trig 12 // A12
#define LED_GPIO 9

#define MIN_DISTANCE 10 // 测量距离值小于6判定有试卷
#define MIN_COUNT 3     // 检测到两次符合条件即算成功

// #define PARAM_SERVER_ADDR
/**
 * 间隔0.5秒闪灯
 */
void flashLED()
{
    IoTGpioSetOutputVal(LED_GPIO, IOT_GPIO_VALUE0);

    // 等待0.5秒。单位是10ms。
    osDelay(50);

    // 输出高电平，熄灭LED。
    IoTGpioSetOutputVal(LED_GPIO, IOT_GPIO_VALUE1);
}

// 用于记录检测到符合条件的距离的次数
int getDistanceCount = 0;

/**
 * @description:发送已检测到距离的请求
 */
void sendDistanceRequest()
{
    static char request[] = "GET /getDisc HTTP/1.1\r\n\
Content-Type: text/plain;charset=UTF-8\r\n\
Host: HI3861\r\n\
Connection: close\r\n\
\r\n";
    static char response[128] = "";
    // const char addr_ip[] = "192.168.44.144";
    const char addr_ip[] = "192.168.43.42";

    ssize_t retval = 0;
    int sockfd = socket(AF_INET, SOCK_STREAM, 0); // TCP socket

    struct sockaddr_in serverAddr = {0};
    serverAddr.sin_family = AF_INET;   // AF_INET表示IPv4协议
    serverAddr.sin_port = htons(3000); // 端口号，从主机字节序转为网络字节序
    if (inet_pton(AF_INET, addr_ip, &serverAddr.sin_addr) <= 0)
    {
        printf("inet_pton failed!\r\n");
        goto do_cleanup;
    }

    // 尝试和目标主机建立连接，连接成功会返回0 ，失败返回 -1
    if (connect(sockfd, (struct sockaddr *)&serverAddr, sizeof(serverAddr)) < 0)
    {
        printf("connect failed!\r\n");
        goto do_cleanup;
    }
    printf("connect to server %s success!\r\n", addr_ip);

    // 建立连接成功之后，这个TCP socket描述符 —— sockfd 就具有了 “连接状态”，
    // 发送、接收 对端都是 connect 参数指定的目标主机和端口
    retval = send(sockfd, request, sizeof(request), 0);
    if (retval < 0)
    {
        printf("send request failed!\r\n");
        goto do_cleanup;
    }
    printf("send request{%s} %ld to server done!\r\n", request, retval);

    retval = recv(sockfd, &response, sizeof(response), 0);
    if (retval <= 0)
    {
        printf("send response from server failed or done, %ld!\r\n", retval);
        goto do_cleanup;
    }
    response[retval] = '\0';
    printf("recv response{%s} %ld from server done!\r\n", response, retval);

do_cleanup:
    printf("do_cleanup...\r\n");
    close(sockfd);
}

/*
 * @description: 计算距离
 */
static void GetDistance(void)
{
    static unsigned long start_time = 0, continue_time = 0;
    float distance = 0.0;
    IotGpioValue value = IOT_GPIO_VALUE0;
    unsigned int flag = 0;

    IoTGpioSetOutputVal(Trig, IOT_GPIO_VALUE1); // 拉高Trig
    hi_udelay(20);                              // 20us
    IoTGpioSetOutputVal(Trig, IOT_GPIO_VALUE0); // 拉低Trig
    while (1)
    {
        IoTGpioGetInputVal(Echo, &value);

        ////测量回响信号(高电平)时间
        if (value == IOT_GPIO_VALUE1 && flag == 0)
        {
            start_time = hi_get_us();
            flag = 1;
        }
        if (value == IOT_GPIO_VALUE0 && flag == 1)
        {
            continue_time = hi_get_us() - start_time;
            start_time = 0;
            break;
        }
    }

    distance = continue_time * 0.034 / 2;
    printf("distance is %f\r\n", distance);
    if (distance < MIN_DISTANCE)
    {
        getDistanceCount++;
        // printf("distance is %f\r\n", distance);
    }
    if (getDistanceCount >= MIN_COUNT)
    {
        // 发送HTTP请求 + 清空COUNT
        getDistanceCount = 0;
        printf("=========Sensor has got a paper!!!!!\r\n");
        flashLED();
        sendDistanceRequest();
        printf("=========send distance request done!\r\n");
    }
}

/*
 * @description: 距离线程任务
 */
void DistanceTask(void *arg)
{
    (void)arg;

    // HC SR04初始化
    IoTGpioInit(Echo);
    IoTGpioInit(Trig);

    hi_io_set_func(Echo, HI_IO_FUNC_GPIO_0_GPIO);
    IoTGpioSetDir(Echo, IOT_GPIO_DIR_IN); // 输入

    hi_io_set_func(Trig, HI_IO_FUNC_GPIO_1_GPIO);

    IoTGpioSetDir(Trig, IOT_GPIO_DIR_OUT); // 输出

    // LED 初始化
    IoTGpioInit(LED_GPIO);
    hi_io_set_func(LED_GPIO, HI_IO_FUNC_GPIO_9_GPIO);
    IoTGpioSetDir(LED_GPIO, IOT_GPIO_DIR_OUT);

    while (1)
    {
        GetDistance();
        osDelay(100);
    }
}

// // 入口函数
// static void GpioEntry(void)
// {
//     // 定义线程属性
//     osThreadAttr_t attr;
//     // 线程属性设置：设置线程名称
//     attr.name = "GpioTask";
//     // 线程属性设置：设置线程栈大小
//     attr.stack_size = 4096;
//     // 线程属性设置：设置线程优先级
//     attr.priority = osPriorityNormal;

//     // 创建线程
//     if (osThreadNew(GpioTask, NULL, &attr) == NULL)
//     {
//         printf("[GpioDemo] Create GpioTask failed!\n");
//     }
// }

// // SYS_RUN(GpioEntry);