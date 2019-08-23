
module.exports = {
    'get /api_mock/company/develop/show': function (req, res, next) {
        setTimeout(() => {
            const data = {
                app_key: '',
                app_secret: ''
            }
            res.json({
                meta: {
                    "code": 200,
                    "message": "成功"
                },
                data: data,
            })
        }, 500)
    },
    'post /api_mock/company/develop/setting': function (req, res, next) {
        setTimeout(() => {
            const data = {
                app_key: 'hz5c24ae02a11111',
                app_secret: '13a46af8bbdde52a0b95c1928f111111'
            }
            res.json({
                meta: {
                    "code": 200,
                    "message": "成功"
                },
                data: data,
            })
        }, 500)
    },
    'put /api_mock/company/develop/setting': function (req, res, next) {
        setTimeout(() => {
            const data = {
                app_key: 'hz5c24ae02a11111',
                app_secret: '13a46af8bbdde52a0b95c1928f111111'
            }
            res.json({
                meta: {
                    "code": 200,
                    "message": "成功"
                },
                data: data,
            })
        }, 500)
    },
}