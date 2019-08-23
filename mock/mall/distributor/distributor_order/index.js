module.exports = {
    'get /yiqixuan_mall/api/distributor/orders': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    id: 1,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    order: {
                        amount: 100,
                        status: 300
                    },
                    order_no: 89757,
                    commission_amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11'
                },
                {
                    id: 2,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300434
                    },
                    order: {
                        amount: 200,
                        status: 305
                    },
                    order_no: 89757,
                    commission_amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11'
                },
                {
                    id: 3,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    order: {
                        amount: 100,
                        status: 405
                    },
                    order_no: 89757,
                    commission_amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11'
                },
                {
                    id: 4,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    order: {
                        amount: 100,
                        status: 500
                    },
                    order_no: 89757,
                    commission_amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11'
                },
                {
                    id: 5,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    order: {
                        amount: 100,
                        status: 505
                    },
                    order_no: 89757,
                    commission_amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11'
                }
            ]
            const pagination = {
                limit: 20,
                offset: 0,
                rows_found: 22
            }
            res.json({
                data: data,
                pagination: pagination
            })
        }, 500)
    },
}
