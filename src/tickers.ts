import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import { ITicker, Ticker } from '../lib/models/ticker';
import { connectToMongoDB } from '../lib/db';

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

puppeteer
    .launch({ headless: false, defaultViewport: null, args: ['--start-maximized', '--no-sandbox'] })
    .then(async browser => {

        await connectToMongoDB();

        const [page] = await browser.pages();
        await page.goto('https://stockanalysis.com/stocks/')
        let alreadyHas = true;
        const tickers: ITicker[] = []
        while (alreadyHas) {
            const trs = await page.$$('table.symbol-table tbody tr');
            trs.forEach(async tr => {
                const tds = await tr.$$("td");
                const ticker = await tds[0].evaluate(td => td.textContent);
                const company = await tds[1].evaluate(td => td.textContent);
                const industry = await tds[2].evaluate(td => td.textContent);
                if (tickers.find(t => t.ticker === ticker)) {
                    alreadyHas = false;
                } else if (ticker && company && industry) {
                    tickers.push({ ticker, company, industry });
                }
                console.log(ticker);
            })
            const spans = await page.$$('span');
            spans.forEach(async span => {
                const text = await span.evaluate(span => span.textContent);
                if (text === 'Next') {
                    await span.click();
                }
            })
        }
        for (const ticker of tickers) {
            console.log(ticker.ticker, ticker.company, ticker.industry);            
            const existingTicker = await Ticker.findOne({ ticker: ticker.ticker });
            if (existingTicker === null) {
                const newTicker = new Ticker(ticker);
                await newTicker.save();                
            }
        }
        await page.close();
        await browser.close();
    }).catch(err => {
        console.log(err);
    })