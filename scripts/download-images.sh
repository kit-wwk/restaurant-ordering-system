#!/bin/bash

# Create images directory if it doesn't exist
mkdir -p public/images

# Japanese dishes
curl -o public/images/sashimi.jpg "https://images.unsplash.com/photo-1534482421-64566f976cfa?w=800&q=80"
curl -o public/images/tempura.jpg "https://images.unsplash.com/photo-1629684782790-385ed5adb497?w=800&q=80"

# Asian dishes
curl -o public/images/korean-chicken.jpg "https://images.unsplash.com/photo-1575932444877-5106bee2a599?w=800&q=80"
curl -o public/images/green-curry.jpg "https://images.unsplash.com/photo-1548943487-a2e4e43b4853?w=800&q=80"

# Noodles
curl -o public/images/ramen.jpg "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80"
curl -o public/images/dandan.jpg "https://images.unsplash.com/photo-1585032226651-759b368d7246?w=800&q=80"

# Udon
curl -o public/images/tempura-udon.jpg "https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?w=800&q=80"
curl -o public/images/beef-udon.jpg "https://images.unsplash.com/photo-1552611052-33e04de081de?w=800&q=80"

# Rice bowls
curl -o public/images/tendon.jpg "https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=800&q=80"
curl -o public/images/gyudon.jpg "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&q=80"

echo "All images have been downloaded successfully!" 