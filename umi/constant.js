/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/9/6
 */

const path = require('path')
const cwd = process.cwd()

module.exports = {
    iconsPath: path.join(cwd, './src/assets/new_icons'),
    categoryIconsPath: path.join(cwd, './src/assets/category_icons'),
    fontIconsPath: path.join(cwd, './src/assets/font_icons'),
    face: path.join(cwd, './src/components/Face/images/face'),
    emoji: path.join(cwd, './src/components/Face/images/emoji'),
}
