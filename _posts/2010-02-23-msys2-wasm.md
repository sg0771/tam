# MSYS2 配置 WASM编译环境

## 安装MSYS2

## pacman -S ucrt64/mingw-w64-ucrt-x86_64-emscripten ucrt64/mingw-w64-ucrt-x86_64-libwasmer

## 将 /ucrt64/lib/emscripten 目录添加到PATH路径

## test.c 内容


#include <stdio.h>
int main() {
	printf("Hello Wasm\\n"); 
	return 0; 
}


# 编译


emcc test.c -o test.html -sFORCE_FILESYSTEM=1 -sEXIT_RUNTIME=1

## 将生成的 HTML+js+wasm 复制到 HTTP server
