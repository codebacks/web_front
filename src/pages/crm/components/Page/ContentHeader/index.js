import React from 'react'
import styles from './index.less'
import {Popover, Icon} from 'antd'
import PropTypes from 'prop-types'

export default class ContentHeader extends React.PureComponent {
    static propTypes = {
        title: PropTypes.string.isRequired,
        description: PropTypes.string,
        helpUrl: PropTypes.string
    }

    static defaultProps = {
        title: '',
        description: '',
        helpUrl: ''
    }

    render() {
        const {
            title,
            description,
            helpUrl,
        } = this.props

        return (
            <div className={styles.head}>
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
                {
                    helpUrl &&
                    <div className={styles.help}>
                        <a href={helpUrl} target='_blank' rel="nofollow me noopener noreferrer"><Icon type="book" /> 帮助</a>
                    </div>
                }
            </div>
        )

    }

}