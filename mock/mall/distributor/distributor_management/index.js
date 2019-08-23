const data = [
    {
        id: 1,
        user_wechat: {
            nick_name: 'Jack'
        },
        user: {
            mobile: 15757300433
        },
        promote_count: 1,
        commission_amount: 100,
        un_settlement_amount: 200,
        withdrawing_amount: 300,
        begin_at: '2018-11-11 11:11:11',
        end_at: '2018-11-12 11:11:11',
        remark: '郭芙'
    },
    {
        id: 2,
        user_wechat: {
            nick_name: 'Rose'
        },
        user: {
            mobile: 15757300434
        },
        promote_count: 2,
        commission_amount: 200,
        un_settlement_amount: 300,
        withdrawing_amount: 400,
        begin_at: '2018-11-11 11:11:11',
        end_at: '2018-11-12 11:11:11',
        remark: '郭襄'
    },
    {
        id: 3,
        user_wechat: {
            nick_name: 'Rose'
        },
        user: {
            mobile: 15757300434
        },
        promote_count: 2,
        commission_amount: 200,
        un_settlement_amount: 300,
        withdrawing_amount: 400,
        begin_at: '2018-11-11 11:11:11',
        end_at: '2018-11-12 11:11:11',
        remark: '郭襄'
    }
]

var defaultData = []

for (var i = 0; i <= 28; i++) {
    defaultData.push({
        ...data,
        id: data.id + i,
    })
}


module.exports = {
    'get /yiqixuan_mall/api/distributor/distributors': function (req, res, next) {
        setTimeout(() => {
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
    'PUT /yiqixuan_mall/api/distributor/distributors/{disstributor_id}': function (req, res, next) {
        setTimeout(() => {

            // const { body } = req
            // var disstributor_id = body

            // var data = defaultData

            // var index = data.findIndex(c => c.id === disstributor_id.id)

            // if (index > -1) {
            //     var newRemark = { ...data[index], ...disstributor_id }
            //     data[index] = newRemark
            // }

            // res.json({

            // })
        }, 500)
    }
}
