/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/14
 */

import React from 'react'
import {
    Radio,
    Icon,
    Popover,
} from 'antd'
import styles from './index.less'
import PropTypes from 'prop-types'
import EllipsisPopover from "components/EllipsisPopover"

const opMap = {
    'include': '包含',
    'exclude': '不包含',
}

export default class extends React.PureComponent {
    static propTypes = {
        tags: PropTypes.array,
        renderTagTitle: PropTypes.func,
        categoryDelete: PropTypes.func.isRequired,
        op: PropTypes.oneOf(['include', 'exclude']).isRequired,
        setFilterContentState: PropTypes.func.isRequired,
        item: PropTypes.object,
        title: PropTypes.string,
    }

    static defaultProps = {
        tags: [],
        placement: 'bottom',
        op: 'include',
        inputContentOption: {},
        item: {},
        title: '',
        renderTagTitle: (title) => {
            return title
        },
    }

    deleteTag = (index) => {
        const {
            item,
            setFilterContentState,
        } = this.props

        item.values.splice(index, 1)

        setFilterContentState(item)
    }

    opChange = (e) => {
        const {
            item,
            setFilterContentState,
        } = this.props

        item.op = e.target.value

        setFilterContentState(item)
    }

    renderTags = () => {
        const {
            tags = [],
            renderTagTitle,
        } = this.props

        return tags.map((item, index) => {
            return (
                <div className={styles.item} key={index}>
                    <EllipsisPopover
                        content={renderTagTitle(item)}
                        lines={1}
                        ellipsisClassName={styles.txt}
                    />
                    <div
                        className={styles.icon}
                        onClick={() => this.deleteTag(index, item)}
                    >
                        <Icon type="close"/>
                    </div>
                </div>
            )
        })
    }

    render() {
        const {
            description,
            InputContent,
            inputContentOption,
            placement,
            op,
            item,
            title,
            setFilterContentState,
            categoryDelete,
        } = this.props

        return (
            <div className={styles.content}>
                <div className={styles.titleBar}>
                    <span className={styles.title}>
                        {title}
                    </span>
                    <Popover
                        placement={placement}
                        content={description}
                        title={null}
                    >
                        <Icon
                            className={styles.questionCircle}
                            type="question-circle-o"
                        />
                    </Popover>
                    <Radio.Group
                        value={op}
                        buttonStyle="solid"
                        onChange={this.opChange}
                    >
                        <Radio.Button
                            value="include"
                        >
                            包含
                        </Radio.Button>
                        <Radio.Button
                            value="exclude"
                        >
                            不包含
                        </Radio.Button>
                    </Radio.Group>
                    <div className={styles.deleteBtn} onClick={categoryDelete}>
                        删除
                    </div>
                </div>
                <div className={styles.inputContent}>
                    <InputContent
                        item={item}
                        setFilterContentState={setFilterContentState}
                        {...inputContentOption}
                    />
                </div>
                <div className={styles.tagsContent}>
                    <div className={styles.tagsContentLeft}>
                        {opMap[op]} :
                    </div>
                    <div className={styles.tagsContentRight}>
                        {
                            this.renderTags()
                        }
                    </div>
                </div>
            </div>
        )
    }
}

