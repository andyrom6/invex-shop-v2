export const logger = {
  time: (label: string) => {
    console.time(`⏱️ ${label}`)
    return () => console.timeEnd(`⏱️ ${label}`)
  },
  
  info: (message: string, data?: any) => {
    console.log(`ℹ️ ${message}`, data || '')
  },
  
  warn: (message: string, data?: any) => {
    console.warn(`⚠️ ${message}`, data || '')
  },
  
  error: (message: string, error?: any) => {
    console.error(`❌ ${message}`, error || '')
  },
  
  success: (message: string, data?: any) => {
    console.log(`✅ ${message}`, data || '')
  }
}