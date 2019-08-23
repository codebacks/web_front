module.exports = {
    'get /yiqixuan_mall/api/distributor/info': function (req, res, next) {
        setTimeout(() => {
            const data = {
                distributor_count: 100,
                yesterday_distributor_count: 1,
                order_count: 200,
                yesterday_order_count: 2,
                promote_count: 300,
                yesterday_promote_count: 3,
                commission_amount: 400,
                yesterday_commission_amount: 4,
                un_audit_amount: 500,
                un_audit_count: 5,
                conditions: {
                    type: 2,
                    value: 100
                },
                commission_rate: 100,
                settlement_type: 1,
                audit_type: 2,
                recruitment_plan: '1234',
                created_at: '2018-11-11 11:11:11',
                // created_at: null,
                status: 1,
            }
            res.json({
                data: data,
            })
        }, 500)
    },
    'POST /yiqixuan_mall/api/distributor/info': function (req, res, next) {
        setTimeout(() => {
            const data = {
                data: {
                    commission_rate: -8659309,
                    settlement_type: "ullamco minim",
                    audit_type: "cillum quis reprehenderit eu",
                    recruitment_plan: "ipsum"
                },
                meta: {
                    "code": 28350571,
                    "message": "Duis ex nulla"
                }
            }

            res.json({
                data: data,
            })
        }, 500)
    },
    'PUT /yiqixuan_mall/api/distributor/info': function (req, res, next) {
        setTimeout(() => {
            const data = {
                distributor_count: 100,
                yesterday_distributor_count: 1,
                order_count: 200,
                yesterday_order_count: 2,
                promote_count: 300,
                yesterday_promote_count: 3,
                commission_amount: 400,
                yesterday_commission_amount: 4,
                un_audit_amount: 500,
                un_audit_count: 5,
                created_at: '2018-11-11 11:11:11',
                // created_at: null,
                status: 1,
                // status: 2
            }
            res.json({
                data: data,
            })
        }, 500)
    }
}
