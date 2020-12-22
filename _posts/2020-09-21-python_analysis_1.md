---
title: "[파이썬 데이터분석 실무 테크닉 100]ch1"
categories:
  - Post Formats
tags:
  - python
  - data analysis
---

![image](https://user-images.githubusercontent.com/56333934/93761301-88221000-fc48-11ea-954a-30257f36e227.png)

이 도서를 참고하였음.
{: .notice--primary }

<span class="material-icons" style='font-size:150px;'>face</span>
**우리 회사는 오랫동안 쇼핑몰 사이트를 운영하고 있습니다. 고객 정보는 전부 쇼핑몰 사이트에서 관리하고 있어 데이터는 많습니다. 지금 많은 기업이 데이터 분석으로 성과를 내고 있다고 들어서 우리 회사도 현재 유행하는 데이터 분석을 도입하려고 합니다. 하지만 대부분의 사원이 문과 출신이라 데이터 분석에 어둡고 무엇부터 시작해야 할지 잘 모릅니다. 지금 상황에는 이번 달 매출을 파악하는 것만으로도 벅찹니다. 우리 회사 쇼필몰 사이트의 데이터 분석을 부탁드립니다."**
{: style="color:#819FF7;"}

이 회사의 데이터는 다음과 같다
1. customer_master.csv : 고객 데이터, 이름 성별 등 [columns : customer_id, customer_name, registration_date, email, gender, age, birth, pref(지역)]
2. item_master.csv : 취급하는 상품 데이터, 상품명, 가격 등 [columns : item_id, item_name, item_price]
3. transaction_1.csv, transaction_2.csv : 구매내역 데이터 [columns : transaction_id, price, payment_date, customer_id]
4. transaction_detail_1.csv, transaction_detail_2.csv : 구매내역 상세 데이터 [columns : detail_id, transaction_id, item_id, quantity]

## 1. 각 데이터를 읽어온다.
```python
import pandas as pd

customer_master = pd.read_csv('customer_master.csv')
item_master = pd.read_csv('item_master.csv')
transaction_1 = pd.read_csv('transaction_1.csv')
transaction_detail_1 = pd.read_csv('transaction_detail_1.csv')
transaction_2 = pd.read_csv('transaction_2.csv')
transaction_detail_2 = pd.read_csv('transaction_detail_2.csv')
transaction = pd.concat([transaction_1,transaction_2], ignore_index=True)
transaction_detail = pd.concat([transaction_detail_1,transaction_detail_2],ignore_index=True)
display(customer_master.head(), item_master.head(),transaction.head(), transaction_detail.head())
```
![image](https://user-images.githubusercontent.com/56333934/93763047-ae957a80-fc4b-11ea-83ce-3cd2c69ddece.png)


## 2. 데이터를 결합(유니온) 한다
```python
join_data = pd.merge(transaction_detail, transaction[["transaction_id","payment_date", "customer_id"]], on='transaction_id', how='left')
#거래세부내역의 transaction_id를 기준으로 transaction테이블의 payment_date와 customer_id 열을 left join한다.

join_data = pd.merge(join_data, customer_master, on='customer_id', how='left')
#조인된 테이블에 customer_id를 기준으로 cusomer_master테이블과 left join한다.

join_data["price"] = join_data["quantity"] * join_data["item_price"]
join_data
```
![image](https://user-images.githubusercontent.com/56333934/93763385-501ccc00-fc4c-11ea-9086-95d1696aba8d.png)

데이터를 가공하며 검산 과정을 꼭 들어가야 한다.
{: .notice--warning}

### 3. 각종 통계량 파악

데이터 분석을 진행할 떄는 먼저 크게 두 가지 숫자를 파악해야 한다. 첫 번째는 결손치의 개수, 두 번째는 전체를 파악할 수 있는 숫자감
{: .notice--warning}

```python
join_data.isnull().sum() #결손치의 개수
```
![image](https://user-images.githubusercontent.com/56333934/93763846-1d270800-fc4d-11ea-9d36-d8b5dcc5bc48.png)

```python
join_data.describe()
```
![image](https://user-images.githubusercontent.com/56333934/93763951-3f208a80-fc4d-11ea-847b-50699932fd38.png)

## 4. 데이터 집계
1. 시계열 상황을 보기 위하여 각 데이터의 날짜 타입을 datetime으로 바꾸고 groupby를 통해 월별 매출을 파악한다.
```python
join_data["payment_date"] = pd.to_datetime(join_data['payment_date'])
join_data['payment_month'] = join_data["payment_date"].dt.strftime("%Y%m")
join_data[["payment_date","payment_month"]].head()
join_data.groupby("payment_month").sum()['price']
```
![image](https://user-images.githubusercontent.com/56333934/93764345-e56c9000-fc4d-11ea-8310-223d7183b673.png)

2. 월별, 상품별 매출 파악하기
```python
join_data.groupby(["payment_month", "item_name"]).sum()[["price","quantity"]]
```
![image](https://user-images.githubusercontent.com/56333934/93764544-472cfa00-fc4e-11ea-98f3-9625496b5eca.png)

pivot_table을 이용하여 집계해본 결과
```python
pd.pivot_table(join_data, index="item_name", columns='payment_month', values=["price","quantity"], aggfunc='sum')
```
![image](https://user-images.githubusercontent.com/56333934/93764659-7479a800-fc4e-11ea-95ee-d8df1a2b07de.png)

## 5. 시각화
```python
import matplotlib.pyplot as plt
%matplotlib inline

graph_data = pd.pivot_table(join_data, index="payment_month", columns="item_name", values="price", aggfunc='sum')
x= list(graph_data.index)
plt.plot(x, graph_data["PC-A"], label="PC-A")
plt.plot(x, graph_data["PC-B"], label="PC-B")
plt.plot(x, graph_data["PC-C"], label="PC-C")
plt.plot(x, graph_data["PC-D"], label="PC-D")
plt.plot(x, graph_data["PC-E"], label="PC-E")
```
![image](https://user-images.githubusercontent.com/56333934/93764765-aa1e9100-fc4e-11ea-8027-b2311f1cd3b9.png)

시각화된 데이터를 보면 PC-E가 매출을 견인하는 기종이라는 점과 매출 추이를 파악하는데 도움이 된다.
{: .notice--warning}
