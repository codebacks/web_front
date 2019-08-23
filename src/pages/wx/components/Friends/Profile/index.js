import React from 'react'
import {Button, Modal, Spin} from 'antd'
import {connect} from 'dva'
import styles from './index.scss'
import config from 'wx/common/config'

const {DefaultAvatar, Sex} = config

@connect(({wx_friends}) => ({
    wx_friends,
}))
export default class extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
        }
    }

    componentDidMount() {
        let {record} = this.props
        this.props.dispatch({
            type: 'wx_friends/detail',
            payload: {
                uin: record.target.uin,
                username: record.target.username
            }
        })
    }

    handleCancel = () =>{
        this.props.onCancel()
    }

    render() {
        const {loadingFriendDetail, detail} = this.props.wx_friends
        const {profileVisible} = this.props

        return (
            <Modal
                title="好友详情"
                visible = {profileVisible}
                width = {800}
                maskClosable={false}
                onCancel={this.handleCancel}
                footer={[<Button key="cancel" onClick={this.handleCancel}>取消</Button>]}>
                <Spin spinning={!!loadingFriendDetail}>
                    { detail.target ? <div className={styles.profile}>
                        <div className={styles.base}>
                            <img className={styles.avatar}
                                src={detail.target.head_img_url || DefaultAvatar}
                                rel="noreferrer"
                            />
                            <div className={styles.main}>
                                <div className={styles.nickname}>
                                    {detail.target.nickname}
                                    <ul className={styles.tags}>
                                        {
                                            detail.target.contact_labels.map((item,idx)=>{
                                                return <li className={styles.tag} key={idx}>{item.name}</li>
                                            })
                                        }
                                    </ul>
                                </div>
                                <p className={styles.line}>
                                    <span>性别：</span>{Sex[detail.target.sex]}
                                </p>
                                <p className={styles.line}>
                                    <span>地区：</span>{ detail.target.province || detail.target.city
                                        ? detail.target.province + detail.target.city
                                        : '未知'}
                                </p>
                                <p className={styles.line}>
                                    <span>个性签名：</span>{detail.target.signature}
                                </p>
                            </div>
                        </div>
                        <div className={styles.other}>
                            {detail.target.lvbuff.mobile ? <p><span>电话号码：</span>{detail.target.lvbuff.mobile}</p> :''}
                            {detail.target.lvbuff.description ? <p><span>描述：</span>{detail.target.lvbuff.description}</p> : ''}
                            {detail.target.lvbuff.extra_image ? <p>
                                <span>附加图片：</span>
                                <img className={styles.additional} src={detail.target.lvbuff.extra_image} alt="附加图片"/>
                            </p> : ''
                            }
                        </div>
                    </div> : ''
                    }
                </Spin>
            </Modal>
        )
    }
}
