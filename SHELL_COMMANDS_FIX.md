# Fixed Shell Commands

## Original problematic commands and their fixes:

### 1. curl with -w option
**Problem:** `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000`
**Error:** `curl: option -w: is unknown`

**Fixed command:**
```bash
curl -s -o /dev/null --write-out "%{http_code}" http://localhost:3000
```

### 2. head command with -20
**Problem:** `curl -s http://localhost:3000 | head -20`
**Error:** `head: -20: No such file or directory`

**Fixed command:**
```bash
curl -s http://localhost:3000 | head -n 20
```

### 3. ps command with BSD syntax
**Problem:** BSD syntax ps command
**Error:** `error: unsupported option (BSD syntax)`

**Fixed command:**
```bash
ps aux
# or
ps -ef
```

## Alternative approaches:

### For checking if server is running:
```bash
# Check if port 3000 is in use
netstat -an | grep :3000
# or
lsof -i :3000
```

### For testing HTTP response:
```bash
# Simple test without -w option
curl -s http://localhost:3000 > /dev/null && echo "Server is running" || echo "Server is down"
```

### For getting first 20 lines:
```bash
curl -s http://localhost:3000 | head -n 20
```

## Usage:
Replace the problematic commands in your terminal with the fixed versions above.