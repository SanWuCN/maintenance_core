# SW.ART CORE 清灰预约小程序

校园电脑清灰与维护预约小程序，包含清灰服务选择、预约时间、设备型号、宿舍楼信息和确认预约流程。

## 结构

- `pages/`：微信小程序页面
- `utils/api.js`：后端与云端静态资源地址
- `backend/`：Python 后端与 systemd 服务配置

## 当前部署

- API：`https://appruya.top:40208/swart-api`
- 静态资源：`https://appruya.top:40208/swart-assets`

服务器已配置 Nginx 监听 `40208`，需要在阿里云安全组放行 `40208/TCP` 后才能从公网访问。
