// simple.test.js - A simple test to verify Jest is working

describe('Simple Test Suite', () => {
  console.log('Running simple test...');
  
  it('should pass a simple test', () => {
    console.log('Inside test...');
    expect(1 + 1).toBe(2);
  });
});
