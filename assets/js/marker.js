import { MessageType, EMPTY_COUNT } from './message.js'

class Marker {
    constructor(elementId, handleStop) {
        this.elem = document.getElementById(elementId);
        this.px = 50;
        this.target = 50;
        this.speed = 0.05; // how fast the marker moves
        this.decay = 0.97; // the rate at which the threshold will decay
        this.threshold = 150; // initial required margin of victory
        this.count = { ...EMPTY_COUNT }
        this.running = false;
        this.startAnimation = this.startAnimation.bind(this);
        this.animateMarker = this.animateMarker.bind(this);
        this.updateTarget = this.updateTarget.bind(this)
        this.updateThreshold = this.updateThreshold.bind(this)
        this.forceEnd = this.forceEnd.bind(this)
        this.handleStop = handleStop

    }

    startAnimation() {
        console.log("START")
        this.running = true;
        this.animationInterval = setInterval(this.animateMarker, 10);
        this.thresholdInterval = setInterval(this.updateThreshold, 100);
    }

    animateMarker() {
        this.px = this.px + this.speed * (this.target - this.px);
        if (this.px > 100) this.px = 100;
        if (this.px < 0) this.px = 0;
        this.elem.style.left = `calc( ${this.px}% - 10px)`;
        if (this.px === 100 || this.px === 0) {
            console.log(this.handleStop)
            this.handleStop()
        }
    }

    updateTarget() {

        let delta = this.count[MessageType.CLICK_RIGHT] - this.count[MessageType.CLICK_LEFT]
        if (this.threshold === 0) {
            this.target = 50 + delta * 1000; // any big number will do since this number is supposed to approach infinity
            return;
        }
        this.target = 50 + (delta / this.threshold) * 50.
    }

    updateThreshold() {
        this.threshold = Math.floor(this.threshold * this.decay);
        this.updateTarget();
    }

    forceEnd() {
        clearInterval(this.animationInterval);
        clearInterval(this.thresholdInterval);
        console.log("STOP")
        this.running = false;

    }
}

export default Marker;