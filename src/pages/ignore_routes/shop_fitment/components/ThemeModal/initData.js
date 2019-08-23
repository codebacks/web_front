const data = [{
    "index": 1,
    "type": "Search",
    "name": "Search",
    "text": "搜索",
    "template": "search",
    "data": [{
        "label": "label",
        "type": "1_0",
        "data": [{
            "text": ""
        }]
    }],
    "isActive": true
}, {
    "index": 0,
    "type": "Default",
    "name": "Banner",
    "text": "轮播图",
    "template": "banner",
    "data": [{
        "label": "轮播图 1",
        "type": "0_0",
        "_data": [],
        "data": []
    }],
    "isActive": false
}, {
    "index": 10,
    "type": "CommodityCategories",
    "name": "Category",
    "text": "商品类目",
    "template": "category",
    "data": [],
    "isActive": false
}, {
    "index": 7,
    "type": "ImageText",
    "name": "ImageText",
    "text": "图文混排",
    "template": "photoText",
    "data": [{
        "label": "label",
        "type": "2_0",
        "_data": [],
        "data": [{
            "img_path": "",
            "textHead": "您的专属客服，24小时不打烊~",
            "text": "<<< 我是店主，可以随时咨询我哦"
        }]
    }],
    "isActive": false
}]

export default data


export let initProduct = [{
    "index": 10,
    "type": "CommodityCategories",
    "name": "ProductCross",
    "text": "商品类目",
    "template": "doubleTabColumn",
    "productType": "cross",
    "data": [{
        "label": "宝贝推荐",
        "type": "0_0",
        "data": []
    }],
    "isActive": false
}, {
    "index": 11,
    "type": "SingleLine",
    "name": "ActiveProduct",
    "productType": "direction",
    "active": "pingtuan",
    "text": "超值拼团",
    "template": "group",
    "data": [],
    "isActive": false
}, {
    "index": 12,
    "type": "SingleLine",
    "name": "ActiveProduct",
    "productType": "direction",
    "active": "tejia",
    "text": "精选特价",
    "template": "special",
    "data": [],
    "isActive": false
}, {
    "index": 13,
    "type": "DoubleColumn",
    "name": "ActiveProduct",
    "productType": "direction",
    "active": "tuijian",
    "text": "好物推荐",
    "template": "recommend",
    "data": [],
    "isActive": false
}]