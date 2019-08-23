import config from '../../pages/setting/config'

const api = {
    //通过 id 查询产品列表
    getProductList: {
        url: `${config.yqxHost}/management/merchant/decoration_products`,
        type: 'POST',
    },
    setShop:{
        url: `${config.yqxHost}/management/merchant/decoration`,
        type: 'POST',
    },
    getShop:{
        url: `${config.yqxHost}/management/merchant/decoration`,
        type: 'GET',
    },
    getTemplateList:{
        url: `${config.yqxHost}/management/merchant/decoration_tpl_list`,
        type: 'GET',
    },
    getCurrentTemplate:{
        url: `${config.yqxHost}/management/merchant/decoration_tpl_current`,
        type: 'GET',
    },
}
// getCurrentTemplate,getTemplateList
export default api