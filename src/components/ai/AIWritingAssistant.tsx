'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { 
  Sparkles, 
  Mic, 
  Lightbulb,
  Heart,
  Tag,
  RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AIWritingAssistantProps {
  content: string;
  onContentChange: (content: string) => void;
  onTagsGenerated?: (tags: string[]) => void;
  onEmotionDetected?: (emotion: string) => void;
}

// 模拟 AI API 调用
const mockAIService = {
  // 续写建议
  generateContinuation: async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const continuations = [
      "这让我想起了那些美好的时光，阳光透过树叶洒在地上，形成斑驳的光影...",
      "回首往事，我发现每一个选择都塑造了今天的自己...",
      "生活就像一本书，每一页都记录着独特的故事...",
      "或许这就是成长的意义，在经历中学会珍惜..."
    ];
    return continuations[Math.floor(Math.random() * continuations.length)];
  },

  // 改写建议
  rewriteSuggestion: async (text: string): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    // 简单的改写逻辑示例
    return text
      .replace(/很/g, '非常')
      .replace(/今天/g, '今日')
      .replace(/我觉得/g, '我认为');
  },

  // 情绪识别
  detectEmotion: async (text: string): Promise<{ emotion: string; confidence: number }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const emotions = [
      { emotion: '快乐', keywords: ['开心', '愉快', '高兴', '快乐'] },
      { emotion: '平静', keywords: ['平静', '安静', '宁静', '淡然'] },
      { emotion: '忧伤', keywords: ['难过', '悲伤', '失落', '伤心'] },
      { emotion: '感恩', keywords: ['感谢', '感激', '感恩', '珍惜'] },
      { emotion: '期待', keywords: ['期待', '希望', '盼望', '渴望'] }
    ];
    
    for (const { emotion, keywords } of emotions) {
      if (keywords.some(keyword => text.includes(keyword))) {
        return { emotion, confidence: 0.85 };
      }
    }
    
    return { emotion: '平静', confidence: 0.6 };
  },

  // 标签生成
  generateTags: async (text: string): Promise<string[]> => {
    await new Promise(resolve => setTimeout(resolve, 600));
    const allTags = ['日常', '工作', '学习', '旅行', '美食', '运动', '阅读', '思考', '家庭', '朋友'];
    const selectedTags = allTags
      .filter(() => Math.random() > 0.6)
      .slice(0, 3);
    return selectedTags.length > 0 ? selectedTags : ['日常'];
  },

  // 每日灵感
  getDailyPrompt: async (): Promise<string> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    const prompts = [
      "今天有什么让你感到意外的小事吗？",
      "如果今天是一种颜色，它会是什么颜色？为什么？",
      "记录一个今天让你微笑的瞬间。",
      "今天你学到了什么新东西？",
      "描述一下今天的天气如何影响了你的心情。",
      "如果要给今天起个标题，你会叫它什么？",
      "今天有谁给你带来了正能量？",
      "记录一个今天你感激的事物。"
    ];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }
};

export const AIWritingAssistant: React.FC<AIWritingAssistantProps> = ({
  content,
  onContentChange,
  onTagsGenerated,
  onEmotionDetected
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string>('');
  const [detectedEmotion, setDetectedEmotion] = useState<string>('');
  const [generatedTags, setGeneratedTags] = useState<string[]>([]);
  const [dailyPrompt, setDailyPrompt] = useState<string>('');
  const [showFeatures, setShowFeatures] = useState(false);
  const recognitionRef = useRef<any>(null);

  // 续写功能
  const handleContinuation = useCallback(async () => {
    if (!content || content.length < 10) {
      alert('请先写一些内容再使用续写功能');
      return;
    }
    
    setIsLoading(true);
    try {
      const continuation = await mockAIService.generateContinuation(content);
      setSuggestion(continuation);
    } catch (error) {
      console.error('续写失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  // 改写建议
  const handleRewrite = useCallback(async () => {
    if (!content) return;
    
    setIsLoading(true);
    try {
      const rewritten = await mockAIService.rewriteSuggestion(content);
      setSuggestion(rewritten);
    } catch (error) {
      console.error('改写失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content]);

  // 情绪检测
  const handleEmotionDetection = useCallback(async () => {
    if (!content) return;
    
    setIsLoading(true);
    try {
      const { emotion } = await mockAIService.detectEmotion(content);
      setDetectedEmotion(emotion);
      onEmotionDetected?.(emotion);
    } catch (error) {
      console.error('情绪检测失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content, onEmotionDetected]);

  // 标签生成
  const handleTagGeneration = useCallback(async () => {
    if (!content) return;
    
    setIsLoading(true);
    try {
      const tags = await mockAIService.generateTags(content);
      setGeneratedTags(tags);
      onTagsGenerated?.(tags);
    } catch (error) {
      console.error('标签生成失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, [content, onTagsGenerated]);

  // 获取每日灵感
  const handleDailyPrompt = useCallback(async () => {
    setIsLoading(true);
    try {
      const prompt = await mockAIService.getDailyPrompt();
      setDailyPrompt(prompt);
    } catch (error) {
      console.error('获取灵感失败:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 语音输入
  const handleVoiceInput = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('您的浏览器不支持语音识别功能');
      return;
    }

    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'zh-CN';

    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results)
        .map((result: any) => result[0].transcript)
        .join('');
      
      onContentChange(content + transcript);
    };

    recognition.onerror = (event: any) => {
      console.error('语音识别错误:', event.error);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      recognitionRef.current = null;
    };

    recognition.start();
    recognitionRef.current = recognition;
  }, [content, onContentChange]);

  // 应用建议
  const applySuggestion = useCallback(() => {
    if (suggestion) {
      onContentChange(content + '\n\n' + suggestion);
      setSuggestion('');
    }
  }, [suggestion, content, onContentChange]);

  return (
    <div className="space-y-4">
      {/* AI 功能按钮栏 */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          onClick={() => setShowFeatures(!showFeatures)}
          className="gap-2"
        >
          <Sparkles className="w-4 h-4" />
          AI 助手
        </Button>

        <AnimatePresence>
          {showFeatures && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex flex-wrap gap-2"
            >
              <Button
                size="sm"
                variant="ghost"
                onClick={handleContinuation}
                disabled={isLoading || !content}
                className="gap-1"
              >
                <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
                续写
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleRewrite}
                disabled={isLoading || !content}
                className="gap-1"
              >
                改写
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleEmotionDetection}
                disabled={isLoading || !content}
                className="gap-1"
              >
                <Heart className="w-3 h-3" />
                情绪
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleTagGeneration}
                disabled={isLoading || !content}
                className="gap-1"
              >
                <Tag className="w-3 h-3" />
                标签
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleDailyPrompt}
                disabled={isLoading}
                className="gap-1"
              >
                <Lightbulb className="w-3 h-3" />
                灵感
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={handleVoiceInput}
                className={`gap-1 ${recognitionRef.current ? 'text-red-500' : ''}`}
              >
                <Mic className="w-3 h-3" />
                {recognitionRef.current ? '停止' : '语音'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI 建议展示 */}
      <AnimatePresence>
        {suggestion && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                    AI 建议
                  </span>
                  <div className="space-x-2">
                    <Button size="sm" variant="ghost" onClick={applySuggestion}>
                      应用
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setSuggestion('')}>
                      关闭
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{suggestion}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {dailyPrompt && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="p-4 bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200 dark:border-yellow-800">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
                    今日灵感
                  </span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">{dailyPrompt}</p>
              </div>
            </Card>
          </motion.div>
        )}

        {detectedEmotion && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 dark:bg-pink-900/20 rounded-full"
          >
            <Heart className="w-4 h-4 text-pink-600" />
            <span className="text-sm text-pink-700 dark:text-pink-300">
              检测到情绪: {detectedEmotion}
            </span>
          </motion.div>
        )}

        {generatedTags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-wrap gap-2"
          >
            {generatedTags.map(tag => (
              <span
                key={tag}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-full"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AIWritingAssistant;