# Dshow开发虚拟摄像头

以上就是使用DSHOW操作摄像头的通用流程，要让DirectShow虚拟摄像头能被正确识别和运行，

需要遵照上面流程，实现各种接口。



首先，要被ICreateDevEnum 接口识别到我们的虚拟摄像头，肯定得先注册我们的DSHOW摄像头。

DirectShow框架已经帮我们提供了这样的注册函数。

我们的虚拟摄像头需要实现在DLL动态库中

（本来刚开始想实现在EXE中，想通过进程间COM方式，结果以失败告终，所以认为DirectShow框架只认识DLL方式的Filter），

这个DLL需要具备COM接口动态库的一切基本条件，

需要有DllRegisterServer， DllUnregisterServer， DllGetClassObject，DllCanUnloadNow四个导出函数。

我们需要首先按照普通进程内COM注册方式把DLL注册进系统， 

然后就是我们为了让DSHOW框架枚举到我们的虚拟DirectShow设备，需要做的特别处理：

创建 IFilterMapper2接口，调用接口函数RegisterFilter ，把我们的虚拟摄像头注册进去。

这样ICreateDevEnum 接口就能识别到了。

大致伪代码如下：

        IFilterMapper2* pFM = NULL;

        hr = CoCreateInstance(CLSID_FilterMapper2, NULL, CLSCTX_INPROC_SERVER, IID_IFilterMapper2, (void**)&pFM);



REGPINTYPES PinTypes = {

    &MEDIATYPE_Video,

    &MEDIASUBTYPE_NULL

};

REGFILTERPINS VCamPins = {

    L"Pins",

    FALSE, /// 

    TRUE,  /// output

    FALSE, /// can hav none

    FALSE, /// can have many

    &CLSID_NULL, // obs

    L"PIN",

    1,

    &PinTypes

};

REGFILTER2 rf2;

rf2.dwVersion = 1;

rf2.dwMerit = MERIT_DO_NOT_USE;

rf2.cPins = 1;

rf2.rgPins = &VCamPins;

 //根据上边提供的信息，调用RegisterFilter 注册。

pFM->RegisterFilter(CLSID_VCamDShow, L"Fanxiushu DShow VCamera", &pMoniker, &CLSID_VideoInputDeviceCategory, NULL, &rf2);

把以上代码添加到DllRegisterServer导出函数中，当调用DllRegisterServer注册COM组件的时候，也就把DSHOW虚拟摄像头注册进去了，

同样注销也是类似处理。

其中 CLSID_VCamDShow 是我们自己定义的GUID，用来标志我们的虚拟摄像头接口。

系统也会根据这个GUID来获取我们的接口进行后续的操作。



之后就是我们需要实现的主要内容，本来如果使用DirectShow的SDK开发库，可以比较容易实现这部分内容。

本着一直造轮子的习惯，这次也不例外，采用完全从零开始的开发方式，

稍后提供到GITHUB和CSDN上的代码可以看到这一点。

如果你不喜欢，或者不想去了解DirectShow的工作原理，

大可不必理会我这种比较“疯狂”的做法，也不必下载我的这份代码给你平添无谓的烦恼。

毕竟DirectShow的SDK代码也是乱糟糟的挺复杂，而且迟早会被Media Foundation替代。



阅读下面的内容需要具备一些Windows平台的COM组件的基础知识

（其实整个DSHOW摄像头开发都应该具备COM组件基础知识，否则举步维艰）。

其实我们从零开始做一个COM组件没有这么可怕，甚至针对某些特殊情况，可能还比各种封装开发包简洁和容易理解一些。



我们的DSHOW摄像头，除了必须实现的DllRegisterServer， DllUnregisterServer， DllGetClassObject，DllCanUnloadNow四个导出函数外，

重头戏就是实现我们的类对象，必须继承IBaseFilter接口，为了兼容顺便实现IAMovieSetup 接口。

IBaseFilter接口是DSHOW FIlter的基础导出接口，每个Filter下有一个或者多个PIN接口，因此我们还必须实现IPin接口，

光 IBaseFilter和IPin接口，一共就需要实现20，30多个接口函数，看起来有点多，其实理解了，也没这么麻烦。

为了配置IPin接口，还必须实现 IAMStreamConfig 和IKsPropertySet，这两个接口导出函数并不多，就几个。

我们的虚拟摄像头就只有一个Output Pin 接口，为了简单，在 Filter就只提供一个 IPin就可以了。

大致的数据结构描述如下所示：



class VCamDShow: public IUnknown,

    public IBaseFilter, public IAMovieSetup

{

protected：

    。。。 //内部数据变量和私有函数



      VCamStream*     m_Stream; /// 这个就是我们的 IPin接口， 就只需要一个就可以了，VCamStream数据结构下面会描述。



public:

        //IUnknow 接口

        。。。。

       // IBaseFilter 接口

      STDMETHODIMP GetClassID（...）;///

      STDMETHODIMP Stop() ;/// 停止， IMediaControl接口调用

      STDMETHODIMP Pause(); ///暂停，

      STDMETHODIMP Run();  ///运行

      STDMETHODIMP GetState(...); ///获取运行，暂停，停止等状态

      STDMETHODIMP GetSyncSouce(...);   

      STDMETHODIMP SetSyncSource(...);

      STDMETHODIMP  EnumPins(...);     查询当前filter 提供的IPin 接口信息， DirectShow库通过此函数获取当前Filter提供的IPin信息

      STDMETHODIMP  FindPin(...);  //

      STDMETHODIMP QueryFilterInfo(...); ///获取当前Filter信息

      STDMETHODIMP JoinFIlterGraph(...); /// 把当前filter加入到DirectShow图中，其实就是对应 IGraphBuilder->AddFilter 调用时候被调用。

      ............

      

};



class VCamStream : public IUnknown,

    public IPin, 

    public IQualityControl, public IAMStreamConfig, public IKsPropertySet

{

protected:

       。。。 //内部数据变量和私有函数

       VCamDShow*   m_pFilter;         // 所属的Filter，对应上面定义的VCamDShow数据结构。



       ///// 下面是数据源相关的线程，在StreamTreadLoop 中循环采集数据，并且通过 IMemInputPin 把数据传输给输入PIN。

       HANDLE  m_hThread; ///

HANDLE  m_event;

BOOL    m_quit;   ////

static DWORD CALLBACK thread(void* _p) {

VCamStream* p = (VCamStream*)_p;

CoInitializeEx(NULL, COINIT_MULTITHREADED);

p->StreamTreadLoop(); 

CoUninitialize();

return 0;

}

void StreamTreadLoop();

       ///////// 

public:

      //IUnknow 接口

      .....

      ////IPin 接口

      STDMETHODIMP  Connect（....）; //// 把 输入PIN和输出PIN连接起来，这个是主要函数，其实就是对应 

                                                                      IGraphBuilder->Connect(devicePin,renderPin);

      STDMETHODIMP  ReceiveConnection(...); ///接收连接

      STDMETHODIMP  DIsconnect(...);  ///断开与其他PIN的连接

      STDMETHODIMP  ConnectTo(...);  ////以下基本都是一些状态和数据信息查询

      STDMETHODIMP  ConnectionMediaType(...); ///

      STDMETHODIMP  QueryPinInfo(....); ////

      STDMETHODIMP  QueryDirection(...); ///

      .............

      //// IQualityControl 

      ....

      ///// IAMStreamConfig...

      STDMETHODIMP SetFormat(...); ///

      STDMETHODIMP  GetFormat(...); ///

      STDMETHODIMP  GetNumberOfCapabilities(...); ///

      STDMETHODIMP  GetStreamCaps(....); ////

      /////// IKsPropertySet

      STDMETHODIMP  Get(...); ///

      STDMETHODIMP  Set(...); ////

      STDMETHODIMP  QuerySupported(...); /////

      

};

以上看起来接口函数挺多，其实整体结构不复杂的，而且主要实现这两个类对象基本就搞定DSHOW虚拟摄像头了。

具体代码可以稍后去下载我提供到GITHUB或CSDN上的源代码。



正如上面的查询摄像头的伪代码所说，ICreateDevEnum 接口查询到我们感兴趣的摄像头，

当绑定到这个摄像头获取IBaseFilter接口，调用 IMoniker 的 BindToObject 函数，

虽然没有BindToObject 源代码，但可以知道大致流程：

BindToObject查找CLSID_VCamDShow（我们自定义的GUID）等信息，

调用系统函数CoCreateInstance函数创建我们的对象并且获取IBaseFilter接口，

CoCreateInstance 系统函数通过注册表查找我们注册的DLL所在位置，找到并且加载DLL，同时调用DllGetClassObject获取

类工厂，调用类工厂的CreateInstance创建我们的类，也就是上面的 VCamDShow类， 从而获取到IBaseFilter接口。

类工厂数据结构也是挺简单的，这里无非就是提供 IClassFactory接口，

主要实现CreateInstance方法，在此方法new我们的VCamDShow 类对象。详细信息可查阅提供到GITHUB和CSDN上的代码。



找到并且获取到IBaseFilter指针后，接下来就是调用 IGraphBuilder->AddFilter 添加到 DirectShow的Graph中，

这个时候 IBaseFilter的JoinFilterGraph方法被调用，我们在此方法中其实简单保存IFilterGraph接口指针，

方便后面调用，同时查询IMediaEventSink接口，用于通知事件。



在连接输入PIN和输出PIN之前，需要对这些PIN的MediaType类型做些配置，

就是这个PIN提供哪些类型，比如是RGB，还是YUV，YUY2等，尺寸是640X480,还是1280X720等等信息。

只有当两个PIN的MediaType类型匹配，才会连接成功。

这个时候 IAMStreamConfig 接口的 SetFormat ，GetFormat等函数就会被调用，用于设置具体的Meidia类型。

我们在实现IAMStreamConfig这些函数 时候，预先配置一些当前PIN支持的Media类型，这样当外部调用SetFormat设置Media的时候，

根据这些类型做选择，支持的就设置成功，不支持的就返回失败，具体可查询我提供的源代码。



之后就是两个PIN连接， 当外部调用 IGraphBuilder ->Connect(vcamerPin , renderPin); //// vcamerPin就是我们的摄像头的输出PIN。

对应IPin的Connect或者ReceiveConnection接口函数就会被调用。

在Connect函数中，我们想法查找各种合适的MediaType做匹配，找到后就可开始连接，

ReceiveConnection函数中根据提供的MediaType直接进行连接操作，

假设执行具体连接的函数是 HRESULT doConnect(IPin* pRecvPin, const AM_MEDIA_TYPE* mt )；

因为我们是虚拟DSHOW摄像头，我们的PIN是输出PIN，是数据源。

我们必须把我们的数据源传输给连接上来的输入PIN，否则就是废品，如何实现这个核心要求呢。

其实输入PIN必须要实现IMemInputPin 接口，这个接口就是用来传递数据的。

我们在获取输入PIN的IMemInputPin接口后，调用Receive方法就能把数据传输给输入PIN了。

而Receive方法需要传递 IMediaSample 接口作为参数，IMediaSample需要通过 IMemAllocator 接口的GetBuffer方法获取。

因此我们在 doConnect函数中，除了获取IMemInputPin接口外，还必须创建IMemAllocator 接口。

doConnect大致伪代码如下：



HRESULT VCamDShow::doConnect(IPin* pRecvPin, const AM_MEDIA_TYPE* mt )

{

       .....

       pRecvPin->QueryInterface(IID_IMemInputPin, (void**)&m_pInputPin); // 从输入PIN 获取IMEMInputPIN接口， 

       

       ...... //// 其他一些判断处理，比如判断MediaType是否匹配等

      

       m_ConnectedPin = pRecvPin;  ///保存 输入PIN指针。

       m_ConnectedPin->AddRef();

  

       ///创建 IMemAllocator接口

       hr = m_pInputPin->GetAllocator(&m_pAlloc); 

       if（FAILED(hr)) {

              hr = CoCreateInstance(CLSID_MemoryAllocator,0,CLSCTX_INPROC_SERVER,IID_IMemAllocator,(void **)&m_pAlloc);

       } 



       ///通知输入PIN，完成连接 

       hr = pRecvPin->ReceiveConnection((IPin*)this, mt);



       。。。。。 

}



连接成功后，整个DirectShow初始化完成，就可以开始播放，

外部调用 IMediaControlI->Run， 我们的 IBaseFilter的Run，Pause等函数就会被调用，

我们在这些函数中设置运行状态，执行初始化等操作。



至此，一整套DirectShow摄像头运行流程似乎都跑通了，但似乎忘记了一个重要的地方，数据源呢？

因此，我们可以在VCamStream 类里边创建一个线程，在这个线程里定时循环采集数据，

并且通过 IMemInputPin接口把采集的数据传输给连接上来的输入PIN。

如上面VCamStream 数据结构申明的一样，StreamTreadLoop 大致代码如下：



void VCamStream::StreamTreadLoop()

{

DWORD TMO = 33;

///

while (!m_quit) {

///

WaitForSingleObject(m_event, TMO);

if (m_quit)break;

/////

if (m_pFilter->m_State != State_Running) { //不是运行状态

continue;

}



/////

IMediaSample* sample = NULL;

HRESULT hr = E_FAIL;

。。。

if (m_pAlloc) {

hr = m_pAlloc->GetBuffer(&sample, NULL, NULL, 0);

}

                .......................省略其他处理

                LONG length = sample->GetSize();

char* buffer = NULL;

hr = sample->GetPointer((BYTE**)&buffer);

                 

                ////  这个是一个回调函数，我们可以自定义这个回调函数，并且在里边填写视频帧数据。

                m_pFilter->m_callback( buffer， length ，。。。);  

                

                。。。。。

                m_pInputPin->Receive(sample);  获取到的视频数据，传递给输入PIN。

         }

          。。。。

}



到此为止，才算真正完成了DirectShow虚拟摄像头驱动的核心部分。



GITHUB代码地址：

https://github.com/fanxiushu/vcam_dshow



CSDN上代码地址：

https://download.csdn.net/download/fanxiushu/10329777



下图是在QQ中运行效果：



————————————————

版权声明：本文为CSDN博主「雨中风华」的原创文章，遵循CC 4.0 BY-SA版权协议，转载请附上原文出处链接及本声明。

原文链接：https://blog.csdn.net/fanxiushu/article/details/79830750

