import React from "react"
import router from 'umi/router'
import {stringify} from 'qs'
import moment from 'moment'



const DEFAULT_PAGER = {
    pageSize: 10,
    current: 1
}

const DEFAULT_PAGER_FILTER = {
    pageSize: (value, defaultValue) => value - 0,
    current: (value, defaultValue) => value - 0
}

const DEFAULT_PAGE_EXPORT = {...DEFAULT_PAGER}

export { 
    DEFAULT_PAGE_EXPORT as DEFAULT_PAGER,
    DEFAULT_PAGER_FILTER 
}

export default class Index extends React.PureComponent {

    /**
     * 获取参数从对象中
     * @method getParamForObject
     * @param {json} param 要获取的参数对象
     * @param {json} source 源对象
     * @param {json} [paramFilter] 参数对象的过滤器
     */
    getParamForObject = (param, source, paramFilter)  => {
        let result = {...param}
        Object.keys(result).forEach(key => {
            const filter = paramFilter ? paramFilter[key] : null
            const value = source[key]
            if(value !== undefined) {
                result[key] = filter ? filter(value, result[key]) : value
            }
        })
        return result
    }

    /**
     * 是浏览器生成历史记录
     * @method history
     * @param {json} condition 查询条件
     * @param {json} pager 页码和PageSize
     * @param {json} [filter] 过滤器，用来过滤是否让查询条件和分页的出现在url地址在，返回值为undifine，不会出现在url地址中
     */
    history = (condition, pager, filter) => {
        const params = stringify({
            ...condition,
            ...pager
        }, {
            filter: (prefix, value) => {
                const itemFilter = filter? filter[prefix] : null

                if(itemFilter) {
                    return itemFilter(value)
                }

                if(value === ''){
                    return
                }
                if(prefix === 'pageSize' && value === DEFAULT_PAGER.pageSize){
                    return
                }
                if(prefix === 'current' && value === DEFAULT_PAGER.current){
                    return
                }
    
                return value
            }
        })
        router.push("?" + params)
    }

    componentDidMount() {
        if(!this.getPageData){
            console.warn(`继承ListPureComponent的类，需要有一个getPageData实例方法。`)
        }
        
        if(!this.initPage){
            console.warn(`继承ListPureComponent的类，需要有一个initPage实例方法。`)
        }
        
        this.initPage()
    }

    componentDidUpdate(prevProps, prevState){
        if(this.props.history.action === 'POP' && prevProps.location.pathname === this.props.location.pathname && prevProps.location.search !== this.props.location.search){
            // 后退或前进按钮，重新触发initPage事件
            this.initPage()
        }
    }

    /**
     * 通用处理分页控件变更页码事件
     */
    handleListPageChange = (page) => {

        let {condition, pager} = this.state
        pager.current = page

        this.getPageData(condition, pager)
    }
    
    /**
     * 通用处理分页控件变更PageSize事件
     */
    handleListPageChangeSize = (value, pageSize) => {
        let {condition, pager} = this.state
        
        pager.current = DEFAULT_PAGER.current
        pager.pageSize = pageSize

        this.getPageData(condition, pager)
    }


    
}