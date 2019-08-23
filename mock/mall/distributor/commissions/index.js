module.exports = {
    'get /yiqixuan_mall/api/distributor/withdrawals': function (req, res, next) {
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
                    status: 1,
                    withdraw_no: 89757,
                    amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11',
                    remark: 'shibai'
                },
                {
                    id: 2,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    status: 2,
                    withdraw_no: 89757,
                    amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11',
                    audited_at: '2018-11-12 11:11:11',
                    remark: 'shibainaichenggongzhimu'
                },
                {
                    id: 3,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    status: 3,
                    withdraw_no: 89757,
                    amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11',
                    audited_at: '2018-11-12 11:11:11',
                    remark: 'shibainaichenggongzhimu'
                },
                {
                    id: 4,
                    user_wechat: {
                        nick_name: 'Jack'
                    },
                    user: {
                        mobile: 15757300433
                    },
                    status: 4,
                    withdraw_no: 89757,
                    amount: 100,
                    begin_at: '2018-11-11 11:11:11',
                    end_at: '2018-11-12 11:11:11',
                    audited_at: '2018-11-12 11:11:11',
                    remark: 'shibainaichenggongzhimu'
                },
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
