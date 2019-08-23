
module.exports = {
    'get /api_mock/points/order/export': function(req, res, next) {
        setTimeout(() => {
            res.json({
                data: {
                    url: 'https://document.51zan.com/2019-01-07-14-21-04-points.xls'
                },
                meta: {
                    code: 200,
                    message: ''
                }
            })
        }, 500)
    },
    'POST /api_mock/points/order/consignment': function(req, res, next) {
        setTimeout(() => {
            res.json({
                data: {
                    url: 'https://document.51zan.com/2019-01-07-14-21-04-points.xls'
                },
                meta: {
                    code: 200,
                    message: ''
                }
            })
        }, 500)
    },
    'GET /api_mock/points/goods': function(req, res, next) {
        setTimeout(() => {
            res.json({
                data: [
                    {
                        id: 0,
                        name: '奖品名称',
                        image_urls: '/2019/01/07/FkzBtsbTuQAoIFKrU8T6sn2vwfD1.png',
                        type: '1',
                        status: '1',
                        pirce: '10000',
                        consumed_points: '10000',
                        stock_count: '50',
                        sales_count: '20',
                        updated_at: '2019年1月7日16:04:15'
                    },
                    {
                        id: 1,
                        name: '奖品名称',
                        image_urls: '/2019/01/07/FkzBtsbTuQAoIFKrU8T6sn2vwfD1.png',
                        type: '1',
                        status: '2',
                        pirce: '10000',
                        consumed_points: '10000',
                        stock_count: '50',
                        sales_count: '20',
                        updated_at: '2019年1月7日16:04:15'
                    },
                    {
                        id: 2,
                        name: '奖品名称',
                        image_urls: '/2019/01/07/FkzBtsbTuQAoIFKrU8T6sn2vwfD1.png',
                        type: '1',
                        status: '1',
                        pirce: '10000',
                        consumed_points: '10000',
                        stock_count: '50',
                        sales_count: '20',
                        updated_at: '2019年1月7日16:04:15'
                    }
                ],
                pagination: {
                    rows_found: 1
                },
                meta: {
                    code: 200,
                    message: ''
                }
            })
        }, 500)
    },
}
