const muneData = [
    {
        index:0,
        type:'Default',
        name:'Banner',
        text:'轮播图',
        template: 'banner'
    },{
        index:1,
        type:'Search',
        name:'Search',
        text:'搜索',
        template: 'search'
    },{
        index:2,
        type:'Default',
        name:'SingleImg',
        text:'单张图片',
        template: 'singleImg'
    },{
        index:3,
        type:'Line',
        name:'Line',
        text:'分割线',
        template: 'divide'
    },{
        index:4,
        type:'DoubleColumn',
        name:'DoubleColumn',
        productType:'cross',
        description:'镇店宝贝',
        text:'双列商品',
        template: 'doubleColumn'
    },{
        index:5,
        type:'SingleLine',
        name:'SingleLine',
        description:'爆款来袭',
        productType:'direction',
        text:'单行商品',
        template: 'singleColumn'
    },{
        index:6,
        type:'Section',
        name:'Section',
        text:'文字段落',
        template: 'paragraph'
    },{
        index:7,
        type:'ImageText',
        name:'ImageText',
        text:'图文混排',
        template: 'photoText'
    },{
        index:8,
        type:'SingleText',
        name:'SingleText',
        text:'单行文本',
        template: 'singleLine'
    },{
        index:10,
        type:'CommodityCategories',
        name:'CommodityCategories',
        text:'商品类目',
        template: 'category'
    }
]
export const activeMuneData = [{
    index:11,
    // 菜单选择组件
    type:'SingleLine',
    // 手机模型中的组件 & 对应的编辑内容组件
    name:'ActiveProduct',
    // 商品列表组件 横竖设置
    productType:'direction',
    // 活动
    active:'pingtuan',
    text:'超值拼团',
    // 小程序使用
    template: 'group'
},{
    index:12,
    type:'SingleLine',
    name:'ActiveProduct',
    productType:'direction',
    active:'tejia',
    text:'精选特价',
    template: 'special'
},{
    index:13,
    type:'SingleLine',
    name:'ActiveProduct',
    productType:'direction',
    active:'tuijian',
    text:'好物推荐',
    template: 'recommend'
},]

export default muneData