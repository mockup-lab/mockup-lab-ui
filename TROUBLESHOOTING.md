# Troubleshooting Guide for MockupLab UI

If you're experiencing issues with the cards not displaying or animations not working properly, try the following steps:

## 1. Check Browser Compatibility

Make sure you're using a modern browser that supports CSS 3D transforms and animations:
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## 2. Clear Browser Cache

Sometimes cached CSS or JavaScript files can cause display issues:
1. Press Ctrl+Shift+Delete (Windows/Linux) or Cmd+Shift+Delete (Mac)
2. Select "Cached images and files"
3. Click "Clear data"
4. Refresh the page

## 3. Check Console for Errors

1. Open your browser's developer tools (F12 or right-click > Inspect)
2. Go to the Console tab
3. Look for any error messages that might indicate what's wrong

## 4. Verify CSS is Loading

1. In the developer tools, go to the Network tab
2. Refresh the page
3. Look for styles.css and index.css in the list
4. Make sure they're loading successfully (status 200)

## 5. Check 3D Transform Support

Some browsers or devices might have issues with 3D transforms:

```css
/* Add this to your styles.css file to test 3D transform support */
.transform-test {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

## 6. Disable Hardware Acceleration

If you're experiencing rendering issues, try disabling hardware acceleration in your browser.

## 7. Check Template Data

Make sure your template data is correctly formatted and all required fields are present:
- Each template should have an index, category, title, description, image, and tags
- The image URLs should be valid and accessible

## 8. Debug Mode

The app includes a debug panel that shows in development mode. Check this panel to see:
- How many templates are loaded
- Which template is active
- If animations are currently running

## 9. Try Alternative CSS

If the 3D card animations aren't working, you can try a simpler 2D version by adding this class to your HTML element:

```html
<html class="no-3d">
```

And then add this to your CSS:

```css
.no-3d .card {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.no-3d .card.active { transform: translateX(0); opacity: 1; }
.no-3d .card.prev { transform: translateX(-30%); opacity: 0.7; }
.no-3d .card.next { transform: translateX(30%); opacity: 0.7; }
.no-3d .card.prev-hidden, .no-3d .card.next-hidden, .no-3d .card.hidden {
  opacity: 0;
  pointer-events: none;
}
```

## 10. Contact Support

If you're still experiencing issues after trying these steps, please contact support with:
- Your browser and version
- Your operating system
- Screenshots of the issue
- Any error messages from the console