---
layout: single
title: "코딩도장 문제풀이"
permalink: /projects/solutions/
author_profile: true
---
1. 초기 투자액과 투자 기간, 그리고 투자 기간 중 날짜별 가치 변동율이 주어질 때 순이익과 이익 여부를 구합니다.
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">
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
</div>

2. [다음입사문제]1차원의 점들이 주어졌을 때, 그 중 가장 거리가 짧은 것의 쌍을 출력하는 함수를 작성하시오. (단 점들의 배열은 모두 정렬되어있다고 가정한다.) 예를들어 S={1, 3, 4, 8, 13, 17, 20} 이 주어졌다면, 결과값은 (3, 4)가 될 것이다.
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">

#### Code
```python
a = list(map(int, input("점 위치를 입력해주세요").split()))
diff = [] #각 점의 차이값을 담는 배열
for i in range(len(a)-1):
    diff.append(abs(a[i+1]-a[i]))
    idx = diff.index(min(diff))

print(a[idx], a[idx+1])
```
</div>
