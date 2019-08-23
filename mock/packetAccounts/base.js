/**
 **@Description:
 **@author: zhousong
 */

module.exports = {
    'get false/api_data_sh/api/settlements': function(req, res, next) {
        setTimeout(() => {
            const data = {
                data: [
                    {
                        begin_at: '2018-9-17',
                        amount: '2892',
                        total_count: 333,
                        mch_no: '周松'
                    },
                    {
                        begin_at: '2018-9-17',
                        amount: '2892',
                        total_count: 222,
                        mch_no: '孙立志'
                    },
                    {
                        begin_at: '2018-9-17',
                        amount: '2892',
                        total_count: 111,
                        mch_no: '吴明'
                    }
                ],
                pagination: {
                    rows_found: 3
                }
            }
            res.json({
                data: data
            })
        }, 1000)
    }
}