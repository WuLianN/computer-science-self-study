#include <stdio.h>

unsigned long magnitude(long value)
{
    if (value < 0) {
        return 0UL - (unsigned long)value;
    }
    return (unsigned long)value;
}

unsigned long gcd(unsigned long a, unsigned long b)
{
    unsigned long remainder;

    while (b != 0) {
        remainder = a % b;
        a = b;
        b = remainder;
    }
    return a;
}

int main(void)
{
    long a;
    long b;
    unsigned long result;

    if (scanf("%ld %ld", &a, &b) != 2) {
        fprintf(stderr, "Expected two integers.\n");
        return 1;
    }
    if (a == 0 && b == 0) {
        fprintf(stderr, "At least one integer must be nonzero.\n");
        return 1;
    }

    result = gcd(magnitude(a), magnitude(b));
    printf("%lu\n", result);
    return 0;
}
