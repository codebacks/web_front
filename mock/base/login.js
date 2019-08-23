module.exports = {
    'post /base_login': function (req, res, next) {
        setTimeout(() => {
            res.json({
                data: {
                    data: {
                        accessToken: 'testToken'
                    }
                }
            })
        }, 500)
    }
}