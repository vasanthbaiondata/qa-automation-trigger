export const testData = {
  urls: {
    sandbox: 'https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ'
  },
  user: {
    // TC-001: Positive signup
    TC001: {
      firstName: 'first',
      lastName: 'last',
      dob: '1990-01-01',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-002: First name missing
    TC002: {
      firstName: '',
      lastName: 'last',
      dob: '1990-01-01',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-003: Last name missing
    TC003: {
      firstName: 'first',
      lastName: '',
      dob: '1990-01-01',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-004: DOB missing
    TC004: {
      firstName: 'first',
      lastName: 'last',
      dob: '',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-005: Country missing
    TC005: {
      firstName: 'first',
      lastName: 'last',
      dob: '1990-01-01',
      country: '',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-006: Over age
    TC006: {
      firstName: 'first',
      lastName: 'last',
      dob: '1940-01-15',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    },

    // TC-007: Under age
    TC007: {
      firstName: 'first',
      lastName: 'last',
      dob: '2010-05-15',
      country: 'India',
      get testEmail() { return `testingsignin+${Date.now()}@gmail.com`; }
    }
  }
};