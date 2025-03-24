/**
 * Utility functions for CLI scripts
 */

export function printHeader(title: string): void {
  console.log('\n' + '='.repeat(50));
  console.log(`  ${title}`);
  console.log('='.repeat(50) + '\n');
}

export function printSection(title: string): void {
  console.log('\n' + '-'.repeat(40));
  console.log(`  ${title}`);
  console.log('-'.repeat(40));
}

export function printSuccess(message: string): void {
  console.log(`✅ ${message}`);
}

export function printError(message: string, error?: any): void {
  console.error(`❌ ${message}`);
  if (error) {
    if (error.message) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   ${error}`);
    }
  }
}

export function printInfo(message: string): void {
  console.log(`ℹ️  ${message}`);
}

export function printWarning(message: string): void {
  console.log(`⚠️  ${message}`);
}

export function formatAddress(address: string, label?: string): string {
  return `${label ? label + ': ' : ''}${address}`;
} 