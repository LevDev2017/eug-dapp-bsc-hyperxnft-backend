
const getTimeGap = (now, past) => {
    var span = now.getTime() - past.getTime();
    if (span < 0) {
        return "Time Error";
    }
    span /= 1000;
    if (span < 60) {
        return `${Math.floor(span)} seconds ago`;
    }
    span /= 60;
    if (span < 60) {
        return `${Math.floor(span)} minutes ago`;
    }
    span /= 60;
    if (span < 24) {
        return `${Math.floor(span)} hours ago`;
    }

    span /= 24;
    if (span < 30) {
        return `${Math.floor(span)} days ago`;
    }

    span /= 30;
    if (span < 12) {
        return `${Math.floor(span)} months ago`;
    }

    span /= 12;

    return `${Math.floor(span)} years ago`;
}

const getTimeGapSeconds = (now, past) => {
    var span = now.getTime() - past.getTime();
    span /= 1000;

    return span;
}

module.exports = { getTimeGap, getTimeGapSeconds };
