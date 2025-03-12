import puppeteer from 'puppeteer-extra'
import AdblockerPlugin from 'puppeteer-extra-plugin-adblocker'
import StealthPlugin from 'puppeteer-extra-plugin-stealth'

import querystring from 'querystring';

import { ITicker, Ticker } from '../lib/models/ticker';
import { connectToMongoDB } from '../lib/db';
import { exit } from 'process';

puppeteer.use(AdblockerPlugin()).use(StealthPlugin())

puppeteer
    .launch({ headless: false, defaultViewport: null, args: ['--start-maximized', '--no-sandbox'] })
    .then(async browser => {

        const [page] = await browser.pages();

        await connectToMongoDB();
    
        const tickers = await Ticker.find({ exchange: null });
        for (let ticker of tickers) {
            let cik = null;
            let exchange = null;
            let company = ticker.company.replace(/,/g, '').replace(/\./g, '');
            while ( cik === null && exchange === null && company.length > 0) {
                const url = "https://www.sec.gov/cgi-bin/cik_lookup?" + querystring.stringify({ company: company})
                console.log(url)
                await Promise.all([
                    page.waitForNavigation(),
                    page.goto(url)
                ]);                                
                const anchors = await page.$$('table[summary] tr td a[href^="browse-edgar"]')
                const potential_ciks = [];
                for (let anchor of anchors) {
                    const potential_cik = await anchor.evaluate(a => a.textContent);
                    potential_ciks.push(potential_cik);
                }
                console.log('potential ciks:', potential_ciks.length)
                loop1:
                    for (let potential_cik of potential_ciks) {
                        await Promise.all([
                            page.waitForNavigation(),
                            page.goto('https://www.sec.gov/edgar/browse/?CIK=' + potential_cik),
                        ]);
                        const spans = await page.$$('h3 small small small span[id="ticker"]')                    
                        if ( spans.length === 1) {
                            const ticker_and_exchange = await spans[0].evaluate(span => span.textContent);
                            console.log('both:', ticker_and_exchange)
                            if ( ticker_and_exchange && ticker_and_exchange.split(' on ').length > 1 ) {
                                const potential_tickers = ticker_and_exchange?.split(' on ')[0].split(',')
                                const exchange_and_stuff = ticker_and_exchange?.split(' on ')[1]
                                const potential_exchange = exchange_and_stuff.split(',')[0]
                                if ( exchange_and_stuff.split(',').length > 1 ) {
                                    const [, ...extra_tickers] = exchange_and_stuff.split(',');
                                    extra_tickers.forEach(et => {
                                        potential_tickers.push(et)
                                    })

                                }
                                console.log('next:', potential_tickers, potential_exchange)
                                if ( potential_tickers && potential_exchange ) {
                                    for (let potential_ticker of potential_tickers) {
                                        const check_ticker = potential_ticker.trim()
                                        console.log('check:', check_ticker, ticker.ticker)
                                        if (check_ticker === ticker.ticker) {
                                            cik = potential_cik;
                                            exchange = potential_exchange;                                                        
                                            console.log('Found:', ticker.ticker, 'CIK:', cik, 'Exchange:', exchange)
                                            await Ticker.updateOne({ ticker: ticker.ticker }, { cik: cik, exchange: exchange });
                                            break loop1;
                                        }                                
                                    }
                                }
                            }                   
                        }
                    }
                if ( cik === null && exchange === null) {
                    if ( company.split(' ').length > 1) {
                        company = company.substring(0, company.lastIndexOf(' '))
                    } else {
                        company = ''
                    }                    
                }
            } 
        }
    }).catch(err => {
        console.log(err);
    })