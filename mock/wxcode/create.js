module.exports = {
    'get /api_base/getCreateData': function(req, res, next) {
        setTimeout(() => {
            const Datalist = {
                data:{
                    name:'新码1',
                    roleType:1,
                    shareTitle:'来扫码喽',
                    description:'扫码有好礼！',
                    status:true,
                    phoneBg:'/images/platform/defaultPhoneBg.png'
                },
                choseWxList:[
                    {
                        key:1,
                        id:1,
                        nickname:'黑眼豆豆',
                        wxCode:'dsad42121',
                        remark:'随便写点',
                        account:'555555',
                        parment:'销售',
                    }
                ],
                pagination:{
                    limit:20,
                    offset:0,
                    rows_found:22
                }
            }
            res.json({
                data: Datalist,
            })
        }, 500)
    },
}
