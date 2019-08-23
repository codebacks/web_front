/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/19
 */
import {useEffect} from 'react'

const useLifecycles = (mount, unmount) => {
    useEffect(() => {
        if (mount) {
            mount()
        }
        return () => {
            if (unmount) {
                unmount()
            }
        }
    }, [mount, unmount])
}

export default useLifecycles
