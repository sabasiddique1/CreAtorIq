# How to Access Your MongoDB Database

## Your Database Connection
- **MongoDB Atlas Cluster**: `cluster0.f6vzvec.mongodb.net`
- **Username**: `sabasiddiqdev_db_user`
- **Database Name**: The database name is not specified in the connection string, so MongoDB will use the default database name from your connection or create one automatically (usually based on the app name)

## Collections in Your Database

Based on your schemas, you have these collections:

1. **users** - User accounts (email, password, name, role)
2. **creatorprofiles** - Creator profiles (displayName, bio, niche, platform)
3. **subscriberprofiles** - Subscriber profiles (tier, creatorId)
4. **contentitems** - Content items (title, type, status, isPremium)
5. **commentbatches** - Comment batches for sentiment analysis
6. **sentimentsnapshots** - Sentiment analysis results
7. **ideasuggestions** - AI-generated content ideas
8. **activityevents** - Activity logs
9. **contentviews** - Content view tracking
10. **subscriptiontiers** - Subscription tier definitions

## Method 1: MongoDB Atlas Web Interface (Easiest)

1. **Go to MongoDB Atlas**: https://cloud.mongodb.com/
2. **Login** with your MongoDB Atlas account
3. **Navigate to your cluster**: Click on "Cluster0" or your cluster name
4. **Click "Browse Collections"** button
5. **Select your database** (it might be named automatically or check the connection string)
6. **View collections** - You'll see all your collections listed
7. **Click on any collection** to see the documents/data

### Steps:
```
MongoDB Atlas Dashboard
  → Clusters (left sidebar)
  → Click on "Cluster0"
  → Click "Browse Collections" button
  → Select database (might be "test" or auto-generated name)
  → View collections and documents
```

## Method 2: MongoDB Compass (Desktop App)

1. **Download MongoDB Compass**: https://www.mongodb.com/try/download/compass
2. **Install and open** MongoDB Compass
3. **Connect using your connection string**:
   ```
   mongodb+srv://sabasiddiqdev_db_user:QlJ7zw7gQhmW0tE6@cluster0.f6vzvec.mongodb.net/?appName=Cluster0
   ```
4. **Browse databases and collections** in the GUI
5. **View, edit, and query** your data visually

## Method 3: Command Line (mongosh)

If you have MongoDB shell installed:

```bash
# Connect to your cluster
mongosh "mongodb+srv://sabasiddiqdev_db_user:QlJ7zw7gQhmW0tE6@cluster0.f6vzvec.mongodb.net/?appName=Cluster0"

# List all databases
show dbs

# Use a specific database (replace 'your-db-name' with actual name)
use your-db-name

# List collections
show collections

# View documents in a collection
db.users.find().pretty()
db.creatorprofiles.find().pretty()
db.contentitems.find().pretty()
```

## Method 4: Check Database Name from Your App

The database name might be extracted from the connection string or set to a default. To find out:

1. Check your app logs when it connects
2. Or add this to your code temporarily:
   ```javascript
   console.log('Database name:', mongoose.connection.db.databaseName)
   ```

## Quick Check via API

You can also query your data through the GraphQL API:

```graphql
# Query users
query {
  users {
    _id
    email
    name
    role
  }
}

# Query creator profiles
query {
  myCreatorProfile {
    _id
    displayName
    bio
    niche
  }
}
```

## Finding Your Database Name

If the connection string doesn't specify a database name, MongoDB Atlas might:
- Use "test" as default
- Create a database based on your app name
- Use the first database in your cluster

**To find it:**
1. Go to MongoDB Atlas → Browse Collections
2. You'll see all databases listed
3. Look for one with collections matching your app (users, creatorprofiles, etc.)

## Security Note

⚠️ **Important**: Your connection string contains credentials. Keep it secure and never commit it to public repositories.

