from primes import is_prime


def read_upper():
    while True:
        try:
            text = input("Upper bound (Enter for 100): ").strip()
            upper = 100 if text == "" else int(text)
            if upper < 2:
                raise ValueError("upper bound must be at least 2")
            return upper
        except ValueError as error:
            print("Invalid input: {}".format(error))
        except EOFError:
            print("No input; cancelled.")
            return None


def main():
    upper = read_upper()
    if upper is None:
        return
    primes = [str(n) for n in range(1, upper + 1) if is_prime(n)]
    print(" ".join(primes))


if __name__ == "__main__":
    main()
