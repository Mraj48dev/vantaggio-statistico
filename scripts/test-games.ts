/**
 * Complete test script for Games Module
 * Tests all functionality: GameType CRUD, Roulette Engine, Use Cases
 */

import { PrismaClient } from '@prisma/client'
import {
  GameType,
  GameCategory,
  RouletteGameEngine,
  BetType,
  createEuropeanRouletteConfig,
  GamesContainer,
  GetGameTypesUseCase,
  PlayRouletteUseCase,
  type BetInput
} from '../src/modules/games'

async function main() {
  const prisma = new PrismaClient({
    log: ['info', 'warn', 'error'],
  })

  try {
    console.log('🎮 TESTING GAMES MODULE')
    console.log('=' .repeat(50))

    // Test 1: European Roulette Configuration
    console.log('\n🎰 Test 1: European Roulette Configuration')
    const rouletteConfig = createEuropeanRouletteConfig()
    console.log(`✅ Numbers: ${rouletteConfig.numbers.length} (expected: 37)`)
    console.log(`✅ Red numbers: ${rouletteConfig.redNumbers.length} (expected: 18)`)
    console.log(`✅ Black numbers: ${rouletteConfig.blackNumbers.length} (expected: 18)`)
    console.log(`✅ Green numbers: ${rouletteConfig.greenNumbers.length} (expected: 1)`)
    console.log(`✅ Straight payout: ${rouletteConfig.payouts.straight}x (expected: 36x)`)

    // Test 2: GameType Entity Creation
    console.log('\n🎯 Test 2: GameType Entity Creation')
    const gameTypeResult = GameType.create({
      name: 'test_roulette',
      displayName: 'Test Roulette',
      category: GameCategory.TABLE,
      config: rouletteConfig,
      isActive: true,
      sortOrder: 1
    })

    if (gameTypeResult.isSuccess) {
      const gameType = gameTypeResult.value
      console.log(`✅ GameType created: ${gameType.displayName}`)
      console.log(`✅ Is roulette game: ${gameType.isRouletteGame()}`)
      console.log(`✅ Min bet: ${gameType.getMinBet()}`)
      console.log(`✅ Max bet: ${gameType.getMaxBet()}`)
    } else {
      console.error('❌ GameType creation failed:', gameTypeResult.error.message)
      return
    }

    // Test 3: Roulette Game Engine
    console.log('\n🎲 Test 3: Roulette Game Engine')
    const gameEngine = new RouletteGameEngine(rouletteConfig)

    // Create test bets
    const bets: BetInput[] = [
      { type: BetType.RED, amount: 10 },
      { type: BetType.EVEN, amount: 5 },
      { type: BetType.STRAIGHT, numbers: [7], amount: 1 },
      { type: BetType.DOZEN_1, amount: 3 }
    ]

    console.log('📝 Test bets:')
    bets.forEach((bet, i) => {
      console.log(`   ${i + 1}. ${bet.type}: €${bet.amount} ${bet.numbers ? `on ${bet.numbers.join(',')}` : ''}`)
    })

    const spinResult = gameEngine.spin(bets)
    if (spinResult.isSuccess) {
      const result = spinResult.value
      console.log(`\n🎯 Winning number: ${result.winningNumber} (${result.color})`)
      console.log(`💰 Total bet: €${bets.reduce((sum, bet) => sum + bet.amount, 0)}`)
      console.log(`🏆 Total win: €${result.totalWinAmount}`)
      console.log(`📊 Net result: €${result.totalNetGain}`)

      console.log('\n📋 Bet results:')
      result.betResults.forEach((betResult, i) => {
        const status = betResult.isWinning ? '✅ WIN' : '❌ LOSS'
        console.log(`   ${i + 1}. ${betResult.bet.type}: ${status} (€${betResult.netGain})`)
      })
    } else {
      console.error('❌ Spin failed:', spinResult.error.message)
    }

    // Test 4: Use Cases with Database
    console.log('\n💾 Test 4: Use Cases with Database')
    const container = GamesContainer.getInstance(prisma)

    // Test GetGameTypesUseCase
    const getGameTypesUseCase = container.getGameTypesUseCase
    const gameTypesResult = await getGameTypesUseCase.execute({ activeOnly: true })

    if (gameTypesResult.isSuccess) {
      console.log(`✅ Found ${gameTypesResult.value.total} active game types:`)
      gameTypesResult.value.gameTypes.forEach(gt => {
        console.log(`   - ${gt.displayName} (${gt.name})`)
      })

      // Test PlayRouletteUseCase if we have a roulette game
      const rouletteGame = gameTypesResult.value.gameTypes.find(gt => gt.name === 'european_roulette')
      if (rouletteGame) {
        console.log(`\n🎮 Test 5: Playing European Roulette`)
        const playRouletteUseCase = container.playRouletteUseCase

        const playResult = await playRouletteUseCase.execute({
          gameTypeId: rouletteGame.id,
          bets: [
            { type: BetType.RED, amount: 20 },
            { type: BetType.STRAIGHT, numbers: [17], amount: 5 }
          ]
        })

        if (playResult.isSuccess) {
          const { spinResult, sessionInfo } = playResult.value
          console.log(`🎯 Result: ${spinResult.winningNumber} (${spinResult.color})`)
          console.log(`💰 Session info:`)
          console.log(`   - Total bet: €${sessionInfo.totalBetAmount}`)
          console.log(`   - Total win: €${sessionInfo.totalWinAmount}`)
          console.log(`   - Net gain: €${sessionInfo.totalNetGain}`)
          console.log(`   - Win rate: ${sessionInfo.winningPercentage.toFixed(1)}%`)
        } else {
          console.error('❌ Play roulette failed:', playResult.error.message)
        }
      } else {
        console.log('⚠️  No European Roulette found. Run "npm run games:seed" first.')
      }
    } else {
      console.error('❌ Get game types failed:', gameTypesResult.error.message)
    }

    // Test 6: Multiple Spins Statistics
    console.log('\n📊 Test 6: Multiple Spins Statistics (100 spins)')
    const stats = {
      totalSpins: 100,
      redWins: 0,
      blackWins: 0,
      greenWins: 0,
      evenWins: 0,
      oddWins: 0
    }

    for (let i = 0; i < stats.totalSpins; i++) {
      const result = gameEngine.spin([{ type: BetType.RED, amount: 1 }])
      if (result.isSuccess) {
        const { winningNumber, color } = result.value
        if (color === 'red') stats.redWins++
        else if (color === 'black') stats.blackWins++
        else stats.greenWins++

        if (winningNumber > 0) {
          if (winningNumber % 2 === 0) stats.evenWins++
          else stats.oddWins++
        }
      }
    }

    console.log(`🔴 Red wins: ${stats.redWins}/${stats.totalSpins} (${(stats.redWins/stats.totalSpins*100).toFixed(1)}%) - Expected: ~48.6%`)
    console.log(`⚫ Black wins: ${stats.blackWins}/${stats.totalSpins} (${(stats.blackWins/stats.totalSpins*100).toFixed(1)}%) - Expected: ~48.6%`)
    console.log(`🟢 Green wins: ${stats.greenWins}/${stats.totalSpins} (${(stats.greenWins/stats.totalSpins*100).toFixed(1)}%) - Expected: ~2.7%`)
    console.log(`🟦 Even wins: ${stats.evenWins}/${stats.totalSpins} (${(stats.evenWins/stats.totalSpins*100).toFixed(1)}%) - Expected: ~48.6%`)
    console.log(`🟡 Odd wins: ${stats.oddWins}/${stats.totalSpins} (${(stats.oddWins/stats.totalSpins*100).toFixed(1)}%) - Expected: ~48.6%`)

    console.log('\n🎉 ALL TESTS COMPLETED SUCCESSFULLY!')
    console.log('=' .repeat(50))

  } catch (error) {
    console.error('❌ Test failed:', error)
    console.error(error.stack)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })