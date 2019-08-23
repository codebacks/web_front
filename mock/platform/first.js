module.exports = {
    'GET /api/first_bindings/47/graphicals': function(req, res, next) {
        setTimeout(() => {
            const data = [{
                date: "2018-12-1", 
                view_count: "6", 
                user_count: "6", 
                bind_count: "0"
            }, {
                date: "2018-12-13", 
                view_count: "6", 
                user_count: "6", 
                bind_count: "0"
            }, {
                date: "2018-12-18", 
                view_count: "6", 
                user_count: "6", 
                bind_count: "0"
            }]
            res.json({
                data: data,
            })
        }, 500)
    },
}