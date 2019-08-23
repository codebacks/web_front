

module.exports = {
    'get /api_mock/wx_mps/fans/stats/': function(req, res, next) {
        const data = 
        {
            fans_count: '100',
            relate_friend_count: '200',
            no_relate_friend_count: '300'
        }
        setTimeout(() => {
            res.json({
                data: data,
            })
        }, 500)
    },
    'get /api_mock/wx_mps/fans/': function(req, res, next) {
        const data = [
            {
                id: 1,
                profile: '/2019/01/15/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg',
                fans_nickname: '昵称',
                gender: '男',
                area: '上海',
                is_relate: '是',
                fans_wechat: 'wx_iddfgd455454545',
                belongs_wechat: 'wx_iddfgd4fgg45',
            },
            {
                id: 2,
                profile: '/2019/01/15/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg',
                fans_nickname: '昵称',
                gender: '男',
                area: '上海',
                is_relate: '是',
                fans_wechat: 'wx_iddfgd455454545',
                belongs_wechat: 'wx_iddfgd4fgg45',
            },
            {
                id: 3,
                profile: '/2019/01/15/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg',
                fans_nickname: '昵称',
                gender: '男',
                area: '上海',
                is_relate: '是',
                fans_wechat: 'wx_iddfgd455454545',
                belongs_wechat: 'wx_iddfgd4fgg45',
            },
            {
                id: 4,
                profile: '/2019/01/15/Fh2Nbvs2qr4rLczlXmIvGV4PtWle.jpg',
                fans_nickname: '昵称',
                gender: '男',
                area: '上海',
                is_relate: '是',
                fans_wechat: 'wx_iddfgd455454545',
                belongs_wechat: 'wx_iddfgd4fgg45',
            }
        ]
        setTimeout(() => {
            res.json({
                data: data,
                pagination: {
                    rows_found: 100,
                    offset: 100,
                    limit: 100,
                }
            })
        }, 500)
    },
}
