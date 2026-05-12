/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useMemo } from 'react';
import { GameStatus, GuessResult, GuessHistory, GameState } from '../types';

const MIN_NUMBER = 1;
const MAX_NUMBER = 100;

/**
 * 產生 1 到 100 之間的隨機整數
 */
const generateRandomNumber = () => Math.floor(Math.random() * (MAX_NUMBER - MIN_NUMBER + 1)) + MIN_NUMBER;

export function useGuessGame() {
  const [state, setState] = useState<GameState>(() => ({
    targetNumber: generateRandomNumber(),
    guesses: [],
    status: GameStatus.PLAYING,
    message: '',
  }));

  const resetGame = useCallback(() => {
    setState({
      targetNumber: generateRandomNumber(),
      guesses: [],
      status: GameStatus.PLAYING,
      message: '',
    });
  }, []);

  const submitGuess = useCallback((guess: number) => {
    if (state.status === GameStatus.WON) return;

    // 驗證輸入範圍
    if (isNaN(guess) || guess < MIN_NUMBER || guess > MAX_NUMBER) {
      setState(prev => ({ ...prev, message: `請輸入 ${MIN_NUMBER} 到 ${MAX_NUMBER} 之間的數字` }));
      return;
    }

    // 額外提醒：如果猜測超出了目前的縮小範圍
    const currentMin = MIN_NUMBER + state.guesses.reduce((acc, g) => g.result === GuessResult.TOO_LOW ? Math.max(acc, g.value - MIN_NUMBER + 1) : acc, 0);
    const currentMax = MAX_NUMBER - state.guesses.reduce((acc, g) => g.result === GuessResult.TOO_HIGH ? Math.max(acc, MAX_NUMBER - g.value + 1) : acc, 0);
    
    // 這裡我們直接計算範圍來判斷
    let rangeMin = MIN_NUMBER;
    let rangeMax = MAX_NUMBER;
    state.guesses.forEach(g => {
      if (g.result === GuessResult.TOO_LOW) rangeMin = Math.max(rangeMin, g.value + 1);
      if (g.result === GuessResult.TOO_HIGH) rangeMax = Math.min(rangeMax, g.value - 1);
    });

    if (guess < rangeMin || guess > rangeMax) {
      setState(prev => ({ ...prev, message: `注意！範圍已經縮小到 ${rangeMin}-${rangeMax}` }));
      // 我們仍然允許提交，或者攔截？通常遊戲中會允許提交但給予警告。
      // 這裡我們選擇讓使用者知道，但不更新狀態（或是更新訊息後返回）
      // 根據需求「提醒使用者範圍」，我們可以在這裡 return 或者繼續。
      // 為了更好的體驗，我們先提示使用者，並不把這次浪費的次數算進去。
      return;
    }

    let result: GuessResult;
    let newMessage = '';
    let newStatus = GameStatus.PLAYING;

    if (guess === state.targetNumber) {
      result = GuessResult.CORRECT;
      newMessage = '恭喜答對了！';
      newStatus = GameStatus.WON;
    } else if (guess > state.targetNumber) {
      result = GuessResult.TOO_HIGH;
      newMessage = '太大了！';
    } else {
      result = GuessResult.TOO_LOW;
      newMessage = '太小了！';
    }

    const newHistory: GuessHistory = {
      value: guess,
      result,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      guesses: [newHistory, ...prev.guesses],
      message: newMessage,
      status: newStatus,
    }));
  }, [state.targetNumber, state.status]);

  const guessCount = useMemo(() => state.guesses.length, [state.guesses]);

  const currentRange = useMemo(() => {
    let min = MIN_NUMBER;
    let max = MAX_NUMBER;
    state.guesses.forEach(g => {
      if (g.result === GuessResult.TOO_LOW) {
        min = Math.max(min, g.value + 1);
      } else if (g.result === GuessResult.TOO_HIGH) {
        max = Math.min(max, g.value - 1);
      }
    });
    return { min, max };
  }, [state.guesses]);

  return {
    ...state,
    guessCount,
    currentRange,
    submitGuess,
    resetGame,
    minNumber: MIN_NUMBER,
    maxNumber: MAX_NUMBER,
  };
}
