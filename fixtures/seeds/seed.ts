import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seed() {
  console.log('Seeding database...')

  // Create a sample quiz session with mock data
  const mockQuestions = [
    {
      id: 1,
      question: "What is the primary purpose of object-oriented programming?",
      options: [
        "To make code run faster",
        "To organize code into reusable objects with properties and methods",
        "To reduce memory usage",
        "To eliminate the need for functions"
      ],
      correctAnswer: 1,
      explanation: "Object-oriented programming helps organize code into reusable objects that encapsulate data and behavior."
    },
    {
      id: 2,
      question: "Which of the following is NOT a fundamental principle of OOP?",
      options: [
        "Encapsulation",
        "Inheritance",
        "Polymorphism",
        "Compilation"
      ],
      correctAnswer: 3,
      explanation: "Compilation is a process, not a fundamental principle of object-oriented programming."
    }
  ]

  const sampleSession = await prisma.quizSession.create({
    data: {
      fileIds: JSON.stringify([]),
      tags: JSON.stringify(['computer science', 'programming']),
      questionsJSON: JSON.stringify(mockQuestions),
      currentIndex: 0,
      answers: JSON.stringify([])
    }
  })

  console.log('Created sample quiz session:', sampleSession.id)
  console.log('Seeding completed successfully!')
}

seed()
  .catch((error) => {
    console.error('Error seeding database:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })