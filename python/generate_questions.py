import argparse
import json
import sys
import os

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--tags', type=str, required=True)
    parser.add_argument('--questionCount', type=int, required=True)
    args = parser.parse_args()

    # Always load science.json for this mock
    script_dir = os.path.dirname(os.path.abspath(__file__))
    science_path = os.path.join(script_dir, '../server/src/mocks/questions/science.json')
    try:
        with open(science_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            questions = data.get('questions', [])
    except Exception as e:
        print(json.dumps({"error": f"Failed to load questions: {str(e)}"}))
        sys.exit(1)

    count = min(args.questionCount, len(questions))
    print(json.dumps(questions[:count]))

if __name__ == '__main__':
    main()
