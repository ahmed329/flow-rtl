import { Contents } from '@flow/epubjs'
import { Settings } from './types'

export enum Style {
  Default = 'default',
  Custom = 'custom',
}

export const defaultStyle = `
  html {
    font-size: 100% !important;
  }
  body {
    margin: 0 !important;
    padding: 20px !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif !important;
    font-size: 1em !important;
    line-height: 1.5 !important;
    -webkit-font-smoothing: antialiased !important;
    text-rendering: optimizeLegibility !important;
    text-size-adjust: 100% !important;
    overflow-wrap: break-word !important;
  }
  a {
    color: #4183C4 !important;
    text-decoration: none !important;
  }
  a:hover {
    text-decoration: underline !important;
  }
  img {
    max-width: 100% !important;
    height: auto !important;
  }
  h1, h2, h3, h4, h5, h6 {
    line-height: 1.25 !important;
    margin-top: 1.5em !important;
    margin-bottom: 0.5em !important;
  }
  h1 {
    font-size: 2em !important;
  }
  h2 {
    font-size: 1.5em !important;
  }
  h3 {
    font-size: 1.25em !important;
  }
  h4 {
    font-size: 1em !important;
  }
  h5 {
    font-size: 0.875em !important;
  }
  h6 {
    font-size: 0.75em !important;
  }
  p {
    margin-top: 0 !important;
    margin-bottom: 1em !important;
  }
  pre {
    margin-top: 0 !important;
    margin-bottom: 1em !important;
    padding: 1em !important;
    background-color: #f5f5f5 !important;
    border-radius: 3px !important;
    overflow: auto !important;
  }
  code {
    font-family: Menlo, Monaco, Consolas, 'Courier New', monospace !important;
    font-size: 0.9em !important;
    padding: 0.2em 0.4em !important;
    background-color: #f5f5f5 !important;
    border-radius: 3px !important;
  }
  pre code {
    padding: 0 !important;
    background-color: transparent !important;
  }
  blockquote {
    margin: 0 0 1em !important;
    padding: 0 1em !important;
    color: #777 !important;
    border-left: 0.25em solid #ddd !important;
  }
  table {
    border-collapse: collapse !important;
    border-spacing: 0 !important;
    margin-top: 0 !important;
    margin-bottom: 1em !important;
  }
  table th,
  table td {
    padding: 6px 13px !important;
    border: 1px solid #ddd !important;
  }
  table tr {
    background-color: #fff !important;
    border-top: 1px solid #ccc !important;
  }
  table tr:nth-child(2n) {
    background-color: #f8f8f8 !important;
  }
  hr {
    margin: 1.5em 0 !important;
    border: 0 !important;
    border-top: 1px solid #eee !important;
  }
  ol,
  ul {
    padding-left: 2em !important;
    margin-top: 0 !important;
    margin-bottom: 1em !important;
  }
  ol ol,
  ul ol {
    list-style-type: lower-roman !important;
  }
  ol ul,
  ul ul {
    list-style-type: circle !important;
  }
  ol ul ul,
  ul ul ul {
    list-style-type: square !important;
  }
  ol ol ul,
  ol ul ul,
  ul ol ul,
  ul ul ul {
    list-style-type: square !important;
  }
  dl {
    margin-top: 0 !important;
    margin-bottom: 1em !important;
  }
  dl dt {
    font-weight: bold !important;
    margin-top: 1em !important;
  }
  dl dd {
    margin-left: 0 !important;
    margin-bottom: 0.5em !important;
  }
`

export const rtlStyles = `
  body[dir="rtl"] {
    direction: rtl;
    text-align: right;
  }
  
  body[dir="rtl"] .epub-container {
    direction: rtl;
  }
  
  body[dir="rtl"] .epub-view {
    direction: rtl;
  }
  
  [dir="rtl"] * {
    text-align: right;
  }
  
  [dir="rtl"] .ReaderGridView {
    direction: rtl;
  }
`

function mapToCss(obj: Record<string, any>) {
  return Object.entries(obj)
    .map(([key, value]) => `${key}: ${value} !important;`)
    .join('\n')
}

export function updateCustomStyle(
  contents: Contents | undefined,
  settings: Settings | undefined,
) {
  if (!contents || !settings) return

  const { zoom, ...other } = settings
  let css = `a, article, cite, div, li, p, pre, span, table, body {
    ${mapToCss(other)}
  }`
  
  // إضافة أنماط RTL
  css += rtlStyles

  if (zoom) {
    const body = contents.content as HTMLBodyElement
    const scale = (p: keyof CSSStyleDeclaration) => ({
      [p]: `${parseInt(body.style[p] as string) / zoom}px`,
    })
    css += `body {
      ${mapToCss({
        transformOrigin: 'top left',
        transform: `scale(${zoom})`,
        ...scale('width'),
        ...scale('height'),
        ...scale('columnWidth'),
        ...scale('columnGap'),
        ...scale('paddingTop'),
        ...scale('paddingBottom'),
        ...scale('paddingLeft'),
        ...scale('paddingRight'),
      })}
    }`
  }

  return contents.addStylesheetCss(css, Style.Custom)
}
export function lock(l: number, r: number, unit = 'px') {
  const minw = 400
  const maxw = 2560

  return `calc(${l}${unit} + ${r - l} * (100vw - ${minw}px) / ${maxw - minw})`
}