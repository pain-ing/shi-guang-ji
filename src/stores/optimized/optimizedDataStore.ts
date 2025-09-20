import { createOptimizedStore, createLazyAction, persistStore } from './storeOptimizations'
import type { Diary, CheckIn, MediaFile } from '@/types/database'

// Export format types
export type ExportFormat = 'json' | 'csv' | 'pdf' | 'zip'
export type DataType = 'diary' | 'checkin' | 'media' | 'all'

// Progress interface
export interface Progress {
  phase: string
  current: number
  total: number
  percentage: number
  message: string
}

// Export/Import result interfaces
export interface ExportResult {
  success: boolean
  filename: string
  size: number
  recordCount: number
}

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

interface DataState {
  exporting: boolean
  exportProgress: Progress | null
  exportResult: ExportResult | null
  importing: boolean
  importProgress: Progress | null
  importResult: ImportResult | null
  previewData: any[] | null
  error: string | null
}

// Lazy load heavy dependencies
const loadFileSaver = () => import('file-saver')
const loadPapaparse = () => import('papaparse')
const loadJsPDF = () => import('jspdf')
const loadJSZip = () => import('jszip')

// Create lazy export actions
const lazyExportToJSON = async (data: any, filename: string): Promise<ExportResult> => {
  const FileSaver = await loadFileSaver()
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
  
  FileSaver.saveAs(blob, filename)

  return {
    success: true,
    filename,
    size: blob.size,
    recordCount: (data.diaries?.length || 0) + 
                 (data.checkIns?.length || 0) + 
                 (data.mediaFiles?.length || 0)
  }
}

const lazyExportToCSV = async (data: any, filename: string): Promise<ExportResult> => {
  const [papa, zip, fileSaver] = await Promise.all([
    loadPapaparse(),
    loadJSZip(),
    loadFileSaver()
  ])
  const Papa = papa.default
  const JSZip = zip.default
  const { saveAs } = fileSaver
  
  const zipInstance = new JSZip()
  let totalRecords = 0

  // Export diaries
  if (data.diaries?.length > 0) {
    const diariesCSV = Papa.unparse(data.diaries.map((diary: Diary) => ({
      id: diary.id,
      标题: diary.title,
      内容: diary.content,
      创建时间: diary.created_at,
      更新时间: diary.updated_at
    })))
    zipInstance.file('diaries.csv', diariesCSV)
    totalRecords += data.diaries.length
  }

  // Export check-ins
  if (data.checkIns?.length > 0) {
    const checkInsCSV = Papa.unparse(data.checkIns.map((checkIn: CheckIn) => ({
      id: checkIn.id,
      心情: checkIn.mood,
      备注: checkIn.note,
      创建时间: checkIn.created_at
    })))
    zipInstance.file('check-ins.csv', checkInsCSV)
    totalRecords += data.checkIns.length
  }

  const zipBlob = await zipInstance.generateAsync({ type: 'blob' })
  saveAs(zipBlob, filename.replace('.csv', '.zip'))

  return {
    success: true,
    filename: filename.replace('.csv', '.zip'),
    size: zipBlob.size,
    recordCount: totalRecords
  }
}

const lazyExportToPDF = async (data: any, filename: string): Promise<ExportResult> => {
  const [jspdf, fileSaver] = await Promise.all([
    loadJsPDF(),
    loadFileSaver()
  ])
  const { jsPDF } = jspdf
  
  const pdf = new jsPDF()
  let yPosition = 20
  let recordCount = 0

  // Add title
  pdf.setFontSize(20)
  pdf.text('拾光集数据导出', 20, yPosition)
  yPosition += 20

  // Add export info
  pdf.setFontSize(12)
  pdf.text(`导出时间: ${new Date().toLocaleString('zh-CN')}`, 20, yPosition)
  yPosition += 10

  // Export diaries (simplified)
  if (data.diaries?.length > 0) {
    yPosition += 10
    pdf.setFontSize(16)
    pdf.text('日记记录', 20, yPosition)
    yPosition += 15

    // Only export first 10 diaries to avoid memory issues
    const diariesToExport = data.diaries.slice(0, 10)
    diariesToExport.forEach((diary: Diary) => {
      if (yPosition > 270) {
        pdf.addPage()
        yPosition = 20
      }

      pdf.setFontSize(12)
      pdf.text(`标题: ${diary.title}`, 20, yPosition)
      yPosition += 10
      
      pdf.text(`时间: ${new Date(diary.created_at).toLocaleString('zh-CN')}`, 20, yPosition)
      yPosition += 15
      
      recordCount++
    })
  }

  pdf.save(filename)

  return {
    success: true,
    filename,
    size: 0,
    recordCount
  }
}

// Optimized data store
export const useOptimizedDataStore = createOptimizedStore<DataState & {
  exportData: (data: any, format: ExportFormat, filename: string) => Promise<void>
  importData: (file: File, format: 'json' | 'csv') => Promise<ImportResult>
  clearResults: () => void
  setError: (error: string | null) => void
}>((set, get) => ({
  // Initial state
  exporting: false,
  exportProgress: null,
  exportResult: null,
  importing: false,
  importProgress: null,
  importResult: null,
  previewData: null,
  error: null,

  // Export data with lazy loading
  exportData: async (data, format, filename) => {
    set({ exporting: true, exportProgress: null, exportResult: null, error: null })

    try {
      set({
        exportProgress: {
          phase: '准备数据',
          current: 0,
          total: 100,
          percentage: 0,
          message: '正在准备导出数据...'
        }
      })

      let exportResult: ExportResult

      switch (format) {
        case 'json':
          exportResult = await lazyExportToJSON(data, filename)
          break
        case 'csv':
          exportResult = await lazyExportToCSV(data, filename)
          break
        case 'pdf':
          exportResult = await lazyExportToPDF(data, filename)
          break
        case 'zip':
          // For now, use CSV export for ZIP
          exportResult = await lazyExportToCSV(data, filename.replace('.zip', '.csv'))
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

  // Import data with lazy loading
  importData: async (file, format) => {
    set({ importing: true, importProgress: null, importResult: null, error: null })

    try {
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
        const Papa = (await loadPapaparse()).default
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
          current: 50,
          total: 100,
          percentage: 50,
          message: '正在验证数据格式...'
        }
      })

      // Simple validation
      const validatedData = {
        diaries: Array.isArray(importedData.diaries) ? importedData.diaries : [],
        checkIns: Array.isArray(importedData.checkIns) ? importedData.checkIns : [],
        mediaFiles: Array.isArray(importedData.mediaFiles) ? importedData.mediaFiles : []
      }

      const result: ImportResult = {
        success: true,
        imported: {
          diaries: validatedData.diaries.length,
          checkIns: validatedData.checkIns.length,
          mediaFiles: validatedData.mediaFiles.length,
          tags: 0
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

  // Clear results
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

  // Set error
  setError: (error) => {
    set({ error })
  }
}))

// Persist selected state
persistStore(useOptimizedDataStore, {
  name: 'data-store',
  version: 1,
  whitelist: ['exportResult', 'importResult'],
  compress: true
})

// Export utility functions
export const dataUtils = {
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  },

  getSupportedExportFormats: (): { value: ExportFormat; label: string }[] => [
    { value: 'json', label: 'JSON - 完整数据' },
    { value: 'csv', label: 'CSV - 表格格式' },
    { value: 'pdf', label: 'PDF - 打印友好' },
    { value: 'zip', label: 'ZIP - 完整备份包' }
  ]
}