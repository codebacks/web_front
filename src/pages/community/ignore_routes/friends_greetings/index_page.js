import React from 'react'
import styles from './index.less'
import GroupGreet from './components/GroupGreet'
import ContentHeader from 'business/ContentHeader'
import documentTitleDecorator from "hoc/documentTitle"

@documentTitleDecorator()
export default class Index extends React.PureComponent {
    render() {
        return (
            <div className={styles.container}>
                <ContentHeader
                    contentType={'title'}
                    content={{
                        title: this.props.documentTitle,
                    }}
                    help={{
                        url: 'http://newhelp.51zan.cn/manual/content/%E7%A4%BE%E7%BE%A4/%E5%85%A5%E7%BE%A4%E9%97%AE%E5%80%99.md',
                    }}
                />
                <GroupGreet/>
            </div>
        )
    }
}
