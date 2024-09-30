import ratemyprofessor
from fuzzywuzzy import fuzz
import re

def parse_name(full_name):
    parts = re.findall(r'\w+', full_name)
    if len(parts) >= 2:
        return {
            'first': parts[0],
            'last': parts[-1],
            'middle': ' '.join(parts[1:-1]) if len(parts) > 2 else ''
        }
    return {'first': full_name, 'last': '', 'middle': ''}

def name_similarity(name1, name2):
    parsed1 = parse_name(name1)
    parsed2 = parse_name(name2)
    
    first_ratio = fuzz.ratio(parsed1['first'], parsed2['first'])
    last_ratio = fuzz.ratio(parsed1['last'], parsed2['last'])
    
    return (first_ratio + 2 * last_ratio) / 3

def find_matching_professors(professor_name, rmp_professors_list, threshold=70):
    matching_professors = []
    
    for professor in rmp_professors_list:
        score = name_similarity(professor_name, professor.name)
        if score >= threshold:
            matching_professors.append((professor, score))
    
    # Sort matches by score in descending order
    matching_professors.sort(key=lambda x: x[1], reverse=True)
    
    return matching_professors

# Main script
def get_rmp(professor_name):
    school_name = "University of California Berkeley"
    rmp_school = ratemyprofessor.get_school_by_name(school_name=school_name)
    print(f"School: {rmp_school.name}")

    rmp_professors_list = ratemyprofessor.get_professors_by_school_and_name(rmp_school, professor_name)

    matching_professors = find_matching_professors(professor_name, rmp_professors_list) # FINAL results of professors to Display

    if matching_professors:
        print(f"Matching professors found for {professor_name}:")
        for prof, score in matching_professors:
            print(f"Name: {prof.name}")
            print(f"Department: {prof.department}")
            print(f"Rating: {prof.rating}")
            print(f"Match Score: {score:.2f}")
            print("---")
    else:
        print(f"No matches found for {professor_name}")
    
    return matching_professors


# EXAMPLE

# professor = ratemyprofessor.get_professor_by_school_and_name(
#     ratemyprofessor.get_school_by_name("Case Western Reserve University"), "Connamacher")
# if professor is not None:
#     print("%sworks in the %s Department of %s." % (professor.name, professor.department, professor.school.name))
#     print("Rating: %s / 5.0" % professor.rating)
#     print("Difficulty: %s / 5.0" % professor.difficulty)
#     print("Total Ratings: %s" % professor.num_ratings)
#     if professor.would_take_again is not None:
#         print(("Would Take Again: %s" % round(professor.would_take_again, 1)) + '%')
#     else:
#         print("Would Take Again: N/A")