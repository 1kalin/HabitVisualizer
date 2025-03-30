# Pull Request: Fix Settings Page Error

## Branch Name
HV-001

## Issue
The settings page was breaking with the following error:
```
Uncaught TypeError: Cannot destructure property 'getFieldState' of 'useFormContext(...)' as it is null.
```

This error occurred because `FormLabel` and `FormDescription` components were being used outside of a `FormItem` context in the settings page.

## Changes Made
Modified `client/src/pages/settings.tsx` to replace form components with standard HTML elements in the data management section:

1. Replaced `FormLabel` with `<div className="text-base font-medium">` 
2. Replaced `FormDescription` with `<p className="text-sm text-gray-500">`

## Before the Fix
```jsx
<div className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
    <FormLabel className="text-base">Export Data</FormLabel>
    <FormDescription>
      Download all your habit tracking data as a CSV file
    </FormDescription>
  </div>
  <Button variant="outline">
    Export
  </Button>
</div>
```

## After the Fix
```jsx
<div className="flex flex-row items-center justify-between rounded-lg border p-4">
  <div className="space-y-0.5">
    <div className="text-base font-medium">Export Data</div>
    <p className="text-sm text-gray-500">
      Download all your habit tracking data as a CSV file
    </p>
  </div>
  <Button variant="outline">
    Export
  </Button>
</div>
```

## How to Create and Push This Branch
1. Create a new branch: `git checkout -b HV-001`
2. Add the modified file: `git add client/src/pages/settings.tsx`
3. Commit the changes: `git commit -m "Fix settings page form context error"`
4. Push the branch: `git push -u origin HV-001`
5. Create a pull request on GitHub from the HV-001 branch to main

## Testing
The settings page now loads correctly and all functionality works as expected:
- Notifications toggle works
- Time inputs function properly
- Reset data button opens the confirmation dialog