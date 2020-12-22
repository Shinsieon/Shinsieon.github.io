---
title: "[파이썬 데이터분석 실무 테크닉 100]ch2"
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
**"우리 회사에서는 고객 정보를 엑셀로 관리합니다. 장사는 잘되고 대리점의 매출도 안정적입니다. 데이터가 풍부할 때 데이터 분석을 해두면 여러 가지 발견을 할 수 있지 않을까 합니다. 시험 삼아 데이터 분석을 부탁드립니다."**
{: style="color:#819FF7;"}

이 회사의 데이터는 다음과 같다
1. uriage.csv : 매출 이력 기간은 2019-01~2019-07 [columns : purchase_date, item_name, item_price, customer_name]
2. kokyaku_daicho.xlsx : 대리점에서 관리하는 고객 정보 [columns : 고객이름, 지역, 등록일]

## 1. 데이터를 읽어온다.
```python
import pandas as pd
uriage_data = pd.read_csv("uriage.csv")
kokyaku_data = pd.read_excel("kokyaku_daicho.xlsx")
display(uriage_data.head(),kokyaku_data.head())
```
![image](https://user-images.githubusercontent.com/56333934/95012910-62006500-0677-11eb-8044-509441c5cbd2.png)

## 2. 데이터의 오류를 수정한다.
현재 데이터를 살펴보면 크게 네 가지 오류가 존재한다.
+ uriage_data의 item_price 열에 결측치 (NAN)이 존재한다.    

+ uriage_data의 item_name 열에 상품명의 형태가 일관되지 않다. ex)상품 A, 상품a 는 서로 다르게 인식된다.

+ kokyaku_data의 등록일 열에 날짜 값이 엑셀의 숫자(ex.42782) 형태로 입력되어있다.

+ kokyaku_data의 고객이름 열에 이름의 형태가 일관되지 않다. ex) 김현성, 김 현성 은 서로 다르게 인식된다.

차례대로 데이터의 오류를 수정하는 코드를 살펴보자.

- - -

### 1. 결측치 (NAN) 오류

```python
flg_is_null = uriage_data["item_price"].isnull()
for trg in list(uriage_data.loc[flg_is_null, "item_name"].unique()):
    price = uriage_data.loc[(~flg_is_null) & (uriage_data["item_name"] == trg), "item_price"].max()
    uriage_data["item_price"].loc[(flg_is_null) & (uriage_data["item_name"]==trg)] =price
uriage_data.head()
```

**해결방법**    
flg_is_null 에 결측치행 값을 입력. 행마다 결측치가 있으면 True, 없으면 False 인  새로운 series가 생긴다. 이 행들에 대한 반복문을 수행하는데 결측치가 False이고 item_name이 일치하는 다른 행의 item_price 중 max값을 해당 결측치가 존재하는 행의 item_price에 대입을 한다. 이렇게 하면 NAN이었던 item_price가 동일 상품의 최대가격 값으로 대체된다.
{: .notice--warning}

![image](https://user-images.githubusercontent.com/56333934/95013216-d76d3500-0679-11eb-830f-46509e7b6cf6.png)

**검증**
```python
for trg in list(uriage_data["item_name"].sort_values().unique()):
    print(trg + "의 최고가:" + str(uriage_data.loc[uriage_data["item_name"]==trg]["item_price"].max())+
         "의 최저가 : " + str(uriage_data.loc[uriage_data["item_name"]==trg]["item_price"].min(skipna=False)))

#최고가와 최저가가 일치하므로 완료
```
![image](https://user-images.githubusercontent.com/56333934/95013609-6713e300-067c-11eb-829b-af42bfa5de9d.png)

```python
uriage_data.isnull().any(axis=0)
```
![image](https://user-images.githubusercontent.com/56333934/95013619-7b57e000-067c-11eb-800b-f264889410f7.png)


### 2. 상품명 오류
```python
uriage_data["item_name"].head()
print(len(pd.unique(uriage_data.item_name)))
```

```
out: 99
```
다음과 같이 원래 상품은 상품A 부터 상품Z까지 26개여야 하지만 99개가 나오는 것을 볼 수 있다.

**수정 코드**
```python
uriage_data['item_name'] = uriage_data['item_name'].str.upper()
uriage_data['item_name'] = uriage_data['item_name'].str.replace(" ", "")
uriage_data['item_name'] = uriage_data['item_name'].str.replace("  ", "")
uriage_data.sort_values(by=["item_name"], ascending=True)
```

**검증**
```python
print(len(pd.unique(uriage_data.item_name)))
```

```
out: 26
```

### 3. 날짜 수정
```python
#엑셀 데이터를 취급할 때 주의해야 할 점으로 '서식이 다른 데이터가 섞여 있을 수 있다'라는 점을 들 수 있다.
flg_is_serial = kokyaku_data["등록일"].astype("str").str.isdigit()
flg_is_serial.sum()
```

```python
out: 22   #숫자로 된 날짜 형식의 개수가 22개
```
**수정 코드**
```python
fromSerial = pd.to_timedelta(kokyaku_data.loc[flg_is_serial, "등록일"].astype("float")-2, unit="D") + pd.to_datetime("1900/01/01")

#pd.to_timedelta() 함수를 이용해서 숫자를 날짜로 변환한다. loc()을 이용해서 flg_is_serial 조건으로 데이터를 추출하고 변경한다. 엑셀 날짜 형식의 숫자는 파이썬과 이틀 어긋나기 떄문에 담으과 같이 엑셀 숫잣값에서 2를 빼서 처리한다.

#날짜로 변환된 데이터도 서식을 통일
fromString = pd.to_datetime(kokyaku_data.loc[~flg_is_serial,"등록일"])
kokyaku_data["등록일"] = pd.concat([fromSerial, fromString])
display(kokyaku_data)
```
![image](https://user-images.githubusercontent.com/56333934/95013691-e86b7580-067c-11eb-9e90-203515d547a6.png)

### 4. 고객이름 오류
```python
kokyaku_data["고객이름"] = kokyaku_data["고객이름"].str.replace(" ","")
kokyaku_data["고객이름"] = kokyaku_data["고객이름"].str.replace("  ","")
```

- - -

## 3. 데이터 결합 후 덤프하기
데이터 분석을 위해 매출 이력과 고객 정보를 결합한 데이터를 작성한다.
```python
#고객 이름을 키로 두개의 데이터를 결합하기
join_data = pd.merge(uriage_data, kokyaku_data, left_on="customer_name", right_on="고객이름", how="left")
join_data = join_data.drop("customer_name", axis=1) #customer_name 열 제거
join_data
```
![image](https://user-images.githubusercontent.com/56333934/95013747-40a27780-067d-11eb-9311-602a93154261.png)

깨끗해진 데이터를 파일로 출력(덤프)해두고, 분석할 때 출력한 파일을 다시 읽어 들이면 데이터 정제를 다시 할 필요가 없다.

```python
dump_data = join_data[["purchase_date","purchase_month", "item_name", "item_price", "고객이름", "지역", "등록일"]]
dump_data.to_csv("dump_data.csv", index=False)
```

## 4. 데이터 집계하기
+ 구입 연월, 상품 집계 결과
```python
import_data = pd.read_csv("dump_data.csv")
byItem = import_data.pivot_table(index="purchase_month", columns="item_name", aggfunc="size", fill_value=0)
```
![image](https://user-images.githubusercontent.com/56333934/95013858-fd94d400-067d-11eb-98e2-fdc6b1abd035.png)

+ 구입연월, 매출 금액 집계 결과
```python
byPrice = import_data.pivot_table(index="purchase_month", columns="item_name", values="item_price", aggfunc="sum", fill_value=0)
```
![image](https://user-images.githubusercontent.com/56333934/95013876-1ef5c000-067e-11eb-839b-c1ebb0b7f870.png)

+ 구입연월, 고객 이름별 구입 수 집계 결과
```python
byCustomer = import_data.pivot_table(index="purchase_month", columns="고객이름", aggfunc="size", fill_value=0)
```
![image](https://user-images.githubusercontent.com/56333934/95013892-346aea00-067e-11eb-93af-7d81ee116a91.png)

+ 구입 연월, 지역별 판매 수 집계 결과
```python
byRegion = import_data.pivot_table(index="purchase_month", columns="지역", aggfunc="size", fill_value=0)
```
![image](https://user-images.githubusercontent.com/56333934/95013908-56fd0300-067e-11eb-8528-f95089e039e5.png)

+ 집계 기간 내 이탈 고객
```python
away_data = pd.merge(uriage_data, kokyaku_data, left_on = "customer_name", right_on="고객이름", how="right")
away_data[away_data["purchase_date"].isnull()][["고객이름",'등록일']]
```
![image](https://user-images.githubusercontent.com/56333934/95013920-7136e100-067e-11eb-9024-0529bf4c909d.png)
