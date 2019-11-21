let common = [
    'bdd/feature/**/*.feature',
    '--require-module ts-node/register',
    '--require bdd/cucumber/**/*.ts',
    '--format progress-bar',
    '--format node_modules/cucumber-pretty'
].join(' ');

module.exports = {
    default: common
};
