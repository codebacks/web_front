import React from 'react'
import styles from './index.less'
import NewFriends from './components/NewFriends'
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
                        url: 'http://newhelp.51zan.cn/manual/content/%E4%B8%AA%E4%BA%BA%E5%8F%B7/%E6%99%BA%E8%83%BD%E7%AE%A1%E7%90%86.md',
                    }}
                />
                <NewFriends/>
            </div>
        )
    }
}
