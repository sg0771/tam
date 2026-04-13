# CPP websockt库

libwebsockets是一个纯C语言的轻量级WebSocket库，它的CPU、内存占用很小，同时支持作为服务器端/客户端。其特性包括：

支持ws://和wss://协议

可以选择和OpenSSL、CyaSSL或者WolfSSL链接

轻量和高速，即使在每个线程处理多达250个连接的情况下

支持事件循环、零拷贝。支持poll()、libev（epoll）、libuv

libwebsockets提供的API相当底层，实现简单的功能也需要相当冗长的代码

git clone git clone https://github.com/warmcat/libwebsockets.git
cd libwebsockets
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_INSTALL_PREFIX=/home/alex/CPP/lib/libwebsockets ..
make && make install 




WebSocket++是一个仅仅由头文件构成的C++库，它实现了WebSocket协议（RFC6455），通过它，你可以在C++项目中使用WebSocket客户端或者服务器。

WebSocket++使用两个可以相互替换的网络传输模块，其中一个基于C++ I/O流，另一个基于Asio。

WebSocket++的主要特性包括：

事件驱动的接口

支持WSS、IPv6

灵活的依赖管理 —— Boost或者C++ 11标准库

可移植性：Posix/Windows、32/64bit、Intel/ARM/PPC

线程安全
git clone https://github.com/zaphoyd/websocketpp.git
cd websocketpp
mkdir build && cd build
cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_INSTALL_PREFIX=/home/alex/CPP/lib/websocketpp ..
make && make install 