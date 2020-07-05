---
layout: single
title: "코딩도장 문제풀이"
permalink: /projects/solutions/
author_profile: true
---

1. 초기 투자액과 투자 기간, 그리고 투자 기간 중 날짜별 가치 변동율이 주어질 때 순이익과 이익 여부를 구합니다.

### 입력
첫째 줄에 투자액이 정수로 주어집니다. 두번째 줄에 투자기간이 정수로 주어집니다. 세번째 줄에 투자기간 중 일별 전일 대비 가치 변동이 각각 퍼센트 단위의 정수로 주어집니다.
* 투자액은 100 이상 100000 이하의 정수입니다.
* 투자 기간은 1 이상 10 이하의 정수입니다.
* 일별 변동폭은 -100 이상 100 이하의 정수로 주어집니다.

#### Code
```python
principal = int(input("원금을 입력하세요"))
term = int(input("투자 기간을 입력하세요, (정수형)"))
num_list = list(map(int, input("일일 변동율").split()))
current_val = principal
for i in range(0, term):
  current_val = current_val * (1+ (int(num_list[i])/100))

profit = round(current_val-principal)
print("순수익 : ", profit)
if(profit < 0):
  print("bad")
elif(profit == 0):
  print("same")
else:
  print("good")
```

#### 입력
```
    원금을 입력하세요 : 10000
    투자 기간을 입력하세요, (정수형) : 4
    일일 변동율 : 10 -10 5 -5
```
#### 출력
```
    순수익 : -125
    bad
```
</div>
