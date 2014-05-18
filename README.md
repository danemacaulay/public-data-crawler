public-data-crawler
===================

Crawl vast oceans of html and assemble csvs.

Install nodejs, phantomjs and casperjs

To crawl [Placer County Assessor](http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx)

```bash
casperjs --ignore-ssl-errors=true placer-crawler.js
```


To crawl [San Luis Obispo County Assessor](http://assessor.slocounty.ca.gov/pisa/Search.aspx)

```bash
casperjs san-luis-obispo-crawler.js
```


To create CSVs of the crawled data

```bash
node create-csv san-luis-obispo-data.json san-luis-obispo-data.csv
```
