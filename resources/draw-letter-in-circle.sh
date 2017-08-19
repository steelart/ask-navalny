#!/bin/bash

LETTER=$1
OUTPUT=$2

convert -size 32x32 xc:transparent -draw 'fill white circle 15 15 15 0' -pointsize 24 -draw "gravity NorthWest fill black text 7,7 '$LETTER' " $OUTPUT
