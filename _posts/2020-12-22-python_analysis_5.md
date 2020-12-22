---
title: "[파이썬 데이터분석 실무 테크닉 100]ch5-머신러닝"
categories:
  - Post Formats
tags:
  - python
  - data analysis
  - Machine learning
  - Decision tree
---
![image](https://user-images.githubusercontent.com/56333934/93761301-88221000-fc48-11ea-954a-30257f36e227.png)

이 도서를 참고하였음.
{: .notice--primary }

<span class="material-icons" style='font-size:150px;'>face</span>
**"이전 상세 분석에서 꽤 다양한 것들을 알 수 있었기 때문에 계속해서 분석을 부탁드립니다. 상세 분석 덕분에 새롭게 알게 된 것은 많지만, 잘 생각해 보면 회원을 정착시키고 늘려가는 것보다 탈퇴를 막는 것이 더중요한 것 같습니다. 탈퇴 회원이 왜 탈퇴했는지 알 수 있을까요?"**
{: style="color:#819FF7;"}

사용한 데이터는 다음과 같다.
1. use_log_months.csv : 4장에서 작성한 이용 이력을 연월/고객별로 집계한 데이터
2. customer_join.csv : 3장에서 작성한 이용 이력을 포함한 고객 데이터

##데이터를 읽고 확인하자
```python
import pandas as pd
customer = pd.read_csv('customer_join.csv')
uselog_months = pd.read_csv('use_log_months.csv')
```

## 데이터 전처리
4장에서와 같이 과거 6개월분의 데이터로부터 이용 횟수를 예측하는 경우, 가입 5개월 이내인 회원의 탈퇴는 예측할 수 없다. 따라서 이달과 1개월 전의 이용 횟수를 집계한 데이터를 작성한다.

```python
year_months = list(uselog_months['연월'].unique())
uselog= pd.DataFrame()
for i in range(1, len(year_months)):
    tmp = uselog_months.loc[uselog_months['연월']==year_months[i]]
    tmp.rename(columns={"count":"count_0"}, inplace=True)
    tmp_before = uselog_months.loc[uselog_months['연월']==year_months[i-1]]
    del tmp_before['연월']
    tmp_before.rename(columns={"count":"count_1"},inplace=True)
    tmp = pd.merge(tmp, tmp_before,on='customer_id', how='left')
    uselog = pd.concat([uselog, tmp], ignore_index=True)
uselog.head()
```
![image](https://user-images.githubusercontent.com/56333934/102865785-9cf58600-4479-11eb-84c3-9a82a15b89fb.png)

### 탈퇴한 고객의 데이터를 수집한다.
이 스포츠 센터의 탈퇴 절차는 탈퇴신청을 하면 다음 달 말에 탈퇴가 되는 것이기 때문에 end_date를 사용하면 안되고 end_date의 전월과 탈퇴 신청을 한 월의 1개월 전의 데이터를 이용해서 예측을 해야 탈퇴 신청 예측을 할 수 있다.

```python
from dateutil.relativedelta import relativedelta
exit_customer = customer.loc[customer['is_deleted']==1]
exit_customer['exit_date']=None
exit_customer['end_date']=pd.to_datetime(exit_customer['end_date'])
for i in range(len(exit_customer)):
    exit_customer['exit_date'].iloc[i] = exit_customer['end_date'].iloc[i]-relativedelta(months=1)
exit_customer['연월'] = exit_customer['exit_date'].dt.strftime("%Y%m")
uselog['연월'] = uselog['연월'].astype(str)
exit_uselog = pd.merge(uselog, exit_customer, on=['customer_id','연월'], how='left')
exit_uselog
```
![image](https://user-images.githubusercontent.com/56333934/102865947-d928e680-4479-11eb-8ebc-2fd58451f046.png)

**결측치 제거**
```python
exit_uselog = exit_uselog.dropna(subset=['name'])
exit_uselog.head()
```
![image](https://user-images.githubusercontent.com/56333934/102866077-0ecdcf80-447a-11eb-9baa-69589a2e6753.png)

###지속 회원의 데이터 수집
탈퇴 데이터가 1104개밖에 없기 때문에 지속회원 데이터 27422개를 전부 사용한다면 불균형 데이터가 될 것이다. 따라서 지속 회원 데이터도 회원당 1개가 되게 언더샘플링한다. 즉, 2018년 5월 A씨와 2018년 12월 A씨 중 하나만 선택한다.
```python
conti_customer = customer.loc[customer['is_deleted']==0]
conti_uselog = pd.merge(uselog, conti_customer, on=['customer_id'],how='left')
conti_uselog = conti_uselog.dropna(subset=["name"])

conti_uselog = conti_uselog.sample(frac=1).reset_index(drop=True)
conti_uselog = conti_uselog.drop_duplicates(subset="customer_id")
conti_uselog.head()
```
![image](https://user-images.githubusercontent.com/56333934/102866319-6704d180-447a-11eb-9cb6-a137cc9e2ee7.png)

**탈퇴회원과 지속 회원 결합**
```python
predict_data = pd.concat([conti_uselog, exit_uselog],ignore_index=True)
print(len(predict_data))
predict_data.head()
```
![image](https://user-images.githubusercontent.com/56333934/102866384-83a10980-447a-11eb-8756-101293e6f263.png)

### 유의미한 변수 추가
저번 장에서 했던 것처럼 회원기간을 설명변수로 추가해준다.
```python
predict_data['period']=0
predict_data['now_date']=pd.to_datetime(predict_data['연월'],format="%Y%m")
predict_data['start_date']=pd.to_datetime(predict_data['start_date'])
for i in range(len(predict_data)):
    delta = relativedelta(predict_data['now_date'][i], predict_data['start_date'][i])
    predict_data['period'][i] = int(delta.years*12+delta.months)
predict_data
```

### 결측치 제거
```python
predict_data.isna().sum()
```
![image](https://user-images.githubusercontent.com/56333934/102866638-ee524500-447a-11eb-9514-a8f55030de8b.png)

end_date와 exit_date는 탈퇴 고객만 있으며, 유지 회원은 결측치가 된다. count_1의 결손치만 제거한다.
```python
predict_data = predict_data.dropna(subset=['count_1'])
```

### 문자열 변수를 처리할 수 있게 가공하자
캠페인 구분, 회원구분, 성별과 같은 문자열 데이터를 가테고리 변수라고 한다. 이런 데이터도 머신러닝을 하는 데에 있어 중요한 변수가 된다. 설명 변수로는 1개월 전의 이용횟수 count_1, 카테고리 변수인 campaign, name,class_name, gender, routine_flag, period를 사용. 목적 변수로 탈퇴 플래그인 is_deleted(0 or 1)를 사용한다.

```python
target_col = ['campaign_name','class_name','gender','count_1','routine_flag','period','is_deleted']
predict_data = predict_data[target_col]
print(len(predict_data))
predict_data.head()
```
![image](https://user-images.githubusercontent.com/56333934/102866809-34a7a400-447b-11eb-983e-8ac7f3963bea.png)

더미 변수를 만든다.
```python
predict_data = pd.get_dummies(predict_data)
predict_data.head()
```
![image](https://user-images.githubusercontent.com/56333934/102866897-5012af00-447b-11eb-9969-5867b96dc64e.png)

**다중공선성 문제로 인해 컬럼 하나씩을 지워야 한다.**
```python
del predict_data['campaign_name_2_일반']
del predict_data['class_name_2_야간']
del predict_data['gender_M']
predict_data.head()
```
![image](https://user-images.githubusercontent.com/56333934/102867102-97993b00-447b-11eb-80f8-8187448d3f40.png)

## 의사결정 트리를 사용해서 탈퇴 예측 모델 구축
```python
from sklearn.tree import DecisionTreeClassifier
import sklearn.model_selection

exit = predict_data.loc[predict_data['is_deleted']==1]
conti = predict_data.loc[predict_data['is_deleted']==0].sample(len(exit)) #탈퇴 회원 수만큼의 데이터를 유지회원에서 추출한다.

X = pd.concat([exit,conti],ignore_index=True)
y = X['is_deleted']
del X['is_deleted']
X_train, X_test, y_train, y_test = sklearn.model_selection.train_test_split(X,y)

model = DecisionTreeClassifier(random_state=0)
model.fit(X_train, y_train)
y_test_pred = model.predict(X_test)
print(y_test_pred)
```
![image](https://user-images.githubusercontent.com/56333934/102867282-e47d1180-447b-11eb-8c5b-aa3848274e07.png)

출력 결과를 보면 0 또는 1이 표시되며, 1은 탈퇴, 0은 유지를 의미한다.
{: .notice--info}

### 정확도 검사
```python
print(model.score(X_test,y_test))
print(model.score(X_train, y_train))
```
result = 0.9068441064638784, 0.9778200253485425

train의 정확도가 test보다 높은 것으로 보아 학습용 데이터에 과적합(overfitting) 된 것을 볼 수 있다. 따라서 이 문제를 해결하기 위해 의사결정나무의 깊이를 5로 제한하여 모델을 단순하게 만든다. 이렇게 하면 의사결정 나무가 5단계에서 진행을 멈추게 된다.

```python
X = pd.concat([exit,conti],ignore_index=True)
y = X['is_deleted']
del X['is_deleted']
X_train, X_test, y_train, y_test = sklearn.model_selection.train_test_split(X,y)

model = DecisionTreeClassifier(random_state=0, max_depth=5)
model.fit(X_train, y_train)
print(model.score(X_test,y_test))
print(model.score(X_train, y_train))
```
result = 0.8973384030418251, 0.9309252217997465

### 변수 기여도 확인
```python
importance = pd.DataFrame({'feature_names':X.columns, 'coefficient':model.feature_importances_})
importance
```
![image](https://user-images.githubusercontent.com/56333934/102867863-bea43c80-447c-11eb-889f-1f5a3e874388.png)

### 회원 탈퇴를 예측하자
```python
count_1 = 3
routine_flag = 1
period= 10
campaign_name = "입회비무료"
class_name = "종일"
gender='M'
if campaign_name == "입회비반값할인":
    campaign_name_list = [1,0]
elif campaign_name == "입회비무료":
    campaign_name_list = [0,1]
elif campaign_name=='일반':
    campaign_name_list=[0,0]
if class_name =='종일':
    class_name_list = [1,0]
elif class_name=="주간":
    class_name_list = [0,1]
elif class_name=='야간':
    class_name_list=[0,0]
if gender=='F':
    gender_list=[1]
elif gender=='M':
    gender_list=[0]
input_data = [count_1, routine_flag, period]
input_data.extend(campaign_name_list)
input_data.extend(class_name_list)
input_data.extend(gender_list)

print(model.predict([input_data]))
print(model.predict_proba([input_data]))
```
![image](https://user-images.githubusercontent.com/56333934/102868002-f3b08f00-447c-11eb-87e9-e9d62de14df5.png)

예측 결과는 1(탈퇴)이며, 정확도는 99%로 나왔다.
