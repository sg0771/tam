
#  代码片段
---
# gethostbyname 获取ip 解析域名
```cpp
    const char *str_host = "www.baidu.com";
    struct hostent *he = gethostbyname(str_host);
    struct in_addr **addr_list = (struct in_addr **)he->h_addr_list;
    for(int i = 0; addr_list[i] != NULL; i++) {
        NSLog(@"%s i = %d", inet_ntoa(*addr_list[i]),i);  //ios
    }
```

# Windows HWND 显示 RGB
```cpp
    void DrawBitmap(HWND hwnd, int nBmpWidth, int nBmpHeight, const unsigned char *pBmpData)
    {
    HBITMAP hBitmap = ::CreateBitmap(nBmpWidth, nBmpHeight, 1, 32, pBmpData);
    HDC hWndDc = ::GetDC(hwnd);
    HDC hMemDc = ::CreateCompatibleDC(hWndDc);
    HBITMAP hOldBitmap = (HBITMAP)::SelectObject(hMemDc, hBitmap);
    ::BitBlt(hWndDc, 0, 0, nBmpWidth, nBmpHeight, hMemDc, 0, 0, SRCCOPY);
    ::SelectObject(hMemDc, hOldBitmap);
    ::DeleteObject(hBitmap);
    ::DeleteDC(hMemDc);
    ::ReleaseDC(hwnd, hWndDc);
    }
```

