'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Video, Circle, Square, Pause, Play, Download, Settings, Maximize, Camera, Mic, MicOff } from 'lucide-react';
import { videoService } from '@/services/video';
import type { RecordingState, VideoMetadata } from '@/services/video';

interface VideoRecorderProps {
  onSave?: (blob: Blob, metadata: VideoMetadata) => void;
  maxDuration?: number;
  quality?: 'low' | 'medium' | 'high';
}

export default function VideoRecorder({ onSave, maxDuration = 300, quality = 'medium' }: VideoRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>('inactive');
  const [duration, setDuration] = useState(0);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [camera, setCamera] = useState<'user' | 'environment'>('user');
  const [showSettings, setShowSettings] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState(quality);
  const [error, setError] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const previewRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const durationInterval = useRef<NodeJS.Timeout | null>(null);

  // 更新录制时长
  useEffect(() => {
    if (recordingState === 'recording') {
      durationInterval.current = setInterval(() => {
        setDuration(videoService.getRecordingDuration());
      }, 1000);
    } else {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
        durationInterval.current = null;
      }
    }

    return () => {
      if (durationInterval.current) {
        clearInterval(durationInterval.current);
      }
    };
  }, [recordingState]);

  // 开始录制
  const startRecording = useCallback(async () => {
    try {
      setError(null);
      await videoService.startRecording({
        video: true,
        audio: audioEnabled,
        preferredCamera: camera,
        maxDuration,
        quality: selectedQuality
      });

      setRecordingState('recording');
      setDuration(0);
      setVideoBlob(null);
      setMetadata(null);

      // 显示预览
      if (videoRef.current) {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: camera },
          audio: audioEnabled
        });
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '无法启动录制');
      console.error('Failed to start recording:', err);
    }
  }, [audioEnabled, camera, maxDuration, selectedQuality]);

  // 停止录制
  const stopRecording = useCallback(async () => {
    try {
      const blob = await videoService.stopRecording();
      setVideoBlob(blob);
      setRecordingState('inactive');

      // 停止预览流
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }

      // 获取元数据
      const videoMetadata = await videoService.getVideoMetadata(blob);
      setMetadata(videoMetadata);

      // 显示录制的视频
      if (previewRef.current) {
        previewRef.current.src = URL.createObjectURL(blob);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '停止录制失败');
      console.error('Failed to stop recording:', err);
    }
  }, []);

  // 暂停/恢复录制
  const togglePause = useCallback(() => {
    const state = videoService.getRecordingState();
    if (state === 'recording') {
      videoService.pauseRecording();
      setRecordingState('paused');
    } else if (state === 'paused') {
      videoService.resumeRecording();
      setRecordingState('recording');
    }
  }, []);

  // 保存视频
  const saveVideo = useCallback(() => {
    if (videoBlob && metadata && onSave) {
      onSave(videoBlob, metadata);
    }
  }, [videoBlob, metadata, onSave]);

  // 下载视频
  const downloadVideo = useCallback(() => {
    if (videoBlob) {
      const url = URL.createObjectURL(videoBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video-${Date.now()}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  }, [videoBlob]);

  // 切换全屏
  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  // 切换摄像头
  const toggleCamera = useCallback(() => {
    setCamera(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  // 格式化时长
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-4xl mx-auto">
      <div className="bg-gray-900 rounded-lg overflow-hidden">
        {/* 视频显示区域 */}
        <div className="relative aspect-video bg-black">
          {/* 实时预览 */}
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            className={`absolute inset-0 w-full h-full object-cover ${videoBlob ? 'hidden' : ''}`}
          />
          
          {/* 录制完成预览 */}
          <video
            ref={previewRef}
            controls
            className={`absolute inset-0 w-full h-full object-cover ${!videoBlob ? 'hidden' : ''}`}
          />

          {/* 录制状态指示器 */}
          {recordingState !== 'inactive' && !videoBlob && (
            <div className="absolute top-4 left-4 flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${recordingState === 'recording' ? 'bg-red-500 animate-pulse' : 'bg-yellow-500'}`} />
              <span className="text-white font-medium">{formatDuration(duration)}</span>
              {maxDuration > 0 && (
                <span className="text-gray-400">/ {formatDuration(maxDuration)}</span>
              )}
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-lg">
              {error}
            </div>
          )}

          {/* 设置面板 */}
          {showSettings && (
            <div className="absolute top-4 right-4 bg-gray-800 rounded-lg p-4 space-y-3">
              <div>
                <label className="text-white text-sm">质量</label>
                <select
                  value={selectedQuality}
                  onChange={(e) => setSelectedQuality(e.target.value as 'low' | 'medium' | 'high')}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 text-white rounded-md"
                  disabled={recordingState !== 'inactive'}
                >
                  <option value="low">低质量 (480p)</option>
                  <option value="medium">中质量 (720p)</option>
                  <option value="high">高质量 (1080p)</option>
                </select>
              </div>
            </div>
          )}
        </div>

        {/* 控制栏 */}
        <div className="bg-gray-800 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* 左侧控制按钮 */}
            <div className="flex items-center space-x-2">
              {recordingState === 'inactive' && !videoBlob && (
                <button
                  onClick={startRecording}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                >
                  <Circle className="w-5 h-5" />
                  <span>开始录制</span>
                </button>
              )}

              {recordingState !== 'inactive' && (
                <>
                  <button
                    onClick={togglePause}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    {recordingState === 'recording' ? (
                      <Pause className="w-5 h-5" />
                    ) : (
                      <Play className="w-5 h-5" />
                    )}
                  </button>
                  <button
                    onClick={stopRecording}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Square className="w-5 h-5" />
                  </button>
                </>
              )}

              {videoBlob && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      setVideoBlob(null);
                      setMetadata(null);
                      setDuration(0);
                    }}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    重新录制
                  </button>
                  <button
                    onClick={saveVideo}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
                    disabled={!onSave}
                  >
                    保存
                  </button>
                  <button
                    onClick={downloadVideo}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>

            {/* 右侧工具按钮 */}
            <div className="flex items-center space-x-2">
              {recordingState === 'inactive' && !videoBlob && (
                <>
                  <button
                    onClick={() => setAudioEnabled(!audioEnabled)}
                    className={`p-2 rounded-lg transition-colors ${
                      audioEnabled 
                        ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                        : 'bg-red-500 hover:bg-red-600 text-white'
                    }`}
                  >
                    {audioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={toggleCamera}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Camera className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setShowSettings(!showSettings)}
                    className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    <Settings className="w-5 h-5" />
                  </button>
                </>
              )}
              <button
                onClick={toggleFullscreen}
                className="p-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                <Maximize className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 元数据显示 */}
          {metadata && (
            <div className="mt-3 pt-3 border-t border-gray-700">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                <div>
                  <span className="text-gray-400">时长：</span>
                  <span className="text-white">{formatDuration(Math.floor(metadata.duration))}</span>
                </div>
                <div>
                  <span className="text-gray-400">分辨率：</span>
                  <span className="text-white">{metadata.width}x{metadata.height}</span>
                </div>
                <div>
                  <span className="text-gray-400">编码：</span>
                  <span className="text-white">{metadata.codec}</span>
                </div>
                <div>
                  <span className="text-gray-400">大小：</span>
                  <span className="text-white">{(metadata.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}