export interface TestData {
  buyCrypto: {
    amount: string;
    walletAddress?: string;
    paymentMethod?: string;
    currency: {
      from: string;
      to: string;
    };
  };
  sellCrypto: {
    amount: string;
    walletAddress?: string;
    paymentMethod?: string;
  };
  user: {
    email?: string;
    phone?: string;
  };
}

export const testDataSets: Record<string, TestData> = {
  default: {
    buyCrypto: {
      amount: '195',
      paymentMethod: 'sepa_instant',
      currency: {
        from: 'vnd',
        to: 'euro'
      }
    },
    sellCrypto: {
      amount: '100',
      paymentMethod: 'sepa_instant'
    },
    user: {}
  },
  
  highAmount: {
    buyCrypto: {
      amount: '1000',
      paymentMethod: 'sepa_instant',
      currency: {
        from: 'vnd',
        to: 'euro'
      }
    },
    sellCrypto: {
      amount: '500',
      paymentMethod: 'sepa_instant'
    },
    user: {}
  },

  lowAmount: {
    buyCrypto: {
      amount: '50',
      paymentMethod: 'sepa_instant',
      currency: {
        from: 'vnd',
        to: 'euro'
      }
    },
    sellCrypto: {
      amount: '25',
      paymentMethod: 'sepa_instant'
    },
    user: {}
  }
};

export function getTestData(testType: string = 'default'): TestData {
  return testDataSets[testType] || testDataSets.default;
}