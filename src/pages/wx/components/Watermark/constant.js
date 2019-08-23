/**
 * 文件说明:
 * ----------------------------------------
 * 创建用户: leo
 * 创建日期 2018/11/8
 */
const qrCodeUrl = 'https://public.51zan.com/1/7420bee6e522becd6502a7c1d1a0d05b.png'

export default {
    fonts: ["宋体", "黑体", "楷体", "微软雅黑", "arial", "aldhabi", "andalus", "angsana new", "angsanaupc", "aparajita", "arabic typesetting", "batang", "browallia new", "browalliaupc", "calibri", "cambria", "candara", "comic sans ms", "consolas", "constantia", "corbel", "cordia new", "cordiaupc", "courier new", "courier", "daunpenh", "david", "dfkai-sb", "dilleniaupc", "dokchampa", "ebrima", "estrangelo edessa", "eucrosiaupc", "euphemia", "fangsong", "fixedsys", "franklin gothic medium", "frankruehl", "freesiaupc", "gabriola", "gadugi", "gautami", "georgia", "gisha", "gulim", "impact", "irisupc", "iskoola pota", "jasmineupc", "kaiti", "kalinga", "kartika", "khmer ui", "kodchiangupc", "kokila", "lao ui", "latha", "leelawadee", "levenim mt", "lilyupc", "lucida console", "lucida sans unicode", "malgun gothic", "mangal", "meiryo", "microsoft himalaya", "microsoft jhenghei", "microsoft new tai lue", "microsoft phagspa", "microsoft sans serif", "microsoft tai le", "microsoft uighur", "microsoft yahei", "microsoft yi baiti", "mingliu-extb", "mingliu", "miriam fixed", "miriam", "mongolian baiti", "moolboran", "ms gothic", "ms mincho", "ms sans serif", "ms serif", "mv boli", "myanmar text", "narkisim", "nirmala ui", "nyala", "palatino linotype", "plantagenet cherokee", "raavi", "rod", "sakkal majalla", "segoe print", "segoe script", "segoe ui symbol", "segoe ui", "shonar bangla", "shruti", "simhei", "simplified arabic fixed", "simplified arabic", "simsun-extb", "simsun", "small fonts", "sylfaen", "symbol", "system", "tahoma", "terminal", "times new roman", "traditional arabic", "trebuchet ms", "tunga", "urdu typesetting", "utsaah", "vani", "verdana", "vijaya", "vrinda", "webdings", "wingdings"],
    previewUrl: 'https://public.51zan.com/1/8d44e1a98c520de29f49c878f4709719.png',
    previewWidth: 375,
    qrCodeWidth: 88,
    qrCodeUrl,
    textWatermark: {
        checked: true,
        mode: 2,
        text: '',
        dissolve: 100,
        fontsize: 400,
        font: '微软雅黑',
        fill: '#FFFFFF',
        gravity: 'SouthEast',
        dx: 14,
        dy: 14,
    },
    imageWatermark: {
        checked: true,
        mode: 1,
        image: '',
        dissolve: 100,
        gravity: 'SouthEast',
        dx: 14,
        dy: 52,
    },
}