// time.js -- helper functions for time calculations around the starting and finishing of lobbies

// difference between two dateTime objects in seconds
export function secondsDiff(start, end) {
    return (end - start) / 1000
}

// add x number of seconds to current time
export function addSeconds(inc_amt) {
    let dt = new Date()
    return dt.setTime(dt.getTime() + inc_amt * 1000)
}