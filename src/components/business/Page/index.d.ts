import * as React from 'react';

import ContentHeader from './ContentHeader';
import ListPureComponent from './ListPureComponent';
import ContentHeader from './ContentHeader'
import ContentHeaderTabs from './ContentHeaderTabs'
import ContentBlock from './ContentBlock'
import ContentAdvSearch from './ContentAdvSearch'
import ContentDescription from './ContentDescription'
import Label from './Label'
import LabelEllipsis from './LabelEllipsis'
import Pagination from './Pagination'
import ContentTable from './ContentTable'
import LimitTip from './LimitTip'

export interface PageProps {
    
}


/**
 * 默认分页器参数
 */
export class DEFAULT_PAGER {
    /**
     * 分页大小
     */
    static pageSize: Number
    /**
     * 当前页码
     */
    static current: Number
}


/**
 * 默认分页器参数过滤器
 */
export class DEFAULT_PAGER_FILTER{
    /**
     * 分页大小
     */
    static pageSize: Function
    /**
     * 当前页码
     */
    static current: Function
}



// declare const Page: (props: PageProps) => JSX.Element;

// export default Page;

// export as namespace Page;

export default class Page {
    static LimitTip: typeof LimitTip;
    static ContentHeader: typeof ContentHeader;
    static ContentDescription: typeof ContentDescription;
    static ListPureComponent: typeof ListPureComponent;
}

export {
    ContentDescription,
    LimitTip
}
