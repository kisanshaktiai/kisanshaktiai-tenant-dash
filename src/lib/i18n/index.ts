// Re-export everything from the new modular structure
export * from './languages';
export * from './messages';
export * from './utils';

// Keep backward compatibility
export { createIntlInstance } from './utils';
