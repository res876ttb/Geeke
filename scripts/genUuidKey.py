#!/usr/bin/env python3

import random
import json

numSymbol = 20

chars = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', 'a', 'b', 'c', 'd', 'e', 'f']
symbols = []
for i in range(numSymbol):
  c1 = random.choice(chars)
  while True:
    c2 = random.choice(chars)
    if c2 != c1:
      break
  symbol = '0x' + c1 + c2
  symbols.append(symbol)

with open('uuidKey.json', 'w') as fp:
  json.dump({'symbols': symbols}, fp)