// Data Export and Visualization API Routes
import { Hono } from 'hono';
import type { ApiResponse } from '../types/api';

const exportRouter = new Hono();

// Generate CSV Export
exportRouter.post('/csv', async (c) => {
  try {
    const body = await c.req.json<{
      data: any[];
      filename?: string;
      headers?: string[];
    }>();
    
    const { data, filename = 'export', headers } = body;
    
    if (!data || data.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '没有可导出的数据'
      }, 400);
    }
    
    // Extract headers from first data object if not provided
    const csvHeaders = headers || Object.keys(data[0]);
    
    // Generate CSV content
    let csvContent = csvHeaders.join(',') + '\n';
    
    data.forEach(row => {
      const values = csvHeaders.map(header => {
        let value = row[header] || '';
        // Handle special characters and escaping
        if (typeof value === 'string') {
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            value = `"${value.replace(/"/g, '""')}"`;
          }
        }
        return value;
      });
      csvContent += values.join(',') + '\n';
    });
    
    // Create download information
    const result = {
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.csv`,
      content: csvContent,
      size: csvContent.length,
      rows: data.length,
      columns: csvHeaders.length,
      download_url: `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`,
      headers: csvHeaders
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功生成CSV文件，包含 ${data.length} 行数据`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'CSV导出失败'
    }, 500);
  }
});

// Generate JSON Export
exportRouter.post('/json', async (c) => {
  try {
    const body = await c.req.json<{
      data: any;
      filename?: string;
      pretty?: boolean;
    }>();
    
    const { data, filename = 'export', pretty = true } = body;
    
    if (!data) {
      return c.json<ApiResponse>({
        success: false,
        error: '没有可导出的数据'
      }, 400);
    }
    
    // Generate JSON content
    const jsonContent = pretty 
      ? JSON.stringify(data, null, 2)
      : JSON.stringify(data);
    
    const result = {
      filename: `${filename}_${new Date().toISOString().split('T')[0]}.json`,
      content: jsonContent,
      size: jsonContent.length,
      download_url: `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`,
      data_type: Array.isArray(data) ? 'array' : typeof data,
      item_count: Array.isArray(data) ? data.length : Object.keys(data).length
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功生成JSON文件`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : 'JSON导出失败'
    }, 500);
  }
});

// Generate Report
exportRouter.post('/report', async (c) => {
  try {
    const body = await c.req.json<{
      title: string;
      sections: {
        name: string;
        data: any;
        chart_type?: 'bar' | 'line' | 'pie' | 'table';
        description?: string;
      }[];
      format: 'html' | 'markdown';
    }>();
    
    const { title, sections, format } = body;
    
    if (!title || !sections || sections.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '请提供报告标题和内容'
      }, 400);
    }
    
    let reportContent = '';
    
    if (format === 'html') {
      reportContent = generateHTMLReport(title, sections);
    } else {
      reportContent = generateMarkdownReport(title, sections);
    }
    
    const result = {
      title: title,
      format: format,
      filename: `${title.replace(/[^a-zA-Z0-9\u4e00-\u9fff]/g, '_')}_report_${new Date().toISOString().split('T')[0]}.${format}`,
      content: reportContent,
      size: reportContent.length,
      sections_count: sections.length,
      download_url: `data:text/${format === 'html' ? 'html' : 'markdown'};charset=utf-8,${encodeURIComponent(reportContent)}`,
      generated_at: new Date().toISOString()
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功生成${format.toUpperCase()}格式报告，包含 ${sections.length} 个部分`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '报告生成失败'
    }, 500);
  }
});

// Generate Chart Data
exportRouter.post('/chart', async (c) => {
  try {
    const body = await c.req.json<{
      data: any[];
      chart_type: 'bar' | 'line' | 'pie' | 'doughnut' | 'radar';
      x_field: string;
      y_field: string;
      title?: string;
      colors?: string[];
    }>();
    
    const { data, chart_type, x_field, y_field, title, colors } = body;
    
    if (!data || data.length === 0) {
      return c.json<ApiResponse>({
        success: false,
        error: '没有可视化的数据'
      }, 400);
    }
    
    // Generate Chart.js configuration
    const labels = data.map(item => item[x_field]);
    const values = data.map(item => item[y_field]);
    
    const defaultColors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
      '#FF9F40', '#FF6384', '#C9CBCF', '#4BC0C0', '#FF6384'
    ];
    
    const chartColors = colors || defaultColors;
    
    let chartConfig: any = {
      type: chart_type,
      data: {
        labels: labels,
        datasets: [{
          label: title || `${y_field} by ${x_field}`,
          data: values,
          backgroundColor: chart_type === 'pie' || chart_type === 'doughnut' 
            ? chartColors.slice(0, labels.length)
            : chartColors[0],
          borderColor: chart_type === 'line' ? chartColors[0] : chartColors.map(c => c + 'CC'),
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: !!title,
            text: title
          },
          legend: {
            display: chart_type === 'pie' || chart_type === 'doughnut'
          }
        }
      }
    };
    
    // Add specific options for different chart types
    if (chart_type === 'line') {
      chartConfig.options.scales = {
        y: { beginAtZero: true }
      };
    } else if (chart_type === 'bar') {
      chartConfig.options.scales = {
        y: { beginAtZero: true }
      };
    }
    
    const result = {
      chart_config: chartConfig,
      chart_type: chart_type,
      data_points: data.length,
      x_field: x_field,
      y_field: y_field,
      summary: {
        total_values: values.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0),
        average_value: values.reduce((a, b) => a + (typeof b === 'number' ? b : 0), 0) / values.length,
        max_value: Math.max(...values.filter(v => typeof v === 'number')),
        min_value: Math.min(...values.filter(v => typeof v === 'number'))
      }
    };
    
    return c.json<ApiResponse>({
      success: true,
      data: result,
      message: `成功生成${chart_type}图表配置，包含 ${data.length} 个数据点`
    });
    
  } catch (error) {
    return c.json<ApiResponse>({
      success: false,
      error: error instanceof Error ? error.message : '图表生成失败'
    }, 500);
  }
});

// Helper function to generate HTML report
function generateHTMLReport(title: string, sections: any[]): string {
  let html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 40px; line-height: 1.6; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .section { margin-bottom: 40px; }
        .section h2 { color: #333; border-left: 4px solid #007cba; padding-left: 15px; }
        table { width: 100%; border-collapse: collapse; margin-top: 10px; }
        th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        th { background-color: #f5f5f5; font-weight: 600; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 0.9em; }
        .summary-box { background: #f8f9fa; border: 1px solid #e9ecef; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${title}</h1>
        <p>生成时间: ${new Date().toLocaleString('zh-CN')}</p>
    </div>
`;

  sections.forEach(section => {
    html += `
    <div class="section">
        <h2>${section.name}</h2>
        ${section.description ? `<p>${section.description}</p>` : ''}
`;

    if (Array.isArray(section.data) && section.data.length > 0) {
      // Generate table for array data
      const headers = Object.keys(section.data[0]);
      html += `
        <table>
            <thead>
                <tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr>
            </thead>
            <tbody>
                ${section.data.map(row => 
                  `<tr>${headers.map(h => `<td>${row[h] || ''}</td>`).join('')}</tr>`
                ).join('')}
            </tbody>
        </table>
`;
    } else if (typeof section.data === 'object') {
      // Generate summary box for object data
      html += `
        <div class="summary-box">
            ${Object.entries(section.data).map(([key, value]) => 
              `<p><strong>${key}:</strong> ${value}</p>`
            ).join('')}
        </div>
`;
    }

    html += '</div>';
  });

  html += `
    <div class="footer">
        <p>报告由数字营销分析平台生成 | ${new Date().getFullYear()}</p>
    </div>
</body>
</html>`;

  return html;
}

// Helper function to generate Markdown report
function generateMarkdownReport(title: string, sections: any[]): string {
  let markdown = `# ${title}\n\n`;
  markdown += `**生成时间:** ${new Date().toLocaleString('zh-CN')}\n\n`;
  
  sections.forEach(section => {
    markdown += `## ${section.name}\n\n`;
    
    if (section.description) {
      markdown += `${section.description}\n\n`;
    }
    
    if (Array.isArray(section.data) && section.data.length > 0) {
      const headers = Object.keys(section.data[0]);
      markdown += `| ${headers.join(' | ')} |\n`;
      markdown += `| ${headers.map(() => '---').join(' | ')} |\n`;
      
      section.data.forEach(row => {
        markdown += `| ${headers.map(h => row[h] || '').join(' | ')} |\n`;
      });
      
      markdown += '\n';
    } else if (typeof section.data === 'object') {
      Object.entries(section.data).forEach(([key, value]) => {
        markdown += `- **${key}:** ${value}\n`;
      });
      markdown += '\n';
    }
  });
  
  markdown += `---\n*报告由数字营销分析平台生成 | ${new Date().getFullYear()}*`;
  
  return markdown;
}

export { exportRouter };