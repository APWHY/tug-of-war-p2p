// time.js -- helper functions for time calculations around the starting and finishing of lobbies

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
export function startTimer(to_time, on_finish) {
    console.log('string date:', to_time)
    // Set the date we're counting down to
    let countDownDate = new Date(parseInt(to_time)).getTime();
    console.log("recieved date:", countDownDate)
    // Update the count down every 1 second





    let x = setInterval(() => {

        // Get today's date and time
        let now = new Date().getTime();

        // Find the distance between now and the count down date
        let distance = countDownDate - now;
        console.log("distance is:", distance)
        let seconds = Math.ceil((distance / 1000));

        // Display the result in the element with id="demo"
        document.getElementById("timer").innerHTML = seconds;

        // If the count down is finished, write some text
        if (distance < 0) {
            clearInterval(x);
            document.getElementById("timer").innerHTML = "0";
            if (on_finish) on_finish();
        }

    }, 1000);

    return x;
}

// stop a timer when given the interval looping it
export function stopTimer(interval) {
    if (interval === undefined) return;
    clearInterval(interval);
    document.getElementById("timer").innerHTML = "0";
}