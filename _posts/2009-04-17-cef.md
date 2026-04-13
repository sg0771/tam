# CEF 编译 

 最后一个支持Win7 的大版本号是109， CEF 版本号是 5414，  chromium 版本号是109.0.5414.87/120



先搭梯子

安装VS2019，安装C++桌面开发和Windows 10 SDK  

安装Windows SDK

安装git

安装depend_tools(更新后里面有git svn python等工具)，添加到系统PATH路径

安装 automate-git.py



运行自动脚本下载代码（代码量很大，注意网络状态和挂机时间）



cd D:\code\chromium_git\

@echo off

set DEPOT_TOOLS_UPDATE=0

set GYP_MSVS_VERSION=2019

set GYP_MSVS_OVERRIDE_PATH=C:\Program Files (x86)\Microsoft Visual Studio\2019\Professional

set GYP_GENERATORS=ninja 

set CEF_USE_GN=1

set CEF_ARCHIVE_FORMAT=tar.bz2

set GN_ARGUMENTS=--ide=vs2019 --sln=cef --filters=//cef/*

@REM support mp4 and mp3  use_thin_lto不能少，用来pack最后的sdk用

set GN_DEFINES=chrome_pgo_phase=0  is_official_build=true use_thin_lto=false is_component_build=false ffmpeg_branding=Chrome proprietary_codecs=true target_cpu=x86  is_cef_sandbox_build=false  symbol_level=0  

python.bat tools\gclient_hook.py



正常的话生成 cef.sln

编译在cmd上使用 ninja编译， 直接使用VS 打开sln编译会占用很多内存，也有不少pdb写入冲突问题





编译时常见问题

https://blog.51cto.com/angdh/9451505