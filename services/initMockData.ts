// Initialize mock data on first load
export function initMockData() {
  // Initialize empty arrays if they don't exist
  if (!localStorage.getItem('mock_users')) {
    localStorage.setItem('mock_users', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_history')) {
    localStorage.setItem('mock_history', JSON.stringify([]));
  }
  if (!localStorage.getItem('mock_tables')) {
    localStorage.setItem('mock_tables', JSON.stringify([]));
  }
  
  console.log('📦 Mock data initialized');
}