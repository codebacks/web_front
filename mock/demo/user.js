import _ from 'lodash'

const item = {
    id: 'xxxx-',
    name: '罗龙',
    account: 'luolong',
    gender: 1,
    status: 1,
    dataCreated: '2018-08-06 18:20',
    phoneNumber: '15121168139'
}

var defaultData = []

for(var i = 0; i <= 28; i++){
    defaultData.push({
        ...item,
        id: item.id + i,
        name: item.name + i,
        gender: i %2 === 0 ? 1: 2 
    })
}

module.exports = {
    'get /api_demo/user/*': function (req, res, next) {

        const id = req.params['0']

        var index = defaultData.findIndex(c => c.id === id)
        
        if( index > -1 ){
            var data = defaultData[index]
            
            res.json({
                data: data
            })
        }else {
            res.json({
                id
            })
        }
    },
    'get /api_demo/user': function (req, res, next) {
        setTimeout(() => {

            const { query  } = req
            
            var data = defaultData

            const { status, name, gender,limit, offset } = query
            if(name) {
                data = data.filter(c => c.name.indexOf(name) > -1)
            }
            if(status){
                data = data.filter(c => c.status === status -0 )
            }

            if(gender){
                data = data.filter(c => c.gender === gender - 0 )
            }
  

            res.json({
                meta: 200,
                data: _.take(_.drop(data, offset), limit),
                pagination: {
                    rows_found: data.length,
                    limit,
                    offset
                }
            })
        }, 500)
    },
    'post /api_demo/user': function (req, res, next) {
        setTimeout(() => {

            var data = defaultData

            const { body } = req     
            
            var user = body
            user.dataCreated = new Date()

            data.push(user)

            res.json({
                
            })
        }, 500)
    },
    'put /api_demo/user/*': function (req, res, next) {
    
        const { body } = req 
        var user = body

        var data = defaultData

        var index = data.findIndex(c => c.id === user.id)

        if(index > -1){
            var newUser = {...data[index], ...user}
            data[index] = newUser
        }
        
        res.json({

        })
    },
    'DELETE /api_demo/user/*': function(req, res, next){
        const id = req.params['0']

        var index = defaultData.findIndex(c => c.id === id)
        
        if( index > -1 ){
            defaultData.splice(index,1)

            res.json({

            })
        }else {
            res.json({
                id
            })
        }
    }
}