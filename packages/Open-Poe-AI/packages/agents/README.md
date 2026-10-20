# AI Agent

A premium React component for AI interactions.

## Installation

This package is consumed from within the parent monorepo via npm workspaces — run `npm install` at the monorepo root.

## Usage

### 1. Import the Component

```javascript
import { AiAgent } from 'ai-agent';
```

### 2. Import the Styles

You must import the CSS file for the component to look correct:

```javascript
import 'ai-agent/dist/tailwind.css';
```

### 3. Example

```jsx
import React from 'react';
import { AiAgent } from 'ai-agent';
import 'ai-agent/dist/tailwind.css';

function App() {
  return (
    <div className="App">
      <AiAgent />
    </div>
  );
}

export default App;
```

## Development

If you want to modify the component:

1. Clone the repo
2. Run `npm install`
3. Run `npm run build` to update the `dist/` folder
