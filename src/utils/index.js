const { snakeCase, replace } = require('lodash');
const moment = require('moment');

const autoScroll = async (page) => {
    await page.evaluate(async () => {
        await new Promise((resolve, reject) => {
            let totalHeight = 0;
            let distance = 100;
            let timer = setInterval(() => {
                let scrollHeight = document.body.scrollHeight;
                window.scrollBy(0, distance);
                totalHeight += distance;

                if (totalHeight >= scrollHeight) {
                    clearInterval(timer);
                    resolve();
                }
            }, 100);
        });
    });
};

const transformMatchToId = (match) => {
    const { time, title } = match;
    return snakeCase(`${moment(time).valueOf()}_${moment(time).format("DD-MM-YYYY")}_${title}`);
};

const transformCurrentTimeToId = () => (
    snakeCase(`${moment().valueOf()}_${moment().format("DD-MM-YYYY")}`)
);

const transformRemoveHighlightText = (text) => {
    return replace(text, 'Highlights', '').trim();
};

module.exports = {
    autoScroll,
    transformMatchToId,
    transformRemoveHighlightText,
    transformCurrentTimeToId,
}
