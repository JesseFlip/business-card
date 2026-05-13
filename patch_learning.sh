#!/bin/bash
awk '
/<h3>Real Python<\/h3>/ {
    # Skip backwards to remove <div class="learning-card"> and <div class="learning-icon">
    # Actually wait, since I did sed earlier, it might be corrupted. Lets just rewrite the whole section.
}
' index.html
