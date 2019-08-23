/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/26
 */

const Raven = window.Raven

if(Raven){
    if(HUZAN_ENV === 'production_test'){
        Raven.config('https://f0659870f0554b6695323b0cd6797ade@sentry.51zan.cn/33').install()
    }

    if(HUZAN_ENV === 'production_master'){
        Raven.config('https://4f686be9b25d4622ae0f6193f586403f@sentry.51zan.cn/34').install()
    }
}