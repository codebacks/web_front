import * as React from 'react';

/**
 * 列表页面父类，可以生成浏览器历史记录
 */
export abstract class ListPureComponent extends React.PureComponent { 

    /**
     * 获取参数从对象中
     * @method getParamForObject
     * @param {json} param 要获取的参数对象
     * @param {json} source 源对象
     * @param {json} [paramFilter] 参数对象的过滤器
     */
    getParamForObject(param, source, paramFilter);
    /**
     * 是浏览器生成历史记录
     * @method history
     * @param {json} condition 查询条件
     * @param {json} pager 页码和PageSize
     * @param {json} [filter] 过滤器，用来过滤是否让查询条件和分页的出现在url地址在，返回值为undifine，不会出现在url地址中
     */
    history(condition: Object, pager:Object, filter?: Object): void;

    abstract getPageData(condition: Object, pager: Object, isSetHistory: boolean, callback?: Function): void;

    abstract initPage(isSetHistory: boolean): void;
    
    /**
     * 通用处理分页控件变更页码事件
     */
    handleListPageChange(page: number): void;

    /**
     * 通用处理分页控件变更PageSize事件
     */
    handleListPageChangeSize(value: number, pageSize: number): void;
}

