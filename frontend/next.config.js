
const withBundleAnalyzer = require('@next/bundle-analyzer')({
    enabled: true,//process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer({
    swcMinify: true,  // Enable SWC minification

});

