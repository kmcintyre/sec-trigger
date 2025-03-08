import time
import requests
import feedparser
from bs4 import BeautifulSoup
from lxml import etree

old_accession_number = None
accession_number = None
reached_accession_number = False

try:
    with open('accession_number.txt', 'r') as file:
        content = file.read()
        old_accession_number = content.strip()
except Exception as e:
    print(e)

headers = {
    "User-Agent": "Sec Trigger Kevin McIntyre km@sec-trigger.com"
}

start = 0
count = 10
visited = set([])
def add_comma_after_first_space(text):
  space_index = text.find(" ")
  if space_index != -1:
    return text[:space_index] + "," + text[space_index:]
  else:
    return text

while not reached_accession_number :
    atom_link = "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&CIK=&type=&company=&dateb=&owner=include&start={}&count={}&output=atom".format(start, start + count)
    atom = requests.get(atom_link, headers=headers)
    d = feedparser.parse(atom.text)
    links = []
    for entry in d.entries:
        check_accession_number = entry.id.split('=')[-1]
        if accession_number is None:            
            with open("accession_number.txt", "w") as file:
                file.write(check_accession_number)            
                accession_number = check_accession_number
        if entry.category == "4":
            links.append(entry.link)        
        if old_accession_number == check_accession_number:
            reached_accession_number = True            
    for link in links:
        try:
            html = requests.get(link, headers=headers)
            soup = BeautifulSoup(html.text, "html.parser")
            anchors = soup.select("div.formDiv div table tr td a[href$='xml']:not([href*='xslF345X05'])")
            anchorLink = 'https://www.sec.gov' + soup.select("div.formDiv div table tr td a[href$='xml'][href*='xslF345X05']")[0]["href"]
            for anchor in anchors:
                visit = 'https://www.sec.gov' + anchor["href"]
                if visit not in visited:                
                    visited.add(visit)
                    #print(visit)
                    xml = requests.get(visit, headers=headers)
                    doc = etree.fromstring ( xml.text )
                    try:
                        symbol = doc.xpath("/ownershipDocument/issuer/issuerTradingSymbol")[0].text.split(' ')[0].split(',')[0]
                        issuerName = doc.xpath("/ownershipDocument/issuer/issuerName")[0].text
                        reportingOwnerName = doc.xpath("/ownershipDocument/reportingOwner/reportingOwnerId/rptOwnerName")[0].text
                        ownerName = add_comma_after_first_space(reportingOwnerName)
                        nonDerivativeTransactions = doc.xpath("/ownershipDocument/nonDerivativeTable/nonDerivativeTransaction")
                        totalPurchases = 0
                        stockTwit = ''
                        stockTwit += "${} {} form 4 ".format(symbol, ownerName)
                        purchases = []
                        for nonDerivativeTransaction in nonDerivativeTransactions:
                            transactionCode = nonDerivativeTransaction.xpath("transactionCoding/transactionCode")[0].text
                            transactionShares = nonDerivativeTransaction.xpath("transactionAmounts/transactionShares/value")[0].text
                            if transactionCode == "P" and transactionShares != "0":
                                purchases.append(nonDerivativeTransaction)                        
                                #print('https://www.sec.gov' + anchor["href"])
                                #print("${} {} form 4 {:50s} {:3s} {:10s} {:10s}".format(symbol, ownerName, transactionCode, transactionShares, transactionPrice))
                        if len(purchases) == 1:
                            transactionShares = purchases[0].xpath("transactionAmounts/transactionShares/value")[0].text
                            transactionPrice = purchases[0].xpath("transactionAmounts/transactionPricePerShare/value")[0].text
                            transactionDate = purchases[0].xpath("transactionDate/value")[0].text
                            date = transactionDate.split('-')[1] + '/' + transactionDate.split('-')[2]
                            totalAmount = float(transactionShares) * float(transactionPrice)
                            totalDollarAmount = "${:,.0f}".format(totalAmount)
                            stockTwit += "insider purchase {} shares at ${} on {} for {} total cost".format(transactionShares, transactionPrice, date, totalDollarAmount)
                            #print(visit)
                            print(stockTwit + ' ' + anchorLink)
                        elif len(purchases) > 1:
                            stockTwit += "insider purchases "
                            totalAmount = float(0)
                            for i, purchase in enumerate(purchases):
                                transactionShares = purchase.xpath("transactionAmounts/transactionShares/value")[0].text
                                transactionPrice = purchase.xpath("transactionAmounts/transactionPricePerShare/value")[0].text
                                transactionDate = purchase.xpath("transactionDate/value")[0].text
                                date = transactionDate.split('-')[1] + '/' + transactionDate.split('-')[2]
                                totalAmount += float(transactionShares) * float(transactionPrice)
                                if totalAmount > 0:
                                    totalDollarAmount = "${:,.0f}".format(totalAmount)
                                    stockTwit += "{} shares at ${} on {}".format(transactionShares, transactionPrice, date)
                                    if i < len(purchases) - 1:
                                        stockTwit += ", "                                   
                            #print(visit)
                            stockTwit += " for {} total cost".format(totalDollarAmount)
                            print(stockTwit + ' ' + anchorLink)
                    except Exception as e:
                        print(e)
                        #pass
                        #print('error https://www.sec.gov' + anchor["href"])
        except:
            print(atom_link + e)
    start += count
    time.sleep(1)
        