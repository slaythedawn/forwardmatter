#!/usr/bin/env python3
"""Attach display strings and public labels to a local model grid.

Reads JSON on stdin, writes JSON on stdout. Display strings use the same
Python rounding as the approved simulator build. This script does not encrypt
and must not be pointed at a path inside the repository's tracked tree.
"""
import json
import re
import sys


def d0(x: float) -> str:
    return f"{round(x, 1):.0f}"


def d1(x: float) -> str:
    return f"{round(x, 1):.1f}"


def label(text: str) -> str:
    text = re.sub(r"\[(\w+)\]", r"(\1 signal)", text)
    text = text.replace("Recommended (earlier preset)", "Six-sleeve portfolio")
    text = text.replace("ETF in the fund", "ETF in the same mandate")
    return text


def main() -> None:
    grid = json.load(sys.stdin)
    for setup in grid["setups"].values():
        setup["label"] = label(setup["label"])
        for cell in setup["grid"].values():
            cell["d"] = {
                "med": d1(cell["med"]),
                "gross": d1(cell["gross"]),
                "p30": d0(cell["p30"]),
                "areit": d0(cell["areit"]),
                "credit": d0(cell["credit"]),
                "dd10": d0(cell["dd10"]),
                "ploss": d0(cell["ploss"]),
            }
    json.dump(grid, sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    main()
