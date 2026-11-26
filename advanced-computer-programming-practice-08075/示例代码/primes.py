def is_prime(number):
    if number < 2:
        return False

    divisor = 2
    while divisor * divisor <= number:
        if number % divisor == 0:
            return False
        divisor += 1
    return True


def main():
    primes = [str(n) for n in range(1, 101) if is_prime(n)]
    print(" ".join(primes))


if __name__ == "__main__":
    main()
