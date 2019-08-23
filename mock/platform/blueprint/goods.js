module.exports = {
    'get /api/distributor/goods': function (req, res, next) {
        setTimeout(() => {
            const data = [
                {
                    id: 1,
                    name: '好丽',
                    price: 2,
                    status: 1,
                    platform: 100011
                },
                {
                    id: 2,
                    name: '好丽',
                    price: 2,
                    status: 2,
                    platform: 222220001
                }
            ]
            const pagination = {
                limit: 10,
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
