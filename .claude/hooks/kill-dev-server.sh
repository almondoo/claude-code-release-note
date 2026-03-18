#!/bin/bash
lsof -ti:4000 | xargs kill 2>/dev/null
exit 0
