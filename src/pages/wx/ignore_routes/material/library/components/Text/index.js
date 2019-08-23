import React, {Component} from 'react'
import {Checkbox, Button, Popover} from 'antd'
import createFaceHtml from "components/Face/createFaceHtml"
import CreateMaterial from './components/CreateMaterial'
import Info from '../Info'
import utils from "../../utils"
import config from 'wx/common/config'
import styles from './index.scss'

const {materialType} = config

export default class Text extends Component {
    constructor(props) {
        super(props)
        this.state = {
            createTextVisible: false
        }
    }

    componentDidMount() {}

    componentWillUnmount() {}

    handleShowCreateMaterial = () => {
        this.setState({
            createTextVisible: true
        })
    }

    handleCreateMaterialOk = () => {
        this.handleHideCreateMaterial()
        this.props.onCreate(materialType.text.type, {})
    }

    handleHideCreateMaterial = () => {
        this.setState({
            createTextVisible: false
        })
    }

    render() {
        const {list, selectedMaterials, removeLoading, onSelectMaterial, onRemove, onTagManagement, category} = this.props
        const {createTextVisible} = this.state

        return  (
            <div className={styles.textWrap}>
                <div className={styles.operation}>
                    <Button type="primary"
                        className={styles.create}
                        onClick={this.handleShowCreateMaterial}
                    >新建素材</Button>
                </div>
                <div className={styles.boxes}>
                    {
                        list.map((item)=>{
                            const desc = createFaceHtml({
                                tagName: 'pre',
                                tagProps: {className: styles.text},
                                values: item.desc,
                            })
                            return <div key={item.id} className={styles.box}>
                                {
                                    item.is_operable ?  <div className={styles.checkbox}>
                                        <Checkbox checked={utils.isSelected(selectedMaterials, item.id)}
                                            onChange={(e)=>{onSelectMaterial(item.id, e)}}
                                        />
                                    </div> : null
                                }
                                <div className={styles.wrapper}>
                                    <div className={styles.ellipsis}>
                                        <Popover placement="topLeft"
                                            title={null}
                                            trigger="hover"
                                            content={<div className={styles.wholeDesc}>{desc}</div>}
                                        >{desc}</Popover>
                                    </div>
                                    <Info type={materialType.text.type}
                                        item={item}
                                        record={this.props.record}
                                        removeLoading={removeLoading}
                                        onRemove={onRemove}
                                        onTagManagement={onTagManagement}
                                    />
                                </div>
                            </div>
                        })
                    }
                </div>
                {createTextVisible ? <CreateMaterial
                    {...this.props}
                    visible={createTextVisible}
                    category={category}
                    onOk={this.handleCreateMaterialOk}
                    onCancel={this.handleHideCreateMaterial}
                /> : null}
            </div>
        )
    }
}

