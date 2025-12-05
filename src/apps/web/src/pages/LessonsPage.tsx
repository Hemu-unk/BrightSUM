import React, { useState } from 'react'
import { Link } from 'react-router-dom'


const LessonsPage: React.FC = () => {
  const [selectedLesson, setSelectedLesson] = useState<string | null>(null)

  const lessons = [
    {
      id: 'expressions',
      title: 'Expressions',
      description: 'Practice evaluating and simplifying algebraic expressions with integers.',
      progress: 10,
      topics: ['Simplify expressions with like terms', 'Apply distributive property'],
      status: 'in-progress'
    },
    {
      id: 'inequalities',
      title: 'Inequalities',
      description: 'Explore statements that compare two values or expressions.',
      progress: 0,
      topics: ['Solve and graph simple inequalities', 'Write inequalities to represent real-world situations'],
      status: 'available'
    },
    {
      id: 'functions',
      title: 'Functions',
      description: 'Understand how inputs and outputs relate through rules or equations.',
      progress: 0,
      topics: ['Identify function relationships in tables and graphs', 'Determine if a relation is a function'],
      status: 'locked'
    },
    {
      id: 'exponents',
      title: 'Exponents',
      description: 'Learn how to represent repeated multiplication using exponents.',
      progress: 0,
      topics: ['Evaluate expressions with exponents', 'Apply the laws of exponents to simplify expressions'],
      status: 'available'
    },
    {
      id: 'integers',
      title: 'Integers',
      description: 'Work with positive and negative whole numbers',
      progress: 0,
      topics: ['Add, subtract, multiply, and divide integers', 'Compare and order integers on a number line'],
      status: 'available'
    },
    {
      id: 'volume',
      title: 'Volume & Surface Area',
      description: 'Find the volume and surface area of 3D shapes.',
      progress: 0,
      topics: ['Calculate volume of prisms and cylinders', 'Determine surface area of 3D shapes using nets or formulas'],
      status: 'locked'
    }
  ]

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'in-progress':
        return 'bg-green-500'
      case 'locked':
        return 'bg-slate-400'
      default:
        return 'bg-slate-600'
    }
  }

  const getProgressBarColor = (progress: number) => {
    if (progress > 0) return 'bg-green-500'
    return 'bg-slate-600'
  }

  return (
    <main className="min-h-screen bg-linear-to-br from-slate-50 via-slate-50 to-blue-50 p-8">

      {/* Title and Description */}
      <div className="mb-12">
        <h2 className="text-4xl font-black text-slate-900 mb-3">Your Lessons</h2>
        <p className="text-lg text-slate-600 font-medium">Pick a topic to get started. Recommendations are based on your progress.</p>
      </div>

      {/* Lessons Grid - 3 columns */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="space-y-8">
          {lessons.slice(0, 3).map((lesson) => (
            <div key={lesson.id} className="border-3 border-slate-900 rounded-2xl p-8 bg-white hover:shadow-lg transition-shadow">
              {/* Title and Description */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-slate-900">{lesson.title}</h3>
                <span className="text-sm text-slate-500">Estimated Time : 20 -25 min</span>
              </div>
              <p className="text-slate-700 font-medium mb-6">{lesson.description}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-300 rounded-full h-4 overflow-hidden mb-6">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressBarColor(lesson.progress)}`}
                  style={{width: `${lesson.progress}%`}}
                />
              </div>

              {/* Topics List */}
              <ul className="space-y-3 mb-8">
                {lesson.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-slate-600 font-semibold">•</span>
                    <span className="text-slate-700 font-medium">{topic}</span>
                  </li>
                ))}
              </ul>

              {/* Start Button */}
              {lesson.status === 'locked' ? (
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg bg-slate-400 text-white cursor-not-allowed"
                  disabled
                >
                  Locked
                </button>
              ) : (
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 no-underline"
                >
                  Start Lesson
                </Link>
              )}
            </div>
          ))}
        </div>

        {/* Right Column */}
        <div className="space-y-8">
          {lessons.slice(3, 6).map((lesson) => (
            <div key={lesson.id} className="border-3 border-slate-900 rounded-2xl p-8 bg-white hover:shadow-lg transition-shadow">
              {/* Title and Description */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-2xl font-black text-slate-900">{lesson.title}</h3>
                <span className="text-sm text-slate-500">Estimated Time : 20 -25 min</span>
              </div>
              <p className="text-slate-700 font-medium mb-6">{lesson.description}</p>

              {/* Progress Bar */}
              <div className="w-full bg-slate-300 rounded-full h-4 overflow-hidden mb-6">
                <div 
                  className={`h-full rounded-full transition-all ${getProgressBarColor(lesson.progress)}`}
                  style={{width: `${lesson.progress}%`}}
                />
              </div>

              {/* Topics List */}
              <ul className="space-y-3 mb-8">
                {lesson.topics.map((topic, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <span className="text-slate-600 font-semibold">•</span>
                    <span className="text-slate-700 font-medium">{topic}</span>
                  </li>
                ))}
              </ul>

              {/* Start Button */}
              {lesson.status === 'locked' ? (
                <button
                  className="w-full py-4 rounded-xl font-bold text-lg bg-slate-400 text-white cursor-not-allowed"
                  disabled
                >
                  Locked
                </button>
              ) : (
                <Link
                  to={`/lessons/${lesson.id}`}
                  className="w-full inline-flex items-center justify-center py-4 rounded-xl font-bold text-lg bg-slate-900 text-white hover:bg-slate-800 active:scale-95 no-underline"
                >
                  Start Lesson
                </Link>
              )}
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}

export default LessonsPage
