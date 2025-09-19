import argparse
import json
import sys

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tags', type=str, required=True)
    parser.add_argument('--questionCount', type=int, required=True)
    args = parser.parse_args()

    # For now, ignore tags and just return mock questions
    mock_questions = [
        {
            "id": 1,
            "question": "What is Python?",
            "options": ["A snake", "A programming language", "A car", "A fruit"],
            "correctAnswer": 1,
            "explanation": "Python is a popular programming language."
        },
        {
            "id": 2,
            "question": "What does 'def' do in Python?",
            "options": ["Defines a function", "Deletes a variable", "Defines a class", "Ends a loop"],
            "correctAnswer": 0,
            "explanation": "'def' is used to define a function in Python."
        }
    ]
    count = min(args.questionCount, len(mock_questions))
    print(json.dumps(mock_questions[:count]))

if __name__ == '__main__':
    main()
