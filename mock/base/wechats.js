// module.exports = {
//     'get /api_base/api/wechats/all': function (req, res, next) {
//         setTimeout(() => {
//             const data = [
//                 {
//                     "alias": "2222",
//                     "head_img_url": "/storage/emulated/0/cn.zan.icloud/0",
//                     "id": 1,
//                     "nickname": "\u8fbe\u4eba",
//                     "remark": "总得写个备注放在这里不然不好",
//                     "uin": "377086684",
//                     "user": {
//                         "departments": [{
//                             "id": 16,
//                             "name": "43534543"
//                         }, {"id": 17,
//                             "name": "wahahh"
//                         }, {
//                             "id": 8,
//                             "name": "leoTc"
//                         }, {"id": 7,
//                             "name": "leo1"
//                         }],
//                         "id": 11,
//                         "nickname": "\u7ba1\u7406\u5458"
//                     }
//                 },
//                 {
//                     "alias": "333",
//                     "head_img_url": "/storage/emulated/0/cn.zan.icloud/0",
//                     "id": 111,
//                     "nickname": "总得起个昵称",
//                     "remark": "总得写个备注放在这里不然不好看总得写个备注放在这里不然不好看总得写个备注放在这里不然不好看总得写个备注放在这里不然不好看",
//                     "uin": "177086684",
//                     "user": {
//                         "departments": [{
//                             "id": 23,
//                             "name": "sd"
//                         }],
//                         "id": 14,
//                         "nickname": "\u7ba1\u7406\u5458"
//                     }
//                 },
//                 {
//                     "alias": "hello world",
//                     "head_img_url": "/storage/emulated/0/cn.zan.icloud/0",
//                     "id": 112,
//                     "nickname": "微信昵称aaa",
//                     "remark": "",
//                     "uin": "117086684",
//                     "user": {
//                         "departments": [{
//                             "id": 23,
//                             "name": "sd"
//                         }],
//                         "id": 14,
//                         "nickname": "\u7ba1\u7406\u5458"
//                     }
//                 },
//                 {
//                     "alias": "test",
//                     "head_img_url": "/storage/emulated/0/cn.zan.icloud/0",
//                     "id": 113,
//                     "nickname": "test昵称",
//                     "remark": "",
//                     "uin": "111086684",
//                     "user": {
//                         "departments": [{
//                             "id": 23,
//                             "name": "sd"
//                         }],
//                         "id": 14,
//                         "nickname": "\u7ba1\u7406\u5458"
//                     }
//                 },
//                 {
//                     "alias": "test2",
//                     "head_img_url": "/storage/emulated/0/cn.zan.icloud/0",
//                     "id": 114,
//                     "nickname": "test2昵称",
//                     "remark": "testtesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttesttest",
//                     "uin": "111186684",
//                     "user": {
//                         "departments": [{
//                             "id": 23,
//                             "name": "sd"
//                         }],
//                         "id": 14,
//                         "nickname": "\u7ba1\u7406\u5458"
//                     }
//                 },
//             ]
//             res.json({
//                 data: data,
//             })
//         }, 500)
//     },
// }