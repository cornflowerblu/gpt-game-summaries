import invariant from 'tiny-invariant';

export interface DatabaseConfig {
  password: string;
  dbName: string;
}

export default () => {
  const password = process.env.DB_PASS;
  invariant(password, 'DB_PASS environment variable is required');

  const dbName = process.env.DB_NAME;
  invariant(dbName, 'DB_NAME environment variable is required');

  return {
    password,
    dbName,
  };
};
