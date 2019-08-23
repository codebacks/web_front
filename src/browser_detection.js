/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/30
 */
import UA from './utils/ua'
import config from 'config'

if(!config.disableBrowserDetection && !config.browserDetection && !(UA && UA.chrome && (Number(UA.chrome) >= 40))) {
    window.location.href = 'https://web-url.51zan.com?redirect_url=' + window.location.href
}