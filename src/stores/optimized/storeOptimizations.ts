// Optimized Store Configuration with selective subscriptions and memory management
import { StoreApi, UseBoundStore, create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { shallow } from 'zustand/shallow'

// Store slicing pattern for better memory management
export interface SlicedStore<T> {
  subscribe: (
    listener: (selectedState: Partial<T>, previousSelectedState: Partial<T>) => void,
    selector?: (state: T) => Partial<T>,
    options?: { fireImmediately?: boolean; equalityFn?: (a: any, b: any) => boolean }
  ) => () => void
}

// Create optimized store with selective subscriptions
export function createOptimizedStore<T>(
  initializer: (set: any, get: any) => T
): UseBoundStore<StoreApi<T>> {
  return create(subscribeWithSelector(initializer))
}

// Memory-efficient selector hook
export function useStoreSelector<T, U>(
  store: UseBoundStore<StoreApi<T>>,
  selector: (state: T) => U,
  equalityFn = shallow
): U {
  return store(selector, equalityFn)
}

// Lazy loading wrapper for heavy operations
export function createLazyAction<T extends any[], R>(
  loader: () => Promise<any>,
  action: (...args: [...T, any]) => R
) {
  let loadedModule: any = null
  
  return async (...args: T): Promise<R> => {
    if (!loadedModule) {
      loadedModule = await loader()
    }
    return action(...args, loadedModule)
  }
}

// Debounced state updates to reduce re-renders
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Optimized state persistence with compression
export interface PersistOptions {
  name: string
  version?: number
  compress?: boolean
  whitelist?: string[]
  blacklist?: string[]
}

export function persistStore<T>(
  store: UseBoundStore<StoreApi<T>>,
  options: PersistOptions
) {
  const { name, version = 1, compress = true, whitelist, blacklist } = options
  
  // Load state from localStorage
  const loadState = () => {
    try {
      const saved = localStorage.getItem(`${name}_v${version}`)
      if (saved) {
        const state = compress ? decompressState(saved) : JSON.parse(saved)
        return filterState(state, whitelist, blacklist)
      }
    } catch (error) {
      console.error('Failed to load persisted state:', error)
    }
    return null
  }
  
  // Save state to localStorage
  const saveState = debounce((state: T) => {
    try {
      const filtered = filterState(state, whitelist, blacklist)
      const data = compress ? compressState(filtered) : JSON.stringify(filtered)
      localStorage.setItem(`${name}_v${version}`, data)
    } catch (error) {
      console.error('Failed to persist state:', error)
    }
  }, 1000)
  
  // Initialize with saved state
  const savedState = loadState()
  if (savedState) {
    store.setState(savedState as T)
  }
  
  // Subscribe to state changes
  store.subscribe(saveState)
}

// Simple state compression (using LZ-string concept)
function compressState(state: any): string {
  // In production, use a real compression library like lz-string
  // This is a simplified version
  return btoa(JSON.stringify(state))
}

function decompressState(compressed: string): any {
  // In production, use a real compression library
  return JSON.parse(atob(compressed))
}

// Filter state based on whitelist/blacklist
function filterState(
  state: any,
  whitelist?: string[],
  blacklist?: string[]
): any {
  if (whitelist) {
    const filtered: any = {}
    whitelist.forEach(key => {
      if (key in state) {
        filtered[key] = state[key]
      }
    })
    return filtered
  }
  
  if (blacklist) {
    const filtered = { ...state }
    blacklist.forEach(key => {
      delete filtered[key]
    })
    return filtered
  }
  
  return state
}

// Memory cleanup utility
export class MemoryManager {
  private cleanupTasks: Array<() => void> = []
  
  register(cleanup: () => void) {
    this.cleanupTasks.push(cleanup)
  }
  
  cleanup() {
    this.cleanupTasks.forEach(task => task())
    this.cleanupTasks = []
  }
  
  // Clear unused data from stores
  clearUnusedData(stores: UseBoundStore<StoreApi<any>>[]) {
    stores.forEach(store => {
      const state = store.getState()
      
      // Clear large arrays that are not currently visible
      Object.keys(state).forEach(key => {
        if (Array.isArray(state[key]) && state[key].length > 100) {
          // Keep only recent 100 items for large arrays
          store.setState({
            [key]: state[key].slice(-100)
          } as any)
        }
      })
    })
  }
}

// Singleton memory manager
export const memoryManager = new MemoryManager()

// Virtual scrolling data manager
export class VirtualDataManager<T> {
  private cache = new Map<string, T[]>()
  private maxCacheSize = 500
  
  constructor(private fetchData: (offset: number, limit: number) => Promise<T[]>) {}
  
  async getPage(page: number, pageSize: number): Promise<T[]> {
    const key = `${page}_${pageSize}`
    
    if (this.cache.has(key)) {
      return this.cache.get(key)!
    }
    
    const offset = (page - 1) * pageSize
    const data = await this.fetchData(offset, pageSize)
    
    // Manage cache size
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value
      if (firstKey) {
        this.cache.delete(firstKey)
      }
    }
    
    this.cache.set(key, data)
    return data
  }
  
  clearCache() {
    this.cache.clear()
  }
}

// Batch state updates for better performance
export class BatchUpdater<T> {
  private updates: Partial<T>[] = []
  private timer: NodeJS.Timeout | null = null
  
  constructor(
    private store: UseBoundStore<StoreApi<T>>,
    private delay: number = 50
  ) {}
  
  update(updates: Partial<T>) {
    this.updates.push(updates)
    
    if (this.timer) clearTimeout(this.timer)
    
    this.timer = setTimeout(() => {
      if (this.updates.length > 0) {
        const merged = this.updates.reduce((acc, update) => ({
          ...acc,
          ...update
        }), {})
        
        this.store.setState(merged as T)
        this.updates = []
      }
    }, this.delay)
  }
  
  flush() {
    if (this.timer) {
      clearTimeout(this.timer)
      this.timer = null
    }
    
    if (this.updates.length > 0) {
      const merged = this.updates.reduce((acc, update) => ({
        ...acc,
        ...update
      }), {})
      
      this.store.setState(merged as T)
      this.updates = []
    }
  }
}