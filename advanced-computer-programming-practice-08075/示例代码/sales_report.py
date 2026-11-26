from pathlib import Path
import math

import matplotlib.pyplot as plt


def read_sales(path):
    sales = {}
    with path.open("r", encoding="utf-8-sig") as stream:
        for line_number, line in enumerate(stream, 1):
            line = line.strip()
            if not line:
                continue
            parts = line.replace("\uff1a", ":").split(":")
            if len(parts) != 2:
                raise ValueError(
                    "line {}: expected name:amount".format(line_number)
                )
            name = parts[0].strip()
            if not name or name in sales:
                raise ValueError(
                    "line {}: empty or duplicate name".format(line_number)
                )
            try:
                amount = float(parts[1].strip())
            except ValueError:
                raise ValueError(
                    "line {}: amount must be numeric".format(line_number)
                )
            if not math.isfinite(amount) or amount < 0:
                raise ValueError(
                    "line {}: amount must be finite and nonnegative".format(
                        line_number
                    )
                )
            sales[name] = amount

    if not sales:
        raise ValueError("No sales records.")
    return sales


def draw_sales(sales, image_path):
    names = list(sales)
    amounts = [sales[name] for name in names]

    figure, axes = plt.subplots(figsize=(7, 4))
    axes.bar(names, amounts, color="#4f46e5")
    axes.set_title("Employee sales")
    axes.set_xlabel("Employee")
    axes.set_ylabel("Sales amount (sample units)")
    axes.set_ylim(bottom=0)
    axes.grid(axis="y", alpha=0.2)
    axes.set_axisbelow(True)
    figure.tight_layout()
    figure.savefig(str(image_path), dpi=150)
    plt.show()
    plt.close(figure)


def main():
    folder = Path(__file__).resolve().parent
    try:
        sales = read_sales(folder / "data.txt")
    except (OSError, UnicodeError, ValueError) as error:
        print("Cannot read data: {}".format(error))
        return 1

    average = sum(sales.values()) / len(sales)
    for name, amount in sales.items():
        print("{}: {:.2f}".format(name, amount))
    print("Average: {:.2f}".format(average))

    image_path = folder / "sales_report.png"
    draw_sales(sales, image_path)
    print("Chart saved as sales_report.png")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
