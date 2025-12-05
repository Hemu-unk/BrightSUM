import React, { useState } from 'react'

const IntegersLesson: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Integers",
      subtitle: "Learning Objectives: Work with positive and negative whole numbers, add, subtract, multiply, and divide integers, and compare and order integers on a number line.",
      content: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-xl text-slate-700 font-semibold">Let's explore integers!</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">What You'll Learn:</p>
            <ul className="space-y-2 text-blue-900">
              <li>• Understanding positive and negative whole numbers</li>
              <li>• Adding and subtracting integers using rules and number lines</li>
              <li>• Multiplying and dividing integers with sign rules</li>
              <li>• Comparing and ordering integers</li>
              <li>• Using integers in real-world contexts</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
            <p className="font-semibold text-purple-900 text-lg mb-2">Why This Matters:</p>
            <p className="text-purple-900">Integers are used everywhere in daily life: temperatures above and below zero, floors above and below ground level, money earned and spent, and elevations above and below sea level.</p>
          </div>
        </div>
      )
    },
    {
      title: "What Are Integers?",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Integers are all whole numbers and their opposites, including zero.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">The Complete Set:</p>
            <p className="text-blue-900 text-center text-xl font-bold">… –5, –4, –3, –2, –1, 0, 1, 2, 3, 4, 5 …</p>
          </div>

          <div className="space-y-4 mt-6">
            <div className="border-l-4 border-green-500 bg-green-50 p-5 rounded">
              <p className="font-bold text-green-900 text-lg">Positive Integers</p>
              <p className="text-green-900 mt-2">Numbers greater than zero: 1, 2, 3, 4, 5, ...</p>
              <p className="text-green-700 text-sm mt-2">Examples: money earned, floors above ground, temperature above freezing</p>
            </div>

            <div className="border-l-4 border-red-500 bg-red-50 p-5 rounded">
              <p className="font-bold text-red-900 text-lg">Negative Integers</p>
              <p className="text-red-900 mt-2">Numbers less than zero: –1, –2, –3, –4, –5, ...</p>
              <p className="text-red-700 text-sm mt-2">Examples: money owed, basement levels, temperature below freezing</p>
            </div>

            <div className="border-l-4 border-slate-500 bg-slate-50 p-5 rounded">
              <p className="font-bold text-slate-900 text-lg">Zero</p>
              <p className="text-slate-900 mt-2">Neither positive nor negative</p>
              <p className="text-slate-700 text-sm mt-2">Examples: ground level, freezing point (0°C), breaking even</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Remember: Integers do NOT include fractions or decimals!</p>
          </div>
        </div>
      )
    },
    {
      title: "Understanding the Number Line",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">The number line is a visual tool that helps us understand the relationship between integers.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200">
            <p className="font-semibold text-slate-900 text-center mb-4 text-lg">The Integer Number Line</p>
            <div className="bg-white p-4 rounded border border-slate-300">
              <p className="text-center font-mono text-lg">← –10 –9 –8 –7 –6 –5 –4 –3 –2 –1 0 1 2 3 4 5 6 7 8 9 10 →</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
              <p className="font-bold text-blue-900 text-lg mb-2">Moving Right = Increasing</p>
              <p className="text-blue-900">As you move to the right, numbers get larger</p>
              <p className="text-blue-700 font-semibold mt-2">Example: –3 → 0 → 5 → 10 (increasing)</p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded">
              <p className="font-bold text-purple-900 text-lg mb-2">Moving Left = Decreasing</p>
              <p className="text-purple-900">As you move to the left, numbers get smaller</p>
              <p className="text-purple-700 font-semibold mt-2">Example: 8 → 3 → 0 → –5 (decreasing)</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded">
            <p className="font-semibold text-green-900 text-lg mb-2">Key Insight:</p>
            <p className="text-green-900 mb-2">–10 is to the left of –3 on the number line</p>
            <p className="text-green-900 font-bold text-xl">Therefore: –10 &lt; –3</p>
            <p className="text-green-700 text-sm mt-2">(Even though 10 is bigger than 3, negative 10 is SMALLER than negative 3!)</p>
          </div>
        </div>
      )
    },
    {
      title: "Opposites and Absolute Value",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Two important concepts that help us understand integers better.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-bold text-blue-900 text-xl mb-3">Opposites</p>
            <p className="text-blue-900 mb-3">Two numbers that are the same distance from zero but on opposite sides of the number line.</p>
            <div className="bg-white p-4 rounded mt-3">
              <p className="text-blue-900 font-semibold">Examples:</p>
              <p className="text-blue-900">• 5 and –5 are opposites</p>
              <p className="text-blue-900">• 12 and –12 are opposites</p>
              <p className="text-blue-900">• 0 is its own opposite</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <p className="font-bold text-green-900 text-xl mb-3">Absolute Value</p>
            <p className="text-green-900 mb-3">The distance a number is from zero on the number line. Distance is always positive!</p>
            
            <div className="space-y-3 mt-4">
              <div className="bg-white p-4 rounded">
                <p className="text-green-900 font-bold text-lg">|–7| = 7</p>
                <p className="text-green-700 text-sm">–7 is 7 units away from zero</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-green-900 font-bold text-lg">|5| = 5</p>
                <p className="text-green-700 text-sm">5 is 5 units away from zero</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="text-green-900 font-bold text-lg">|0| = 0</p>
                <p className="text-green-700 text-sm">0 is 0 units away from zero</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Key Rule: Absolute value is ALWAYS positive or zero!</p>
          </div>
        </div>
      )
    },
    {
      title: "Comparing Integers",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Use these rules to determine which integer is greater or less.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Three Key Rules:</p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border-l-4 border-green-500">
                <p className="font-bold text-slate-900">1. Any positive number &gt; any negative number</p>
                <p className="text-slate-700 text-sm mt-1">Example: 1 &gt; –100</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <p className="font-bold text-slate-900">2. Zero &gt; all negative numbers</p>
                <p className="text-slate-700 text-sm mt-1">Example: 0 &gt; –5</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-purple-500">
                <p className="font-bold text-slate-900">3. On a number line, the number farther right is greater</p>
                <p className="text-slate-700 text-sm mt-1">Example: –2 is right of –8, so –2 &gt; –8</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2">Example 1:</p>
              <p className="text-slate-700 text-lg">–2 &lt; 4</p>
              <p className="text-slate-600 text-sm">(negative is less than positive)</p>
            </div>

            <div className="bg-green-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2">Example 2:</p>
              <p className="text-slate-700 text-lg">0 &gt; –3</p>
              <p className="text-slate-600 text-sm">(zero is greater than any negative)</p>
            </div>

            <div className="bg-purple-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2">Example 3:</p>
              <p className="text-slate-700 text-lg">–10 &lt; –7</p>
              <p className="text-slate-600 text-sm">(–10 is farther left on the number line)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Ordering Integers",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">To order integers, visualize them on a number line and arrange from left to right.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-3 text-lg">Strategy:</p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Place all numbers on a mental number line</li>
              <li>Identify which numbers are farthest left (smallest) and farthest right (largest)</li>
              <li>Arrange them in the requested order</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 1: Order from Least to Greatest</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-bold">Given: 5, –1, –6, 3</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-700 text-sm">On number line: –6 is leftmost, then –1, then 3, then 5 is rightmost</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-bold text-xl">Answer: –6, –1, 3, 5</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mt-4">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 2: Order from Greatest to Least</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold">Given: –2, –8, 4, 0</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-700 text-sm">Start with rightmost (largest): 4, then 0, then –2, then –8</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-xl">Answer: 4, 0, –2, –8</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Adding Integers (Same Sign)",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When both integers have the same sign (both positive or both negative), addition follows a simple pattern.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Rule for Same Signs:</p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li><span className="font-bold">Add</span> the absolute values of the numbers</li>
              <li><span className="font-bold">Keep</span> the common sign</li>
            </ol>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 1: Both Positive</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-lg">3 + 5</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900">Add: 3 + 5 = 8</p>
                <p className="text-green-900">Both positive, so answer is positive</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-xl">= 8</p>
              </div>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded mt-4">
            <p className="font-semibold text-red-900 text-lg mb-3">Example 2: Both Negative</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-red-900 font-bold text-lg">–4 + (–6)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-red-900">Add absolute values: 4 + 6 = 10</p>
                <p className="text-red-900">Both negative, so answer is negative</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-red-900 font-bold text-xl">= –10</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Think of it: Adding two debts creates a bigger debt!</p>
          </div>
        </div>
      )
    },
    {
      title: "Adding Integers (Different Signs)",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When integers have different signs (one positive, one negative), we subtract and use the sign of the larger absolute value.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Rule for Different Signs:</p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li><span className="font-bold">Subtract</span> the smaller absolute value from the larger absolute value</li>
              <li><span className="font-bold">Keep the sign</span> of the number with the greater absolute value</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 1:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-bold text-lg">8 + (–3)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900">|8| = 8 and |–3| = 3</p>
                <p className="text-blue-900">Subtract: 8 – 3 = 5</p>
                <p className="text-blue-900">8 has the larger absolute value and is positive</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-bold text-xl">= 5</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded mt-4">
            <p className="font-semibold text-purple-900 text-lg mb-3">Example 2:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900 font-bold text-lg">–9 + 4</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900">|–9| = 9 and |4| = 4</p>
                <p className="text-purple-900">Subtract: 9 – 4 = 5</p>
                <p className="text-purple-900">–9 has the larger absolute value and is negative</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900 font-bold text-xl">= –5</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Integer Addition Model (Number Line)",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Visualize integer addition using movement on a number line.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Number Line Strategy:</p>
            <ul className="space-y-2 text-slate-700 list-disc list-inside">
              <li>Start at the first number</li>
              <li>If adding a positive number, move <span className="font-bold text-green-600">right</span></li>
              <li>If adding a negative number, move <span className="font-bold text-red-600">left</span></li>
              <li>Where you land is your answer</li>
            </ul>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 1: –2 + 5</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900">Start at –2 on the number line</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900">Adding +5 means move 5 spaces to the <span className="font-bold">right</span></p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-mono">–2 → –1 → 0 → 1 → 2 → 3</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-blue-900 font-bold text-xl">= 3</p>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded mt-4">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 2: 6 + (–8)</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-green-900">Start at 6 on the number line</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900">Adding –8 means move 8 spaces to the <span className="font-bold">left</span></p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-mono">6 → 5 → 4 → 3 → 2 → 1 → 0 → –1 → –2</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-xl">= –2</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Subtracting Integers",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">The key to subtracting integers: <span className="font-bold text-blue-600">change subtraction to addition of the opposite!</span></p>

          <div className="bg-blue-50 border-2 border-blue-500 p-6 rounded mb-4">
            <p className="font-bold text-blue-900 text-xl mb-3">⭐ Golden Rule ⭐</p>
            <p className="text-blue-900 text-lg font-semibold">a – b = a + (–b)</p>
            <p className="text-blue-700 text-sm mt-2">Subtracting a number is the same as adding its opposite</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 1:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-lg">7 – 3</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900">Change to addition: 7 + (–3)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-green-900 font-bold text-xl">= 4</p>
              </div>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded mt-4">
            <p className="font-semibold text-purple-900 text-lg mb-3">Example 2:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900 font-bold text-lg">4 – (–5)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900">Change to addition of the opposite: 4 + 5</p>
                <p className="text-purple-700 text-sm">(The opposite of –5 is +5)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-purple-900 font-bold text-xl">= 9</p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-6 rounded mt-4">
            <p className="font-semibold text-orange-900 text-lg mb-3">Example 3:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-orange-900 font-bold text-lg">–2 – 6</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-orange-900">Change to addition: –2 + (–6)</p>
                <p className="text-orange-700 text-sm">(Both negative, so add and keep negative sign)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-orange-900 font-bold text-xl">= –8</p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Multiplying Integers",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Multiplying integers follows simple sign rules based on whether the numbers are positive or negative.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Three Key Rules:</p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border-l-4 border-green-500">
                <p className="font-bold text-slate-900 text-lg">Positive × Positive = Positive</p>
                <p className="text-slate-700 text-sm mt-1">Same signs = positive result</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 text-lg">Negative × Negative = Positive</p>
                <p className="text-slate-700 text-sm mt-1">Same signs = positive result</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <p className="font-bold text-slate-900 text-lg">Positive × Negative = Negative</p>
                <p className="text-slate-700 text-sm mt-1">Different signs = negative result</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 1:</p>
              <p className="text-slate-700 font-bold text-xl">3 × 4 = 12</p>
              <p className="text-slate-600 text-sm mt-1">✔ Both positive → positive result</p>
            </div>

            <div className="bg-red-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 2:</p>
              <p className="text-slate-700 font-bold text-xl">–3 × 4 = –12</p>
              <p className="text-slate-600 text-sm mt-1">✔ Different signs → negative result</p>
            </div>

            <div className="bg-blue-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 3:</p>
              <p className="text-slate-700 font-bold text-xl">–6 × –2 = 12</p>
              <p className="text-slate-600 text-sm mt-1">✔ Both negative → positive result</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Quick Tip: Same signs = positive, Different signs = negative!</p>
          </div>
        </div>
      )
    },
    {
      title: "Dividing Integers",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Division uses the exact same sign rules as multiplication!</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Three Key Rules:</p>
            <div className="space-y-3">
              <div className="bg-white p-4 rounded border-l-4 border-green-500">
                <p className="font-bold text-slate-900 text-lg">Positive ÷ Positive = Positive</p>
                <p className="text-slate-700 text-sm mt-1">Same signs = positive result</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-blue-500">
                <p className="font-bold text-slate-900 text-lg">Negative ÷ Negative = Positive</p>
                <p className="text-slate-700 text-sm mt-1">Same signs = positive result</p>
              </div>
              <div className="bg-white p-4 rounded border-l-4 border-red-500">
                <p className="font-bold text-slate-900 text-lg">Positive ÷ Negative = Negative</p>
                <p className="text-slate-700 text-sm mt-1">Different signs = negative result</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-green-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 1:</p>
              <p className="text-slate-700 font-bold text-xl">8 ÷ 2 = 4</p>
              <p className="text-slate-600 text-sm mt-1">✔ Both positive → positive result</p>
            </div>

            <div className="bg-red-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 2:</p>
              <p className="text-slate-700 font-bold text-xl">–12 ÷ 3 = –4</p>
              <p className="text-slate-600 text-sm mt-1">✔ Different signs → negative result</p>
            </div>

            <div className="bg-blue-50 p-5 rounded">
              <p className="font-semibold text-slate-900 mb-2 text-lg">Example 3:</p>
              <p className="text-slate-700 font-bold text-xl">–15 ÷ –3 = 5</p>
              <p className="text-slate-600 text-sm mt-1">✔ Both negative → positive result</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Remember: Division follows the same sign rules as multiplication!</p>
          </div>
        </div>
      )
    },
    {
      title: "Integer Operations Practice",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Test your understanding with these practice problems!</p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
              <p className="font-semibold text-blue-900 text-lg mb-3">Problem 1:</p>
              <p className="text-blue-900 font-bold text-xl">–3 + 9 = ?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-blue-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-blue-900">Different signs: subtract 9 – 3 = 6</p>
                  <p className="text-blue-900">Keep sign of larger (9 is positive)</p>
                  <p className="text-blue-900 font-bold text-xl">Answer: 6</p>
                </div>
              </details>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded">
              <p className="font-semibold text-green-900 text-lg mb-3">Problem 2:</p>
              <p className="text-green-900 font-bold text-xl">6 + (–11) = ?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-green-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-green-900">Different signs: subtract 11 – 6 = 5</p>
                  <p className="text-green-900">Keep sign of larger (11 is negative)</p>
                  <p className="text-green-900 font-bold text-xl">Answer: –5</p>
                </div>
              </details>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded">
              <p className="font-semibold text-purple-900 text-lg mb-3">Problem 3:</p>
              <p className="text-purple-900 font-bold text-xl">–4 – (–7) = ?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-purple-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-purple-900">Change to addition: –4 + 7</p>
                  <p className="text-purple-900">Different signs: 7 – 4 = 3 (keep positive)</p>
                  <p className="text-purple-900 font-bold text-xl">Answer: 3</p>
                </div>
              </details>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded">
              <p className="font-semibold text-orange-900 text-lg mb-3">Problem 4:</p>
              <p className="text-orange-900 font-bold text-xl">–5 × –2 = ?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-orange-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-orange-900">Both negative: same signs = positive</p>
                  <p className="text-orange-900">5 × 2 = 10</p>
                  <p className="text-orange-900 font-bold text-xl">Answer: 10</p>
                </div>
              </details>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded">
              <p className="font-semibold text-red-900 text-lg mb-3">Problem 5:</p>
              <p className="text-red-900 font-bold text-xl">14 ÷ –7 = ?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-red-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-red-900">Different signs: answer is negative</p>
                  <p className="text-red-900">14 ÷ 7 = 2, make it negative</p>
                  <p className="text-red-900 font-bold text-xl">Answer: –2</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-World Integer Examples",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Integers are used in everyday situations to represent values above and below a reference point.</p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
              <p className="font-bold text-blue-900 text-lg mb-2">🌡️ Temperature</p>
              <p className="text-blue-900 mb-3">Temperature rises 6 degrees</p>
              <p className="text-blue-900 font-bold text-xl">+6 or 6</p>
              <p className="text-blue-700 text-sm mt-2">Positive means above the starting point</p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
              <p className="font-bold text-purple-900 text-lg mb-2">🏢 Elevator</p>
              <p className="text-purple-900 mb-3">Elevator descends 3 floors</p>
              <p className="text-purple-900 font-bold text-xl">–3</p>
              <p className="text-purple-700 text-sm mt-2">Negative means below ground level or going down</p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded">
              <p className="font-bold text-red-900 text-lg mb-2">💰 Money</p>
              <p className="text-red-900 mb-3">You owe $25</p>
              <p className="text-red-900 font-bold text-xl">–25</p>
              <p className="text-red-700 text-sm mt-2">Negative represents debt or money spent</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded">
              <p className="font-bold text-green-900 text-lg mb-2">🏔️ Elevation</p>
              <p className="text-green-900 mb-3">20 feet above sea level</p>
              <p className="text-green-900 font-bold text-xl">+20</p>
              <p className="text-green-700 text-sm mt-2">Positive means above sea level, negative means below</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-5 rounded">
            <p className="font-semibold text-yellow-900 text-lg mb-3">More Examples:</p>
            <ul className="space-y-2 text-yellow-900">
              <li>• Stock market: +$50 (gain), –$30 (loss)</li>
              <li>• Sports: +10 yards (gained), –5 yards (lost)</li>
              <li>• Time zones: +5 hours ahead, –3 hours behind</li>
              <li>• Golf: –2 under par, +3 over par</li>
            </ul>
          </div>
        </div>
      )
    },
    {
      title: "Compare & Order Practice",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Practice comparing and ordering integers!</p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
              <p className="font-semibold text-blue-900 text-lg mb-3">Question 1: Which is greater?</p>
              <p className="text-blue-900 font-bold text-xl mb-3">–4 or –1?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-blue-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-blue-900">–1 is farther right on the number line</p>
                  <p className="text-blue-900 font-bold text-xl">Answer: –1 &gt; –4</p>
                </div>
              </details>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded">
              <p className="font-semibold text-green-900 text-lg mb-3">Question 2: Which is greater?</p>
              <p className="text-green-900 font-bold text-xl mb-3">0 or –7?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-green-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-green-900">Zero is greater than all negative numbers</p>
                  <p className="text-green-900 font-bold text-xl">Answer: 0 &gt; –7</p>
                </div>
              </details>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded">
              <p className="font-semibold text-purple-900 text-lg mb-3">Question 3: Which is greater?</p>
              <p className="text-purple-900 font-bold text-xl mb-3">–12 or 3?</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-purple-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-purple-900">Any positive is greater than any negative</p>
                  <p className="text-purple-900 font-bold text-xl">Answer: 3 &gt; –12</p>
                </div>
              </details>
            </div>

            <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded">
              <p className="font-semibold text-orange-900 text-lg mb-3">Question 4: Order from Least to Greatest</p>
              <p className="text-orange-900 font-bold text-xl mb-3">4, –3, –9, 2</p>
              <details className="mt-3">
                <summary className="cursor-pointer text-orange-700 font-semibold">Show Answer</summary>
                <div className="bg-white p-3 rounded mt-2">
                  <p className="text-orange-900">Think about the number line:</p>
                  <p className="text-orange-900">–9 is leftmost, then –3, then 2, then 4</p>
                  <p className="text-orange-900 font-bold text-xl">Answer: –9, –3, 2, 4</p>
                </div>
              </details>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Lesson Summary",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4 text-lg">Today you learned:</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">What integers are (positive, negative, and zero)</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">How to compare and order integers using a number line</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">How to add integers (same signs and different signs)</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">How to subtract integers by adding the opposite</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">How to multiply and divide integers using sign rules</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600 text-xl">✓</span>
              <p className="text-slate-700">How integers appear in real-world contexts</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded mt-6">
            <p className="font-semibold text-blue-900 text-lg mb-3">Key Takeaways:</p>
            <ul className="space-y-2 text-blue-900">
              <li>• Same signs → Add and keep the sign</li>
              <li>• Different signs → Subtract and keep larger absolute value's sign</li>
              <li>• Multiplication/Division: Same signs = positive, Different signs = negative</li>
              <li>• Number line: Right = greater, Left = smaller</li>
            </ul>
          </div>
        </div>
      )
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1)
  }

  const prevSlide = () => {
    if (currentSlide > 0) setCurrentSlide(currentSlide - 1)
  }

  const completeLesson = () => {
    window.location.href = '/lessons'
  }

  const goToPractice = () => {
    window.location.href = '/practice/integers'
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8 pb-40">
      {/* Slide Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-10 shadow-lg mb-8">
          <h2 className="text-4xl font-black text-slate-900 mb-8">{slides[currentSlide].title}</h2>
          {slides[currentSlide].subtitle && (
            <p className="text-lg text-slate-600 mb-6 font-medium">{slides[currentSlide].subtitle}</p>
          )}
          <div className="text-slate-700">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Completion Actions */}
        {currentSlide === slides.length - 1 && (
          <div className="flex items-center justify-center gap-4 text-center">
            <button
              onClick={goToPractice}
              className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-blue-700 hover:to-indigo-700 active:scale-95 transition-all shadow-lg"
            >
              Go to Practice Problems
            </button>
            <button
              onClick={completeLesson}
              className="bg-linear-to-r from-green-500 to-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:from-green-600 hover:to-green-700 active:scale-95 transition-all shadow-lg"
            >
              Complete Lesson
            </button>
          </div>
        )}
      </div>

      {/* Sticky Footer Navigation */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-white/95 backdrop-blur border-t-2 border-slate-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
              currentSlide === 0
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
            </svg>
            Previous
          </button>

          <div className="text-center">
            <p className="text-slate-700 font-semibold">
              Slide {currentSlide + 1} of {slides.length}
            </p>
            <div className="w-64 h-2 bg-slate-200 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all"
                style={{ width: `${((currentSlide + 1) / slides.length) * 100}%` }}
              />
            </div>
          </div>

          <button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all ${
              currentSlide === slides.length - 1
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-slate-800 active:scale-95'
            }`}
          >
            Next
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  )
}

export default IntegersLesson
