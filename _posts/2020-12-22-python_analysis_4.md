---
title: "[파이썬 데이터분석 실무 테크닉 100]ch4-머신러닝"
categories:
  - Post Formats
tags:
  - python
  - data analysis
  - Machine learning
  - Kmeans
  - Clustering
---
![image](https://user-images.githubusercontent.com/56333934/93761301-88221000-fc48-11ea-954a-30257f36e227.png)

이 도서를 참고하였음.
{: .notice--primary }

<span class="material-icons" style='font-size:150px;'>face</span>
**"지난번 분석으로 어느 정도 경향을 파악할 수 있었습니다. 아직 전체적인 경향밖에 파악하지 못해서 이번에는 좀 더 구체적인 분석을 부탁드리려고 합니다. 고객별로 이용 경향이 다르기 때문에 이런 경향을 분석해서 고객별 이용 횟수 같은 것도 예측할 수 있지 않을까 라는 생각이 듭니다. 가능한가요?"**
{: style="color:#819FF7;"}

사용한 데이터는 다음과 같다
1. ure_log.csv : 스포츠 센터의 이용 이력 데이터. 기간은 2018년 4월~2019 3월  [columns : log_id, customer_id, usedate]
2. customer_join.csv : 3장에서 작성한 이용 이력을 포함한 고객 데이터

## 데이터를 읽어들이고 확인하자

```python
import pandas as pd
uselog = pd.read_csv('use_log.csv')
uselog.head() ```
![image](https://user-images.githubusercontent.com/56333934/102854449-e8059e00-4465-11eb-8055-a2f20253b7be.png)

```python
customer = pd.read_csv('customer_join.csv')
customer.head()
```
![image](https://user-images.githubusercontent.com/56333934/102854519-08cdf380-4466-11eb-8a75-c6cda2daaa55.png)

## 클러스터링으로 회원을 그룹화한다.

mean,median,max,min과 membership_period는 데이터가 달라 표준화 시키기

```python
customer_clustering = customer[["mean","median","max","min","membership_period"]]
from sklearn.cluster import KMeans
from sklearn.preprocessing import StandardScaler
sc = StandardScaler()
customer_clustering_sc = sc.fit_transform(customer_clustering)
Kmeans = KMeans(n_clusters=4, random_state=0)
clusters = Kmeans.fit(customer_clustering_sc)
customer_clustering['cluster']=clusters.labels_
print(customer_clustering['cluster'].unique())
customer_clustering.head()
```
![image](https://user-images.githubusercontent.com/56333934/102854615-36b33800-4466-11eb-80b5-57910c536ea7.png)

**컬럼명을 한글로 변경한 후 이용횟수를 집계해본다**
```python
customer_clustering.columns=["월평균값","월중앙값","월최댓값","월최솟값","회원기간","cluster"]
customer_clustering.groupby("cluster").count()
```
![image](https://user-images.githubusercontent.com/56333934/102854667-55b1ca00-4466-11eb-988d-fe4de093097d.png)

그룹0의 인원이 가장 많고 그룹 1이 가장 적은 것을 알 수 있다.
{: .notice--primary}

**평균 이용률을 집계해본다**
```python
customer_clustering.groupby("cluster").mean()
```
![image](https://user-images.githubusercontent.com/56333934/102854790-97db0b80-4466-11eb-83aa-26b62836b4d9.png)

그룹2의 경우 회원기간은 가장 짧지만 이용률이 높고 그룹1은 회원기간도 짧고 이용률도 낮다. 그룹3은 반면에 회원기간이 가장 오래됐지만 이용률은 대체적으로 낮다
{: .notice--primary}

## 클러스터링 결과를 가시화하기
**변수가 많으므로 PCA 분석을 진행한다.**

```python
from sklearn.decomposition import PCA
X = customer_clustering_sc
pca = PCA(n_components=2)
pca.fit(X)
x_pca = pca.transform(X)
pca_df = pd.DataFrame(x_pca)
pca_df['Cluster'] = customer_clustering['cluster']

import matplotlib.pyplot as plt
%matplotlib inline
for i in customer_clustering['cluster'].unique():
    tmp = pca_df.loc[pca_df['Cluster']==i]
    plt.scatter(tmp[0],tmp[1])
```

![image](https://user-images.githubusercontent.com/56333934/102854910-e688a580-4466-11eb-873d-37b49adc6804.png)

## 각 그룹별로 지속회원과 탈퇴 회원 확인
```python
customer_clustering = pd.concat([customer_clustering,customer],axis=1)
customer_clustering.groupby(['cluster','is_deleted'],as_index=False).count()[['cluster','is_deleted','customer_id']]
```
![image](https://user-images.githubusercontent.com/56333934/102854957-04560a80-4467-11eb-817d-40f275a9d1df.png)

그룹 2와 3은 지속 회원이 많고 그룹 1은 탈퇴회원만 있다.
따라서 그룹2는 회원 기간이 짧지만 초기에 의욕적이어서 전체적으로 이용률이 높으며, 그룹3은 회원 기간이 길고 이용률이 그룹 2보다 낮지만 지속 회원이 많은 것을 생각하면 이용이 안정적이다.
{: .notice--info}

## 이용 횟수 예측 모델
```python
uselog['usedate'] = pd.to_datetime(uselog['usedate'])
uselog["연월"] = uselog['usedate'].dt.strftime('%Y%m')
uselog_months = uselog.groupby(["연월","customer_id"],as_index=False).count()
uselog_months.rename(columns={"log_id":"count"},inplace=True)
del uselog_months['usedate']
uselog_months.head()
```
![image](https://user-images.githubusercontent.com/56333934/102855105-572fc200-4467-11eb-9376-14c4410ac9f3.png)

```python
year_months = list(uselog_months['연월'].unique())
predict_data = pd.DataFrame()
for i in range(6, len(year_months)):
    tmp = uselog_months.loc[uselog_months['연월']==year_months[i]]
    tmp.rename(columns={"count":"count_pred"}, inplace=True)
    for j in range(1,7):
        tmp_before = uselog_months.loc[uselog_months['연월']==year_months[i-j]]
        del tmp_before["연월"]
        tmp_before.rename(columns={'count':'count_{}'.format(j-1)}, inplace=True)
        tmp = pd.merge(tmp, tmp_before, on='customer_id',how='left')
    predict_data = pd.concat([predict_data, tmp],ignore_index=True)
predict_data.head()
```
**count_pred는 예측하고 싶은 달의 데이터이고, count_0이 1개월 전으로 과거 6개월의 데이터를 나열한 것이다.**

![image](https://user-images.githubusercontent.com/56333934/102855289-b8f02c00-4467-11eb-9ef6-3c10f88c71dc.png)

+결측치는 제거한다(dropna). 그럼 대상 회원은 6개월 이상 재적 중인 회원이 된다.

## 특징 변수 추가
```python
predict_data = pd.merge(predict_data, customer[["customer_id","start_date"]], on='customer_id', how='left')
```
회원 가입을 한 날짜는 해당 회원의 재적 기간을 알 수 있기 때문에 유의미한 변수가 될 것 같다.

**회원 기간 계산**
```python
predict_data['now_date']= pd.to_datetime(predict_data['연월'],format="%Y%m")
predict_data['start_date'] = pd.to_datetime(predict_data['start_date'])
from dateutil.relativedelta import relativedelta
predict_data['period'] = None
for i in range(len(predict_data)):
    delta = relativedelta(predict_data['now_date'][i], predict_data['start_date'][i])
    predict_data['period'][i] = delta.years*12 + delta.months
predict_data.head()
```
![image](https://user-images.githubusercontent.com/56333934/102855584-40d63600-4468-11eb-9e3c-e6fed6966104.png)

### 모델 구축
선형 회귀 모델을 사용하며, 2018년 4월 이후에 새로 가임한 회원에 한해 모델을 작성.

```python
predict_data = predict_data.loc[predict_data['start_date']>=pd.to_datetime("20180401")]
from sklearn import linear_model
import sklearn.model_selection
model =linear_model.LinearRegression()
X = predict_data[["count_0","count_1","count_2","count_3","count_4","count_5","period"]]
y=predict_data["count_pred"]
X_train, X_test, y_train, y_test = sklearn.model_selection.train_test_split(X,y)
model.fit(X_train,y_train)

print(model.score(X_train,y_train))
print(model.score(X_test, y_test))
```
![image](https://user-images.githubusercontent.com/56333934/102855800-a296a000-4468-11eb-99e3-23c264a72c44.png)

### 상관관계(변수 기여도) 분석
```python
coef = pd.DataFrame({"feature_names":X.columns,"coefficient":model.coef_})
coef
```
![image](https://user-images.githubusercontent.com/56333934/102855856-c22dc880-4468-11eb-8209-22f094dfdfe2.png)

### 다음 달 이용 횟수 예측
```python
x1 = [3,4,4,6,8,7,8]
x2 = [2,2,3,3,4,6,8]
x_pred = [x1,x2]
model.predict(x_pred)
```
Result = array([3.8172868 , 1.95985645])
