/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/8/22
 */
const unmount = Symbol('leo_unmount')

const safeSetStateDecorator = () => {

    return (NewComponent) => {
        class safeSetStateEnhance extends NewComponent {
            componentWillUnmount(...arg){
                if(super.componentWillUnmount){
                    super.componentWillUnmount(...arg)
                }
                this[unmount] = true
            }
        }

        function safeSetState(...arg) {
            if(!this[unmount]) {
                safeSetState.originalSetState.call(this, ...arg)
            }
        }

        safeSetState.originalSetState = safeSetStateEnhance.prototype.setState

        safeSetStateEnhance.prototype.setState = safeSetState

        return safeSetStateEnhance
    }
}

export default safeSetStateDecorator