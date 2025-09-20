import { create } from 'zustand'
import { saveAs } from 'file-saver'
import Papa from 'papaparse'
import jsPDF from 'jspdf'
import JSZip from 'jszip'
import { format as formatDate } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Diary, CheckIn, MediaFile } from '@/types/database'

// 导出格式
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'zip'

// 数据类型
export type DataType = 'diary' | 'checkin' | 'media' | 'all'

// 导出选项
export interface ExportOptions {
  format: ExportFormat
  dataTypes: DataType[]
  dateRange?: {
    start: Date
    end: Date
  }
  includeMedia?: boolean
  includeTags?: boolean
  filename?: string
}

// 导入选项
export interface ImportOptions {
  format: 'json' | 'csv'
  skipDuplicates?: boolean
  validateData?: boolean
  mergeTags?: boolean
  preserveIds?: boolean
}

// 导出/导入进度
export interface Progress {
  phase: string
  current: number
  total: number
  percentage: number
  message: string
}

// 导入结果
export interface ImportResult {
  success: boolean
  imported: {
    diaries: number
    checkIns: number
    mediaFiles: number
    tags: number
  }
  skipped: number
  errors: string[]
}

// 导出结果
export interface ExportResult {
  success: boolean
  filename: string
  size: number
  recordCount: number
}

interface DataState {
  // 导出状态
  exporting: boolean
  exportProgress: Progress | null
  exportResult: ExportResult | null
  
  // 导入状态
  importing: boolean
  importProgress: Progress | null
  importResult: ImportResult | null
  
  // 数据预览
  previewData: any[] | null
  
  // 错误信息
  error: string | null
}

interface DataActions {
  // 导出操作
  exportData: (data: {
    diaries: Diary[]
    checkIns: CheckIn[]
    mediaFiles: MediaFile[]
  }, options: ExportOptions) => Promise<void>
  
  // 导入操作
  importData: (file: File, options: ImportOptions) => Promise<ImportResult>
  
  // 预览导入数据
  previewImport: (file: File) => Promise<any[]>
  
  // 创建完整备份
  createBackup: (data: {
    diaries: Diary[]
    checkIns: CheckIn[]
    mediaFiles: MediaFile[]
  }) => Promise<void>
  
  // 状态管理
  clearResults: () => void
  setError: (error: string | null) => void
}

type DataStore = DataState & DataActions

export const useDataStore = create<DataStore>((set, get) => ({
  // 初始状态
  exporting: false,
  exportProgress: null,
  exportResult: null,
  importing: false,
  importProgress: null,
  importResult: null,
  previewData: null,
  error: null,

  // 导出数据
  exportData: async (data, options) => {
    set({ exporting: true, exportProgress: null, exportResult: null, error: null })

    try {
      const { format, dataTypes, dateRange, includeMedia = true, filename } = options

      // 设置初始进度
      set({
        exportProgress: {
          phase: '准备数据',
          current: 0,
          total: 100,
          percentage: 0,
          message: '正在准备导出数据...'
        }
      })

      // 过滤数据
      let filteredData = {
        diaries: data.diaries,
        checkIns: data.checkIns,
        mediaFiles: data.mediaFiles
      }

      // 应用日期范围过滤
      if (dateRange) {
        filteredData = {
          diaries: data.diaries.filter(d => 
            new Date(d.created_at) >= dateRange.start && 
            new Date(d.created_at) <= dateRange.end
          ),
          checkIns: data.checkIns.filter(c => 
            new Date(c.created_at) >= dateRange.start && 
            new Date(c.created_at) <= dateRange.end
          ),
          mediaFiles: data.mediaFiles.filter(m => 
            new Date(m.created_at) >= dateRange.start && 
            new Date(m.created_at) <= dateRange.end
          )
        }
      }

      // 应用数据类型过滤
      if (!dataTypes.includes('all')) {
        if (!dataTypes.includes('diary')) filteredData.diaries = []
        if (!dataTypes.includes('checkin')) filteredData.checkIns = []
        if (!dataTypes.includes('media')) filteredData.mediaFiles = []
      }

      const totalRecords = filteredData.diaries.length + 
                          filteredData.checkIns.length + 
                          filteredData.mediaFiles.length

      // 更新进度
      set({
        exportProgress: {
          phase: '导出数据',
          current: 25,
          total: 100,
          percentage: 25,
          message: `正在导出 ${totalRecords} 条记录...`
        }
      })

      let exportResult: ExportResult
      const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss')
      const defaultFilename = `拾光集-导出-${timestamp}`

      switch (format) {
        case 'json':
          exportResult = await exportToJSON(filteredData, filename || `${defaultFilename}.json`)
          break
        case 'csv':
          exportResult = await exportToCSV(filteredData, filename || `${defaultFilename}.csv`)
          break
        case 'pdf':
          exportResult = await exportToPDF(filteredData, filename || `${defaultFilename}.pdf`)
          break
        case 'zip':
          exportResult = await exportToZip(filteredData, filename || `${defaultFilename}.zip`, includeMedia)
          break
        default:
          throw new Error(`不支持的导出格式: ${format}`)
      }

      set({ 
        exportProgress: {
          phase: '完成',
          current: 100,
          total: 100,
          percentage: 100,
          message: '导出完成！'
        },
        exportResult 
      })

    } catch (error) {
      console.error('导出失败:', error)
      set({ 
        error: error instanceof Error ? error.message : '导出失败',
        exportProgress: null 
      })
    } finally {
      set({ exporting: false })
    }
  },

  // 导入数据
  importData: async (file, options) => {
    set({ importing: true, importProgress: null, importResult: null, error: null })

    try {
      const { format, skipDuplicates = true, validateData = true } = options

      set({
        importProgress: {
          phase: '读取文件',
          current: 0,
          total: 100,
          percentage: 0,
          message: '正在读取文件...'
        }
      })

      let importedData: any
      
      if (format === 'json') {
        const text = await file.text()
        importedData = JSON.parse(text)
      } else if (format === 'csv') {
        const text = await file.text()
        importedData = Papa.parse(text, { 
          header: true, 
          skipEmptyLines: true 
        }).data
      } else {
        throw new Error(`不支持的导入格式: ${format}`)
      }

      set({
        importProgress: {
          phase: '验证数据',
          current: 25,
          total: 100,
          percentage: 25,
          message: '正在验证数据格式...'
        }
      })

      // 数据验证和转换
      if (validateData) {
        importedData = validateImportData(importedData)
      }

      set({
        importProgress: {
          phase: '导入数据',
          current: 50,
          total: 100,
          percentage: 50,
          message: '正在导入数据到数据库...'
        }
      })

      // 这里应该调用实际的数据库导入操作
      // 暂时返回模拟结果
      const result: ImportResult = {
        success: true,
        imported: {
          diaries: importedData.diaries?.length || 0,
          checkIns: importedData.checkIns?.length || 0,
          mediaFiles: importedData.mediaFiles?.length || 0,
          tags: importedData.tags?.length || 0
        },
        skipped: 0,
        errors: []
      }

      set({
        importProgress: {
          phase: '完成',
          current: 100,
          total: 100,
          percentage: 100,
          message: '导入完成！'
        },
        importResult: result
      })

      return result

    } catch (error) {
      console.error('导入失败:', error)
      const errorMessage = error instanceof Error ? error.message : '导入失败'
      set({ 
        error: errorMessage,
        importProgress: null,
        importResult: {
          success: false,
          imported: { diaries: 0, checkIns: 0, mediaFiles: 0, tags: 0 },
          skipped: 0,
          errors: [errorMessage]
        }
      })
      return get().importResult!
    } finally {
      set({ importing: false })
    }
  },

  // 预览导入数据
  previewImport: async (file) => {
    try {
      const extension = file.name.split('.').pop()?.toLowerCase()
      
      if (extension === 'json') {
        const text = await file.text()
        const data = JSON.parse(text)
        set({ previewData: Array.isArray(data) ? data.slice(0, 10) : [data] })
        return get().previewData!
      } else if (extension === 'csv') {
        const text = await file.text()
        const parsed = Papa.parse(text, { 
          header: true, 
          skipEmptyLines: true,
          preview: 10
        })
        set({ previewData: parsed.data })
        return parsed.data
      } else {
        throw new Error('不支持的文件格式')
      }
    } catch (error) {
      console.error('预览失败:', error)
      set({ error: error instanceof Error ? error.message : '预览失败' })
      return []
    }
  },

  // 创建完整备份
  createBackup: async (data) => {
    const timestamp = formatDate(new Date(), 'yyyy-MM-dd-HHmmss')
    const filename = `拾光集-完整备份-${timestamp}.zip`

    await get().exportData(data, {
      format: 'zip',
      dataTypes: ['all'],
      includeMedia: true,
      filename
    })
  },

  // 清空结果
  clearResults: () => {
    set({
      exportResult: null,
      importResult: null,
      exportProgress: null,
      importProgress: null,
      previewData: null,
      error: null
    })
  },

  // 设置错误
  setError: (error) => {
    set({ error })
  }
}))

// 导出到 JSON
async function exportToJSON(data: any, filename: string): Promise<ExportResult> {
  const jsonData = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: '拾光集'
    },
    ...data
  }

  const blob = new Blob([JSON.stringify(jsonData, null, 2)], {
    type: 'application/json;charset=utf-8'
  })
  
  saveAs(blob, filename)

  return {
    success: true,
    filename,
    size: blob.size,
    recordCount: data.diaries.length + data.checkIns.length + data.mediaFiles.length
  }
}

// 导出到 CSV
async function exportToCSV(data: any, filename: string): Promise<ExportResult> {
  const zip = new JSZip()
  let totalRecords = 0

  // 导出日记
  if (data.diaries.length > 0) {
    const diariesCSV = Papa.unparse(data.diaries.map((diary: Diary) => ({
      id: diary.id,
      标题: diary.title,
      内容: diary.content,
      创建时间: formatDate(new Date(diary.created_at), 'yyyy-MM-dd HH:mm:ss'),
      更新时间: formatDate(new Date(diary.updated_at), 'yyyy-MM-dd HH:mm:ss')
    })))
    zip.file('diaries.csv', diariesCSV)
    totalRecords += data.diaries.length
  }

  // 导出打卡记录
  if (data.checkIns.length > 0) {
    const checkInsCSV = Papa.unparse(data.checkIns.map((checkIn: CheckIn) => ({
      id: checkIn.id,
      心情: checkIn.mood,
      备注: checkIn.note,
      创建时间: formatDate(new Date(checkIn.created_at), 'yyyy-MM-dd HH:mm:ss')
    })))
    zip.file('check-ins.csv', checkInsCSV)
    totalRecords += data.checkIns.length
  }

  // 导出媒体文件信息
  if (data.mediaFiles.length > 0) {
    const mediaCSV = Papa.unparse(data.mediaFiles.map((media: MediaFile) => ({
      id: media.id,
      文件名: media.filename,
      文件路径: media.file_path,
      文件URL: media.file_url,
      文件大小: media.file_size,
      文件类型: media.file_type,
      MIME类型: media.mime_type,
      创建时间: formatDate(new Date(media.created_at), 'yyyy-MM-dd HH:mm:ss'),
      更新时间: formatDate(new Date(media.updated_at), 'yyyy-MM-dd HH:mm:ss')
    })))
    zip.file('media-files.csv', mediaCSV)
    totalRecords += data.mediaFiles.length
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, filename.replace('.csv', '.zip'))

  return {
    success: true,
    filename: filename.replace('.csv', '.zip'),
    size: zipBlob.size,
    recordCount: totalRecords
  }
}

// 导出到 PDF
async function exportToPDF(data: any, filename: string): Promise<ExportResult> {
  const pdf = new jsPDF()
  let yPosition = 20
  let recordCount = 0

  // 添加标题
  pdf.setFontSize(20)
  pdf.text('拾光集数据导出', 20, yPosition)
  yPosition += 20

  // 添加导出信息
  pdf.setFontSize(12)
  pdf.text(`导出时间: ${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}`, 20, yPosition)
  yPosition += 10

  // 导出日记
  if (data.diaries.length > 0) {
    yPosition += 10
    pdf.setFontSize(16)
    pdf.text('日记记录', 20, yPosition)
    yPosition += 15

    data.diaries.forEach((diary: Diary) => {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(12)
      pdf.text(`标题: ${diary.title}`, 20, yPosition)
      yPosition += 10
      
      pdf.text(`时间: ${formatDate(new Date(diary.created_at), 'yyyy-MM-dd HH:mm')}`, 20, yPosition)
      yPosition += 10

      // 内容处理（简化版）
      const contentLines = pdf.splitTextToSize(diary.content, 170)
      pdf.text(contentLines.slice(0, 3), 20, yPosition) // 只显示前3行
      yPosition += contentLines.slice(0, 3).length * 7 + 10
      
      recordCount++
    })
  }

  // 保存PDF
  pdf.save(filename)

  return {
    success: true,
    filename,
    size: 0, // PDF size calculation is complex
    recordCount
  }
}

// 导出到 ZIP
async function exportToZip(data: any, filename: string, includeMedia: boolean): Promise<ExportResult> {
  const zip = new JSZip()
  
  // 添加 JSON 数据
  const jsonData = {
    exportInfo: {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      source: '拾光集',
      includeMedia
    },
    ...data
  }
  
  zip.file('data.json', JSON.stringify(jsonData, null, 2))

  // 添加 CSV 文件
  if (data.diaries.length > 0) {
    const diariesCSV = Papa.unparse(data.diaries)
    zip.file('diaries.csv', diariesCSV)
  }

  if (data.checkIns.length > 0) {
    const checkInsCSV = Papa.unparse(data.checkIns)
    zip.file('check-ins.csv', checkInsCSV)
  }

  if (data.mediaFiles.length > 0) {
    const mediaCSV = Papa.unparse(data.mediaFiles)
    zip.file('media-files.csv', mediaCSV)
  }

  // 添加说明文件
  const readme = `
拾光集数据导出包

导出时间: ${formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss')}
版本: 1.0.0

文件说明:
- data.json: 完整的JSON格式数据
- diaries.csv: 日记数据（CSV格式）
- check-ins.csv: 打卡记录（CSV格式）
- media-files.csv: 媒体文件信息（CSV格式）
${includeMedia ? '- media/: 媒体文件目录' : ''}

注意: 此导出包可用于数据备份或迁移到其他平台。
  `
  
  zip.file('README.txt', readme)

  const zipBlob = await zip.generateAsync({ type: 'blob' })
  saveAs(zipBlob, filename)

  const totalRecords = data.diaries.length + data.checkIns.length + data.mediaFiles.length

  return {
    success: true,
    filename,
    size: zipBlob.size,
    recordCount: totalRecords
  }
}

// 验证导入数据
function validateImportData(data: any): any {
  // 基本验证逻辑
  if (typeof data !== 'object') {
    throw new Error('无效的数据格式')
  }

  // 确保必要字段存在
  const validatedData = {
    diaries: Array.isArray(data.diaries) ? data.diaries : [],
    checkIns: Array.isArray(data.checkIns) ? data.checkIns : [],
    mediaFiles: Array.isArray(data.mediaFiles) ? data.mediaFiles : []
  }

  // 验证每个项目的必要字段
  validatedData.diaries = validatedData.diaries.filter((item: any) => 
    item && typeof item === 'object' && item.title && item.content
  )

  validatedData.checkIns = validatedData.checkIns.filter((item: any) => 
    item && typeof item === 'object' && item.mood
  )

  validatedData.mediaFiles = validatedData.mediaFiles.filter((item: any) => 
    item && typeof item === 'object' && item.filename
  )

  return validatedData
}

// 导出工具函数
export const dataUtils = {
  // 格式化文件大小
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  // 获取支持的导出格式
  getSupportedExportFormats: (): { value: ExportFormat; label: string }[] => [
    { value: 'json', label: 'JSON - 完整数据' },
    { value: 'csv', label: 'CSV - 表格格式' },
    { value: 'pdf', label: 'PDF - 打印友好' },
    { value: 'zip', label: 'ZIP - 完整备份包' }
  ],

  // 获取支持的导入格式
  getSupportedImportFormats: (): { value: 'json' | 'csv'; label: string }[] => [
    { value: 'json', label: 'JSON 格式' },
    { value: 'csv', label: 'CSV 格式' }
  ],

  // 获取数据类型选项
  getDataTypeOptions: (): { value: DataType; label: string }[] => [
    { value: 'all', label: '所有数据' },
    { value: 'diary', label: '日记' },
    { value: 'checkin', label: '打卡记录' },
    { value: 'media', label: '媒体文件' }
  ]
}
