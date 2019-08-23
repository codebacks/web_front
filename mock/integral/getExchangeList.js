
module.exports = {
    'get /api_mock/points/order': function(req, res, next) {
        const data = [
            {
                'id': 1,
                'no': 11111111111,
                'created_at': '2019年1月7日13:44:36',
                'wx_nickname': '微信昵称',
                'wx_id': 'wx_id4154545',
                'goods_name': '名称',
                'goods_count': '1',
                'type': 1,
                'status': 1,
                'consumed_points': 1000,
                'consigned_at': '2019年1月7日13:44:36',
                'confirmed_at': '2019年1月7日13:44:36',
                'receiver_name': '收货人',
                'receiver_mobile': '15865968896',
                'province': '上海',
                'city': '上海',
                'address_detail': '上海',
                'carrier': '顺丰',
                'carrier_tracking_no': 'NO5455555555555555555',
                'receiver_wx_id': 'NO5455555555555555555',
            },
            {
                'id': 2,
                'no': 11111111111,
                'created_at': '2019年1月7日13:44:36',
                'wx_nickname': '微信昵称',
                'wx_id': 'wx_id4154545',
                'goods_name': '名称',
                'goods_count': '1',
                'type': 2,
                'status': 2,
                'consumed_points': 1000,
                'consigned_at': '2019年1月7日13:44:36',
                'confirmed_at': '2019年1月7日13:44:36',
                'receiver_name': '收货人',
                'receiver_mobile': '15865968896',
                'province': '上海',
                'city': '上海',
                'address_detail': '上海',
                'carrier': '顺丰',
                'carrier_tracking_no': 'NO5455555555555555555',
                'receiver_wx_id': 'NO5455555555555555555',
            },
            {
                'id': 3,
                'no': 11111111111,
                'created_at': '2019年1月7日13:44:36',
                'wx_nickname': '微信昵称',
                'wx_id': 'wx_id4154545',
                'goods_name': '名称',
                'goods_count': '1',
                'type': 3,
                'status': 3,
                'consumed_points': 1000,
                'consigned_at': '2019年1月7日13:44:36',
                'confirmed_at': '2019年1月7日13:44:36',
                'receiver_name': '收货人',
                'receiver_mobile': '15865968896',
                'province': '上海',
                'city': '上海',
                'address_detail': '上海',
                'carrier': '顺丰',
                'carrier_tracking_no': 'NO5455555555555555555',
                'receiver_wx_id': 'NO5455555555555555555',
            }
        ]
        setTimeout(() => {
            res.json({
                data: data,
                pagination: {
                    rows_found: 1
                }
            })
        }, 500)
    },
}
