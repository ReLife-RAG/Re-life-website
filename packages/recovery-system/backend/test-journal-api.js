/**
 * ReLife Journal API Test Script
 * Run this with: node test-journal-api.js
 */

const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

const BASE_URL = 'http://localhost:5000';
let authToken = '';
let testEntryId = '';

// ANSI color codes for better output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(testName) {
  console.log(`\n${'='.repeat(60)}`);
  log(`🧪 TEST: ${testName}`, 'cyan');
  console.log('='.repeat(60));
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message, error) {
  log(`❌ ${message}`, 'red');
  if (error.response) {
    console.log('Status:', error.response.status);
    console.log('Data:', JSON.stringify(error.response.data, null, 2));
  } else {
    console.log(error.message);
  }
}

function logResponse(data) {
  console.log(JSON.stringify(data, null, 2));
}

// Test 1: Login to get auth token
async function testLogin() {
  logTest('1. Login to Get Auth Token');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    authToken = response.data.token;
    logSuccess('Login successful!');
    log(`Token: ${authToken.substring(0, 20)}...`, 'yellow');
    return true;
  } catch (error) {
    logError('Login failed', error);
    log('\n⚠️  Please create a user first or update the credentials in this script', 'yellow');
    return false;
  }
}

// Test 2: Create Journal Entry
async function testCreateEntry() {
  logTest('2. Create Journal Entry');
  
  const formData = new FormData();
  formData.append('content', 'Today was a challenging day, but I managed to stay positive and focus on my recovery goals. I practiced mindfulness and reached out to my support group.');
  formData.append('mood', 'hopeful');
  formData.append('triggers', JSON.stringify(['stress', 'social pressure', 'work deadline']));
  formData.append('copingStrategies', JSON.stringify(['meditation', 'journaling', 'talking to support group', 'deep breathing']));
  formData.append('isPrivate', 'true');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/journal`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    testEntryId = response.data._id;
    logSuccess('Journal entry created successfully!');
    log(`Entry ID: ${testEntryId}`, 'yellow');
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to create journal entry', error);
    return false;
  }
}

// Test 3: Get All Journal Entries
async function testGetAllEntries() {
  logTest('3. Get All Journal Entries (with pagination)');
  
  try {
    const response = await axios.get(`${BASE_URL}/api/journal`, {
      params: { page: 1, limit: 10 },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Retrieved ${response.data.entries.length} journal entries`);
    log(`Total entries: ${response.data.pagination.total}`, 'yellow');
    log(`Total pages: ${response.data.pagination.totalPages}`, 'yellow');
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to get journal entries', error);
    return false;
  }
}

// Test 4: Get All Entries with Date Filter
async function testGetEntriesWithDateFilter() {
  logTest('4. Get Journal Entries (filtered by date)');
  
  const today = new Date().toISOString().split('T')[0];
  
  try {
    const response = await axios.get(`${BASE_URL}/api/journal`, {
      params: { date: today },
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess(`Retrieved ${response.data.entries.length} entries for ${today}`);
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to get filtered entries', error);
    return false;
  }
}

// Test 5: Get Single Journal Entry
async function testGetSingleEntry() {
  logTest('5. Get Single Journal Entry by ID');
  
  if (!testEntryId) {
    logError('No test entry ID available. Skipping test.');
    return false;
  }
  
  try {
    const response = await axios.get(`${BASE_URL}/api/journal/${testEntryId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess('Retrieved single journal entry');
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to get single entry', error);
    return false;
  }
}

// Test 6: Update Journal Entry
async function testUpdateEntry() {
  logTest('6. Update Journal Entry');
  
  if (!testEntryId) {
    logError('No test entry ID available. Skipping test.');
    return false;
  }
  
  const formData = new FormData();
  formData.append('content', 'Updated journal entry - I am feeling much better today! The coping strategies are really helping.');
  formData.append('mood', 'grateful');
  formData.append('triggers', JSON.stringify(['work stress']));
  formData.append('copingStrategies', JSON.stringify(['exercise', 'breathing techniques', 'positive affirmations']));
  
  try {
    const response = await axios.patch(`${BASE_URL}/api/journal/${testEntryId}`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    
    logSuccess('Journal entry updated successfully!');
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to update journal entry', error);
    return false;
  }
}

// Test 7: Delete Journal Entry
async function testDeleteEntry() {
  logTest('7. Delete Journal Entry');
  
  if (!testEntryId) {
    logError('No test entry ID available. Skipping test.');
    return false;
  }
  
  try {
    const response = await axios.delete(`${BASE_URL}/api/journal/${testEntryId}`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    
    logSuccess('Journal entry deleted successfully!');
    logResponse(response.data);
    return true;
  } catch (error) {
    logError('Failed to delete journal entry', error);
    return false;
  }
}

// Test 8: Error Handling - Unauthorized Access
async function testUnauthorizedAccess() {
  logTest('8. Test Unauthorized Access (no token)');
  
  try {
    await axios.get(`${BASE_URL}/api/journal`);
    logError('Test failed - should have been unauthorized');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      logSuccess('Correctly rejected unauthorized request');
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// Test 9: Error Handling - Invalid Entry ID
async function testInvalidEntryId() {
  logTest('9. Test Invalid Entry ID');
  
  try {
    await axios.get(`${BASE_URL}/api/journal/invalid_id_123`, {
      headers: { 'Authorization': `Bearer ${authToken}` }
    });
    logError('Test failed - should have returned 400');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Correctly rejected invalid ID');
      logResponse(error.response.data);
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// Test 10: Error Handling - Missing Required Fields
async function testMissingFields() {
  logTest('10. Test Missing Required Fields');
  
  const formData = new FormData();
  formData.append('mood', 'happy'); // Missing content
  
  try {
    await axios.post(`${BASE_URL}/api/journal`, formData, {
      headers: {
        ...formData.getHeaders(),
        'Authorization': `Bearer ${authToken}`
      }
    });
    logError('Test failed - should have returned 400');
    return false;
  } catch (error) {
    if (error.response && error.response.status === 400) {
      logSuccess('Correctly rejected request with missing fields');
      logResponse(error.response.data);
      return true;
    }
    logError('Unexpected error', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║      ReLife Journal API - Comprehensive Test Suite        ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  console.log('\n');
  
  const results = {
    passed: 0,
    failed: 0,
    total: 0
  };
  
  // Authentication is required for most tests
  const loginSuccess = await testLogin();
  if (!loginSuccess) {
    log('\n⚠️  Cannot proceed without authentication', 'red');
    log('Please ensure:', 'yellow');
    log('  1. Backend server is running on http://localhost:5000', 'yellow');
    log('  2. You have a user account created', 'yellow');
    log('  3. Update credentials in this script if needed', 'yellow');
    return;
  }
  
  // Run all tests
  const tests = [
    testCreateEntry,
    testGetAllEntries,
    testGetEntriesWithDateFilter,
    testGetSingleEntry,
    testUpdateEntry,
    testDeleteEntry,
    testUnauthorizedAccess,
    testInvalidEntryId,
    testMissingFields
  ];
  
  for (const test of tests) {
    const result = await test();
    results.total++;
    if (result) {
      results.passed++;
    } else {
      results.failed++;
    }
    await new Promise(resolve => setTimeout(resolve, 500)); // Small delay between tests
  }
  
  // Summary
  console.log('\n');
  log('╔════════════════════════════════════════════════════════════╗', 'blue');
  log('║                    Test Summary                            ║', 'blue');
  log('╚════════════════════════════════════════════════════════════╝', 'blue');
  console.log('\n');
  log(`Total Tests: ${results.total}`, 'cyan');
  log(`Passed: ${results.passed}`, 'green');
  log(`Failed: ${results.failed}`, 'red');
  log(`Success Rate: ${((results.passed / results.total) * 100).toFixed(2)}%`, 'yellow');
  console.log('\n');
  
  if (results.failed === 0) {
    log('🎉 All tests passed! Your Journal API is working perfectly!', 'green');
  } else {
    log('⚠️  Some tests failed. Please review the errors above.', 'yellow');
  }
}

// Run the test suite
runAllTests().catch(error => {
  console.error('Fatal error running tests:', error);
  process.exit(1);
});
