const http = require('http');
const dotenv = require('dotenv');
dotenv.config();

// Require app and db
const app = require('./server');
const { disconnectDB } = require('./config/db');

// Helper for HTTP requests
const request = (server, { method, path, headers = {}, body = null }) => {
  return new Promise((resolve, reject) => {
    const port = process.env.PORT || 5000;
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', (chunk) => {
        rawData += chunk;
      });
      res.on('end', () => {
        let json;
        try {
          json = JSON.parse(rawData);
        } catch {
          json = rawData;
        }
        resolve({
          status: res.statusCode,
          headers: res.headers,
          data: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      req.write(postData);
    }
    req.end();
  });
};

const runTests = async () => {
  console.log('====================================================');
  console.log('🚀 RUNNING FITTRACK FULL-STACK E2E TEST SUITE');
  console.log('====================================================\n');

  // Wait for server and database connection
  const mongoose = require('mongoose');
  let retries = 0;
  while (mongoose.connection.readyState !== 1 && retries < 120) {
    await new Promise((r) => setTimeout(r, 1000));
    retries++;
    if (retries % 5 === 0) {
      console.log(`[Database Wait] Mongoose readyState: ${mongoose.connection.readyState} (${retries}s)...`);
    }
  }
  console.log(`[Database Ready] Mongoose readyState: ${mongoose.connection.readyState}\n`);

  let passed = 0;
  let failed = 0;

  const assert = (condition, description) => {
    if (condition) {
      console.log(`  ✅ PASS: ${description}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${description}`);
      failed++;
    }
  };

  try {
    // 1. Health Check
    console.log('[1] Testing API Health Check...');
    const healthRes = await request(app, { method: 'GET', path: '/api/health' });
    assert(healthRes.status === 200 && healthRes.data.success === true, 'Health check returns 200 and success: true');

    // 2. User Registration
    console.log('\n[2] Testing User Registration...');
    const testEmail1 = `athlete1_${Date.now()}@test.com`;
    const regRes = await request(app, {
      method: 'POST',
      path: '/api/auth/register',
      body: { name: 'Alice Walker', email: testEmail1, password: 'password123' }
    });
    assert(regRes.status === 201 && regRes.data.success === true, 'User 1 registered with 201 Created');
    assert(!!regRes.data.data.token, 'Registration returns JWT token');
    const token1 = regRes.data.data.token;
    const userId1 = regRes.data.data.user._id;

    // Test duplicate registration error
    const dupRes = await request(app, {
      method: 'POST',
      path: '/api/auth/register',
      body: { name: 'Duplicate Alice', email: testEmail1, password: 'password123' }
    });
    assert(dupRes.status === 400 && dupRes.data.success === false, 'Duplicate email registration returns 400 Bad Request');

    // 3. User Login
    console.log('\n[3] Testing User Login...');
    const loginRes = await request(app, {
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testEmail1, password: 'password123' }
    });
    assert(loginRes.status === 200 && loginRes.data.success === true, 'Valid login returns 200 OK');
    assert(!!loginRes.data.data.token, 'Login returns JWT token');

    // Invalid login
    const badLoginRes = await request(app, {
      method: 'POST',
      path: '/api/auth/login',
      body: { email: testEmail1, password: 'wrongpassword' }
    });
    assert(badLoginRes.status === 401, 'Invalid password returns 401 Unauthorized');

    // 4. Protected Routes & Auth Header
    console.log('\n[4] Testing Protected Route & Get Current User...');
    const meRes = await request(app, {
      method: 'GET',
      path: '/api/auth/me',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(meRes.status === 200 && meRes.data.data.email === testEmail1, 'GET /api/auth/me returns current user');

    const noAuthRes = await request(app, { method: 'GET', path: '/api/auth/me' });
    assert(noAuthRes.status === 401, 'Request without token returns 401 Unauthorized');

    // 5. Register User 2 (for data isolation check)
    const testEmail2 = `athlete2_${Date.now()}@test.com`;
    const reg2Res = await request(app, {
      method: 'POST',
      path: '/api/auth/register',
      body: { name: 'Bob Runner', email: testEmail2, password: 'password123' }
    });
    const token2 = reg2Res.data.data.token;

    // 6. Workout CRUD
    console.log('\n[6] Testing Workout Management CRUD & Filters...');
    // Create Workout for User 1
    const createWorkoutRes = await request(app, {
      method: 'POST',
      path: '/api/workouts',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        name: 'Morning HIIT Sprint',
        type: 'HIIT',
        date: new Date().toISOString(),
        duration: 40,
        caloriesBurned: 350,
        difficulty: 'Hard',
        notes: 'Max heart rate reached'
      }
    });
    assert(createWorkoutRes.status === 201 && createWorkoutRes.data.success === true, 'POST /api/workouts creates workout');
    const workoutId = createWorkoutRes.data.data._id;

    // Read Workouts
    const getWorkoutsRes = await request(app, {
      method: 'GET',
      path: '/api/workouts',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(getWorkoutsRes.status === 200 && getWorkoutsRes.data.data.length === 1, 'GET /api/workouts returns user 1 workouts');

    // Update Workout
    const updateWorkoutRes = await request(app, {
      method: 'PUT',
      path: `/api/workouts/${workoutId}`,
      headers: { Authorization: `Bearer ${token1}` },
      body: { duration: 45, caloriesBurned: 380 }
    });
    assert(updateWorkoutRes.status === 200 && updateWorkoutRes.data.data.duration === 45, 'PUT /api/workouts/:id updates workout');

    // User Isolation Check: User 2 tries to access User 1's workout
    const crossAccessRes = await request(app, {
      method: 'GET',
      path: `/api/workouts/${workoutId}`,
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(crossAccessRes.status === 404, 'User 2 CANNOT access User 1 workout (data isolation verified)');

    // 7. Activity CRUD
    console.log('\n[7] Testing Daily Activity Tracking...');
    const actRes = await request(app, {
      method: 'POST',
      path: '/api/activity',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        date: new Date().toISOString(),
        steps: 10500,
        distance: 8.2,
        activeMinutes: 60,
        caloriesBurned: 450
      }
    });
    assert(actRes.status === 201 && actRes.data.data.steps === 10500, 'POST /api/activity logs steps and calories');

    // 8. Hydration Tracking
    console.log('\n[8] Testing Hydration Tracking...');
    const waterRes1 = await request(app, {
      method: 'POST',
      path: '/api/water',
      headers: { Authorization: `Bearer ${token1}` },
      body: { amount: 500 }
    });
    const waterRes2 = await request(app, {
      method: 'POST',
      path: '/api/water',
      headers: { Authorization: `Bearer ${token1}` },
      body: { amount: 250 }
    });
    assert(waterRes1.status === 201 && waterRes2.status === 201, 'Logged +500ml and +250ml water entries');

    const getWaterRes = await request(app, {
      method: 'GET',
      path: '/api/water',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(getWaterRes.status === 200 && getWaterRes.data.data.todayTotal === 750, 'Dynamic todayTotal calculates sum (750ml)');

    // 9. Sleep Tracking
    console.log('\n[9] Testing Sleep Tracking...');
    const bed = new Date();
    bed.setDate(bed.getDate() - 1);
    bed.setHours(23, 0, 0, 0);
    const wake = new Date();
    wake.setHours(7, 30, 0, 0);

    const sleepRes = await request(app, {
      method: 'POST',
      path: '/api/sleep',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        date: new Date().toISOString(),
        bedtime: bed.toISOString(),
        wakeTime: wake.toISOString(),
        quality: 'Excellent',
        notes: 'Deep restful sleep'
      }
    });
    assert(sleepRes.status === 201 && sleepRes.data.data.duration === 8.5, 'Sleep duration auto-calculated from bedtime and wake time (8.5 hrs)');

    // 10. Goals Management
    console.log('\n[10] Testing Goals Management & Auto-Completion...');
    const createGoalRes = await request(app, {
      method: 'POST',
      path: '/api/goals',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        title: 'Weekly 5 Workouts',
        category: 'Workouts',
        target: 5,
        current: 4,
        unit: 'workouts'
      }
    });
    assert(createGoalRes.status === 201 && createGoalRes.data.data.percentage === 80, 'Goal created with automatic percentage calculation (80%)');
    const goalId = createGoalRes.data.data._id;

    // Update goal progress to reach target
    const updateGoalRes = await request(app, {
      method: 'PUT',
      path: `/api/goals/${goalId}`,
      headers: { Authorization: `Bearer ${token1}` },
      body: { current: 5 }
    });
    assert(updateGoalRes.status === 200 && updateGoalRes.data.data.status === 'Completed', 'Goal automatically marked "Completed" when target reached');

    // 11. Dashboard Aggregations & Streak Calculations
    console.log('\n[11] Testing Dynamic Dashboard Aggregations...');
    const dashRes = await request(app, {
      method: 'GET',
      path: '/api/dashboard',
      headers: { Authorization: `Bearer ${token1}` }
    });
    assert(dashRes.status === 200, 'GET /api/dashboard returns 200 OK');
    assert(dashRes.data.data.today.steps === 10500, 'Dashboard reflects today steps from MongoDB');
    assert(dashRes.data.data.today.waterIntake === 750, 'Dashboard reflects today water intake from MongoDB');
    assert(dashRes.data.data.streaks.currentStreak >= 1, 'Current streak calculated dynamically (>= 1)');

    // 12. Settings & Preferences
    console.log('\n[12] Testing Settings and Preferences Update...');
    const setRes = await request(app, {
      method: 'PUT',
      path: '/api/users/settings',
      headers: { Authorization: `Bearer ${token1}` },
      body: {
        dailyStepGoal: 12000,
        waterGoal: 3000,
        sleepGoal: 8.5,
        theme: 'dark'
      }
    });
    assert(setRes.status === 200 && setRes.data.data.dailyStepGoal === 12000, 'PUT /api/users/settings persists custom goals to MongoDB');

    // 13. Demo Data Seeding
    console.log('\n[13] Testing Demo Data Generation Endpoint...');
    const demoRes = await request(app, {
      method: 'POST',
      path: '/api/users/demo-data',
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(demoRes.status === 200 && demoRes.data.success === true, 'POST /api/users/demo-data seeds multi-week records');

    const dash2Res = await request(app, {
      method: 'GET',
      path: '/api/dashboard',
      headers: { Authorization: `Bearer ${token2}` }
    });
    assert(dash2Res.data.data.streaks.currentStreak > 0, 'Demo data generates active workout streak');
    assert(dash2Res.data.data.recentWorkouts.length > 0, 'Demo data generates recent workouts');

    // Summary
    console.log('\n====================================================');
    console.log(`🎉 TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
    console.log('====================================================\n');

    process.exit(failed === 0 ? 0 : 1);
  } catch (err) {
    console.error('Test Suite Fatal Error:', err);
    process.exit(1);
  }
};

runTests();
