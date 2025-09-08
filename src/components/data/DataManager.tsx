'use client'

import React, { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Download, 
  Upload, 
  FileText, 
  Database, 
  Archive, 
  Calendar,
  Loader2,
  AlertCircle,
  CheckCircle,
  FileJson,
  FileSpreadsheet,
  Clock,
  Package,
  Settings
} from 'lucide-react'
import { useDataStore, dataUtils, ExportFormat, DataType, ExportOptions, ImportOptions } from '@/stores/dataStore'
import { useDiaryStore } from '@/stores/diaryStore'
import { useCheckInStore } from '@/stores/checkInStore'
import { useMediaStore } from '@/stores/mediaStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface DataManagerProps {
  className?: string
}

export function DataManager({ className }: DataManagerProps) {
  const [activeTab, setActiveTab] = useState<'export' | 'import' | 'backup'>('export')
  
  // 数据存储
  const { diaries } = useDiaryStore()
  const { checkIns } = useCheckInStore()
  const { mediaFiles } = useMediaStore()
  
  // 导出/导入存储
  const {
    exporting,
    importing,
    exportProgress,
    importProgress,
    exportResult,
    importResult,
    previewData,
    error,
    exportData,
    importData,
    previewImport,
    createBackup,
    clearResults
  } = useDataStore()

  return (
    <div className={cn("w-full max-w-4xl mx-auto", className)}>
      <Card className="border-gradient glassmorphism">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Database className="h-8 w-8 text-primary mr-3" />
            <CardTitle className="text-2xl bg-gradient-text">数据管理中心</CardTitle>
          </div>
          <CardDescription>
            导出、导入和备份你的拾光集数据
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="export" className="flex items-center space-x-2">
                <Download className="h-4 w-4" />
                <span>导出数据</span>
              </TabsTrigger>
              <TabsTrigger value="import" className="flex items-center space-x-2">
                <Upload className="h-4 w-4" />
                <span>导入数据</span>
              </TabsTrigger>
              <TabsTrigger value="backup" className="flex items-center space-x-2">
                <Archive className="h-4 w-4" />
                <span>备份管理</span>
              </TabsTrigger>
            </TabsList>

            {/* 导出页面 */}
            <TabsContent value="export" className="space-y-6">
              <ExportPanel 
                diaries={diaries}
                checkIns={checkIns}
                mediaFiles={mediaFiles}
                exporting={exporting}
                exportProgress={exportProgress}
                exportResult={exportResult}
                error={error}
                onExport={exportData}
                onClear={clearResults}
              />
            </TabsContent>

            {/* 导入页面 */}
            <TabsContent value="import" className="space-y-6">
              <ImportPanel
                importing={importing}
                importProgress={importProgress}
                importResult={importResult}
                previewData={previewData}
                error={error}
                onImport={importData}
                onPreview={previewImport}
                onClear={clearResults}
              />
            </TabsContent>

            {/* 备份页面 */}
            <TabsContent value="backup" className="space-y-6">
              <BackupPanel
                diaries={diaries}
                checkIns={checkIns}
                mediaFiles={mediaFiles}
                exporting={exporting}
                exportProgress={exportProgress}
                exportResult={exportResult}
                error={error}
                onBackup={createBackup}
                onClear={clearResults}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

// 导出面板组件
interface ExportPanelProps {
  diaries: any[]
  checkIns: any[]
  mediaFiles: any[]
  exporting: boolean
  exportProgress: any
  exportResult: any
  error: string | null
  onExport: (data: any, options: ExportOptions) => Promise<void>
  onClear: () => void
}

function ExportPanel({ 
  diaries, 
  checkIns, 
  mediaFiles, 
  exporting, 
  exportProgress, 
  exportResult, 
  error,
  onExport,
  onClear 
}: ExportPanelProps) {
  const [exportFormat, setExportFormat] = useState<ExportFormat>('json')
  const [dataTypes, setDataTypes] = useState<DataType[]>(['all'])
  const [customFilename, setCustomFilename] = useState('')
  const [includeMedia, setIncludeMedia] = useState(true)

  const handleExport = async () => {
    const options: ExportOptions = {
      format: exportFormat,
      dataTypes,
      includeMedia,
      filename: customFilename || undefined
    }

    await onExport({ diaries, checkIns, mediaFiles }, options)
  }

  const totalRecords = diaries.length + checkIns.length + mediaFiles.length

  return (
    <div className="space-y-6">
      {/* 数据统计 */}
      <Card className="border-muted/50">
        <CardContent className="pt-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{diaries.length}</div>
              <div className="text-sm text-muted-foreground">日记</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{checkIns.length}</div>
              <div className="text-sm text-muted-foreground">打卡记录</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{mediaFiles.length}</div>
              <div className="text-sm text-muted-foreground">媒体文件</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">总记录数</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 导出选项 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>导出设置</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 格式选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">导出格式</label>
            <Select value={exportFormat} onValueChange={(value) => setExportFormat(value as ExportFormat)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {dataUtils.getSupportedExportFormats().map(format => (
                  <SelectItem key={format.value} value={format.value}>
                    <div className="flex items-center space-x-2">
                      {format.value === 'json' && <FileJson className="h-4 w-4" />}
                      {format.value === 'csv' && <FileSpreadsheet className="h-4 w-4" />}
                      {format.value === 'pdf' && <FileText className="h-4 w-4" />}
                      {format.value === 'zip' && <Package className="h-4 w-4" />}
                      <span>{format.label}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 数据类型选择 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">数据类型</label>
            <div className="flex flex-wrap gap-2">
              {dataUtils.getDataTypeOptions().map(type => (
                <Button
                  key={type.value}
                  variant={dataTypes.includes(type.value) ? "default" : "outline"}
                  size="sm"
                  className="h-8"
                  onClick={() => {
                    if (type.value === 'all') {
                      setDataTypes(['all'])
                    } else {
                      if (dataTypes.includes('all')) {
                        setDataTypes([type.value])
                      } else {
                        if (dataTypes.includes(type.value)) {
                          const newTypes = dataTypes.filter(t => t !== type.value)
                          setDataTypes(newTypes.length > 0 ? newTypes : ['all'])
                        } else {
                          setDataTypes([...dataTypes, type.value])
                        }
                      }
                    }
                  }}
                >
                  {type.label}
                </Button>
              ))}
            </div>
          </div>

          {/* 自定义文件名 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">自定义文件名（可选）</label>
            <Input
              placeholder={`拾光集-导出-${format(new Date(), 'yyyy-MM-dd')}`}
              value={customFilename}
              onChange={(e) => setCustomFilename(e.target.value)}
            />
          </div>

          {/* 其他选项 */}
          <div className="flex items-center space-x-4">
            <Button
              variant={includeMedia ? "default" : "outline"}
              size="sm"
              onClick={() => setIncludeMedia(!includeMedia)}
            >
              包含媒体文件信息
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 进度显示 */}
      {exportProgress && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{exportProgress.phase}</span>
                <span className="text-sm text-muted-foreground">{exportProgress.percentage}%</span>
              </div>
              <Progress value={exportProgress.percentage} className="w-full" />
              <p className="text-sm text-muted-foreground">{exportProgress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 导出结果 */}
      {exportResult && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700">导出成功！</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>文件名: {exportResult.filename}</p>
                <p>记录数: {exportResult.recordCount}</p>
                <p>文件大小: {dataUtils.formatFileSize(exportResult.size)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClear}>
          清除结果
        </Button>
        <Button 
          onClick={handleExport} 
          disabled={exporting || totalRecords === 0}
          className="min-w-32"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              导出中...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              开始导出
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// 导入面板组件
interface ImportPanelProps {
  importing: boolean
  importProgress: any
  importResult: any
  previewData: any[] | null
  error: string | null
  onImport: (file: File, options: ImportOptions) => Promise<any>
  onPreview: (file: File) => Promise<any[]>
  onClear: () => void
}

function ImportPanel({ 
  importing, 
  importProgress, 
  importResult, 
  previewData,
  error,
  onImport,
  onPreview,
  onClear 
}: ImportPanelProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [importFormat, setImportFormat] = useState<'json' | 'csv'>('json')
  const [skipDuplicates, setSkipDuplicates] = useState(true)
  const [validateData, setValidateData] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      
      // 根据文件扩展名自动设置格式
      const extension = file.name.split('.').pop()?.toLowerCase()
      if (extension === 'json') {
        setImportFormat('json')
      } else if (extension === 'csv') {
        setImportFormat('csv')
      }

      // 自动预览
      onPreview(file)
    }
  }

  const handleImport = async () => {
    if (!selectedFile) return

    const options: ImportOptions = {
      format: importFormat,
      skipDuplicates,
      validateData
    }

    await onImport(selectedFile, options)
  }

  return (
    <div className="space-y-6">
      {/* 文件选择 */}
      <Card>
        <CardHeader>
          <CardTitle>选择导入文件</CardTitle>
          <CardDescription>
            支持 JSON 和 CSV 格式的数据文件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.csv"
              onChange={handleFileSelect}
              className="hidden"
            />
            
            {selectedFile ? (
              <div className="space-y-2">
                <FileText className="h-12 w-12 mx-auto text-primary" />
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {dataUtils.formatFileSize(selectedFile.size)} • {selectedFile.type || '未知类型'}
                </p>
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()}>
                  重新选择文件
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="text-lg font-medium">选择要导入的文件</p>
                <p className="text-sm text-muted-foreground">
                  点击选择 JSON 或 CSV 格式的数据文件
                </p>
                <Button onClick={() => fileInputRef.current?.click()}>
                  选择文件
                </Button>
              </div>
            )}
          </div>

          {/* 导入选项 */}
          {selectedFile && (
            <div className="space-y-4 pt-4 border-t">
              <h4 className="font-medium">导入设置</h4>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">文件格式</label>
                <Select value={importFormat} onValueChange={(value) => setImportFormat(value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {dataUtils.getSupportedImportFormats().map(format => (
                      <SelectItem key={format.value} value={format.value}>
                        {format.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  variant={skipDuplicates ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSkipDuplicates(!skipDuplicates)}
                >
                  跳过重复数据
                </Button>
                <Button
                  variant={validateData ? "default" : "outline"}
                  size="sm"
                  onClick={() => setValidateData(!validateData)}
                >
                  验证数据格式
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 数据预览 */}
      {previewData && previewData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>数据预览</CardTitle>
            <CardDescription>
              显示前 10 条记录的预览
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-auto">
              <pre className="text-xs bg-muted p-4 rounded-lg">
                {JSON.stringify(previewData, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 进度显示 */}
      {importProgress && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{importProgress.phase}</span>
                <span className="text-sm text-muted-foreground">{importProgress.percentage}%</span>
              </div>
              <Progress value={importProgress.percentage} className="w-full" />
              <p className="text-sm text-muted-foreground">{importProgress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 导入结果 */}
      {importResult && (
        <Card className={cn(
          importResult.success 
            ? "border-green-500/50 bg-green-500/10" 
            : "border-destructive/50 bg-destructive/10"
        )}>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {importResult.success ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="font-medium text-green-700">导入成功！</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-5 w-5 text-destructive" />
                    <span className="font-medium text-destructive">导入失败</span>
                  </>
                )}
              </div>
              
              {importResult.success && (
                <div className="text-sm text-muted-foreground space-y-1">
                  <p>日记: {importResult.imported.diaries} 条</p>
                  <p>打卡记录: {importResult.imported.checkIns} 条</p>
                  <p>媒体文件: {importResult.imported.mediaFiles} 条</p>
                  <p>标签: {importResult.imported.tags} 条</p>
                  {importResult.skipped > 0 && <p>跳过: {importResult.skipped} 条</p>}
                </div>
              )}

              {importResult.errors.length > 0 && (
                <div className="text-sm text-destructive space-y-1">
                  <p>错误信息:</p>
                  {importResult.errors.map((error: string, index: number) => (
                    <p key={index} className="ml-2">• {error}</p>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClear}>
          清除结果
        </Button>
        <Button 
          onClick={handleImport} 
          disabled={importing || !selectedFile}
          className="min-w-32"
        >
          {importing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              导入中...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4 mr-2" />
              开始导入
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

// 备份面板组件
interface BackupPanelProps {
  diaries: any[]
  checkIns: any[]
  mediaFiles: any[]
  exporting: boolean
  exportProgress: any
  exportResult: any
  error: string | null
  onBackup: (data: any) => Promise<void>
  onClear: () => void
}

function BackupPanel({ 
  diaries, 
  checkIns, 
  mediaFiles, 
  exporting, 
  exportProgress, 
  exportResult, 
  error,
  onBackup,
  onClear 
}: BackupPanelProps) {
  const handleCreateBackup = async () => {
    await onBackup({ diaries, checkIns, mediaFiles })
  }

  const totalRecords = diaries.length + checkIns.length + mediaFiles.length
  const lastBackupTime = localStorage.getItem('lastBackupTime')

  return (
    <div className="space-y-6">
      {/* 备份信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Archive className="h-5 w-5" />
            <span>完整备份</span>
          </CardTitle>
          <CardDescription>
            创建包含所有数据的完整备份文件
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-2xl font-bold text-primary">{totalRecords}</div>
              <div className="text-sm text-muted-foreground">总记录数</div>
            </div>
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <div className="text-sm text-muted-foreground">上次备份</div>
              <div className="font-medium">
                {lastBackupTime 
                  ? format(new Date(lastBackupTime), 'yyyy-MM-dd HH:mm', { locale: zhCN })
                  : '从未备份'
                }
              </div>
            </div>
          </div>

          <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <div className="flex items-start space-x-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div className="space-y-2">
                <h4 className="font-medium text-blue-900 dark:text-blue-100">
                  建议定期备份
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  完整备份包含所有数据和媒体文件信息，建议每周备份一次以确保数据安全。
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 备份内容说明 */}
      <Card>
        <CardHeader>
          <CardTitle>备份内容</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <FileText className="h-5 w-5 text-blue-500" />
                <span className="font-medium">日记数据</span>
              </div>
              <Badge variant="secondary">{diaries.length} 条</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Calendar className="h-5 w-5 text-green-500" />
                <span className="font-medium">打卡记录</span>
              </div>
              <Badge variant="secondary">{checkIns.length} 条</Badge>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
              <div className="flex items-center space-x-3">
                <Package className="h-5 w-5 text-purple-500" />
                <span className="font-medium">媒体文件信息</span>
              </div>
              <Badge variant="secondary">{mediaFiles.length} 条</Badge>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-950/30 rounded-lg">
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>注意：</strong>备份文件为 ZIP 格式，包含 JSON 和 CSV 两种数据格式，以及详细的说明文档。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 进度显示 */}
      {exportProgress && (
        <Card className="border-primary/50">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{exportProgress.phase}</span>
                <span className="text-sm text-muted-foreground">{exportProgress.percentage}%</span>
              </div>
              <Progress value={exportProgress.percentage} className="w-full" />
              <p className="text-sm text-muted-foreground">{exportProgress.message}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 错误显示 */}
      {error && (
        <Card className="border-destructive/50 bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <span className="text-sm text-destructive">{error}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 备份结果 */}
      {exportResult && (
        <Card className="border-green-500/50 bg-green-500/10">
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="font-medium text-green-700">备份创建成功！</span>
              </div>
              <div className="text-sm text-muted-foreground space-y-1">
                <p>备份文件: {exportResult.filename}</p>
                <p>记录数: {exportResult.recordCount}</p>
                <p>文件大小: {dataUtils.formatFileSize(exportResult.size)}</p>
                <p>备份时间: {format(new Date(), 'yyyy-MM-dd HH:mm:ss')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 操作按钮 */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onClear}>
          清除结果
        </Button>
        <Button 
          onClick={handleCreateBackup} 
          disabled={exporting || totalRecords === 0}
          className="min-w-32"
          size="lg"
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              创建中...
            </>
          ) : (
            <>
              <Archive className="h-4 w-4 mr-2" />
              创建完整备份
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
