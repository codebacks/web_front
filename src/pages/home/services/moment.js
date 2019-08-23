import { momentsStatByDate } from '../../data/services/moments/moments'
import moment from 'moment'

function getDuring(dateTime, days){
    var date = dateTime

    var dates = []

    for ( var i = days; i > 0; i--) {
        dates.push(moment(date).subtract(i, 'days'))
    }

    return {
        begin: dates[0],
        end: dates[dates.length - 1],
        dates: dates
    }
}

export async function getWeekStatistics(){
    const yesterday = moment().subtract(1).toDate()
    var during = getDuring(yesterday, 7)

    const {data, error} = await momentsStatByDate({start_time: during.begin.format('YYYY-MM-DD 00:00:00'), end_time: during.end.format('YYYY-MM-DD 23:59:59')})

    return new Promise((resovle, reject) => {
        if(!error){
            const result = during.dates.map(d => {
                const dateText = d.format('YYYY-MM-DD')
                const dateData = data.find(item => item.date === dateText)
                return {
                    dateText: dateText,
                    date: d,
                    data: {
                        moments: dateData? dateData.moments: 0,
                        likes: dateData ? dateData.likes: 0,
                        comments: dateData ? dateData.comments: 0
                    }
                }
            })
            resovle(result)
        }else{
            reject({error})
        }
    })
}