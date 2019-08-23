const editData = [
    {
        subtype:'1',
        pageTitle: '订单支付成功通知',
        templateTitle: '订单支付成功通知',
        triggerCondition: '用户付款后进行消息推送',
        notice: '订单支付成功通知',
        inner: [{
            column: '用户名',
            value: '[购物账号]'
        }, {
            column: '订单号',
            value: '[订单号]'
        }, {
            column: '订单金额',
            value: '[订单金额]'
        }, {
            column: '商品信息',
            value: '[商品信息]'
        }],
        defaultTitle: '您的订单已支付成功',
        defaultRemark: '如有问题请随时联系客服，客服人员将第一时间为您服务',
    },
    {
        subtype:'2',
        pageTitle: '订单发货通知',
        templateTitle: '订单发货通知',
        triggerCondition: '订单发货后进行消息推送',
        notice: '订单发货通知',
        inner: [{
            column: '订单编号',
            value: '[订单号]'
        }, {
            column: '发货时间',
            value: '[发货时间]'
        }, {
            column: '物流公司',
            value: '[物流公司]'
        }, {
            column: '快递单号',
            value: '[快递单号]'
        }, {
            column: '收件信息',
            value: '[收件人][收件人手机][收件人地址]'
        }],
        defaultTitle: '您的订单已经发货啦，宝贝正快马加鞭向您飞奔而去',
        defaultRemark: '如有问题请随时联系客服，客服人员将第一时间为您服务',
    },
    {
        subtype:'3',
        pageTitle: '订单配送通知',
        templateTitle: '包裹物流通知',
        triggerCondition: '订单开始配送后进行消息推送',
        notice: '包裹物流通知',
        inner: [{
            column: '物流公司',
            value: '[物流公司]'
        }, {
            column: '运单号',
            value: '[快递单号]'
        }, {
            column: '更新时间',
            value: '[配送时间]'
        }, {
            column: '最新轨迹',
            value: '[配送信息]'
        }],
        defaultTitle: '您的包裹即将送达，请保持手机通畅，注意签收哦',
        defaultRemark: '如有问题请随时联系客服，客服人员将第一时间为您服务',
    },
    {
        subtype:'4',
        pageTitle: '订单签收通知',
        templateTitle: '订单签收通知',
        triggerCondition: '订单签收后进行消息推送',
        notice: '订单签收通知',
        inner: [{
            column: '订单编号',
            value: '[订单号]'
        }, {
            column: '签收时间',
            value: '[签收时间]'
        }],
        defaultTitle: '您的订单已签收，感谢您的信任与支持',
        defaultRemark: '如有问题请随时联系客服，客服人员将第一时间为您服务',
    },
    {
        subtype:'5',
        pageTitle: '购买评价提醒',
        templateTitle: '购买评价提醒',
        triggerCondition: '订单完成后进行消息推送',
        notice: '购买评价提醒',
        inner: [{
            column: '购买渠道',
            value: '[店铺名]'
        }, {
            column: '购买日期',
            value: '[下单时间]'
        }],
        defaultTitle: '感谢您购买我们的产品，别忘记给我们五星好评鼓励哦',
        defaultRemark: '如有问题请随时联系客服，客服人员将第一时间为您服务',
    },
]
export default editData
