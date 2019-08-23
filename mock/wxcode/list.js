/**
 **@Description:
 **@author: leo
 */

module.exports = {
    'get /api_base/getlist': function(req, res, next) {
        setTimeout(() => {
            const Datalist ={
                data:[
                    {	
                        key:1,
                        editTime: '2015/05/07 22:33:44',
                        name: '测试',
                        createUser: '大撒旦撒',
                        wxNum:'22',
                        status:0,
                        showNum:'55',
                        addNum:'88',
                        id:1
                    },
                    {	
                        key:2,
                        editTime: '2015/05/07 22:33:44',
                        name: '测试',
                        createUser: '大撒旦撒',
                        wxNum:'22',
                        status:1,
                        showNum:'55',
                        addNum:'88',
                        id:2
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
