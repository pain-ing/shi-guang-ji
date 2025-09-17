/**
 * 数据导出服务
 * 支持多格式导出、模板系统、批量处理
 */

export interface ExportOptions {
  format: 'json' | 'csv' | 'pdf' | 'html' | 'markdown' | 'docx';
  template?: string;
  includeImages?: boolean;
  includeMetadata?: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  compression?: boolean;
}

export interface ExportTemplate {
  id: string;
  name: string;
  format: string;
  structure: any;
  styles?: any;
  metadata?: any;
}

export interface BatchExportTask {
  id: string;
  items: any[];
  options: ExportOptions;
  progress: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: Blob;
  error?: string;
}

export class ExportService {
  private templates: Map<string, ExportTemplate> = new Map();
  private batchTasks: Map<string, BatchExportTask> = new Map();

  constructor() {
    this.initializeDefaultTemplates();
  }

  /**
   * 初始化默认模板
   */
  private initializeDefaultTemplates() {
    // 日记本模板
    this.templates.set('diary', {
      id: 'diary',
      name: '日记本模板',
      format: 'html',
      structure: {
        title: '我的日记',
        sections: ['header', 'entries', 'footer'],
        dateFormat: 'YYYY年MM月DD日'
      },
      styles: {
        fontFamily: 'serif',
        fontSize: '14pt',
        lineHeight: '1.8'
      }
    });

    // 相册模板
    this.templates.set('album', {
      id: 'album',
      name: '相册模板',
      format: 'pdf',
      structure: {
        layout: 'grid',
        imagesPerPage: 6,
        includeDate: true,
        includeCaption: true
      }
    });

    // 年度总结模板
    this.templates.set('yearly-summary', {
      id: 'yearly-summary',
      name: '年度总结模板',
      format: 'markdown',
      structure: {
        sections: ['overview', 'highlights', 'statistics', 'memories'],
        includeCharts: true
      }
    });
  }

  /**
   * 导出为JSON格式
   */
  async exportToJSON(data: any[], options: ExportOptions): Promise<Blob> {
    const filteredData = this.filterData(data, options);
    const jsonString = JSON.stringify(filteredData, null, 2);
    
    if (options.compression) {
      return this.compress(jsonString, 'application/json');
    }
    
    return new Blob([jsonString], { type: 'application/json' });
  }

  /**
   * 导出为CSV格式
   */
  async exportToCSV(data: any[], options: ExportOptions): Promise<Blob> {
    const filteredData = this.filterData(data, options);
    
    if (filteredData.length === 0) {
      return new Blob([''], { type: 'text/csv' });
    }

    // 获取所有字段名
    const headers = Object.keys(filteredData[0]);
    const csvRows = [];

    // 添加表头
    csvRows.push(headers.join(','));

    // 添加数据行
    for (const row of filteredData) {
      const values = headers.map(header => {
        const value = row[header];
        // 处理包含逗号或引号的值
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvRows.push(values.join(','));
    }

    const csvString = csvRows.join('\n');
    
    if (options.compression) {
      return this.compress(csvString, 'text/csv');
    }
    
    return new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  }

  /**
   * 导出为PDF格式
   */
  async exportToPDF(data: any[], options: ExportOptions): Promise<Blob> {
    // 动态导入 jsPDF 以减少初始加载大小
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF();
    
    const filteredData = this.filterData(data, options);
    const template = options.template ? this.templates.get(options.template) : null;

    // 设置字体
    doc.setFont('helvetica');
    doc.setFontSize(12);

    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const lineHeight = 7;

    // 添加标题
    if (template?.structure?.title) {
      doc.setFontSize(18);
      doc.text(template.structure.title, 20, yPosition);
      yPosition += lineHeight * 2;
      doc.setFontSize(12);
    }

    // 添加内容
    for (const item of filteredData) {
      // 检查是否需要新页
      if (yPosition + lineHeight * 3 > pageHeight - 20) {
        doc.addPage();
        yPosition = 20;
      }

      // 添加日期
      if (item.date) {
        doc.setFont('helvetica', 'bold');
        doc.text(this.formatDate(item.date), 20, yPosition);
        yPosition += lineHeight;
        doc.setFont('helvetica', 'normal');
      }

      // 添加标题
      if (item.title) {
        doc.text(item.title, 20, yPosition);
        yPosition += lineHeight;
      }

      // 添加内容（处理长文本换行）
      if (item.content) {
        const lines = doc.splitTextToSize(item.content, 170);
        for (const line of lines) {
          if (yPosition + lineHeight > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, 20, yPosition);
          yPosition += lineHeight;
        }
      }

      // 添加图片（如果启用）
      if (options.includeImages && item.images && item.images.length > 0) {
        for (const image of item.images) {
          if (yPosition + 50 > pageHeight - 20) {
            doc.addPage();
            yPosition = 20;
          }
          
          try {
            // 将图片添加到PDF
            doc.addImage(image.data, image.format || 'JPEG', 20, yPosition, 50, 40);
            yPosition += 45;
          } catch (error) {
            console.error('Failed to add image to PDF:', error);
          }
        }
      }

      yPosition += lineHeight; // 条目之间的间距
    }

    // 添加页脚
    if (template?.structure?.footer) {
      const pageCount = doc.getNumberOfPages ? doc.getNumberOfPages() : (doc as any).internal.pages.length - 1;
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(
          `页 ${i} / ${pageCount}`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }
    }

    return doc.output('blob');
  }

  /**
   * 导出为HTML格式
   */
  async exportToHTML(data: any[], options: ExportOptions): Promise<Blob> {
    const filteredData = this.filterData(data, options);
    const template = options.template ? this.templates.get(options.template) : null;

    let html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${template?.structure?.title || '导出数据'}</title>
  <style>
    body {
      font-family: ${template?.styles?.fontFamily || 'system-ui, -apple-system, sans-serif'};
      font-size: ${template?.styles?.fontSize || '14px'};
      line-height: ${template?.styles?.lineHeight || '1.6'};
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 { color: #2c3e50; }
    .entry {
      margin-bottom: 30px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    .entry-date {
      color: #6c757d;
      font-size: 0.9em;
      margin-bottom: 10px;
    }
    .entry-title {
      font-size: 1.2em;
      font-weight: bold;
      margin-bottom: 10px;
      color: #2c3e50;
    }
    .entry-content {
      white-space: pre-wrap;
    }
    .entry-images {
      margin-top: 15px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 10px;
    }
    .entry-images img {
      width: 100%;
      border-radius: 4px;
    }
    .metadata {
      margin-top: 15px;
      padding-top: 15px;
      border-top: 1px solid #dee2e6;
      font-size: 0.85em;
      color: #6c757d;
    }
  </style>
</head>
<body>
  <h1>${template?.structure?.title || '我的记录'}</h1>
`;

    // 添加内容
    for (const item of filteredData) {
      html += `  <div class="entry">`;
      
      if (item.date) {
        html += `\n    <div class="entry-date">${this.formatDate(item.date)}</div>`;
      }
      
      if (item.title) {
        html += `\n    <div class="entry-title">${this.escapeHTML(item.title)}</div>`;
      }
      
      if (item.content) {
        html += `\n    <div class="entry-content">${this.escapeHTML(item.content)}</div>`;
      }

      if (options.includeImages && item.images && item.images.length > 0) {
        html += `\n    <div class="entry-images">`;
        for (const image of item.images) {
          html += `\n      <img src="${image.url || image.data}" alt="${image.caption || ''}" />`;
        }
        html += `\n    </div>`;
      }

      if (options.includeMetadata && item.metadata) {
        html += `\n    <div class="metadata">`;
        html += `\n      ${this.formatMetadata(item.metadata)}`;
        html += `\n    </div>`;
      }

      html += `\n  </div>\n`;
    }

    html += `</body>
</html>`;

    if (options.compression) {
      return this.compress(html, 'text/html');
    }

    return new Blob([html], { type: 'text/html;charset=utf-8;' });
  }

  /**
   * 导出为Markdown格式
   */
  async exportToMarkdown(data: any[], options: ExportOptions): Promise<Blob> {
    const filteredData = this.filterData(data, options);
    const template = options.template ? this.templates.get(options.template) : null;

    let markdown = '';

    // 添加标题
    if (template?.structure?.title) {
      markdown += `# ${template.structure.title}\n\n`;
    }

    // 添加内容
    for (const item of filteredData) {
      if (item.date) {
        markdown += `## ${this.formatDate(item.date)}\n\n`;
      }

      if (item.title) {
        markdown += `### ${item.title}\n\n`;
      }

      if (item.content) {
        markdown += `${item.content}\n\n`;
      }

      if (options.includeImages && item.images && item.images.length > 0) {
        for (const image of item.images) {
          markdown += `![${image.caption || 'Image'}](${image.url || image.data})\n`;
        }
        markdown += '\n';
      }

      if (options.includeMetadata && item.metadata) {
        markdown += '---\n';
        markdown += this.formatMetadataAsMarkdown(item.metadata);
        markdown += '---\n\n';
      }

      markdown += '\n---\n\n'; // 分隔符
    }

    if (options.compression) {
      return this.compress(markdown, 'text/markdown');
    }

    return new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
  }

  /**
   * 批量导出
   */
  async batchExport(items: any[], options: ExportOptions): Promise<string> {
    const taskId = this.generateTaskId();
    const task: BatchExportTask = {
      id: taskId,
      items,
      options,
      progress: 0,
      status: 'pending'
    };

    this.batchTasks.set(taskId, task);

    // 异步处理批量导出
    this.processBatchExport(task);

    return taskId;
  }

  /**
   * 处理批量导出
   */
  private async processBatchExport(task: BatchExportTask) {
    try {
      task.status = 'processing';
      
      const batchSize = 50;
      const batches = [];
      
      for (let i = 0; i < task.items.length; i += batchSize) {
        batches.push(task.items.slice(i, i + batchSize));
      }

      const results: Blob[] = [];

      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        let result: Blob;

        switch (task.options.format) {
          case 'json':
            result = await this.exportToJSON(batch, task.options);
            break;
          case 'csv':
            result = await this.exportToCSV(batch, task.options);
            break;
          case 'pdf':
            result = await this.exportToPDF(batch, task.options);
            break;
          case 'html':
            result = await this.exportToHTML(batch, task.options);
            break;
          case 'markdown':
            result = await this.exportToMarkdown(batch, task.options);
            break;
          default:
            throw new Error(`Unsupported format: ${task.options.format}`);
        }

        results.push(result);
        task.progress = ((i + 1) / batches.length) * 100;
      }

      // 合并结果
      task.result = await this.mergeBlobs(results, task.options.format);
      task.status = 'completed';
      task.progress = 100;
    } catch (error) {
      task.status = 'failed';
      task.error = error instanceof Error ? error.message : 'Export failed';
    }
  }

  /**
   * 获取批量导出任务状态
   */
  getBatchTaskStatus(taskId: string): BatchExportTask | undefined {
    return this.batchTasks.get(taskId);
  }

  /**
   * 取消批量导出任务
   */
  cancelBatchTask(taskId: string): boolean {
    const task = this.batchTasks.get(taskId);
    if (task && task.status === 'processing') {
      task.status = 'failed';
      task.error = 'Task cancelled';
      return true;
    }
    return false;
  }

  /**
   * 创建自定义模板
   */
  createTemplate(template: ExportTemplate): void {
    this.templates.set(template.id, template);
  }

  /**
   * 获取所有模板
   */
  getTemplates(): ExportTemplate[] {
    return Array.from(this.templates.values());
  }

  /**
   * 私有方法：过滤数据
   */
  private filterData(data: any[], options: ExportOptions): any[] {
    let filtered = [...data];

    // 按日期范围过滤
    if (options.dateRange) {
      filtered = filtered.filter(item => {
        if (!item.date) return false;
        const itemDate = new Date(item.date);
        return itemDate >= options.dateRange!.start && itemDate <= options.dateRange!.end;
      });
    }

    // 按分类过滤
    if (options.categories && options.categories.length > 0) {
      filtered = filtered.filter(item => {
        return item.category && options.categories!.includes(item.category);
      });
    }

    return filtered;
  }

  /**
   * 私有方法：压缩数据
   */
  private async compress(data: string, mimeType: string): Promise<Blob> {
    // 使用 CompressionStream API 进行压缩
    const blob = new Blob([data], { type: mimeType });
    const stream = blob.stream();
    const compressedStream = stream.pipeThrough(new CompressionStream('gzip'));
    const compressedBlob = await new Response(compressedStream).blob();
    return new Blob([compressedBlob], { type: 'application/gzip' });
  }

  /**
   * 私有方法：合并多个Blob
   */
  private async mergeBlobs(blobs: Blob[], format: string): Promise<Blob> {
    const parts: any[] = [];
    
    for (const blob of blobs) {
      const arrayBuffer = await blob.arrayBuffer();
      parts.push(new Uint8Array(arrayBuffer));
    }

    // 根据格式添加分隔符
    if (format === 'json') {
      // 合并JSON数组
      const jsons = await Promise.all(blobs.map(b => b.text()));
      const merged = jsons.map(j => JSON.parse(j)).flat();
      return new Blob([JSON.stringify(merged)], { type: 'application/json' });
    }

    return new Blob(parts, { type: blobs[0].type });
  }

  /**
   * 私有方法：格式化日期
   */
  private formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * 私有方法：转义HTML
   */
  private escapeHTML(text: string): string {
    const map: { [key: string]: string } = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }

  /**
   * 私有方法：格式化元数据
   */
  private formatMetadata(metadata: any): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(metadata)) {
      lines.push(`<strong>${key}:</strong> ${value}`);
    }
    return lines.join(' | ');
  }

  /**
   * 私有方法：格式化元数据为Markdown
   */
  private formatMetadataAsMarkdown(metadata: any): string {
    const lines: string[] = [];
    for (const [key, value] of Object.entries(metadata)) {
      lines.push(`**${key}:** ${value}`);
    }
    return lines.join('\n') + '\n';
  }

  /**
   * 私有方法：生成任务ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// 导出单例
export const exportService = new ExportService();