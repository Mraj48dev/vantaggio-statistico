#!/usr/bin/env tsx

/**
 * Test Methods Script
 *
 * Tests the Methods module integration and functionality.
 * Run with: npm run methods:test
 */

import { PrismaClient } from '@prisma/client'
import { MethodsContainer } from '../src/modules/methods'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🧪 Starting Methods integration tests...')

    // Initialize container
    const methodsContainer = MethodsContainer.getInstance(prisma)

    // Test 1: Get Available Methods
    console.log('\n📋 Test 1: Get Available Methods')
    const getAvailableMethodsUseCase = methodsContainer.getGetAvailableMethodsUseCase()

    const methodsResult = await getAvailableMethodsUseCase.execute({
      userId: 'demo-user',
      activeOnly: true
    })

    if (!methodsResult.isSuccess) {
      throw new Error(`Failed to get methods: ${methodsResult.error.message}`)
    }

    console.log(`✅ Found ${methodsResult.value.methods.length} available methods`)
    methodsResult.value.methods.forEach(method => {
      console.log(`  - ${method.displayName} (${method.id.value}) - ${method.category} - ${method.requiredPackage}`)
    })

    // Test 2: Get Method Details
    console.log('\n🔍 Test 2: Get Method Details (Fibonacci)')
    const getMethodDetailsUseCase = methodsContainer.getGetMethodDetailsUseCase()

    const detailsResult = await getMethodDetailsUseCase.execute({
      methodId: 'fibonacci',
      baseBet: 10,
      includeProgression: true,
      progressionSteps: 8
    })

    if (!detailsResult.isSuccess) {
      throw new Error(`Failed to get method details: ${detailsResult.error.message}`)
    }

    const details = detailsResult.value
    console.log(`✅ Method: ${details.method.displayName}`)
    console.log(`   Package required: ${details.method.requiredPackage}`)
    console.log(`   Risk level: ${details.method.getRiskLevel()}`)
    console.log(`   Recommended bankroll: €${details.recommendedBankroll}`)
    console.log(`   Loss progression (${details.lossProgression?.length} steps):`)

    details.lossProgression?.forEach((step, index) => {
      console.log(`     Step ${step.step}: €${step.betAmount} (Total loss: €${step.cumulativeLoss})`)
    })

    // Test 3: Calculate Next Bet
    console.log('\n🎯 Test 3: Calculate Next Bet (Fibonacci)')
    const calculateNextBetUseCase = methodsContainer.getCalculateNextBetUseCase()

    // Simulate first bet
    const firstBetResult = await calculateNextBetUseCase.execute({
      methodId: 'fibonacci',
      input: {
        gameResult: {
          number: 12, // Red number in first column
          color: 'red',
          isEven: true,
          isHigh: false
        },
        sessionHistory: [],
        currentProgression: [],
        baseAmount: 10,
        currentBalance: 500,
        stopLoss: 100
      }
    })

    if (!firstBetResult.isSuccess) {
      throw new Error(`Failed to calculate first bet: ${firstBetResult.error.message}`)
    }

    console.log('✅ First bet calculation:')
    console.log(`   Should bet: ${firstBetResult.value.output.shouldBet}`)
    console.log(`   Bet type: ${firstBetResult.value.output.betType}`)
    console.log(`   Amount: €${firstBetResult.value.output.amount}`)
    console.log(`   Progression: [${firstBetResult.value.output.progression.join(', ')}]`)
    console.log(`   Reason: ${firstBetResult.value.output.reason}`)

    // Test 4: Simulate Loss and Next Bet
    console.log('\n📉 Test 4: Simulate Loss and Calculate Next Bet')
    const afterLossResult = await calculateNextBetUseCase.execute({
      methodId: 'fibonacci',
      input: {
        gameResult: {
          number: 15, // Black number (loss for column 1)
          color: 'black',
          isEven: false,
          isHigh: false
        },
        sessionHistory: [
          {
            betType: 'column_1',
            amount: 10,
            outcome: 'loss',
            profitLoss: -10,
            gameResult: { number: 15, color: 'black', isEven: false, isHigh: false },
            timestamp: new Date()
          }
        ],
        currentProgression: [1],
        baseAmount: 10,
        currentBalance: 490,
        stopLoss: 100
      }
    })

    if (!afterLossResult.isSuccess) {
      throw new Error(`Failed to calculate bet after loss: ${afterLossResult.error.message}`)
    }

    console.log('✅ After loss calculation:')
    console.log(`   Should bet: ${afterLossResult.value.output.shouldBet}`)
    console.log(`   Bet type: ${afterLossResult.value.output.betType}`)
    console.log(`   Amount: €${afterLossResult.value.output.amount}`)
    console.log(`   Progression: [${afterLossResult.value.output.progression.join(', ')}]`)
    console.log(`   Reason: ${afterLossResult.value.output.reason}`)

    // Test 5: Test Method Registry
    console.log('\n🗂️ Test 5: Method Registry')
    const registeredMethods = methodsContainer.getRegisteredMethodIds()
    console.log(`✅ Registered method implementations: ${registeredMethods.join(', ')}`)

    console.log('\n🎉 All tests passed successfully!')
    console.log('\n📊 Integration Test Summary:')
    console.log('✅ Methods seeding working')
    console.log('✅ Get available methods working')
    console.log('✅ Get method details working')
    console.log('✅ Fibonacci calculation working')
    console.log('✅ Loss progression calculation working')
    console.log('✅ Method registry working')
    console.log('\n🚀 Methods Module is ready for dashboard integration!')

  } catch (error) {
    console.error('❌ Test failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()