import argv from 'minimist'
const options = argv(process.argv)

export const isProduction = Boolean(options.production)
