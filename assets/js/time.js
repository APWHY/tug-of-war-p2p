// time.js -- helper functions for time calculations around the starting and finishing of lobbies
export const START_TIMER_LENGTH = 5; // seconds
// difference between two dateTime objects in seconds
export function secondsDiff(start, end) {
    return (end - start) / 1000
}

// add x number of seconds to current time
export function addSeconds(inc_amt) {
    let dt = new Date();
    return dt.setTime(dt.getTime() + inc_amt * 1000);
}


// start a countdown timer to inputted time (looks for an element with id="timer") and runs a handler when it finishes
export function startTimer(length, on_finish) {
    console.log("start timer")
    let timer = length - 1 // we need to count from length - 1 because of fencepost
    document.getElementById("timer").innerHTML = timer;
    let x = setInterval(() => {
        if (timer === 0) {
            clearInterval(x);
            if (on_finish) on_finish();
            return;
        }
        timer--;
        document.getElementById("timer").innerHTML = timer;


    }, 1000);

    return x;
}

// stop a timer when given the interval looping it
export function stopTimer(interval) {
    if (interval === undefined) return;
    clearInterval(interval);
    document.getElementById("timer").innerHTML = "0";
}