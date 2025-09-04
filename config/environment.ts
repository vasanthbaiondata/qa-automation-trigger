export interface Environment {
  name: string;
  baseUrl: string;
  apiUrl?: string;
  timeout: {
    action: number;
    navigation: number;
    test: number;
  };
  retry: {
    local: number;
    ci: number;
  };
  workers: {
    local: number;
    ci: number;
  };
}

export const environments: Record<string, Environment> = {
  dev: {
    name: 'Development',
    baseUrl: 'https://dev.transfi.com',
    apiUrl: 'https://api.dev.transfi.com',
    timeout: {
      action: 15000,
      navigation: 30000,
      test: 300000 // 5 minutes
    },
    retry: {
      local: 1,
      ci: 2
    },
    workers: {
      local: 2,
      ci: 1
    }
  },

  staging: {
    name: 'Staging',
    baseUrl: 'https://staging.transfi.com',
    apiUrl: 'https://api.staging.transfi.com',
    timeout: {
      action: 20000,
      navigation: 45000,
      test: 450000 // 7.5 minutes
    },
    retry: {
      local: 1,
      ci: 3
    },
    workers: {
      local: 2,
      ci: 1
    }
  },

  production: {
    name: 'Production',
    baseUrl: 'https://transfi.com',
    apiUrl: 'https://api.transfi.com',
    timeout: {
      action: 30000,
      navigation: 60000,
      test: 600000 // 10 minutes
    },
    retry: {
      local: 0,
      ci: 2
    },
    workers: {
      local: 1,
      ci: 1
    }
  }
};

export function getEnvironment(): Environment {
  const env = process.env.TEST_ENV || 'dev';
  return environments[env] || environments.dev;
}

export function isCI(): boolean {
  return !!process.env.CI;
}