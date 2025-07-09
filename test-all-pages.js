const puppeteer = require('puppeteer');

// รายการหน้าที่ต้องทดสอบ
const pagesToTest = [
  { path: '/', name: 'Homepage' },
  { path: '/login', name: 'Login Page' },
  { path: '/select-garden', name: 'Select Garden Page' },
  { path: '/garden', name: 'Garden Page' },
  { path: '/test-login', name: 'Test Login Page' },
  { path: '/unauthorized', name: 'Unauthorized Page' },
  { path: '/admin', name: 'Admin Dashboard' },
  { path: '/admin/login', name: 'Admin Login' },
  { path: '/admin/dashboard', name: 'Admin Dashboard' },
  { path: '/admin/gardens', name: 'Admin Gardens' },
  { path: '/admin/stock', name: 'Admin Stock' },
  { path: '/admin/stock/create', name: 'Admin Stock Create' },
  { path: '/admin/purchases', name: 'Admin Purchases' },
  { path: '/admin/sale', name: 'Admin Sale' },
  { path: '/admin/sale-report', name: 'Admin Sale Report' },
  { path: '/admin/cost-analysis', name: 'Admin Cost Analysis' },
  { path: '/admin/import', name: 'Admin Import' },
  { path: '/admin/select-garden', name: 'Admin Select Garden' }
];

// รายการ API ที่ต้องทดสอบ
const apisToTest = [
  { path: '/api/auth/me', name: 'Auth Me API' },
  { path: '/api/our-gardens', name: 'Our Gardens API' },
  { path: '/api/supplier-gardens', name: 'Supplier Gardens API' },
  { path: '/api/gardens', name: 'Gardens API' },
  { path: '/api/products', name: 'Products API' },
  { path: '/api/purchases', name: 'Purchases API' },
  { path: '/api/sales', name: 'Sales API' },
  { path: '/api/cost-categories', name: 'Cost Categories API' },
  { path: '/api/cost-analysis', name: 'Cost Analysis API' }
];

async function testPage(browser, baseUrl, page) {
  const browserPage = await browser.newPage();
  const url = `${baseUrl}${page.path}`;
  
  try {
    console.log(`\n🔍 Testing: ${page.name} (${url})`);
    
    // Navigate to page
    const response = await browserPage.goto(url, { 
      waitUntil: 'networkidle0',
      timeout: 10000 
    });
    
    // Check response status
    const status = response.status();
    console.log(`   Status: ${status}`);
    
    // Get page title
    const title = await browserPage.title();
    console.log(`   Title: ${title}`);
    
    // Check for errors in console
    const logs = [];
    browserPage.on('console', msg => {
      if (msg.type() === 'error') {
        logs.push(msg.text());
      }
    });
    
    // Wait a bit for any console errors
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (logs.length > 0) {
      console.log(`   ❌ Console Errors: ${logs.length}`);
      logs.forEach(log => console.log(`      - ${log}`));
    } else {
      console.log(`   ✅ No console errors`);
    }
    
    // Check if page loaded successfully
    if (status >= 200 && status < 400) {
      console.log(`   ✅ Page loaded successfully`);
    } else if (status === 404) {
      console.log(`   ⚠️  Page not found (404)`);
    } else if (status >= 500) {
      console.log(`   ❌ Server error (${status})`);
    } else {
      console.log(`   ⚠️  Unexpected status: ${status}`);
    }
    
    return {
      name: page.name,
      url,
      status,
      title,
      errors: logs,
      success: status >= 200 && status < 400
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      name: page.name,
      url,
      status: 'ERROR',
      title: '',
      errors: [error.message],
      success: false
    };
  } finally {
    await browserPage.close();
  }
}

async function testAPI(baseUrl, api) {
  const url = `${baseUrl}${api.path}`;
  
  try {
    console.log(`\n🔍 Testing API: ${api.name} (${url})`);
    
    const response = await fetch(url);
    const status = response.status;
    
    console.log(`   Status: ${status}`);
    
    let data = null;
    try {
      data = await response.json();
      console.log(`   ✅ Valid JSON response`);
    } catch (e) {
      console.log(`   ⚠️  Non-JSON response`);
    }
    
    if (status >= 200 && status < 400) {
      console.log(`   ✅ API working`);
    } else if (status === 401) {
      console.log(`   ⚠️  Unauthorized (expected for protected APIs)`);
    } else if (status === 404) {
      console.log(`   ⚠️  API not found`);
    } else if (status >= 500) {
      console.log(`   ❌ Server error`);
    }
    
    return {
      name: api.name,
      url,
      status,
      data,
      success: status >= 200 && status < 400
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return {
      name: api.name,
      url,
      status: 'ERROR',
      data: null,
      success: false
    };
  }
}

async function runTests() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('🚀 Starting comprehensive page and API testing...');
  console.log(`📍 Base URL: ${baseUrl}`);
  
  // Test if server is running
  try {
    const response = await fetch(baseUrl);
    console.log(`✅ Server is running (Status: ${response.status})`);
  } catch (error) {
    console.log(`❌ Server is not running: ${error.message}`);
    return;
  }
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const pageResults = [];
  const apiResults = [];
  
  try {
    // Test all pages
    console.log('\n📄 Testing Pages...');
    for (const page of pagesToTest) {
      const result = await testPage(browser, baseUrl, page);
      pageResults.push(result);
    }
    
    // Test all APIs
    console.log('\n🔌 Testing APIs...');
    for (const api of apisToTest) {
      const result = await testAPI(baseUrl, api);
      apiResults.push(result);
    }
    
  } finally {
    await browser.close();
  }
  
  // Summary
  console.log('\n📊 TEST SUMMARY');
  console.log('================');
  
  const successfulPages = pageResults.filter(r => r.success).length;
  const totalPages = pageResults.length;
  console.log(`\n📄 Pages: ${successfulPages}/${totalPages} successful`);
  
  const failedPages = pageResults.filter(r => !r.success);
  if (failedPages.length > 0) {
    console.log('\n❌ Failed Pages:');
    failedPages.forEach(page => {
      console.log(`   - ${page.name}: ${page.status}`);
    });
  }
  
  const successfulAPIs = apiResults.filter(r => r.success).length;
  const totalAPIs = apiResults.length;
  console.log(`\n🔌 APIs: ${successfulAPIs}/${totalAPIs} successful`);
  
  const failedAPIs = apiResults.filter(r => !r.success);
  if (failedAPIs.length > 0) {
    console.log('\n❌ Failed APIs:');
    failedAPIs.forEach(api => {
      console.log(`   - ${api.name}: ${api.status}`);
    });
  }
  
  console.log('\n✅ Testing completed!');
}

// Run the tests
runTests().catch(console.error);