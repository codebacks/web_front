
/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'get /api_demo/customer/member_levels': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    id: 1,
                    level: 1,
                    name: '新加会员',
                    min_count: 1,
                    min_amount: 10,
                    count: 1,
                    icon_url: '/2018/12/12/Fqab3_T_S95C04lKpqB7C-sbGxTE.jpg',
                    status: 1
                },
                {
                    id: 2,
                    level: 2,
                    name: '新加会员',
                    min_count: 2,
                    min_amount: 20,
                    count: 1,
                    icon_url: '/2018/12/12/Fqab3_T_S95C04lKpqB7C-sbGxTE.jpg',
                    status: 2
                },
                {
                    id: 3,
                    level: 3,
                    name: '新加会员',
                    min_count: 11,
                    min_amount: 100,
                    count: 1,
                    icon_url: '/2018/12/12/Fqab3_T_S95C04lKpqB7C-sbGxTE.jpg',
                    status: 1
                }
            ]
            res.json({
                data: data,
            })
        }, 500)
    },
    'get /api_demo/customer/member_levels/members': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    id: 1,
                    wx_id: 'wx_iddjhjdkssgshsssghkj',
                    name: '微信昵称',
                    last_updated_at: '2018年12月13日11:52:08',
                    last_order_at: '2018年12月13日11:52:08',
                    amount: 500,
                },
                {
                    id: 2,
                    wx_id: 'wx_iddjhjdkssgshsssghkj',
                    name: '微信昵称',
                    last_updated_at: '2018年12月13日11:52:08',
                    last_order_at: '2018年12月13日11:52:08',
                    amount: 500,
                },
                {
                    id: 3,
                    wx_id: 'wx_iddjhjdkssgshsssghkj',
                    name: '微信昵称',
                    last_updated_at: '2018年12月13日11:52:08',
                    last_order_at: '2018年12月13日11:52:08',
                    amount: 500,
                }
            ]
            res.json({
                data: data,
            })
        }, 500)
    },
    'get /api_detail/customer/member_levels/members': function (req, res, next) {
        setTimeout(() => {
            const data = {
                id: 1,
                level: 1,
                name: '新加会员',
                min_count: 1,
                min_amount: 10,
                count: 1,
                icon_url: '2018/12/12/Fqab3_T_S95C04lKpqB7C-sbGxTE.jpg',
                status: 1
            }
            res.json({
                data: data,
            })
        }, 500)
    },
    'get /api_demo/customer/member_levels/member_summaries': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    "id": 65,
                    "company_id": 71,
                    "user_id": 375,
                    "username": "蒋坚",
                    "bound_wechat_count": 10,
                    "level_count_json": '{"1":0,"2":0,"3":0,"4":0,"5":0}',
                    "created_at": "2019-04-29 11:26:01",
                    "updated_at": "2019-04-29 11:26:01",
                    "level_count_arr": {
                        "1": 10,
                        "2": 20,
                        "3": 30,
                        "4": 0,
                        "5": 0
                    }
                }
            ]
            res.json({
                data: data,
                pagination: {
                    limit: 10,
                    offset: 0,
                    rows_found: 1 
                }
            })
        }, 500)
    },
    'get /api_demo/customer/member_levels/userList': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    "id": 65,
                    "nickname": 'nickname1',
                    "company_id": 71,
                    "username": '测试名1',
                },
                {
                    "id": 66,
                    "nickname": 'nickname2',
                    "company_id": 71,
                    "username": '测试名2',
                }
            ]
            res.json({
                data: data,
            })
        }, 500)
    }
}
