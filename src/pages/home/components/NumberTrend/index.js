import {PureComponent} from 'react'
import PropTypes from 'prop-types'
import Trend from "../Trend"
import styles from "./index.less"
import { number, amount } from "../../../../utils/display"

export default class NumberTrend extends PureComponent {

    static propTypes = {
        title: PropTypes.string,
        hasDivider: PropTypes.bool,
        hasPrev: PropTypes.bool,
        duringText: PropTypes.string.isRequired,
        isStaticticsing: PropTypes.bool
    }

    static defaultProps = {
        hasPrev: true,
        isJine: false,
        isStaticticsing: false
    }

    getTotalText = (total, isJine) => {
        const { onTotalFormatter } = this.props
        if(onTotalFormatter){
            return onTotalFormatter(total)
        } else if(isJine) {
            const text = amount(total, amount.format.default, amount.unit.Fen)
            return <span><span>{text.substring(0, text.length - 3)}</span><span className={styles.jinefen}>{amount(total, '.00', amount.unit.Fen)}</span></span>
        }
        else{
            return number(total)
        }
    }

    getDiffText = (diff) => {
        const { onDiffFormatter } = this.props

        if(onDiffFormatter){
            return onDiffFormatter(diff)
        }
        else{
            return number(diff)
        }
    }

    render(){
        const { 
            title, 
            data, 
            hasDivider,
            hasPrev,
            duringText,
            isStaticticsing,
            isJine
        } = this.props

        const {
            total,
            prev,
            diff
            // dayBeforeYesterday
        } = data

        const totalNumber = total || 0

        const sub = (diff || diff ===0) ? diff:  (totalNumber - prev)

        const isShowDivider = hasDivider !== false

        return (
            <div className={styles.box}>
                <div className={styles.item + ' ' + (hasPrev ? '': styles.noPrev)}>
                    {title && <div className={styles.title}>{title}</div>}
                    {
                        (totalNumber || totalNumber === 0) && !isStaticticsing &&
                        <div className={styles.today}>{this.getTotalText(totalNumber, isJine)}</div>
                    }
                    { 
                        hasPrev && !isStaticticsing &&
                        <Trend 
                            flag={ sub >= 0 ? "up": "down" } 
                            title={'较前一'+ duringText}
                        >
                            <span className={styles.diff} >{this.getDiffText(Math.abs(sub))}</span>
                        </Trend>
                    }
                    {   isStaticticsing && <div className={styles.todayStaticticsing}>--</div>}
                    {   isStaticticsing && <span className={styles.staticticsing}>统计中...</span>}
                </div>
                {
                    isShowDivider && 
                    <div className={styles.divider}></div>
                }
            </div>
        )
    }
}