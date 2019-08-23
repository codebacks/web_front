import Main from './Main'
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
import ListPureComponent, { DEFAULT_PAGER, DEFAULT_PAGER_FILTER } from './ListPureComponent'

const Page = Main

ContentHeader.Tabs = ContentHeaderTabs

Page.ContentHeader = ContentHeader
Page.ContentAdvSearch = ContentAdvSearch
Page.Label = Label
Page.LabelEllipsis = LabelEllipsis
Page.Pagination = Pagination
Page.ContentBlock = ContentBlock
Page.ListPureComponent = ListPureComponent
Page.ContentTable = ContentTable
Page.ContentDescription = ContentDescription
Page.LimitTip = LimitTip

export {
    Page as default,
    ContentHeader,
    ContentAdvSearch,
    Label,
    LabelEllipsis,
    Pagination,
    ContentBlock,
    ContentTable,
    ContentDescription,
    ListPureComponent,
    LimitTip,
    DEFAULT_PAGER,
    DEFAULT_PAGER_FILTER
}