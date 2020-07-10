---
title: "네이버에서 해외지수 수집하기(JSON 파일 크롤링)"
categories:
  - Post Formats
tags:
  - Python
  - Crawling
  - json
---

네이버의 해외지수 페이지는 과거 시세를 보여줄 때 각각 새로운 웹 페이지에서 데이터를 제공해줬는데, 해외 지수 페이지는 동일한 웹 페이지를 유지한 상태에서 데이터만 새로 불러와 표시해주고 있다. 따라서 이 같은 경우는 HTML이 아닌 JSON 크롤링 방식을 선택해야 한다.

**URL** 는   
https://finance.naver.com/world/worldDayListJson.nhn?symbol=SPI@SPX&fdtc=0&page=2 이다.
{: .notice--primary}    
symbol 다음에 지수 코드가 입력되고 page= 하고 페이지가 입력되는 형태이다.
Json은 다음과 같이 보인다.

```{.json}
[{"symb":"SPI@SPX","xymd":"20200624","open":3114.4,"high":3115.01,"low":3032.13,"clos":3050.33,"diff":-80.96,"rate":-2.59,"gvol":3203219700},{"symb":"SPI@SPX","xymd":"20200623","open":3138.7,"high":3154.9,"low":3127.12,"clos":3131.29,"diff":13.43,"rate":0.43,"gvol":2719245390},{"symb":"SPI@SPX","xymd":"20200622","open":3094.42,"high":3120.92,"low":3079.39,"clos":3117.86,"diff":20.12,"rate":0.65,"gvol":2559744790},{"symb":"SPI@SPX","xymd":"20200619","open":3140.29,"high":3155.53,"low":3083.11,"clos":3097.74,"diff":-17.6,"rate":-0.56,"gvol":4992776960},{"symb":"SPI@SPX","xymd":"20200618","open":3101.64,"high":3120.0,"low":3093.51,"clos":3115.34,"diff":1.85,"rate":0.06,"gvol":2399667780},{"symb":"SPI@SPX","xymd":"20200617","open":3136.13,"high":3141.16,"low":3108.03,"clos":3113.49,"diff":-11.25,"rate":-0.36,"gvol":2483191140},{"symb":"SPI@SPX","xymd":"20200616","open":3131.0,"high":3153.45,"low":3076.06,"clos":3124.74,"diff":58.15,"rate":1.9,"gvol":3286788790},{"symb":"SPI@SPX","xymd":"20200615","open":2993.76,"high":3079.76,"low":2965.66,"clos":3066.59,"diff":25.28,"rate":0.83,"gvol":3208913330},{"symb":"SPI@SPX","xymd":"20200612","open":3071.04,"high":3088.42,"low":2984.47,"clos":3041.31,"diff":39.21,"rate":1.31,"gvol":3385763020},{"symb":"SPI@SPX","xymd":"20200611","open":3123.53,"high":3123.53,"low":2999.49,"clos":3002.1,"diff":-188.04,"rate":-5.89,"gvol":4123277870}]

```
<br>
이후, 코드를 작성한다.

```python
import pandas as pd
from urllib.request import urlopen
import json

def date_format(d=''):    #날짜를 파이썬이 사용하는 실제 날짜 형식으로 변환
    if d!= '':
        this_date = pd.to_datetime(d).date()   
    else:
        this_date = pd.Timestamp.today().date()   #빈칸일 경우 오늘 날짜입력
    return (this_date)

def index_global(d, symbol,start_date='',end_date='',page=1):  #json 크롤링
    end_date = date_format(end_date)
    if start_date == '':
        start_date = end_date - pd.DateOffset(months=1)
    start_date = date_format(start_date)

    url='https://finance.naver.com/world/worldDayListJson.nhn?symbol='+symbol+'&fdtc=0&page=' +str(page)
    raw = urlopen(url)
    data = json.load(raw)

    if len(data)>0:        #페이지네이션
        for n in range(len(data)):
            date = pd.to_datetime(data[n]['xymd']).date()
            if date <= end_date and date >= start_date:
                price = float(data[n]['clos'])
                d[date]=price
            elif date <start_date:
                return(d)
    if len(data) == 10:
        page+=1
        index_global(d,symbol,start_date,end_date,page)
    return (d)

indices = {
    'SPI@SPX' : 'S&P 500',
    'NAS@NDX' : 'Nasdaq 100',
    'NII@NI225' : 'Nikkei 225'
}


historical_indices = dict()
start_date = '2020-07-01'
end_date = '2019-03-01'   
for key, value in indices.items() :
    s = dict()
    s = index_global(s, key, start_date)  #마지막 날짜를 입력해주지
    #않았으므로 현재까지 날짜입력
    historical_indices[value] = s
prices_df = pd.DataFrame(historical_indices)
prices_df

```
<br>
출력 :
![image](https://user-images.githubusercontent.com/56333934/87120030-76bc9f00-c2ba-11ea-8cba-5bbdc7ac1dad.png)
