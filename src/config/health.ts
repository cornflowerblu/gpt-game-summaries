// import invariant from 'tiny-invariant';

export interface HealthConfig {
  environment: string;
}

export default () => {
  const environment = process.env.HEALTH_CHECK;
  // invariant(environment, 'Health check environment variable is required');

  return {
    environment,
  };
};
