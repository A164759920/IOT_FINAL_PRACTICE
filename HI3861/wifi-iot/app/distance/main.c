#include <errno.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include <stdlib.h>
#include "net_demo.h"
#include "net_common.h"
#include "net_params.h"
#include "wifi_connecter.h"
#include "thread.h"

#include "iot_gpio.h"
#include "hi_io.h"

#include "ohos_init.h" // 用于初始化服务(services)和功能(features)
#include "cmsis_os2.h" // CMSIS-RTOS API V2

#include "distance.h"

#define STACK_SIZE (10240)
#define DELAY_TICKS_10 (10)
#define DELAY_TICKS_100 (100)

static void mainTask(void)
{
    // AP部分
    STATIC WifiDeviceConfig config = {0};
    // strcpy(config.preSharedKey, PARAM_HOTSPOT_PSK);
    strcpy_s(config.ssid, WIFI_MAX_SSID_LEN, PARAM_HOTSPOT_SSID);
    strcpy_s(config.preSharedKey, WIFI_MAX_KEY_LEN, PARAM_HOTSPOT_PSK);
    config.securityType = PARAM_HOTSPOT_TYPE;
    int netId = ConnectToHotspot(&config);
    osDelay(DELAY_TICKS_10);

    osThreadId_t http_id = newThread("MAIN_TASK", (osThreadFunc_t)DistanceTask, 0, osPriorityNormal, 1024 * 100);

    if (http_id == NULL)
    {
        printf("==============[TIP HTTP TEST FAILED]\n");
    }
}

SYS_RUN(mainTask);