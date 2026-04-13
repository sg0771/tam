# 使用libcurl作为Http客户端

当使用C++做HTTP客户端时，目前通用的做法就是使用libcurl。其官方网站的地址是http://curl.haxx.se/，该网站主要提供了Curl和libcurl。Curl是命令行工具，用于完成FTP, FTPS, HTTP, HTTPS, GOPHER, TELNET, DICT, FILE 以及 LDAP的命令的请求及接收回馈。libcurl提供给开发者，用于使用C++跨平台的开发各种网络协议的请求及响应。里面的文档非常齐全，不过都是英文的。

    本文提供最简单的demo使用libcurl开发HttpClient。主要包括同步的HTTP GET、HTTP POST、HTTPS GET、HTTPS POST。

    下载libcurl包，如果使用Linux平台，建议下载源文件编译；如果使用Windows平台，建议下载Win32 - MSVC，下载地址是：

http://curl.haxx.se/download.html


```cpp
    #ifndef __HTTP_CURL_H__
    #define __HTTP_CURL_H__
    #include <string>
    class CHttpClient
    {
    public:
    CHttpClient(void);
    ~CHttpClient(void);
    public:
    /**
    * @brief HTTP POST请求
    * @param strUrl 输入参数,请求的Url地址,如:http://www.baidu.com
    * @param strPost 输入参数,使用如下格式para1=val1¶2=val2&…
    * @param strResponse 输出参数,返回的内容
    * @return 返回是否Post成功
    */
    int Post(const std::string & strUrl, const std::string & strPost, std::string & strResponse);
    /**
    * @brief HTTP GET请求
    * @param strUrl 输入参数,请求的Url地址,如:http://www.baidu.com
    * @param strResponse 输出参数,返回的内容
    * @return 返回是否Post成功
    */
    int Get(const std::string & strUrl, std::string & strResponse);
    /**
    * @brief HTTPS POST请求,无证书版本
    * @param strUrl 输入参数,请求的Url地址,如:https://www.alipay.com
    * @param strPost 输入参数,使用如下格式para1=val1¶2=val2&…
    * @param strResponse 输出参数,返回的内容
    * @param pCaPath 输入参数,为CA证书的路径.如果输入为NULL,则不验证服务器端证书的有效性.
    * @return 返回是否Post成功
    */
    int Posts(const std::string & strUrl, const std::string & strPost, std::string & strResponse, const char * pCaPath = NULL);
    /**
    * @brief HTTPS GET请求,无证书版本
    * @param strUrl 输入参数,请求的Url地址,如:https://www.alipay.com
    * @param strResponse 输出参数,返回的内容
    * @param pCaPath 输入参数,为CA证书的路径.如果输入为NULL,则不验证服务器端证书的有效性.
    * @return 返回是否Post成功
    */
    int Gets(const std::string & strUrl, std::string & strResponse, const char * pCaPath = NULL);
    public:
    void SetDebug(bool bDebug);
    private:
    bool m_bDebug;
    };
    #endif


    、、=============================

    #include "httpclient.h"
    #include "curl/curl.h"
    #include <string>
    CHttpClient::CHttpClient(void) : 
    m_bDebug(false)
    {
    }
    CHttpClient::~CHttpClient(void)
    {
    }
    static int OnDebug(CURL *, curl_infotype itype, char * pData, size_t size, void *)
    {
    if(itype == CURLINFO_TEXT)
    {
    //printf("[TEXT]%s\n", pData);
    }
    else if(itype == CURLINFO_HEADER_IN)
    {
    printf("[HEADER_IN]%s\n", pData);
    }
    else if(itype == CURLINFO_HEADER_OUT)
    {
    printf("[HEADER_OUT]%s\n", pData);
    }
    else if(itype == CURLINFO_DATA_IN)
    {
    printf("[DATA_IN]%s\n", pData);
    }
    else if(itype == CURLINFO_DATA_OUT)
    {
    printf("[DATA_OUT]%s\n", pData);
    }
    return 0;
    }
    static size_t OnWriteData(void* buffer, size_t size, size_t nmemb, void* lpVoid)
    {
    std::string* str = dynamic_cast<std::string*>((std::string *)lpVoid);
    if( NULL == str || NULL == buffer )
    {
    return -1;
    }
        char* pData = (char*)buffer;
        str->append(pData, size * nmemb);
    return nmemb;
    }
    int CHttpClient::Post(const std::string & strUrl, const std::string & strPost, std::string & strResponse)
    {
    CURLcode res;
    CURL* curl = curl_easy_init();
    if(NULL == curl)
    {
    return CURLE_FAILED_INIT;
    }
    if(m_bDebug)
    {
    curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
    curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, OnDebug);
    }
    curl_easy_setopt(curl, CURLOPT_URL, strUrl.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, strPost.c_str());
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, NULL);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, OnWriteData);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&strResponse);
    curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1);
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 3);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 3);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return res;
    }
    int CHttpClient::Get(const std::string & strUrl, std::string & strResponse)
    {
    CURLcode res;
    CURL* curl = curl_easy_init();
    if(NULL == curl)
    {
    return CURLE_FAILED_INIT;
    }
    if(m_bDebug)
    {
    curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
    curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, OnDebug);
    }
    <pre name="code" class="cpp">curl_easy_setopt(curl, CURLOPT_URL, strUrl.c_str());
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, NULL);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, OnWriteData);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&strResponse);
    /**
    * 当多个线程都使用超时处理的时候，同时主线程中有sleep或是wait等操作。
    * 如果不设置这个选项，libcurl将会发信号打断这个wait从而导致程序退出。
    */
    curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1);
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 3);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 3);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return res;
    }
    int CHttpClient::Posts(const std::string & strUrl, const std::string & strPost, std::string & strResponse, const char * pCaPath)
    {
    CURLcode res;
    CURL* curl = curl_easy_init();
    if(NULL == curl)
    {
    return CURLE_FAILED_INIT;
    }
    if(m_bDebug)
    {
    curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
    curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, OnDebug);
    }
    curl_easy_setopt(curl, CURLOPT_URL, strUrl.c_str());
    curl_easy_setopt(curl, CURLOPT_POST, 1);
    curl_easy_setopt(curl, CURLOPT_POSTFIELDS, strPost.c_str());
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, NULL);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, OnWriteData);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&strResponse);
    curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1);
    if(NULL == pCaPath)
    {
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    else
    {
    //缺省情况就是PEM，所以无需设置，另外支持DER
    //curl_easy_setopt(curl,CURLOPT_SSLCERTTYPE,"PEM");
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, true);
    curl_easy_setopt(curl, CURLOPT_CAINFO, pCaPath);
    }
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 3);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 3);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return res;
    }
    int CHttpClient::Gets(const std::string & strUrl, std::string & strResponse, const char * pCaPath)
    {
    CURLcode res;
    CURL* curl = curl_easy_init();
    if(NULL == curl)
    {
    return CURLE_FAILED_INIT;
    }
    if(m_bDebug)
    {
    curl_easy_setopt(curl, CURLOPT_VERBOSE, 1);
    curl_easy_setopt(curl, CURLOPT_DEBUGFUNCTION, OnDebug);
    }
    curl_easy_setopt(curl, CURLOPT_URL, strUrl.c_str());
    curl_easy_setopt(curl, CURLOPT_READFUNCTION, NULL);
    curl_easy_setopt(curl, CURLOPT_WRITEFUNCTION, OnWriteData);
    curl_easy_setopt(curl, CURLOPT_WRITEDATA, (void *)&strResponse);
    curl_easy_setopt(curl, CURLOPT_NOSIGNAL, 1);
    if(NULL == pCaPath)
    {
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, false);
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYHOST, false);
    }
    else
    {
    curl_easy_setopt(curl, CURLOPT_SSL_VERIFYPEER, true);
    curl_easy_setopt(curl, CURLOPT_CAINFO, pCaPath);
    }
    curl_easy_setopt(curl, CURLOPT_CONNECTTIMEOUT, 3);
    curl_easy_setopt(curl, CURLOPT_TIMEOUT, 3);
    res = curl_easy_perform(curl);
    curl_easy_cleanup(curl);
    return res;
    }
    ///////////////////////////////////////////////////////////////////////////////////////////////
    void CHttpClient::SetDebug(bool bDebug)
    {
    m_bDebug = bDebug;
    }
```