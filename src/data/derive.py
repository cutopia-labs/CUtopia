import json
with open('data/subject_course_names.json', 'r') as f:
    courses = json.load(f)
    courseList = []
    for k, v in courses.items():
        for code in v:
            courseList.append(f"{k}{code}")
    with open('data/courses.json', 'w') as f:
        json.dump(courseList, f)