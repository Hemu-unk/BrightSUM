import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useHeaderActions } from '../components/HeaderActionsContext'

const ExpressionsLesson: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Algebraic Expressions",
      subtitle: "Goal: Learn how to read, understand, simplify, and evaluate algebraic expressions.",
      content: (
        <div className="text-center py-12">
          <p className="text-xl text-slate-700 font-semibold">Let's explore algebraic expressions!</p>
        </div>
      )
    },
    {
      title: "What is an Expression?",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">An expression is a math phrase that shows a relationship between numbers, variables, and operations.</p>
          
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
            <p className="font-semibold text-green-900">✅ Key point:</p>
            <p className="text-green-900">An expression does NOT have an equals sign (=).</p>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-slate-900">Examples of Expressions:</p>
            <div className="space-y-2 bg-slate-50 p-4 rounded">
              <p className="text-slate-800">• 3x + 2</p>
              <p className="text-slate-800">• 4a - 7</p>
              <p className="text-slate-800">• 5y + 3x - 2</p>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-semibold text-slate-900">NOT Expressions (These are equations!):</p>
            <div className="bg-red-50 p-4 rounded border-l-4 border-red-500">
              <p className="text-red-800">❌ 2x + 3 = 7 (this is an equation, not an expression)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Why We Use Expressions",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Expressions help represent real-world situations using math.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900">💡 Example:</p>
            <p className="text-blue-900 mt-2">Each ticket costs $5. If you buy <span className="font-bold">t</span> tickets, the total cost is:</p>
            <p className="text-blue-900 font-bold mt-2">→ 5t</p>
            <p className="text-blue-900 mt-2">If there's a $2 service fee:</p>
            <p className="text-blue-900 font-bold mt-2">→ 5t + 2</p>
          </div>

          <p className="text-slate-700">Expressions are like short math sentences that can change when the variable changes.</p>
        </div>
      )
    },
    {
      title: "Vocabulary: Parts of an Expression",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Let's break down <span className="font-bold">4x + 7</span>:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Variable</p>
              <p className="text-slate-700">A letter that represents a number</p>
              <p className="font-bold text-blue-600">Example: x</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Coefficient</p>
              <p className="text-slate-700">Number multiplied by the variable</p>
              <p className="font-bold text-green-600">Example: 4</p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Constant</p>
              <p className="text-slate-700">A fixed number (no variable)</p>
              <p className="font-bold text-purple-600">Example: 7</p>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Term</p>
              <p className="text-slate-700">A part of the expression separated by + or −</p>
              <p className="font-bold text-orange-600">Example: 4x, 7</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Identifying Terms",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Let's analyze: <span className="font-bold">3x + 5y - 2</span></p>

          <div className="bg-slate-50 p-4 rounded space-y-3">
            <div>
              <p className="font-semibold text-slate-900">Terms:</p>
              <p className="text-slate-700">3x, 5y, and -2</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Coefficients:</p>
              <p className="text-slate-700">3 and 5</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Variables:</p>
              <p className="text-slate-700">x, y</p>
            </div>
            <div>
              <p className="font-semibold text-slate-900">Constant:</p>
              <p className="text-slate-700">-2</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Like Terms",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Terms that have the same variable and the same exponent.</p>

          <div className="space-y-3">
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="font-semibold text-green-900">✅ Like Terms:</p>
              <p className="text-green-900">• 3x and 5x</p>
              <p className="text-green-900">• 7 and -2 (constants)</p>
            </div>

            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="font-semibold text-red-900">❌ NOT Like Terms:</p>
              <p className="text-red-900">• 2a and 4a² (different exponents)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Combining Like Terms",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">When terms are "like," you can add or subtract their coefficients.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-3">
            <p className="font-semibold text-blue-900">Example:</p>
            <p className="text-blue-900 font-bold text-lg">3x + 5x = 8x</p>
            <p className="text-blue-900">(because 3 + 5 = 8)</p>
            <p className="text-blue-900">You don't change the variable — it stays <span className="font-bold">x</span>.</p>
          </div>
        </div>
      )
    },
    {
      title: "Combining Like Terms - Examples",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Simplify each:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. 4x + 2x</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">6x</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. 7a + 3a + 5</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">10a + 5</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. 6m + 4n + 3m</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">9m + 4n</span></p>
            </div>
          </div>

          <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
            <p className="text-yellow-900">💡 Tip: Line up like terms when you combine!</p>
          </div>
        </div>
      )
    },
    {
      title: "Distributive Property",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Multiply what's outside the parentheses by everything inside.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-lg mt-2">a(b + c) = ab + ac</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold">2(x + 3) = 2x + 6</p>
            <p className="text-slate-600 text-sm mt-2">Why? Because 2(x + 3) = 2 × x + 2 × 3</p>
          </div>
        </div>
      )
    },
    {
      title: "Distributive Property - Examples",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Simplify:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. 3(2x + 5)</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">6x + 15</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. 4(y - 2)</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">4y - 8</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. -2(a + 3)</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">-2a - 6</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Combining Distribution & Like Terms",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Sometimes you must distribute first, then combine like terms.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-3">
            <p className="font-semibold text-blue-900">Example: 2(3x + 4) + 5x</p>
            
            <div className="bg-white p-3 rounded mt-3 space-y-2">
              <p className="text-slate-700"><span className="font-semibold">Step 1:</span> Distribute → <span className="font-bold">6x + 8 + 5x</span></p>
              <p className="text-slate-700"><span className="font-semibold">Step 2:</span> Combine like terms → <span className="font-bold text-green-600">11x + 8</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Evaluating Expressions",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">To evaluate means to find the value when you substitute numbers for variables.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-3">
            <p className="font-semibold text-blue-900">Example:</p>
            <p className="text-blue-900">Evaluate <span className="font-bold">3x + 2</span> when <span className="font-bold">x = 4</span></p>
            
            <div className="bg-white p-3 rounded mt-3">
              <p className="text-slate-700">3(4) + 2 = 12 + 2 = <span className="font-bold text-green-600">14</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Evaluation Practice",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Find each value:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. 2x + 5 when x = 3</p>
              <p className="text-slate-600">= 2(3) + 5 = <span className="font-bold text-green-600">11</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. 4y - 7 when y = 5</p>
              <p className="text-slate-600">= 4(5) - 7 = 20 - 7 = <span className="font-bold text-green-600">13</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. 3a + 2b when a = 2, b = 4</p>
              <p className="text-slate-600">= 3(2) + 2(4) = 6 + 8 = <span className="font-bold text-green-600">14</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Real-Life Example",
      content: (
        <div className="space-y-6">
          <div className="bg-linear-to-r from-blue-50 to-purple-50 p-6 rounded-lg border-2 border-blue-200">
            <p className="text-slate-700 font-semibold mb-4">A phone plan costs $10 per month plus $3 per gigabyte of data used.</p>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded">
                <p className="font-semibold text-slate-900">Expression:</p>
                <p className="text-slate-700 font-bold text-lg">10 + 3d</p>
              </div>

              <div className="bg-white p-4 rounded">
                <p className="font-semibold text-slate-900">Find cost for 5 GB of data (d = 5):</p>
                <p className="text-slate-700">10 + 3(5) = 10 + 15 = <span className="font-bold text-green-600">$25</span></p>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Summary",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">✅ You learned how to:</p>

          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Identify parts of an expression</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Combine like terms</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Apply the distributive property</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Evaluate expressions with integers</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Represent real-world problems using algebra</p>
            </div>
          </div>
        </div>
      )
    }
  ]

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const navigate = useNavigate()
  const { setActions } = useHeaderActions()
  useEffect(() => {
    // Set Exit button in header
    setActions(
      <button
        onClick={() => navigate('/lessons', { replace: true })}
        className="border-2 border-slate-900 text-slate-900 px-6 py-2 rounded-lg font-semibold transition-all cursor-pointer hover:bg-slate-900 hover:text-white hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 active:scale-[0.98]"
      >
        Exit Lesson
      </button>
    )
    return () => setActions(null)
  }, [navigate, setActions])
  const completeLesson = () => {
    // Navigate back to the lessons list after completing
    navigate('/lessons', { replace: true })
  }
  const goToPractice = () => {
    // Navigate to the related practice problems for this lesson
    navigate('/practice/expressions')
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8 pb-40">

      {/* Slide Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl border-3 border-slate-900 p-10 shadow-lg mb-8">
          <h2 className="text-4xl font-black text-slate-900 mb-8">{slides[currentSlide].title}</h2>
          <div className="text-slate-700">
            {slides[currentSlide].content}
          </div>
        </div>

        {/* Spacer below content handled by main's pb-40 */}

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

export default ExpressionsLesson
