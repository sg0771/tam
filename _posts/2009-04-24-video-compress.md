基本操作，读取原视频参数，预设码率使用ffmpeg重新编码，可以通过优化参数、多线程、硬编解码提高处理速度



1. 通过  WXMediaInfoLib.WXMediaInfoCreateFast 或者 WXMediaInfoLib.WXMediaInfoCreate 获得 

分辨率，文件总时长、文件大小、帧率等参数 

问题 WXMediaInfoCreate 对大文件解析比较慢(全文件扫描计算)， WXMediaInfoCreateFast 执行快，但是有时候不太准(因为只读取文件头，部分格式可能头部没有统计信息)，对某些特殊格式获取分辨率可能有问题(比如旋转、含SAR参数等)

可以考虑改用 MediaInfo.dll 获取视频参数，可以支持 大多数音视频文件  的解析，有C#绑定



2.  输出帧率要限制到最大 24左右，太高的可能不适合(对于恒定码率，如果帧率过高，单帧图像的平均码率就低，画质就差)

    指定输出文件大小的压缩是通过预设输出码率实现的， 预设输出文件大小之后，除以总时长，得到对应的平均输出码率，AAC等音频编码器默认码率一般是128kbps，如果预设总码率比较小(比如1MBps以下)，音频码率可以适当调低(最低不应该少于64kbps)



3. H264编码时， 有关硬编码的  -c:v h264_qsv  已经被注释掉(如果要启用，需要先执行对应检测方法)，默认的 编码档次 -preset ultrafast  速度较快，但是画质比较差



libx264 使用 -tune zerolatency 零延迟编码也可以降低B帧数量，同样码率下画质稍低，内存占用较小



ultrafast → superfast → veryfast → faster → fast → medium（默认）→ slow → slower → veryslow → placebo（仅测试用，不推荐）。

ultrafast：编码速度最快，但输出文件较大，质量相对较低（牺牲压缩效率换速度），适合实时编码、快速预览等场景。

slow：编码速度慢，但压缩效率更高，输出文件更小且质量更优（牺牲时间换质量 / 大小），适合离线编码、对文件大小敏感的场景。



如果需要平衡速度和质量，推荐使用默认的 medium 预设，或根据实际场景在 fast 到 slow 之间选择。



如果是超高清编码，32位程序可能容易失败，可以先尝试 -tune zerolatency  参数降低内存



如果要求低码率保证画质，对速度不敏感，可以考虑添加h265编码支持(MPEG4 画质较差，libvpx 编码速度比较慢)



4. 对于编码为H264 H265的原视频，可以通过DXVA2 D3D11 硬解码降低CPU开销(编码速度相当，cpu占用明显降低)



相同码率下h264_qsv 画质明显比 libx264 差，比如1080p libx264 1.5Mbps 基本能接受时，qsv 在比较复杂的画面下可能会出现马赛克



ffmpeg -hwaccel d3d11va -i input.mp4 -c:v libx264 -preset medium output_d3d11va.mp4 -  y  #d3d11 硬解码，软编码

ffmpeg -hwaccel dxva2      -i input.mp4 -c:v libx264 -preset medium output_dxva2.mp4  -y    #dxva2硬解码，软编码

ffmpeg  -i input.mp4 -c:v libx264 -preset medium output_sw.mp4  -y   #软解码，软编码



//--------------------------------------------------------------------------------------------------

ffmpeg -hwaccel d3d11va -i input.mp4 -c:v h264_qsv  output_d3d11va_qsv.mp4 -y #d3d11 硬解码，硬编码

ffmpeg -hwaccel dxva2      -i input.mp4 -c:v h264_qsv  output_dxva2_qsv.mp4  -y  #dxva2硬解码，硬编码

ffmpeg                               -i input.mp4 -c:v h264_qsv   output_sw_qsv.mp4  -y       #软解码，硬编码





ffmpeg                               -i input.mp4 -c:v hevc_qsv   output_sw_qsv_h265.mp4  -y       #软解码，H265硬编码







5. 为了兼容现在更新的编解码格式，可以将比较新的ffmpeg 7.0 8.0 等版本独立编译成exe

