---
title: "[파이썬 데이터분석 실무 테크닉]ch3"
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
**"제가 운영하는 스포츠 센터는 트레이닝 붐 덕분에 지금까지 고객 수가 늘었습니다. 그런데 최근 1년간 고객 수가 늘지 않는 것 같습니다. 자주 이용하는 고객은 계속 오지만, 가끔 오는 고객은 어느새 오지 않는 경우도 생기는 것 같습니다. 제대로 데이터를 분석한 적이 없어서 어떤 고객이 계속 이용하고 있는지조차 모릅니다. 데이터 분석을 하면 뭔가 알 수 있을까요?"**
{: style="color:#819FF7;"}

이 스포츠 센터의 데이터는 다음과 같다.
1. use_log.csv : 센터의 이용 이력 데이터, 기간은 2018년 4월~2019년 3월 [columns : log_id, customer_id, usedate]
2. customer_master.csv : 2019년 3월 말 시점의 회원 데이터 [columns : customer_id, name, class, gender, start_date, end_date, campaign_id, is_deleted]
3. class_master.csv : 회원 구분 데이터(종일, 주간, 야간) [columns : class, class_name, price]
4. campaign_master.csv : 행사 구분 데이터(입회비 유무 등) [columns : campaign_id, campaign_name]

## 1. 데이터를 읽어온다
```python
import pandas as pd
uselog = pd.read_csv('use_log.csv')
print(len(uselog))

customer = pd.read_csv('customer_master.csv')
print(len(customer))

class_master = pd.read_csv('class_master.csv')
print(len(class_master))

campaign_master= pd.read_csv('campaign_master.csv')
print(len(campaign_master))

display(uselog.head(), customer.head(), class_master, campaign_master)
```
![image](https://user-images.githubusercontent.com/56333934/95074842-2aaeb880-074a-11eb-9e59-fa990bbb614a.png)

## 2. 데이터 가공하기
customer_master 와 class_master, campaign_master를 'class' 열과 'campaign_id'를 기준으로 결합한다.

```python
customer_join = pd.merge(customer, class_master, on='class', how='left')
customer_join = pd.merge(customer_join, campaign_master, on='campaign_id', how='left')
display(customer_join.head())
print(len(customer_join))
customer_join.isnull().sum()
```
![image](https://user-images.githubusercontent.com/56333934/95075093-93963080-074a-11eb-8cad-86e154bbd8ca.png)

**isnull() 함수를 통해 결측치가 존재하는지 확인한다. end_date에 null값이 있는 것은 현재 등록되어 있는 고객들은 end_date값이 없기 때문이다.**

## 3. 고객 데이터 집계하기

```python
#우선 캠페인 구분과 성별, 이미 탈퇴를 했는지 안는지
display(customer_join.groupby("class_name").count()["customer_id"], \
        customer_join.groupby("campaign_name").count()["customer_id"], \
        customer_join.groupby("gender").count()["customer_id"], \
        customer_join.groupby("is_deleted").count()["customer_id"])
```
![image](https://user-images.githubusercontent.com/56333934/95075365-00a9c600-074b-11eb-883c-74bbe10bedf5.png)

이 집계 데이터를 통해 회원 클래스는 종일반이 거의 절반을 차지하고 야간 다음, 주간 순인 것과 캠페인은 일반 입회가 많고, 입회 캠페인에 의한 가임이 약 20%임을 알 수 있다. 또한 남녀 비율은 남자쪽이 조금 더 많고 현재 가입된(등록된) 고객은 2842명임을 알 수 있다.
{: .notice--primary}

## 4. 최신 고객 데이터를 집계하자
오래된 데이터보다는 최근 데이터가 더 의미가 있을 수 있기 때문에 기간 만료가 2019년 3월 31일 이후이거나 end_date값이 없는 회원들만 추려본다.

```python
customer_join['end_date'] = pd.to_datetime(customer_join["end_date"])
customer_newer = customer_join.loc[(customer_join["end_date"]>=pd.to_datetime("20190331")) | (customer_join["end_date"].isna())]
print(len(customer_newer))
```
```
out:2953
```
여기서 한 가지 든 의문은 총 고객 중 현재 등록되어 있는(is_deleted가 0인) 회원은 2842명인데 최근 고객의 수가 더 많을까? 생각해보니, 3월 31일 혹은 4월 30일이 마지막 운동인 회원의 경우 is_deleted는 1로 기록되어 있기 때문이었다. 그 수가 2953-2842 =
111명이 되어야 되는데 한번 확인해 보았다.

```python
cn = customer_join.loc[customer_join["end_date"]>=pd.to_datetime("20190331")]
print(len(cn))
```
```
out : 111
```

## 5. 이용 이력 데이터를 집계하자.
월 이용 횟수의 평균값, 중앙값, 최댓값, 최솟값과 정기적 이용 여부를 플래그로 작성해서 고객 데이터에 추가한다.

+ 월 이용 횟수 집계
```python
uselog['usedate'] = pd.to_datetime(uselog["usedate"])
uselog["연월"] = uselog["usedate"].dt.strftime("%Y%m")
uselog_months = uselog.groupby(["연월", "customer_id"], as_index = False).count()
uselog_months.rename(columns = {"log_id":"count"}, inplace=True)
del uselog_months["usedate"]
uselog_months.head()
```
![image](https://user-images.githubusercontent.com/56333934/95076932-98101880-074d-11eb-8bec-7db35cea7550.png)

통계값은 다음과 같다.
```python
uselog_customer = uselog_months.groupby("customer_id").agg(["mean", "median", "max","min"])["count"]
uselog_customer=uselog_customer.reset_index(drop=False)
uselog_customer.head()
```
![image](https://user-images.githubusercontent.com/56333934/95077077-de657780-074d-11eb-81ca-25852eec00b5.png)

AS002855 회원 같은 경우 월 평균 4.5회 중앙값은 5회 최댓값은 7회, 최솟값은 2회 이용하는 것으로 확인할 수 있다.

+ 정기적/비정기적 스포츠 센터 이용 여부
월 별 정기적 이용 여부는 고객에 따라 다르겠지만, 여기서는 고객마다 월/요일별로 집계하고, 최댓값이 4이상인 요일이 하나라도 있는 회원은 플래그를 1로 기록한다.

```python
uselog["weekday"] = uselog["usedate"].dt.weekday
uselog_weekday = uselog.groupby(["customer_id","연월", "weekday"], as_index=False).count()[["customer_id","연월","weekday","log_id"]]
uselog_weekday.rename(columns={"log_id" : "count"}, inplace=True)

#고객별로 최댓값을 계산하고 그 최댓값이 4이상인 경우에 플래그
uselog_weekday = uselog_weekday.groupby("customer_id",as_index=False).max()[["customer_id","count"]]
uselog_weekday["routine_flag"]=0
uselog_weekday["routine_flag"] = uselog_weekday["routine_flag"].where(uselog_weekday["count"]<4,1)
uselog_weekday
```
![image](https://user-images.githubusercontent.com/56333934/95077347-4fa52a80-074e-11eb-857d-8e624846b166.png)

## 6. 고객 데이터와 이용 이력 데이터를 결합하고 회원 기간을 계산하기

```python
customer_join = pd.merge(customer_join, uselog_customer, on='customer_id', how="left")
customer_join = pd.merge(customer_join, uselog_weekday[["customer_id","routine_flag"]], on="customer_id", how="left")
customer_join.head()
```
![image](https://user-images.githubusercontent.com/56333934/95077927-4d8f9b80-074f-11eb-939d-1c66865fa264.png)

회원 기간을 계산하는 방법은 end_date와 start_date의 기간 차이를 이용할 것인데 end_date의 값이 없는 회원들의 경우 2019년 4월 30일로 채워서 계산하기로 한다.

```python
from dateutil.relativedelta import relativedelta
customer_join["calc_date"] = customer_join["end_date"]
customer_join["calc_date"] = customer_join["calc_date"].fillna(pd.to_datetime("20190430"))
customer_join["membership_period"] = 0
for i in range(len(customer_join)):
    delta = relativedelta(customer_join["calc_date"].iloc[i], customer_join["start_date"].iloc[i])
    customer_join["membership_period"].iloc[i] = delta.years*12 + delta.months
customer_join["membership_period"]
```
![image](https://user-images.githubusercontent.com/56333934/95078171-a9f2bb00-074f-11eb-8bd4-b93cc029d2d0.png)

다음과 같이 고객 데이터에 새로운 열(membership_period)를 추가해 등록 기간을 월 수로 입력한다.

## 7. 고객 행동의 각종 통계량을 파악하기
그래프를 이용해 회원 기간의 분포를 살펴보자.

```python
import matplotlib.pyplot as plt
%matplotlib inline
plt.hist(customer_join["membership_period"])
```
![image](https://user-images.githubusercontent.com/56333934/95078639-69477180-0750-11eb-958b-77be30eb85f0.png)

10개월 이전의 회원 수가 많고 10개월 이후부터는 일정한 것을 볼 수 있다. 이는 짧은 기간에 고객이 빠져나가는 업계라는 것을 시사한다.

## 8. 탈퇴회원과 지속 회원의 차이를 파악하기

```python
customer_end = customer_join.loc[customer_join["is_deleted"]==1]
customer_stay = customer_join.loc[customer_join["is_deleted"]==0]
display(customer_end.describe(), customer_stay.describe())
```
![image](https://user-images.githubusercontent.com/56333934/95084178-7b2d1280-0758-11eb-8eb7-388538a88567.png)

결과를 보면, 탈퇴 회원의 매월 이용 횟수의 평균값, 중앙값, 최댓값, 최솟값은 모두 지속 회원보다 작다. 특히, 반면에 매월 최대 이용 횟수의 평균값은 지속 회원이 높기는 하지만, 탈퇴 회원도 6.4 정도 이다. routine_flag의 평균값은 차이가 크게 나서 지속 회원은 0.98로 많은 회원이 정기적으로 이용하고 있다는 것을 알 수있지만, 탈퇴 회원은 0.45로 거의 절반은 랜덤하게 이용하고 있다고 생각할 수 있다.
{: .notice--warning}
