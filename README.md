public-data-crawler
===================

#Crawl vast oceans of html and assemble csvs.

##Install nodejs, phantomjs and casperjs

***

###To crawl [Placer County Assessor](http://www.placer.ca.gov/Departments/Assessor/Assessment%20Inquiry.aspx)


```bash
casperjs --ignore-ssl-errors=true placer-crawler.js
```
\* Requires data is available in a JSON array called placer-data.json. That data will be updated with information from the site. See [Sample input data](#Sample input data) \*

* * *

###To crawl [San Luis Obispo County Assessor](http://assessor.slocounty.ca.gov/pisa/Search.aspx)

```bash
casperjs san-luis-obispo-crawler.js
```
\* Requires data is available in a JSON array called san-luis-obispo-crawler.json. That data will be updated with information from the site. See [Sample input data](#Sample input data) \*

* * *

###To create CSVs of the crawled data

```bash
node create-csv san-luis-obispo-data.json san-luis-obispo-data.csv
```

***

###Sample input data

```json
[{"id": "123456789"},{"id": "123456790"}]
```
