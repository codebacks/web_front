import { Random } from 'mockjs'
import _ from 'lodash'

let orders = []

for( var i=0; i< 18; i++){
    orders.push({
        id: Random.guid(),
        shop: {
            type: Random.integer(2,3),
            name: Random.title()
        },
        no: Random.id(),
        buyer_username: Random.name(),
        receiver_name: Random.name(),
        paid_amount: Random.float(0, 10000),
        status: Random.integer(1, 7),
        data_from: Random.integer(1,2)
    })
}

const isOpen = false

const api = isOpen?'':'/none'



module.exports = {
    [`get ${api}/api_setting_wu/api/import_orders`]: function(req, res, next){

        var { type, limit, offset } = req.query

        var data = orders

        if(type){
            type = type - 0
            data = data.filter(item => item.shop.type === type)
        }

        setTimeout(()=> {
            res.json({
                meta: 200,
                data: _.take(_.drop(data, offset), limit),
                pagination: {
                    rows_found: data.length,
                    limit,
                    offset
                }
            })
        })
    },
    [`get ${api}/api_setting_wu/api/import_orders/*`]: function(req, res, next){

        const id = req.params['0']

        var model = _.find(orders, c=> c.id === id)
        if(model){
            model.created_at = Random.datetime()
            model.order_items = [{
                pic_url: Random.image(),
                title: Random.title(),
                num: Random.integer(0, 10),
                price: Random.float(10, 200),
                buyer_rated: Random.cparagraph()
            },{
                pic_url: Random.image(),
                title: Random.title(),
                num: Random.integer(0, 10),
                price: Random.float(10, 200),
                buyer_rated: Random.cparagraph()
            }]
        }

        setTimeout(()=> {
            res.json({
                meta: 200,
                data: model,
            })
        })
    }
}