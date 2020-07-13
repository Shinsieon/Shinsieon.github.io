---
title: "Black-Scholes Option pricing model"
categories:
  - Post Formats
tags:
  - Python
  - Matplotlib
  - Option pricing
use_math: true
---
<script type="text/x-mathjax-config">
MathJax.Hub.Config({
    displayAlign: "center"
});
</script>

이번 포스트에서는 파이썬을 이용해 블랙-숄즈 모형을 구현하고 옵션가격 및 그릭스 그래프를 그려보겠다. 우선 블랙 숄즈 방정식은 아래와 같다.   


$$ C(콜) = S_0N(d_1) -Ke^{rT}N(d_2)$$   
$$ P(풋) = Ke^{-r*T}N(-d_2) - S_0N(-d_1) $$   
$$ d1 = { {ln{S_0 \over K} + {r+ {\sigma^2 \over 2}}T} \over {\sigma \sqrt{T}}}$$   
$$ d2 =  d_1 - \sigma \sqrt{T} = {ln{S_0 \over K} + {r- {\sigma^2 \over 2}}T} \over {\sigma \sqrt{T}}$$

$S_0$ : 기초자산 가격   
K : 행사가격   
T : 잔존만기   
r : 이자율   
$\sigma$ : 기초자산 변동성   
N(x) : 표준정규분포의 누적분포함수
{: .notice--primary}

잔존만기 계산 함수
```python
def time_to_maturity(t0,T,y=252): #잔존만기 계산
    return (np.busday_count(t0,T)/y)
```

Call price, Put price 구하는 함수
```python
def call_price(S,K,ttm,r,sigma):
    #기조자산 가격(S), 행사가격(K), 잔존만기(ttm), 이자율(r), 변동성(sigma)
    d1 = (np.log(S/K)+(r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    d2 = (np.log(S/K)+(r-sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val = (S*stats.norm.cdf(d1,0.0,1.0))-K*np.exp(-r*ttm)*stats.norm.cdf(d2,0.0,1.0)
    return val
def put_price(S,K,ttm,r,sigma):
    d1 = (np.log(S/K)+(r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    d2 = (np.log(S/K)+(r-sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val = K*np.exp(-r*ttm)*stats.norm.cdf(-d2,0.0,1.0)-(S*stats.norm.cdf(-d1,0.0,1.0))
    return val
```
기초자산 및 행사가격 변화에 따른 콜옵션 가격 변화
```python
call_space=dict()
K=np.arange(250,350,10)
S=np.arange(200,400,10)
for k in K:
    single_space=dict()
    for s in S:
        single_space[s] = call_price(s,k,ttm,r,sigma)
    call_space[k]=pd.Series(single_space)
df_call_space = pd.DataFrame(call_space)
df_call_space
```
![image](https://user-images.githubusercontent.com/56333934/87278561-bfc15d00-c51f-11ea-9fd2-db829bb8a9fc.png)
<small>**기초자산 가격은 200부터 400까지 10씩 증가하고 행사가격은 250부터 350까지 10씩 증가한다.**

이를 활용하여 콜옵션가격 그래프를 그려보면 아래와 같이 나온다.
```python
plt.rcParams['font.family']='Malgun Gothic'
plt.rcParams['font.size']=12
plt.rcParams['axes.unicode_minus']=False

fig = plt.figure()
ax = fig.add_subplot(1,1,1) #서브플롯
ax.plot(df_call_space[290], label='k=290') #k=290일때 그래프
ax.plot(df_call_space[300], label='k=300')
ax.plot(df_call_space[310], label='k=310')
ax.set_xlabel('기초자산(Underlying)')
ax.set_ylabel('콜옵션가격(Call price)')
ax.set_title('행사가별 옵션가격')
ax.legend(loc='best')
```
![image](https://user-images.githubusercontent.com/56333934/87278711-16c73200-c520-11ea-9eca-00ddcb79fbcc.png)   
<small>**행사가격이 낮아질수록 콜옵션의 가격이 높아지는 것을 확인할 수 있다. 이는 행사가격이 낮아질수록 옵션을 행사할 확률이 높아지기 때문이다.**


더 나아가 3D 입체 그래프로 표현을 해보면
```python
from mpl_toolkits.mplot3d import Axes3D
from matplotlib import cm

S=np.arange(200,400,10)
K=np.arange(250,350,5)
K,S=np.meshgrid(K,S) #매트릭스 만들기
Z_c=call_price(S,K,ttm,r,sigma)

fig=plt.figure()
ax=fig.add_subplot(111,projection='3d')

surf_c =ax.plot_surface(S,K,Z_c, cmap=cm.summer,linewidth=1, antialiased=True, alpha=0.8)


ax.set_xlabel('기초자산(Underlying)')
ax.set_ylabel('콜옵션가격(Call_price)')
ax.set_title('콜옵션 가격곡면')

fig.colorbar(surf_c,shrink=0.5,aspect=5)
```
![image](https://user-images.githubusercontent.com/56333934/87278833-6574cc00-c520-11ea-869b-ae2fc4bbf339.png)   
<small>**기초자산 가격이 높을수록 콜옵션가격은 높아지고, 행사가격이 낮을수록 콜옵션가격이 높아지는 모습을 확인할 수 있다.**</small>

풋옵션의 경우

![image](https://user-images.githubusercontent.com/56333934/87278867-79b8c900-c520-11ea-8599-3f194c7750ae.png)
이와 같이 나온다.   
<small>**콜옵션 곡면과는 반대로 기초자산 가격이 낮을수록, 행사가격이 높을수록 풋옵션가격이 높아지는 것을 확인할 수 있다.**</small>

다음 포스트에서는 옵션의 그릭스 그래프 그리기를 해보겠다.
