#include <stdio.h>

#define MAX_STUDENTS 100
#define MAX_SUBJECTS 10

typedef struct {
    char id[20];
    char name[32];
    double score[MAX_SUBJECTS];
} Student;

int input_students(Student students[], int count, int subjects)
{
    int i;
    int j;

    for (i = 0; i < count; ++i) {
        if (scanf("%19s %31s", students[i].id, students[i].name) != 2) {
            return 0;
        }
        for (j = 0; j < subjects; ++j) {
            if (scanf("%lf", &students[i].score[j]) != 1) {
                return 0;
            }
            if (!(students[i].score[j] >= 0.0 &&
                  students[i].score[j] <= 100.0)) {
                return 0;
            }
        }
    }
    return 1;
}

double total_score(const Student *student, int subjects)
{
    double total;
    int j;

    total = 0.0;
    for (j = 0; j < subjects; ++j) {
        total += student->score[j];
    }
    return total;
}

double highest_score(const Student *student, int subjects)
{
    double highest;
    int j;

    highest = student->score[0];
    for (j = 1; j < subjects; ++j) {
        if (student->score[j] > highest) {
            highest = student->score[j];
        }
    }
    return highest;
}

void output_students(const Student students[], int count, int subjects)
{
    int i;
    int j;

    printf("ID NAME SCORES TOTAL MAX\n");
    for (i = 0; i < count; ++i) {
        printf("%s %s", students[i].id, students[i].name);
        for (j = 0; j < subjects; ++j) {
            printf(" %.2f", students[i].score[j]);
        }
        printf(" total=%.2f max=%.2f\n",
               total_score(&students[i], subjects),
               highest_score(&students[i], subjects));
    }
}

int main(void)
{
    Student students[MAX_STUDENTS];
    int count;
    int subjects;

    if (scanf("%d %d", &count, &subjects) != 2 ||
        count < 1 || count > MAX_STUDENTS ||
        subjects < 1 || subjects > MAX_SUBJECTS) {
        fprintf(stderr, "Invalid student or subject count.\n");
        return 1;
    }
    if (!input_students(students, count, subjects)) {
        fprintf(stderr, "Invalid student data.\n");
        return 1;
    }

    output_students(students, count, subjects);
    return 0;
}
