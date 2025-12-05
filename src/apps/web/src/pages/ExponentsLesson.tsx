import React, { useState } from 'react'

const ExponentsLesson: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Exponents",
      subtitle: "Goal: Understand how exponents represent repeated multiplication, evaluate expressions with exponents, and apply exponent laws to simplify expressions.",
      content: (
        <div className="text-center py-12">
          <p className="text-xl text-slate-700 font-semibold">Let's explore exponents!</p>
        </div>
      )
    },
    {
      title: "Introduction to Exponents",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Exponents help us write repeated multiplication in a shorter way.</p>
          
          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
            <p className="font-semibold text-blue-900">💡 Example:</p>
            <p className="text-blue-900 mt-2">2 × 2 × 2 can be written as <span className="font-bold text-2xl">2³</span></p>
            <p className="text-blue-900 text-sm mt-2">(read: "two to the third power")</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="text-slate-700">This makes large multiplications much easier to write and understand!</p>
          </div>
        </div>
      )
    },
    {
      title: "What is an Exponent?",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">An exponent shows how many times a number (the base) is multiplied by itself.</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded space-y-3">
            <p className="font-semibold text-blue-900">In 3⁴:</p>
            <div className="space-y-2 text-blue-900">
              <p>• <span className="font-bold">3</span> is the base</p>
              <p>• <span className="font-bold">4</span> is the exponent</p>
              <p>• It means: 3 × 3 × 3 × 3</p>
            </div>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="font-semibold text-red-900">💡 Key Point:</p>
            <p className="text-red-900 mt-2">An exponent is NOT multiplication.</p>
            <p className="text-red-900 font-bold mt-2">Example: 3⁴ ≠ 3 × 4</p>
          </div>
        </div>
      )
    },
    {
      title: "Vocabulary",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Using <span className="font-bold text-2xl">5³</span> as an example:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Base</p>
              <p className="text-slate-700">The number being multiplied</p>
              <p className="font-bold text-blue-600 text-xl">5</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Exponent</p>
              <p className="text-slate-700">How many times to multiply the base</p>
              <p className="font-bold text-green-600 text-xl">3</p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Power</p>
              <p className="text-slate-700">The whole expression</p>
              <p className="font-bold text-purple-600 text-xl">5³</p>
            </div>

            <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Expanded Form</p>
              <p className="text-slate-700">Written as multiplication</p>
              <p className="font-bold text-orange-600 text-xl">5 × 5 × 5</p>
            </div>

            <div className="border-l-4 border-pink-500 bg-pink-50 p-4 rounded">
              <p className="font-semibold text-slate-900">Value</p>
              <p className="text-slate-700">The final answer</p>
              <p className="font-bold text-pink-600 text-xl">125</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Why We Use Exponents",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Exponents make big multiplication simpler.</p>

          <div className="space-y-4">
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="font-semibold text-blue-900">💻 Computer memory:</p>
              <p className="text-blue-900 mt-2">2¹⁰ bytes in a kilobyte</p>
            </div>

            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <p className="font-semibold text-green-900">📐 Area of a square:</p>
              <p className="text-green-900 mt-2">s²</p>
            </div>

            <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
              <p className="font-semibold text-purple-900">🦠 Doubling patterns:</p>
              <p className="text-purple-900 mt-2">Bacteria doubling every hour → 2ʰ</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Evaluating Exponents",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">To evaluate means to find the value.</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2⁴ = 2 × 2 × 2 × 2 = <span className="text-green-600">16</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">10² = <span className="text-green-600">100</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">6¹ = <span className="text-green-600">6</span></p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded">
              <p className="font-semibold text-yellow-900">Special Case:</p>
              <p className="text-yellow-900 mt-2">Anything to the zero power: 7⁰ = <span className="font-bold">1</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Special Exponent Rules",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium mb-4">Important rules to remember:</p>

          <div className="space-y-4">
            <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded">
              <p className="font-semibold text-blue-900">Rule 1: First Power</p>
              <p className="text-blue-900 mt-2">Anything to the first power equals itself</p>
              <p className="font-bold text-blue-900 text-lg mt-2">a¹ = a</p>
            </div>

            <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded">
              <p className="font-semibold text-green-900">Rule 2: Zero Power</p>
              <p className="text-green-900 mt-2">Anything to the zero power equals 1 (as long as a ≠ 0)</p>
              <p className="font-bold text-green-900 text-lg mt-2">a⁰ = 1</p>
            </div>

            <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded">
              <p className="font-semibold text-purple-900">Rule 3: Negative Exponents</p>
              <p className="text-purple-900 mt-2">Negative exponents mean "take the reciprocal"</p>
              <p className="font-bold text-purple-900 text-lg mt-2">a⁻ⁿ = 1/aⁿ</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Law of Exponents: Product Rule",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When multiplying same-base powers:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-2xl mt-2">aᵐ · aⁿ = aᵐ⁺ⁿ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold text-xl">3² · 3³ = 3⁵ = 243</p>
            <p className="text-slate-600 text-sm mt-3">Why? Because we add the exponents: 2 + 3 = 5</p>
          </div>
        </div>
      )
    },
    {
      title: "Law of Exponents: Quotient Rule",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When dividing same-base powers:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-2xl mt-2">aᵐ / aⁿ = aᵐ⁻ⁿ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold text-xl">5⁶ / 5² = 5⁴</p>
            <p className="text-slate-600 text-sm mt-3">Why? Because we subtract the exponents: 6 - 2 = 4</p>
          </div>
        </div>
      )
    },
    {
      title: "Law of Exponents: Power Rule",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">Raising a power to another power:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-2xl mt-2">(aᵐ)ⁿ = aᵐ·ⁿ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold text-xl">(2³)² = 2⁶</p>
            <p className="text-slate-600 text-sm mt-3">Why? Because we multiply the exponents: 3 × 2 = 6</p>
          </div>
        </div>
      )
    },
    {
      title: "Law of Exponents: Power of a Product",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When raising a product to a power:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-2xl mt-2">(ab)ⁿ = aⁿbⁿ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold text-xl">(3x)² = 9x²</p>
            <p className="text-slate-600 text-sm mt-3">Apply the exponent to both 3 and x: 3² = 9 and x²</p>
          </div>
        </div>
      )
    },
    {
      title: "Law of Exponents: Power of a Quotient",
      content: (
        <div className="space-y-6">
          <p className="text-lg text-slate-700 font-medium">When raising a quotient to a power:</p>

          <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded mb-4">
            <p className="font-semibold text-blue-900">Formula:</p>
            <p className="text-blue-900 font-bold text-2xl mt-2">(a/b)ⁿ = aⁿ/bⁿ</p>
          </div>

          <div className="bg-slate-50 p-4 rounded">
            <p className="font-semibold text-slate-900 mb-2">Example:</p>
            <p className="text-slate-700 font-bold text-xl">(2/3)³ = 8/27</p>
            <p className="text-slate-600 text-sm mt-3">Apply the exponent to both numerator and denominator: 2³ = 8 and 3³ = 27</p>
          </div>
        </div>
      )
    },
    {
      title: "Simplifying Expressions",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Practice using the exponent rules:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. x² · x⁵</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">x⁷</span></p>
              <p className="text-xs text-slate-500 mt-1">(Product rule: add exponents)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. a⁹ / a³</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">a⁶</span></p>
              <p className="text-xs text-slate-500 mt-1">(Quotient rule: subtract exponents)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. (m³)²</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">m⁶</span></p>
              <p className="text-xs text-slate-500 mt-1">(Power rule: multiply exponents)</p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">4. 4x³ · 2x²</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">8x⁵</span></p>
              <p className="text-xs text-slate-500 mt-1">(Multiply coefficients: 4 × 2 = 8, add exponents: 3 + 2 = 5)</p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Mixed Practice",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Simplify each:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. 3² + 3²</p>
              <p className="text-slate-600">= 9 + 9 = <span className="font-bold text-green-600">18</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. 2³ · 2⁴</p>
              <p className="text-slate-600">= 2⁷ = <span className="font-bold text-green-600">128</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. (5²)³</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">5⁶</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">4. 7⁵ / 7</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">7⁴</span></p>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "Evaluating Expressions",
      content: (
        <div className="space-y-6">
          <p className="text-slate-700 font-medium mb-4">Evaluate each expression:</p>

          <div className="space-y-4">
            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">1. x² + 2x when x = 4</p>
              <p className="text-slate-600">= 4² + 2(4)</p>
              <p className="text-slate-600">= 16 + 8 = <span className="font-bold text-green-600">24</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">2. 3a³ when a = 2</p>
              <p className="text-slate-600">= 3(2³)</p>
              <p className="text-slate-600">= 3(8) = <span className="font-bold text-green-600">24</span></p>
            </div>

            <div className="bg-slate-50 p-4 rounded">
              <p className="font-semibold text-slate-900">3. 5b⁻¹ when b = 10</p>
              <p className="text-slate-600">= 5 · (1/10)</p>
              <p className="text-slate-600">= <span className="font-bold text-green-600">1/2 or 0.5</span></p>
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
            <p className="text-slate-700 font-semibold mb-4">🦠 A bacteria culture doubles every hour. You start with 1 bacterium.</p>
            
            <div className="space-y-4">
              <div className="bg-white p-4 rounded">
                <p className="font-semibold text-slate-900">Expression:</p>
                <p className="text-slate-700 font-bold text-lg">After h hours: 2ʰ</p>
              </div>

              <div className="bg-white p-4 rounded">
                <p className="font-semibold text-slate-900">If h = 6:</p>
                <p className="text-slate-700">2⁶ = <span className="font-bold text-green-600">64 bacteria</span></p>
                <p className="text-slate-600 text-sm mt-2">This is exponential growth!</p>
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
              <p className="text-slate-700">Understand exponents as repeated multiplication</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Evaluate expressions with exponents</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Use exponent vocabulary</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Apply the laws of exponents</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Simplify exponential expressions</p>
            </div>
            <div className="flex items-start gap-3 p-3 bg-green-50 rounded">
              <span className="font-bold text-green-600">✓</span>
              <p className="text-slate-700">Model real-world situations using powers</p>
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

  const completeLesson = () => {
    window.location.href = '/lessons'
  }

  const goToPractice = () => {
    window.location.href = '/practice/exponents'
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

export default ExponentsLesson
