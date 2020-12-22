---
title: "[파이썬 데이터분석 실무 테크닉 100]ch10-자연어처리"
categories:
  - Post Formats
tags:
  - python
  - data analysis
  - Natural Language Processing
---
![image](https://user-images.githubusercontent.com/56333934/93761301-88221000-fc48-11ea-954a-30257f36e227.png)

이 도서를 참고하였음.
{: .notice--primary }

<span class="material-icons" style='font-size:150px;'>face</span>
**"우리 회사는 오랫동안 이 도시에서 부동산업을 경영했습니다. 덕분에 정부 기관과의 유대감도 깊어서 부동산 업자의 관점에서 도시 건설 제안을 의뢰받는 경우가 있습니다. 그래서 우리 회사와 관계있는 고객과 동업자에게 협조를 받아 설문조사를 했습니다. 예상외로 많은 사람이 협력해주어서 전부 눈으로 훓어보기도 어려운 상황이 되어 버렸습니다. 조금만 읽어봐도 유익한 정보가 많아 AI를 사용해 분석했으면 합니다. 가능할까요?"**
{: style="color:#819FF7;"}

사용한 데이터는 다음과 같다.
1. survey.csv : 앙케트 결과[columns : datetime, comment, satisfaction]

## 데이터를 읽고 확인하자
```python
import pandas as pd
survey = pd.read_csv("survey.csv")
print(len(survey))
survey.head()
```
![image](https://user-images.githubusercontent.com/56333934/102886510-94607800-4498-11eb-9c6f-09ec5d18614f.png)

+결측치가 존재하여 제거해준다.(dropna())

### 불필요한 문자를 제거하자
```python
survey['comment'] = survey['comment'].str.replace("AA","")
survey['comment'] = survey['comment'].str.replace("\(.+?\)","") #괄호안의 1문자 이상을 제거
survey.head()
```
![image](https://user-images.githubusercontent.com/56333934/102886718-f91bd280-4498-11eb-8ad2-26687c603704.png)

## 형태소 분석해서 자주나오는 명사를 추출 + 관계업는 데이터는 제거
```python
all_words=[]
parts=['Noun']
for n in range(len(survey)):
    text = survey['comment'].iloc[n]
    words = twt.pos(text)
    words_arr=[]
    for i in words:
        if i=='EOS' or i =='':continue
        word_tmp=i[0]
        part = i[1]
        if not (part in parts) : continue
        words_arr.append(word_tmp)
    all_words.extend(words_arr)
print(all_words)
```
![image](https://user-images.githubusercontent.com/56333934/102886846-37b18d00-4499-11eb-8cad-3d31def2440e.png)

**빈도수가 많은 순서대로 출력**
```python
all_words_df = pd.DataFrame({"words":all_words, "count":len(all_words)*[1]})
all_words_df = all_words_df.groupby("words").sum()
all_words_df.sort_values("count",ascending=False).head()
```
![image](https://user-images.githubusercontent.com/56333934/102887051-8ced9e80-4499-11eb-8c96-618e8add3ad1.png)

## 고객 만족도와 자주 나오는 단어의 관계
```python
stop_words = ["더","수","좀"]
all_words=[]
parts=['Noun']
satisfaction = []
for n in range(len(survey)):
    text = survey['comment'].iloc[n]
    words = twt.pos(text)
    words_arr=[]
    for i in words:
        if i=='EOS' or i =='':continue
        word_tmp=i[0]
        part = i[1]
        if not (part in parts) : continue
        if word_tmp in stop_words:continue
        words_arr.append(word_tmp)
        satisfaction.append(survey['satisfaction'].iloc[n])
    all_words.extend(words_arr)
all_words_df = pd.DataFrame({"words":all_words, "satisfaction":satisfaction, 'count':len(all_words)*[1]})

words_satisfaction = all_words_df.groupby("words").mean()['satisfaction']
words_count = all_words_df.groupby("words").sum()['count']

words_df = words_df.loc[words_df['count']>=3]
display(words_df.sort_values("satisfaction", ascending=False).head(),words_df.sort_values("satisfaction").head())
```
![image](https://user-images.githubusercontent.com/56333934/102887250-ee157200-4499-11eb-9717-8bd15847e4cd.png)

## 의견을 특징으로 표현
숫자 기반 방법으로 어떤 단어가 포함돼 있는지를 특징으로 정의하여 유사한 문장을 찾아낸다.
```python
all_words_df=pd.DataFrame()
parts=['Noun']
satisfaction = []
for n in range(len(survey)):
    text = survey['comment'].iloc[n]
    words = twt.pos(text)
    words_df = pd.DataFrame()
    for i in words:
        if i=='EOS' or i =='':continue
        word_tmp=i[0]
        part = i[1]
        if not (part in parts) : continue
        words_df[word_tmp]=[1]
    all_words_df = pd.concat([all_words_df, words_df], ignore_index=True)
all_words_df = all_words_df.fillna(0)
all_words_df.head()
```
![image](https://user-images.githubusercontent.com/56333934/102887543-80b61100-449a-11eb-976d-b65f42e7656a.png)

**만족도가 높은 '육아'라는 키워드를 포함하는 '육아지원이 좋다'와 비슷한 설문지를 찾자**
```python
print(survey['comment'].iloc[2])
target_text = all_words_df.iloc[2]
print(target_text)
```
![image](https://user-images.githubusercontent.com/56333934/102887707-bfe46200-449a-11eb-95b2-a791835c5905.png)

**코사인 유사도 방법(특정량끼리의 각도로 유사도를 나타냄)을 이용해서 유사도 검색을 진행한다.**
```python
import numpy as np
cos_sim=[]
for i in range(len(all_words_df)):
    cos_text = all_words_df.iloc[i]
    cos = np.dot(target_text,cos_text)/(np.linalg.norm(target_text)*np.linalg.norm(cos_text))
    cos_sim.append(cos)
all_words_df['cos_sim'] = cos_sim
all_words_df.sort_values("cos_sim", ascending=False).head()
```
![image](https://user-images.githubusercontent.com/56333934/102887787-ddb1c700-449a-11eb-93e5-bbf8500c30ac.png)
```python
print(survey['comment'].iloc[2])
print(survey['comment'].iloc[15])
print(survey['comment'].iloc[24])
```
result :

육아 지원이 좋다
육아가 쉽다
육아하기에는 최고
