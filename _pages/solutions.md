---
layout: single
title: "알고리즘 문제풀이"
permalink: /projects/solutions/
author_profile: true
---
<div markdown="1" style="font-size:15px;">
1) 초기 투자액과 투자 기간, 그리고 투자 기간 중 날짜별 가치 변동율이 주어질 때 순이익과 이익 여부를 구합니다.
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

2) [다음입사문제]1차원의 점들이 주어졌을 때, 그 중 가장 거리가 짧은 것의 쌍을 출력하는 함수를 작성하시오. (단 점들의 배열은 모두 정렬되어있다고 가정한다.) 예를들어 S={1, 3, 4, 8, 13, 17, 20} 이 주어졌다면, 결과값은 (3, 4)가 될 것이다.
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
3) 다음 디브온 코드골프 문제

```c
     *
     *
    * *
   *   *
  *     *
**       **
  *     *
   *   *
    * *
     *
     *
을 코드 150자 내로 그리시오
```

[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">

#### Code
```python
r= range(-5,6)
for y in r:
    l=""
    for x in r:
        a,b = abs(y),abs(x)
        l = l+ (" ","*")[a+b==4 or (5,0) in [(a,b),(b,a)]]
    print(l)
```
</div>

4) [정보올림피아드] 사이즈의 연못이 있고 p,q 사이즈의 그물이 있다. 우리나라 최고의 어부 정올이가 이번에 네모네모 배 고기잡이 대회에 참가한다. 이 대회에는 3개의 라운드가 있는데, 두 번째 라운드는 2차원 형태로 표현될 수 있는 작은 연못에서 길쭉한 그물을 던져서 최대한 많은 고기를 잡는 것이 목적이다...
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">
1라운드의 예를 들면 연못의 크기가 1*6이고 물고기의 위치와 가치가 다음과 같다고하자. 1 0 2 0 4 3 여기서 그물의 크기는 1*3이라고 할 때, 잡을 수 있는 방법은 (1,0,2), (0,2,0), (2,0,4), (0,4,3)의 4가지 방법이 있다. 이 중 가장 이득을 보는 방법은 마지막 방법 0+4+3=7이다. 따라서 주어진 경우의 최대 이득은 7이 된다. 정올이는 최대한 가치가 큰 물고기를 잡아서 우승하고 싶어 한다. 연못의 폭과 각 칸에 있는 물고기의 가치, 그물의 가로의 길이가 주어질 떄, 잡을 수 있는 물고기의 최대이득을 구하는 프로그램을 작성하시오. 입력  첫 번째 줄에 연못의 폭 N, M이 입력된다. ( N, M <= 100 인 자연수 )  두 번째 줄에 그물의 폭 W, H가 입력된다. ( W <= N, H <= M 인 자연수 )  세 번째 줄에 N*M개의 물고기의 가치가 공백으로 구분되어 주어진다. 각 물고기 의 가치는 7 이하의 자연수이다. 0일 경우에는 물고기가 없다는 의미이다.

출력  : 잡을 수 있는 물고기의 최대 가치를 출력한다.   
입력 예 :   
2 6 1 3 1 0   
2 0 4 3 3 4
출력 예 7
#### Code
```python
import numpy as np
from random import randint
pond_size_n, pond_size_m = input('연못사이즈를 입력해주세요 가로, 세로(1~100)').split()
net_size_n, net_size_m = input("그물의 사이즈를 입력해주세요 가로, 세로(연못사이즈)").split()
print(pond_size_n, pond_size_m, net_size_n, net_size_m)
p_n = int(pond_size_n)
p_m = int(pond_size_m)
n_n = int(net_size_n)
n_m = int(net_size_m)

fish_value = [p_n*p_m]
y = np.empty((p_n,p_m)) #n,m 어장 크기 만들기

for i in range(p_n):
    for j in range(p_m) :
        y[i][j] = randint(0,7)
print(y)
total = 0
sum = 0
for a in range(p_n):
    for t in range(p_m-(n_m-1)):
        for v in range(n_m):
            sum = sum + y[a][(t+v)]
        if(sum >= total) :
            total = sum
            sum = 0
        else:
            sum = 0
print(total)
```
</div>
<br>
5) [넥슨 입사문제] 어떤 자연수 n이 있을 때, d(n)을 n의 각 자릿수 숫자들과 n 자신을 더한 숫자라고 정의하자.   
예를 들어
d(91) = 9 + 1 + 91 = 101   
이 때, n을 d(n)의 제네레이터(generator)라고 한다. 위의 예에서 91은 101의 제네레이터이다.
어떤 숫자들은 하나 이상의 제네레이터를 가지고 있는데, 101의 제네레이터는 91 뿐 아니라 100도 있다. 그런데 반대로, 제네레이터가 없는 숫자들도 있으며, 이런 숫자를 인도의 수학자 Kaprekar가 셀프 넘버(self-number)라 이름 붙였다. 예를 들어 1,3,5,7,9,20,31 은 셀프 넘버 들이다.   1 이상이고 5000 보다 작은 모든 셀프 넘버들의 합을 구하라.
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">

#### Code
```python
n = list(range(1,5000))

for i in range(5000):
    thousand = int(i/1000)
    hundred = int((i%1000)/100)
    ten = int((i%100)/10)
    one = i%10
    gen = thousand+hundred+ten+one+i
    if(gen in n):
        n.remove(gen)
print(sum(n))
```
결과 : 1227365
</div>
<br>
6) 문자열 압축하기. 문자열을 입력받아서, 같은 문자가 연속적으로 반복되는 경우에 그 반복 횟수를 표시하여 문자열을 압축하기.   
입력 예시: aaabbcccccca   
출력 예시: a3b2c6a1
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">
#### Code
```python
inp = str(input("문자열 입력하시오"))+" "
check_alpha = inp[0]
new_inp=""
check_count=0
for temp in inp:
    if(temp == check_alpha):
        check_count+=1
    else:
        new_inp= new_inp+(check_alpha+str(check_count))
        check_alpha=temp
        check_count=1
print(new_inp)  
```
</div>
7) 정보통신처에서는 2016년 6월 4일 인하 광장에서 이벤트를 진행하려고 한다. 정보통신처에서 인하 광장에 올린 게시글에 N번째로 댓글을 단 모든 학생에게 상품을 지급하기로 하였다. 단, N은 약수의 개수가 홀수여야 한다. 인하 광장을 즐겨보는 찬미는 이 이벤트에 참가하기로 하였다. 찬미는 댓글을 작성한 후 자신이 상품을 받을 확률이 얼마나 되는지 궁금해졌다. 찬미가 댓글을 작성하기 전의 총 댓글 수가 a개이고, 댓글을 작성 후의 총 댓글 수가 b개일 때 찬미의 댓글은 a보다 크고 b보다 작거나 같은 범위 안에 존재한다고 한다. 예를 들어 a가 1이고, b가 4인 경우 [2, 3, 4] 중 한 곳에 댓글이 존재한다. 이 중 약수의 개수가 홀수인 숫자는 4, 한 개이므로 상품을 받을 확률은 1/3이다. 찬미를 도와 찬미가 상품을 받을 확률을 구하는 프로그램을 작성하라.
[Show solution](#link){: .btn .btn--info}
<div class="solution" markdown="1" style="display:none;font-size:15px">
#### Code
```python
inp = list(map(int, input("a, b의 값을 입력. a>=1, b<=2^60, b는 a보다 항상 크다").split()))
a = inp[0]
b = inp[1]
odd_count=0
for i in range(a+1, b+1):
    count=0
    #i의 약수 갯수 계산
    for j in range(1, i+1):
        if(i%j==0):
            count+=1
    if(count%2==1):
        odd_count+=1
print("확률 : ", odd_count/(b-a), "기약분수 : ", odd_count,"/",(b-a))
```   
입력 :    a, b의 값을 입력. a>=1, b<=2^60, b는 a보다 항상 크다 : 1 4   
출력 :    확률 :  0.3333333333333333 기약분수 :  1 / 3   
</div>
</div>
