export const U = (function () {
    const _api = {};

    _api.isEmptyStr = (s) => {
        return s === undefined || s === null || String(s) === '';
    };

    _api.isNotEmptyStr = (s) => {
        return s !== undefined && s !== null && String(s) !== '';
    };

    _api.toLocaleDateTimeStr = (date) => {
        let d = date !== undefined ? new Date(date) : new Date();
        return d.toLocaleString('sv', { timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, hour12: false });
    };

    _api.millisToTime = (duration) => {
        //var milliseconds = parseInt((duration%1000) / 100)
        let seconds = parseInt((duration / 1000) % 60);
        let minutes = parseInt((duration / (1000 * 60)) % 60);
        let hours = parseInt((duration / (1000 * 60 * 60)) % 24);

        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;

        return hours + ':' + minutes + ':' + seconds; // + "." + milliseconds;
    };

    return _api;
})();