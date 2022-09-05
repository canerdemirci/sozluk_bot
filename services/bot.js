const puppeteer = require('puppeteer');

const searchBoxSelector = '#tdk-srch-input';
const searchButtonSelector = '#tdk-search-btn';
const meansSectionSelector = '#anlamlar-gts0';
const meansElementsSelector = meansSectionSelector + ' > p';

async function getResult(word) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    await page.goto('https://sozluk.gov.tr/', { waitUntil: 'networkidle0' });
    await page.waitForSelector(searchBoxSelector);
    await page.type(searchBoxSelector, word);
    await page.click(searchButtonSelector);
    
    try {
        await page.waitForNetworkIdle({idleTime: 'networkidle0'});
        await page.waitForSelector(meansSectionSelector, { timeout: 3000 });
    } catch (e) {
        await browser.close();
        return null;
    }

    const means = await page.$$eval(meansElementsSelector, el => el.map(e => {
        const kinds = e.querySelector('i:nth-child(2)')?.innerText.split(',').map(k => k.trim());
        const mean = e?.childNodes[2]?.nodeValue ?? e?.innerText;
        const sampleSentence = e.querySelector('i:nth-child(4)')?.innerText;
        const sampleSentenceAuthor = e.querySelector('b:nth-child(5)')?.innerText;

        return {
            kinds,
            mean,
            sampleSentence,
            sampleSentenceAuthor
        };
    }));

    if (!means.kinds) {
        const kinds = await page.$eval('#ozellikler-gts0 > i', el => el?.innerText.split(',').map(k => k.trim()));
        means[0].kinds = kinds;
    }
    
    await browser.close();

    return {word, results: [...means]};
}

module.exports = {
    getResult
};