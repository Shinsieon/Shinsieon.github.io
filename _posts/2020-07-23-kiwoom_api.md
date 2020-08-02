---
title: "키움증권 API 활용해보기"
categories:
  - Post Formats
tags:
  - Python
  - kiwoom
  - API
  - PyQt
use_math: true
---
**출처는 위키독스의 파이썬으로 배우는 알고리즘 트레이딩을 보며 학습하였음**
{: .notice--warning}   

파이썬으로 GUI 프로그래밍을 하려면 wxPython1, PyQt2, TkInter 등과 같은 패키지를 사용한다. 키움증권의 API를 활용한 GUI 프로그램을 만들어보고자 하는데, TKInter는 추가로 패키지를 설치할 필요가 없고 간단하며 배우기 쉽지만, 인터페이스가 다소 구식이고 복잡한 프로그램을 개발하기에는 몇 가지 부족한 면이 있다.

파이썬에서 키움증권의 클래스를 사용하려면 PyQt의 QAxWidget 클래스를 사용해 인스턴스를 생성해야 한다. 키움증권에서 제공하는 클래스는 각각 고유의 CLSID 또는 ProgID를 가지는데 해당 값을 QAxWidget 클래스의 생성자로 전달하면 인스턴스가 생성된다.
키움증권의 개발 가이드를 참조하면 CLSID는 {A1574A0D-6BFA-4BD7-9020-DED88711818D} 임을 알 수 있고, 이를 윈도우 레지스트리 편집기를 통해 검색하면 ProgID는 'KHOPENAPI.KHOpenAPICtrl.1'임을 알 수 있다.
<br>

실행화면
![image](https://user-images.githubusercontent.com/56333934/88457332-6e6e8180-cec0-11ea-9947-e300862733fe.png)

## 키움증권 로그인과 주식기본정보 Tr데이터 수신   

```python
self.kiwoom = QAxWidget("KHOPENAPI.KHOpenAPICtrl.1")
self.kiwoom.dynamicCall("CommConnect()")   

#윈도우 UI
self.setWindowTitle("PyStock")
self.setGeometry(300, 300, 900, 300)

#로그인 상태 체크 필드
self.text_edit = QTextEdit(self)
self.text_edit.setGeometry(10, 60, 280, 240)
self.text_edit.setEnabled(False)

label = QLabel("종목코드 : ", self)
label.move(20, 20)

# 종목코드 입력 edit_text
self.code_edit = QLineEdit(self)
self.code_edit.move(80, 20)
self.code_edit.setText("039490")

# 조회버튼
trcheck_btn = QPushButton("조회", self)
trcheck_btn.move(190, 20)
trcheck_btn.clicked.connect(self.trcheck)

#통신 상태 체크
self.kiwoom.OnEventConnect.connect(self.event_connect)   
#tr데이터 수신 변동 체크
self.kiwoom.OnReceiveTrData.connect(self.receive_trdata)

def event_connect(self, err_code):
    if err_code == 0:
        self.text_edit.append("로그인 성공")

def trcheck(self):  
    code = self.code_edit.text()
    self.text_edit.append("종목코드 : " + code)
    self.kiwoom.dynamicCall("SetInputValue(QString,QString)", "종목코드", code)
    self.kiwoom.dynamicCall("CommRqData(QString,QString,int,QString)", "opt10001_req", "opt10001", 0, "0101")

def receive_trdata(self, screen_no, rqname, trcode, recordname, prev_next, data_len, err_code, msg1, msg2):
    if rqname == "opt10001_req":
        name =self.kiwoom.dynamicCall("CommGetData(QString,QString,QString,int,QString)",trcode, "", rqname, 0, "종목명")
        volume = self.kiwoom.dynamicCall("CommGetData(QString, QString,QString,int,QString)", trcode, "", rqname, 0, "거래량")
        self.text_edit.append("종목명 : " + name.strip())
        self.text_edit.append("거래량 : " + volume.strip())
```
**CommConnect**   
![image](https://user-images.githubusercontent.com/56333934/88305340-540f9900-cd44-11ea-9db3-4261a4e91269.png)<br>
코드에서와 같이 OCX 방식에서는 QAxBase 클래스의 dynamicCall 메서드를 사용해 원하는 메서드를 호출할 수 있다. 이 코드를 실행하면 키움증권 로그인 창이 뜬다.

**OnEventConnect**
![image](https://user-images.githubusercontent.com/56333934/88305746-d1d3a480-cd44-11ea-883b-b45b5b9c7aa6.png)<br>
Open API+는 통신 연결 상태가 바뀔 때 OnEventConnect라는 이벤트가 발생하여 연결된 메서드로 넘어가 연결 상태를 확인한다. 그리고 text_edit에 표시.

**opt10001 TR을 통해 기본 정보를 요청**

1. SetInputValue 메서드를 사용해 TR 입력 값을 설정.
2. CommRqData 메서드를 사용해 TR을 서버로 송신.
3. 서버로부터 이벤트가 발생할 때까지 이벤트 루프를 사용해 대기.
4. CommGetData 메서드를 사용해 수신 데이터를 가져옴.
{: .notice--primary}

![image](https://user-images.githubusercontent.com/56333934/88311298-ad2efb00-cd4b-11ea-9043-452d623a7dd6.png)

```python
self.kiwoom.dynamicCall("SetInputValue(QString,QString)", "종목코드", code)
self.kiwoom.dynamicCall("CommRqData(QString,QString,int,QString)", "opt10001_req", "opt10001", 0, "0101")
```
TR 구성이 완료되면 CommRqData 메서드를 사용해 TR을 서버로 송신하게 된다. CommRqData의 첫 번째 인자는 사용자가 TR을 구분하기 위한 용도로 사용된다. 여기서는 "opt10001_req"라는 문자열을 첫 번째 인자로 사용했고 두 번째 인자는 요청하는 TR이름으로서 "opt10001"을 입력하면 된다. 세 번째 인자로는 단순조회 TR일 경우 0을 입력하고 네 번째 인자로는 4자리의 화면번호인데 여기서 개발 가이드를 참조해서 기본값인 "0101"을 사용한다.

**OnReceiveTrData**
![image](https://user-images.githubusercontent.com/56333934/88312030-9c32b980-cd4c-11ea-81d4-27b71351ebe5.png)
OnReceiveTrData 이벤트는 서버와 통신한 후 서버로부터 데이터를 전달받은 시점에 발생한다. 또한 OnReceiveTrData 이벤트에는 총 9개의 인자가 전달되는 것을 확인할 수 있다.

**CommGetData**
![image](https://user-images.githubusercontent.com/56333934/88356068-8f8c8080-cda1-11ea-9882-04d978a86c7a.png)
OPEN API+에는 수 많은 TR이 있으므로 CommGetData의 첫 번째 인자와 세 번째 인자에 TR명과 Request 명을 입력해 어떤 TR에 대한 데이터를 얻고자 하는 것인지 알려줘야 한다. receive_data 메서드는 OnReceiveTrData 이벤트가 발생할 때마다 자동으로 호출이 된다. 어떤 TR 요청에 의해 OnReceiveTrData 이벤트가 발생했는지 확인하기 위해 먼저 사용자 Request 명(rqname)을 확인한다.

## 계좌정보 얻기

```python
# 계좌얻기
get_ac = QPushButton("계좌 얻기", self)
get_ac.move(300, 20)
get_ac.clicked.connect(self.get_account)

self.acc_edit = QTextEdit(self)
self.acc_edit.setGeometry(300, 60, 200, 300)
self.acc_edit.setEnabled(False)

def get_account(self):
       account_num = self.kiwoom.dynamicCall("GetLoginInfo(QString)", ["ACCNO"])
       self.acc_edit.append("계좌번호: " + account_num.rstrip(';'))
```
**GetLoginInfo**
![image](https://user-images.githubusercontent.com/56333934/88457287-1fc0e780-cec0-11ea-971a-e12c77cf56d2.png)
GetLoginInfo 메서드의 인자는 한 개인데 해당 위치에 정해진 문자열을 입력함으로써 계좌 개수, 계좌 번호, 사용자 ID 등을 구할 수 있음을 확인할 수 있다.

## 유가증권 종목코드 얻기
```python
# 종목코드 얻기
get_jcode = QPushButton("종목코드 얻기", self)
get_jcode.move(500, 20)
get_jcode.clicked.connect(self.get_jongmok)

self.listWidget = QListWidget(self)
self.listWidget.setGeometry(500, 60, 200, 300)

def get_jongmok(self):
    ret = self.kiwoom.dynamicCall("GetCodeListByMarket(QString)", \
                                  ["0"])
    kospi_code_list = ret.split(';')
    kospi_code_name_list = []

    for x in kospi_code_list:
        name = self.kiwoom.dynamicCall("GetMasterCodeName(QString)", \
                                       [x])
        kospi_code_name_list.append(x + " : " + name)

    self.listWidget.addItems(kospi_code_name_list)
```
**GetCodeListByMarket**   
종목 코드 목록을 가져오는 메서드이다.
![image](https://user-images.githubusercontent.com/56333934/88457391-ed63ba00-cec0-11ea-8672-35a3d86980f8.png)

**GetMasterCodeName**   
종목 코드로부터 한글 종목명을 구하기 위한 메서드
![image](https://user-images.githubusercontent.com/56333934/88457417-1c7a2b80-cec1-11ea-8716-402de7352bc7.png)
