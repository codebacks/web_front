
module.exports = {
    'get /api_setting/api/wx_merchants': function (req, res, next) {
        setTimeout(() => {
            const data = [
                [
                    {
                        "id": 1,
                        "company_id": 1,
                        "pay_conf_id": 19,
                        "created_at": "2018-08-09 17:28:25",
                        "updated_at": "2018-08-09 17:28:25",
                        "deleted_at": null,
                        "used_info": "3小程序",
                        "merchant_key": "",
                        "update_time": "1970-01-01 08:00:00"
                    },
                    {
                        "id": 2,
                        "company_id": 1,
                        "pay_conf_id": 20,
                        "created_at": "2018-08-10 14:30:16",
                        "updated_at": "2018-08-10 14:30:16",
                        "deleted_at": null,
                        "used_info": "",
                        "merchant_key": "1",
                        "update_time": "2018-08-10 14:30:15"
                    },
                    {
                        "id": 3,
                        "company_id": 1,
                        "pay_conf_id": 21,
                        "created_at": "2018-08-10 14:31:09",
                        "updated_at": "2018-08-10 14:31:09",
                        "deleted_at": null,
                        "used_info": "6",
                        "merchant_key": "1",
                        "update_time": "2018-08-10 14:31:08"
                    },
                    {
                        "id": 4,
                        "company_id": 1,
                        "pay_conf_id": 22,
                        "created_at": "2018-08-14 10:01:02",
                        "updated_at": "2018-08-14 10:01:02",
                        "deleted_at": null,
                        "used_info": "",
                        "merchant_key": "1",
                        "update_time": "2018-08-14 10:01:02"
                    },
                ]
            ]

            res.json({
                data: data,
            })
        }, 500)
    },
    'POST /api_setting/api/wx_merchants': function (req, res, next) {
        setTimeout(() => {
            const data = {
                "data": {
                    "id": -8659309,
                    "used_info": "ullamco minim",
                    "merchant_key": "cillum quis reprehenderit eu",
                    "update_time": "ipsum"
                },
                "meta": {
                    "code": 28350571,
                    "message": "Duis ex nulla"
                }
            }

            res.json({
                data: data,
            })
        }, 500)
    },
    'GET /api_setting/api/upload': function (req, res, next) {
        setTimeout(() => {
            const data = {
                "meta":
                {
                    "code": "null"
                },
                "data": {
                    "bucket": "enim est qui ut anim",
                    "prefix": "in sunt sed incididunt",
                    "token": "hxLChuZ00lgpuuN_Q5ogIj6-8ZehSQq7UbXLjd_Y:ennra4iI5bdKl6JKzxAHGi_F0qY=:eyJpbnNlcnRPbmx5IjoxLCJpc1ByZWZpeGFsU2NvcGUiOjEsImRldGVjdE1pbWUiOjEsInJldHVybkJvZHkiOiJ7XCJidWNrZXRcIjpcIiQoYnVja2V0KVwiLFwia2V5XCI6XCIkKGtleSlcIixcImhhc2hcIjpcIiQoZXRhZylcIixcInNpemVcIjokKGZzaXplKX0iLCJzYXZlS2V5IjoiMjAxOFwvMDhcLzIxXC8kKGV0YWcpJChleHQpIiwiZnNpemVNaW4iOjMyLCJmc2l6ZUxpbWl0IjoxMDczNzQxODI0LCJzY29wZSI6ImRvY3VtZW50IiwiZGVhZGxpbmUiOjE1MzQ4NzMzMTV9"
                }
            }


            res.json({
                data: data,
            })
        }, 500)
    }
}