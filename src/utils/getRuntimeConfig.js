export default function runtimeConfig(name) {
    console.log('runtimeConfig ::: ', document.$config);
    return document.$config && document.$config.name
        ? document.$config[name]
        : '';
}
