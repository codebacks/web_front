import Mock, { Random } from 'mockjs'
import moment from 'moment'


module.exports = {
    'get /api_home/api/packets/statistics': function(req, res, next) {

        const date = moment().subtract(1, 'days').toDate()

        const data = [6,5,4,3,2,1,0].map(num => {
            const begin_at  = moment(date).subtract(num, 'days').format('YYYY-MM-DD 00:00:00')
            const end_at    = moment(date).subtract(num, 'days').format('YYYY-MM-DD 23:59:59')
            const total_count = Random.integer(25, 1000)
            const total_amount    = Random.integer(100, 10000)
            const success_count   = Random.integer(0, total_count)
            const success_amount  = Random.integer(50, total_amount)
            const fail_count = Random.integer(0, 10)
            const fail_amount = Random.integer(0, 80)
            const unreceived_count = total_count - success_count -fail_count
            const unreceived_amount = total_amount - success_amount - fail_amount

            return {
                begin_at,
                end_at,
                total_count,
                total_amount,
                success_count,
                success_amount,
                fail_count,
                fail_amount,
                unreceived_count,
                unreceived_amount
            }
        })

   

        setTimeout(() => {
            res.json({
                data: data,
            })
        }, 500)
    },
}
