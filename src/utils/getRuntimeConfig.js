export default function runtimeConfig(name) {
    return document.$config && document.$config.name
        ? document.$config[name]
        : '';
}
