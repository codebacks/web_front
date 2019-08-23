/*
 * @Author: sunlzhi 
 * @Date: 2018-08-16 14:11:00 
 * @Last Modified by: sunlzhi
 * @Last Modified time: 2018-08-21 14:20:14
 */

module.exports = {
    'get /api_setting/api/wx_mps': function(req, res, next) {
        setTimeout(() => {
            const data =  [
                {
                    "id": 1,
                    "app_id": "11",
                    "principal_name": "上海虎赞科技有限公司",
                    "auth_at": "2018-01-02 11:09:55",
                    "name": "隔壁阿姨",
                    "pay_conf_id": 1,
                    "status": 1,
                    "has_auth": 1,
                    "has_pay_conf": 1,
                    "has_wx_pay": 1,
                    "pay_conf_id": 1,
                },{
                    "id": 2,
                    "app_id": "21",
                    "principal_name": "上海虎赞科技有限公司",
                    "auth_at": "2018-01-02 11:09:55",
                    "name": "隔壁阿姨",
                    "status": 1,
                    "has_auth": 2,
                    "has_pay_conf": 2,
                    "has_wx_pay": 2,
                    "pay_conf_id": 2,
                },{
                    "id": 3,
                    "app_id": "31",
                    "principal_name": "上海虎赞科技有限公司",
                    "auth_at": "2018-01-02 11:09:55",
                    "name": "隔壁阿姨",
                    "status": 2,
                    "has_auth": 2,
                    "has_pay_conf": 2,
                    "has_wx_pay": 2,
                    "pay_conf_id": 3,
                },{
                    "id": 4,
                    "app_id": "41",
                    "principal_name": "上海虎赞科技有限公司",
                    "auth_at": "2018-01-02 11:09:55",
                    "name": "隔壁阿姨",
                    "pay_conf_id": 3,
                    "status": 1,
                    "has_auth": 1,
                    "has_pay_conf": 2,
                    "has_wx_pay": 2,
                    "pay_conf_id": 4,
                }
            ]
            const meta = {
                "code": 200,
                "message": "sub"
            }
            res.json({
                data: data,
                meta: meta
            })
        }, 300)
    },
    'get /api_setting/api/wx_mps/1': function(req, res, next) {
        setTimeout(() => {
            const data = {
                "app_id": "11",
                "principalName": "上海虎赞科技有限公司",
                "nickName": "隔壁阿姨",
                "txtPath": '2018/08/17/FlOyFUGDSLzQOGxIFftwx207Pb8g.txt'
            }
            const meta = {
                "code": 200,
                "message": "addSubConfigure"
            }
            res.json({
                data: data,
                meta: meta
            })
        }, 200)
    },'get /api_setting/api/wechat_asset/paies': function(req, res, next) {
        setTimeout(() => {
            const data =  [
                {
                    "id": 1,
                    "pay_conf_id": 1,
                    "used_info": "公",
                    "merchant_key": "3246321322455455555555346",
                    "update_time": "2018-01-02 11:09:55",
                },
                {
                    "id": 2,
                    "pay_conf_id": 2,
                    "used_info": "公众",
                    "merchant_key": "324632132232222222222246",
                    "update_time": "2018-01-02 11:09:55",
                },
                {
                    "id": 3,
                    "pay_conf_id": 3,
                    "used_info": "公众号",
                    "merchant_key": "第三家商店",
                    "update_time": "2018-01-02 11:09:55",
                },
                {
                    "id": 4,
                    "pay_conf_id": 4,
                    "used_info": "公众号/小",
                    "merchant_key": "3246321322346",
                    "update_time": "2018-01-02 11:09:55",
                },
                {
                    "id": 5,
                    "pay_conf_id": 5,
                    "used_info": "公众号/小程序",
                    "merchant_key": "3246321322342323232323236",
                    "update_time": "2018-01-02 11:09:55",
                },
            ]
            const meta = {
                "code": 200,
                "message": "pay"
            }
            res.json({
                data: data,
                meta: meta
            })
        }, 300)
    },
}