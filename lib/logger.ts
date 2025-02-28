// Safe logger that works in both client and server environments
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

// Server-only logger with additional functionality
// Use this for server-side operations that shouldn't run on the client
export const serverLogger = {
  ...logger,
  
  // Add server-only methods here
  logToFile: (message: string, data?: any) => {
    // This would only run on the server
    if (typeof window !== 'undefined') {
      console.error('serverLogger.logToFile cannot be called from the client side');
      return;
    }
    
    // Server-side logging logic would go here
    console.log(`📝 ${message}`, data || '');
  }
}