import React, {PureComponent} from 'react'
import _ from 'lodash'
import createFaceHtml from "components/Face/createFaceHtml"
import config from 'common/config'
import {FilterUsername} from '../../config'
import styles from './index.less'

const {DefaultAvatar} = config

export default class Card extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {}
    }

    componentDidMount() {}


    render() {
        const {record} = this.props

        let username = _.get(record, 'body.card_username') || _.get(record, 'body.username') || ''
        let meta = '个人名片'
        let isFriend = true
        if (username.startsWith('gh_') || FilterUsername.includes(username) || _.get(record, 'body.certflag')) {
            meta = '公众号名片'
            isFriend = false
        }

        return <div className={`${styles.box} ${styles.card}`}>
            <div className={styles.body}>
                <div className={styles.info}>
                    <div className={styles.avatarWrap}>
                        <img className={styles.avatar}
                            src={_.get(record, 'body.smallheadimgurl') || _.get(record, 'body.brandIconUrl')}
                            onError={(e) => {
                                e.target.src = DefaultAvatar
                            }}
                            rel="noreferrer"
                            alt=""
                        />
                    </div>
                    <div className={styles.nameWrap}>
                        {createFaceHtml({
                            tagName: 'div',
                            tagProps: {className: 'title'},
                            values: _.get(record, 'body.nickname'),
                            replace: (html) => {
                                return _.unescape(html)
                            }
                        })}
                        {record.is_sender && isFriend ? <div className={styles.username}>
                            {record.body.alias || record.body.username}
                        </div> : null}
                    </div>
                </div>
                <div className={styles.meta}>{meta}</div>
            </div>
        </div>
    }
}