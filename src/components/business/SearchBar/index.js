/**
 **@Description:
 **@author: leo
 */

import React from 'react'
import {Form, Row, Col} from 'antd'
import styles from './index.less'
import PropTypes from "prop-types"
import {formItemTypesMap} from './utils'
import _ from "lodash"

export default class Index extends React.Component {
    static propTypes = {
        formOption: PropTypes.object.isRequired,
        formStyle: PropTypes.object,
        formClassName: PropTypes.string,
        searchBlock: PropTypes.array.isRequired,
        setFormItemTypesMap: PropTypes.func,
    }

    static defaultProps = {
        formOption: {
            labelCol: {span: 7},
            wrapperCol: {span: 17},
        },
    }

    constructor(...arg) {
        super(...arg)
        this.formItemTypesMap = this.setFormItemTypesMap()
    }

    setFormItemTypesMap = () => {
        const {setFormItemTypesMap} = this.props

        let newFormItemTypesMap = _.cloneDeep(formItemTypesMap)

        if (setFormItemTypesMap) {
            newFormItemTypesMap = setFormItemTypesMap(newFormItemTypesMap)
        }

        return newFormItemTypesMap
    }

    componentWillUnmount() {
    }

    renderFormItem = ({rowItem, rowIndex, colItem, colIndex, searchBlock}) => {
        const formItemType = this.formItemTypesMap[colItem.type] || this.formItemTypesMap['default']

        if (formItemType) {
            return formItemType.renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock})
        }
    }

    renderSearchCol = ({rowItem = {}, rowIndex, searchBlock}) => {
        return rowItem.cols.map((colItem = {}, colIndex) => {
            const renderColItem = colItem.renderColItem || this.renderColItem

            return renderColItem({rowItem, rowIndex, colItem, colIndex, searchBlock})
        })
    }

    renderColItem = ({rowItem, rowIndex, colItem = {}, colIndex, searchBlock}) => {
        const renderFormItem = colItem.renderFormItem || this.renderFormItem
        return (
            <Col
                span={8}
                key={colIndex}
                {...colItem.ColOption}
            >
                {renderFormItem({rowItem, rowIndex, colItem, colIndex, searchBlock})}
            </Col>
        )
    }

    renderRowItem = ({rowItem = {}, rowIndex, searchBlock}) => {
        return (
            <Row
                type={'flex'}
                gutter={20}
                key={rowIndex}
                {...rowItem.rowOption}
            >
                {this.renderSearchCol({rowItem, rowIndex, searchBlock})}
            </Row>
        )
    }

    renderSearchBlock = () => {
        const {
            searchBlock = [],
        } = this.props

        return searchBlock.map((rowItem = {}, rowIndex) => {
            const renderRowItem = rowItem.renderRowItem || this.renderRowItem

            return renderRowItem({rowItem, rowIndex, searchBlock})
        })
    }

    render() {
        const {
            formOption,
            formClassName = '',
            formStyle,
        } = this.props

        return (
            <Form
                style={formStyle}
                className={`${formClassName} ${styles.searchBar}`}
                {...formOption}
            >
                {this.renderSearchBlock()}
            </Form>
        )
    }
}
