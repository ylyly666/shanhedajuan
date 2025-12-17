// 文件解析工具 - 支持PDF、Word、TXT

/**
 * 解析文本文件
 */
export const parseTextFile = async (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target?.result as string);
    };
    reader.onerror = reject;
    reader.readAsText(file, 'UTF-8');
  });
};

/**
 * 解析Word文档 (.docx)
 */
export const parseWordFile = async (file: File): Promise<string> => {
  try {
    const mammoth = await import('mammoth');
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value;
  } catch (error) {
    console.error('Word解析失败:', error);
    throw new Error('Word文档解析失败，请确保文件格式正确');
  }
};

/**
 * 解析PDF文件
 */
export const parsePDFFile = async (file: File): Promise<string> => {
  try {
    const pdfjsLib = await import('pdfjs-dist');
    
    // 设置worker路径
    pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    
    let fullText = '';
    
    // 提取所有页面的文本
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }
    
    return fullText;
  } catch (error) {
    console.error('PDF解析失败:', error);
    throw new Error('PDF文档解析失败，请确保文件格式正确');
  }
};

/**
 * 通用文件解析入口
 */
export const parseFile = async (file: File): Promise<string> => {
  const fileName = file.name.toLowerCase();
  const fileType = file.type;

  // 文本文件
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    return await parseTextFile(file);
  }

  // Word文档
  if (
    fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
    fileName.endsWith('.docx')
  ) {
    return await parseWordFile(file);
  }

  // PDF文件
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    return await parsePDFFile(file);
  }

  // 旧版Word (.doc) - 尝试作为文本读取
  if (fileName.endsWith('.doc')) {
    console.warn('.doc格式不支持，请转换为.docx格式');
    throw new Error('不支持.doc格式，请转换为.docx格式');
  }

  // 默认尝试文本解析
  try {
    return await parseTextFile(file);
  } catch (error) {
    throw new Error(`不支持的文件格式: ${fileType || '未知'}`);
  }
};



