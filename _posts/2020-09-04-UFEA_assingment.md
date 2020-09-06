---
title: "UFEA assignment about swap curve & curve fitting"
categories:
  - Post Formats
tags:
  - UFEA
  - Swap curve
  - Spot rate
use_math: true
---

금융공학 학회에서 코딩 과제를 내주었다. 우선 과제에 대한 책의 내용을 번역하자면...    

교재 : [John C Hull]Options, Futures, and other derivatives 9th
{: .notice--warning}

## 5.4 Interest Rate Swaps    

금리 스왑은 현대 금융시장 중 장외 파생상품 시장에서 독보적이게 되었다. 2008년 12월, 국제청산은행(Bank of international Settlements)에 따르면 금리 스왑 시장은 8조달러, 선도거래 870억달러, OTC 옵션 1.1조달러 거래되었다. 미국 국채는 5.9조 달러 거래된 것을 보면 어느 정도 감이 올 것이다. 이번 절에서는 plain vanilla 금리 스왑에 대해 알아보고자 한다.
>Definition of A plain vanilla fixed-for-floating interest rate swap: is an agreement between two counterparties in which one counterparty agrees to make n fixed payments per year at an (annualized) rate c on a notional N up to a maturity date T, while at the same time the other counterparty commits to make payments linked to a floating rate index $ r_{n}(t) $. Denote by T_1, T_2,,, the payment dates, with $ T_i = T_(i-1)+ \Delta\ and\ \Delta = 1/n $, the net payment between the two counterparties at each of these dates is    
$$
Net Payment\ at\ T_{i}= N  \times \Delta \times[r_{n}(T_{i-1})-c]
$$
The constant c is called swap Rate

**고정변동금리 스왑의 현금흐름이 발생하는 T시점에 순지출금은 원금 $ \times $ 연지급횟수(1/n) $ \times $ (변동금리(LIBOR)-스왑금리) 이다.**

![image](https://user-images.githubusercontent.com/56333934/92295892-00f74b80-ef6a-11ea-8129-10bd2240eaa5.png)
<br><br>

## 5.4.1 The Value of a Swap
스왑의 가치는 어떻게 측정할까? 6개월마다 고정금리를 지출하고 변동금리를 받는 상대방을 생각해보자. 이는 쿠폰이 c인 변동금리 채권을 롤 포지션, 고정금리 채권을 숏포지션을 취한 것과 같다. 따라서    

$    
Value\ of\ swap = Value\ of\ floating\ rate\ bond = Value\ of\ fixed\ rate\ bond\    
$    

$    
V^{swap}(t;c,T)=P_{FR}(t,T) - P_{c}(t,T)
$    

## 5.4.2 The Swap rate
스왑금리 c는 어떻게 결정될까? 스왑계약 당시에는 현금흐름이 발생하지 않는다. 이 말은 계약하는 당시의 스왑거래의 가치는 0이라는 것이다. 즉, 0시점에 스왑계약의 가치가 0이 되야 한다면, 위에 공식에서 스왑금리 c를 도출해낼 수 있을 것이다.    

$    
c = n \times {1-Z(o,T_{M}) \over \sum_{j=1}^M Z(0,T_{j})}
$


## 5.4.3 The Swap curve
스왑의 가격을 측정하기 위한 적절한 할인율 Z(t,T)는 어떤 것일까? 지난 몇년간, 스왑시장은 급격히 커졌고, 시장은 매년 만기마다 적용될 스왑금리를 결정하게 되었다. 예를 들어, 어떠한 기업이 단기금리의 상승을 두려워해 고정 금리 파이낸싱을 하고자 한다면, 고정금리를 지출하는 고정변동금리 스왑의 수요를 증가시킬 것이다. 이는 고정금리 채권을 발행하는 것과 동일하고 공급이 많아지면 채권의 가격은 떨어지게 된다. 그럼 당연히 스왑금리는 올라가고, 시장에서 엄청난 양이 거래되는 스왑인 만큼 돈의 시간가치에 영향을 미친다. 따라서, 할인율은 스왑에 내제되어 있다고 볼 수 있다.
>Definitions : The swap curve at time t is the set of swap rates (at time t)for all maturities $ T_{1},T_{2}... $ We denote the swap curve at time t by $ c(t,T_{i}) $, for i=1,,,M;

30년 만기까지의 모든 스왑 금리는 매일 스왑 딜러들에 의해 결정이 된다. 앞서 말한 스왑시장의 규모로 인해 금융 환경에서의 돈의 시간가치는 스왑커브에 의해 결정이 된다. 우리는 부트스트랩 방법을 통해 스왑금리에서 할인율 Z(t,T)를 구할 수 있다.

for i=1

$    
Z(t,T_{1}) = {1 \over 1+ {c(t,T_{1}) \over n}}
$    

while for i=2,,,M    

$
Z(t,T_{i})= {1-{c(t,T_{i}) \over n} \times \sum_{j=1}^{i-1} Z(t,T_{j}) \over 1+ {c(t,T_{1}) \over n}}
$

## 2.9.3 Curve fitting
우리는 만기가 T인 채권의 할인율 Z(0,T)를 매개변수로 이루어진 함수로써 가정할 수 있고, 과거 채권 가격들로 매개변수들을 추정할 수 있을 것이다. 대표적인 모델로는 **The Nelson Siegel Model** 이 있다. 연속복리의 경우

$
Z(0,T) = e^{-r(0,T)T}
$

$
r(0,T) = {\Theta_{0} + {(\Theta_{1}+\Theta_{2})} {1-e^{-T/\lambda} \over {T/\lambda}} - \Theta_{2}e^{-T/\lambda}}
$

위 식의 파라미터인 세타0,세타1,세타2, 람다는 모두 과거 채권 데이터로 추정할 수 있다. 또한 이 넬슨 시겔 모델을 활용해서 채권 가격도 추정할 수 있다.

$
P_{c}^{NS model} = 100 \times {(c^{i}/2 \sum_{j=1}^{n} Z(0,T_{j})+ Z(0,T^{i})}
$

이젠, 시장에서 거래되고 있는 실제 채권의 가격과 이 모델에서 추정된 가격의 잔차가 최소가 되는 파라미터 값을 구하면 된다.

$
Minimize J(\Theta_{0},\Theta_{1},\Theta_{2},\lambda) = \sum_{i=1}^{N} (P^{NS model}- P^{Data})^2
$

만약 모델에서 추정된 가격과 실제 가격이 일치한다면 J값은 0이 될 것이다. 하지만 일반적으로 불가능하기에 목적함수는 J가 최소가 되는 파라미터 값을 구하는 것이다.



**과제1. 다음과 같은 스왑커브가 있을 때 할인율을 도출해내시오** [Show solution](#link){: .btn .btn--info}
{: .notice--warning}

|maturity|Z(0,T)|Swap curve|
|---|---|---|
|0.5||4.951|
|1||4.91|
|1.5||4.98|
|2||5.05|
|2.5||5.135|
|3||5.22|
|3.5||5.285|
|4||5.35|
|4.5||5.405|
|5||5.46|

<div class="solution" markdown="1" style="display:none;font-size:15px">
#### code
```python
import numpy as np
import pandas as pd

#주어진 데이터로 데이터프레임 만들기
input_data = {'Maturity':[0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5, 5],
              'Swap Curve' : [4.951, 4.91, 4.98, 5.05,5.135, 5.22, 5.285, 5.35, 5.405, 5.46]}
input_df = pd.DataFrame(input_data)
input_df
```
![image](https://user-images.githubusercontent.com/56333934/92297045-03f83900-ef76-11ea-9927-27c02bebd2f7.png)


```python
#Z(0,T)뽑아내기
n=2
Z_data= []
for i in range(10):
    if i==0:
        Z = 1/(1+(input_df['Swap Curve'][i]/(100*n)))
        Z_data.append(Z)
        continue
    else:
        Z = (1-(input_df['Swap Curve'][i]/(100*n))*sum(Z_data))/(1+input_df['Swap Curve'][i]/(100*n))
        Z_data.append(Z)
        continue
result_data = pd.concat([input_df, pd.Series(Z_data,name='Z(0,T)')], axis=1)
result_data
```
![image](https://user-images.githubusercontent.com/56333934/92297040-f80c7700-ef75-11ea-95a3-05c388b912d3.png)

```python
import matplotlib.pyplot as plt
%matplotlib inline
#그래프 기본 설정
plt.rcParams['font.family']='Malgun Gothic'
plt.rcParams['font.size']=12
plt.rcParams['axes.unicode_minus']=False

plt.figure(figsize=(15,10))

plt.subplot(221)
plt.plot(result_data['Maturity'],result_data['Swap Curve']/100,label='Swap_Curve')
plt.xlim(0.5,5)
plt.title('Swap Curve')
plt.xlabel('Maturity')
plt.ylabel('Rate(%)')
plt.grid(True, color='0.7',linestyle=':', linewidth=1)


plt.subplot(222)
plt.plot(result_data['Maturity'],result_data['Z(0,T)'],label='Z(0,T)')
plt.xlim(0.5,5)
plt.title('Discount Factor')
plt.xlabel('Maturity')
plt.ylabel('Rate(%)')
plt.grid(True, color='0.7',linestyle=':', linewidth=1)

```
![image](https://user-images.githubusercontent.com/56333934/92297030-d7dcb800-ef75-11ea-999a-d00e8b8edb73.png)
</div>

**과제 2. Example 시트의 비어있는 1000개의 zero_Curve를 구하기.**[Show solution](#link){: .btn .btn--info}
{: .notice--warning}

<div class="solution" markdown="1" style="display:none;font-size:15px">
![image](https://user-images.githubusercontent.com/56333934/92297075-50dc0f80-ef76-11ea-8cb8-1fc8549ffad7.png)    
다음과 같이 1000개의 swap curve가 주어져있다. 필자는 파이썬으로 작성하기 위해 해당 엑셀 파일을 읽어오는 openpyxl 라이브러리를 사용하기로 하였다.
```python
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from openpyxl import load_workbook
import csv
pd.set_option('display.max_rows',1000)  #데이터프레임 truncation 방지
%matplotlib inline
#그래프 기본 설정

#엑셀 데이터 읽어오기
load_wb = load_workbook("Veronesi CH5_2.xlsm", data_only=True)
load_ws = load_wb['Example']
count = 0
Maturity = []
Swap_curve = []
for row in load_ws.rows:
    count= count+1
    if count==1:
        continue
    Maturity.append(float(row[0].value))
    Swap_curve.append(float(row[2].value))

input_data = {'Maturity':Maturity,
              'Swap Curve' : Swap_curve}
input_df = pd.DataFrame(input_data)

#Z(0,T)뽑아내기
n=2
Z_data= []
for i in range(len(input_df['Maturity'])):
    if i==0:
        Z = 1/(1+(input_df['Swap Curve'][i]/(100*n)))
        Z_data.append(Z)
        continue
    else:
        Z = (1-(input_df['Swap Curve'][i]/(100*n))*sum(Z_data))/(1+input_df['Swap Curve'][i]/(100*n))
        Z_data.append(Z)
        continue
result_data = pd.concat([input_df, pd.Series(Z_data,name='Z(0,T)')], axis=1)
display(result_data)

plt.rcParams['font.family']='Malgun Gothic'
plt.rcParams['font.size']=12
plt.rcParams['axes.unicode_minus']=False

plt.figure(figsize=(15,10))

plt.subplot(221)
plt.plot(result_data['Maturity'],result_data['Swap Curve']/100,label='Swap_Curve')
plt.xlim(0,10)
plt.title('Swap Curve')
plt.xlabel('Maturity')
plt.ylabel('Rate(%)')
plt.grid(True, color='0.7',linestyle=':', linewidth=1)


plt.subplot(222)
plt.plot(result_data['Maturity'],result_data['Z(0,T)'],label='Z(0,T)')
plt.xlim(0,10)
plt.title('Discount Factor')
plt.xlabel('Maturity')
plt.ylabel('Rate(%)')
plt.grid(True, color='0.7',linestyle=':', linewidth=1)

```
![image](https://user-images.githubusercontent.com/56333934/92297096-af08f280-ef76-11ea-9623-4f31a1267fc9.png)

![image](https://user-images.githubusercontent.com/56333934/92297102-c1832c00-ef76-11ea-9153-236a789b267c.png)

</div>

**과제 3. 교재에서 주어진 데이터로 산출해낸 파라미터 값 $ \Theta_{0} = 0.0754, \Theta_{1} = -0.0453, \Theta_{2} = -7.3182 \times 10^{-9}, \lambda = variable(교재에선 3.2286) $ 을 이용하여 넬슨 시겔 모델로 산출해낸 가격과 실제 미국 국고채 30년물의 특정시점 가격의 잔차가 최소가 되는 $ \lambda $ 값을 구하라.**[Show solution](#link){: .btn .btn--info}
{: .notice--warning}

<div class="solution" markdown="1" style="display:none;font-size:15px">
교재에서 주어진 데이터에 맞추어서 데이터프레임을 만들고 가격과 J값을 뽑아내는 메서드를 구현, 마지막으로 matplotlob 라이브러리를 활용해서 그래프를 그려보았다.
#### code
```python
import pandas as pd
import numpy as np
import math

#데이터프레임 만들기
bond_data = {'Date' : ['2021-03-15', '2021-09-15', '2022-03-15', '2022-09-30',
                      '2023-03-31', '2023-09-30', '2024-03-31', '2024-09-30', '2025-03-31',\
                      '2025-09-30'],
             'Maturity' : [0.5,1,1.5,2,2.5,3,3.5,4,4.5,5],
             'Coupon' : [0, 7.625, 4.125, 4.250, 7.875, 6.125, 6.375, 6, 5.125, 5.125],
             'Price(A)' : [98.4012, 103.8750, 100.25, 100.0625, 108.75, 104.5938,\
                          105.2188, 103.8438, 100.1250, 99.6875]
}
bond_data = pd.DataFrame(bond_data)

display(bond_data)

```
![image](https://user-images.githubusercontent.com/56333934/92319071-ac2e0080-f04f-11ea-8dcb-d871aa9a51e1.png)

```python
#주어진 변수
theta0 = 0.0754
theta1 = -0.0453
theta2 = -7.3182*10**-9

def NS_calculate(lamda):
    y = []
    Z = []
    NS_price=[]
    J = []
    arr_num = 0

    for i in bond_data['Maturity']:
        T = float(i)
        y_ = (theta0 + (theta1+theta2)*(1-math.exp(-T/lamda))/(T/lamda))-theta2*math.exp(-T/lamda)
        y.append(y_)

        Z_ = math.exp(-T*y_)
        Z.append(Z_)
        NS_price_ = 100*((bond_data['Coupon'][arr_num]/200)*sum(Z)+Z_)
        NS_price.append(NS_price_)
        J_ = (NS_price_ - bond_data['Price(A)'][arr_num])**2
        J.append(J_)
        arr_num+=1
    return ({'lamda' : lamda,'yield' : y, 'Z(0,T)' : Z, 'NS_Price' : NS_price,'J':J})

Y_axis = []
X_axis = []
for l in range(1,10):
    #lamda = float(l/10000)
    result = NS_calculate(l)
    NS_model = pd.DataFrame(result)
    X_axis.append(result['lamda'])
    Y_axis.append(sum(result['J']))
    n_ = pd.concat([bond_data, NS_model], axis=1)
    display(n_)
```
![image](https://user-images.githubusercontent.com/56333934/92319081-d2ec3700-f04f-11ea-9156-c28fcd0b42f2.png)

```python
import matplotlib.pyplot as plt
%matplotlib inline

plt.rcParams['font.family']='Malgun Gothic'
plt.rcParams['font.size']=12
plt.rcParams['axes.unicode_minus']=False
plt.figure(figsize=(15,10))

plt.plot(X_axis,Y_axis)
plt.title('Discount Factor')
plt.xlabel('lamda')
plt.ylabel('J')
plt.grid(True, color='0.7',linestyle=':', linewidth=1)

```
![image](https://user-images.githubusercontent.com/56333934/92319089-ec8d7e80-f04f-11ea-9a3c-d74f47e55b3b.png)    

위와 같이 그래프가 그려져 교재에서 주어진 $ \lambda = 3.2286 $ 이 맞게 나왔다. 하지만, 실제 다른 데이터를 썼을 때는 상이한 결과가 나온다.

다음과 같이 실제 [미국 국고채 30년물](https://www.wsj.com/market-data/bonds/treasuries)의 데이터를 사용해보자.

![image](https://user-images.githubusercontent.com/56333934/92319132-4beb8e80-f050-11ea-8529-1cf3330b3011.png)    

똑같은 코드로 구현을 했을 때 다음과 같이 나온다.
![image](https://user-images.githubusercontent.com/56333934/92319134-66be0300-f050-11ea-9fbf-40b222783861.png)

왜 그런가 해서 생각해보니, 우선 주어진 파라미터 값이 이 데이터에 맞지 않기 때문이고, 최근 일자를 기준으로 채권 가격 데이터를 불러왔기 때문에 채권의 발행시점에서의 만기별 채권 가격 데이터를 쓴 교재와는 시점이 다르기 때문인 것 같다.
</div>
