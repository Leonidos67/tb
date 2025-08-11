import {
  GarminActivity,
  GarminUser,
  GarminConnectionStatus,
  SyncResult,
  IntegrationError
} from "@/types/integrations.type";

// Конфигурация для демо-режима (без реальных API ключей)
const GARMIN_CONFIG = {
  baseUrl: 'https://apis.garmin.com/wellness-api/rest',
  authUrl: 'https://connect.garmin.com/oauthConfirm',
  tokenUrl: 'https://connect.garmin.com/oauth/token',
  scope: ['activity', 'profile', 'location'],
  clientId: 'demo-client-id',
  clientSecret: 'demo-client-secret',
  redirectUri: 'http://localhost:3000/auth/garmin/callback'
};

class GarminService {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private tokenExpiry: Date | null = null;

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage(): void {
    try {
      const stored = localStorage.getItem('garmin_tokens');
      if (stored) {
        const tokens = JSON.parse(stored);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.tokenExpiry = tokens.tokenExpiry ? new Date(tokens.tokenExpiry) : null;
      }
    } catch (error) {
      console.error('Ошибка загрузки токенов из localStorage:', error);
    }
  }

  private saveTokensToStorage(): void {
    try {
      const tokens = {
        accessToken: this.accessToken,
        refreshToken: this.refreshToken,
        tokenExpiry: this.tokenExpiry?.toISOString()
      };
      localStorage.setItem('garmin_tokens', JSON.stringify(tokens));
    } catch (error) {
      console.error('Ошибка сохранения токенов в localStorage:', error);
    }
  }

  private isTokenExpired(): boolean {
    if (!this.tokenExpiry) return true;
    return new Date() > this.tokenExpiry;
  }

  private async refreshAccessToken(): Promise<boolean> {
    try {
      // Имитация обновления токена
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Генерируем новый токен на 1 час
      this.accessToken = 'demo-refreshed-token-' + Date.now();
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000);
      this.saveTokensToStorage();
      
      return true;
    } catch (error) {
      console.error('Ошибка обновления токена:', error);
      return false;
    }
  }

  private async getValidToken(): Promise<string | null> {
    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) return null;
    }
    return this.accessToken;
  }

  public initiateAuth(): string {
    const state = this.generateState();
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: GARMIN_CONFIG.clientId,
      redirect_uri: GARMIN_CONFIG.redirectUri,
      scope: GARMIN_CONFIG.scope.join(' '),
      state: state
    });
    
    return `${GARMIN_CONFIG.authUrl}?${params.toString()}`;
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  }

  public async handleAuthCallback(code: string, state: string): Promise<boolean> {
    try {
      // Имитация обмена кода на токены
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Генерируем демо-токены
      this.accessToken = 'demo-access-token-' + Date.now();
      this.refreshToken = 'demo-refresh-token-' + Date.now();
      this.tokenExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 час
      
      this.saveTokensToStorage();
      return true;
    } catch (error) {
      console.error('Ошибка обработки callback:', error);
      return false;
    }
  }

  public async getUserInfo(): Promise<GarminUser | null> {
    try {
      const token = await this.getValidToken();
      if (!token) return null;

      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Возвращаем демо-данные пользователя
      return {
        id: 'demo-user-123',
        username: 'demo_runner',
        email: 'demo@example.com',
        firstName: 'Демо',
        lastName: 'Пользователь',
        profilePicture: undefined
      };
    } catch (error) {
      console.error('Ошибка получения информации о пользователе:', error);
      return null;
    }
  }

  public async getActivities(startDate?: string, endDate?: string): Promise<GarminActivity[]> {
    try {
      const token = await this.getValidToken();
      if (!token) return [];

      // Имитация API вызова
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Генерируем демо-активности
      const activities: GarminActivity[] = [
        {
          id: 'activity-1',
          name: 'Утренняя пробежка',
          type: 'Бег',
          startTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          duration: 3600, // 1 час
          distance: 10000, // 10 км
          calories: 650,
          averageHeartRate: 145,
          maxHeartRate: 165,
          averageSpeed: 2.8,
          maxSpeed: 3.2
        },
        {
          id: 'activity-2',
          name: 'Велосипедная тренировка',
          type: 'Велосипед',
          startTime: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 5400, // 1.5 часа
          distance: 25000, // 25 км
          calories: 850,
          averageHeartRate: 135,
          maxHeartRate: 155,
          averageSpeed: 4.6,
          maxSpeed: 5.2
        },
        {
          id: 'activity-3',
          name: 'Силовая тренировка',
          type: 'Тренажерный зал',
          startTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 2700, // 45 минут
          distance: 0,
          calories: 420,
          averageHeartRate: 120,
          maxHeartRate: 140
        },
        {
          id: 'activity-4',
          name: 'Плавание в бассейне',
          type: 'Плавание',
          startTime: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 1800, // 30 минут
          distance: 1500, // 1.5 км
          calories: 380,
          averageHeartRate: 130,
          maxHeartRate: 150
        },
        {
          id: 'activity-5',
          name: 'Йога',
          type: 'Йога',
          startTime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          duration: 3600, // 1 час
          distance: 0,
          calories: 280,
          averageHeartRate: 95,
          maxHeartRate: 110
        }
      ];

      // Фильтруем по датам если указаны
      if (startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return activities.filter(activity => {
          const activityDate = new Date(activity.startTime);
          return activityDate >= start && activityDate <= end;
        });
      }

      return activities;
    } catch (error) {
      console.error('Ошибка получения активностей:', error);
      return [];
    }
  }

  public async syncActivities(startDate?: string, endDate?: string): Promise<SyncResult> {
    try {
      const token = await this.getValidToken();
      if (!token) {
        throw new Error('Токен не найден');
      }

      // Имитация синхронизации
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Получаем активности для синхронизации
      const activities = await this.getActivities(startDate, endDate);
      
      // Сохраняем дату последней синхронизации
      const lastSync = new Date().toISOString();
      localStorage.setItem('garmin_last_sync', lastSync);
      
      return {
        success: true,
        activitiesCount: activities.length,
        timestamp: lastSync
      };
    } catch (error) {
      console.error('Ошибка синхронизации активностей:', error);
      return {
        success: false,
        activitiesCount: 0,
        errors: [error instanceof Error ? error.message : 'Неизвестная ошибка'],
        timestamp: new Date().toISOString()
      };
    }
  }

  public async getConnectionStatus(): Promise<GarminConnectionStatus> {
    try {
      const token = await this.getValidToken();
      const isConnected = !!token && !this.isTokenExpired();
      
      let user: GarminUser | undefined;
      let lastSync: string | undefined;
      
      if (isConnected) {
        const userInfo = await this.getUserInfo();
        user = userInfo || undefined;
        lastSync = localStorage.getItem('garmin_last_sync') || undefined;
      }
      
      return {
        isConnected,
        lastSync,
        user,
        tokenExpiry: this.tokenExpiry?.toISOString()
      };
    } catch (error) {
      console.error('Ошибка получения статуса подключения:', error);
      return {
        isConnected: false
      };
    }
  }

  public disconnect(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenExpiry = null;
    
    // Очищаем localStorage
    localStorage.removeItem('garmin_tokens');
    localStorage.removeItem('garmin_last_sync');
  }

  public async downloadFITFile(activityId: string): Promise<ArrayBuffer | null> {
    try {
      const token = await this.getValidToken();
      if (!token) return null;

      // Имитация загрузки FIT файла
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Возвращаем пустой ArrayBuffer для демо
      return new ArrayBuffer(1024);
    } catch (error) {
      console.error('Ошибка загрузки FIT файла:', error);
      return null;
    }
  }
}

export const garminService = new GarminService();
export default garminService;
