---
title: "네이버에서 KOSPI200 지수 수집하기(HTML 페이지 크롤링)"
categories:
  - Post Formats
tags:
  - Python
  - Crawling
---

 # 빅데이터의 시작 뷰티풀 수프
 Beautiful Soup는 인터넷상에서 데이터를 수집할 때 유용하게 사용되는 파이썬 패키지이다.
 이번 포스트에서는 네이버와 다음에서 과거 주가 데이터를 수집해서 그래프를 그려보고 회귀분석까지 해보려고 한다.   <small>Reference : 파이썬을 활용한 금융공학 레시피   

 네이버에서 KOSPI200 지수 수집하기(HTML 페이지 크롤링)
 {: .notice--info}

 우선 [Naver Finance](https://finance.naver.com/sise/sise_index.nhn?code=KPI200)의 일별시세 파트를 크롤링 하기 위해서 url를 분석 후 https://finance.naver.com/sise/sise_index_day.nhn?code=KPI200&page=598  
 ![image](https://user-images.githubusercontent.com/56333934/86938505-75d12380-c17b-11ea-9aa6-8adb57cf9c58.png)     
 html 태그를 확인한다.
 ![image](https://user-images.githubusercontent.com/56333934/86939161-30f9bc80-c17c-11ea-8fa0-816a8ef13c72.png)

 이후, 코드를 작성한다.   
 ```python
 from urllib.request import urlopen
 import bs4
 import datetime as dt

 def date_format(d):     #사용자가 입력한 날짜를 파이썬의 날짜 데이터 형식으로 변환하는 함수
     d = str(d).replace('-','.')
     yyyy = int(d.split('.')[0])
     mm = int(d.split('.')[1])
     dd = int(d.split('.')[2])
     this_date = dt.date(yyyy,mm,dd)
     return this_date

 def historical_index_naver(index_cd, start_date='', end_date='', page_n=1, last_page=0):
     if start_date:
         start_date = date_format(start_date)
     else:
         start_date = dt.date.today()
     if end_date:
         end_date = date_format(end_date)
     else:
         end_date = dt.date.today()

     naver_index = "http://finance.naver.com/sise/sise_index_day.nhn?code=" + index_cd+ '&page='+ str(page_n)

     source = urlopen(naver_index).read()    #지정한 페이지에서 코드 읽기
     source = bs4.BeautifulSoup(source, 'lxml')    #뷰티풀 수프로 태그별로 코드 분류

     dates=source.find_all('td',class_='date')     #<td class="date">태그에서 날짜 수집
     prices=source.find_all('td',class_='number_1')     #<td class="number_1">태그에서 지수 수집

     for n in range(len(dates)):
         if dates[n].text.split('.')[0].isdigit():
             #날짜 처리
             this_date = dates[n].text
             this_date = date_format(this_date)

             if this_date <= end_date and this_date >= start_date:

                 #종가 처리
                 this_close = prices[n*4].text
                 this_close = this_close.replace(',','')
                 this_close = float(this_close)

                 #딕셔너리에 저장
                 historical_prices[this_date] = this_close
             elif this_date < start_date:
                 return historical_prices

     #페이지네이션
         if last_page==0:
             last_page = source.find('td', class_='pgRR').find('a')['href']
             last_page = last_page.split('&')[1]
             last_page = last_page.split('=')[1]
             last_page = int(last_page)
         if page_n < last_page:
             page_n = page_n + 1
             historical_index_naver(index_cd, start_date, end_date, page_n, last_page)

     return historical_prices
     #실행코드
index_cd = "KPI200"
historical_prices=dict()
historical_index_naver(index_cd, '2020-7-1', '2020-7-8')
#2020.07.01부터 2020.07.08 종가
 ```
<br>
출력 :
```
{datetime.date(2020, 7, 8): 285.97,
 datetime.date(2020, 7, 7): 286.77,
 datetime.date(2020, 7, 6): 290.62,
 datetime.date(2020, 7, 3): 285.89,
 datetime.date(2020, 7, 2): 283.86,
 datetime.date(2020, 7, 1): 280.26}
```
