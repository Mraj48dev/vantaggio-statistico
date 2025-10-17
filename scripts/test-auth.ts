#!/usr/bin/env tsx
/**
 * Auth Module Integration Test
 *
 * This script tests the complete authentication flow without requiring
 * a running web server. It verifies:
 * - Database connectivity
 * - Auth Module dependency injection
 * - User creation and retrieval
 * - Business logic validation
 */

import { authServices, authContainer } from '../src/modules/auth/infrastructure/di/AuthContainer'
import { User } from '../src/modules/auth/domain/entities/User'
import { randomUUID } from 'crypto'

async function testAuthModule() {
  console.log('🔐 Testing Auth Module Integration...\n')

  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Auth Module health...')
    const healthCheck = await authContainer().healthCheck()
    console.log(`   Status: ${healthCheck.status}`)
    Object.entries(healthCheck.components).forEach(([component, status]) => {
      console.log(`   ${component}: ${status ? '✅' : '❌'}`)
    })

    if (healthCheck.status === 'unhealthy') {
      throw new Error('Auth Module health check failed')
    }
    console.log('✅ Health check passed!\n')

    // Test 2: User Repository Operations
    console.log('2️⃣ Testing User Repository...')
    const userRepository = authServices.getUserRepository()

    // Create a test user
    const testUserId = randomUUID()
    const testUserData = {
      id: { value: testUserId },
      clerkId: 'clerk_test_123',
      email: 'test@vantaggiostatistico.com',
      packageId: 'free',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    const testUser = User.fromPersistence(testUserData)

    // Clean up any existing test user
    const existingUser = await userRepository.findByClerkId('clerk_test_123')
    if (existingUser.isSuccess && existingUser.value) {
      await userRepository.delete(existingUser.value.id)
      console.log('   🧹 Cleaned up existing test user')
    }

    // Save new test user
    const saveResult = await userRepository.save(testUser)
    if (!saveResult.isSuccess) {
      throw new Error(`Failed to save test user: ${saveResult.error.message}`)
    }
    console.log('   ✅ User saved successfully')

    // Find by Clerk ID
    const findResult = await userRepository.findByClerkId('clerk_test_123')
    if (!findResult.isSuccess || !findResult.value) {
      throw new Error('Failed to find test user by Clerk ID')
    }
    console.log('   ✅ User found by Clerk ID')

    // Find by email
    const emailResult = await userRepository.findByEmail('test@vantaggiostatistico.com')
    if (!emailResult.isSuccess || !emailResult.value) {
      throw new Error('Failed to find test user by email')
    }
    console.log('   ✅ User found by email')

    // Test user entity methods
    const user = findResult.value
    console.log(`   📋 User ID: ${user.id.value}`)
    console.log(`   📋 Email: ${user.email}`)
    console.log(`   📋 Package: ${user.packageId}`)

    // Test 3: Auth Service Operations
    console.log('\n3️⃣ Testing Auth Service...')
    const authService = authServices.getAuthService()

    // Test user sync
    const clerkUserData = {
      id: 'clerk_test_sync_456',
      emailAddresses: [{ emailAddress: 'sync@vantaggiostatistico.com', id: 'email_123' }],
      firstName: 'Test',
      lastName: 'User',
      username: 'testuser',
      imageUrl: 'https://example.com/avatar.jpg',
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    const syncResult = await authService.syncUserWithDatabase(clerkUserData)
    if (!syncResult.isSuccess) {
      throw new Error(`User sync failed: ${syncResult.error.message}`)
    }
    console.log('   ✅ User sync successful')
    console.log(`   📋 Synced user: ${syncResult.value.email}`)

    // Test getting user by ID
    const getUserResult = await authService.getUserById(syncResult.value.id)
    if (!getUserResult.isSuccess || !getUserResult.value) {
      throw new Error('Failed to get user by ID through auth service')
    }
    console.log('   ✅ Get user by ID successful')

    // Test 4: Business Logic Validation
    console.log('\n4️⃣ Testing Business Logic...')

    // Test email update
    const emailUpdateResult = user.updateEmail('updated@vantaggiostatistico.com')
    if (!emailUpdateResult.isSuccess) {
      throw new Error('Email update should succeed with valid email')
    }
    console.log('   ✅ Email update validation works')

    // Test invalid email
    const invalidEmailResult = user.updateEmail('invalid-email')
    if (invalidEmailResult.isSuccess) {
      throw new Error('Email update should fail with invalid email')
    }
    console.log('   ✅ Invalid email properly rejected')

    // Test package update
    const packageUpdateResult = user.updatePackage('premium')
    if (!packageUpdateResult.isSuccess) {
      throw new Error('Package update should succeed')
    }
    console.log('   ✅ Package update works')

    // Test 5: Use Cases
    console.log('\n5️⃣ Testing Use Cases...')
    const getCurrentUserUseCase = authServices.getCurrentUser()

    // Note: getCurrentUser requires Clerk context, so we can't test it here
    // But we can verify the use case is properly instantiated
    if (!getCurrentUserUseCase) {
      throw new Error('GetCurrentUserUseCase not properly instantiated')
    }
    console.log('   ✅ Use cases properly instantiated')

    // Test 6: Cleanup
    console.log('\n6️⃣ Cleaning up test data...')

    // Delete test users
    await userRepository.delete(testUser.id)
    await userRepository.delete(syncResult.value.id)
    console.log('   🧹 Test data cleaned up')

    console.log('\n🎉 Auth Module Integration Test PASSED!')
    console.log('\n📊 Test Summary:')
    console.log('   • Database connectivity: ✅')
    console.log('   • Dependency injection: ✅')
    console.log('   • User repository operations: ✅')
    console.log('   • Auth service operations: ✅')
    console.log('   • Business logic validation: ✅')
    console.log('   • Use case instantiation: ✅')
    console.log('\n🚀 Auth Module is ready for integration!')

  } catch (error) {
    console.error('\n❌ Auth Module Integration Test FAILED!')
    console.error('Error:', error)
    process.exit(1)
  } finally {
    // Cleanup connection
    await authContainer().cleanup()
  }
}

// Run the test
testAuthModule()
  .catch((error) => {
    console.error('💥 Unexpected error:', error)
    process.exit(1)
  })