import React from 'react'
import styles from './index.less'
import {Popover, Icon} from 'antd'
import PropTypes from 'prop-types'

export default class ContentHeader extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        titleDescription: PropTypes.string,
        subTitle: PropTypes.string,
        showDescriptionIcon: PropTypes.bool,
        description: PropTypes.string,
        action: PropTypes.object
    }

    static defaultProps = {
        showDescriptionIcon: true,
        isAutoScroll: false
    }

    render() {
        const {
            title,
            description,
        } = this.props

        return (
            <div>
                {
                    title &&
                    <h1 className={styles.title}>{title}
                        {
                            description && <Popover
                                placement="bottomLeft"
                                content={description}
                                title={null}>
                                <Icon className={styles.questionCircle} type="question-circle-o"/>
                            </Popover>
                        }
                    </h1>
                }
            </div>
        )

    }

}