---
outline: deep
---

# Cron Syntax

The `node-cron` package uses a standard cron expression format to define when tasks should run. It supports **five or six fields**, though the **first (seconds)** is optional.

```plaintext
# ┌────────────── second (optional)
# │ ┌──────────── minute
# │ │ ┌────────── hour
# │ │ │ ┌──────── day of month
# │ │ │ │ ┌────── month
# │ │ │ │ │ ┌──── day of week
# │ │ │ │ │ │
# * * * * * *
```

### Allowed Values Per Field

| Field        | Value                             |
|--------------|-----------------------------------|
| second       | 0-59 (optional)                   |
| minute       | 0-59                              |
| hour         | 0-23                              |
| day of month | 1-31                              |
| month        | 1-12 (or names, e.g., Jan, Sep)   |
| day of week  | 0-7 (or names, 0 or 7 are Sunday) |


### Usage Examples

### 1. Using Multiple Values

You can define multiple specific values using commas. This allows you to run a task at more than one time in a field.

```javascript
import cron from 'node-cron';

// Runs at minutes 1, 2, 4, and 5 of every hour
cron.schedule('1,2,4,5 * * * *', () => {
  console.log('Running at minutes 1, 2, 4, and 5 of each hour');
});
```

> **Explanation**: The first field (`minute`) is set to `1,2,4,5`, which means the task runs at those specific minutes past every hour.  
> **Important**: This expression has only 5 fields, so the **`second`** field is omitted. In `node-cron`, when the seconds field is not provided, it defaults to `0`.


### 2. Using Ranges
You can define a range using a dash (`-`) to specify a continuous interval.

```javascript
import cron from 'node-cron';

// Runs every minute from minute 1 to minute 5 (inclusive) of every hour
cron.schedule('1-5 * * * *', () => {
  console.log('Running every minute from 1 to 5');
});e.log('running every minute to 1 from 5');
```
> **Explanation**: This is equivalent to writing `1,2,3,4,5`. It's a cleaner way to express consecutive values.

### 3. Using Step Values

Steps are defined using a slash (`/`) after a range or a wildcard. This allows you to define periodic intervals.

```javascript
// Runs every 2 minutes (even minutes: 0, 2, 4, ...)
cron.schedule('*/2 * * * *', () => {
  console.log('Running every 2 minutes (even minutes)');
});

// Runs every odd minute (1, 3, 5, ..., 59)
cron.schedule('1-59/2 * * * *', () => {
  console.log('Running every 2 minutes starting from 1 (odd minutes)');
});
```
> **Explanation**:
>    
> - `*/2` means “every 2 units”, respecting the available values, e.g: minutes `0-59`. In this case, it means "every 2 minutes from 0 to 59, covering all even minutes.
>
> - `1-59/2` means “every 2 units starting from 1”, covering all odd minutes.

### 4. Using Month and Weekday Names

For better readability, `node-cron` lets you use names (full or abbreviated) instead of numbers for months and days of the week.

```js
// Runs every minute on Sundays in January and September
cron.schedule('* * * January,September Sunday', () => {
  console.log('Running on Sundays in January and September');
});

// Same schedule using short names
cron.schedule('* * * Jan,Sep Sun', () => {
  console.log('Running on Sundays in Jan and Sep');
});

```
> **Explanation**: Names can improve readability, especially when dealing with specific months or days.