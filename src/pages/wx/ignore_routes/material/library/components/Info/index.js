import React, {Component} from 'react'
import {Icon, Tag, Popconfirm} from 'antd'
import PropTypes from 'prop-types'
import moment from 'moment'
import EllipsisPopover from 'components/EllipsisPopover'
import {source} from '../../config'
import styles from './index.scss'

export default class Info extends Component {
    constructor(props) {
        super(props)
        this.state = {}
    }

    static propTypes = {
        type: PropTypes.number,
        item: PropTypes.object,
        removeLoading: PropTypes.bool,
        onRemove: PropTypes.func,
        onTagManagement: PropTypes.func,
    }

    static defaultProps = {
        type: 0,
        item: {},
        removeLoading: false,
        onRemove: ()=>{},
        onTagManagement: ()=>{},
    }

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    render() {
        const {type, item, record, removeLoading, onRemove, onTagManagement} = this.props
        const placeholders = Array.apply(null, Array(8))

        return  (
            <div className={styles.info}>
                <div className={styles.creator}>创建人：{item.nickname}</div>
                <div className={styles.tags}>
                    {
                        item.is_operable ? <span className={`${styles.tag} ${styles.control}`}
                            onClick={()=>{onTagManagement(item)}}
                        >管理标签</span> : null
                    }
                    {
                        item.tags.map((tag, index)=>{
                            return <Tag key={index} color="blue" className={styles.tag}>{tag}</Tag>
                        })
                    }
                    {
                        placeholders.map((v, index) => {
                            return <Tag key={index} className={`${styles.tag} ${styles.placeholder}`}/>
                        })
                    }
                </div>
                <div className={styles.meta}>
                    <EllipsisPopover content={`来源：${source[item.source]}`}
                        className={styles.source}
                    />
                    <div className={styles.timeWrap}>
                        <span className={styles.time}>{moment(item.create_time * 1000).format('YYYY/MM/DD HH:mm')}</span>
                        {
                            item.is_operable ? <Popconfirm placement="bottomRight"
                                title="确定要删除素材嘛？"
                                getPopupContainer={()=>document.getElementById(`materialLibrary${type}Delete${item.id}`)}
                                onConfirm={()=>{onRemove(type, item)}}
                                okText="确定"
                                cancelText="取消">
                                <Icon type={record.id === item.id && removeLoading ? "loading" : "delete"}
                                    id={`materialLibrary${type}Delete${item.id}`}
                                    className={styles.delete}
                                />
                            </Popconfirm> : null
                        }
                    </div>
                </div>
            </div>
        )
    }
}

