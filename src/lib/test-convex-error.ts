import { ConvexError } from 'convex/values';

/**
 * This is a test function to demonstrate how ConvexError works and how to access the error message
 */
export function testConvexError() {
  try {
    // Simulate the error from the server
    throw new ConvexError('No questions found matching the selected criteria');
  } catch (error) {
    if (error instanceof ConvexError) {
      // Log how the error data is structured
      console.log('ConvexError data:', error.data);
      console.log('ConvexError message property:', error.message);

      // The correct way to access the error message
      const errorMessage =
        typeof error.data === 'string'
          ? error.data
          : error.data?.message || 'Unknown error';

      console.log('Extracted error message:', errorMessage);
      return errorMessage;
    } else {
      console.log('Not a ConvexError:', error);
      return 'Not a ConvexError';
    }
  }
}

/**
 * Test with object payload ConvexError
 */
export function testObjectConvexError() {
  try {
    // Simulate the error with object payload
    throw new ConvexError({
      code: 'NO_QUESTIONS_FOUND',
      message: 'No questions found with these filters',
      filters: { themes: ['123'], subthemes: [], groups: [] },
    });
  } catch (error) {
    if (error instanceof ConvexError) {
      console.log('ConvexError with object data:', error.data);

      // Extract from object structure
      const errorData = error.data as any;
      const errorMessage = errorData?.message || 'Unknown error';

      console.log('Extracted error message from object:', errorMessage);
      return errorMessage;
    } else {
      return 'Not a ConvexError';
    }
  }
}
