import React from 'react'
import { Pagination } from 'antd'
import PropTypes from 'prop-types'

// 显示页脚的阀值，当数量大于等于阀值时，页脚总数显示的
const SHOW_PAGINATION_THRESHOLD = 1

export default class Index extends React.PureComponent{

    static propTypes = {
        showQuickJumper: PropTypes.bool,
        showSizeChanger: PropTypes.bool,
        pageSizeOptions: PropTypes.array
    }

    static defaultProps = {
        showQuickJumper: true,
        showSizeChanger: true,
        pageSize: 10,
        pageSizeOptions: ['10', '20', '50', '100'],
        className: "ant-table-pagination"
    }

    showTotalHandler = (total, range, isShow, onShowTotal) => {
        if(onShowTotal){
            return onShowTotal(total)
        } else {
            if(isShow) {
                return `共 ${total} 条`
            }
        }
    }

    isShow(total){
        return total >= SHOW_PAGINATION_THRESHOLD
    }

    render() {
        const {
            className,
            current,
            total,
            pageSize,
            pageSizeOptions,
            showQuickJumper,
            showSizeChanger,
            onShowSizeChange,
            onChange,
            hideOnSinglePage,
            showTotal,
            size,
            simple,
            itemRender
        } = this.props

        return (
            <div>
                {
                    this.isShow(total) &&
                    <Pagination 
                        className={className}
                        current={current}
                        total={total}
                        showTotal={(total, range) => this.showTotalHandler(total, range, true, showTotal)}
                        showQuickJumper={showQuickJumper} 
                        showSizeChanger={showSizeChanger}  
                        pageSize={pageSize} 
                        pageSizeOptions= {pageSizeOptions}
                        size={size}
                        simple={simple}
                        onShowSizeChange={onShowSizeChange}
                        onChange={onChange} 
                        itemRender={itemRender}
                    />
                }
            </div>
        )
    }
}