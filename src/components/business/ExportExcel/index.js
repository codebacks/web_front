import React, {Component} from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import {Button, notification} from 'antd'
import config from 'data/common/config'
import styles from './index.less'

const {DateFormat} = config

export default class Export extends Component {
    constructor(props) {
        super(props)
        this.state = {
            exportLoading: false
        }
        this.timer = 0
    }

    static propTypes = {
        name: PropTypes.string,
        taskIdLoading: PropTypes.bool,
        taskFunc: PropTypes.func,
        exportFunc: PropTypes.func,
        cls: PropTypes.string,
    }

    static defaultProps = {
        name: '',
        taskIdLoading: false,
        taskFunc: () => {},
        exportFunc: () => {},
        cls: '',
    }

    componentDidMount() {
        this._isMounted = true
    }

    componentWillUnmount() {
        this._isMounted = false
        clearTimeout(this.timer)
    }


    handleExport = () => {
        this.getExportId()
    }

    getExportId = () => {
        const {taskFunc} = this.props
        taskFunc((data) => {
            const taskId = data.task_id
            this.setState({exportLoading: true})
            this.exportExcel(taskId)
        })
    }

    exportExcel = (taskId) => {
        const {exportFunc, name} = this.props
        exportFunc(taskId, (res) => {
            if (this._isMounted) {
                if (res.status >= 200 && res.status < 300) {
                    let responseCopy = res.clone()
                    res.json().then((res) => {
                        if (res.data.state === 'PENDING') {
                            this.timer = setTimeout(() => {
                                this.exportExcel(taskId)
                            }, 1000)
                        } else {
                            notification.error({
                                message: '错误提示',
                                description: '导出失败，请重试',
                            })
                            this.setState({exportLoading: false})
                        }
                    }).catch((err) => {
                        responseCopy.blob().then((r) => {
                            this.setState({exportLoading: false})
                            const blob = new Blob([r], {type: 'application/vnd.ms-excel'})
                            const url = URL.createObjectURL(blob)
                            let a = document.createElement('a')
                            a.download = `${name}数据导出-${moment().format(DateFormat)}.xls`
                            a.href = url
                            a.style.display = 'none'
                            document.body.appendChild(a)
                            a.click()
                            document.body.removeChild(a)
                        }).catch((err) => {
                            this.setState({exportLoading: false})
                            console.error(err)
                        })
                    })
                } else {
                    // res.error.response.status === 500
                    this.setState({exportLoading: false})
                }
            }
        })
    }


    render() {
        const {taskIdLoading, cls} = this.props
        const {exportLoading} = this.state

        return (
            <div className={`${styles.exportWrap} ${cls}`}>
                <Button className={styles.export}
                    icon={taskIdLoading || exportLoading ? 'loading' : 'download'}
                    onClick={this.handleExport}
                    disabled={taskIdLoading || exportLoading}
                >导出数据</Button>
            </div>
        )
    }
}





