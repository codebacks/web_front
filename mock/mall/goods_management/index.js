/**
 **@Description:
 **@author: zhousong
 */

module.exports = {
    'get false/yiqixuan_mall_init/management/shop_categories': function(req, res, next) {
        setTimeout(() => {
            const data = {
                list: [
                    {
                        id: 1,
                        name: '吧啦啦啦啦',
                        platform_category_id: 22,
                        parent_id: 0,
                        children: [
                            {
                                id: 234,
                                name: '二级分类',
                                parent_id: 1,
                            },
                            {
                                id: 223,
                                name: '衣服',
                                parent_id: 1,
                            }
                        ]
                    },
                    {
                        id: 2,
                        name: '啦啦啦啦啦啦啦啦啦啦啦',
                        platform_category_id: 33,
                        parent_id: 0,
                        children: [
                            {
                                id: 32,
                                name: 'Anti Mage',
                                parent_id: 2,
                            }
                        ]
                    }
                ],
                total: 54546
            }
            res.json({
                data: data
            })
        }, 1000)
    }
}