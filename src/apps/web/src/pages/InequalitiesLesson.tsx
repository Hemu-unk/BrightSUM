import React, { useState } from 'react'

const InequalitiesLesson: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Inequalities",
      subtitle: "Goal: Solve and graph inequalities and write inequalities to model real-world situations.",
      content: (
        <div className="space-y-6">
          <div className="text-center py-8">
            <p className="text-xl text-slate-700 font-semibold">Let's explore inequalities!</p>
          </div>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">What You'll Learn:</p>
            <ul className="space-y-2 text-blue-900">
              <li>• Understanding inequality symbols and their meanings</li>
              <li>• Solving one-step and multi-step inequalities</li>
              <li>• Graphing inequalities on a number line</li>
              <li>• Writing inequalities from real-world scenarios</li>
              <li>• When to flip the inequality sign</li>
            </ul>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-6 rounded">
            <p className="font-semibold text-purple-900 text-lg mb-2">Why This Matters:</p>
            <p className="text-purple-900">Inequalities help us represent ranges of values and constraints in real life, like budgets, speed limits, minimum requirements, and capacity limits.</p>
          </div>
        </div>
      )
    },
    {
      title: "What Are Inequalities?",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Unlike equations that show two things are equal, inequalities compare two values or expressions to show which is larger or smaller.</p>

          <div className="bg-slate-50 p-6 rounded border-2 border-slate-200">
            <p className="font-semibold text-slate-900 mb-3">Key Difference:</p>
            <div className="space-y-3">
              <div className="bg-white p-3 rounded">
                <p className="text-slate-700"><span className="font-bold">Equation:</span> x = 5 (exactly one solution)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="text-slate-700"><span className="font-bold">Inequality:</span> x &gt; 5 (infinitely many solutions: 6, 7, 8, 9, 10, ...)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900 mb-3">Examples:</p>
            <div className="space-y-2 text-blue-900">
              <p>• 5 &lt; 10 (5 is less than 10)</p>
              <p>• x ≥ 3 (x can be 3, 4, 5, 6, or any number greater)</p>
              <p>• -2 &lt; y &lt; 5 (y is between -2 and 5)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Inequality Symbols",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium mb-4">There are four main inequality symbols you need to know:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-5 rounded">
              <p className="font-bold text-blue-900 text-xl mb-2">&lt; (less than)</p>
              <p className="text-blue-900 mb-2">The value on the left is smaller than the value on the right.</p>
              <p className="text-blue-700 font-semibold">Example: 3 &lt; 7 means "3 is less than 7"</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-5 rounded">
              <p className="font-bold text-green-900 text-xl mb-2">&gt; (greater than)</p>
              <p className="text-green-900 mb-2">The value on the left is larger than the value on the right.</p>
              <p className="text-green-700 font-semibold">Example: 10 &gt; 4 means "10 is greater than 4"</p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-5 rounded">
              <p className="font-bold text-purple-900 text-xl mb-2">≤ (less than or equal to)</p>
              <p className="text-purple-900 mb-2">The value can be less than OR exactly equal to.</p>
              <p className="text-purple-700 font-semibold">Example: x ≤ 5 means x can be 5, 4, 3, 2, 1, 0, -1, ...</p>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-5 rounded">
              <p className="font-bold text-orange-900 text-xl mb-2">≥ (greater than or equal to)</p>
              <p className="text-orange-900 mb-2">The value can be greater than OR exactly equal to.</p>
              <p className="text-orange-700 font-semibold">Example: y ≥ -2 means y can be -2, -1, 0, 1, 2, 3, ...</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Remember: Each inequality represents infinitely many solutions!</p>
          </div>
        </div>
      )
    },
    {
      title: "Checking Solutions",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">To check if a number is a solution to an inequality, substitute it into the inequality and see if the statement is true.</p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-3">Steps to Check:</p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Replace the variable with the given number</li>
              <li>Simplify the expression on both sides</li>
              <li>Check if the inequality statement is true</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 1:</p>
            <p className="text-blue-900 mb-2">Is x = 7 a solution to x − 2 &lt; 10?</p>
            <div className="bg-white p-3 rounded mt-3">
              <p className="text-blue-900">Substitute: 7 − 2 &lt; 10</p>
              <p className="text-blue-900">Simplify: 5 &lt; 10</p>
              <p className="text-blue-900 font-bold">Result: ✔ Yes! This is true, so x = 7 is a solution</p>
            </div>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded mt-4">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 2:</p>
            <p className="text-green-900 mb-2">Is y = 2 a solution to 3y &gt; 10?</p>
            <div className="bg-white p-3 rounded mt-3">
              <p className="text-green-900">Substitute: 3(2) &gt; 10</p>
              <p className="text-green-900">Simplify: 6 &gt; 10</p>
              <p className="text-green-900 font-bold">Result: ✘ No! This is false, so y = 2 is NOT a solution</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Solving One-Step (Add/Subtract)",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Just like equations, we use inverse operations to isolate the variable. The key rule: <span className="font-bold">What you do to one side, you must do to the other!</span></p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200">
            <p className="font-semibold text-slate-900 mb-3">Addition/Subtraction Rule:</p>
            <p className="text-slate-700">When you add or subtract the same number from both sides, the inequality sign <span className="font-bold text-green-600">stays the same</span>.</p>
          </div>

          <div className="bg-green-50 border-l-4 border-green-500 p-5 rounded">
            <p className="font-semibold text-green-900 text-lg mb-3">Example 1:</p>
            <div className="space-y-2 text-green-900">
              <p className="font-bold">x + 4 &gt; 9</p>
              <p>Goal: Get x by itself</p>
              <p>Step 1: Subtract 4 from both sides</p>
              <p className="bg-white p-2 rounded">x + 4 - 4 &gt; 9 - 4</p>
              <p className="font-bold text-xl">x &gt; 5</p>
              <p className="text-sm mt-2">✔ Solution: x can be any number greater than 5</p>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded mt-4">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 2:</p>
            <div className="space-y-2 text-blue-900">
              <p className="font-bold">y - 7 ≤ 3</p>
              <p>Goal: Isolate y</p>
              <p>Step 1: Add 7 to both sides</p>
              <p className="bg-white p-2 rounded">y - 7 + 7 ≤ 3 + 7</p>
              <p className="font-bold text-xl">y ≤ 10</p>
              <p className="text-sm mt-2">✔ Solution: y can be 10 or any number less than 10</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Solving One-Step (Multiply/Divide)",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When multiplying or dividing by a <span className="font-bold text-green-600">positive number</span>, the inequality sign stays the same.</p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200">
            <p className="font-semibold text-slate-900 mb-3">Multiplication/Division Rule (Positive Numbers):</p>
            <p className="text-slate-700">The inequality direction <span className="font-bold text-green-600">does NOT change</span> when multiplying or dividing by a positive number.</p>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example 1:</p>
            <div className="space-y-2 text-blue-900">
              <p className="font-bold">3x ≤ 12</p>
              <p>Goal: Isolate x</p>
              <p>Step 1: Divide both sides by 3</p>
              <p className="bg-white p-2 rounded">3x ÷ 3 ≤ 12 ÷ 3</p>
              <p className="font-bold text-xl">x ≤ 4</p>
              <p className="text-sm mt-2">✔ The sign stayed ≤ because we divided by a positive number</p>
            </div>
          </div>

          <div className="bg-purple-50 border-l-4 border-purple-500 p-5 rounded mt-4">
            <p className="font-semibold text-purple-900 text-lg mb-3">Example 2:</p>
            <div className="space-y-2 text-purple-900">
              <p className="font-bold">y/5 &gt; 2</p>
              <p>Goal: Get y alone</p>
              <p>Step 1: Multiply both sides by 5</p>
              <p className="bg-white p-2 rounded">y/5 × 5 &gt; 2 × 5</p>
              <p className="font-bold text-xl">y &gt; 10</p>
              <p className="text-sm mt-2">✔ The sign stayed &gt; because we multiplied by a positive number</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "IMPORTANT: Dividing by a Negative",
      content: (
        <div className="space-y-6">
          <div className="bg-red-100 border-2 border-red-500 p-6 rounded">
            <p className="text-red-900 font-bold text-xl mb-3">⚠️ CRITICAL RULE ⚠️</p>
            <p className="text-red-900 font-semibold text-lg">When you multiply or divide BOTH sides by a negative number, you MUST flip the inequality sign!</p>
          </div>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200">
            <p className="font-semibold text-slate-900 mb-3">Why does this happen?</p>
            <p className="text-slate-700 mb-3">Think about it: 2 &lt; 5 is true, right?</p>
            <p className="text-slate-700 mb-3">But if we multiply both by -1: -2 &lt; -5 is FALSE!</p>
            <p className="text-slate-700 font-bold">We need to flip it: -2 &gt; -5 ✔ Now it's true!</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded">
            <p className="font-semibold text-red-900 text-lg mb-3">Example 1:</p>
            <div className="space-y-2 text-red-900">
              <p className="font-bold">−2x &lt; 8</p>
              <p>Goal: Isolate x</p>
              <p>Step 1: Divide both sides by -2</p>
              <p className="bg-white p-2 rounded">−2x ÷ (−2) &lt; 8 ÷ (−2)</p>
              <p className="font-bold text-red-600">⚠️ FLIP THE SIGN! ⚠️</p>
              <p className="font-bold text-xl">x &gt; −4</p>
              <p className="text-sm mt-2">✔ Notice: &lt; became &gt;</p>
            </div>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 p-5 rounded mt-4">
            <p className="font-semibold text-orange-900 text-lg mb-3">Example 2:</p>
            <div className="space-y-2 text-orange-900">
              <p className="font-bold">−5y ≥ 15</p>
              <p>Step 1: Divide both sides by -5</p>
              <p className="bg-white p-2 rounded">−5y ÷ (−5) ≥ 15 ÷ (−5)</p>
              <p className="font-bold text-orange-600">⚠️ FLIP THE SIGN! ⚠️</p>
              <p className="font-bold text-xl">y ≤ −3</p>
              <p className="text-sm mt-2">✔ Notice: ≥ became ≤</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Graphing on a Number Line",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Visual representation helps us understand all the possible solutions to an inequality.</p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Two Key Decisions:</p>
            <div className="space-y-4">
              <div className="bg-white p-4 rounded">
                <p className="font-bold text-slate-900 mb-2">1. What type of circle?</p>
                <p className="text-slate-700">• <span className="font-bold">Open circle (○)</span>: Use for &lt; or &gt; (value is NOT included)</p>
                <p className="text-slate-700">• <span className="font-bold">Closed circle (●)</span>: Use for ≤ or ≥ (value IS included)</p>
              </div>
              <div className="bg-white p-4 rounded">
                <p className="font-bold text-slate-900 mb-2">2. Which direction to shade?</p>
                <p className="text-slate-700">• Shade <span className="font-bold">left</span> for &lt; or ≤ (smaller numbers)</p>
                <p className="text-slate-700">• Shade <span className="font-bold">right</span> for &gt; or ≥ (larger numbers)</p>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Visual Guide:</p>
            <div className="space-y-3 text-blue-900">
              <div className="bg-white p-3 rounded">
                <p className="font-bold">x &gt; 3</p>
                <p className="text-sm">Open circle at 3, shade right →</p>
                <p className="text-xs text-blue-700">(Solutions: 3.1, 4, 5, 6, 7, ...)</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-bold">x ≤ -1</p>
                <p className="text-sm">Closed circle at -1, shade left ←</p>
                <p className="text-xs text-blue-700">(Solutions: -1, -2, -3, -4, ...)</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
            <p className="text-yellow-900 font-semibold">💡 Tip: Think of the arrow as showing where ALL the solutions live!</p>
          </div>
        </div>
      )
    },
    {
      title: "Graph Examples",
      content: (
        <div className="space-y-6">
          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900">1. x ≥ 3 → ● at 3, shade right</p>
          </div>
          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900">2. t &lt; −1 → ○ at −1, shade left</p>
          </div>
        </div>
      )
    },
    {
      title: "Writing Inequalities From Words",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Real-world problems often use words instead of symbols. Learning to translate is a crucial skill!</p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-4 text-lg">Common Phrases and Their Symbols:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-blue-600">&lt; (less than)</p>
                <p className="text-sm text-slate-700">• fewer than</p>
                <p className="text-sm text-slate-700">• below</p>
                <p className="text-sm text-slate-700">• under</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-green-600">&gt; (greater than)</p>
                <p className="text-sm text-slate-700">• more than</p>
                <p className="text-sm text-slate-700">• above</p>
                <p className="text-sm text-slate-700">• exceeds</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-purple-600">≤ (at most)</p>
                <p className="text-sm text-slate-700">• no more than</p>
                <p className="text-sm text-slate-700">• maximum</p>
                <p className="text-sm text-slate-700">• up to</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-orange-600">≥ (at least)</p>
                <p className="text-sm text-slate-700">• no less than</p>
                <p className="text-sm text-slate-700">• minimum</p>
                <p className="text-sm text-slate-700">• or more</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-500">
              <p className="text-blue-900 mb-2">"You must be <span className="font-bold">at least</span> 12 years old"</p>
              <p className="font-bold text-blue-900 text-lg">x ≥ 12</p>
            </div>
            <div className="bg-green-50 p-4 rounded border-l-4 border-green-500">
              <p className="text-green-900 mb-2">"The meeting lasted <span className="font-bold">more than</span> 30 minutes"</p>
              <p className="font-bold text-green-900 text-lg">m &gt; 30</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-500">
              <p className="text-yellow-900 mb-2">"You can spend <span className="font-bold">no more than</span> $50"</p>
              <p className="font-bold text-yellow-900 text-lg">c ≤ 50</p>
            </div>
            <div className="bg-purple-50 p-4 rounded border-l-4 border-purple-500">
              <p className="text-purple-900 mb-2">"The temperature was <span className="font-bold">below</span> freezing (32°F)"</p>
              <p className="font-bold text-purple-900 text-lg">t &lt; 32</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-World Example",
      content: (
        <div className="space-y-6">
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="text-slate-700 font-medium">A student must score at least 70 to pass.</p>
            <p className="font-bold text-blue-900 mt-2">s ≥ 70</p>
          </div>
        </div>
      )
    },
    {
      title: "Multi-Step Inequality",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Sometimes inequalities need multiple steps to solve, just like multi-step equations. Follow the same order of operations in reverse!</p>

          <div className="bg-slate-50 p-5 rounded border-2 border-slate-200 mb-4">
            <p className="font-semibold text-slate-900 mb-3 text-lg">Steps to Solve Multi-Step Inequalities:</p>
            <ol className="space-y-2 text-slate-700 list-decimal list-inside">
              <li>Simplify both sides if needed (combine like terms, distribute)</li>
              <li>Add or subtract to get variables on one side, numbers on the other</li>
              <li>Multiply or divide to isolate the variable</li>
              <li>Remember: Flip the sign if multiplying/dividing by a negative!</li>
            </ol>
          </div>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-5 rounded">
            <p className="font-semibold text-blue-900 text-lg mb-3">Example:</p>
            <div className="space-y-3 text-blue-900">
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-lg">2x + 6 &gt; 10</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold">Step 1: Subtract 6 from both sides</p>
                <p>2x + 6 - 6 &gt; 10 - 6</p>
                <p className="font-bold">2x &gt; 4</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold">Step 2: Divide both sides by 2</p>
                <p>2x ÷ 2 &gt; 4 ÷ 2</p>
                <p className="font-bold text-xl text-green-600">x &gt; 2</p>
              </div>
              <p className="text-sm">✔ Solution: x can be any number greater than 2 (like 2.1, 3, 4, 5, ...)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Multi-Step with Sign Flip",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">This is where it gets tricky! Multi-step problems with negative coefficients require extra attention.</p>

          <div className="bg-red-50 border-l-4 border-red-500 p-5 rounded">
            <p className="font-semibold text-red-900 text-lg mb-3">Example with Sign Flip:</p>
            <div className="space-y-3 text-red-900">
              <div className="bg-white p-3 rounded">
                <p className="font-bold text-lg">−3x + 5 ≤ −1</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold">Step 1: Subtract 5 from both sides</p>
                <p>−3x + 5 - 5 ≤ −1 - 5</p>
                <p className="font-bold">−3x ≤ −6</p>
              </div>
              <div className="bg-white p-3 rounded">
                <p className="font-semibold">Step 2: Divide both sides by -3</p>
                <p>−3x ÷ (−3) ≤ −6 ÷ (−3)</p>
                <p className="font-bold text-red-600 text-lg">⚠️ FLIP THE SIGN! ⚠️</p>
                <p className="font-bold text-xl text-green-600">x ≥ 2</p>
              </div>
              <p className="text-sm">✔ Notice: ≤ became ≥ because we divided by a negative number</p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded mt-4">
            <p className="text-yellow-900 font-semibold">💡 Pro Tip: Always check your final answer by substituting a test value!</p>
            <p className="text-yellow-900 text-sm mt-2">For x ≥ 2, try x = 3: −3(3) + 5 = −9 + 5 = −4, and −4 ≤ −1 ✔ Correct!</p>
          </div>
        </div>
      )
    },
    {
      title: "Check Your Answers",
      content: (
        <div className="space-y-6">
          <ul className="space-y-3 text-slate-700">
            <li>1. x = 1; x + 4 ≥ 5 → 5 ≥ 5 ✔</li>
            <li>2. n = −2; −3n &gt; 4 → 6 &gt; 4 ✔</li>
            <li>3. p = 10; 2p &lt; 15 → 20 &lt; 15 ✘</li>
          </ul>
        </div>
      )
    },
    {
      title: "Practice Problems",
      content: (
        <div className="space-y-6 text-slate-700">
          <p>Solve each inequality:</p>
          <ul className="space-y-2">
            <li>1. x − 7 &lt; 3</li>
            <li>2. 5x ≥ 20</li>
            <li>3. −4x &gt; 12</li>
            <li>4. Graph: k ≤ −1</li>
          </ul>
        </div>
      )
    },
    {
      title: "Lesson Summary",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Today you learned:</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">How to read and interpret inequality symbols</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">How to solve inequalities (including sign flips)</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">How to graph solutions</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">How to write inequalities for real-world situations</p>
            </div>
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
    window.location.href = '/practice/inequalities'
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

export default InequalitiesLesson
