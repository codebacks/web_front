/** @description 加粉模板
 * @author liyan
 * @date 2018/12/17
 */
import React, {Component} from 'react'
import documentTitleDecorator from 'hoc/documentTitle'
import ContentHeader from 'components/business/ContentHeader'
import Template from './components/Template'
import styles from './index.scss'

@documentTitleDecorator({
    title: '加粉模板'
})
export default class extends Component {
    constructor(props) {
        super(props)
        this.state = {
            options: {}
        }
    }

    componentDidMount() {}

    render() {

        return (
            <div>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: `${this.props.location.query.id ? '编辑' : '新建'}加粉模板`,
                    }}
                />
                <div className={styles.templateWrapper}>
                    <Template {...this.props} />
                </div>
            </div>
        )
    }
}
