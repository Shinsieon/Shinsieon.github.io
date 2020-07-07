---
layout: single
title: "주식 종목 가치평가 프로그램 개발"
permalink: /projects/stock_evaluation/
author_profile: true
---

![800x0](https://user-images.githubusercontent.com/56333934/86784771-dd647180-c09c-11ea-8a40-87928722c45a.png){:style="width:300px;height:400px"}

이 도서에서는 모멘텀 투자보다는 가치투자의 관점에서 투자의 방향을 이야기합니다. 이론으로 정리된 가치 평가 방식을 파이썬을 활용하여 직접 개발해보았습니다.

**모멘텀 투자** 란 시장 분위기와 뉴스, 테마, 종목 정보, 투자 심리, 수급, 기술적 분석 등의 요소를 기반으로 하여서 투자자의 직관이나 영감을 합하여 자산 가격을 전망하고 이에 따라 투자하는 방법입니다.
{: .notice--danger}
{:style="font-size:15px"}
<br>
**가치 투자자** 는 자산 가격을 전망하지 않는 대신 자산의 가치를 분석하고 전망합니다. 자산 가치 대비 현재 시장 가격이 충분히 낮을 경우 매수하고 가치 대비 가격이 높다고 판단될 경우 매도하는 방식입니다. 가치투자의 대표자로는 워런버핏과 피터 린치 등이 있습니다.
{: .notice--warning}
{:style="font-size:15px"}
<br>
각 주식 종목의 가치를 평가하기 위해선 지난 5년간의 재무제표 데이터가 필요합니다. 이 데이터는 [fnguide](http://comp.fnguide.com/SVO2/ASP/SVD_main.asp?pGB=1&gicode=A005930) 사이트에서 크롤링 하였습니다. <small>sample:삼성전자주

```python
def crawling(code):    #크롤링 함수
    url = re.get('http://comp.fnguide.com/SVO2/ASP/SVD_main.asp?pGB=1&gicode=A%s'%code)
    url = url.content
    html = BeautifulSoup(url,'html.parser')
    body = html.find('body')
    fn_body = body.find('div',{'class':'fng_body asp_body'})
    ur_table = fn_body.find('div',{'id': 'div15'})
    table = ur_table.find('div',{'id':'highlight_D_Y'})
    tbody = table.find('tbody')
    tr = tbody.find_all('tr')
    Table = DataFrame()            #테이블 구성

    price = body.find('span',{'id':'svdMainChartTxt11'}) #현재 주가 크롤링
    price = price.text
    price = price.replace(',','')
    n_price = float(price)

    around_PER = body.find('div',{'id': 'corp_group2'}).find_all('dd')  #PER 크롤링
    dd_list = []
    for tag in around_PER:
        dd_list.append(tag.text)
    around_PER = dd_list[5]

    for i in tr:        #테이블 항목 가져오기
        category = i.find('span',{'class':'txt_acd'})
        if(category==None):
            category=i.find('th')
        category = category.text.strip()
        value_list = []
        j = i.find_all('td',{'class','r'})

        for value in j:
            temp = value.text.replace(',','').strip()
            try:
                temp = float(temp)
                value_list.append(temp)
            except:
                value_list.append(0)
        Table['%s'%(category)] = value_list


        thead = table.find('thead')               #기간 가져오기
        tr_2 = thead.find('tr',{'class','td_gapcolor2'}).find_all('th')
        year_list = []
        for i in tr_2:
            try:
                temp_year = i.find('span', {'class','txt_acd'}).text
            except:
                temp_year = i.text

            year_list.append(temp_year)
        Table.index = year_list
    return Table

code= input("주식 종목코드: ")
```
입력 :   
  주식 종목코드 : 005930   
출력 :   
![stock_eval_crawl](https://user-images.githubusercontent.com/56333934/86792951-f0c80a80-c0a5-11ea-9717-92277deb7ab4.PNG)
{:style="width:auto;height:300px"}   
<br>
출력된 다양한 지표 중 가치 평가에 필요한 지표는<br>
ROE, PER, PBR, EPS, BPS, ROE의 평균입니다.<br>


**ROE** 는 자기자본이익률(Return On Equity)로 기업이 자본을 이용하여 얼마만큼의 이익을 냈는지를 나타내는 지표이다. ROE = 당기순이익/자본총액   
**PER** 은 주가수익비율(Price Earning Ratio)로 현재 주가가 순이익의 몇배 상태인지를 나타내는 지표이다. PER = 주가/주당순이익(EPS)   
**PBR** 은 주가순자산비율(Price Book-value Ratio)로 주가가 주당 순자산의 몇 배로 매매되고 있는가를 보여줍니다. PBR = 주가/주당순자산(BPS)   
**EPS** 는 주당순이익으로(Earning Per Share)로 기업의 현재 순자산을 주식수로 나눈 개념이다. EPS = 당기순이익/총 발행주식수   
**BPS** 는 주당순자산가치(Book-value Per Share)로 청산가치라고도 부른다. 만약 기업이 지금당장 모든 활동을 중단하고 기업의 자산을 주주들에게 나눠줄 경우, 한 주당 얼마씩 돌아가는지를 나타내는 지표이다. BPS = 기업의 현재 순자산/총 발행주식수   
{: .notice--info}

기업의 재무제표를 통해 평균ROE를 구하고, <small>삼성의 경우 13.35</small>   
미래 5년의 데이터를 예측한다. 삼성의 경우 2022년까지 데이터가 있으므로 2028년까지의 데이터를 예측하여 입력한다. <br>
2023년의 EPS = 2022년의 BPS* 평균ROE/100 <br>
2023년의 BPS = 2022년의 BPS+ 2023년의 EPS

```python
def new_table(Table):    #기존의 데이터로 예측한 미래 5년의 데이터
    new_t = Table.T.iloc[[16,17,18,19,21]]    #ROA, ROE, EPS, BPS, PER만 추출
    ROA_avg = new_t.mean(axis=1)[0]
    ROE_avg = new_t.mean(axis=1)[1]
    bf_num = -2
    new_column = []
    for i in range(0,6):
        new_year = 2023+i
        new_t['%d'%new_year] = None
        for j in range(2,6):
            if(new_t.loc['BPS'][-j] != 0):
                break
            else:
                bf_num = bf_num-1
        new_EPS = new_t.loc['BPS'][bf_num]*(ROE_avg/100)
        new_BPS = new_t.loc['BPS'][bf_num] + new_EPS
        bf_num = -2

        new_t['%d'%new_year] = ROA_avg,ROE_avg,new_EPS, new_BPS, 'NAN'
    return new_t
```

마지막 예측년도(2028년)의 BPS를 현재가치로 변환하고 현재주가와 비교하여 투자 적합도를 평가한다.

```python
def calculate_price(new_t):    #마지막 예측년도(2028년)의 BPS를 현재가치로 변환
    new_BPS = new_t.loc['BPS'][-1]
    new_price = new_BPS/((1.15)**8)
    print("업종 PER : "+around_PER)  
    print("현재 주가 :" + price)
    print("현재가치 : " ,round(new_price,2))
    display(new_t)
    print("투자 자격 : ", end="")
    print(("미달", "적합")[1.5*n_price<new_price])
```   
![stock_eval_result](https://user-images.githubusercontent.com/56333934/86802676-38539400-c0b0-11ea-8d8e-90588f1224ec.PNG)
{:style="width:auto;height:300px"}
