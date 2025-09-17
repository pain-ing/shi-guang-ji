'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { 
  Mic, 
  StopCircle, 
  Play, 
  Pause, 
  Download,
  Trash,
  Music
} from 'lucide-react';
import { motion } from 'framer-motion';

interface AudioRecorderProps {
  onRecordingComplete?: (audioBlob: Blob, duration: number) => void;
  maxDuration?: number; // 最大录制时长（秒）
  withBackgroundMusic?: boolean;
}

export const AudioRecorder: React.FC<AudioRecorderProps> = ({
  onRecordingComplete,
  maxDuration = 300, // 默认5分钟
  withBackgroundMusic = false
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [audioURL, setAudioURL] = useState<string>('');
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [backgroundMusic, setBackgroundMusic] = useState<File | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 开始录音
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        
        if (onRecordingComplete) {
          onRecordingComplete(audioBlob, duration);
        }
      };

      mediaRecorder.start(1000); // 每秒收集一次数据
      setIsRecording(true);
      setDuration(0);

      // 启动计时器
      timerRef.current = setInterval(() => {
        setDuration(prev => {
          const newDuration = prev + 1;
          if (newDuration >= maxDuration) {
            stopRecording();
          }
          return newDuration;
        });
      }, 1000);

    } catch (error) {
      console.error('无法访问麦克风:', error);
      alert('请允许访问麦克风以使用录音功能');
    }
  };

  // 停止录音
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      
      // 停止所有音轨
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
    setIsPaused(false);
  };

  // 暂停/恢复录音
  const togglePause = () => {
    if (!mediaRecorderRef.current) return;

    if (isPaused) {
      mediaRecorderRef.current.resume();
      
      // 恢复计时器
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);
    } else {
      mediaRecorderRef.current.pause();
      
      // 暂停计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
    
    setIsPaused(!isPaused);
  };

  // 播放/暂停录音
  const togglePlayback = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  // 下载录音
  const downloadRecording = () => {
    if (!audioURL) return;

    const a = document.createElement('a');
    a.href = audioURL;
    a.download = `recording-${Date.now()}.webm`;
    a.click();
  };

  // 删除录音
  const deleteRecording = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
      setAudioURL('');
      setDuration(0);
    }
  };

  // 处理背景音乐上传
  const handleBackgroundMusicUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setBackgroundMusic(file);
    }
  };

  // 清理资源
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (audioURL) {
        URL.revokeObjectURL(audioURL);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [audioURL]);

  return (
    <Card className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">音频日记</h3>
        <span className="text-2xl font-mono">{formatTime(duration)}</span>
      </div>

      {/* 录音可视化 */}
      {isRecording && (
        <motion.div
          className="h-16 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center"
          animate={{
            opacity: isPaused ? 0.5 : [1, 0.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <div className="flex gap-1">
            {[...Array(20)].map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-blue-500 to-purple-500 rounded-full"
                animate={{
                  height: isPaused ? 8 : [8, 32, 8],
                }}
                transition={{
                  duration: 0.5,
                  repeat: Infinity,
                  delay: i * 0.05,
                  ease: "easeInOut"
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* 控制按钮 */}
      <div className="flex gap-2 justify-center">
        {!isRecording && !audioURL && (
          <Button
            onClick={startRecording}
            size="lg"
            className="gap-2"
          >
            <Mic className="w-5 h-5" />
            开始录音
          </Button>
        )}

        {isRecording && (
          <>
            <Button
              onClick={togglePause}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              {isPaused ? (
                <>
                  <Play className="w-5 h-5" />
                  继续
                </>
              ) : (
                <>
                  <Pause className="w-5 h-5" />
                  暂停
                </>
              )}
            </Button>
            <Button
              onClick={stopRecording}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <StopCircle className="w-5 h-5" />
              停止
            </Button>
          </>
        )}

        {audioURL && !isRecording && (
          <>
            <Button
              onClick={togglePlayback}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-5 h-5" />
                  暂停
                </>
              ) : (
                <>
                  <Play className="w-5 h-5" />
                  播放
                </>
              )}
            </Button>
            <Button
              onClick={downloadRecording}
              size="lg"
              variant="outline"
              className="gap-2"
            >
              <Download className="w-5 h-5" />
              下载
            </Button>
            <Button
              onClick={deleteRecording}
              size="lg"
              variant="destructive"
              className="gap-2"
            >
              <Trash className="w-5 h-5" />
              删除
            </Button>
          </>
        )}
      </div>

      {/* 背景音乐选项 */}
      {withBackgroundMusic && (
        <div className="border-t pt-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <Music className="w-5 h-5" />
            <span className="text-sm">添加背景音乐</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleBackgroundMusicUpload}
              className="hidden"
            />
          </label>
          {backgroundMusic && (
            <p className="text-xs text-gray-500 mt-1">
              已选择: {backgroundMusic.name}
            </p>
          )}
        </div>
      )}

      {/* 音频播放器 */}
      {audioURL && (
        <audio
          ref={audioRef}
          src={audioURL}
          onEnded={() => setIsPlaying(false)}
          className="hidden"
        />
      )}

      {/* 提示信息 */}
      <div className="text-xs text-gray-500">
        <p>• 最长录制时间: {formatTime(maxDuration)}</p>
        <p>• 支持暂停和继续录制</p>
        <p>• 录音将以 WebM 格式保存</p>
      </div>
    </Card>
  );
};

export default AudioRecorder;