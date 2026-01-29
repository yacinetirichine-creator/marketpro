#!/bin/bash
# ============================================
# MARKET PRO - Icon Generator Script
# ============================================
# This script generates PNG icons from the SVG source
# Requires: ImageMagick (brew install imagemagick)

SOURCE_SVG="icon-512x512.svg"
SIZES=(72 96 128 144 152 192 384 512)

echo "🎨 Generating Market Pro icons..."

for size in "${SIZES[@]}"; do
  echo "  → Creating icon-${size}x${size}.png"
  convert -background none -resize ${size}x${size} "$SOURCE_SVG" "icon-${size}x${size}.png" 2>/dev/null || \
  rsvg-convert -w $size -h $size "$SOURCE_SVG" -o "icon-${size}x${size}.png" 2>/dev/null || \
  echo "    ⚠️  Could not generate ${size}x${size} (install imagemagick or librsvg)"
done

# Favicon
echo "  → Creating favicon-32x32.png"
convert -background none -resize 32x32 "$SOURCE_SVG" "favicon-32x32.png" 2>/dev/null || true

echo "  → Creating favicon-16x16.png"
convert -background none -resize 16x16 "$SOURCE_SVG" "favicon-16x16.png" 2>/dev/null || true

echo "  → Creating apple-touch-icon.png"
convert -background none -resize 180x180 "$SOURCE_SVG" "apple-touch-icon.png" 2>/dev/null || true

echo "✅ Icon generation complete!"
echo ""
echo "Note: If icons weren't generated, install ImageMagick:"
echo "  brew install imagemagick"
