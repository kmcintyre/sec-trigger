import urllib.parse
import requests
from bs4 import BeautifulSoup

from pymongo import MongoClient
uri = "mongodb://localhost:27017"
client = MongoClient(uri)

database = client["ticker"]
collection = database["tickers"]
results = collection.find({})

headers = {
    "User-Agent": "Sec Trigger Kevin McIntyre km@sec-trigger.com"
}
for f in results:
    company = f.get('company').replace(',','').replace('.','')
    cik = None
    exchange = None
    while cik is None and exchange is None and len(company) > 0:
        print (company)
        cik_link = "https://www.sec.gov/cgi-bin/cik_lookup?company={}".format(urllib.parse.quote_plus(company))        
        cik_request = requests.get(cik_link, headers=headers)
        cik_soup = BeautifulSoup(cik_request.text, "html.parser")
        anchors = cik_soup.select('table[summary] tr td a[href^="browse-edgar"]')
        print(len(anchors))
        for a in anchors:
            if cik is None and exchange is None:
                potential_cik = a.text
                browse_url = "https://www.sec.gov/edgar/browse/?CIK={}".format(potential_cik)
                print(browse_url)
                browse_request = requests.get(browse_url, headers=headers)
                print(browse_request.text)
                exit()
                #browse_soup = BeautifulSoup(browse_request.text, "html.parser")
                #tickers = browse_soup.select('h3 small small small span[id="ticker"]')
                #for t in tickers:
                #    ticker = t.text.split(" ")[0]
                #    if ticker == f.get('ticker'):
                #        cik = potential_cik
                #        exchange = t.text.split(" ")[-1]
        if cik is None and exchange is None:
            if len(company.split("  ")) > 1:
                company = ' '.join(company.split()[:-1])
            else:
                break
    print(company, cik, exchange)
    exit()
        #if ( len(anchors) > 0 ):
            #cik = a[0].text
            #print(cik)

        #    collection.find_one_and_update({'_id': f.get('_id')}, {"$set": { "cik" : cik}})
        #else:
        #    print(" No CIK found")
