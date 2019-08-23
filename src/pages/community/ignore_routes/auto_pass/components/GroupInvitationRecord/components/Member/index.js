/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/23
 */

import React from 'react'
import styles from './index.less'
import config from 'community/common/config'
import ImgManager from 'components/ImgManager'
import modalWarp from 'hoc/modalWarp'
import _ from 'lodash'

const {DefaultAvatar} = config

@modalWarp({
    width: 540,
    destroyOnClose: true,
    title: '被邀请人列表',
    wrapClassName: styles.memberWrapper,
    footer: null,
})
export default class extends React.PureComponent {
    getMembers() {
        const invitees = _.get(this, 'props.record.invitees')
        if(invitees){
            try{
                return JSON.parse(invitees)
            }catch(e) {
                return []
            }
        }
        return []
    }

    render() {
        const members = this.getMembers()

        return (
            <>
                {
                    <ul className={styles.members}>
                        {
                            members.map((item, index) => {
                                return (
                                    <li
                                        className={styles.item}
                                        key={index}
                                    >
                                        <ImgManager
                                            defaultSrc={DefaultAvatar}
                                            imgSrc={item.headimgurl}
                                            render={(imgSrc) => {
                                                return (
                                                    <img
                                                        className={styles.avatar}
                                                        src={imgSrc}
                                                        alt="头像"
                                                    />
                                                )
                                            }}
                                        />
                                        <p className={styles.nickname}>{item.nickname || item.username}</p>
                                    </li>
                                )
                            })
                        }
                    </ul>
                }
            </>
        )
    }
}
