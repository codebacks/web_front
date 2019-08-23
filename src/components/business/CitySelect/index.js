import React from 'react'
import { Row, Col, Card, Button, Tree, Modal } from 'antd'
import data, { removeData, getData, getCity, getFriendlyCitys, exclude, filterData, getAreaName, excludeCitysCodes, getAllkey } from './data'
import { deepCopy } from './copy'

const { TreeNode } = Tree

export default class Index extends React.PureComponent {

    state = {
        index: 1,
        waitData: [],
        firstData: [],
        resultSelectedKeys: [],
        selectedData: [],
        waitSelectedKeys: [],
        selectedKeys: [],
        leftCacheSelect: [],
        rightCacheSelect: []
    }

    componentDidMount() {

        const { excludeCitys, selectedKeys } = this.props

        const citys = deepCopy(data)
        if (excludeCitys && excludeCitys.length > 0) {
            let ks = []
            getAllkey(ks, excludeCitys)
            let waitData = excludeCitysCodes(ks)
            this.setState({
                waitData: waitData,
                firstData: waitData
            })
        } else {
            this.setState({
                waitData: deepCopy(citys),
                firstData: deepCopy(citys)
            })
        }

        if (selectedKeys && selectedKeys.length > 0) {
            this.getInitcitys(selectedKeys)
        }
    }

    componentWillUnmount() {
        this.leftCacheSelectAdd = []
        this.lselectedKeys = []
        this.lleftCacheSelect = []
        this.lrightCacheSelect = []
    }

    renderTreeNodes = (data) => {
        return data.map((item) => {
            if (item.child) {
                return (
                    <TreeNode title={item.name} key={item.code} dataRef={item}>
                        {this.renderTreeNodes(item.child)}
                    </TreeNode>
                )
            }
            return <TreeNode title={item.name} key={item.code} dataRef={item} />
        })
    }

    removeWaitNodes = (checkedKeys) => {
        let waitData = excludeCitysCodes(checkedKeys, this.state.firstData.length && this.state.firstData)
        this.setState({
            waitData,
            index: this.state.index + 1
        })
    }

    getSelectedSubtractNodes = () => {
        let t = filterData(this.selectedKeys, this.state.selectedData)
        this.setState({
            selectedData: t.soucre
        })
    }
    getInitcitys = (ks) => {
        const keys = this.state.resultSelectedKeys.slice()
        keys.push(...ks)

        this.setState({
            resultSelectedKeys: keys,
            leftCacheSelect: this.leftCacheSelect
        }, () => {
            let waitData = excludeCitysCodes(this.state.resultSelectedKeys,this.state.firstData.length && this.state.firstData)
            let t = getAreaName(this.state.resultSelectedKeys)
            this.setState({
                waitData,
                index: this.state.index + 1,
                selectedData: t.soucre
            })
        })

    }
    getSelectedNodes = () => {
        this.setState({
            selectedData: getData(this.state.firstData, this.state.resultSelectedKeys)
        })
    }
    leftCacheSelectAdd = []
    onCheck = (checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) => {
        this.leftCacheSelectAdd = [...checkedKeys, ...halfCheckedKeys]
        this.setState({
            waitSelectedKeys: checkedKeys,
        })
    }
    selectedKeys = []
    onSelectedCheck = (checkedKeys, { checked, checkedNodes, node, event, halfCheckedKeys }) => {
        this.selectedKeys = [...checkedKeys]
        this.setState({
            selectedKeys: [...checkedKeys, ...halfCheckedKeys]
        })
    }

    onSelectNode = (ks) => {
        const keys = this.state.resultSelectedKeys
        keys.push(...ks)
        this.setState({
            resultSelectedKeys: keys,
            // leftCacheSelect: this.leftCacheSelect
        }, () => {
            this.removeWaitNodes(this.state.resultSelectedKeys)
            this.getSelectedNodes()
        })
    }
    cacheSelect = []
    onAdd = () => {
        const keys = this.cacheSelect.length ? this.cacheSelect.slice() : this.state.resultSelectedKeys.slice()
        console.log(this.leftCacheSelectAdd,'this.leftCacheSelectAdd')
        keys.push(...this.leftCacheSelectAdd)
        this.cacheSelect = keys
        this.setState({
            resultSelectedKeys: [...this.state.resultSelectedKeys, ...this.state.waitSelectedKeys],
            leftCacheSelect: this.leftCacheSelect
        }, () => {
            this.leftCacheSelectAdd = []
            
            this.removeWaitNodes(this.state.resultSelectedKeys)
            this.setState({
                selectedKeys: [],
                waitSelectedKeys: [],
                rightCacheSelect: this.rightCacheSelect,
                selectedData: getAreaName(keys,this.state.firstData.length && this.state.firstData).soucre
            })
        })
    }
    onSubtract = () => {
        let keys = this.state.resultSelectedKeys
        keys = keys.filter(k => this.selectedKeys.indexOf(k) === -1)
        let cacheSelect = this.cacheSelect.slice()
        this.cacheSelect = cacheSelect.filter(item => {
            return this.selectedKeys.indexOf(item) === -1
        })
        this.setState({
            rightCacheSelect: this.rightCacheSelect,
            leftCacheSelect: this.leftCacheSelect,
            resultSelectedKeys: keys,
            selectedKeys: [],
            waitSelectedKeys: []
        }, () => {
            this.removeWaitNodes(this.state.resultSelectedKeys)
            this.getSelectedSubtractNodes()
        })
    }
    getArea(data) {
        let arr = data.slice()
        let area = []
        for (let i = 0; i < arr.length; i++) {
            if (Array.isArray(arr[i].child)) {
                area = area.concat(arr[i].child)
            }
        }
        area.forEach(i => {
            if (i.child) {
                arr = arr.concat(i.child)
            }
        })

        return arr

    }
    onOkHandler = () => {
        const { onOk } = this.props
        let keys = this.state.resultSelectedKeys

        let cities = this.getArea(this.state.selectedData)
        keys = keys.map(key => getCity(key, this.state.firstData)).filter(c => c && c.cancheck !== false).map(c => c.code)
        // const citys = this.state.resultSelectedKeys.map(key => getCity(key))
        const friendlyCitys = getFriendlyCitys(keys)


        const data = { citys: cities, friendlyCitys: friendlyCitys }

        onOk && onOk(data, this.props.raw)
    }

    onCancelHandler = () => {
        const { onCancel } = this.props

        onCancel && onCancel()
    }
    leftCacheSelect = [];
    rightCacheSelect = [];
    onExpand = (keys, o) => {
        this.leftCacheSelect = keys
    }
    onExpandRight = (keys) => {
        this.rightCacheSelect = keys
    }

    static defaultProps = {
        title: '选择可配送区域'
    }


    render() {
        const {
            visiable,
            title
        } = this.props

        return (
            <Modal
                title={title}
                visible={visiable}
                width={750}
                onOk={this.onOkHandler}
                onCancel={this.onCancelHandler}
            >
                <Row>
                    <Col span={10}>
                        <Card title="可选省、市、区" bodyStyle={{ height: '600px', overflow: 'auto' }}>
                            <Tree
                                key={'s' + this.state.index}
                                defaultExpandParent={false}
                                defaultExpandedKeys={this.state.leftCacheSelect}
                                checkStrictly={false}
                                checkable
                                onCheck={this.onCheck}
                                onExpand={this.onExpand}
                            >
                                {this.renderTreeNodes(this.state.waitData)}
                            </Tree>
                        </Card>
                    </Col>

                    <Col span={4} style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                        <div style={{ paddingTop: '300px' }}>
                            <Button disabled={this.state.waitSelectedKeys.length === 0} onClick={this.onAdd}>
                                添加 &gt;&gt;
                            </Button>

                            <Button disabled={this.state.selectedKeys.length === 0} onClick={this.onSubtract} className="hz-margin-large-top">
                                &lt;&lt; 移除
                            </Button>
                        </div>
                    </Col>
                    <Col span={10}>
                        <Card title="已选省、市、区" bodyStyle={{ height: '600px', overflow: 'auto' }}>
                            <Tree
                                key={'s' + this.state.index}
                                defaultExpandParent={false}
                                defaultExpandedKeys={this.state.rightCacheSelect}
                                checkStrictly={false}
                                checkable
                                onCheck={this.onSelectedCheck}
                                onExpand={this.onExpandRight}
                            >
                                {this.renderTreeNodes(this.state.selectedData)}
                            </Tree>
                        </Card>
                    </Col>
                </Row>
            </Modal>
        )
    }
}