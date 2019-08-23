/**
 **@Description:
 **@author: 罗龙
 */
import Mock, { Random } from 'mockjs'

const isOpen = false
const api = isOpen?'':'/none'

module.exports = {
    [`get ${api}/api_home_wx/api/stats/friend`]: function(req, res, next) {

        var result = {
            "data": [{
                "day": 20180823,
                "friend_count": 0,
                "new_friend_count": 0,
                "receive_count": 0,
                "send_count": 0
            }, {
                "day": 20180824,
                "friend_count": 0,
                "new_friend_count": 0,
                "receive_count": 0,
                "send_count": 0
            }, {
                "day": 20180825,
                "friend_count": 0,
                "new_friend_count": 0,
                "receive_count": 0,
                "send_count": 0
            }, {
                "day": 20180826,
                "friend_count": 0,
                "new_friend_count": 0,
                "receive_count": 0,
                "send_count": 0
            }, {
                "day": 20180827,
                "friend_count": 25,
                "new_friend_count": 25,
                "receive_count": 1,
                "send_count": 2
            }, {
                "day": 20180828,
                "friend_count": 37,
                "new_friend_count": 12,
                "receive_count": 160,
                "send_count": 157
            }, {
                "day": 20180829,
                "friend_count": 42,
                "new_friend_count": 5,
                "receive_count": 477,
                "send_count": 351
            }],
            "meta": {
                "code": 200,
                "message": ""
            }
        }

        setTimeout(() => {
            res.json(result)
        }, 500)
    },
}
