// API service for communicating with the Bloom backend
import { API_CONFIG } from '../config/api';

const API_BASE_URL = API_CONFIG.BASE_URL;

class ApiError extends Error {
  constructor(
    message: string,
    public code: string,
    public status: number
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

class ApiService {
  private baseURL: string;
  private token: string | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = localStorage.getItem('bloom_token');
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new ApiError(
          data.error || 'Request failed',
          data.code || 'UNKNOWN_ERROR',
          response.status
        );
      }

      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError(
        'Network error',
        'NETWORK_ERROR',
        0
      );
    }
  }

  // Authentication methods
  async signup(email: string, password: string) {
    const response = await this.request<{
      message: string;
      token: string;
      user: { id: string; email: string };
    }>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async signin(email: string, password: string) {
    const response = await this.request<{
      message: string;
      token: string;
      user: { id: string; email: string };
    }>('/auth/signin', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    this.setToken(response.token);
    return response;
  }

  async demoAuth() {
    const response = await this.request<{
      message: string;
      token: string;
      user: { id: string; email: string };
    }>('/auth/demo', {
      method: 'POST',
    });

    this.setToken(response.token);
    return response;
  }

  async getCurrentUser() {
    return this.request<{
      user: {
        id: string;
        email: string;
        created_at: string;
        last_login: string;
      };
    }>('/auth/me');
  }

  // Tree methods
  async getCurrentTree() {
    return this.request<{
      tree: {
        id: string;
        user_id: string;
        tree_number: number;
        stage: 'seed' | 'sapling' | 'bloom' | 'decay';
        health: number;
        day: number;
        planted_at: string;
        completed_at: string | null;
        is_current: boolean;
        position_x: number;
        position_z: number;
        created_at: string;
        updated_at: string;
      };
    }>('/trees/current');
  }

  async getAllTrees() {
    return this.request<{
      trees: Array<{
        id: string;
        user_id: string;
        tree_number: number;
        stage: 'seed' | 'sapling' | 'bloom' | 'decay';
        health: number;
        day: number;
        planted_at: string;
        completed_at: string | null;
        is_current: boolean;
        position_x: number;
        position_z: number;
        created_at: string;
        updated_at: string;
      }>;
    }>('/trees');
  }

  async createTree() {
    return this.request<{
      message: string;
      tree: {
        id: string;
        user_id: string;
        tree_number: number;
        stage: 'seed' | 'sapling' | 'bloom' | 'decay';
        health: number;
        day: number;
        planted_at: string;
        completed_at: string | null;
        is_current: boolean;
        position_x: number;
        position_z: number;
        created_at: string;
        updated_at: string;
      };
    }>('/trees', {
      method: 'POST',
    });
  }

  async updateTree(treeId: string, updates: {
    health?: number;
    stage?: 'seed' | 'sapling' | 'bloom' | 'decay';
    day?: number;
  }) {
    return this.request<{
      message: string;
      tree: {
        id: string;
        user_id: string;
        tree_number: number;
        stage: 'seed' | 'sapling' | 'bloom' | 'decay';
        health: number;
        day: number;
        planted_at: string;
        completed_at: string | null;
        is_current: boolean;
        position_x: number;
        position_z: number;
        created_at: string;
        updated_at: string;
      };
    }>(`/trees/${treeId}`, {
      method: 'PATCH',
      body: JSON.stringify(updates),
    });
  }

  async completeTree(treeId: string) {
    return this.request<{
      message: string;
      completedTree: any;
      newTree: any;
    }>(`/trees/${treeId}/complete`, {
      method: 'POST',
    });
  }

  // Habit methods
  async submitHabitAnswer(treeId: string, questionId: string, answer: boolean) {
    return this.request<{
      message: string;
      tree: any;
      habitRecord: any;
      remainingQuestions: number;
      healthChange: number;
    }>('/habits/answer', {
      method: 'POST',
      body: JSON.stringify({
        treeId,
        questionId,
        answer,
      }),
    });
  }

  async getTodayHabits(treeId: string) {
    return this.request<{
      habitRecord: any;
      answeredCount: number;
      remainingQuestions: number;
      isComplete: boolean;
    }>(`/habits/today/${treeId}`);
  }

  async getHabitHistory(treeId: string, limit = 30, offset = 0) {
    return this.request<{
      habits: any[];
    }>(`/habits/history/${treeId}?limit=${limit}&offset=${offset}`);
  }

  async getUserStats() {
    return this.request<{
      userStats: any;
      treeStats: any;
      habitStats: any;
    }>('/habits/stats');
  }

  // Utility methods
  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('bloom_token', token);
    } else {
      localStorage.removeItem('bloom_token');
    }
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('bloom_token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }
}

// Create and export a singleton instance
export const api = new ApiService(API_BASE_URL);
export { ApiError };
