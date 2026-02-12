/**
 * Performance monitoring utilities
 */

export interface PerformanceMetrics {
  name: string;
  duration: number;
  startTime: number;
  endTime: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
    jsHeapSizeLimit: number;
  };
}

export class PerformanceMonitor {
  private static metrics: Map<string, PerformanceMetrics> = new Map();
  private static marks: Map<string, number> = new Map();

  /**
   * Start measuring performance
   */
  static start(name: string): void {
    this.marks.set(name, performance.now());
  }

  /**
   * End measuring performance
   */
  static end(name: string): PerformanceMetrics | null {
    const startTime = this.marks.get(name);
    if (!startTime) {
      console.warn(`Performance mark '${name}' not found`);
      return null;
    }

    const endTime = performance.now();
    const duration = endTime - startTime;

    const metrics: PerformanceMetrics = {
      name,
      duration,
      startTime,
      endTime,
      memory: this.getMemoryUsage()
    };

    this.metrics.set(name, metrics);
    this.marks.delete(name);

    return metrics;
  }

  /**
   * Get memory usage
   */
  private static getMemoryUsage() {
    if ((performance as any).memory) {
      return {
        usedJSHeapSize: (performance as any).memory.usedJSHeapSize,
        totalJSHeapSize: (performance as any).memory.totalJSHeapSize,
        jsHeapSizeLimit: (performance as any).memory.jsHeapSizeLimit
      };
    }
    return undefined;
  }

  /**
   * Get all metrics
   */
  static getMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  /**
   * Get specific metric
   */
  static getMetric(name: string): PerformanceMetrics | undefined {
    return this.metrics.get(name);
  }

  /**
   * Clear metrics
   */
  static clear(): void {
    this.metrics.clear();
    this.marks.clear();
  }

  /**
   * Log metrics
   */
  static logMetrics(): void {
    console.table(this.getMetrics());
  }

  /**
   * Check if performance is acceptable
   */
  static isAcceptable(name: string, maxDuration: number): boolean {
    const metric = this.getMetric(name);
    if (!metric) return false;
    return metric.duration <= maxDuration;
  }

  /**
   * Measure function execution time
   */
  static async measureAsync<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<T> {
    this.start(name);
    try {
      return await fn();
    } finally {
      this.end(name);
    }
  }

  /**
   * Measure synchronous function execution time
   */
  static measure<T>(name: string, fn: () => T): T {
    this.start(name);
    try {
      return fn();
    } finally {
      this.end(name);
    }
  }

  /**
   * Get average duration for a metric
   */
  static getAverageDuration(name: string): number {
    const metrics = Array.from(this.metrics.values()).filter(m => m.name === name);
    if (metrics.length === 0) return 0;
    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  /**
   * Get performance report
   */
  static getReport(): string {
    const metrics = this.getMetrics();
    let report = 'Performance Report\n';
    report += '==================\n\n';

    metrics.forEach(metric => {
      report += `${metric.name}: ${metric.duration.toFixed(2)}ms\n`;
      if (metric.memory) {
        report += `  Memory: ${(metric.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB\n`;
      }
    });

    return report;
  }
}

/**
 * Decorator for measuring function performance
 */
export function Measure(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
    const name = `${target.constructor.name}.${propertyKey}`;
    return PerformanceMonitor.measure(name, () => originalMethod.apply(this, args));
  };

  return descriptor;
}

/**
 * Decorator for measuring async function performance
 */
export function MeasureAsync(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;

  descriptor.value = async function(...args: any[]) {
    const name = `${target.constructor.name}.${propertyKey}`;
    return PerformanceMonitor.measureAsync(name, () => originalMethod.apply(this, args));
  };

  return descriptor;
}
