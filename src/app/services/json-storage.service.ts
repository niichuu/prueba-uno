import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class JsonStorageService {
  private readonly STORAGE_KEYS = {
    QUESTIONS: 'quiz-questions',
    RESPONSES: 'quiz-responses',
    RESULTS: 'quiz-results'
  } as const;

  constructor() {}

  setData<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      throw new Error('Failed to save data');
    }
  }

  getData<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return [];
    }
  }

  addItem<T>(key: string, item: T): void {
    const items = this.getData<T>(key);
    items.push(item);
    this.setData(key, items);
  }

  clearAll(): void {
    Object.values(this.STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  get storageKeys() {
    return this.STORAGE_KEYS;
  }
}
