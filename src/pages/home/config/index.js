const config = require(`./${HUZAN_ENV}.js`).default

export default Object.assign({
    apiHost: '',
    apiHostWx: ''
}, config)