import React from 'react'
import {
    Button,
    message,
} from 'antd'
import {connect} from "dva/index"
import Watermark from 'wx/components/Watermark'
import styles from './index.less'

@connect(({wx_defaultWatermark, loading}) => ({
    wx_defaultWatermark,
    categoryUpdateLoading: loading.effects['wx_defaultWatermark/categoryUpdate'],
}))
export default class Index extends React.PureComponent {
    constructor(props) {
        super(props)
        this.watermarkRef = React.createRef()
    }

    componentDidMount() {
        this.props.dispatch({
            type: 'wx_defaultWatermark/watermark',
        })
    }

    onTextWatermarkValueChange = (value) => {
        this.props.dispatch({
            type: 'wx_defaultWatermark/setProperty',
            payload: {
                textWatermarkValue: value,
            },
        })
    }

    ontQrCodeCheckedChange = (e) => {
        this.props.dispatch({
            type: 'wx_defaultWatermark/setProperty',
            payload: {
                qrCodeChecked: e.target.checked,
            },
        })
    }

    ok = () => {
        if(this.watermarkRef) {
            this.watermarkRef.current.getWatermarkTemplateData(()=>{
                this.props.dispatch({
                    type: 'wx_defaultWatermark/updateWatermark',
                    callback: () => {
                        message.success('更新成功')
                    },
                })
            })
        }
    }

    render() {
        const {
            textWatermarkValue,
            qrCodeChecked,
        } = this.props.wx_defaultWatermark

        return (
            <div className={styles.newWatermarkTemplate}>
                <div className={styles.contents}>
                    <div className={styles.watermark}>
                        <Watermark
                            textWatermarkValue={textWatermarkValue}
                            qrCodeChecked={qrCodeChecked}
                            getLeoRef={this.watermarkRef}
                            onTextWatermarkValueChange={this.onTextWatermarkValueChange}
                            ontQrCodeCheckedChange={this.ontQrCodeCheckedChange}
                        />
                    </div>
                    <div className={styles.btnBar}>
                        <Button
                            loading={this.props.categoryUpdateLoading}
                            type="primary"
                            className={styles.btn}
                            onClick={this.ok}
                        >
                            保存
                        </Button>
                    </div>
                </div>
            </div>
        )
    }
}