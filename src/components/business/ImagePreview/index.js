import React, {Component} from 'react'
import PropTypes from 'prop-types'
import {Modal, Spin, Icon} from 'antd'
import config from 'wx/common/config'
import styles from './index.less'

const {DefaultImage} = config

export default class ImagePreview extends Component {
    constructor(props) {
        super(props)
        this.state = {
            previewLoading: false
        }
    }

    static propTypes = {
        visible: PropTypes.bool,
        source: PropTypes.string,
    }

    static defaultProps = {
        visible: false,
        source: '',
    }

    componentDidMount() {
        this.setState({
            previewLoading: true
        })
    }

    componentWillUnmount() {}

    handleCancel = () => {
        this.props.onCancel()
        this.setState({
            previewLoading: true
        })
    }

    render() {
        const {visible, imageUrl} = this.props
        const {previewLoading} = this.state

        return (
            <Modal visible={visible}
                destroyOnClose={true}
                maskClosable={false}
                footer={null}
                onCancel={this.handleCancel}
                wrapClassName={styles.wrapper}

            >
                <Spin indicator={<Icon type="loading"/>}
                    spinning={previewLoading}
                >
                    <img className={styles.image}
                        src={imageUrl}
                        rel="noreferrer"
                        onLoad={(e) => {
                            this.setState({
                                previewLoading: false
                            })
                        }}
                        onError={(e)=>{
                            e.target.src = DefaultImage
                        }}
                        alt="查看大图"
                    />
                </Spin>
            </Modal>
        )
    }
}





