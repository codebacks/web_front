import React, {PureComponent} from 'react'
import BaseVideo from '../../Message/BaseVideo'
import styles from './index.less'

export default class Video extends PureComponent {
    constructor(props) {
        super(props)
        this.state = {
            defaultSize: 240,
            visible: false,
            width: '',
            height: '',
        }
    }

    componentDidMount() {

    }

    onLoad = (e) => {
        this.setState({
            height: e.target.naturalHeight,
            width: e.target.naturalWidth
        })
    }

    render() {
        const {record, onClick} = this.props

        const videoSize = {
            width: 156,
            height: 156,
        }

        return <div className={styles.video} >
            <BaseVideo record={record}
                videoSize={videoSize}
                onLoad={this.onLoad}
                onClick={onClick}
                cls={styles.cover}
            />
        </div>
    }
}