---
title: "옵션 그릭스 그래프 그리기"
categories:
  - Post Formats
tags:
  - Python
  - Matplotlib
  - Option Greeks
use_math: true
---
## 델타
델타($\Delta$)는 기초자산 가격(S) 변동 대비 옵션가격의 변동입니다. 블랙 숄즈 방정식을 S로 편미분해서 구한다.
$$ \Delta = { {dC} \over {dS} } = {\Delta(call) = N(d_1)}, \Delta (Put)=N(d_1)-1 $$

콜옵션 매수 포지션의 경우 내가격일수록 1에 가깝고 외가격일수록 0에 가깝다. 즉, 행사 가능성이 높을수록 기초자산 가격 변동과 비슷한 만큼 옵션가격이 움직이고, 행사 가능성이 낮을수록 기초자산 가격 변동에 비해 옵션가격 변동은 둔감하다는 뜻이다.

```python
def call_delta(S,K,ttm,r,sigma):
    d1 = (np.log(S/K) + (r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val = stats.norm.cdf(d1,0.0,1.0)
    return val

K=np.arange(300,350,5)
S=np.arange(200,400,10)
K,S = np.meshgrid(K,S)
Z = call_delta(S,K,0.38,0.02,0.30)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

surf = ax.plot_surface(S, K, Z, cmap=cm.coolwarm, linewidth=1, antialiased=True, alpha=0.8)

ax.set_xlabel('기초자산(Underlying)')
ax.set_ylabel('행사가격(Strike)')
ax.set_zlabel('델타(Delta)')
ax.set_title('델타 곡면')

fig.colorbar(surf, shrink=0.5, aspect=5)
```
![image](https://user-images.githubusercontent.com/56333934/87279630-0b7a0380-c52c-11ea-83fc-5e7c3176de70.png)

## 감마
감마($ \Gamma $)는 기초자산 가격(S) 변동 대비 델타의 변동을 나타낸다. 델타를 S로 편미분해서 구하는데 등가격 근처에서 가장 큰 값을 가진다. 이는 행사가격 근처에서는 기초자산 가격의 변화에 따라 옵션 가격 변화 속도가 더 빠르다는 뜻이다.

$$ \Gamma = { {d^2C} \over {dS^2} } = { {N'(d_1)} \over {S_0 \sigma \sqrt{T}}} $$

```python
#N'(x)구하기
def ndx(x) :
    return (np.exp(-1* x**2 *0.5)/np.sqrt(2*np.pi))

def gamma(S,K,ttm,r,sigma):
    d1 = (np.log(S/K) + (r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val= (ndx(d1)) /(S*sigma*np.sqrt(ttm))
    return val

K=np.arange(300,305)
S=np.arange(200,400,10)
K,S = np.meshgrid(K,S)
Z = gamma(S,K,0.38,0.02,0.30)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

surf = ax.plot_surface(S, K, Z, cmap=cm.summer, linewidth=1, antialiased=True, alpha=0.8)

ax.set_xlabel('기초자산(Underlying)')
ax.set_ylabel('행사가격(Strike)')
ax.set_zlabel('감마(Gamma)')
ax.set_title('감마 곡면')

fig.colorbar(surf, shrink=0.5, aspect=5)
```
![image](https://user-images.githubusercontent.com/56333934/87280486-27ca7000-c52d-11ea-8e26-90b23f6f7f84.png)

## 세타
세타($ \Theta $)는 시간(T) 경과 대비 옵션가격의 변동율이다. 블랙-숄즈 방정식을 T로 편미분해서 구한다.   
$$ \Theta (call) = -{S_0 N'(d_1) \sigma \over {2 \sqrt{T}}} - rKe^{-rT}N(d_2) $$
$$ \Theta (put) = -{S_0 N'(d_1) \sigma \over {2 \sqrt{T}}} + rKe^{-rT}N(-d_2) $$

```python
def call_theta(S,K,ttm,r,sigma):
    d1 = (np.log(S/K)+(r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    d2 = (np.log(S/K)+(r-sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val = -1*((S*(ndx(d1)*sigma)/(2*np.sqrt(ttm)))-r*K*np.exp(-r*ttm)*stats.norm.cdf(d2,0.0,1.0))
    return val

T = np.arange(1.0, 0.0, -0.01)
S = np.arange(350,355)
T,S = np.meshgrid(T,S)
Z = call_theta(S,350,T,0.02,0.30)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

surf = ax.plot_surface(T,S,Z,cmap=cm.summer, linewidth=1,antialiased=True, alpha=0.8)

ax.set_xlabel('잔존만기(TIme to maturity)')
ax.set_ylabel('기초자산(Underlying)')
ax.set_zlabel('세타(Theta)')
ax.invert_xaxis() #x축은 1부터 0의 순서로 거꾸로 출력
ax.set_title('세타 곡면')

fig.colorbar(surf, shrink=0.5, aspect=5)  
```
![image](https://user-images.githubusercontent.com/56333934/87281201-f1d9bb80-c52d-11ea-86bd-5589ca68fc3f.png)   
<small>**세타만의 특이한 점은 잔존만기가 점점 0에 가까워지면서 그래프가 변하는 모습을 보여주기 위해 X축의 값이 양수에서 0으로 거꾸로 흘러가게 만들어야 한다. 그래프에서 보듯이 T가 0에 가까울수록 즉, 만기가 가까워질수록 세타는 가파르게 떨어진다.**</small>   

## 베가
베가($ \nu $) 는 기초자산 변동성($ \sigma $) 대비 옵션가격의 변동율을 나타낸다. 블랙-숄즈 방정식을 $ \sigma $ 로 편미분해서 구한다.

$$ vega = { {dC} \over {d \sigma} } = {S_0 \sqrt{T}N'(d_1)} $$<br>
$$ N'(x) = {1 \over {\sqrt{2 \pi}}}e^{-x^2 \over 2} $$

```python
def vega(S,K,ttm,r,sigma):
    d1 = (np.log(S/K)+(r+sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    d2 = (np.log(S/K)+(r-sigma**2*0.5)*ttm)/(sigma*np.sqrt(ttm))
    val = (S*np.sqrt(ttm)*ndx(d1))
    return val

V = np.arange(0.05, 0.95, 0.01)
S = np.arange(350,352)
V,S = np.meshgrid(V,S)
Z=vega(S,350,0.38,0.02,V)

fig = plt.figure()
ax = fig.add_subplot(111, projection='3d')

surf = ax.plot_surface(V,S,Z, cmap=cm.spring, linewidth=1, antialiased=True, alpha=0.8)

ax.set_xlabel('변동성(Volatility)')
ax.set_ylabel('기초자산(Underlying)')
ax.set_zlabel('베가(Vega)')
ax.set_title('베가 곡면')

fig.colorbar(surf, shrink=0.5, aspect=5)
```
![image](https://user-images.githubusercontent.com/56333934/87282163-f2bf1d00-c52e-11ea-93f9-5be541a251e2.png)   
<small>**변동성이 아주 낮은(10%미만) 구간에서 베가가 급격히 올라가고, 변동성이 증가함에 따라 베가가 점점 감소하는 것을 볼 수 있다.**</small>
