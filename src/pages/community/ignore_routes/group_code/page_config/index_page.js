import React, {PureComponent, Fragment} from 'react'
import { Input, Button, message, Radio, Col, Row } from 'antd'
import {connect} from "dva/index"
import router from 'umi/router'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'business/ContentHeader'
import SingleUpload from 'components/business/SingleUpload'
import styles from './index.less'
import {notification} from "antd/lib/index"

const RadioGroup = Radio.Group
const photoMaxSize = 20
const photoTypeLimit = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']


@connect(({base, community_groupCodePageConfig, loading}) => ({
    base,
    community_groupCodePageConfig,
    getLoading: loading.effects['community_groupCodePageConfig/getPageConfig'],
    setLoading: loading.effects['community_groupCodePageConfig/setPageConfig'],
    uploadLoading: loading.effects['community_groupCodePageConfig/uploadBg'],
}))
@documentTitleDecorator({
    title: '页面配置',
})
export default class Index extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            id: '', // 活动id
            fileList: [],
            bgImagePath: '',
        }
    }

    componentDidMount() {
        const { title, des } = this.props.community_groupCodePageConfig
        const { query } = this.props.location
        if(query && query?.id) {
            this.setState({
                id:  query.id,
            }, () => {
                this.props.dispatch({
                    type: 'community_groupCodePageConfig/getPageConfig',
                    payload: {
                        id: this.state.id
                    },
                    callback: (resData) => {
                        this.setState({
                            bgImagePath: resData?.custom_backgrond_img_url
                        })
                    }
                })
            })
        }
    }

    componentWillUnmount() {
        this.reset()
    }

    handleChange = (key, e) => {
        const val = e.target.value
        this.props.dispatch({
            type: 'community_groupCodePageConfig/setProperty',
            payload: {
                [key]: val,
            },
        })
    }

    handleChangeUpload = (info) => {
        if (info.file.status === 'done') {
            this.setState({bgImagePath: info.file.response.url, fileList: info.fileList}, () => {
                this.props.dispatch({
                    type: 'community_groupCodePageConfig/setProperty',
                    payload: {
                        custom_backgrond_img_url: info.file.response.url,
                    },
                })
            })
        } else {
            this.setState({fileList: info.fileList})
        }
    }

    radioChange = (e) => {
        const {value} = e.target
        this.props.dispatch({
            type: 'community_groupCodePageConfig/setProperty',
            payload: {
                type: value,
            },
        })
    }

    ok = () => {
        const { type, title, des, custom_backgrond_img_url } = this.props.community_groupCodePageConfig
        const { dispatch } = this.props
        let body  = {type: type}
        if(type === 1) {
            if(!title || !des) {
                message.warning('请输入推广主题和推广描述')
                return false
            }
            body.title = title
            body.des = des
        }else if(type === 2){
            if(!custom_backgrond_img_url) {
                message.warning('请上传自定义图片')
                return false
            }
            body.custom_backgrond_img_url = custom_backgrond_img_url
        }
        dispatch({
            type: 'community_groupCodePageConfig/setPageConfig',
            payload: {
                id: this.state.id,
                body: body
            },
            callback: () => {
                message.success('配置成功！', 1)
                setTimeout(()=>{
                    router.push('/community/group_code')
                }, 1000)
            }
        })
    }

    cancel = () => {
        router.push('/community/group_code')
    }

    reset = () => {
        this.props.dispatch({
            type: 'community_groupCodePageConfig/resetState'
        })
    }

    render() {
        const { title, des, type } = this.props.community_groupCodePageConfig
        const { setLoading } = this.props
        //上传
        const photoUploadProps = {
            accept: photoTypeLimit.join(','),
            beforeUpload: (file) => {
                return new Promise((resolve, reject) => {
                    if (!photoTypeLimit.includes(file.type)) {
                        notification.error({
                            message: '图片格式错误',
                            description: `仅能上传${photoTypeLimit.join(',')}文件!`,
                        })
                        reject(file)
                    }
                    const sizeOk = file.size <= 1024 * 1024 * photoMaxSize // 视频大小限制
                    if (!sizeOk) {
                        notification.error({
                            message: '图片大小超出限制',
                            description: `图片大小不能超过${photoMaxSize}M`,
                        })
                        reject(file)
                    }
                    resolve(file)
                })
            },
            onRemove: () => {
                this.setState({bgImagePath: ''}, () => {
                    this.props.dispatch({
                        type: 'community_groupCodePageConfig/setProperty',
                        payload: {
                            custom_backgrond_img_url: '',
                        },
                    })
                })
            }
        }

        return (
            <div>
                <ContentHeader
                    contentType={'breadcrumb'}
                    content={
                        [
                            {name: '群活动', path: '/community/group_code',},
                            {
                                name: '页面配置',
                            },
                        ]
                    }
                />
                <Row className={styles.pageConfig} gutter={20}>
                    <Col className={styles.left} span={15}>
                        <div className={styles.row}>
                            <div className={styles.txt}>群活动名称：</div>
                            <div>这里显示群活动名称</div>
                        </div>
                        <div className={styles.row}>
                            <div className={styles.txt}>页面模式：</div>
                            <RadioGroup value={type} onChange={this.radioChange}>
                                <Radio value={1}>使用模板</Radio>
                                <Radio value={2}>自定义模板</Radio>
                            </RadioGroup>
                        </div>
                        {
                            type === 1 && (
                                <Fragment>
                                    <div className={styles.row}>
                                        <div className={styles.txt}><span style={{color: 'red'}}>* </span>推广主题：</div>
                                        <Input
                                            placeholder="请输入推广主题，限8字内"
                                            value={title}
                                            onChange={(e) => this.handleChange('title', e)}
                                            maxLength={8}
                                        />
                                    </div>
                                    <div className={styles.row}>
                                        <div className={styles.txt}><span style={{color: 'red'}}>* </span>推广描述：</div>
                                        <Input
                                            placeholder="请输入推广描述，限80字内"
                                            value={des}
                                            onChange={(e) => this.handleChange('des', e)}
                                            maxLength={80}
                                        />
                                    </div>
                                </Fragment>
                            )
                        }

                        <div className={styles.row}>
                            <Button type='primary' onClick={this.ok} style={{marginRight: 30}} loading={setLoading}>确定</Button>
                            <Button onClick={this.cancel}>取消</Button>
                        </div>
                    </Col>
                    <Col className={styles.right} span={9}>
                        <div className={styles.phoneWrap}>
                            {
                                type === 1 && (
                                    <div className={`${styles.phoneBg} ${styles.phoneBgDefault}`}>
                                        <div className={styles.phoneEQRcodeBg}>
                                            <div className={styles.phoneEQRcode} style={{bottom:'74px'}}>
                                                <div className={styles.phoneShareTitle}>
                                                    {title}
                                                </div>
                                                <div className={styles.phoneEQRWrap}>
                                                    <img src={require('community/assets/images/erweima1.png')} alt=""/>
                                                </div>
                                                <div className={styles.description}>
                                                    <pre className={styles.showDescription}>
                                                        {des}
                                                    </pre>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )
                            }
                            {
                                type === 2 && (
                                    <div className={`${styles.phoneBg} ${styles.phoneBgCustom}`}>
                                        <div className={styles.phoneEQRcodeBg} style={{backgroundImage: `url(${this.state.bgImagePath})`}}>

                                            <div className={styles.phoneEQRcode} style={{bottom:'98px'}}>

                                                <div className={styles.phoneEQRWrap}>
                                                    <img src={require('community/assets/images/erweima2.png')} alt=""/>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                )
                            }
                        </div>
                        {
                            type === 2 && (
                                <div className={styles.uploadWrap}>
                                    <div style={{marginBottom: 10}}>上传背景图：</div>
                                    <SingleUpload
                                        {...photoUploadProps}
                                        fileList={this.state.fileList}
                                        onChange={this.handleChangeUpload}
                                    />
                                </div>
                            )
                        }

                    </Col>
                </Row>
            </div>
        )
    }
}
