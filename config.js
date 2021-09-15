const environments = {};

environments.development = {
	httpPort: 3000,
	httpsPort: 3001,
	envName: 'development'
};

environments.production = {
	httpPort: 5000,
	httpsPort: 5001,
	envName: 'production'
};

const currentEnvironment =
	typeof process.env.NODE_ENV === 'string'
		? process.env.NODE_ENV.toLowerCase()
		: '';

const environmentToExport =
	typeof environments[currentEnvironment] === 'object'
		? environments[currentEnvironment]
		: environments.development;

module.exports = environmentToExport;
