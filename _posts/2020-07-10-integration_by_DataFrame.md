---
title: "S&P500과 KOSPI200 선형회귀분석"
categories:
  - Post Formats
tags:
  - Python
  - Crawling
  - Linear regression
---

지금까지 한 KOSPI200 지수 크롤링과 S&P500 지수 크롤링 한 것을 하나의 데이터 프레임으로 통합한다. 파이썬에서 지원하는 라이브러리인 pandas를 사용한다.   

**Pandas** 는 파이썬에서 사용하는 데이터분석 라이브러리로, 행과 열로 이루어진 데이터 객체를 만들어 다룰 수 있게 되며 보다 안정적으로 대용량의 데이터들을 처리하는데 매우 편리한 도구 입니다.
{: .notice--primary}
2008년부터 2020년 7월10일 현재까지의 날짜와 종가를 하나의 데이터프레임에 통합하는 코드이다.
```python
index_cd = "KPI200"
historical_prices=dict()
kospi200 = historical_index_naver(index_cd, '2008-1-1', '2020-07-10')

index_cd = "SPI@SPX"
historical_prices=dict()
sp500 = index_global(historical_prices, index_cd, '2008-1-1', '2020-07-10')

tmp = {'S&P500' : sp500, 'KOSPI200' : kospi200}
df = pd.DataFrame(tmp)
df= df.fillna(method='ffill') #forward fill방법으로 NaN의 칸을 앞의 날짜의 수를 가져와서 보간함.
if df.isnull().values.any():
    df = df.fillna(method='bfill')#backword fill방법으로 전의 날짜를 보간
```
출력:
![image](https://user-images.githubusercontent.com/56333934/87158239-61676500-c2fa-11ea-9876-97a9eb85845b.png)

# Matplotlib을 이용해 그래프 그리기
Matplotlib 역시 파이썬에서 지원하는 강력한 라이브러리로, 데이터 시각화 기능을 지원한다.

```python
import matplotlib.pyplot as plt
%matplotlib inline
plt.figure(figsize=(10,5))  #크기조절
plt.plot(df['S&P500']/df['S&P500'].loc[dt.date(2008,1,2)]*100)    #S&P500과KOSPI200의 차이를 비율로 전환
plt.plot(df['KOSPI200']/df['KOSPI200'].loc[dt.date(2008,1,2)]*100)
plt.legend(loc='upper left',handles='')   #범례위치 지정
plt.grid(True, color='0.7',linestyle=':', linewidth=1)
```
<br>
! 여기서 모든 데이터를 2008년 1월 2일의 종가로 나누어주고 100을 곱한 이유는 S&P500과 KOSPI200은 수치의 차이가 분명하게 존재하기 때문에 이러한 차이를 제거하고 변동성만 비교하기 위해서는 2008년 1월 2일 첫 데이터를 기준으로 얼마나 변동하는지를 보아야 한다. 그 결과,
![image](https://user-images.githubusercontent.com/56333934/87158667-0eda7880-c2fb-11ea-95a6-337d8e1de881.png)

다음과 같은 그래프가 나타난다.

# 회귀분석
회귀분석을 하기 위해 이번에는, 2019년부터 현재까지의 데이터만을 이용하기로 한다.
```
df_ratio_2019_now = df.loc[:dt.date(2019,1,2)]/df.loc[dt.date(2019,1,2)]*100
```
2019년부터 현재까지 지수를 새롭게 저장하는 df_ratio_2019_now 변수를 저장하고, 산포도를 그려본다.
```python
plt.figure(figsize=(5,5))
plt.scatter(df_ratio_2019_now['S&P500'], df_ratio_2019_now['KOSPI200'], marker='.')
plt.grid(True, color='0.7', linestyle=':', linewidth=1)
plt.xlabel('S&P500')
plt.ylabel('KOSPI200')
```
출력 :
![image](https://user-images.githubusercontent.com/56333934/87159147-d8512d80-c2fb-11ea-92cd-6f69c865e98a.png)

회귀분석을 위해서는 sklearn.linear_model 내의 LinearRegression 라이브러리를 사용한다. 벡터화된 데이터 처리를 위해 넘파이 모듈도 함께 사용한다.

```python
import numpy as np
from sklearn.linear_model import LinearRegression

x = df_ratio_2019_now['S&P500']
y = df_ratio_2019_now['KOSPI200']

#1개의 칼럼 np.array로 변환
independent_var = np.array(x).reshape(-1,1)
dependent_var = np.array(y).reshape(-1,1)

#linear regression
regr = LinearRegression()
regr.fit(independent_var, dependent_var)

result = {'Slope':regr.coef_[0,0], 'Intercept:':regr.intercept_[0], 'R^2':regr.score(independent_var,dependent_var)}
result
```
결과 :
'Slope': 0.5208254720225609,   
 'Intercept:': 44.29013730189099,   
 'R^2': 0.4343032345256882   

# 추세선 그리기
```python
plt.figure(figsize=(5,5))
plt.scatter(independent_var, dependent_var, marker='.', color='skyblue')
plt.plot(independent_var, regr.predict(independent_var), color='r', linewidth=3)
plt.grid(True, color='0.7',linestyle=':', linewidth=1)
plt.xlabel('S&P500')
plt.ylabel('KOSPI200')
```
결과 :
![image](https://user-images.githubusercontent.com/56333934/87159481-61686480-c2fc-11ea-82b9-8c1d379ceeca.png)
