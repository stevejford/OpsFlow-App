console.log('Running example.test.ts...');

describe('Example Test Suite', () => {
  console.log('Describing test suite...');
  
  beforeAll(() => {
    console.log('Before all tests');
  });

  it('should pass a simple test', () => {
    console.log('Running simple test...');
    expect(1 + 1).toBe(2);
  });

  it('should handle async code', async () => {
    console.log('Running async test...');
    const result = await Promise.resolve('test');
    expect(result).toBe('test');
  });

  afterAll(() => {
    console.log('After all tests');
  });
});
