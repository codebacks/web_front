import BasicLayout from './BasicLayout'
import {LocaleProvider} from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN'
import 'moment/locale/zh-cn'

export default props => {
    return (
        <LocaleProvider locale={zh_CN}>
            <BasicLayout {...props} />
        </LocaleProvider>
    )
}
