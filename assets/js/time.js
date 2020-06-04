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

export function startTimer(length, on_finish) {
    console.log('ping');

    let timerBgs = document.getElementsByClassName('timer-bg');
    let timers = document.getElementsByClassName('timer-val');
    let timerSlider = document.getElementById('timer-top');
    let finish = addSeconds(length);

    [...timerBgs].forEach(bgDiv => {
        bgDiv.style.opacity = 1;
        bgDiv.style.pointerEvents = 'auto'
    })

    function step() {
        let timeLeft = secondsDiff(new Date(), finish);
        if (timeLeft < 0.3) {
            [...timerBgs].forEach(bgDiv => {
                bgDiv.style.opacity = 0;
            })
        }
        if (timeLeft > 0) {
            [...timers].forEach((timer) => {
                timer.innerHTML = Math.floor(timeLeft);
            })
            timerSlider.style.height = `${100 * (1 - (timeLeft / length))}%`
            window.requestAnimationFrame(step)
        } else {
            if (on_finish) on_finish();
            [...timerBgs].forEach(bgDiv => {
                bgDiv.style.pointerEvents = 'none'
            })
        }
    }
    window.requestAnimationFrame(step)
}




// stop a timer when given the interval looping it
export function stopTimer(interval) {
    if (interval === undefined) return;
    clearInterval(interval);
    document.getElementById("timer").innerHTML = "0";
}