/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/1/15
 */
import React, {PureComponent} from 'react'
import toggleModalWarp from 'hoc/toggleModalWarp'
// import styles from './index.less'
import CustomersDetails from '../CustomersDetails'

@toggleModalWarp({
    title: "预览",
    width: 1200,
    destroyOnClose: true,
    maskClosable: true,
    centered: true,
    footer: null,
})
export default class PreviewModel extends PureComponent {
    constructor(props) {
        super(props)
    }

    componentDidMount() {

    }

    render() {
        const {
            previewModePayload,
        } = this.props

        return (
            <CustomersDetails
                callType={2}
                previewModePayload={previewModePayload}
                title={previewModePayload.name}
            />
        )
    }
}
