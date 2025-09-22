

# Transif Automation Testing

Transif Automation is an end-to-end testing project built with **Playwright**. It automates workflows, form submissions, and validations for web applications, including OTP verification, crypto exchange flows

## Installation

1. First, install all the project packages:
   npm install


2. Then, install Playwright browsers:
   npx playwright install

## Running Tests

You can run specific groups of tests using the `TEST_GROUP` variable.

### Example:

To run the **E2E** group in headed mode (browser visible):

 TEST_GROUP= "<groupname>" npx playwright test --headed

    Replace <groupname> with the group you want to run.

## Finding Test Group Names

All available test groups are listed in the `test.env.json` file.

### Steps:

1. Open the `test.env.json` file in your project folder.
2. Look for the `TEST_GROUP` key. You will see the available group names like:

{
  "TEST_GROUP": "E2E"
}

