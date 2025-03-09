import invariant from 'tiny-invariant';

export interface DatabaseConfig {
  password: string;
  dbName: string;
  uri: string;
}

export default () => {
  try {
    // Check for direct connection string first
    const connectionString = process.env.MONGO_CONNECTION_STRING;
    if (connectionString) {
      console.log('Using MongoDB connection string from environment');
      
      // Extract database name from connection string
      const dbNameMatch = connectionString.match(/\/([^/?]+)(\?|$)/);
      const dbName = dbNameMatch ? dbNameMatch[1] : 'overtime';
      
      return {
        password: 'from-connection-string',
        dbName,
        uri: connectionString
      };
    }
    
    // Fall back to individual credentials
    const password = process.env.DB_PASS;
    invariant(password, 'DB_PASS environment variable is required');

    const dbName = process.env.DB_NAME;
    invariant(dbName, 'DB_NAME environment variable is required');

    // Build connection string
    const uri = `mongodb+srv://ote:${password}@ote-game-summary.udgyq8s.mongodb.net/${dbName}?retryWrites=true&w=majority`;
    
    return {
      password,
      dbName,
      uri
    };
  } catch (error) {
    console.error('Error loading database configuration:', error);
    return {
      password: 'mock',
      dbName: 'mock',
      uri: 'mongodb://localhost:27017/mock'
    };
  }
};