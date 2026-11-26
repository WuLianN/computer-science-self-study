/* Self-authored practice solution, not an official answer.
 * C89; book_name uses at most 29 bytes (spaces allowed).
 * Commands: 1=create, 2=display, 3=insert, 4=find, 0=exit.
 * Each numeric value/name is entered on its own line.
 */
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>
#include <errno.h>
#include <limits.h>
#include <float.h>

typedef struct node {
    int book_no;
    char book_name[30];
    float price;
    struct node *next; /* Added: the original sample omitted this link. */
} ListNode;
typedef ListNode *LinkList;

static void free_list(LinkList head)
{
    LinkList next;
    while (head != NULL) {
        next = head->next;
        free(head);
        head = next;
    }
}

static int read_line(const char *prompt, char *buf, int size)
{
    size_t length;
    int ch;
    for (;;) {
        printf("%s", prompt);
        if (fgets(buf, size, stdin) == NULL)
            return 0;
        length = strlen(buf);
        if (length > 0 && buf[length - 1] == '\n') {
            buf[--length] = '\0';
            if (length > 0 && buf[length - 1] == '\r')
                buf[length - 1] = '\0';
            return 1;
        }
        ch = getchar();
        if (ch == EOF || ch == '\n')
            return 1;
        while (ch != EOF && ch != '\n')
            ch = getchar();
        puts("Input too long; try again.");
    }
}

static int read_int(const char *prompt, int low, int high, int *out)
{
    char buf[256];
    char *end;
    long value;
    while (read_line(prompt, buf, sizeof(buf))) {
        errno = 0;
        value = strtol(buf, &end, 10);
        if (end != buf) {
            while (isspace((unsigned char)*end))
                ++end;
            if (*end == '\0' && errno != ERANGE &&
                value >= low && value <= high) {
                *out = (int)value;
                return 1;
            }
        }
        printf("Enter an integer in [%d, %d].\n", low, high);
    }
    return 0;
}

static int read_price(float *out)
{
    char buf[256];
    char *end;
    double value;
    while (read_line("Price: ", buf, sizeof(buf))) {
        errno = 0;
        value = strtod(buf, &end);
        if (end != buf) {
            while (isspace((unsigned char)*end))
                ++end;
            if (*end == '\0' && errno != ERANGE &&
                value == value && value >= 0.0 && value <= FLT_MAX) {
                *out = (float)value;
                return 1;
            }
        }
        puts("Enter a finite nonnegative price.");
    }
    return 0;
}

static LinkList find_book(LinkList head, int number)
{
    while (head != NULL && head->book_no != number)
        head = head->next;
    return head;
}

static int read_book(LinkList head, ListNode *book)
{
    char buf[256];
    size_t i;
    int has_text;
    for (;;) {
        if (!read_int("Book number: ", 1, INT_MAX, &book->book_no))
            return 0;
        if (find_book(head, book->book_no) == NULL)
            break;
        puts("Duplicate number; try again.");
    }
    for (;;) {
        if (!read_line("Book name: ", buf, sizeof(buf)))
            return 0;
        has_text = 0;
        for (i = 0; buf[i] != '\0'; ++i)
            if (!isspace((unsigned char)buf[i]))
                has_text = 1;
        if (has_text && strlen(buf) < sizeof(book->book_name))
            break;
        puts("Use 1-29 bytes with at least one non-space character.");
    }
    strcpy(book->book_name, buf);
    book->next = NULL;
    return read_price(&book->price);
}

static int list_length(LinkList head)
{
    int n;
    n = 0;
    while (head != NULL) {
        ++n;
        head = head->next;
    }
    return n;
}

/* Build a temporary list; replace the old list only on success. */
static int create_list(LinkList *head)
{
    int n, i;
    LinkList first, tail, fresh;
    first = NULL;
    tail = NULL;
    if (!read_int("Initial count: ", 0, 10000, &n))
        return 0;
    for (i = 0; i < n; ++i) {
        fresh = (LinkList)malloc(sizeof(ListNode));
        if (fresh == NULL) {
            puts("Allocation failed; old list kept.");
            free_list(first);
            return 1;
        }
        if (!read_book(first, fresh)) {
            free(fresh);
            free_list(first);
            return 0;
        }
        if (tail == NULL)
            first = fresh;
        else
            tail->next = fresh;
        tail = fresh;
    }
    free_list(*head);
    *head = first;
    puts("Created.");
    return 1;
}

static void show_book(LinkList book)
{
    printf("%d | %s | %.2f\n",
           book->book_no, book->book_name, book->price);
}

static void display_list(LinkList head)
{
    if (head == NULL)
        puts("Empty list.");
    while (head != NULL) {
        show_book(head);
        head = head->next;
    }
}

static int insert_book(LinkList *head)
{
    int position, i, n;
    LinkList fresh;
    LinkList *slot;
    n = list_length(*head);
    if (!read_int("Position (1-based): ", 1, n + 1, &position))
        return 0;
    fresh = (LinkList)malloc(sizeof(ListNode));
    if (fresh == NULL) {
        puts("Allocation failed; list kept.");
        return 1;
    }
    if (!read_book(*head, fresh)) {
        free(fresh);
        return 0;
    }
    slot = head;
    for (i = 1; i < position; ++i)
        slot = &(*slot)->next;
    fresh->next = *slot;
    *slot = fresh;
    puts("Inserted.");
    return 1;
}

int main(void)
{
    LinkList head, found;
    int choice, number, running;
    head = NULL;
    running = 1;
    while (running) {
        puts("\n1 Create | 2 Display | 3 Insert | 4 Find | 0 Exit");
        if (!read_int("Choice: ", 0, 4, &choice))
            break;
        switch (choice) {
        case 1:
            running = create_list(&head);
            break;
        case 2:
            display_list(head);
            break;
        case 3:
            running = insert_book(&head);
            break;
        case 4:
            if (!read_int("Search number: ", 1, INT_MAX, &number)) {
                running = 0;
                break;
            }
            found = find_book(head, number);
            if (found == NULL)
                puts("Not found.");
            else
                show_book(found);
            break;
        default:
            running = 0;
            break;
        }
    }
    free_list(head);
    puts("Bye.");
    return 0;
}
