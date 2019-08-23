
module.exports = {
    'get /getTrendComment': function(req, res, next) {
        const data = [
            {
                id: 1,
                nick_name: '测试名',
                user: {
                    mobile: '1588554544555',
                },
                created_at: '2018-05-07 12:52:22',
                content: '这是一个测试',
                status: 1,
                reply: {
                    content: '这是一个回复',
                    created_at: '2018-05-07 12:52:22',
                }
            },
            {
                id: 2,
                nick_name: '测试名',
                user: {
                    mobile: '1588554544555',
                },
                created_at: '2018-05-07 12:52:22',
                content: '这是一个测试',
                status: 2,
            },
            {
                id: 3,
                nick_name: '测试名',
                user: {
                    mobile: '1588554544555',
                },
                created_at: '2018-05-07 12:52:22',
                content: '这是一个测试',
                status: 3,
            },
            {
                id: 4,
                nick_name: '测试名',
                user: {
                    mobile: '1588554544555',
                },
                created_at: '2018-05-07 12:52:22',
                content: '这是一个测试',
                status: 2,
            }
        ]
        setTimeout(() => {
            res.json({
                data: data,
            })
        }, 500)
    },
}
