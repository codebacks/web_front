/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2019/4/19
 */

import {useState, useCallback} from 'react'

const useToggle = (state) => {
    const [value, setValue] = useState(state)

    const toggle = useCallback(
        (nextValue) => {
            if (typeof nextValue !== 'undefined') {
                setValue(!!nextValue)
                return
            }

            setValue((value) => !value)
        },
        [setValue],
    )

    return [value, toggle]
}

export default useToggle
