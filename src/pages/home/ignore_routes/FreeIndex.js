import React from 'react'
import router from 'umi/router'
import { Button } from 'antd'
import VideoPreview from '../../../components/VideoPreview'
import styles from './FreeIndex.less'

export default class FreeIndex extends React.PureComponent {
    
    state = {
        momentVideoVisible: false
    }

    btnBlurPrintRedirect = () => {
        router.push('/platform/blueprint')
    }

    contactKF = () => {

    }

    render() {
        return <div className = {styles.FreeIndex}>
            <div>
                <p className={styles.redpacket}>
                    <p className={styles.name}>晒图红包</p>
                    <p className={styles.Desc}>店铺DSR神器</p>
                    <p className={styles.info}>实时对账 自动审核</p>
                    <p className={styles.info}>老客户维护 提升转化</p>
                    <p className={styles.info}>拉升店铺权重</p>
                    <Button type='primary' onClick={this.btnBlurPrintRedirect}>立即使用</Button>
                </p>
            </div>
            <div >
                <p className = {styles.friends}>
                    <p className={styles.name}>发朋友圈</p>
                    <p className={styles.Desc}>朋友圈既能定时又可群发 ，你get了嘛？</p>
                    <p className={styles.info}>指令群发朋友圈 自动延时评论</p>
                    <p className={styles.info}>实时查看朋友圈 即时回复评论</p>
                    <a onClick={() => { this.setState({ momentVideoVisible: true})}}>
                        观看视频
                        <img src={require('../assets/images/vedio.png')}  className={styles.vedioIcon}/>
                    </a>
                    <VideoPreview title="一键发圈视频" source="https://document.51zan.com/retail/video/2018-12-7/wx_moment.mov" width={900} height={450} visible={this.state.momentVideoVisible} onCancel={() => { this.setState({ momentVideoVisible: false})}}  />
                </p>   
            </div>
            <div >
                <p className = {styles.interact}>
                    <p className={styles.name}>朋友圈互动</p>
                    <p className={styles.Desc}>最适合电商的朋友圈玩法，一学即会！</p>
                    <p className={styles.info}>查看我的圈、好友的圈 朋友圈及时回评、点赞</p>
                    <p className={styles.info}>删除我发的圈、朋友、取消点赞</p>
                    <p className={styles.info}>朋友圈数据统计分析</p>
                    <a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzgwMDE5MDczOV80ODM3MjVfODAwMTkwNzM5XzJf" without rel="noopener noreferrer" target="_blank">
                        联系客服>>
                    </a>
                </p>   
            </div>
            <div >
                <p className = {styles.groupMass}>
                    <p className={styles.name}>群发</p>
                    <p className={styles.Desc}>最精准的群发利器，不容错过</p>
                    <p className={styles.info}>好友群发 标签群发 </p>
                    <p className={styles.info}>精准群发 群内群发 指令群发 </p>
                    <a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzgwMDE5MDczOV80ODM3MjVfODAwMTkwNzM5XzJf" without rel="noopener noreferrer" target="_blank">
                        联系客服>>
                    </a>
                </p>   
            </div>
            <div >
                <p className = {styles.qrcode}>
                    <p className={styles.name}>新码</p>
                    <p className={styles.Desc}>一码能加五十万人，还不快用！</p>
                    <p className={styles.info}>降低印刷成本 随机展示 实时统计</p>
                    <a href="http://wpa.b.qq.com/cgi/wpa.php?ln=1&key=XzgwMDE5MDczOV80ODM3MjVfODAwMTkwNzM5XzJf" without rel="noopener noreferrer" target="_blank">
                        联系客服>>
                    </a>
                </p>   
            </div>
        </div>
    }
}