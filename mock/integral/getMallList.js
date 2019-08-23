
module.exports = {
    'get /api_mock/points/shop': function(req, res, next) {
        const data = [
            {
                'id': 1,
                'app_id': 'wx_id454545454dsdgg',
                'name': '名称',
                'operator': '操作者',
                'created_at': '2019年1月8日15:21:45',
            },
            {
                'id': 2,
                'app_id': 'wx_id454545454dsdgg',
                'name': '名称',
                'operator': '操作者',
                'created_at': '2019年1月8日15:21:45',
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
    'get /api_mock/points/shop/id': function(req, res, next) {
        const data = [
            {
                'id': 1,
                'app_id': 'wx_id454545454dsdgg',
                'name': '名称',
                'operator': '操作者',
                'created_at': '2019年1月8日15:21:45',
                'title': '标题',
                'head_image_url': '/2019/01/14/Fn5nvKhWT7XBuUzu75ZLRespqP3C.jpg',
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
    'get /api_mock/points/goods/id': function(req, res, next) {
        const data = [
            {
                'id': 1,
                'name': '奖品名称',
                'type': '1',
                'status': '1',
                'pirce': '1000',
                'consumed_points': '20000',
                'stock_count': '200',
                'sales_count': '20',
                'updated_at': '2019年1月15日11:49:01',
                'app_id': 'wx_id4555dhfhs445',
                'description': '描述',
                'image_urls': '/2019/01/14/Fn5nvKhWT7XBuUzu75ZLRespqP3C.jpg',
            }
        ]
        setTimeout(() => {
            res.json({
                data: data
            })
        }, 500)
    },
}
