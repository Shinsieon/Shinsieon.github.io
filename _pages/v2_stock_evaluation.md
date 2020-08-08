---
layout: single
title: "주식 종목 가치평가 프로그램 개발 version 2"
permalink: /projects/v2_stock_evaluation/
author_profile: true
---

## Changed

**클래스 사용**   
-클래스를 사용하여 조금더 객체 지향식 코드로 업데이트   

**데이터프레임 구성방법**   
-comp.fnguide.com 의 재무제표에는 2020년의 데이터뿐만 아니라 자체적으로 2021년 2022년 데이터까지 예측되어있는 종목들이 있는가 한편 제대로 된 데이터가 없는 종목들도 있다.   
주로 전자는 대형주, 후자는 소형주의 경우들이 그렇다. 때문에 데이터 전처리 과정이 번거로웠다.

변경 전 : 모든 종목의 재무제표에 2020년부터 2022년까지의 데이터가 있다고(예측되어 있다고) 가정하고 2023년부터 2028년까지의 데이터를 계산해서 넣었다. 데이터가 없는 종목들은 그 전년도의 값들을 이전했다.

변경 후 : 2015년부터 2019년의 재무제표만으로(이 데이터는 모든 종목이 가지고 있었기 떄문에) 2020년부터 2025년까지의 EPS, ROE, BPS를 계산하였다. 이로인해 더 정확한 현재가치를 산출할 수 있었다. 하지만, 코로나가 발생한 2020년의 데이터가 없었기 때문에 코로나같은 경제 위기 상황을 반영한 프로그램은 아니다.    

**고 배당주 엑셀 데이터와 시가총액 순위 엑셀 데이터로 종목 선택폭 강화**

### Code

```python
import pandas as pd
import numpy as np
import bs4
from openpyxl import load_workbook
from urllib.request import urlopen
import csv

pd.set_option('display.max_rows',500)  #데이터프레임 truncation 방지
class stock_evaluation:

    def get_html(self,jcode):     #재무재표 크롤링
        self.jcode = jcode
        url = 'http://comp.fnguide.com/SVO2/ASP/SVD_main.asp?pGB=1&gicode=A%s' % jcode
        html = urlopen(url).read()
        html = bs4.BeautifulSoup(html,'lxml')
        table = html.find('div',{'id':'highlight_D_Y'})
        crt_data = html.find('div',{'id':'corp_group2'}).find_all('dl')
        self.crt_PER = crt_data[0].find_all('dd')[1].text   #PER
        self.crt_around_PER = crt_data[4].find_all('dd')[1].text   #업종 PER
        self.crt_price = int(html.find('span',{'id' : 'svdMainChartTxt11'}).text.replace(',',''))
        self.name = html.find('h1',{'id':'giName'}).text

        date_col = table.find_all('tr')[1].find_all('th')[:5]
        date_col=list(i.text for i in date_col) #dataframe의 column

        j = table.find_all('td',{'class','r'})
        tr = table.find_all('tr')[18:]
        self.df = pd.DataFrame()


        for i in tr:        #테이블 항목 가져오기
            category = i.find('span',{'class':'txt_acd'})
            if(category==None):
                category=i.find('th')
            category = category.text.strip()
            value_list = []
            j = i.find_all('td',{'class','r'})[:5]

            for value in j:
                temp = value.text.replace(',','').strip()
                try:
                    temp = float(temp)
                    value_list.append(temp)
                except:
                    value_list.append(0)
                data = {category:value_list}
                data = pd.DataFrame(data)
            self.df = pd.concat([self.df,data],axis=1)

        self.df.index=date_col

    def get_excel_high_dividend(self):    #고배당주 엑셀 read
        load_wb = load_workbook("stock_div.xlsx", data_only=True)
        load_ws = load_wb['Sheet1']
        row_num = 0
        jcode=[]
        for row in load_ws.rows:
            row_num+=1
            if row_num==1:
                continue
            elif row_num==100:   #100개만
                break
            jcode.append(row[2].value)
        return jcode

    def get_excel_siga_top(self):  #시가총액 엑셀 read
        load_wb = open('siga.csv','r',encoding='utf-8')
        load_ws = csv.reader(load_wb)
        row_num = 0
        jcode=[]
        for row in load_ws:
            row_num+=1
            if row_num==1:
                continue
            jcode.append(row[1])
        return jcode



    def df_extension(self):       #데이터테이블 확장(2025년까지)
        for i in range(6):
            self.ROE_mean = self.df['ROE'].mean()
            new_eps = self.df['BPS'][-1]*self.ROE_mean/100
            new_bps = new_eps + self.df['BPS'][-1]
            PER = self.df['PER'][-1]
            PBR = self.df['PBR'][-1]
            stock_ret = self.df['배당수익률'][-1]
            self.df.loc['202'+str(i)+'/12'] = [self.df['ROA'].mean(),self.ROE_mean,new_eps,new_bps, np.nan, PER, PBR, np.nan, stock_ret]

    def report(self):
        self.new_price = int(self.df['BPS'][-1]/((1.15)**5))

        self.all_datas = pd.DataFrame(index = ['종목이름','종목코드','평균ROE','PER','업종PER','현재가치','주가','평가'],
                         data = [self.name,self.jcode,self.ROE_mean,self.crt_PER,self.crt_around_PER,self.new_price,self.crt_price,\
                                 '적합' if self.new_price>=1.5*self.crt_price else '부적합']).T

if __name__=="__main__":
    print("주식종목 가치 평가 프로그램입니다.\n")
    se_func = stock_evaluation()
    ch1 = input("1. 개별주식종목 조회, 2.고배당주 top100 3.시가총액 상위 100개 기업 \n")
    report_df = pd.DataFrame()

    if(ch1=='1'):
        while(True):
            jcode = input("종목코드를 입력하세요 : ")
            se_func.get_html(jcode)   
            se_func.df_extension()
            se_func.report()
            report_df = pd.concat([report_df,se_func.all_datas],axis=0)
            report_df.reset_index(drop=True,inplace=True)
            display(report_df)
            ch2 = input("계속 조회하려면 Y, else N")
            if(ch2=='n' or ch2=='N'):
                break
            elif(ch2=='Y' or ch2=='y'):
                continue
            else:
                print("key error")
                break

    elif(ch1=='2'):
        for i in range(100): #100개만 조회
            try:
                se_func.get_html(se_func.get_excel_high_dividend()[i])   
                se_func.df_extension()
                se_func.report()
                report_df = pd.concat([report_df,se_func.all_datas],axis=0)
                report_df.reset_index(drop=True,inplace=True)
            except:
                pass
        display(report_df)
    elif(ch1=='3'):
        for i in range(100) : #100개만 조회
            try:
                se_func.get_html(se_func.get_excel_siga_top()[i])
                se_func.df_extension()
                se_func.report()
                report_df = pd.concat([report_df, se_func.all_datas], axis=0)
                report_df.reset_index(drop=True, inplace=True)
            except:
                pass
        display(report_df)
```

#### 실행화면
![image](https://user-images.githubusercontent.com/56333934/89707698-93c4ba80-d9ab-11ea-8a05-426a72b789fb.png)

1번 선택 후 종목코드를 입력하면 다음과 같이 보인다. Y를 누르면 데이터프레임에 다음 행이 추가된다.

![image](https://user-images.githubusercontent.com/56333934/89707734-e2725480-d9ab-11ea-9ece-49526d33be0a.png)

2번을 선택하면 다음과 같이 보인다. 배당을 많이 주는 종목 순서대로 저장되어 있는 엑셀데이터를 읽어 주가분석을 한다. 여기서는 반복문을 100까지만 했지만, 캡쳐가 다 되지 않아 일부 데이터만 보인다.

![image](https://user-images.githubusercontent.com/56333934/89707964-edc67f80-d9ad-11ea-9303-43eb43df4025.png)

3번을 선택하면 다음과 같이 보인다. 시가총액 순위대로 종목코드가 저장되어 있는 엑셀파일을 읽어와 주가분석을 한다. 여기서도 반복문을 100까지만 해서 100위까지만 보이고 캡쳐는 일부분만 하였다.

![image](https://user-images.githubusercontent.com/56333934/89708083-17cc7180-d9af-11ea-8cd4-f24a3f55e363.png)

만약 적합한 종목과 PER이 업종 PER보다 작은 종목들만 보고 싶으면

```python
for i in range(len(report_df)):
    if report_df.loc[i]['평가']=='적합' and report_df.loc[i]['PER']<report_df.loc[i]['업종PER']:
        print(report_df.loc[i][0],report_df.loc[i][1], report_df.loc[i][2], report_df.loc[i][3], report_df.loc[i][4],report_df.loc[i][5],\
             report_df.loc[i][6])
```

실행결과   
![image](https://user-images.githubusercontent.com/56333934/89708130-709c0a00-d9af-11ea-9203-702ebf842d1b.png)
