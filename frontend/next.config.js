
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: false,//process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
    swcMinify: true,  // Enable SWC minification
    reactStrictMode: true,
    output: "standalone", // lightweight standalone app 
});

