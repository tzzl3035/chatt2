import { marked } from 'marked'
import katex from 'katex'

/**
 * 渲染 Markdown 和 LaTeX
 * 支持：
 * - 标准 Markdown 语法
 * - 行内 LaTeX: $E=mc^2$
 * - 块级 LaTeX: $$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$
 */
export function renderMarkdown(content: string): string {
  const latexMatches: Array<{ type: 'inline' | 'display'; latex: string; index: number; endIndex: number }> = []
  let match

  // 查找所有 LaTeX 公式（包括行内和块级）
  const regex = /\$\$([\s\S]*?)\$\$|\$([^$\n]+?)\$/g
  while ((match = regex.exec(content)) !== null) {
    if (match[1]) {
      // 块级公式 $$
      latexMatches.push({
        type: 'display',
        latex: match[1],
        index: match.index,
        endIndex: regex.lastIndex
      })
    } else if (match[2]) {
      // 行内公式 $
      latexMatches.push({
        type: 'inline',
        latex: match[2],
        index: match.index,
        endIndex: regex.lastIndex
      })
    }
  }

  // 如果没有 LaTeX 公式，直接处理 Markdown
  if (latexMatches.length === 0) {
    const result = marked.parse(content) as string
    return result
  }

  // 使用 HTML 注释作为占位符（marked 不会解析注释）
  let processed = content
  const placeholders: string[] = []
  
  // 从后往前替换，避免索引变化
  for (let i = latexMatches.length - 1; i >= 0; i--) {
    const item = latexMatches[i]
    if (!item) continue
    
    const placeholder = `<!-- KATEX_PLACEHOLDER_${i} -->`
    placeholders[i] = placeholder
    processed = processed.slice(0, item.index) + placeholder + processed.slice(item.endIndex)
  }

  // 处理 Markdown
  let html = marked.parse(processed) as string

  // 渲染所有 LaTeX 公式并替换回去
  latexMatches.forEach((item, index) => {
    const placeholder = placeholders[index]
    if (!placeholder) return
    
    try {
      const rendered = katex.renderToString(item.latex.trim(), {
        displayMode: item.type === 'display',
        throwOnError: false,
      })
      
      // 移除 MathML 部分，避免重复显示
      const cleanedRendered = rendered.replace(/<span class="katex-mathml">[\s\S]*?<\/span>/g, '')
      
      html = html.split(placeholder).join(cleanedRendered)
    } catch (error) {
      const fallback = item.type === 'display' ? `$$${item.latex}$$` : `$${item.latex}$`
      html = html.split(placeholder).join(fallback)
    }
  })

  return html
}

/**
 * 清理 HTML 标签（用于预览或文本模式）
 */
export function stripHtml(html: string): string {
  const div = document.createElement('div')
  div.innerHTML = html
  return div.textContent || div.innerText || ''
}