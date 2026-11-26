"""Self-authored Caesar cipher exercise, not an official answer.

Only ASCII letters rotate; case, digits, punctuation and other text persist.
This classical cipher is for learning, not for protecting real information.
"""
import argparse
import string


def caesar(text: str, shift: int) -> str:
    shift %= 26
    source = string.ascii_lowercase + string.ascii_uppercase
    lower = string.ascii_lowercase
    upper = string.ascii_uppercase
    target = lower[shift:] + lower[:shift] + upper[shift:] + upper[:shift]
    return text.translate(str.maketrans(source, target))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=("enc", "dec"))
    parser.add_argument("shift", type=int)
    parser.add_argument("text")
    args = parser.parse_args()
    shift = args.shift if args.mode == "enc" else -args.shift
    print(caesar(args.text, shift))


if __name__ == "__main__":
    main()
