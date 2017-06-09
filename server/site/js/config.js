const NODE_ENV = 'gulp-replace-process-env-node-env'


export default {
    NODE_ENV: NODE_ENV,
    isProduction: NODE_ENV == 'production',
    isDevelopment: NODE_ENV == 'development',
}