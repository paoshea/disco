# Integration Tests

These tests verify complete user flows through multiple components and services. They ensure that different parts of the application work together correctly.

## Test Structure

Each test file focuses on a complete user flow, such as:

- Registration to profile completion
- Event creation and matching
- Location sharing and privacy settings

## Mock Strategy

- External APIs are mocked
- Database calls use a test database
- Authentication uses test tokens
- Geolocation uses mock coordinates

## Running Tests

Run integration tests separately from unit tests:

```bash
npm run test:integration
```

## Adding New Tests

1. Create a new test file in the appropriate flow directory
2. Import necessary test utilities from `../test-utils`
3. Use the provided mock data from `../__mocks__`
4. Follow the existing patterns for consistent test structure
