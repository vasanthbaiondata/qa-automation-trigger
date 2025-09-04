export const testData = {
  baseURL: 'https://sandbox-buy.transfi.com/?apiKey=m4P91ifvL9NLCxQceZ',

  // Positive test email
  validEmail: 'demo@gmail.com',

  // Negative test emails
  invalidEmail1: 'demo@gmail.com',      // invalid format
  invalidEmail2: 'failed@gmailcom',     // missing dot

  // Signup scenario
  newUserEmail: 'demo23@gmail.com',

  // Expected validation message
  expectedError: 'Must be a valid email'
};
