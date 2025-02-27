# Google Books API Integration

This module integrates the Google Books API into the Bookflix application, allowing users to search for books, add them to favorites, and track reading progress.

## Setup Instructions

### 1. Get a Google Books API Key

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Library"
4. Search for "Books API" and enable it
5. Go to "APIs & Services" > "Credentials"
6. Click "Create credentials" > "API key"
7. Copy your new API key

### 2. Add API Key to Environment Variables

Create a `.env` file in the root of your backend directory (if it doesn't exist already) and add your API key:

```
GOOGLE_BOOKS_API_KEY=your_api_key_here
```

Alternatively, you can set it as an environment variable in your system:

- **Windows (Command Prompt):**
  ```
  set GOOGLE_BOOKS_API_KEY=your_api_key_here
  ```

- **Windows (PowerShell):**
  ```
  $env:GOOGLE_BOOKS_API_KEY="your_api_key_here"
  ```

- **Linux/Mac:**
  ```
  export GOOGLE_BOOKS_API_KEY=your_api_key_here
  ```

### 3. Restart the Django Server

After setting the API key, restart your Django server for the changes to take effect.

## API Endpoints

- **Search Books**: `GET /api/googlebooks/googlebooks/search/?q=query`
- **Favorite a Book**: `POST /api/googlebooks/googlebooks/{id}/favorite/`
- **Unfavorite a Book**: `POST /api/googlebooks/googlebooks/{id}/unfavorite/`
- **Update Reading Progress**: `POST /api/googlebooks/googlebooks/{id}/update_progress/`
- **Get Favorites**: `GET /api/googlebooks/googlebooks/favorites/`
- **Get Reading History**: `GET /api/googlebooks/googlebooks/reading_history/`

## Usage Examples

### Search for Books
```javascript
fetch('/api/googlebooks/googlebooks/search/?q=harry+potter')
  .then(response => response.json())
  .then(data => console.log(data));
```

### Add a Book to Favorites
```javascript
fetch('/api/googlebooks/googlebooks/1/favorite/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
})
.then(response => response.json())
.then(data => console.log(data));
```

### Update Reading Progress
```javascript
fetch('/api/googlebooks/googlebooks/1/update_progress/', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  },
  body: JSON.stringify({
    progress: 75  // percentage
  })
})
.then(response => response.json())
.then(data => console.log(data));
```
